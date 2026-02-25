import json
from datetime import datetime, timezone
import re
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from loguru import logger

from app.core.database import get_db
from app.models.models import InterviewSession, User
from app.agents.registry import get_interview_agent

router = APIRouter()

active_sessions = {}

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    session_id: str, 
    role: str = "Software Engineer", 
    company: str = "A top tech company", 
    db: Session = Depends(get_db)
):
    await websocket.accept()
    
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        # Create dummy user if not exists
        user = db.query(User).filter(User.id == "dummy").first()
        if not user:
            user = User(id="dummy", email="dummy@test.com", name="Dummy User", hashed_pw="dummy")
            db.add(user)
            db.commit()

        # Create session fallback
        session = InterviewSession(id=session_id, user_id="dummy", target_role=role)
        db.add(session)
        db.commit()
        db.refresh(session)
        
    chat_history = session.chat_history or []
    question_count = len([m for m in chat_history if m["role"] == "interviewer"])
    
    if session_id not in active_sessions:
        active_sessions[session_id] = {
            "history": chat_history,
            "question_count": question_count,
            "agent": get_interview_agent(target_role=role, target_company=company)
        }
        
    session_data = active_sessions[session_id]
    
    if not session_data["history"]:
        interviewer = session_data["agent"]
        reply = interviewer.generate_reply(messages=[{"role": "user", "content": f"I am a candidate for the {role} position at {company}. Let's start the interview. Ask me the first question."}])
        msg_content = reply if isinstance(reply, str) else reply.get("content", "")
        
        session_data["history"].append({"role": "interviewer", "content": msg_content})
        session_data["question_count"] += 1
        
        session.chat_history = session_data["history"]
        db.commit()
        await websocket.send_json({"role": "interviewer", "content": msg_content})

    try:
        while True:
            data = await websocket.receive_text()
            
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
            if session_data["question_count"] >= 6:
                session.status = "completed"
                session.completed_at = datetime.now(timezone.utc)
                # Try to extract score out of 100 or 10 from the text msg_content
                match = re.search(r'(\d+)\s*/\s*100', msg_content)
                if match:
                    session.score = float(match.group(1))
                else:
                    match_10 = re.search(r'(\d+)\s*/\s*10', msg_content)
                    if match_10:
                        session.score = float(match_10.group(1)) * 10
                    else:
                        session.score = 80.0
            
            db.commit()
            await websocket.send_json({"role": "interviewer", "content": msg_content})
            
            if session.status == "completed":
                await websocket.send_json({"role": "system", "content": "Interview Completed.", "score": session.score})
                break
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
