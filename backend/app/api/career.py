"""
Career Analysis History API.
"""
from fastapi import APIRouter, Depends, HTTPException
from loguru import logger
from sqlalchemy.orm import Session
from datetime import timezone

from app.api.deps import get_current_user
from app.core.database import get_db

router = APIRouter()


@router.get("/history", summary="Get career analysis history for the current user")
async def get_career_analysis_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.models import CareerAnalysis
    
    analyses = db.query(CareerAnalysis).filter(
        CareerAnalysis.user_id == current_user.id
    ).order_by(CareerAnalysis.created_at.desc()).all()
    
    def iso_z(dt):
        if not dt:
            return None
        if dt.tzinfo:
            dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
        return f"{dt.isoformat()}Z"
    
    return [
        {
            "id": a.id,
            "target_role": a.target_role,
            "location": a.location,
            "resume_analysis": a.resume_analysis,
            "market_analysis": a.market_analysis,
            "roadmap": a.roadmap,
            "linkedin_strategy": a.linkedin_strategy,
            "executive_summary": getattr(a, "executive_summary", None),
            "created_at": iso_z(a.created_at),
        }
        for a in analyses
    ]


@router.delete("/history/{id}", summary="Delete a career analysis history item")
async def delete_career_analysis(
    id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.models import CareerAnalysis
    
    analysis = db.query(CareerAnalysis).filter(
        CareerAnalysis.id == id,
        CareerAnalysis.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Career analysis not found")
        
    try:
        db.delete(analysis)
        db.commit()
        return {"status": "success", "message": "Career analysis deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete career analysis {id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete career analysis")
