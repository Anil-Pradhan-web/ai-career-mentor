import json
import asyncio
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
    agent_msg = ""
    for m in reversed(messages):
        if m.get("name") == agent_name and m.get("content"):
            agent_msg = m["content"].strip()
            break
    if not agent_msg:
        return {}
    cleaned = agent_msg
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()
    try:
        return json.loads(cleaned)
    except:
        return {}

def _validated_resume_analysis(data: dict) -> dict:
    fallback = {"technical_skills": [], "soft_skills": [], "skill_gaps": [], "top_strengths": [], "years_of_experience": 0, "ats_score": 0}
    try:
        return ResumeAnalysisResponse.model_validate(data).model_dump()
    except:
        return fallback

def _validated_market_trends(data: dict, role: str, location: str) -> dict:
    fallback = {"role": role, "location": location, "top_skills": [], "salary_range": "Unknown", "top_companies": [], "market_trend": "Unknown"}
    try:
        payload = {"role": role, "location": location, **(data or {})}
        return MarketTrendsResponse.model_validate(payload).model_dump()
    except:
        return fallback

def _validated_roadmap_weeks(data) -> list[dict]:
    if isinstance(data, dict):
        data = data.get("weeks") or data.get("roadmap") or data.get("plan") or []
    if not isinstance(data, list):
        return []
    weeks = []
    for idx, raw_week in enumerate(data):
        try:
            week_payload = {
                "week": int(raw_week.get("week", idx + 1)),
                "topic": raw_week.get("topic") or raw_week.get("title") or f"Week {idx + 1}",
                "estimated_hours": 10,
                "mini_project": raw_week.get("mini_project") or "Project description.",
                "resource_search_queries": raw_week.get("resource_search_queries") or []
            }
            weeks.append(week_payload)
        except:
            continue
    return weeks[:8]

@router.post("/full-analysis", response_model=FullAnalysisResponse)
async def run_full_analysis(
    request: FullAnalysisRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.agents.workflow import run_full_career_analysis
    check_daily_limit(current_user.id, "full_analysis")
    
    try:
        messages = await asyncio.to_thread(
            run_full_career_analysis, request.resume_text, request.target_role, request.location, request.provider
        )
    except Exception as exc:
        msg = str(exc)
        if ("429" in msg or "quota" in msg.lower() or "exhausted" in msg.lower()) and (request.provider != "groq"):
            messages = await asyncio.to_thread(
                run_full_career_analysis, request.resume_text, request.target_role, request.location, "groq"
            )
        else:
            raise HTTPException(status_code=500, detail=msg)

    resume_data = _extract_json_from_agent_messages(messages, "Resume_Analyst")
    market_data = _extract_json_from_agent_messages(messages, "Market_Researcher")
    coach_data = _extract_json_from_agent_messages(messages, "Career_Coach")

    if not coach_data:
        for m in reversed(messages):
            if m.get("content") and "[" in m["content"]:
                try:
                    coach_data = json.loads(m["content"].split("```json")[-1].split("```")[0])
                    break
                except: pass

    from app.core.search_engine import enrich_weeks_with_resources
    raw_weeks = _validated_roadmap_weeks(coach_data)
    if raw_weeks:
        enriched = await asyncio.to_thread(enrich_weeks_with_resources, raw_weeks)
        validated_weeks = [RoadmapWeek(**w).model_dump() for w in enriched]
    else:
        validated_weeks = []

    res = FullAnalysisResponse(
        resume_analysis=_validated_resume_analysis(resume_data),
        market_trends=_validated_market_trends(market_data, request.target_role, request.location),
        roadmap={"target_role": request.target_role, "weeks": validated_weeks},
        agent_logs=messages
    )
    
    increment_usage(current_user.id, "full_analysis")
    log_activity(db, current_user.id, f"Ran Full Career Analysis for {request.target_role}", "full_analysis")
    return res
