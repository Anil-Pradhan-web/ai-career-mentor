"""
Roadmap API
  POST /roadmap/generate → Given target_role + skill_gaps, run Career Coach Agent
                           and return a structured week-by-week learning plan.
"""
import json

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

router = APIRouter()


# ── Helpers ────────────────────────────────────────────────────────────────────

def _parse_agent_json(raw: str) -> list[dict]:
    """
    Robustly extract a JSON array from the agent reply.

    Handles:
      - Clean JSON arrays:              [ { "week": 1, ... }, ... ]
      - Wrapped in markdown fences:     ```json\n[ ... ]\n```
      - Wrapped in a dict with "weeks": { "weeks": [ ... ] }
    """
    cleaned = raw.strip()

    # Strip markdown code fences
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.warning(f"roadmap: JSON parse failed — {exc}. raw={raw[:300]}")
        raise ValueError(f"Agent returned non-JSON output: {str(exc)}")

    # Agent might return {"weeks": [...]} instead of a bare array
    if isinstance(parsed, dict):
        for key in ("weeks", "roadmap", "plan", "learning_plan"):
            if key in parsed and isinstance(parsed[key], list):
                return parsed[key]
        raise ValueError(f"Agent returned a dict but no expected list key. Keys: {list(parsed.keys())}")

    if not isinstance(parsed, list):
        raise ValueError(f"Expected a JSON array, got {type(parsed).__name__}")

    return parsed


def _normalise_week(raw_week: dict, idx: int) -> RoadmapWeek:
    """
    Coerce a raw dict from the agent into a validated RoadmapWeek.
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

    # resource_url — also called 'resource', 'url', 'link', 'free_resource'
    resource_url = (
        raw_week.get("resource_url")
        or raw_week.get("resource")
        or raw_week.get("url")
        or raw_week.get("link")
        or raw_week.get("free_resource")
        or "https://roadmap.sh"
    )
    # Ensure URL has a scheme
    if resource_url and not resource_url.startswith("http"):
        resource_url = "https://" + resource_url

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

    return RoadmapWeek(
        week=week_num,
        topic=str(topic),
        resource_url=str(resource_url),
        estimated_hours=estimated_hours,
        mini_project=str(mini_project),
    )


def _build_validated_weeks(raw_content: str) -> list[RoadmapWeek]:
    raw_weeks = _parse_agent_json(raw_content)
    if not raw_weeks:
        raise ValueError("Agent returned an empty roadmap.")

    weeks = [_normalise_week(w, idx) for idx, w in enumerate(raw_weeks)]
    if len(weeks) != 8:
        raise ValueError(f"Agent returned {len(weeks)} roadmap weeks; expected exactly 8.")

    for i, week in enumerate(weeks):
        week.week = i + 1
        if not week.topic.strip() or not week.mini_project.strip() or not week.resource_url.strip():
            raise ValueError(f"Roadmap week {i + 1} is missing required content.")

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

        # ── Check Cache First ──────────────────────────────────────────────────────
        gaps_key = "-".join(sorted(skill_gaps))
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
            return RoadmapResponse(target_role=target_role, weeks=weeks_objs)

        # ── Build prompt ────────────────────────────────────────────────────────────
        gaps_formatted = "\n".join(f"  {i+1}. {g}" for i, g in enumerate(skill_gaps))
        prompt = (
            f"Target Role: {target_role}\n\n"
            f"Candidate's Skill Gaps:\n{gaps_formatted}\n\n"

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

            "2. Projects must feel production-grade.\n"
            "- Avoid beginner projects.\n"
            "- Avoid generic CRUD apps.\n"
            "- Prefer scalable systems, real-time apps, AI integrations, dashboards, or cloud-native builds.\n\n"

            "3. Resource URLs must look realistic and high quality.\n"
            "Examples:\n"
            "- https://roadmap.sh/backend\n"
            "- https://kubernetes.io/docs/...\n"
            "- https://redis.io/docs/...\n"
            "- https://docs.aws.amazon.com/...\n\n"

            "4. estimated_hours must be realistic. Between 6 and 20 hours.\n\n"

            "5. learning_format MUST be EXACTLY one of:\n"
            "- video\n"
            "- article\n"
            "- github-repo\n"
            "- interactive-lab\n"
            "- paper\n\n"

            "6. success_criteria must be measurable.\n"
            "Examples:\n"
            "- 'Deploy a production-ready API with Redis caching and JWT authentication.'\n"
            "- 'Solve 15 medium-level graph problems without hints.'\n\n"

            "7. Ensure logical progression — each week must build naturally on previous weeks.\n\n"

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
            '    "resource_url": "realistic high-quality URL",\n'
            '    "learning_format": "video | article | github-repo | interactive-lab | paper",\n'
            '    "estimated_hours": 12,\n'
            '    "mini_project": "advanced portfolio-worthy project description with technologies",\n'
            '    "success_criteria": "specific measurable achievement"\n'
            "  }\n"
            "]"
        )

        # ── Run Career Coach Agent ──────────────────────────────────────────────────
        from app.agents.registry import get_career_coach, get_user_proxy  # lazy import
        llm_config = settings.get_llm_config(body.provider)
        user_proxy = get_user_proxy()
        coach = get_career_coach(llm_config=llm_config)

        try:
            user_proxy.initiate_chat(
                coach,
                message=prompt,
                max_turns=1,   # 1 turn means one prompt and one reply
            )
        except Exception as exc:
            logger.exception("roadmap: AutoGen chat failed")
            raise HTTPException(status_code=500, detail=f"Agent error: {str(exc)}")

        # ── Extract agent reply ─────────────────────────────────────────────────────
        try:
            last_msg = user_proxy.last_message(coach)
            raw_content = (last_msg.get("content") or "" if last_msg else "").strip()
        except Exception:
            # Fallback — scan chat_messages manually
            messages = user_proxy.chat_messages.get(coach, [])
            raw_content = next(
                (m["content"] for m in reversed(messages) if (m.get("content") or "").strip()),
                "",
            )

        if not raw_content:
            raise HTTPException(status_code=500, detail="Career Coach agent returned no response.")

        logger.info(f"roadmap: agent raw reply length={len(raw_content)} chars")

        # ── Parse + normalise ───────────────────────────────────────────────────────
        try:
            weeks = _build_validated_weeks(raw_content)
        except ValueError as first_error:
            logger.warning(f"roadmap: invalid agent JSON, retrying once: {first_error}")
            repair_prompt = (
                "Your previous roadmap response was invalid because: "
                f"{first_error}\n"
                "Return ONLY a raw JSON array of exactly 8 objects. Each object must include "
                "week, topic, skill_gap_addressed, resource_url, learning_format, "
                "estimated_hours, mini_project, and success_criteria. No markdown."
            )
            try:
                user_proxy.initiate_chat(coach, message=repair_prompt, max_turns=1)
                last_msg = user_proxy.last_message(coach)
                retry_content = (last_msg.get("content") or "" if last_msg else "").strip()
                weeks = _build_validated_weeks(retry_content)
            except Exception as retry_error:
                raise HTTPException(
                    status_code=500,
                    detail=f"Roadmap agent returned invalid JSON after retry: {retry_error}",
                )

        logger.info(f"roadmap/generate: built {len(weeks)}-week roadmap for '{target_role}'")

        # Save to DB
        roadmap_record = CareerRoadmap(
            user_id=current_user.id,
            target_role=target_role,
            steps=[w.model_dump() for w in weeks]
        )
        db.add(roadmap_record)
        db.commit()

        increment_usage(current_user.id, "roadmap")
        log_activity(db, current_user.id, f"Generated Roadmap for {target_role}", "roadmap")
        
        # Save successful response to cache
        set_cached_response("roadmap", [w.model_dump() for w in weeks], target_role, gaps_key, body.provider)
        
        return RoadmapResponse(target_role=target_role, weeks=weeks)
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
                "weeks": r.steps
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
