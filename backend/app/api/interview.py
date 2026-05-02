import json
from datetime import datetime, timezone
import re
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from loguru import logger

from app.core.database import get_db
from app.models.models import InterviewSession, User
from app.agents.registry import get_interview_agent
from app.core.security import ALGORITHM, SECRET_KEY
from app.core.voice_engine import INTERVIEW_TTS_VOICE, generate_audio_base64
from app.core.rate_limit import check_daily_limit, increment_usage
from app.api.deps import get_current_user

router = APIRouter()

active_sessions = {}
TOTAL_INTERVIEW_QUESTIONS = 7


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

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    session_id: str, 
    role: str = "Software Engineer", 
    company: str = "A top tech company", 
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
            await websocket.close(code=1008, reason="Daily interview limit reached (5/day). Try again tomorrow.")
            return
        session = InterviewSession(id=session_id, user_id=current_user.id, target_role=role)
        db.add(session)
        db.commit()
        db.refresh(session)
        increment_usage(current_user.id, "interview")
        log_activity(db, current_user.id, f"Started Mock Interview for {role}", "interview")
    elif session.user_id != current_user.id:
        await websocket.close(code=1008)
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
            "agent": get_interview_agent(target_role=role, target_company=company, llm_config=llm_config)
        }
        
    session_data = active_sessions[active_session_key]
    
    if not session_data["history"]:
        interviewer = session_data["agent"]
        reply = interviewer.generate_reply(messages=[{"role": "user", "content": f"I am a candidate for the {role} position at {company}. Let's start the interview. Ask me the first question."}])
        msg_content = reply if isinstance(reply, str) else reply.get("content", "")
        
        session_data["history"].append({"role": "interviewer", "content": msg_content})
        session_data["question_count"] += 1
        
        session.chat_history = session_data["history"]
        db.commit()
        
        audio_data = await generate_audio_base64(msg_content, voice=INTERVIEW_TTS_VOICE)
        await websocket.send_json({"role": "interviewer", "content": msg_content, "audio": audio_data})

    try:
        while True:
            data = await websocket.receive_text()
            
            if data == "__ping__":
                await websocket.send_text("__pong__")
                continue
                
            session_data["history"].append({"role": "candidate", "content": data})
            session.chat_history = session_data["history"]
            db.commit()
            
            llm_messages = []
            for msg in session_data["history"]:
                r = "assistant" if msg["role"] == "interviewer" else "user"
                llm_messages.append({"role": r, "content": msg["content"]})
                
            interviewer = session_data["agent"]
            reply = interviewer.generate_reply(messages=llm_messages)
            msg_content = reply if isinstance(reply, str) else reply.get("content", "")
            
            session_data["history"].append({"role": "interviewer", "content": msg_content})
            session_data["question_count"] += 1
            session.chat_history = session_data["history"]
            
            # Simple score extraction if final summary is given
            if session_data["question_count"] >= TOTAL_INTERVIEW_QUESTIONS + 1:
                session.status = "completed"
                session.completed_at = datetime.now(timezone.utc)
                # The interviewer may report totals out of 50, 10, or 100.
                session.score = _extract_interview_score(msg_content)
            
            db.commit()
            
            audio_data = await generate_audio_base64(msg_content, voice=INTERVIEW_TTS_VOICE)
            await websocket.send_json({"role": "interviewer", "content": msg_content, "audio": audio_data})
            
            if session.status == "completed":
                await websocket.send_json({"role": "system", "content": "Interview Completed.", "score": session.score})
                break
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")

from app.core.activity import log_activity

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

from fastapi import HTTPException

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
