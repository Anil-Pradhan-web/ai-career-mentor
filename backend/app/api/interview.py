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
from app.core.voice_engine import generate_audio_base64
from app.core.rate_limit import check_daily_limit, increment_usage
from app.api.deps import get_current_user
from app.core.activity import log_activity
from app.core.config import settings

router = APIRouter()

active_sessions = {}
TOTAL_INTERVIEW_QUESTIONS = 7
_SESSION_MAX_AGE_SECONDS = 7200  # 2 hours — auto-purge stale sessions


def _purge_stale_sessions():
    """Remove sessions older than SESSION_MAX_AGE to prevent memory leaks on long-running servers."""
    import time
    now = time.time()
    stale_keys = [
        k for k, v in active_sessions.items()
        if now - v.get("created_at", now) > _SESSION_MAX_AGE_SECONDS
    ]
    for k in stale_keys:
        del active_sessions[k]
    if stale_keys:
        logger.info(f"[interview] Purged {len(stale_keys)} stale sessions from memory.")


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
    """Get an OpenAI-compatible client for NVIDIA or GROQ."""
    if settings.LLM_PROVIDER == "nvidia":
        return OpenAI(
            api_key=settings.NVIDIA_API_KEY,
            base_url="https://integrate.api.nvidia.com/v1",
        )
    return OpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )


from app.core.interview.constants import LEETCODE_BHANDARA, COMPANY_PROFILES

def _build_interview_system_prompt(
    role: str,
    company: str,
    company_style: str,
    company_tier: str,
    interview_type: str = "technical"
) -> str:
    import random
    target_company_lower = company.lower()
    
    # ── Difficulty Logic ───────────────────────────────────────────────
    tier = (company_tier or "other").lower()
    if tier in ["faang", "hft"]:
        difficulty_level = "HARD"
    elif tier in ["top-indian-product", "fintech", "mid-product"]:
        difficulty_level = "MEDIUM"
    else:
        difficulty_level = "EASY"

    # Select 1 random problem from the bhandara for this difficulty
    p1 = random.choice(LEETCODE_BHANDARA[difficulty_level])

    # ── Persona Logic ──────────────────────────────────────────────────
    TECHNICAL_PERSONAS = [
        "a FAANG Senior Staff Engineer who values scalability and deep technical mastery",
        "a rigorous system architect who focuses on trade-offs and edge cases",
        "a startup CTO who cares about speed, clean code, and solving real-world bugs"
    ]
    BEHAVIORAL_PERSONAS = [
        "an empathetic Hiring Manager who looks for leadership potential and EQ",
        "a culture-focused director who values collaboration, mentorship, and values-alignment",
        "a professional HRBP who evaluates communication, conflict resolution, and growth mindset"
    ]
    
    interviewer_persona = random.choice(TECHNICAL_PERSONAS if interview_type == "technical" else BEHAVIORAL_PERSONAS)

    # ── Mode-Specific Instructions ─────────────────────────────────────
    if interview_type == "technical":
        mode_instructions = (
            "FOCUS: ONLY TECHNICAL ASSESSMENT.\n"
            "- Deep dive into Data Structures, Algorithms, and System Design (LLD/HLD).\n"
            "- Ask about code optimization, time/space complexity, and scalability.\n"
            "- IMPORTANT: When asking a coding challenge, EXPLICITLY state the standard LeetCode problem name or number (e.g., 'This problem is similar to LeetCode 1: Two Sum'). Do this so the candidate clearly understands the reference.\n"
            f"- Evaluate their ability to solve complex engineering problems for a {role}.\n"
            "- Discuss architecture, trade-offs, and company-specific tech stacks."
        )
        flow_phases = (
            "Phase 1: Intro & Tech Stack Discovery (Current project/skills).\n"
            "Phase 2: Core Engineering Fundamentals (Language internals/OS/DBMS).\n"
            f"Phase 3: Coding Challenge (Initial) - {p1['title']}. Instructions: Discuss {p1['description']}. Focus on getting the basic logic right first.\n"
            f"Phase 4: Coding Challenge (Deep-Dive) - {p1['title']}. Instructions: Now focus on {', '.join(p1['concepts'])}. Ask for {', '.join(p1['optimizations'])}. Discuss time/space complexity and edge cases in detail.\n"
            "Phase 5: Domain-specific deep dive (Frameworks/Tools).\n"
            "Phase 6: System Architecture & Design (HLD/LLD - Scale, Database, Caching).\n"
            f"Phase 7: Real-life scenario at {company} (e.g. Handling a production outage or scaling a specific feature)."
        )
    else:
        mode_instructions = (
            "FOCUS: ONLY HR & BEHAVIORAL ASSESSMENT.\n"
            "- Evaluate communication, confidence, teamwork, leadership, ownership, and culture fit.\n"
            "- Use STAR-based follow-up questions when needed.\n"
            "- Keep the interview conversational and human-like.\n"
            "- Ask classic HR interview questions and realistic workplace scenarios."
        )

        flow_phases = (
            "Phase 1: Introduction, background, resume walkthrough, and career goals.\n"
            "Phase 2: Motivation, strengths/weaknesses, and why this company.\n"
            "Phase 3: Teamwork, collaboration, conflict resolution, and communication.\n"
            "Phase 4: Feedback handling, pressure situations, mistakes, and challenges.\n"
            "Phase 5: Ownership, leadership, prioritization, and responsibility.\n"
            "Phase 6: Company culture fit, professionalism, salary, relocation, and offers.\n"
            "Phase 7: Situational HR scenarios, ambiguity handling, and final closing."
        )
    return (
        f"You are a Senior Interviewer at {company} conducting a {interview_type.upper()} mock interview for a {role} role.\n\n"
        f"YOUR PERSONA: You behave as {interviewer_persona}.\n\n"
        f"INTERVIEW MODE: {interview_type.upper()}\n"
        f"Tier/Category: {company_tier}\n"
        f"Difficulty: {difficulty_level}\n"
        f"{mode_instructions}\n\n"
        "STRICT VOICE RULES:\n"
        "- No markdown, no bullet points, no emojis.\n"
        "- Ask EXACTLY ONE question at a time. Stop generating immediately after your question.\n"
        "- Keep responses concise (2-4 sentences max).\n"
        "- NEVER roleplay as the candidate. NEVER simulate a two-way dialogue.\n"
        "- Do NOT combine multiple phases. Ask the current phase's question and WAIT.\n\n"
        f"ADAPTIVE QUESTIONING (INTELLIGENT RECURSION):\n"
        "- If the candidate gives a weak/wrong answer, ask a simpler follow-up or provide a gentle hint before moving on.\n"
        "- If the candidate gives a strong answer, dive deeper into constraints, edge cases, or optimization.\n\n"
        f"INTERVIEW FLOW:\n{flow_phases}\n\n"
        "Remember: You are the interviewer. First provide a brief, direct review/feedback (1-2 sentences) evaluating the candidate's previous response, then ask the NEXT question, and then STOP."
    )

def _build_feedback_system_prompt(role: str, company: str) -> str:
    return (
        f"You are an elite, highly critical Senior Engineering Manager and Hiring Committee Member at {company} evaluating a candidate's interview transcript for a {role} position.\n\n"
        "The interview has concluded. Your task is to provide a brutally honest, top-notch, and deeply analytical feedback report.\n\n"
        "SCORING RUBRIC (CRITICAL):\n"
        "- 90-100: Exceptional. Flawless logic, optimal code, deep architectural understanding.\n"
        "- 75-89: Strong hire. Good problem-solving, but missed minor edge cases or optimizations.\n"
        "- 50-74: Needs improvement. Required heavy hinting, struggled with core concepts, or gave superficial answers.\n"
        "- 0-49: Reject. Failed to answer basic questions, completely wrong logic, or poor communication.\n"
        "**WARNING:** Do NOT give a generic 'good' score. You MUST aggressively deduct points for every incorrect answer, missed edge case, or time the interviewer had to provide hints.\n\n"
        "REQUIREMENTS:\n"
        "1. Start directly with: 'That concludes our interview today. Thank you for your time. Here is your detailed performance analysis...'\n"
        "2. Structure your feedback clearly using the following sections:\n"
        "   - **Executive Summary:** A brief 2-sentence verdict on their overall performance.\n"
        "   - **Strengths:** Specific moments where the candidate shined.\n"
        "   - **Areas of Improvement:** Explicit examples from the transcript where they answered incorrectly, used suboptimal logic, or failed to communicate clearly.\n"
        "   - **Actionable Advice:** What they need to study before their next interview.\n"
        "3. Tone: Professional, highly constructive, and direct. Do not sugarcoat failures.\n"
        "4. At the very end of your response, on a new line, you MUST provide the final calculated score strictly in this exact format:\n"
        "OVERALL SCORE : [X]/100"
    )


async def _stream_llm_response(messages: list[dict], ws: WebSocket, system_prompt: str) -> str:
    """
    Stream LLM response word-by-word over WebSocket for real-time feel.
    INCREMENTAL TTS: Buffers sentences and streams audio concurrently.
    """
    client = _get_openai_client()
    model_name = settings.NVIDIA_MODEL if settings.LLM_PROVIDER == "nvidia" else settings.GROQ_MODEL

    full_msgs = [{"role": "system", "content": system_prompt}] + messages

    def _do_stream():
        return client.chat.completions.create(
            model=model_name,
            messages=full_msgs,
            temperature=0.65,
            max_tokens=800,
            stream=True,
        )

    stream = await asyncio.to_thread(_do_stream)

    full_response = ""
    chunk_buffer = ""
    sentence_buffer = ""
    CHUNK_SIZE = 8

    # ── Background TTS Worker for Incremental Audio ──
    tts_queue = asyncio.Queue()
    
    async def tts_worker():
        while True:
            sentence = await tts_queue.get()
            if sentence is None:  # Sentinel
                break
            if sentence.strip():
                try:
                    audio_result = await generate_audio_base64(sentence)
                    if audio_result and audio_result.get("audio"):
                        await _safe_send_json(ws, {"role": "interviewer", "audio": audio_result["audio"], "fragment": True})
                except Exception as e:
                    logger.error(f"Incremental TTS failed: {e}")
            tts_queue.task_done()
            
    worker_task = asyncio.create_task(tts_worker())

    for chunk in stream:
        delta = chunk.choices[0].delta
        if delta.content:
            full_response += delta.content
            chunk_buffer += delta.content
            sentence_buffer += delta.content

            # Stream text in word chunks
            words = chunk_buffer.split(" ")
            if len(words) >= CHUNK_SIZE:
                text_to_send = " ".join(words[:CHUNK_SIZE])
                if not await _safe_send_json(ws, {"role": "interviewer_stream", "content": text_to_send}):
                    break
                chunk_buffer = " ".join(words[CHUNK_SIZE:])
            
            # Sentence buffering for TTS
            if any(p in sentence_buffer for p in ['. ', '? ', '! ', '\n']):
                import re
                match = re.search(r'([.?!]\s+|\n+)', sentence_buffer)
                if match:
                    idx = match.end()
                    sentence = sentence_buffer[:idx].strip()
                    sentence_buffer = sentence_buffer[idx:]
                    if len(sentence) > 2:
                        await tts_queue.put(sentence)

    # Flush remaining text
    if chunk_buffer.strip():
        await _safe_send_json(ws, {"role": "interviewer_stream", "content": chunk_buffer})
    
    # Flush remaining sentence
    if sentence_buffer.strip():
        await tts_queue.put(sentence_buffer.strip())

    # Stop TTS worker
    await tts_queue.put(None)
    await worker_task

    return full_response.strip()

async def _update_rolling_memory(current_memory: str, last_candidate_msg: str, last_interviewer_msg: str) -> str:
    prompt = (
        "You are an AI tracking candidate performance. Update the candidate profile JSON based on the latest exchange.\n"
        "Output ONLY valid JSON:\n"
        '{"weak_areas": [], "strong_areas": [], "communication_score": 0}'
    )
    user_content = f"CURRENT MEMORY: {current_memory}\nINTERVIEWER: {last_interviewer_msg}\nCANDIDATE: {last_candidate_msg}"
    
    client = _get_openai_client()
    model_name = settings.NVIDIA_MODEL if settings.LLM_PROVIDER == "nvidia" else settings.GROQ_MODEL
    try:
        def _do_call():
            return client.chat.completions.create(
                model=model_name,
                messages=[{"role": "system", "content": prompt}, {"role": "user", "content": user_content}],
                response_format={"type": "json_object"},
                temperature=0.3
            )
        resp = await asyncio.to_thread(_do_call)
        return resp.choices[0].message.content or current_memory
    except Exception as e:
        logger.error(f"Rolling memory update failed: {e}")
        return current_memory



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
    company_tier: str | None = "other",
    token: str | None = None,
    type: str = "technical",
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
    question_count = len([
        m for m in chat_history
        if (m["role"] == "interviewer" and m.get("type") == "question")
    ])
    active_session_key = f"{current_user.id}:{session_id}"

    system_prompt = _build_interview_system_prompt(
        role,
        company,
        company_style or "",
        company_tier or "other",
        type
    )

    import time as _time
    _purge_stale_sessions()  # Cleanup stale sessions on every new connection

    if active_session_key not in active_sessions:
        active_sessions[active_session_key] = {
            "history": chat_history,
            "question_count": question_count,
            "system_prompt": system_prompt,
            "rolling_summary": '{"weak_areas": [], "strong_areas": [], "communication_score": 100}',
            "created_at": _time.time(),  # Track creation time for stale purge
        }

    session_data = active_sessions[active_session_key]
    
    async def _update_rolling_memory_bg(key, current, c_msg, i_msg):
        new_mem = await _update_rolling_memory(current, c_msg, i_msg)
        if key in active_sessions:
            active_sessions[key]["rolling_summary"] = new_mem

    # ── Send first question if new session ────────────────────────────────
    if not session_data["history"]:
        first_msg = [{"role": "user", "content": f"I am a candidate for the {role} position at {company}. Start the interview. Ask me the first question."}]

        # Stream the first question in real-time
        msg_content = await _stream_llm_response(first_msg, websocket, system_prompt)

        if not msg_content:
            await _safe_close(websocket)
            return

        session_data["history"].append({
            "role": "interviewer",
            "type": "question",
            "content": msg_content
        })
        session_data["question_count"] += 1

        session.chat_history = session_data["history"]
        db.commit()

        # Send the complete message (for clients that don't support streaming)
        await _safe_send_json(websocket, {"role": "interviewer", "type": "question", "content": msg_content})

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

            # Enforce current phase strictly and inject rolling memory
            current_phase = session_data["question_count"] + 1
            if current_phase <= 7:
                rolling = session_data.get("rolling_summary", "")
                llm_messages.append({
                    "role": "system",
                    "content": (
                        f"ROLLING CANDIDATE PROFILE MEMORY: {rolling}\n"
                        f"CRITICAL INSTRUCTION: You are currently on Question {current_phase} of 7. "
                        f"First, provide a brief (1-2 sentences) direct feedback or review of the candidate's previous response "
                        f"(e.g., whether it was correct, optimal, or how to improve). "
                        f"Then, formulate and ask your next question based strictly on Phase {current_phase} of the INTERVIEW FLOW defined in your system prompt. "
                        f"Do not skip phases. Keep the entire response concise (under 4 sentences total) and ready for voice synthesis."
                    )
                })

            # ── FEEDBACK MODE (after 7 questions) ─────────────────────────
            if session_data["question_count"] >= TOTAL_INTERVIEW_QUESTIONS:
                session.status = "completed"
                session.completed_at = datetime.now(timezone.utc)

                feedback_prompt = _build_feedback_system_prompt(role, company)
                feedback_msgs = [{"role": "user", "content": f"Interview transcript:\n{json.dumps(session_data['history'])}"}]

                msg_content = await _stream_llm_response(feedback_msgs, websocket, feedback_prompt)

                session_data["history"].append({
                    "role": "interviewer",
                    "type": "feedback",
                    "content": msg_content
                })
                session.chat_history = session_data["history"]
                session.score = _extract_interview_score(msg_content)
                db.commit()

                await _safe_send_json(websocket, {"role": "interviewer", "type": "feedback", "content": msg_content})

                await _safe_send_json(websocket, {"role": "system", "content": "Interview Completed.", "score": session.score})
                # Give client time to process final audio/messages
                await asyncio.sleep(2)
                await _safe_close(websocket, code=1000)
                break

            # ── Normal question (streamed in real-time) ───────────────────
            msg_content = await _stream_llm_response(llm_messages, websocket, system_prompt)

            session_data["history"].append({
                "role": "interviewer",
                "type": "question",
                "content": msg_content
            })
            session_data["question_count"] += 1
            session.chat_history = session_data["history"]
            db.commit()

            # Send complete message text
            if not await _safe_send_json(websocket, {"role": "interviewer", "type": "question", "content": msg_content}):
                break

            # Trigger background memory update
            asyncio.create_task(_update_rolling_memory_bg(active_session_key, session_data["rolling_summary"], data, msg_content))

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected normally for session {session_id}")
    except Exception as e:
        logger.error(f"Unexpected WS error for session {session_id}: {type(e).__name__}: {e}", exc_info=True)
    finally:
        try:
            if session_data.get("history"):
                session.chat_history = session_data["history"]
                db.commit()
        except Exception:
            pass
        if active_session_key in active_sessions:
            del active_sessions[active_session_key]
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


@router.get("/{session_id}")
async def get_interview_details(
    session_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch full details of a specific interview session including chat history."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Interview not found")

    return {
        "id": session.id,
        "target_role": session.target_role,
        "score": session.score,
        "status": session.status,
        "created_at": session.created_at.isoformat(),
        "chat_history": session.chat_history or []
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
