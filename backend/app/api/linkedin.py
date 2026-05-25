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
- Inject tech-themed emojis (e.g., 💻, 🚀, 🛠️, 🐳, ⚙️, 🛡️, 🌐, 📊, ⚡) naturally in the headlines and about_section to make the profile look modern, professional, and visually engaging.
- Output ONLY valid JSON — no markdown, no explanation.

Required JSON schema:
{
  "headlines": ["<headline option 1 with tech emojis>", "<headline option 2 with tech emojis>", "<headline option 3 with tech emojis>"],
  "about_section": "<full about section text incorporating tech emojis and markdown bullet points>",
  "demanding_skills": ["<skill>"],
  "ats_keywords_to_inject": ["<keyword>"],
  "recruiter_search_trends": ["<trend>"],
  "profile_density_advice": "<specific advice string>",
  "certifications": ["<certification name>"]
}
"""


def _get_fallback_linkedin_strategy(role: str, strengths: list[str], gaps: list[str]) -> dict:
    """Generates a high-quality programmatic fallback strategy when LLM is unavailable."""
    role_clean = role.strip()
    
    # Headlines
    headlines = [
        f"Software Engineer | Specializing in {role_clean} | Building Scalable Systems 💻",
        f"{role_clean} | Tech Enthusiast & Problem Solver 🚀 | Core Technologies Specialist",
        f"{role_clean} | Continuous Learner | Turning Complex Problems into Clean Code 🛠️"
    ]
    
    # Demanding skills
    demanding_skills = ["System Design", "Algorithms", "Clean Code", "CI/CD", "Cloud Architecture"]
    if "frontend" in role_clean.lower() or "ui" in role_clean.lower() or "react" in role_clean.lower():
        demanding_skills = ["React", "TypeScript", "Frontend Architecture", "State Management", "Performance Optimization"]
    elif "backend" in role_clean.lower() or "api" in role_clean.lower():
        demanding_skills = ["FastAPI/Django", "PostgreSQL/MySQL", "System Design", "Microservices", "REST APIs"]
    
    # ATS Keywords
    ats_keywords = ["Scalability", "Git", "Docker", "Database Design", "Unit Testing"]
    
    # Recruiter Search Trends
    trends = [
        f"Increasing demand for {role_clean} professionals with system design focus",
        "Recruiters are searching for hands-on microservices and containerization experience",
        "Strong emphasis on clean, maintainable code architectures and automated testing"
    ]
    
    # Certifications
    certs = [
        "AWS Certified Developer",
        "Docker Certified Associate",
        "React Advanced Certification"
    ]
    
    # About Section
    about_section = (
        f"👋 Hi there! I am a passionate {role_clean} dedicated to crafting clean, efficient, and scalable software solutions.\n\n"
        f"💻 With hands-on experience in modern web technologies and software patterns, "
        f"I thrive in fast-paced environments where I can solve complex engineering challenges.\n\n"
        f"🚀 Core Expertise:\n"
        f"• Tech Stack: {', '.join(demanding_skills[:4])}\n"
        f"• Engineering Practices: Agile, CI/CD, Test-Driven Development (TDD)\n\n"
        f"📫 Let's connect or reach out if you'd like to collaborate on exciting tech projects!"
    )
    
    return {
        "headlines": headlines,
        "about_section": about_section,
        "demanding_skills": demanding_skills,
        "ats_keywords_to_inject": ats_keywords,
        "recruiter_search_trends": trends,
        "profile_density_advice": "Ensure your headline uses high-converting keywords and your experience bullet points start with strong action verbs (e.g. Developed, Engineered). Keep your profile density high by listing at least 5 key skills with endorsements.",
        "certifications": certs
    }


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

    Returns validated dict. Falls back to a high-quality programmatic strategy on failure.
    """
    strengths      = (resume_analysis or {}).get("top_strengths", [])
    gaps           = (resume_analysis or {}).get("skill_gaps", [])
    market_trend   = (market_analysis or {}).get("market_trend", "Standard demand")
    top_companies  = (market_analysis or {}).get("hiring_companies", [])
    top_skills     = (market_analysis or {}).get("top_skills_freq", [])

    try:
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
            logger.warning("LinkedIn agent returned no result from LLM. Using programmatic fallback.")
            return _get_fallback_linkedin_strategy(role, strengths, gaps)

        return result
    except Exception as e:
        logger.warning(f"Error calling LinkedIn LLM agent: {e}. Using programmatic fallback.")
        return _get_fallback_linkedin_strategy(role, strengths, gaps)


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