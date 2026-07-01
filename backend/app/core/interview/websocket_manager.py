import json
import asyncio
from datetime import datetime, timezone
import time as _time
from loguru import logger
from fastapi import WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState
from sqlalchemy.orm import Session

from app.models.models import InterviewSession, Resume
from app.core.rate_limit import check_daily_limit, increment_usage
from app.core.activity import log_activity
from app.core.interview.session import (
    _get_user_from_token,
    build_compressed_resume_summary,
    _update_rolling_memory,
    _extract_interview_score,
    active_sessions,
    _purge_stale_sessions
)
from app.core.interview.state import InterviewStateMachine, InterviewState
from app.core.interview.prompts import _build_interview_system_prompt, _build_feedback_system_prompt
from app.core.interview.llm import _stream_llm_response
from app.core.interview.constants import get_role_category

TOTAL_INTERVIEW_QUESTIONS = 7


# ── Safe WebSocket Send & Close Helpers ─────────────────────────────────────

async def _safe_send_json(ws: WebSocket, payload: dict) -> bool:
    """Send JSON payload safely, return False if client disconnected."""
    try:
        if ws.client_state != WebSocketState.CONNECTED:
            return False
        await ws.send_json(payload)
        return True
    except (WebSocketDisconnect, RuntimeError, Exception) as e:
        logger.warning(f"WS send failed (client gone): {type(e).__name__}")
        return False


async def _safe_send_text(ws: WebSocket, text: str) -> bool:
    """Send raw text safely, return False if client disconnected."""
    try:
        if ws.client_state != WebSocketState.CONNECTED:
            return False
        await ws.send_text(text)
        return True
    except (WebSocketDisconnect, RuntimeError, Exception):
        return False


async def _safe_close(ws: WebSocket, code: int = 1000) -> None:
    """Close WebSocket connection safely."""
    try:
        if ws.client_state == WebSocketState.CONNECTED:
            await ws.close(code=code)
    except Exception:
        pass


# ── Short-Lived Database Connection Helpers ─────────────────────────────────

def load_initial_interview_data(session_id: str, current_user_id: int, current_user_name: str, role: str, type: str):
    from app.core.database import SessionLocal
    from app.models.models import InterviewSession, Resume
    db = SessionLocal()
    try:
        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if not session:
            try:
                check_daily_limit(current_user_id, "interview")
            except Exception:
                return "limit_exceeded"
            session = InterviewSession(id=session_id, user_id=current_user_id, target_role=role)
            db.add(session)
            db.commit()
            db.refresh(session)
        elif session.user_id != current_user_id:
            return "unauthorized"

        chat_history = session.chat_history or []
        
        # Retrieve the latest resume to extract the candidate's name if available
        latest_resume = db.query(Resume).filter(
            Resume.user_id == current_user_id
        ).order_by(Resume.uploaded_at.desc()).first()

        candidate_name = current_user_name
        if latest_resume and latest_resume.raw_text:
            for line in latest_resume.raw_text.splitlines():
                line_clean = line.strip()
                if line_clean:
                    if len(line_clean) < 50 and "@" not in line_clean and "+1" not in line_clean and "+91" not in line_clean:
                        candidate_name = line_clean
                        break

        # Build compressed resume summary if technical interview
        resume_summary = None
        if type == "technical" and latest_resume:
            class DummyUser:
                def __init__(self, name):
                    self.name = name
            dummy_user = DummyUser(current_user_name)
            resume_summary = build_compressed_resume_summary(latest_resume, dummy_user, candidate_name=candidate_name)

        return chat_history, candidate_name, resume_summary
    finally:
        db.close()


def update_session_state(session_id: str, chat_history: list = None, status: str = None, completed_at = None, score: float = None):
    from app.core.database import SessionLocal
    from app.models.models import InterviewSession
    db = SessionLocal()
    try:
        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if session:
            if chat_history is not None:
                session.chat_history = chat_history
            if status is not None:
                session.status = status
            if completed_at is not None:
                session.completed_at = completed_at
            if score is not None:
                session.score = score
            db.commit()
    finally:
        db.close()


def log_interview_start(current_user_id: int, role: str):
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        log_activity(db, current_user_id, f"Started Mock Interview for {role}", "interview")
    finally:
        db.close()


# ── Core WebSocket Connection Handler ────────────────────────────────────────

async def handle_websocket_connection(
    websocket: WebSocket,
    session_id: str,
    role: str,
    company: str,
    company_style: str | None,
    company_tier: str | None,
    token: str | None,
    type: str,
    provider: str,
    db: Session = None
):
    """Orchestrates the WebSocket connection state, LLM generation, and memory sync."""
    active_session_key = None
    session_data = None

    from app.core.database import SessionLocal
    temp_db = SessionLocal()
    try:
        current_user = _get_user_from_token(token, temp_db)
        if current_user:
            current_user_id = current_user.id
            current_user_name = current_user.name
        else:
            current_user_id = None
            current_user_name = None
    finally:
        temp_db.close()

    if not current_user_id:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    pass
    await _safe_send_json(websocket, {"role": "system", "content": "Connected. Preparing your interview..."})

    # Load initial data on-demand in a short-lived DB transaction
    res = await asyncio.to_thread(load_initial_interview_data, session_id, current_user_id, current_user_name, role, type)
    if res in ("limit_exceeded", "unauthorized"):
        await _safe_close(websocket, code=1008)
        return

    chat_history, candidate_name, resume_summary = res
    question_count = len([
        m for m in chat_history
        if (m["role"] == "interviewer" and m.get("type") == "question")
    ])
    active_session_key = f"{current_user_id}:{session_id}"

    system_prompt = _build_interview_system_prompt(
        role,
        company,
        company_style or "",
        company_tier or "other",
        type,
        resume_summary,
        candidate_name=candidate_name
    )

    _purge_stale_sessions()  # Auto-purge stale cached connections

    if active_session_key not in active_sessions:
        active_sessions[active_session_key] = {
            "history": chat_history,
            "question_count": question_count,
            "system_prompt": system_prompt,
            "rolling_summary": '{"weak_areas": [], "strong_areas": [], "communication_score": 100}',
            "created_at": _time.time(),
        }

    session_data = active_sessions[active_session_key]
    
    async def _update_rolling_memory_bg(key, current, c_msg, i_msg, prov=provider):
        new_mem = await _update_rolling_memory(current, c_msg, i_msg, provider=prov)
        if key in active_sessions:
            active_sessions[key]["rolling_summary"] = new_mem

    # ── Send first question if new session ────────────────────────────────
    role_category = get_role_category(role)
    if not session_data["history"]:
        state_machine = InterviewStateMachine(1)  # Initial Phase 1: Intro
        first_msg = [{"role": "user", "content": f"I am a candidate for the {role} position at {company}. Start the interview. Ask me the first question."}]

        # Inject active state instruction into system prompt
        injected_system_prompt = f"{system_prompt}\n\n{state_machine.get_prompt_instruction('', interview_type=type, role_category=role_category)}"
        msg_content = await _stream_llm_response(first_msg, websocket, injected_system_prompt, provider=provider)

        if not msg_content:
            await _safe_close(websocket)
            return

        session_data["history"].append({
            "role": "interviewer",
            "type": "question",
            "content": msg_content
        })
        session_data["question_count"] += 1

        await asyncio.to_thread(update_session_state, session_id, chat_history=session_data["history"])

        # Stream complete message for offline/older clients
        await _safe_send_json(websocket, {"role": "interviewer", "type": "question", "content": msg_content})

        increment_usage(current_user_id, "interview")
        await asyncio.to_thread(log_interview_start, current_user_id, role)

    # ── Main conversation loop ────────────────────────────────────────────
    try:
        while True:
            data = await websocket.receive_text()

            if data == "__ping__":
                await _safe_send_text(websocket, "__pong__")
                continue

            data = data.strip()
            if not data:
                continue

            session_data["history"].append({"role": "candidate", "content": data})
            await asyncio.to_thread(update_session_state, session_id, chat_history=session_data["history"])

            # Build LLM messages from recent history (last 6 for speed/cost)
            llm_messages = []
            for msg in session_data["history"][-6:]:
                r = "assistant" if msg["role"] == "interviewer" else "user"
                llm_messages.append({"role": r, "content": msg["content"]})

            # Instantiate Finite State Machine based on current progress
            next_phase_num = session_data["question_count"] + 1
            state_machine = InterviewStateMachine(next_phase_num)

            # Get FSM instruction for the current phase
            if state_machine.state != InterviewState.COMPLETED:
                rolling = session_data.get("rolling_summary", "")
                fsm_instruction = state_machine.get_prompt_instruction(rolling, interview_type=type, role_category=role_category)
                
                llm_messages.append({
                    "role": "system",
                    "content": fsm_instruction
                })

            # Send system concluding event to block input if FSM is in feedback stage
            if state_machine.state == InterviewState.FEEDBACK:
                await _safe_send_json(websocket, {"role": "system", "content": "Interview Concluding..."})

            # Stream LLM question
            msg_content = await _stream_llm_response(llm_messages, websocket, system_prompt, provider=provider)

            session_data["history"].append({
                "role": "interviewer",
                "type": "question",
                "content": msg_content
            })
            session_data["question_count"] += 1
            await asyncio.to_thread(update_session_state, session_id, chat_history=session_data["history"])

            # Send complete message text
            if not await _safe_send_json(websocket, {"role": "interviewer", "type": "question", "content": msg_content}):
                break

            # Trigger background memory update
            asyncio.create_task(_update_rolling_memory_bg(
                active_session_key, 
                session_data["rolling_summary"], 
                data, 
                msg_content, 
                prov=provider
            ))

            # ── FEEDBACK MODE (Triggered after Phase 8 closing completes) ────
            if session_data["question_count"] > TOTAL_INTERVIEW_QUESTIONS:
                await asyncio.sleep(2)  # Allow time for speech audio to play

                completed_at_now = datetime.now(timezone.utc)
                feedback_prompt = _build_feedback_system_prompt(role, company, type)
                feedback_msgs = [{"role": "user", "content": f"Interview transcript:\n{json.dumps(session_data['history'])}"}]

                feedback_content = await _stream_llm_response(feedback_msgs, websocket, feedback_prompt, provider=provider)

                session_data["history"].append({
                    "role": "interviewer",
                    "type": "feedback",
                    "content": feedback_content
                })
                final_score = _extract_interview_score(feedback_content)
                await asyncio.to_thread(
                    update_session_state,
                    session_id,
                    chat_history=session_data["history"],
                    status="completed",
                    completed_at=completed_at_now,
                    score=final_score
                )

                await _safe_send_json(websocket, {"role": "interviewer", "type": "feedback", "content": feedback_content})
                await _safe_send_json(websocket, {"role": "system", "content": "Interview Completed.", "score": final_score})
                
                await asyncio.sleep(2)
                await _safe_close(websocket, code=1000)
                break

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected normally for session {}", session_id)
    except Exception as e:
        logger.error("Unexpected WS error for session {}: {}: {}", session_id, e.__class__.__name__, str(e), exc_info=True)
    finally:
        pass
        try:
            if session_data and session_data.get("history"):
                await asyncio.to_thread(update_session_state, session_id, chat_history=session_data["history"])
        except Exception:
            pass
        try:
            if active_session_key and active_session_key in active_sessions:
                del active_sessions[active_session_key]
        except Exception:
            pass
        logger.info(f"WS cleanup complete for session {session_id}")
