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
            import hashlib
            from app.core.cache import get_cached_response, set_cached_response

            # ── Cache check — skip graph entirely if cached ───────────────────
            cache_fp = hashlib.sha256(request.resume_text.encode()).hexdigest()
            cached_result = get_cached_response(
                "full_analysis_stream_v2", cache_fp, request.target_role, request.location
            )
            if cached_result:
                logger.info(f"[cache] HIT full-analysis stream: {request.target_role}")
                
                # Check if the cached roadmap exists in the DB for this user
                roadmap_info = cached_result.get("output", {}).get("roadmap", {})
                cached_id = roadmap_info.get("id")
                weeks = roadmap_info.get("weeks", [])
                
                roadmap_exists = False
                if cached_id:
                    roadmap_exists = db.query(CareerRoadmap).filter(
                        CareerRoadmap.id == cached_id,
                        CareerRoadmap.user_id == current_user.id
                    ).first() is not None
                
                if not roadmap_exists and weeks:
                    # Create a new CareerRoadmap record for this user
                    try:
                        from app.models.models import CareerRoadmap
                        new_record = CareerRoadmap(
                            user_id=current_user.id,
                            target_role=request.target_role,
                            steps=weeks
                        )
                        db.add(new_record)
                        db.commit()
                        db.refresh(new_record)
                        
                        # Update cached_result with the new roadmap ID
                        cached_result["output"]["roadmap"]["id"] = new_record.id
                        # Update the cache so subsequent requests get the valid ID
                        set_cached_response(
                            "full_analysis_stream_v2", cached_result, cache_fp, request.target_role, request.location
                        )
                    except Exception as db_err:
                        db.rollback()
                        logger.error(f"Failed to create new roadmap from cache: {db_err}")
                
                yield f"data: {json.dumps({'type': 'log', 'message': '⚡ Loaded from cache', 'node': 'cache'})}\n\n"
                yield f"data: {json.dumps({'type': 'result', 'payload': cached_result})}\n\n"
                increment_usage(current_user.id, "full_analysis")
                log_activity(db, current_user.id, f"Streamed Analysis (Cached) for {request.target_role}", "full_analysis")
                return

            graph = create_career_graph()
            initial_state: CareerState = {
                "resume_text": request.resume_text,
                "target_role": request.target_role,
                "location": request.location,
                "provider": getattr(request, "provider", None),
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
                    roadmap_record = CareerRoadmap(
                        user_id=current_user.id,
                        target_role=request.target_role,
                        steps=roadmap_weeks
                    )
                    db.add(roadmap_record)
                    db.commit()
                    db.refresh(roadmap_record)
                    roadmap_id = roadmap_record.id
                except Exception as db_err:
                    db.rollback()
                    logger.error(f"Failed to save generated roadmap in career workflow: {db_err}")

            result = {
                "status": "success" if not errors else "partial_success",
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

            yield f"data: {json.dumps({'type': 'result', 'payload': result})}\n\n"

            # ── Save to cache (only on clean success) ────────────────────────
            if not errors:
                try:
                    set_cached_response(
                        "full_analysis_stream_v2", result, cache_fp, request.target_role, request.location
                    )
                except Exception as _ce:
                    logger.warning(f"[cache] Full-analysis stream cache set failed: {_ce}")

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

