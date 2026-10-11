"""
Market API & Agent Logic.

Responsibilities:
  GET /market/config   → Dynamic config for all wizards
  GET /market/trends   → Deterministic market intelligence + LLM summary

Agent logic (run_market_agent) is the single source of truth for market
analysis prompts and is imported by workflow.py for the LangGraph pipeline.
"""
import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from loguru import logger
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.activity import log_activity
from app.core.database import get_db
from app.core.market.service import (
    get_market_intelligence,
    CITY_TO_COUNTRY,
    EXPERIENCE_MULTIPLIERS,
)
from app.core.market.history import save_market_analysis
from app.core.rate_limit import check_daily_limit, increment_usage
from app.models.models import MarketAnalysis, User
from app.models.validation import MarketTrendsModel

router = APIRouter()

# ─────────────────────────────────────────────────────────────────────────────
# Market Agent — owned here, imported by workflow.py
# ─────────────────────────────────────────────────────────────────────────────

_MARKET_SYSTEM_PROMPT = """You are a Senior Tech Market Intelligence Analyst.
Analyze the role, location, and market context, then return ONLY valid JSON matching this schema:
{
  "role": "<role>",
  "location": "<location>",
  "salary_range": {"min": null, "max": null, "formatted": "<salary range>"},
  "market_trend": "High demand",
  "hiring_volume": "Actively Hiring",
  "hiring_companies": [{"name": "<company>", "hiring_volume": "Active openings"}],
  "top_skills_freq": [{"skill": "<skill>", "frequency": 80}],
  "summary": "2-3 sentence strategic market overview combining compensation benchmarks, hiring demand, and core tech stacks.",
  "negotiation_tactics": [
    "Anchor initial counter-offers 15-20% above base quotes using regional salary percentiles",
    "Negotiate signing bonuses or early equity vesting cliffs when holding multiple offers",
    "Highlight niche architectural competencies to push compensation toward the upper band"
  ],
  "emerging_signals": [
    "Rapid adoption of AI-accelerated workflows and autonomous agents",
    "Emphasis on distributed tracing, low-latency APIs, and cloud cost efficiency",
    "Shift toward end-to-end containerized deployments and automated CI/CD ownership"
  ]
}
Rules:
- market_trend must be 'High demand', 'Stable demand', or 'Moderate demand'.
- Output ONLY valid JSON.
"""


def run_market_agent(
    role: str,
    location: str,
    deterministic_data: dict,
    provider: Optional[str] = None,
) -> dict:
    """
    Market Intelligence Agent.

    Takes deterministic market data and enriches it with LLM-formatted
    summaries, trend narratives, and structured hiring company info.

    Returns validated dict. Falls back to deterministic_data on failure.
    """
    user_content = (
        f"ROLE: {role}\n"
        f"LOCATION: {location}\n\n"
        f"DETERMINISTIC MARKET DATA:\n{json.dumps(deterministic_data, indent=2)}"
    )

    from app.core import llm_client
    result = llm_client.run_market_agent(
        system_prompt=_MARKET_SYSTEM_PROMPT,
        user_content=user_content,
        response_model=MarketTrendsModel,
    )

    if not result:
        logger.warning("Market agent returned no result — using deterministic fallback.")
        result = deterministic_data

    # Merge result back into a copy of deterministic_data so that we NEVER lose any fields
    # like seniority, is_live, sources, summary, etc.
    final_result = {**deterministic_data}
    if isinstance(result, dict):
        for k, v in result.items():
            if v not in (None, "", [], {}):
                final_result[k] = v
            # Ensure summary is overwritten if the LLM produced one
            if k == "summary" and v:
                final_result["summary"] = v
    else:
        logger.warning("Market agent returned non-dict result.")

    # Ensure rich default negotiation tactics & emerging signals if LLM omitted them
    if not final_result.get("negotiation_tactics"):
        final_result["negotiation_tactics"] = [
            f"Benchmark total compensation: For {role} roles in {location}, emphasize system performance metrics to negotiate top-of-band base salary.",
            "Equity & Variable leverage: Ask for performance-based milestone bonuses or early equity vesting cliffs during multi-offer negotiations.",
            "Counter-offer strategy: Always anchor initial counter-offers 15-20% above the initial recruiter offer using published market salary bands."
        ]

    if not final_result.get("emerging_signals"):
        final_result["emerging_signals"] = [
            f"Adoption of AI-accelerated workflows and autonomous agents for {role}.",
            "Heavy emphasis on distributed tracing, observability, and sub-100ms API latency.",
            "Shift towards cloud-agnostic containerization and automated CI/CD pipeline ownership."
        ]

    return final_result


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/config")
async def get_market_config():
    """Returns dynamic configuration for all Wizards (Market, Interview, Analysis)."""
    from app.core.interview.constants import TARGET_ROLES, COMPANY_PROFILES, TARGET_LOCATIONS

    seniorities = []
    for s in EXPERIENCE_MULTIPLIERS.keys():
        if s == "mid":
            seniorities.append("Middle")
        else:
            seniorities.append(s.capitalize())

    return {
        "locations": TARGET_LOCATIONS,
        "roles": TARGET_ROLES,
        "companies": COMPANY_PROFILES,
        "seniorities": seniorities,
    }


@router.get("/history", summary="Fetch saved market intelligence history")
async def get_market_history(
    limit: int = Query(10, ge=1, le=50, description="Maximum number of saved market analyses to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    records = (
        db.query(MarketAnalysis)
        .filter(MarketAnalysis.user_id == current_user.id)
        .order_by(MarketAnalysis.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": record.id,
            "target_role": record.target_role,
            "location": record.location,
            "analysis": record.analysis or {},
            "created_at": record.created_at.isoformat() if record.created_at else None,
        }
        for record in records
    ]


@router.get("/trends", summary="Fetch deterministic, region-aware job market trends")
async def get_market_trends(
    role: str = Query(..., description="Target job role, e.g., 'Data Scientist'"),
    location: str = Query(..., description="Target location, e.g., 'Bangalore, India'"),
    seniority: str | None = Query(None, description="Experience level, e.g., 'Senior'"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    try:
        check_daily_limit(current_user.id, "market")

        data = await get_market_intelligence(role, location, None, seniority)

        save_market_analysis(db, current_user.id, role, location, data)
        increment_usage(current_user.id, "market")
        log_activity(db, current_user.id, f"Researched Market for {role}", "market")

        return data
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Market trends pipeline failed")
        raise HTTPException(status_code=500, detail=f"Market error: {exc}")


@router.delete("/{analysis_id}", summary="Delete a saved market analysis")
async def delete_market_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Delete a specific market analysis."""
    analysis = db.query(MarketAnalysis).filter(
        MarketAnalysis.id == analysis_id,
        MarketAnalysis.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Market analysis not found")
        
    db.delete(analysis)
    db.commit()
    return {"message": "Market analysis deleted successfully"}
