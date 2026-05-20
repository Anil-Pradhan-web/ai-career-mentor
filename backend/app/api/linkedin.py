"""
LinkedIn API & Agent Logic.

Responsibilities:
  POST /linkedin/optimize → Generate LinkedIn profile optimization strategy

Agent logic (run_linkedin_agent) is the single source of truth for LinkedIn
optimization prompts and is imported by workflow.py for the LangGraph pipeline.
"""
import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from loguru import logger

from app.core.database import get_db
from app.agents.registry import call_llm
from app.api.deps import get_current_user
from app.core.rate_limit import check_daily_limit, increment_usage
from app.core.activity import log_activity
from app.models.validation import LinkedInStrategyModel

router = APIRouter()

# ─────────────────────────────────────────────────────────────────────────────
# LinkedIn Agent — owned here, imported by workflow.py
# ─────────────────────────────────────────────────────────────────────────────

_LINKEDIN_SYSTEM_PROMPT = """\
You are an Elite Tech Career Branding Expert specializing in LinkedIn profile
optimization for software engineering roles.

Your task: using the candidate's context, market trends, and job match data,
create a high-converting, personalized LinkedIn strategy.

Rules:
- Inject high-impact ATS keywords throughout.
- Identify recruiter search trends for the target role.
- Give strict, specific profile density advice.
- Output ONLY valid JSON — no markdown, no explanation.

Required JSON schema:
{
  "headlines": ["<headline option 1>", "<headline option 2>", "<headline option 3>"],
  "about_section": "<full about section text>",
  "demanding_skills": ["<skill>"],
  "ats_keywords_to_inject": ["<keyword>"],
  "recruiter_search_trends": ["<trend>"],
  "profile_density_advice": "<specific advice string>",
  "certifications": ["<certification name>"]
}
"""


def run_linkedin_agent(
    role: str,
    resume_analysis: Optional[dict] = None,
    market_analysis: Optional[dict] = None,
    provider: Optional[str] = None,
) -> dict:
    """
    LinkedIn Optimization Agent.

    Generates a personalized LinkedIn strategy based on the candidate's
    resume analysis and market intelligence for the target role.

    Returns validated dict. Returns error dict on total failure.
    """
    strengths      = (resume_analysis or {}).get("top_strengths", [])
    gaps           = (resume_analysis or {}).get("skill_gaps", [])
    market_trend   = (market_analysis or {}).get("market_trend", "Standard demand")
    top_companies  = (market_analysis or {}).get("hiring_companies", [])
    top_skills     = (market_analysis or {}).get("top_skills_freq", [])

    user_content = (
        f"TARGET ROLE: {role}\n\n"
        f"CANDIDATE STRENGTHS: {json.dumps(strengths)}\n"
        f"CANDIDATE GAPS: {json.dumps(gaps)}\n"
        f"MARKET DEMAND CONTEXT: {market_trend}\n"
        f"TOP HIRING COMPANIES: {json.dumps(top_companies)}\n"
        f"HIGH-FREQUENCY MARKET SKILLS: {json.dumps(top_skills)}\n"
    )

    result = call_llm(
        system_prompt=_LINKEDIN_SYSTEM_PROMPT,
        user_content=user_content,
        provider=provider,
        response_model=LinkedInStrategyModel,
    )

    if not result:
        logger.warning("LinkedIn agent returned no result.")
        return {"error": "Failed to generate LinkedIn strategy"}

    return result


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

class LinkedInOptimizeRequest(BaseModel):
    target_role: str
    provider: Optional[str] = None


@router.post("/optimize")
async def optimize_linkedin(
    req: LinkedInOptimizeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generates a LinkedIn profile optimization strategy for the target role."""
    check_daily_limit(current_user.id, "linkedin")

    if not req.target_role or len(req.target_role.strip()) < 2:
        raise HTTPException(status_code=400, detail="Target role is required.")

    from app.core.cache import get_cached_response, set_cached_response

    cached = get_cached_response("linkedin_opt_v3", req.target_role, req.provider)
    if cached:
        increment_usage(current_user.id, "linkedin")
        log_activity(db, current_user.id, f"Optimized LinkedIn for {req.target_role} (Cached)", "linkedin")
        return {"strategy": cached, "cached": True}

    try:
        result = run_linkedin_agent(req.target_role, provider=req.provider)

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        set_cached_response("linkedin_opt_v3", result, req.target_role, req.provider)
        increment_usage(current_user.id, "linkedin")
        log_activity(db, current_user.id, f"Optimized LinkedIn for {req.target_role}", "linkedin")
        return {"strategy": result, "cached": False}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"LinkedIn optimization error: {e}")
        raise HTTPException(status_code=500, detail=f"LinkedIn optimization failed: {str(e)}")