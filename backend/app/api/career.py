import json
from fastapi import APIRouter, Depends, HTTPException
from loguru import logger

from app.models.schemas import (
    FullAnalysisRequest,
    FullAnalysisResponse,
    MarketTrendsResponse,
    ResumeAnalysisResponse,
    RoadmapWeek,
)
from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.core.activity import log_activity
from app.core.rate_limit import check_daily_limit, increment_usage

router = APIRouter()

def _extract_json_from_agent_messages(messages, agent_name: str):
    """
    Finds the last message sent by a specific agent and extracts JSON.
    """
    # Search backwards for the most recent message from 'agent_name'
    agent_msg = ""
    for m in reversed(messages):
        if m.get("name") == agent_name and m.get("content"):
            agent_msg = m["content"].strip()
            break
            
    if not agent_msg:
        logger.warning(f"No message found from {agent_name}")
        return {}

    # Extract JSON inside code blocks if present
    cleaned = agent_msg
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.warning(f"JSON decode failed for {agent_name}: {exc}. Raw: {cleaned[:300]}")
        return {}


def _validated_resume_analysis(data: dict) -> dict:
    fallback = {
        "technical_skills": [],
        "soft_skills": [],
        "skill_gaps": [],
        "top_strengths": [],
        "years_of_experience": 0,
        "ats_score": 0,
    }
    try:
        return ResumeAnalysisResponse.model_validate(data).model_dump()
    except Exception as exc:
        logger.warning(f"Full analysis resume schema validation failed: {exc}")
        return fallback


def _validated_market_trends(data: dict, role: str, location: str) -> dict:
    fallback = {
        "role": role,
        "location": location,
        "top_skills": [],
        "salary_range": "Unknown",
        "top_companies": [],
        "market_trend": "Unknown",
    }
    try:
        payload = {"role": role, "location": location, **(data or {})}
        return MarketTrendsResponse.model_validate(payload).model_dump()
    except Exception as exc:
        logger.warning(f"Full analysis market schema validation failed: {exc}")
        return fallback


def _validated_roadmap_weeks(data) -> list[dict]:
    if isinstance(data, dict):
        data = data.get("weeks") or data.get("roadmap") or data.get("plan") or []
    if not isinstance(data, list):
        return []

    weeks = []
    for idx, raw_week in enumerate(data):
        if not isinstance(raw_week, dict):
            continue
        try:
            week_payload = {
                "week": raw_week.get("week", idx + 1),
                "topic": raw_week.get("topic") or raw_week.get("title") or f"Week {idx + 1}",
                "resource_url": raw_week.get("resource_url") or raw_week.get("resource") or "https://roadmap.sh",
                "estimated_hours": raw_week.get("estimated_hours") or raw_week.get("hours") or 8,
                "mini_project": raw_week.get("mini_project") or raw_week.get("project") or "Build a focused weekly project.",
            }
            weeks.append(RoadmapWeek.model_validate(week_payload).model_dump())
        except Exception as exc:
            logger.warning(f"Full analysis roadmap week validation failed at index {idx}: {exc}")
    return weeks[:8]


@router.post(
    "/full-analysis",
    response_model=FullAnalysisResponse,
    summary="Run all 3 agents (Resume Analyst, Market, Career Coach) via GroupChat"
)
async def run_full_analysis(
    request: FullAnalysisRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FullAnalysisResponse:
    from app.agents.workflow import run_full_career_analysis

    check_daily_limit(current_user.id, "full_analysis")
    logger.info(f"career/full-analysis: Started for role='{request.target_role}'")

    try:
        # 1. Run the GroupChat orchestration
        messages = run_full_career_analysis(
            request.resume_text,
            request.target_role,
            request.location,
            provider=request.provider,
        )
    except Exception as exc:
        msg = str(exc)
        should_fallback = (
            request.provider == "google"
            or (not request.provider and settings.LLM_PROVIDER == "google")
        ) and (
            "503" in msg
            or "high demand" in msg.lower()
            or "unavailable" in msg.lower()
        )

        if should_fallback:
            logger.warning("Google Gemini busy; falling back to GROQ for full analysis")
            try:
                messages = run_full_career_analysis(
                    request.resume_text,
                    request.target_role,
                    request.location,
                    provider="groq",
                )
            except Exception as exc2:
                logger.exception("Fallback GROQ provider also failed")
                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Google Gemini is currently unavailable. "
                        "Tried fallback to GROQ and it also failed: " + str(exc2)
                    ),
                )
        else:
            logger.exception("Full career analysis GroupChat failed")
            raise HTTPException(status_code=500, detail=msg)
        
    # 2. Extract specific agent outputs
    resume_data = _extract_json_from_agent_messages(messages, "Resume_Analyst")
    market_data = _extract_json_from_agent_messages(messages, "Market_Researcher")
    coach_data = _extract_json_from_agent_messages(messages, "Career_Coach")
    
    # 3. Handle fallback parsing in case LLaMA got confused about agent names 
    # (Sometimes the proxy impersonates or the system returns lists instead of dicts)
    
    # Career_Coach outputs a list of dicts. If missing, check all messages for a list structure.
    if not coach_data:
        for m in reversed(messages):
            if m.get("content"):
                try:
                    p = json.loads(m["content"].split("```json")[-1].split("```")[0])
                    if isinstance(p, list) and len(p) > 0 and "week" in p[0]:
                        coach_data = p
                        break
                except:
                    pass

    increment_usage(current_user.id, "full_analysis")
    log_activity(db, current_user.id, f"Ran Full Career Analysis for {request.target_role}", "full_analysis")
    return FullAnalysisResponse(
        resume_analysis=_validated_resume_analysis(resume_data),
        market_trends=_validated_market_trends(market_data, request.target_role, request.location),
        roadmap={"target_role": request.target_role, "weeks": _validated_roadmap_weeks(coach_data)},
        agent_logs=messages
    )
