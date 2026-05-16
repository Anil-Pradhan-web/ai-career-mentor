from fastapi import APIRouter, Depends, HTTPException, Query
from loguru import logger
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.activity import log_activity
from app.core.database import get_db
from app.core.market.service import (
    get_market_intelligence, 
    CITY_TO_COUNTRY, 
    EXPERIENCE_MULTIPLIERS
)
from app.core.rate_limit import check_daily_limit, increment_usage
from app.models.models import User

router = APIRouter()

@router.get("/config")
async def get_market_config():
    """Returns dynamic configuration for all Wizards (Market, Interview, Analysis)."""
    from app.core.interview.constants import TARGET_ROLES, COMPANY_PROFILES, TARGET_LOCATIONS
    
    # Get seniority levels
    seniorities = [s.capitalize() for s in EXPERIENCE_MULTIPLIERS.keys()]
    
    return {
        "locations": TARGET_LOCATIONS,
        "roles": TARGET_ROLES,
        "companies": COMPANY_PROFILES,
        "seniorities": seniorities
    }

@router.get("/trends", summary="Fetch deterministic, region-aware job market trends")
async def get_market_trends(
    role: str = Query(..., description="Target job role, e.g., 'Data Scientist'"),
    location: str = Query(..., description="Target location, e.g., 'Bangalore, India'"),
    seniority: str | None = Query(None, description="Experience level, e.g., 'Senior'"),
    provider: str | None = Query(None, description="Optional LLM provider for summary text only"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    try:
        check_daily_limit(current_user.id, "market")

        data = await get_market_intelligence(role, location, provider, seniority)

        increment_usage(current_user.id, "market")
        log_activity(db, current_user.id, f"Researched Market for {role}", "market")

        return data
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Market trends pipeline failed")
        raise HTTPException(status_code=500, detail=f"Market error: {exc}")
