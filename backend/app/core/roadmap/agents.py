"""
Roadmap Agents — LLM-powered roadmap structure and details generation.

These are the agent runner functions imported by workflow.py for the LangGraph pipeline
and by the API layer for the standalone /roadmap/generate endpoint.
"""
import json as _json
from loguru import logger

from app.core.roadmap.prompts import ROADMAP_SYSTEM_PROMPT, ROADMAP_DETAILS_SYSTEM_PROMPT


def run_roadmap_structure(
    target_role: str,
    skill_gaps: list[str],
    market_trend: str = "Stable",
    provider: str | None = None,
    custom_prompt: str | None = None,
    resume_analysis: dict | None = None,
    experience_level: str = "intermediate",
    learning_style: str = "balanced",
) -> list[dict]:
    """
    Roadmap Structure Agent.

    Generates a skeleton 8-week roadmap structure. If custom_prompt is provided,
    it uses that prompt directly. Otherwise builds a personalized and RAG-aligned
    prompt using resume_analysis and curated topics list.

    Provider/model selection is handled centrally by LLMConfigManager.
    Returns list of week dicts. Returns empty list on failure.
    """
    from app.core import llm_client

    if custom_prompt:
        user_content = custom_prompt
    else:
        # ── Retrieve latest parsed Resume for candidate profile context ──────────────────
        resume_context = ""
        if resume_analysis:
            yoe = resume_analysis.get("years_of_experience", 0)
            strengths = resume_analysis.get("top_strengths", [])

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

        # ── Learning Style & Experience Preferences ───────────────────────
        level_clean = experience_level.lower().strip()
        if "beginner_to_intermediate" in level_clean or "beginner" in level_clean:
            level_description = (
                "BEGINNER TO INTERMEDIATE. Focus on programming fundamentals, language syntax, core concepts, basic algorithms, "
                "simple CRUD operations, local database storage, unit testing basics, and standard single-server deployments. "
                "STRICTLY FORBIDDEN: Do not include advanced topics like Kubernetes, Docker containerization, system design, microservices, "
                "distributed caching, load balancing, message queues, CI/CD pipelines, or performance profiling. Make sure all weeks and "
                "mini-projects are suitable for a beginner engineer learning the core concepts."
            )
        else:
            level_description = (
                "INTERMEDIATE TO ADVANCED. Focus on advanced patterns, distributed systems, system design, scalability, caching, "
                "concurrency, optimization, Docker containerization, CI/CD pipelines, and high-performance APIs."
            )

        pref_instruction = (
            f"CANDIDATE PERSONALIZATION PREFERENCES:\n"
            f"- Targeted Skill Level: {level_description}\n"
            f"- Preferred Learning Style: {learning_style.upper()}\n\n"
        )

        # ── Load Curated RAG Topics dynamically ─────────────────────────────────────
        available_topics_str = ""
        try:
            import os
            seed_file_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
                "data",
                "curated_resources.json"
            )
            if os.path.exists(seed_file_path):
                with open(seed_file_path, "r", encoding="utf-8") as f:
                    curated_data = _json.load(f)
                    curated_topics = [res["topic"] for res in curated_data if "topic" in res]
                    # Unique curated topics in order
                    unique_topics = []
                    for t in curated_topics:
                        if t not in unique_topics:
                            unique_topics.append(t)
                    available_topics_str = ", ".join(f"'{t}'" for t in unique_topics)
        except Exception as e:
            logger.error(f"Failed to load curated topics for roadmap prompt: {e}")

        rag_prompt_instruction = ""
        if available_topics_str:
            rag_prompt_instruction = (
                "🎯 RAG ALIGNMENT RULE (CRITICAL FOR RESOURCE MATCHING):\n"
                "Our system uses a ChromaDB vector database to instantly retrieve gold-standard YouTube videos and official guides based on the week's 'topic' field.\n"
                "Whenever a week's learning content maps to any of these subjects, you MUST use the exact string below as the 'topic' field value:\n"
                f"[{available_topics_str}]\n\n"
                "Only if the week's subject does not fit any of the above pre-seeded topics, generate a custom topic that is short, punchy (3 to 6 words), and clean of colons/commas, acting like a clean search keyword.\n\n"
            )

        gaps_formatted = "\n".join(f"  {i+1}. {g}" for i, g in enumerate(skill_gaps))
        user_content = (
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
            "2. Ensure logical progression — each week must build naturally on previous weeks.\n\n"

            "STRICT OUTPUT RULES:\n"
            "- Return ONLY raw valid JSON.\n"
            "- No markdown. No explanations. No conversational text. No comments. No trailing commas.\n"
            "- Output EXACTLY 8 objects.\n\n"

            "REQUIRED OUTPUT FORMAT:\n"
            "[\n"
            "  {\n"
            '    "week": 1,\n'
            '    "topic": "highly specific technical topic",\n'
            '    "skill_gap_addressed": "exact skill gap from the list above"\n'
            "  }\n"
            "]"
        )

    result = llm_client.run_roadmap_structure(
        system_prompt=ROADMAP_SYSTEM_PROMPT,
        user_content=user_content,
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

    Provider/model selection is handled centrally by LLMConfigManager.
    Returns list of enriched week dicts. Returns input chunk on failure.
    """
    from app.core import llm_client

    user_content = (
        f"Target Role: {target_role}\n\n"
        f"Flesh out the following week structures with detailed content:\n"
        f"{_json.dumps(week_chunk, indent=2)}"
    )

    result = llm_client.run_roadmap_details(
        system_prompt=ROADMAP_DETAILS_SYSTEM_PROMPT,
        user_content=user_content,
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
