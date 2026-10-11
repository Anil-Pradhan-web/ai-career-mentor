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
optimization for technical and software engineering roles.

Your task: using the candidate's strengths, skill gaps, and market intelligence data,
generate a highly-personalized, conversion-optimized LinkedIn strategy.

Structure & Quality Rules:

1. headlines: Provide exactly 3 diverse, high-converting options using professional tech emojis (e.g., 💻, 🚀, 🛠️, 🐳, ⚙️, 🛡️, 🌐, 📊, ⚡).
   - Option 1 (Stack-Focused): Role | Core Technologies | High-Impact Keyword/Domain (e.g., "Fullstack Engineer | React, Next.js, Node.js | Crafting High-Performance Web Apps ⚡")
   - Option 2 (Value-Driven): Role | Problem Solver & Value Prop | Passion (e.g., "Data Scientist @ Tech | Translating Complex Data into Business Decisions | Deep Learning & RAG specialist 🚀")
   - Option 3 (Minimalist & Punchy): Role | Core Expertise Areas (e.g., "Software Engineer | Distributed Systems & API Design | Kubernetes, Docker 🐳")

2. about_section: Write a premium, story-driven bio in Markdown. Do NOT output a single wall of text. Follow this 4-part template:
   - 👋 **Hook**: Bold 2-sentence intro of professional identity and technical mission.
   - 🎯 **Core Focus**: Bullet points detailing technical strengths and engineering practices they apply (based on their strengths).
   - 🛠️ **Tech Stack**: A categorized list of technologies, tools, and platforms they specialize in.
   - 📫 **Call to Action (CTA)**: A clean closing invitation to connect (e.g., "Always open to collaborating on open-source or discussing scalable backend architectures. Let's connect!").

3. profile_density_advice: Give concrete, actionable advice on how to improve search visibility, including:
   - How to structure their LinkedIn experience section (e.g., Star method / Action Verbs + Metrics).
   - Tips on pinning projects in their Featured section.
   - Instructions on skill endorsements and custom URL settings.

4. demanding_skills & ats_keywords_to_inject: Align these strictly with the high-frequency market skills to help them rank in recruiter searches.

5. outreach_templates: Provide exactly 3 high-converting, personalized cold DM templates:
   - Template 1 ("Recruiter"): Direct pitch to Technical Recruiters / Talent Acquisition.
   - Template 2 ("Engineering Manager"): Problem-solving pitch directly to Engineering Leads focusing on architecture & business value.
   - Template 3 ("Alumni / Referral"): Warm connection message to Alumni / Senior Engineers asking for advice & referral.

6. featured_post_draft: Provide a viral storytelling LinkedIn post draft showcasing their latest project/capstone using the Hook → Problem → Technical Architecture → Quantified Result → Call to Action framework.

7. Output ONLY valid JSON — no markdown code blocks around the JSON itself, no explanations.

Required JSON schema:
{
  "headlines": ["<headline option 1 with tech emojis>", "<headline option 2 with tech emojis>", "<headline option 3 with tech emojis>"],
  "about_section": "<full about section text incorporating tech emojis and markdown bullet points>",
  "demanding_skills": ["<skill>"],
  "ats_keywords_to_inject": ["<keyword>"],
  "recruiter_search_trends": ["<trend>"],
  "profile_density_advice": "<specific advice string>",
  "certifications": ["<certification name>"],
  "outreach_templates": [
    {
      "target": "Technical Recruiter",
      "subject": "Experienced <Role> keen to support your team's mission",
      "message": "<crisp 3-sentence DM highlighting stack and impact>"
    },
    {
      "target": "Engineering Manager",
      "subject": "Quick question on your engineering architecture",
      "message": "<problem-oriented DM focusing on value delivery>"
    },
    {
      "target": "Alumni / Referral",
      "subject": "Fellow alumni reaching out / Quick advice",
      "message": "<polite warm connection message>"
    }
  ],
  "featured_post_draft": "<story-driven post draft announcing capstone project with GitHub & live demo placeholders>"
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

    # Outreach Templates
    outreach_templates = [
        {
            "target": "Technical Recruiter",
            "subject": f"Inquiry regarding {role_clean} opportunities",
            "message": f"Hi [Name], I noticed your team is expanding its engineering organization. As a {role_clean} specializing in {', '.join(demanding_skills[:2])}, I recently built production-grade systems focusing on low latency and clean architecture. I would love to connect and see if my background aligns with any current or upcoming openings!"
        },
        {
            "target": "Engineering Manager",
            "subject": f"Quick note from a {role_clean} passionate about your team's product",
            "message": f"Hi [Name], I've been following your team's work on scalable systems. I recently architected a solution addressing bottlenecks in {demanding_skills[0]}, improving throughput by 40%. Would love to share insights or connect for a quick 10-minute exchange whenever convenient."
        },
        {
            "target": "Alumni / Warm Referral",
            "subject": f"Connecting with fellow alumni / Exploring {role_clean} roles",
            "message": f"Hi [Name], hope you're doing well! I'm an engineer actively building in the {role_clean} space. I admire your trajectory at [Company] and would appreciate 5 minutes of your perspective on team culture and interview expectations when you have a moment."
        }
    ]

    featured_post_draft = (
        f"🚀 Just completed building my latest full-scale project for {role_clean}!\n\n"
        f"The challenge was handling real-time data flow with zero dropped packets under burst traffic.\n\n"
        f"Key highlights:\n"
        f"• Stack: {', '.join(demanding_skills[:3])}\n"
        f"• Benchmarked latency down by 35% using asynchronous connection pooling\n"
        f"• Fully containerized with Docker & integrated into CI/CD\n\n"
        f"Check out the live demo & code repo here: [Link] — would love your thoughts and feedback! 👇"
    )
    
    return {
        "headlines": headlines,
        "about_section": about_section,
        "demanding_skills": demanding_skills,
        "ats_keywords_to_inject": ats_keywords,
        "recruiter_search_trends": trends,
        "profile_density_advice": "Ensure your headline uses high-converting keywords and your experience bullet points start with strong action verbs (e.g. Developed, Engineered). Keep your profile density high by listing at least 5 key skills with endorsements.",
        "certifications": certs,
        "outreach_templates": outreach_templates,
        "featured_post_draft": featured_post_draft
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

        from app.core import llm_client
        result = llm_client.run_linkedin_strategy(
            system_prompt=_LINKEDIN_SYSTEM_PROMPT,
            user_content=user_content,
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
    from app.models.models import Resume, MarketAnalysis
    import hashlib

    # Fetch latest resume and market context from db
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    resume_analysis = resume.parsed_content if (resume and resume.parsed_content) else None

    market = db.query(MarketAnalysis).filter(MarketAnalysis.user_id == current_user.id).order_by(MarketAnalysis.created_at.desc()).first()
    market_analysis = market.analysis if (market and market.analysis) else None

    # Compute content hashes for cache key uniqueness
    resume_hash = hashlib.sha256(json.dumps(resume_analysis, sort_keys=True).encode("utf-8")).hexdigest() if resume_analysis else "no_resume"
    market_hash = hashlib.sha256(json.dumps(market_analysis, sort_keys=True).encode("utf-8")).hexdigest() if market_analysis else "no_market"

    cached = get_cached_response("linkedin_opt_v4", req.target_role, req.provider, resume_hash, market_hash)
    if cached:
        increment_usage(current_user.id, "linkedin")
        log_activity(db, current_user.id, f"Optimized LinkedIn for {req.target_role} (Cached)", "linkedin")
        return {"strategy": cached, "cached": True}

    try:
        result = run_linkedin_agent(
            req.target_role,
            resume_analysis=resume_analysis,
            market_analysis=market_analysis,
            provider=req.provider,
        )

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        set_cached_response("linkedin_opt_v4", result, req.target_role, req.provider, resume_hash, market_hash)
        increment_usage(current_user.id, "linkedin")
        log_activity(db, current_user.id, f"Optimized LinkedIn for {req.target_role}", "linkedin")
        return {"strategy": result, "cached": False}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"LinkedIn optimization error: {e}")
        raise HTTPException(status_code=500, detail=f"LinkedIn optimization failed: {str(e)}")