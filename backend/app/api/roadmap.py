"""
Roadmap API
  POST /roadmap/generate → Given target_role + skill_gaps, run Career Coach Agent
                           and return a structured week-by-week learning plan.
"""
import json

from fastapi import APIRouter, HTTPException
from loguru import logger

# Agents imported lazily inside the endpoint to avoid slow startup
from app.models.schemas import RoadmapRequest, RoadmapResponse, RoadmapWeek

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


# ── POST /roadmap/generate ─────────────────────────────────────────────────────
@router.post(
    "/generate",
    response_model=RoadmapResponse,
    summary="Generate a week-by-week career learning roadmap",
)
async def generate_roadmap(body: RoadmapRequest) -> RoadmapResponse:
    """
    Input  : target_role (str) + skill_gaps (list of strings)
    Process: Career_Coach AutoGen agent builds a 6-week plan
    Output : RoadmapResponse with structured weekly milestones
    """
    # ── Validate input ─────────────────────────────────────────────────────────
    target_role = body.target_role.strip()
    skill_gaps = [s.strip() for s in body.skill_gaps if s.strip()]

    if not target_role:
        raise HTTPException(status_code=400, detail="target_role must not be empty.")
    if not skill_gaps:
        raise HTTPException(status_code=400, detail="skill_gaps list must not be empty.")

    logger.info(
        f"roadmap/generate: role='{target_role}' | gaps={skill_gaps}"
    )

    # ── Build prompt ────────────────────────────────────────────────────────────
    gaps_formatted = "\n".join(f"  {i+1}. {g}" for i, g in enumerate(skill_gaps))
    prompt = (
        f"Target Role: {target_role}\n\n"
        f"Skill Gaps to Close:\n{gaps_formatted}\n\n"
        "Create a comprehensive 6-week learning roadmap to help the candidate master these skill gaps for the Target Role.\n"
        "Crucially, MAKE EACH WEEK DISTINCT. Break the topics down logically from foundational to advanced. Do NOT repeat the exact same topic across multiple weeks.\n\n"
        "Return ONLY a raw JSON array — no markdown, no explanation.\n"
        "Each element must have: 'week' (int), 'topic' (str), 'resource_url' (str), "
        "'estimated_hours' (int), and 'mini_project' (str)."
    )

    # ── Run Career Coach Agent ──────────────────────────────────────────────────
    from app.agents.registry import get_career_coach, get_user_proxy  # lazy import
    user_proxy = get_user_proxy()
    coach = get_career_coach()

    try:
        user_proxy.initiate_chat(
            coach,
            message=prompt,
            max_turns=2,   # turn 1 = proxy sends, turn 2 = coach replies
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
        raw_weeks = _parse_agent_json(raw_content)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    if not raw_weeks:
        raise HTTPException(status_code=500, detail="Agent returned an empty roadmap.")

    # Normalise each week, tolerating missing/alternate keys
    weeks: list[RoadmapWeek] = [
        _normalise_week(w, idx) for idx, w in enumerate(raw_weeks)
    ]

    # Re-number weeks sequentially (agent sometimes starts from 0 or skips)
    for i, w in enumerate(weeks):
        w.week = i + 1

    logger.info(f"roadmap/generate: built {len(weeks)}-week roadmap for '{target_role}'")

    return RoadmapResponse(target_role=target_role, weeks=weeks)
