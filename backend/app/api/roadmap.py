"""
Roadmap API
  POST /roadmap/generate → Given target_role + skill_gaps, call unified registry
                           runners (run_roadmap_structure + run_roadmap_details_batch)
                           and return a structured week-by-week learning plan.
                           Same runners used by the Full Analysis LangGraph graph.
"""
import json
import asyncio


from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from loguru import logger

from app.models.schemas import RoadmapRequest, RoadmapResponse, RoadmapWeek
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.config import settings
from sqlalchemy.orm import Session
from app.core.activity import log_activity
from app.models.models import CareerRoadmap
from app.core.rate_limit import check_daily_limit, increment_usage
from app.core.cache import get_cached_response, set_cached_response
from app.core.search_engine import enrich_weeks_with_resources

router = APIRouter()


# ── Roadmap Agent — owned here, imported by workflow.py ───────────────────────

_ROADMAP_SYSTEM_PROMPT = """\
You are a Senior Career Coach and Learning Architect specializing in creating
structured, week-by-week career roadmaps for tech professionals.

Your task: design a realistic 8-week progression path covering core foundations,
intermediate implementation, advanced architecture, and portfolio-grade capstone.

Rules:
- Each week must have a highly specific technical topic.
- Do NOT invent or generate URLs. Instead, provide search queries.
- estimated_hours must be between 6 and 20.
- success_criteria must be measurable.
- Ensure logical progression — each week must build naturally on previous weeks.
- Output ONLY valid JSON — no markdown, no explanation.

Required JSON schema (array of exactly 8 objects):
[
  {
    "week": <int>,
    "topic": "<highly specific technical topic>",
    "skill_gap_addressed": "<skill gap>",
    "resource_search_queries": ["<search query 1>", "<search query 2>", "<search query 3>"],
    "estimated_hours": <6-20>,
    "why_it_matters": "<concise high-impact explanation>",
    "mini_project": "<advanced portfolio-worthy project description>",
    "success_criteria": "<specific measurable achievement>"
  }
]
"""

_ROADMAP_DETAILS_SYSTEM_PROMPT = """\
You are a Senior Technical Curriculum Designer.

Your task: take a set of week structures and flesh them out with detailed
mini_projects, search queries, why_it_matters explanations, success_criteria,
and skill_gap_addressed fields.

Rules:
- Do NOT change the week number or topic from the input.
- estimated_hours must be between 6 and 20.
- success_criteria must be measurable.
- Do NOT invent or generate URLs. Instead, provide search queries.
- Output ONLY valid JSON — no markdown, no explanation.

Input format: array of week objects with at minimum "week" and "topic".
Output format: same array, but fully fleshed out with all fields.
"""


def run_roadmap_structure(
    target_role: str,
    skill_gaps: list[str],
    market_trend: str = "Stable",
    provider: str | None = None,
    custom_prompt: str | None = None,
) -> list[dict]:
    """
    Roadmap Structure Agent.
    
    Generates a skeleton 8-week roadmap structure. If custom_prompt is provided,
    it uses that prompt directly (includes personalization context). Otherwise
    builds a standard prompt from target_role, skill_gaps, and market_trend.
    
    Returns list of week dicts. Returns empty list on failure.
    """
    from app.agents.registry import call_llm

    if custom_prompt:
        user_content = custom_prompt
    else:
        gaps_formatted = "\n".join(f"  {i+1}. {g}" for i, g in enumerate(skill_gaps))
        user_content = (
            f"Target Role: {target_role}\n\n"
            f"Candidate's Skill Gaps:\n{gaps_formatted}\n\n"
            f"Market Trend: {market_trend}\n\n"
            f"Design an 8-week learning roadmap that addresses these skill gaps "
            f"and prepares the candidate for the target role."
        )

    result = call_llm(
        system_prompt=_ROADMAP_SYSTEM_PROMPT,
        user_content=user_content,
        provider=provider,
    )

    if not result:
        logger.warning("Roadmap structure agent returned no result.")
        return []

    # Parse the JSON result (parse_json from registry handles generic JSON)
    from app.agents.registry import parse_json
    try:
        parsed = parse_json(result if isinstance(result, str) else str(result))
        # Normalize dict-wrapped results
        if isinstance(parsed, dict):
            for key in ("weeks", "roadmap", "plan", "learning_plan"):
                if key in parsed and isinstance(parsed[key], list):
                    weeks = parsed[key]
                    break
            else:
                weeks = []
        elif isinstance(parsed, list):
            weeks = parsed
        else:
            weeks = []
        return weeks[:8]  # Ensure max 8 weeks
    except ValueError as e:
        logger.error(f"Failed to parse roadmap structure: {e}")
        return []


def run_roadmap_details_batch(
    week_chunk: list[dict],
    target_role: str,
    provider: str | None = None,
) -> list[dict]:
    """
    Roadmap Details Batch Agent.
    
    Takes a chunk (2-3 weeks) of roadmap skeleton and fleshes them out with
    mini_projects, search queries, why_it_matters, success_criteria, etc.
    
    Returns list of enriched week dicts. Returns input chunk on failure.
    """
    from app.agents.registry import call_llm
    import json as _json

    user_content = (
        f"Target Role: {target_role}\n\n"
        f"Flesh out the following week structures with detailed content:\n"
        f"{_json.dumps(week_chunk, indent=2)}"
    )

    result = call_llm(
        system_prompt=_ROADMAP_DETAILS_SYSTEM_PROMPT,
        user_content=user_content,
        provider=provider,
    )

    if not result:
        logger.warning("Roadmap details batch returned no result, using input as fallback.")
        return week_chunk

    try:
        from app.agents.registry import parse_json
        parsed = parse_json(result if isinstance(result, str) else str(result))
        enriched = parsed if isinstance(parsed, list) else []
        # Handle dict-wrapped results
        if isinstance(parsed, dict):
            for key in ("weeks", "roadmap", "plan", "learning_plan"):
                if key in parsed and isinstance(parsed[key], list):
                    enriched = parsed[key]
                    break
        if enriched and len(enriched) == len(week_chunk):
            return enriched
        logger.warning(f"Roadmap details returned {len(enriched)} weeks, expected {len(week_chunk)}. Using fallback.")
        return week_chunk
    except Exception:
        return week_chunk


# ── Helpers ────────────────────────────────────────────────────────────────────

def _parse_agent_json(raw: str) -> list[dict]:
    """
    Robustly extract a JSON array from the agent reply using regex if needed.
    """
    cleaned = raw.strip()

    # Try regular parsing first
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()

    # Remove trailing commas (common LLM JSON issue)
    import re
    cleaned = re.sub(r',\s*([\]}])', r'\1', cleaned)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        # REGEX FALLBACK: find the first '[' and last ']'
        match = re.search(r"\[\s*\{.*\}\s*\]", cleaned, re.DOTALL)
        if not match:
            # Try on raw string as well
            raw_cleaned = re.sub(r',\s*([\]}])', r'\1', raw)
            match = re.search(r"\[\s*\{.*\}\s*\]", raw_cleaned, re.DOTALL)
            
        if match:
            try:
                parsed = json.loads(match.group(0))
            except Exception:
                raise ValueError("Could not repair JSON array from agent response.")
        else:
            raise ValueError("Agent response contained no valid JSON array.")

    # Agent might return {"weeks": [...]} instead of a bare array
    if isinstance(parsed, dict):
        for key in ("weeks", "roadmap", "plan", "learning_plan"):
            if key in parsed and isinstance(parsed[key], list):
                return parsed[key]
        raise ValueError(f"Agent returned a dict but no expected list key.")

    if not isinstance(parsed, list):
        raise ValueError("Agent output is not a list.")
    
    return parsed


def _normalise_week(raw_week: dict, idx: int) -> dict:
    """
    Coerce a raw dict from the agent into a validated dict matching RoadmapWeek.
    Handles alternate key names the agent sometimes uses.
    """
    # week number
    week_num = int(raw_week.get("week", idx + 1))

    # topic — also called 'title', 'subject'
    topic = (
        raw_week.get("topic")
        or raw_week.get("title")
        or raw_week.get("subject")
        or f"Week {week_num}"
    )

    # Extract resource_search_queries
    queries = raw_week.get("resource_search_queries", [])
    if not isinstance(queries, list):
        queries = [str(queries)]

    # estimated_hours — also called 'hours', 'time', 'duration'
    hours_raw = (
        raw_week.get("estimated_hours")
        or raw_week.get("hours")
        or raw_week.get("time")
        or raw_week.get("duration")
        or 8
    )
    try:
        estimated_hours = int(float(str(hours_raw).split()[0]))
    except (ValueError, TypeError):
        estimated_hours = 8

    # mini_project — also called 'project', 'task', 'assignment', 'practice'
    mini_project = (
        raw_week.get("mini_project")
        or raw_week.get("project")
        or raw_week.get("task")
        or raw_week.get("assignment")
        or raw_week.get("practice")
        or "Build a small hands-on project using the week's skill."
    )

    raw_week["week"] = week_num
    raw_week["topic"] = str(topic)
    raw_week["estimated_hours"] = estimated_hours
    raw_week["mini_project"] = str(mini_project)
    raw_week["resource_search_queries"] = queries
    raw_week["skill_gap_addressed"] = raw_week.get("skill_gap_addressed", "General Knowledge")
    raw_week["success_criteria"] = raw_week.get("success_criteria", "Complete the project successfully")
    raw_week["why_it_matters"] = str(raw_week.get("why_it_matters") or raw_week.get("explanation") or f"Developing deep competency in {topic} is highly relevant for building production-grade systems.")
    raw_week["completed"] = raw_week.get("completed", False)
    return raw_week


def _generate_fallback_roadmap(target_role: str, skill_gaps: list[str]) -> list[dict]:
    """
    Generate a generic, structured 8-week roadmap as a fail-safe backup.
    """
    logger.info(f"Generating fallback roadmap programmatically for '{target_role}'")
    weeks = []
    
    gaps = skill_gaps if skill_gaps else ["Core Concepts"]
    
    for i in range(8):
        week_num = i + 1
        
        gap_index = min(i // 2, len(gaps) - 1)
        current_gap = gaps[gap_index]
        
        if week_num in (1, 2):
            topic = f"Foundations of {current_gap} and {target_role} Architecture"
            mini_project = f"Setup environment and build a basic prototype focusing on {current_gap}."
            success_criteria = "Successfully compile, run, and test the initial prototype."
            hours = 10
        elif week_num in (3, 4):
            topic = f"Implementing {current_gap} in Production-like Scenarios"
            mini_project = f"Develop a modular application integrating {current_gap} with standard design patterns."
            success_criteria = "Project conforms to clean code standards and passes integration tests."
            hours = 12
        elif week_num in (5, 6):
            topic = f"Scalability, Performance, and Advanced Optimization of {current_gap}"
            mini_project = f"Implement performance profiling, caching, or scaling strategies for {current_gap}."
            success_criteria = "Demonstrate measurable performance optimization or load tolerance."
            hours = 15
        else:
            topic = f"Full-stack Capstone Project with {current_gap} and {target_role} Tools"
            mini_project = f"Build and deploy a complete production-grade application to a staging environment."
            success_criteria = "Publicly accessible deployment with CI/CD and basic logging enabled."
            hours = 18

        weeks.append({
            "week": week_num,
            "topic": topic,
            "skill_gap_addressed": current_gap,
            "estimated_hours": hours,
            "why_it_matters": f"Mastering {current_gap} is critical for qualifying as a professional {target_role}.",
            "mini_project": mini_project,
            "success_criteria": success_criteria,
            "resource_search_queries": [
                f"{current_gap} best practices",
                f"{current_gap} tutorial",
                f"{target_role} {current_gap} project"
            ]
        })
        
    return weeks


def _build_validated_weeks(raw_content: str) -> list[dict]:
    raw_weeks = _parse_agent_json(raw_content)
    if not raw_weeks:
        raise ValueError("Agent returned an empty roadmap.")

    weeks = [_normalise_week(w, idx) for idx, w in enumerate(raw_weeks)]
    
    # Robust length adjustment to guarantee exactly 8 weeks
    if len(weeks) != 8:
        logger.warning(f"Agent returned {len(weeks)} weeks instead of 8. Adjusting...")
        if len(weeks) < 8:
            # Pad with additional weeks
            last_week = weeks[-1] if weeks else {}
            while len(weeks) < 8:
                new_week = last_week.copy() if last_week else {}
                new_week["week"] = len(weeks) + 1
                new_week["topic"] = f"Advanced Deep Dive in {last_week.get('topic', 'Target Role')}"
                new_week["mini_project"] = f"Build an advanced capstone component expanding on: {last_week.get('mini_project', 'previous project')}"
                new_week["estimated_hours"] = max(8, last_week.get("estimated_hours", 10))
                new_week["why_it_matters"] = "Consolidating and extending your skills is critical for senior-level proficiency."
                new_week["success_criteria"] = "Extend the previous project with additional features."
                new_week["skill_gap_addressed"] = last_week.get("skill_gap_addressed", "Advanced Architecture")
                new_week["resource_search_queries"] = last_week.get("resource_search_queries", [])
                weeks.append(new_week)
        else:
            # Truncate to 8
            weeks = weeks[:8]

    # Re-normalize and validate fields
    for i, week in enumerate(weeks):
        week["week"] = i + 1
        
        # Ensure non-empty topic and mini_project
        if not str(week.get("topic", "")).strip():
            week["topic"] = f"Specialized Training in Target Role (Week {i + 1})"
        if not str(week.get("mini_project", "")).strip():
            week["mini_project"] = "Build a hands-on implementation project using the week's technology."
            
    return weeks


# ── POST /roadmap/generate ─────────────────────────────────────────────────────
@router.post(
    "/generate",
    response_model=RoadmapResponse,
    summary="Generate a week-by-week career learning roadmap",
)
async def generate_roadmap(
    body: RoadmapRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RoadmapResponse:
    """
    Input  : target_role (str) + skill_gaps (list of strings)
    Process: Career_Coach AutoGen agent builds a 8-week plan
    Output : RoadmapResponse with structured weekly milestones
    """
    try:
        check_daily_limit(current_user.id, "roadmap")

        # -- Validate input ─────────────────────────────────────────────────────────
        target_role = body.target_role.strip()
        skill_gaps = [s.strip() for s in body.skill_gaps if s.strip()]

        if not target_role:
            raise HTTPException(status_code=400, detail="target_role must not be empty.")
        if not skill_gaps:
            raise HTTPException(status_code=400, detail="skill_gaps list must not be empty.")

        logger.info(
            f"roadmap/generate: role='{target_role}' | gaps={skill_gaps}"
        )

        # ── Cache disabled — always fresh roadmap with live search ─────────────────
        gaps_key = "-".join(sorted(skill_gaps))
        # ── Check Cache (Commented out to force fresh roadmap with new search logic) ──
        cached_weeks_dicts = get_cached_response("roadmap", target_role, gaps_key, body.provider)
        if cached_weeks_dicts:
            weeks_objs = [RoadmapWeek(**w) for w in cached_weeks_dicts]
            roadmap_record = CareerRoadmap(
                user_id=current_user.id,
                target_role=target_role,
                steps=cached_weeks_dicts
            )
            db.add(roadmap_record)
            db.commit()
            
            increment_usage(current_user.id, "roadmap")
            log_activity(db, current_user.id, f"Generated Roadmap for {target_role} (Cached)", "roadmap")
            return RoadmapResponse(id=roadmap_record.id, target_role=target_role, weeks=weeks_objs)

        # ── Retrieve latest parsed Resume for candidate profile context ──────────────────
        resume_context = ""
        try:
            from app.models.models import Resume
            resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
            if resume and resume.parsed_content:
                parsed = resume.parsed_content
                yoe = parsed.get("years_of_experience", 0)
                strengths = parsed.get("top_strengths", [])
                
                # Determine user level
                level = "Beginner (0-2 YOE)"
                if yoe >= 5:
                    level = "Advanced (5+ YOE)"
                elif yoe >= 2:
                    level = "Intermediate (2-5 YOE)"
                    
                resume_context = (
                    f"Candidate's Background Profile (Extracted from Resume):\n"
                    f"- Experience Level: {level} ({yoe} Years of Experience)\n"
                    f"- Known/Strong Skills: {', '.join(strengths)}\n\n"
                )
        except Exception as e:
            logger.warning(f"Could not load resume context for personalization: {e}")

        # ── Learning Style & Experience Preferences from request ───────────────────────
        req_exp_level = getattr(body, "experience_level", "intermediate") or "intermediate"
        req_style = getattr(body, "learning_style", "balanced") or "balanced"
        pref_instruction = (
            f"CANDIDATE PERSONALIZATION PREFERENCES:\n"
            f"- Targeted Skill Level: {req_exp_level.upper()}\n"
            f"- Preferred Learning Style: {req_style.upper()}\n\n"
        )

        # ── Load Curated RAG Topics dynamically ─────────────────────────────────────
        available_topics_str = ""
        try:
            import os
            seed_file_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "data",
                "curated_resources.json"
            )
            if os.path.exists(seed_file_path):
                with open(seed_file_path, "r", encoding="utf-8") as f:
                    curated_data = json.load(f)
                    curated_topics = [res["topic"] for res in curated_data if "topic" in res]
                    available_topics_str = ", ".join(f"'{t}'" for t in curated_topics)
        except Exception as e:
            logger.error(f"Failed to load curated topics for roadmap prompt: {e}")

        rag_prompt_instruction = ""
        if available_topics_str:
            rag_prompt_instruction = (
                "🎯 RAG ALIGNMENT RULE (CRITICAL FOR RESOURCE MATCHING):\n"
                "Our system uses a ChromaDB vector database to instantly retrieve gold-standard YouTube videos and official guides based on the week's 'topic' field.\n"
                "Whenever a week's learning content maps to any of these subjects, you MUST use the exact string below as the 'topic' field value:\n"
                f"[{available_topics_str}]\n\n"
                "Only if the week's subject does not fit any of the above pre-seeded topics, generate a custom highly specific technical topic title.\n\n"
            )

        # ── Build prompt ────────────────────────────────────────────────────────────
        gaps_formatted = "\n".join(f"  {i+1}. {g}" for i, g in enumerate(skill_gaps))
        prompt = (
            f"Target Role: {target_role}\n\n"
            f"Candidate's Skill Gaps:\n{gaps_formatted}\n\n"
            f"{resume_context}"
            f"{pref_instruction}"
            f"{rag_prompt_instruction}"
            "ROADMAP OBJECTIVE:\n"
            "Design a realistic 8-week progression path that transforms the candidate "
            "from their current level into an interview-ready engineer.\n\n"

            "ROADMAP STRUCTURE:\n\n"

            "Weeks 1-2:\n"
            "- Core foundations\n"
            "- Essential concepts\n"
            "- Critical missing fundamentals\n\n"

            "Weeks 3-4:\n"
            "- Intermediate real-world implementation\n"
            "- Practical engineering workflows\n"
            "- Industry tooling and debugging\n\n"

            "Weeks 5-6:\n"
            "- Advanced architecture\n"
            "- Scalability and optimization\n"
            "- Production-level engineering concepts\n\n"

            "Weeks 7-8:\n"
            "- Portfolio-grade capstone projects\n"
            "- Real-world deployment\n"
            "- Resume-quality achievements\n"
            "- Interview preparation through implementation\n\n"

            "CONTENT QUALITY RULES:\n\n"

            "1. Every topic must be highly specific.\n"
            "BAD: 'Learn Databases'\n"
            "GOOD: 'Implementing PostgreSQL indexing and query optimization for high-traffic APIs'\n\n"

            "2. Project Complexity Guidelines:\n"
            "- Weeks 1-2: Foundational hands-on tasks are acceptable (e.g., basic scripts, core concepts).\n"
            "- Weeks 3-8: STRICTLY FORBIDDEN to use calculators, generic CRUD, or beginner to-do lists. Must be production-grade.\n"
            "- MANDATORY for Weeks 3-8: Realistic applications, scalable APIs, cloud integrations, or proper system designs.\n\n"
            "- Prefer scalable systems, real-time apps, AI integrations, dashboards, or cloud-native builds.\n\n"

            "3. Do NOT invent or generate URLs. Instead, provide a list of 3 specific search queries that a user would use to find the best tutorials, articles, or GitHub repos for this week.\n"
            "BAD: 'https://docs.docker.com/get-started'\n"
            "GOOD: 'Docker containerization production best practices tutorial'\n\n"

            "4. estimated_hours must be realistic. Between 6 and 20 hours.\n\n"

            "5. success_criteria must be measurable.\n"
            "Examples:\n"
            "- 'Deploy a production-ready API with Redis caching and JWT authentication.'\n"
            "- 'Solve 15 medium-level graph problems without hints.'\n\n"

            "6. Ensure logical progression — each week must build naturally on previous weeks.\n\n"

            "STRICT OUTPUT RULES:\n"
            "- Return ONLY raw valid JSON.\n"
            "- No markdown. No explanations. No conversational text. No comments. No trailing commas.\n"
            "- Output EXACTLY 8 objects.\n\n"

            "REQUIRED OUTPUT FORMAT:\n"
            "[\n"
            "  {\n"
            '    "week": 1,\n'
            '    "topic": "highly specific technical topic",\n'
            '    "skill_gap_addressed": "exact skill gap from the list above",\n'
            '    "resource_search_queries": ["specific search query 1", "specific search query 2", "specific search query 3"],\n'
            '    "estimated_hours": 12,\n'
            '    "why_it_matters": "A concise (1-2 sentences) high-impact explanation of why this topic is critical to learn and how it relates to this role",\n'
            '    "mini_project": "advanced portfolio-worthy project description with technologies",\n'
            '    "success_criteria": "specific measurable achievement"\n'
            "  }\n"
            "]"
        )

        # ── Run via unified roadmap runners — no AutoGen ────────────────────────
        # run_roadmap_structure and run_roadmap_details_batch are defined in this module

        preferred_provider = body.provider or settings.LLM_PROVIDER

        # Pass the rich prompt as custom_prompt so RAG alignment + personalization
        # context is preserved (same prompt quality as before, faster execution)
        structure = await asyncio.to_thread(
            run_roadmap_structure,
            target_role, skill_gaps, "Stable",
            preferred_provider,
            prompt,  # <-- custom_prompt: full rich prompt built above
        )

        if not structure:
            logger.warning("roadmap: structure empty, using programmatic fallback")
            weeks = _generate_fallback_roadmap(target_role, skill_gaps)
        else:
            # Batch detail generation: 3 parallel chunks of 3, 3, 2 weeks
            chunk_1 = structure[0:3]
            chunk_2 = structure[3:6]
            chunk_3 = structure[6:]

            batch_results = await asyncio.gather(
                asyncio.to_thread(run_roadmap_details_batch, chunk_1, target_role, preferred_provider),
                asyncio.to_thread(run_roadmap_details_batch, chunk_2, target_role, preferred_provider),
                asyncio.to_thread(run_roadmap_details_batch, chunk_3, target_role, preferred_provider),
            )

            # Flatten + merge with structure fields
            raw_weeks = []
            for batch in batch_results:
                raw_weeks.extend(batch)

            # Validate + normalise to exactly 8 weeks using existing helpers
            try:
                # Convert merged batch back to JSON string for _build_validated_weeks
                import json as _json
                weeks = _build_validated_weeks(_json.dumps(raw_weeks))
            except (ValueError, Exception) as parse_err:
                logger.warning(f"roadmap: batch parse failed ({parse_err}), attempting repair via fallback")
                # One-shot repair: call run_roadmap_structure again with simpler prompt
                repair_structure = await asyncio.to_thread(
                    run_roadmap_structure, target_role, skill_gaps, "Stable", preferred_provider
                )
                if repair_structure:
                    weeks = [_normalise_week(w, i) for i, w in enumerate(repair_structure[:8])]
                    # Pad to 8 if needed
                    while len(weeks) < 8:
                        last = weeks[-1].copy() if weeks else {}
                        last["week"] = len(weeks) + 1
                        last["topic"] = f"Advanced Capstone — {target_role}"
                        last["mini_project"] = "Build and deploy a production-grade component."
                        weeks.append(last)
                else:
                    weeks = _generate_fallback_roadmap(target_role, skill_gaps)

        logger.info(f"roadmap/generate: built {len(weeks)}-week roadmap for '{target_role}'. Enriching resources...")

        # Enrich with DDG URLs
        enriched_weeks = await asyncio.to_thread(enrich_weeks_with_resources, weeks)
        weeks_objs = [RoadmapWeek(**w) for w in enriched_weeks]

        roadmap_id = None
        # Save to DB
        try:
            roadmap_record = CareerRoadmap(
                user_id=current_user.id,
                target_role=target_role,
                steps=[w.model_dump() for w in weeks_objs]
            )
            db.add(roadmap_record)
            db.commit()
            roadmap_id = roadmap_record.id
        except Exception as db_err:
            db.rollback()
            logger.error(f"Failed to save roadmap to DB for user {current_user.id}: {db_err}")

        set_cached_response("roadmap", [w.model_dump() for w in weeks_objs], target_role, gaps_key, body.provider)
        log_activity(db, current_user.id, f"Generated Roadmap for {target_role}", "roadmap")
        increment_usage(current_user.id, "roadmap")

        return RoadmapResponse(id=roadmap_id, target_role=target_role, weeks=weeks_objs)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in generate_roadmap: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while generating the roadmap.")


@router.get("/history")
async def get_roadmap_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch previous roadmaps for the user."""
    roadmaps = db.query(CareerRoadmap).filter(CareerRoadmap.user_id == current_user.id).order_by(CareerRoadmap.created_at.desc()).all()
    
    return {
        "history": [
            {
                "id": r.id,
                "target_role": r.target_role,
                "created_at": r.created_at.isoformat(),
                "weeks": json.loads(r.steps) if isinstance(r.steps, str) else r.steps
            }
            for r in roadmaps
        ]
    }

@router.delete("/{roadmap_id}")
async def delete_roadmap(
    roadmap_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific roadmap."""
    roadmap = db.query(CareerRoadmap).filter(
        CareerRoadmap.id == roadmap_id,
        CareerRoadmap.user_id == current_user.id
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    db.delete(roadmap)
    db.commit()
    return {"message": "Roadmap deleted successfully"}


# ── Gamified Roadmap & Weekly Quiz Endpoints ─────────────────────────────────

_QUIZ_SYSTEM_PROMPT = """\
You are an expert Technical Interviewer and Curriculum Lead.
Your task: Generate exactly 5 highly educational multiple-choice questions (MCQs) to test a candidate's knowledge of the specified week's learning topic.

Rules:
- The topic of the week is provided in the user message.
- You must generate EXACTLY 5 questions.
- For each question:
  - Provide a clear, technically accurate question.
  - Provide EXACTLY 4 options, prefixing them with "A. ", "B. ", "C. ", "D. ".
  - Identify the single correct answer letter: "A", "B", "C", or "D".
- The questions should range from conceptual understanding to practical real-world scenarios or debugging related to the topic.
- Output ONLY valid JSON array — no markdown, no explanation, no conversational text.

Required JSON format:
[
  {
    "question": "Question text here?",
    "options": [
      "A. Option text one",
      "B. Option text two",
      "C. Option text three",
      "D. Option text four"
    ],
    "answer": "A"
  }
]
"""

def _get_fallback_quiz(topic: str) -> list[dict]:
    """Generates 5 fallback MCQs based on simple keyword matching or general engineering."""
    topic_lower = topic.lower()
    if "sql" in topic_lower or "database" in topic_lower or "query" in topic_lower:
        return [
            {
                "question": "Which of the following database indexes is most suitable for range queries?",
                "options": [
                    "A. Hash Index",
                    "B. B-Tree Index",
                    "C. Full-text Index",
                    "D. Bitmap Index"
                ],
                "answer": "B"
            },
            {
                "question": "What is the primary purpose of database normalization?",
                "options": [
                    "A. To increase query performance by duplicating data",
                    "B. To reduce data redundancy and improve data integrity",
                    "C. To encrypt sensitive data fields",
                    "D. To automatically generate primary keys"
                ],
                "answer": "B"
            },
            {
                "question": "Which isolation level prevents dirty reads but allows non-repeatable reads?",
                "options": [
                    "A. Read Uncommitted",
                    "B. Read Committed",
                    "C. Repeatable Read",
                    "D. Serializable"
                ],
                "answer": "B"
            },
            {
                "question": "What does the 'A' in ACID transaction properties represent?",
                "options": [
                    "A. Atomicity",
                    "B. Availability",
                    "C. Authority",
                    "D. Aggregation"
                ],
                "answer": "A"
            },
            {
                "question": "Which SQL JOIN returns all records when there is a match in either left or right table?",
                "options": [
                    "A. INNER JOIN",
                    "B. LEFT JOIN",
                    "C. RIGHT JOIN",
                    "D. FULL OUTER JOIN"
                ],
                "answer": "D"
            }
        ]
    elif "api" in topic_lower or "http" in topic_lower or "rest" in topic_lower or "graphql" in topic_lower:
        return [
            {
                "question": "Which HTTP status code is most appropriate when a client sends a request but lacks valid authentication credentials?",
                "options": [
                    "A. 400 Bad Request",
                    "B. 401 Unauthorized",
                    "C. 403 Forbidden",
                    "D. 404 Not Found"
                ],
                "answer": "B"
            },
            {
                "question": "What is an advantage of GraphQL over REST APIs?",
                "options": [
                    "A. GraphQL automatically caches all responses at the browser level",
                    "B. GraphQL allows clients to request only the specific fields they need, reducing payload size",
                    "C. GraphQL is faster because it does not use HTTP",
                    "D. GraphQL does not require any server-side schemas"
                ],
                "answer": "B"
            },
            {
                "question": "Which HTTP method is designed to be idempotent and is typically used to update an existing resource completely?",
                "options": [
                    "A. POST",
                    "B. PUT",
                    "C. PATCH",
                    "D. DELETE"
                ],
                "answer": "B"
            },
            {
                "question": "Which HTTP header is commonly used to negotiate the media type of the response?",
                "options": [
                    "A. Content-Type",
                    "B. Accept",
                    "C. User-Agent",
                    "D. Authorization"
                ],
                "answer": "B"
            },
            {
                "question": "In HTTP, what does the 301 Status Code represent?",
                "options": [
                    "A. Found (Temporary Redirect)",
                    "B. Moved Permanently",
                    "C. Bad Gateway",
                    "D. Unauthorized"
                ],
                "answer": "B"
            }
        ]
    elif "docker" in topic_lower or "container" in topic_lower or "kubernetes" in topic_lower or "deployment" in topic_lower or "ci/cd" in topic_lower:
        return [
            {
                "question": "What is the main difference between a container and a virtual machine (VM)?",
                "options": [
                    "A. Containers virtualize the underlying hardware, whereas VMs share the host kernel",
                    "B. Containers share the host OS kernel and are lightweight, while VMs run a full guest OS",
                    "C. Virtual machines boot faster than containers",
                    "D. Containers cannot be run locally without cloud providers"
                ],
                "answer": "B"
            },
            {
                "question": "In Docker, what is the purpose of multi-stage builds?",
                "options": [
                    "A. To run multiple containers simultaneously from a single command",
                    "B. To reduce the final image size by discarding intermediate build dependencies",
                    "C. To automatically scale containers based on load",
                    "D. To execute tests in different operating systems"
                ],
                "answer": "B"
            },
            {
                "question": "What is the role of a Pod in Kubernetes?",
                "options": [
                    "A. It represents the smallest deployable unit, containing one or more containers",
                    "B. It is a cluster-level load balancer",
                    "C. It acts as a database storage engine",
                    "D. It compiles source code into Docker images"
                ],
                "answer": "A"
            },
            {
                "question": "What Docker command is used to remove unused containers, networks, and images?",
                "options": [
                    "A. docker clean",
                    "B. docker system prune",
                    "C. docker remove all",
                    "D. docker kill"
                ],
                "answer": "B"
            },
            {
                "question": "In Kubernetes, which component is responsible for maintaining the desired state of pods?",
                "options": [
                    "A. kube-apiserver",
                    "B. etcd",
                    "C. Controller Manager",
                    "D. kube-scheduler"
                ],
                "answer": "C"
            }
        ]
    else:
        return [
            {
                "question": f"Which of the following best describes the core concept behind {topic} implementation?",
                "options": [
                    "A. Focusing on immediate delivery without automated tests",
                    "B. Writing modular, readable, and well-tested code that adheres to industry standards",
                    "C. Minimizing comments and documentation to reduce file sizes",
                    "D. Using as many third-party dependencies as possible to save time"
                ],
                "answer": "B"
            },
            {
                "question": "Which pattern is best suited for decoupling the sender of a request from its receiver?",
                "options": [
                    "A. Singleton Pattern",
                    "B. Observer/Pub-Sub Pattern",
                    "C. Decorator Pattern",
                    "D. Factory Pattern"
                ],
                "answer": "B"
            },
            {
                "question": "What is the main benefit of writing Unit Tests in a software project?",
                "options": [
                    "A. It guarantees that the code has zero bugs in production",
                    "B. It allows developers to verify individual components in isolation and catch regressions early",
                    "C. It replaces the need for integrations and end-to-end testing",
                    "D. It speeds up the initial coding phase by bypassing code reviews"
                ],
                "answer": "B"
            },
            {
                "question": "What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?",
                "options": [
                    "A. O(1)",
                    "B. O(N)",
                    "C. O(log N)",
                    "D. O(N log N)"
                ],
                "answer": "C"
            },
            {
                "question": "Which of the following is a SOLID design principle represented by the letter 'L'?",
                "options": [
                    "A. Liskov Substitution Principle",
                    "B. Least Privilege Principle",
                    "C. Loose Coupling Principle",
                    "D. Linear State Principle"
                ],
                "answer": "A"
            }
        ]


@router.put("/{roadmap_id}/toggle-week/{week_number}")
async def toggle_week(
    roadmap_id: str,
    week_number: int,
    completed: Optional[bool] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggle or explicitly set the completed status of a specific week in the roadmap.
    """
    from sqlalchemy.orm.attributes import flag_modified
    
    roadmap = db.query(CareerRoadmap).filter(
        CareerRoadmap.id == roadmap_id,
        CareerRoadmap.user_id == current_user.id
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    steps = roadmap.steps
    if isinstance(steps, str):
        try:
            steps = json.loads(steps)
        except Exception as e:
            logger.error(f"Failed to parse steps JSON string: {e}")
            raise HTTPException(status_code=500, detail="Invalid steps data in database")
            
    steps = list(steps or [])
    found = False
    for step in steps:
        if isinstance(step, dict) and step.get("week") == week_number:
            if completed is not None:
                step["completed"] = completed
            else:
                step["completed"] = not step.get("completed", False)
            found = True
            break
            
    if not found:
        raise HTTPException(status_code=404, detail=f"Week {week_number} not found in this roadmap")
        
    roadmap.steps = steps
    flag_modified(roadmap, "steps")
    db.commit()
    
    return {
        "message": f"Week {week_number} completion updated",
        "weeks": roadmap.steps
    }


@router.get("/{roadmap_id}/quiz/{week_number}")
async def get_week_quiz(
    roadmap_id: str,
    week_number: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get 3 AI-generated multiple-choice questions (MCQs) for the specified week's topic.
    """
    roadmap = db.query(CareerRoadmap).filter(
        CareerRoadmap.id == roadmap_id,
        CareerRoadmap.user_id == current_user.id
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    steps = roadmap.steps
    if isinstance(steps, str):
        try:
            steps = json.loads(steps)
        except Exception as e:
            logger.error(f"Failed to parse steps JSON string: {e}")
            raise HTTPException(status_code=500, detail="Invalid steps data in database")
            
    steps = steps or []
    week_data = None
    for step in steps:
        if isinstance(step, dict) and step.get("week") == week_number:
            week_data = step
            break
            
    if not week_data:
        raise HTTPException(status_code=404, detail=f"Week {week_number} not found in this roadmap")
        
    topic = week_data.get("topic") or "Software Engineering"
    
    # Try calling LLM to generate quiz
    from app.agents.registry import call_llm, parse_json
    
    user_content = f"Generate 5 MCQs for the topic: {topic}"
    try:
        raw_result = await asyncio.to_thread(
            call_llm,
            system_prompt=_QUIZ_SYSTEM_PROMPT,
            user_content=user_content,
            provider=settings.LLM_PROVIDER
        )
        if raw_result:
            parsed = parse_json(raw_result if isinstance(raw_result, str) else str(raw_result))
            if isinstance(parsed, list) and len(parsed) == 5:
                # Basic validation of keys
                valid = True
                for item in parsed:
                    if not isinstance(item, dict) or "question" not in item or "options" not in item or "answer" not in item:
                        valid = False
                        break
                    if not isinstance(item["options"], list) or len(item["options"]) != 4:
                        valid = False
                        break
                    if item["answer"] not in ("A", "B", "C", "D"):
                        valid = False
                        break
                if valid:
                    return parsed
                    
            logger.warning(f"LLM quiz generation returned invalid structure, using fallback. Topic: {topic}")
    except Exception as e:
        logger.error(f"Error calling LLM for quiz generation: {e}")
        
    # Fallback path
    return _get_fallback_quiz(topic)

