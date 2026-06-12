"""
Career Full Analysis API.

FIXES:
  - Streaming endpoint no longer calls ainvoke() after astream() (was running graph TWICE).
  - Final state is extracted from the last LangGraph stream event instead.
  - Rate-limit check + increment happen exactly once per request.
"""
import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from loguru import logger
from sqlalchemy.orm import Session

from app.models.schemas import FullAnalysisRequest
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.activity import log_activity
from app.core.market.history import save_market_analysis
from app.core.rate_limit import check_daily_limit, increment_usage
from app.agents.workflow import create_career_graph, CareerState

router = APIRouter()


@router.post("/full-analysis/stream")
async def run_full_analysis_stream(
    request: FullAnalysisRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Streaming Career AI OS — real-time node progress via SSE.
    Graph runs ONCE. Final state extracted from last stream event.
    """
    check_daily_limit(current_user.id, "full_analysis")

    async def event_generator():
        try:
            graph = create_career_graph()
            initial_state: CareerState = {
                "resume_text": request.resume_text,
                "target_role": request.target_role,
                "location": request.location,
                "provider": getattr(request, "provider", None),
                "experience_level": getattr(request, "experience_level", "intermediate"),
                "learning_style": getattr(request, "learning_style", "balanced"),
                "resume_analysis": None,
                "market_analysis": None,
                "linkedin_strategy": None,
                "roadmap": [],
                "logs": [],
                "errors": [],
                "metadata": {},
            }

            final_state: dict = {}

            # astream() yields one dict per node completion: {node_name: state_update}
            async for event in graph.astream(initial_state, stream_mode="updates"):
                for node_name, state_update in event.items():
                    # Stream log lines to the client in real-time
                    for log_line in state_update.get("logs", []):
                        yield f"data: {json.dumps({'type': 'log', 'message': log_line, 'node': node_name})}\n\n"

                    # Accumulate logs and errors properly by extending instead of overwriting
                    if "logs" in state_update:
                        final_state.setdefault("logs", []).extend(state_update["logs"])
                    if "errors" in state_update:
                        final_state.setdefault("errors", []).extend(state_update["errors"])
                    
                    # Accumulate other fields
                    for k, v in state_update.items():
                        if k not in ("logs", "errors"):
                            final_state[k] = v

            # Build the same response envelope as the non-streaming endpoint
            errors = final_state.get("errors", [])

            # Save the roadmap to DB to enable the gamified quiz feature!
            roadmap_id = None
            roadmap_weeks = final_state.get("roadmap", [])
            if roadmap_weeks:
                try:
                    from app.models.models import CareerRoadmap
                    # Create database record
                    steps_data = []
                    req_exp_level = getattr(request, "experience_level", "intermediate") or "intermediate"
                    for w in roadmap_weeks:
                        w_copy = dict(w)
                        w_copy["experience_level"] = req_exp_level
                        steps_data.append(w_copy)

                    roadmap_record = CareerRoadmap(
                        user_id=current_user.id,
                        target_role=request.target_role,
                        steps=steps_data
                    )
                    db.add(roadmap_record)
                    db.commit()
                    db.refresh(roadmap_record)
                    roadmap_id = roadmap_record.id
                except Exception as db_err:
                    db.rollback()
                    logger.error(f"Failed to save generated roadmap in career workflow: {db_err}")

            # Save the full career analysis to DB for history tracking!
            analysis_id = None
            try:
                from app.models.models import CareerAnalysis
                analysis_record = CareerAnalysis(
                    user_id=current_user.id,
                    target_role=request.target_role,
                    location=request.location,
                    resume_analysis=final_state.get("resume_analysis"),
                    market_analysis=final_state.get("market_analysis"),
                    roadmap={
                        "id": roadmap_id,
                        "weeks": roadmap_weeks,
                        "target_role": request.target_role,
                    },
                    linkedin_strategy=final_state.get("linkedin_strategy"),
                )
                db.add(analysis_record)
                db.commit()
                db.refresh(analysis_record)
                analysis_id = analysis_record.id
            except Exception as db_err:
                db.rollback()
                logger.error(f"Failed to save generated career analysis: {db_err}")

            result = {
                "status": "success" if not errors else "partial_success",
                "id": analysis_id,
                "output": {
                    "resume_analysis": final_state.get("resume_analysis"),
                    "market_trends": final_state.get("market_analysis"),
                    "roadmap": {
                        "id": roadmap_id,
                        "weeks": roadmap_weeks,
                        "target_role": request.target_role,
                    },
                    "linkedin_strategy": final_state.get("linkedin_strategy"),
                },
                "logs": final_state.get("logs", []),
                "errors": errors,
                "metadata": final_state.get("metadata", {}),
            }

            save_market_analysis(
                db,
                current_user.id,
                request.target_role,
                request.location,
                final_state.get("market_analysis"),
            )

            yield f"data: {json.dumps({'type': 'result', 'payload': result})}\n\n"

            # Audit — only after successful completion
            increment_usage(current_user.id, "full_analysis")
            log_activity(
                db,
                current_user.id,
                f"Executed Streamed Career Analysis for {request.target_role}",
                "full_analysis",
            )

        except Exception as e:
            logger.error(f"Streaming Analysis Failed: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/history", summary="Get career analysis history for the current user")
async def get_career_analysis_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.models import CareerAnalysis
    from datetime import timezone
    
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
