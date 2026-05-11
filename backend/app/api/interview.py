import json
from datetime import datetime, timezone
import re
# Copyright (c) 2026 Anil Pradhan. All rights reserved.
# Unauthorized copying of this file, via any medium is strictly prohibited.
# Proprietary and confidential.

import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from loguru import logger
from starlette.websockets import WebSocketState
from openai import OpenAI

from app.core.database import get_db
from app.models.models import InterviewSession, User
from app.core.security import ALGORITHM, SECRET_KEY
from app.core.voice_engine import INTERVIEW_TTS_VOICE, generate_audio_base64
from app.core.rate_limit import check_daily_limit, increment_usage
from app.api.deps import get_current_user
from app.core.activity import log_activity
from app.core.config import settings

router = APIRouter()

active_sessions = {}
TOTAL_INTERVIEW_QUESTIONS = 7


# ── Safe WebSocket Send ──────────────────────────────────────────────────────
async def _safe_send_json(ws: WebSocket, payload: dict) -> bool:
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


# ── Direct LLM Streaming (Bypasses AutoGen for speed) ────────────────────────
def _get_openai_client():
    """Get an OpenAI-compatible client for GROQ (fastest for real-time interviews)."""
    return OpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )


def _build_interview_system_prompt(role: str, company: str, company_style: str) -> str:
    """Build a concise system prompt for the interview agent."""
    import random

    target_company_lower = company.lower()

    # Determine Difficulty based on company tier
    if any(c in target_company_lower for c in ["google", "amazon", "meta", "facebook", "netflix", "microsoft", "apple", "nvidia", "uber", "airbnb", "atlassian"]):
        company_difficulty = "Hard. Expect highly optimized solutions, massive scale system design, and deep technical probing."
    elif any(c in target_company_lower for c in ["tcs", "infosys", "wipro", "accenture", "cognizant", "hcl", "ibm", "capgemini", "tech mahindra"]):
        company_difficulty = "Easy to Medium. Focus on fundamental concepts, standard OOPs/algorithms, and practical implementation."
    else:
        company_difficulty = "Medium. Focus on solid architectural decisions, good coding practices, and practical scenarios."

    domain_context = company_style if company_style else f"the core business operations and scale of {company}"

    INTERVIEWER_PERSONAS = [
        "a friendly and supportive mentor who guides the candidate gently",
        "a strict and deeply analytical FAANG interviewer who challenges every assumption",
        "a quiet observer who speaks very little and expects the candidate to drive the conversation",
        "a fast-paced startup engineer who cares most about rapid delivery and practical tradeoffs",
        "an architectural purist who focuses heavily on scale, SOLID principles, and clean design",
    ]
    interviewer_persona = random.choice(INTERVIEWER_PERSONAS)

    return (
        f"You are a Senior Hiring Manager at {company} "
        f"conducting a realistic, adaptive mock interview for an Entry-Level / Fresher (Recent B.Tech Graduate) "
        f"applying for the {role} role.\n\n"

        f"CANDIDATE PROFILE (Fresher):\n"
        f"- The candidate is a 4th-year engineering student or a recent B.Tech graduate.\n"
        f"- Adjust your expectations accordingly: Focus heavily on problem-solving, CS fundamentals, academic projects, and their ability to learn. Do not expect 5+ years of deep industry experience.\n\n"

        f"YOUR PERSONALITY:\n"
        f"You must strictly act as {interviewer_persona}. Adapt your tone, pacing, and feedback style to match this persona perfectly.\n\n"

        f"CRITICAL COMPANY PERSONA & FOCUS:\n"
        f"You MUST strictly follow this company's interview style exactly as described:\n"
        f">>> {company_style} <<<\n"
        f"Difficulty Level: {company_difficulty}\n"
        f"If the company style demands hard algorithms, ask hard algorithms. If it demands core CS fundamentals, ask DBMS/OS/Networks. If it demands behavioral/leadership principles, prioritize that.\n"
        f"Additionally, integrate this domain context into your questions: {domain_context}\n\n"
        "IMPORTANT:\n"
        "The interview is happening on a LIVE VOICE CALL.\n"
        "Everything you generate will be converted into speech.\n\n"

        "STRICT RULES:\n"
        "- Speak naturally like a real interviewer.\n"
        "- No markdown.\n"
        "- No bullet points.\n"
        "- No emojis.\n"
        "- No structured templates.\n"
        "- No robotic responses.\n"
        "- Ask exactly ONE question at a time.\n"
        "- Keep responses SHORT (2-4 sentences max for questions).\n\n"

        "DYNAMIC INTERVIEW PHASES (Maximum 7 Questions Total):\n"
        f"Navigate naturally through these phases, entirely adapting the questions to match the {company} style:\n"
        "Phase 1: Introduction and background.\n"
        "Phase 2: Technical Screening (CS Fundamentals, OOPs, or basic coding - adapt based on company style).\n"
        "Phase 3: Deep Technical / DSA (Match the difficulty strictly to the company style).\n"
        f"Phase 4: Architecture / System Design (Focus: scalable systems architecture relevant to {company}).\n"
        f"Phase 5: Real-world {company} domain scenario ({domain_context}).\n"
        f"Phase 6: Role-specific Deep Dive / Edge Cases (Focus: Core responsibilities of a {role}).\n"
        "Phase 7: Behavioral / Culture fit (e.g., Leadership Principles, Googleyness, etc).\n\n"

        "ADAPTIVE QUESTIONING & FOLLOW-UP RULES:\n"
        "1. DYNAMIC DIFFICULTY: If the candidate answers well, immediately increase the difficulty. Ask a deep follow-up about tradeoffs, optimization, or edge cases. If they struggle, pivot to easier foundational probing.\n"
        "2. LISTEN AND ADAPT: Do NOT read from a script. Your next question MUST naturally connect to the candidate's previous answer.\n"
        "3. NO REPETITION: Never ask the same concept twice. Vary your topics dynamically.\n"
        "4. ONE QUESTION AT A TIME: Keep it conversational. Ask, listen, react naturally, then probe deeper.\n"
        f"5. COMPANY STRICTNESS: Embody {company}. If they are a FAANG, push them on time/space complexity and scalability. If they are a service company, focus on practical usage and fundamentals.\n\n"

        "ENDING RULE:\n"
        "The backend strictly controls interview termination. NEVER announce the end of the interview yourself. NEVER output the OVERALL SCORE yourself. Just ask the next question or follow-up until the system cuts you off.\n"
    )


def _build_feedback_system_prompt(role: str, company: str) -> str:
    return (
        f"You are a Senior Technical Recruiter at {company} evaluating an interview transcript for a {role} position.\n\n"
        "The interview has concluded. Your ONLY job is to analyze the entire conversation and provide detailed, professional feedback.\n\n"
        "REQUIREMENTS:\n"
        "1. Start by saying something like: 'That concludes our interview today. Thank you for your time. Here is your feedback...'\n"
        "2. Highlight strong areas and specifically point out weak areas or mistakes.\n"
        "3. Maintain a professional, encouraging tone.\n"
        "4. At the very end of your response, you MUST provide a score strictly in this format exactly:\n"
        "OVERALL SCORE : [X]/100\n"
    )


async def _stream_llm_response(messages: list[dict], ws: WebSocket, system_prompt: str) -> str:
    """
    Stream LLM response word-by-word over WebSocket for real-time feel.
    Returns the full accumulated response text.
    """
    client = _get_openai_client()

    full_msgs = [{"role": "system", "content": system_prompt}] + messages

    # Run the streaming call in a thread (it's synchronous)
    def _do_stream():
        return client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=full_msgs,
            temperature=0.8,
            max_tokens=600,  # Keep responses short for voice
            stream=True,
        )

    stream = await asyncio.to_thread(_do_stream)

    full_response = ""
    chunk_buffer = ""
    CHUNK_SIZE = 8  # Send every 8 words for smooth streaming

    for chunk in stream:
        delta = chunk.choices[0].delta
        if delta.content:
            full_response += delta.content
            chunk_buffer += delta.content

            # Stream in word chunks for real-time feel
            words = chunk_buffer.split(" ")
            if len(words) >= CHUNK_SIZE:
                text_to_send = " ".join(words[:CHUNK_SIZE])
                if not await _safe_send_json(ws, {"role": "interviewer_stream", "content": text_to_send}):
                    break
                chunk_buffer = " ".join(words[CHUNK_SIZE:])

    # Send remaining buffer
    if chunk_buffer.strip():
        await _safe_send_json(ws, {"role": "interviewer_stream", "content": chunk_buffer})

    return full_response.strip()


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
        denom = float(match_overall.group(2))
        if denom > 0:
            return (score / denom) * 100

    for pattern, denom in [(r'(\d+)\s*/\s*100', 100), (r'(\d+)\s*/\s*70', 70), (r'(\d+)\s*/\s*50', 50), (r'(\d+)\s*/\s*10', 10)]:
        m = re.search(pattern, msg_content)
        if m:
            return (float(m.group(1)) / denom) * 100

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

    # ── Immediately tell client we're connected (keeps connection alive) ──
    await _safe_send_json(websocket, {"role": "system", "content": "Connected. Preparing your interview..."})

    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
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

    system_prompt = _build_interview_system_prompt(role, company, company_style or "")

    if active_session_key not in active_sessions:
        active_sessions[active_session_key] = {
            "history": chat_history,
            "question_count": question_count,
            "system_prompt": system_prompt,
        }

    session_data = active_sessions[active_session_key]

    # ── Send first question if new session ────────────────────────────────
    if not session_data["history"]:
        first_msg = [{"role": "user", "content": f"I am a candidate for the {role} position at {company}. Start the interview. Ask me the first question."}]

        # Stream the first question in real-time
        msg_content = await _stream_llm_response(first_msg, websocket, system_prompt)

        if not msg_content:
            await _safe_close(websocket)
            return

        session_data["history"].append({"role": "interviewer", "content": msg_content})
        session_data["question_count"] += 1

        session.chat_history = session_data["history"]
        db.commit()

        # Send the complete message (for clients that don't support streaming)
        await _safe_send_json(websocket, {"role": "interviewer", "content": msg_content})

        # Generate and send audio
        audio_data = await generate_audio_base64(msg_content, voice=INTERVIEW_TTS_VOICE)
        await _safe_send_json(websocket, {"role": "interviewer", "audio": audio_data})

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

            # Build LLM messages from recent history (last 6 for speed)
            llm_messages = []
            for msg in session_data["history"][-6:]:
                r = "assistant" if msg["role"] == "interviewer" else "user"
                llm_messages.append({"role": r, "content": msg["content"]})

            # ── FEEDBACK MODE (after 7 questions) ─────────────────────────
            if session_data["question_count"] >= TOTAL_INTERVIEW_QUESTIONS:
                session.status = "completed"
                session.completed_at = datetime.now(timezone.utc)

                feedback_prompt = _build_feedback_system_prompt(role, company)
                feedback_msgs = [{"role": "user", "content": f"Interview transcript:\n{json.dumps(session_data['history'])}"}]

                msg_content = await _stream_llm_response(feedback_msgs, websocket, feedback_prompt)

                session_data["history"].append({"role": "interviewer", "content": msg_content})
                session.chat_history = session_data["history"]
                session.score = _extract_interview_score(msg_content)
                db.commit()

                await _safe_send_json(websocket, {"role": "interviewer", "content": msg_content})

                audio_data = await generate_audio_base64(msg_content, voice=INTERVIEW_TTS_VOICE)
                await _safe_send_json(websocket, {"role": "interviewer", "audio": audio_data})

                await _safe_send_json(websocket, {"role": "system", "content": "Interview Completed.", "score": session.score})
                await _safe_close(websocket, code=1000)
                break

            # ── Normal question (streamed in real-time) ───────────────────
            msg_content = await _stream_llm_response(llm_messages, websocket, system_prompt)

            session_data["history"].append({"role": "interviewer", "content": msg_content})
            session_data["question_count"] += 1
            session.chat_history = session_data["history"]
            db.commit()

            # Send complete message + audio
            if not await _safe_send_json(websocket, {"role": "interviewer", "content": msg_content}):
                break

            audio_data = await generate_audio_base64(msg_content, voice=INTERVIEW_TTS_VOICE)
            await _safe_send_json(websocket, {"role": "interviewer", "audio": audio_data})

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"Unexpected WS error for session {session_id}: {type(e).__name__}: {e}")
    finally:
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
    interviews = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).order_by(InterviewSession.created_at.desc()).all()

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
