import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from loguru import logger

from app.core.database import get_db
from app.agents.registry import run_linkedin_optimizer
from app.api.deps import get_current_user
from app.core.rate_limit import check_daily_limit, increment_usage
from app.core.activity import log_activity
from app.core.config import settings

router = APIRouter()

class LinkedInOptimizeRequest(BaseModel):
    target_role: str
    provider: Optional[str] = None

@router.post("/optimize")
async def optimize_linkedin(
    req: LinkedInOptimizeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generates a LinkedIn profile optimization strategy using the centralized agent runner."""
    check_daily_limit(current_user.id, "linkedin")
    
    if not req.target_role or len(req.target_role.strip()) < 2:
        raise HTTPException(status_code=400, detail="Target role is required.")

    from app.core.cache import get_cached_response, set_cached_response

    # ── Check Cache First ───────────────────────────────────────────────────
    cached_result = get_cached_response("linkedin_opt_v2", req.target_role, req.provider)
    if cached_result:
        increment_usage(current_user.id, "linkedin")
        log_activity(db, current_user.id, f"Optimized LinkedIn for {req.target_role} (Cached)", "linkedin")
        return {"strategy": cached_result, "cached": True}

    try:
        # Direct call to the centralized runner
        result = run_linkedin_optimizer(req.target_role, provider=req.provider)
        
        if "error" in result:
             raise HTTPException(status_code=500, detail=result["error"])

        # Save to cache
        set_cached_response("linkedin_opt_v2", result, req.target_role, req.provider)

        increment_usage(current_user.id, "linkedin")
        log_activity(db, current_user.id, f"Optimized LinkedIn for {req.target_role}", "linkedin")
        return {"strategy": result, "cached": False}

    except Exception as e:
        logger.error(f"Error optimizing LinkedIn profile: {e}")
        raise HTTPException(status_code=500, detail=f"LinkedIn optimization failed: {str(e)}")
