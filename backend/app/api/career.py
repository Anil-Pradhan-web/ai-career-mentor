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

from app.models.schemas import FullAnalysisRequest, FullAnalysisResponse
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.activity import log_activity
from app.core.rate_limit import check_daily_limit, increment_usage
from app.agents.workflow import run_full_career_analysis, create_career_graph, CareerState

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

                    # Accumulate full state as nodes complete (last event has everything)
                    final_state.update(state_update)

            # Build the same response envelope as the non-streaming endpoint
            errors = final_state.get("errors", [])
            result = {
                "status": "success" if not errors else "partial_success",
                "output": {
                    "resume_analysis": final_state.get("resume_analysis"),
                    "market_trends": final_state.get("market_analysis"),
                    "roadmap": {
                        "weeks": final_state.get("roadmap", []),
                        "target_role": request.target_role,
                    },
                    "linkedin_strategy": final_state.get("linkedin_strategy"),
                },
                "logs": final_state.get("logs", []),
                "errors": errors,
                "metadata": final_state.get("metadata", {}),
            }

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


@router.post("/full-analysis", response_model=FullAnalysisResponse)
async def run_full_analysis(
    request: FullAnalysisRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Entry point for the Autonomous Career AI OS."""
    from app.core.cache import get_cached_response, set_cached_response

    # Rate limit check FIRST — must always be enforced, even for cached results
    check_daily_limit(current_user.id, "full_analysis")

    import hashlib
    # Cache check (keyed on SHA-256 fingerprint of the resume + role + location)
    cache_key_content = hashlib.sha256(request.resume_text.encode("utf-8")).hexdigest()
    cached_result = get_cached_response(
        "full_analysis_v3", cache_key_content, request.target_role, request.location
    )
    if cached_result:
        increment_usage(current_user.id, "full_analysis")
        log_activity(
            db,
            current_user.id,
            f"Ran AI Analysis for {request.target_role} (Cached)",
            "full_analysis",
        )
        return FullAnalysisResponse.model_validate(cached_result)

    try:
        result = await run_full_career_analysis(
            request.resume_text,
            request.target_role,
            request.location,
            getattr(request, "provider", None),
        )

        increment_usage(current_user.id, "full_analysis")
        log_activity(
            db,
            current_user.id,
            f"Executed Autonomous Career Analysis for {request.target_role}",
            "full_analysis",
        )

        set_cached_response(
            "full_analysis_v3", result, cache_key_content, request.target_role, request.location
        )

        return FullAnalysisResponse.model_validate(result)

    except Exception as exc:
        logger.error(f"Autonomous Analysis Failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
