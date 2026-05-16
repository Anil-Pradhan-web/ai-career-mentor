import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from loguru import logger
from sqlalchemy.orm import Session

from app.models.schemas import FullAnalysisRequest, FullAnalysisResponse
from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.activity import log_activity
from app.core.rate_limit import check_daily_limit, increment_usage
from app.agents.workflow import run_full_career_analysis

from fastapi.responses import StreamingResponse

router = APIRouter()

@router.post("/full-analysis/stream")
async def run_full_analysis_stream(
    request: FullAnalysisRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Streaming version of the Career AI OS for real-time progress visibility."""
    from app.agents.workflow import create_career_graph, CareerState
    import json

    # Rate limit check (Sync)
    check_daily_limit(current_user.id, "full_analysis")

    async def event_generator():
        try:
            graph = create_career_graph()
            initial_state = CareerState(
                resume_text=request.resume_text,
                target_role=request.target_role,
                location=request.location
            )
            
            # Use astream for real-time node events
            async for event in graph.astream(initial_state):
                # LangGraph events are typically dicts like {'node_name': {...}}
                for node_name, state_update in event.items():
                    if "logs" in state_update:
                        for log in state_update["logs"]:
                            yield f"data: {json.dumps({'type': 'log', 'message': log, 'node': node_name})}\n\n"
            
            # Final logic (we need a full run for results, but astream already ran it)
            # To get the final state, we can keep track of it or just do one last invoke (cached usually)
            # Actually, the last event in astream contains the final result
            final_result = await run_full_career_analysis(request.resume_text, request.target_role, request.location)
            
            yield f"data: {json.dumps({'type': 'result', 'payload': final_result})}\n\n"
            
            # Audit
            increment_usage(current_user.id, "full_analysis")
            log_activity(db, current_user.id, f"Executed Streamed Career Analysis for {request.target_role}", "full_analysis")

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
    """
    Entry point for the Autonomous Career AI OS.
    Runs a validated, parallel multi-agent pipeline.
    """
    from app.core.cache import get_cached_response, set_cached_response
    
    # ── 1. Cache Layer ──────────────────────────────────────────────────────
    cache_key_content = f"{request.resume_text[:200]}...{request.resume_text[-200:]}"
    cached_result = get_cached_response("full_analysis_v3", cache_key_content, request.target_role, request.location)
    
    if cached_result:
        increment_usage(current_user.id, "full_analysis")
        log_activity(db, current_user.id, f"Ran AI Analysis for {request.target_role} (Cached)", "full_analysis")
        return FullAnalysisResponse.model_validate(cached_result)

    # ── 2. Rate Limits ──────────────────────────────────────────────────────
    check_daily_limit(current_user.id, "full_analysis")
    
    try:
        # ── 3. AI OS Execution ────────────────────────────────────────────────
        # This now handles validation, parallel nodes, and modular generation
        result = await run_full_career_analysis(
            request.resume_text, 
            request.target_role, 
            request.location,
            request.provider
        )
        
        # ── 4. Logging & Activity ─────────────────────────────────────────────
        increment_usage(current_user.id, "full_analysis")
        log_activity(db, current_user.id, f"Executed Autonomous Career Analysis for {request.target_role}", "full_analysis")
        
        # ── 5. Cache Success ──────────────────────────────────────────────────
        set_cached_response("full_analysis_v3", result, cache_key_content, request.target_role, request.location)
        
        return FullAnalysisResponse.model_validate(result)

    except Exception as exc:
        logger.error(f"Autonomous Analysis Failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
