import json
from datetime import datetime, timezone
import re
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from loguru import logger
from starlette.websockets import WebSocketState

from app.core.database import get_db
from app.models.models import InterviewSession, User
from app.agents.registry import get_interview_agent, get_feedback_agent
from app.core.security import ALGORITHM, SECRET_KEY
from app.core.voice_engine import INTERVIEW_TTS_VOICE, generate_audio_base64
from app.core.rate_limit import check_daily_limit, increment_usage
from app.api.deps import get_current_user
from app.core.activity import log_activity

router = APIRouter()

active_sessions = {}
TOTAL_INTERVIEW_QUESTIONS = 7


# ── Safe WebSocket Send ──────────────────────────────────────────────────────
async def _safe_send_json(ws: WebSocket, payload: dict) -> bool:
    """Send JSON to WebSocket, returning False if the client is gone."""
    try:
        if ws.client_state != WebSocketState.CONNECTED:
            return False
        await ws.send_json(payload)
        return True
    except (WebSocketDisconnect, RuntimeError, Exception) as e:
        logger.warning(f"WS send failed (client gone): {type(e).__name__}")
        return False


async def _safe_send_text(ws: WebSocket, text: str) -> bool:
    try:
        if ws.client_state != WebSocketState.CONNECTED:
            return False
        await ws.send_text(text)
        return True
    except (WebSocketDisconnect, RuntimeError, Exception):
        return False


async def _safe_close(ws: WebSocket, code: int = 1000) -> None:
    try:
        if ws.client_state == WebSocketState.CONNECTED:
            await ws.close(code=code)
    except Exception:
        pass


# ── Helpers ───────────────────────────────────────────────────────────────────
def _get_user_from_token(token: str | None, db: Session) -> User | None:
    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except JWTError:
        return None

    if not user_id:
        return None

    return db.query(User).filter(User.id == user_id).first()


def _extract_interview_score(msg_content: str) -> float:
    """Normalize final interview scores to a 0-100 scale."""
    match_overall = re.search(r'OVERALL SCORE\s*:\s*(\d+)\s*/\s*(\d+)', msg_content, re.IGNORECASE)
    if match_overall:
        score = float(match_overall.group(1))
        denominator = float(match_overall.group(2))
        if denominator > 0:
            return (score / denominator) * 100

    match_100 = re.search(r'(\d+)\s*/\s*100', msg_content)
    if match_100:
        return float(match_100.group(1))

    match_70 = re.search(r'(\d+)\s*/\s*70', msg_content)
    if match_70:
        return (float(match_70.group(1)) / 70.0) * 100

    match_50 = re.search(r'(\d+)\s*/\s*50', msg_content)
    if match_50:
        return float(match_50.group(1)) * 2

    match_10 = re.search(r'(\d+)\s*/\s*10', msg_content)
    if match_10:
        return float(match_10.group(1)) * 10

    return 80.0


# ── WebSocket Endpoint ────────────────────────────────────────────────────────
@router.websocket("/ws/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    session_id: str, 
    role: str = "Software Engineer", 
    company: str = "A top tech company", 
    company_style: str | None = None,
    token: str | None = None,
    provider: str | None = None,
    db: Session = Depends(get_db)
):
    current_user = _get_user_from_token(token, db)
    if not current_user:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        # Check daily interview limit before creating a new session
        try:
            check_daily_limit(current_user.id, "interview")
        except Exception:
            await _safe_close(websocket, code=1008)
            return
        session = InterviewSession(id=session_id, user_id=current_user.id, target_role=role)
        db.add(session)
        db.commit()
        db.refresh(session)
    elif session.user_id != current_user.id:
        await _safe_close(websocket, code=1008)
        return
        
    chat_history = session.chat_history or []
    question_count = len([m for m in chat_history if m["role"] == "interviewer"])
    active_session_key = f"{current_user.id}:{session_id}"
    
    if active_session_key not in active_sessions:
        from app.core.config import settings
        llm_config = settings.get_llm_config(provider)
        active_sessions[active_session_key] = {
            "history": chat_history,
            "question_count": question_count,
            "agent": get_interview_agent(
                target_role=role, 
                target_company=company, 
                company_style=company_style or "",
                llm_config=llm_config
            )
        }
        
    session_data = active_sessions[active_session_key]
    
    # ── Send first question if new session ────────────────────────────────
    if not session_data["history"]:
        interviewer = session_data["agent"]
        
        # Non-blocking LLM call
        reply = await asyncio.to_thread(
            interviewer.generate_reply,
            messages=[{"role": "user", "content": f"I am a candidate for the {role} position at {company}. Let's start the interview. Ask me the first question."}]
        )
        msg_content = reply if isinstance(reply, str) else reply.get("content", "")
        
        session_data["history"].append({"role": "interviewer", "content": msg_content})
        session_data["question_count"] += 1
        
        session.chat_history = session_data["history"]
        db.commit()
        
        # Send text first, then audio — both safely
        if not await _safe_send_json(websocket, {"role": "interviewer", "content": msg_content}):
            logger.warning(f"Client disconnected before first question could be sent: {session_id}")
            return
        
        # Generate and send audio payload
        audio_data = await generate_audio_base64(msg_content, voice=INTERVIEW_TTS_VOICE)
        await _safe_send_json(websocket, {"role": "interviewer", "audio": audio_data})
        
        # Only increment usage if the interview actually successfully starts
        increment_usage(current_user.id, "interview")
        log_activity(db, current_user.id, f"Started Mock Interview for {role}", "interview")

    # ── Main conversation loop ────────────────────────────────────────────
    try:
        while True:
            data = await websocket.receive_text()
            
            if data == "__ping__":
                await _safe_send_text(websocket, "__pong__")
                continue
                
            session_data["history"].append({"role": "candidate", "content": data})
            session.chat_history = session_data["history"]
            db.commit()
            
            llm_messages = []
            # Optimization: Only send the last 6 messages to keep context short and fast
            recent_history = session_data["history"][-6:]
            for msg in recent_history:
                r = "assistant" if msg["role"] == "interviewer" else "user"
                llm_messages.append({"role": r, "content": msg["content"]})
                
            interviewer = session_data["agent"]
            
            # BACKEND FSM CONTROL: Strictly enforce 7 questions limit
            if session_data["question_count"] >= TOTAL_INTERVIEW_QUESTIONS:
                session.status = "completed"
                session.completed_at = datetime.now(timezone.utc)
                
                # Switch to separate Feedback Engine Mode
                feedback_agent = get_feedback_agent(
                    target_company=company, 
                    target_role=role, 
                    llm_config=session_data["agent"].llm_config
                )
                
                feedback_messages = [{"role": "user", "content": f"The interview is completed. Please analyze the following transcript and provide final feedback, ending with OVERALL SCORE: [X]/100.\n\nTranscript:\n{json.dumps(session_data['history'])}"}]
                
                reply = await asyncio.to_thread(
                    feedback_agent.generate_reply,
                    messages=feedback_messages
                )
                msg_content = reply if isinstance(reply, str) else reply.get("content", "")
                
                session_data["history"].append({"role": "interviewer", "content": msg_content})
                session.chat_history = session_data["history"]
                session.score = _extract_interview_score(msg_content)
                db.commit()
                
                # Send text
                await _safe_send_json(websocket, {"role": "interviewer", "content": msg_content})
                
                # Generate and send audio payload
                audio_data = await generate_audio_base64(msg_content, voice=INTERVIEW_TTS_VOICE)
                await _safe_send_json(websocket, {"role": "interviewer", "audio": audio_data})
                
                # Send completion flag and close
                await _safe_send_json(websocket, {"role": "system", "content": "Interview Completed.", "score": session.score})
                await _safe_close(websocket, code=1000)
                break
            
            # Non-blocking LLM call for normal questions
            reply = await asyncio.to_thread(
                interviewer.generate_reply,
                messages=llm_messages
            )
            msg_content = reply if isinstance(reply, str) else reply.get("content", "")
            
            session_data["history"].append({"role": "interviewer", "content": msg_content})
            session_data["question_count"] += 1
            session.chat_history = session_data["history"]
            
            db.commit()
            
            # Send text — if client is gone, break cleanly
            if not await _safe_send_json(websocket, {"role": "interviewer", "content": msg_content}):
                logger.info(f"Client disconnected mid-interview, saving state: {session_id}")
                break
            
            # Generate and send audio payload
            audio_data = await generate_audio_base64(msg_content, voice=INTERVIEW_TTS_VOICE)
            await _safe_send_json(websocket, {"role": "interviewer", "audio": audio_data})

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"Unexpected WS error for session {session_id}: {type(e).__name__}: {e}")
    finally:
        # Always ensure session state is persisted even on crash
        try:
            if session_data.get("history"):
                session.chat_history = session_data["history"]
                db.commit()
        except Exception:
            pass
        logger.info(f"WS cleanup complete for session {session_id}")


# ── REST Endpoints ────────────────────────────────────────────────────────────
@router.get("/history")
async def get_interview_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch previous mock interviews for the user."""
    interviews = db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).order_by(InterviewSession.created_at.desc()).all()
    
    return {
        "history": [
            {
                "id": i.id,
                "target_role": i.target_role,
                "created_at": i.created_at.isoformat(),
                "score": i.score,
                "status": i.status
            }
            for i in interviews
        ]
    }


@router.delete("/{session_id}")
async def delete_interview(
    session_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific interview session."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    db.delete(session)
    db.commit()
    return {"message": "Interview deleted successfully"}
