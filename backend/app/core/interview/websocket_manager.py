"""
Interview WebSocket Manager — Ultra-low-latency conversational orchestrator.
Delivers real-time streaming dialogue, background Edge-TTS voice pipelining, and 360-degree performance evaluation.
"""
import json
import asyncio
from datetime import datetime, timezone
import time as _time
from typing import Optional, Dict, Any, List
from loguru import logger
from fastapi import WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState

from app.core.rate_limit import check_daily_limit, increment_usage
from app.core.activity import log_activity
from app.core.interview.session import (
    _get_user_from_token,
    build_compressed_resume_summary,
    _extract_interview_score,
    active_sessions,
    _purge_stale_sessions,
)
from app.core.interview.prompts import (
    _build_interview_system_prompt,
    _build_feedback_system_prompt,
    get_interview_phase_spec,
    get_company_domain_context,
)
from app.core.interview.llm import (
    _stream_llm_response,
    _generate_feedback_non_stream,
    _generate_json_non_stream,
)
from app.core.interview.constants import get_role_category, INTERVIEW_MODES
from app.core.interview.guardrails import (
    validate_interviewer_text,
    validate_clean_spoken_turn,
)
from app.core.interview.feedback import (
    build_structured_feedback_prompt,
    parse_feedback_report,
    render_feedback_markdown,
    combine_final_score,
)

# ── Safe WebSocket Transmission Helpers ─────────────────────────────────────

async def _safe_send_json(ws: WebSocket, payload: dict) -> bool:
    """Send JSON payload safely, return False if client disconnected."""
    try:
        if ws.client_state != WebSocketState.CONNECTED:
            return False
        await ws.send_json(payload)
        return True
    except Exception as e:
        logger.warning(f"WS send failed (client gone): {type(e).__name__}")
        return False


async def _safe_send_text(ws: WebSocket, text: str) -> bool:
    """Send raw text safely, return False if client disconnected."""
    try:
        if ws.client_state != WebSocketState.CONNECTED:
            return False
        await ws.send_text(text)
        return True
    except Exception:
        return False


async def _safe_close(ws: WebSocket, code: int = 1000) -> None:
    """Close WebSocket connection safely."""
    try:
        if ws.client_state == WebSocketState.CONNECTED:
            await ws.close(code=code)
    except Exception:
        pass


# ── Database Operations ─────────────────────────────────────────────────────

def load_initial_interview_data(session_id: str, current_user_id: str, current_user_name: str, role: str, type: str):
    from app.core.database import SessionLocal
    from app.models.models import InterviewSession, Resume
    db = SessionLocal()
    try:
        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if not session:
            try:
                check_daily_limit(current_user_id, "interview")
            except Exception as e:
                from fastapi import HTTPException
                detail = e.detail if isinstance(e, HTTPException) else str(e)
                return {"error": "limit_exceeded", "message": detail}
            session = InterviewSession(id=session_id, user_id=current_user_id, target_role=role)
            db.add(session)
            db.commit()
            db.refresh(session)
        elif session.user_id != current_user_id:
            return {"error": "unauthorized", "message": "This interview session does not belong to you."}

        chat_history = session.chat_history or []

        # Retrieve candidate's latest uploaded resume
        latest_resume = db.query(Resume).filter(
            Resume.user_id == current_user_id
        ).order_by(Resume.uploaded_at.desc()).first()

        candidate_name = current_user_name
        if latest_resume:
            if latest_resume.parsed_content and isinstance(latest_resume.parsed_content, dict):
                extracted_name = latest_resume.parsed_content.get("name") or latest_resume.parsed_content.get("candidate_name")
                if extracted_name and isinstance(extracted_name, str) and len(extracted_name.strip()) > 1:
                    candidate_name = extracted_name.strip()

        # Build compressed summary
        resume_summary = None
        if latest_resume:
            class DummyUser:
                def __init__(self, name):
                    self.name = name
            dummy_user = DummyUser(current_user_name)
            resume_summary = build_compressed_resume_summary(latest_resume, dummy_user, candidate_name=candidate_name)

        return chat_history, candidate_name, resume_summary
    finally:
        db.close()


def update_session_state(session_id: str, chat_history: list = None, status: str = None, completed_at=None, score: float = None):
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


def log_interview_start(current_user_id: str, role: str):
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        log_activity(db, current_user_id, f"Started Mock Interview for {role}", "interview")
    finally:
        db.close()


# ── Context Assembly Helpers ────────────────────────────────────────────────

def _build_llm_messages(history: list, max_turns: int = 10) -> list:
    """Build recent chat history for the interviewer LLM context."""
    selected_history = [m for m in history if m.get("role") in ("interviewer", "candidate")]
    if len(selected_history) > max_turns:
        # Keep opening exchange + recent turns
        selected_history = selected_history[:2] + selected_history[-(max_turns - 2):]

    llm_messages = []
    for msg in selected_history:
        if msg.get("content"):
            r = "assistant" if msg["role"] == "interviewer" else "user"
            llm_messages.append({"role": r, "content": msg["content"]})
    return llm_messages


# ── 360-Degree Feedback & Scorecard Generation ─────────────────────────────

async def _generate_feedback_report(
    websocket: WebSocket,
    session_id: str,
    session_data: dict,
    role: str,
    company: str,
    interview_type: str,
    provider: str,
    role_level: str = "fresher",
    total_questions: int = 6
) -> float:
    """Generates the comprehensive 360-degree scorecard upon interview conclusion."""
    completed_at_now = datetime.now(timezone.utc)

    # Format clean transcript
    clean_transcript = []
    for msg in session_data["history"]:
        role_m = msg.get("role", "")
        content = msg.get("content", "")
        msg_type = msg.get("type", "")
        if role_m == "system" or not content or msg_type == "feedback":
            continue
        label = "Interviewer" if role_m == "interviewer" else "Candidate"
        clean_transcript.append(f"{label}: {content}")
    transcript_text = "\n\n".join(clean_transcript)

    final_score = 75.0
    feedback_content = ""
    scorecard_data = None

    try:
        feedback_prompt = build_structured_feedback_prompt(
            role, company, interview_type, role_level, total_questions=total_questions
        )
        user_content = json.dumps({
            "role": role,
            "company": company,
            "interview_type": interview_type,
            "role_level": role_level,
            "transcript": transcript_text[:12000],
        }, ensure_ascii=False)

        raw = await _generate_json_non_stream(
            [{"role": "user", "content": user_content}],
            feedback_prompt,
            agent_name="interview_feedback",
            provider=provider,
            max_tokens=1400,
        )

        report = parse_feedback_report(raw)
        if report is not None:
            feedback_content = render_feedback_markdown(report)
            final_score = report.overall_score
            scorecard_data = report.model_dump()
            logger.info(f"[interview] 360 Scorecard generated successfully: score={final_score}, verdict={report.hiring_verdict}")
        else:
            logger.warning("[interview] Scorecard JSON parse failed; falling back to legacy evaluation.")
    except Exception as e:
        logger.warning(f"[interview] Structured feedback error: {e}")

    # Fallback if structured generation was empty
    if not feedback_content:
        feedback_prompt_legacy = _build_feedback_system_prompt(role, company, interview_type, role_level)
        feedback_content = await _generate_feedback_non_stream(
            [{"role": "user", "content": f"Interview transcript:\n{transcript_text}"}],
            feedback_prompt_legacy,
            provider=provider,
        )
        final_score = _extract_interview_score(feedback_content)

    # Persist in DB
    feedback_frame = {
        "role": "interviewer",
        "type": "feedback",
        "content": feedback_content,
        "scorecard": scorecard_data,
        "score": final_score
    }
    session_data["history"].append(feedback_frame)

    await asyncio.to_thread(
        update_session_state,
        session_id,
        chat_history=session_data["history"],
        status="completed",
        completed_at=completed_at_now,
        score=final_score,
    )

    # Send report frame + final completion event to client
    await _safe_send_json(websocket, feedback_frame)
    await _safe_send_json(websocket, {
        "role": "system",
        "content": "Interview Completed.",
        "score": final_score,
        "scorecard": scorecard_data
    })
    return final_score


# ── Core WebSocket Orchestrator ─────────────────────────────────────────────

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
    role_level: str = "fresher",
    mode: str = "full_mock",
    topic_focus: str = "",
    db: Any = None
):
    """Orchestrates real-time conversational streaming, audio pipelining, and state."""
    active_session_key = None
    session_data = None

    from app.core.database import SessionLocal
    temp_db = SessionLocal()
    try:
        current_user = _get_user_from_token(token, temp_db)
        if current_user:
            current_user_id = str(current_user.id)
            current_user_name = current_user.name
        else:
            current_user_id = None
            current_user_name = None
    finally:
        temp_db.close()

    if not current_user_id:
        await websocket.accept()
        await _safe_send_json(websocket, {
            "role": "system",
            "type": "error",
            "content": "Authentication required. Please log in again to practice mock interviews.",
        })
        await _safe_close(websocket, code=1008)
        logger.warning(f"[interview] WebSocket auth rejected for session {session_id} - missing or invalid JWT.")
        return

    await websocket.accept()
    logger.info(f"[interview] WebSocket client accepted for session {session_id} (user={current_user_id}, role={role}, company={company})")
    if not await _safe_send_json(websocket, {"role": "system", "content": "Connected. Preparing your interview..."}):
        logger.info(f"Client disconnected immediately after accept for session {session_id}. Aborting.")
        return

    # Load session data
    res = await asyncio.to_thread(load_initial_interview_data, session_id, current_user_id, current_user_name, role, type)
    if isinstance(res, dict) and res.get("error") == "limit_exceeded":
        await _safe_send_json(websocket, {
            "role": "system",
            "type": "rate_limit",
            "content": res.get("message", "Your daily interview limit has been reached."),
        })
        await _safe_close(websocket, code=1013)
        return
    if isinstance(res, dict) and res.get("error") == "unauthorized":
        await _safe_send_json(websocket, {
            "role": "system",
            "type": "error",
            "content": res.get("message", "Unauthorized session access."),
        })
        await _safe_close(websocket, code=1008)
        return

    chat_history, candidate_name, resume_summary = res
    question_count = len([
        m for m in chat_history
        if (m.get("role") == "interviewer" and m.get("type") in ("question", "first_question"))
    ])

    # Calibrate total questions based on selected mode
    mode_config = INTERVIEW_MODES.get(mode, INTERVIEW_MODES["full_mock"])
    total_questions = mode_config["default_questions"]

    active_session_key = f"{current_user_id}:{session_id}"

    system_prompt = _build_interview_system_prompt(
        role=role,
        company=company,
        company_style=company_style or "",
        company_tier=company_tier or "other",
        interview_type=type,
        resume_summary=resume_summary,
        candidate_name=candidate_name,
        session_id=session_id,
        role_level=role_level,
        mode=mode,
        topic_focus=topic_focus,
        total_questions=total_questions
    )

    _purge_stale_sessions()

    if active_session_key not in active_sessions:
        active_sessions[active_session_key] = {
            "history": chat_history,
            "question_count": question_count,
            "total_questions": total_questions,
            "system_prompt": system_prompt,
            "mode": mode,
            "topic_focus": topic_focus,
            "created_at": _time.time(),
            "role_level": role_level,
        }

    session_data = active_sessions[active_session_key]

    # ── Background Edge-TTS Worker ──────────────────────────────────────────
    persistent_tts_queue = asyncio.Queue()

    async def _persistent_tts_worker():
        while True:
            try:
                paragraph = await asyncio.wait_for(persistent_tts_queue.get(), timeout=180)
            except asyncio.TimeoutError:
                break
            if paragraph is None:
                persistent_tts_queue.task_done()
                break
            if paragraph.strip():
                try:
                    from app.core.voice.voice_engine import generate_audio_base64
                    audio_result = await generate_audio_base64(paragraph)
                    if audio_result and audio_result.get("audio"):
                        await _safe_send_json(websocket, {
                            "role": "interviewer",
                            "audio": audio_result["audio"],
                            "fragment": True
                        })
                except Exception as e:
                    logger.error(f"TTS pipeline error: {e}")
            persistent_tts_queue.task_done()

    tts_worker_task = asyncio.create_task(_persistent_tts_worker())

    # ── Send Opening Question if New Session ────────────────────────────────
    if not session_data["history"]:
        phase_1 = get_interview_phase_spec(
            1, total_questions, mode=mode, topic_focus=topic_focus,
            interview_type=type, role=role, company=company, role_level=role_level
        )
        first_user_prompt = (
            f"I am ready to begin the {role} interview at {company} (Seniority: {role_level}).\n"
            f"CURRENT PHASE: {phase_1['phase_title']}\n"
            f"PHASE OBJECTIVE: {phase_1['phase_goal']}\n"
            f"TARGET CONCEPTS: {phase_1['concept_guidance']}\n"
            f"COMPANY DOMAIN: Frame the context around {phase_1['company_context']} (assessing '{phase_1['principle']}').\n\n"
            f"INSTRUCTIONS FOR YOUR OPENING TURN:\n"
            f"1. Give a warm, realistic one-sentence welcome as an interviewer at {company}.\n"
            f"2. Ask your opening question strictly addressing {phase_1['phase_title']} ({phase_1['concept_guidance']}).\n"
            f"3. Ask EXACTLY ONE question. Do not bundle multiple sub-questions.\n"
            f"4. Keep your entire spoken response under 35-45 words total for natural spoken audio."
        )
        if websocket.client_state != WebSocketState.CONNECTED:
            logger.info(f"WebSocket client not connected for session {session_id}. Aborting before opening turn.")
            return

        first_msg = [{"role": "user", "content": first_user_prompt}]

        try:
            msg_content = await _stream_llm_response(
                first_msg, websocket, system_prompt, provider=provider, tts_queue=persistent_tts_queue
            )
        except Exception as e:
            logger.error(f"Opening interview turn failed: {e}")
            await _safe_send_json(websocket, {"role": "system", "content": "Failed to start interview. Please retry."})
            await _safe_close(websocket, code=1011)
            return

        if websocket.client_state != WebSocketState.CONNECTED:
            logger.info(f"WebSocket client closed during opening stream for session {session_id}. Aborting.")
            return

        if not msg_content:
            msg_content = f"Hello {candidate_name}, welcome to your {company} mock interview! To begin, could you briefly introduce yourself and walk me through a technical system or architecture you recently designed?"

        session_data["history"].append({
            "role": "interviewer",
            "type": "question",
            "content": msg_content,
            "question_number": 1,
            "total_questions": total_questions,
            "phase_title": phase_1["phase_title"],
            "company_principle_alignment": phase_1["principle"],
        })
        session_data["question_count"] = 1

        await asyncio.to_thread(update_session_state, session_id, chat_history=session_data["history"])

        # Send frame confirmation with progress and phase
        await _safe_send_json(websocket, {
            "role": "interviewer",
            "type": "question",
            "content": msg_content,
            "question_number": 1,
            "total_questions": total_questions,
            "phase_title": phase_1["phase_title"],
            "company_principle_alignment": phase_1["principle"],
        })

        if websocket.client_state == WebSocketState.CONNECTED:
            increment_usage(current_user_id, "interview")
            await asyncio.to_thread(log_interview_start, current_user_id, role)

    # ── Conversational Streaming Loop ───────────────────────────────────────
    try:
        while True:
            raw_incoming = await websocket.receive_text()

            if raw_incoming == "__ping__":
                await _safe_send_text(websocket, "__pong__")
                continue

            raw_incoming = raw_incoming.strip()
            if not raw_incoming:
                continue

            # Parse action or text
            conclude_early = False
            candidate_text = raw_incoming

            if raw_incoming.startswith("{") and raw_incoming.endswith("}"):
                try:
                    parsed_incoming = json.loads(raw_incoming)
                    if parsed_incoming.get("action") in ("conclude_early", "wrap_up"):
                        conclude_early = True
                    candidate_text = parsed_incoming.get("content") or parsed_incoming.get("text") or candidate_text
                except Exception:
                    pass

            if raw_incoming in ("__conclude__", "wrap_up_early"):
                conclude_early = True

            # Append candidate response to transcript
            if candidate_text and not conclude_early:
                session_data["history"].append({"role": "candidate", "content": candidate_text})
                await asyncio.to_thread(update_session_state, session_id, chat_history=session_data["history"])

            curr_q = session_data.get("question_count", 1)
            is_final_turn = conclude_early or (curr_q >= total_questions)

            # Build recent transcript for context
            transcript_messages = _build_llm_messages(session_data["history"])

            if is_final_turn:
                # ── Concluding turn ──────────────────────────────────────────
                conclude_turn_prompt = (
                    f"{system_prompt}\n\n"
                    "CURRENT STAGE: FINAL WRAP-UP & CONCLUSION.\n"
                    "INSTRUCTIONS:\n"
                    "1. Acknowledge the candidate's last answer in 1 sentence.\n"
                    "2. Thank them warmly for their time and state that you have all the information needed to evaluate their performance.\n"
                    "3. Inform them that you are now preparing their comprehensive 360-degree performance scorecard.\n"
                    "4. Do NOT ask any further questions."
                )

                await _safe_send_json(websocket, {"role": "system", "content": "Interview concluding..."})

                msg_content = await _stream_llm_response(
                    transcript_messages, websocket, conclude_turn_prompt, provider=provider, tts_queue=persistent_tts_queue
                )
                if not msg_content:
                    msg_content = "Thank you for your time today! That concludes our interview session. I'll now assemble your detailed performance scorecard."

                session_data["history"].append({
                    "role": "interviewer",
                    "type": "concluding",
                    "content": msg_content,
                    "question_number": curr_q,
                    "total_questions": total_questions,
                })
                await _safe_send_json(websocket, {
                    "role": "interviewer",
                    "type": "concluding",
                    "content": msg_content,
                    "question_number": curr_q,
                    "total_questions": total_questions,
                })

                await asyncio.sleep(2)  # Allow final audio chunk to buffer

                # Generate 360 Scorecard
                await _generate_feedback_report(
                    websocket, session_id, session_data, role, company, type, provider,
                    role_level=role_level, total_questions=total_questions
                )

                await asyncio.sleep(2)
                await _safe_close(websocket, code=1000)
                break

            else:
                # ── Regular Question Turn ────────────────────────────────────
                next_q = curr_q + 1
                phase_spec = get_interview_phase_spec(
                    next_q, total_questions, mode=mode, topic_focus=topic_focus,
                    interview_type=type, role=role, company=company, role_level=role_level
                )
                turn_prompt = (
                    f"{system_prompt}\n\n"
                    f"CURRENT INTERVIEW PHASE: Question {next_q} of {total_questions} — {phase_spec['phase_title']}\n"
                    f"PHASE OBJECTIVE: {phase_spec['phase_goal']}\n"
                    f"TARGET CONCEPTS: {phase_spec['concept_guidance']}\n"
                    f"COMPANY CONTEXT ({company}): Ground this question in {phase_spec['company_context']} (assessing '{phase_spec['principle']}').\n\n"
                    f"INSTRUCTIONS FOR THIS TURN:\n"
                    f"1. Give a natural, realistic 1-2 sentence reaction to the candidate's previous response (acknowledge specific points they made).\n"
                    f"2. Transition into the CURRENT PHASE: Ask your next technical/behavioral question strictly focused on: {phase_spec['concept_guidance']}.\n"
                    f"3. Calibrate question complexity appropriately for a {role_level} candidate.\n"
                    f"4. Ask EXACTLY ONE question. Do not bundle multiple sub-questions.\n"
                    f"5. Keep the total spoken turn under 35-45 words total for crisp, fluid audio."
                )

                msg_content = await _stream_llm_response(
                    transcript_messages, websocket, turn_prompt, provider=provider, tts_queue=persistent_tts_queue
                )

                if not msg_content:
                    msg_content = f"Thank you for that response. Moving forward to question {next_q}: in the context of {company}'s architecture, how would you address {phase_spec['concept_guidance']}?"

                session_data["history"].append({
                    "role": "interviewer",
                    "type": "question",
                    "content": msg_content,
                    "question_number": next_q,
                    "total_questions": total_questions,
                    "phase_title": phase_spec["phase_title"],
                    "company_principle_alignment": phase_spec["principle"],
                })
                session_data["question_count"] = next_q

                await asyncio.to_thread(update_session_state, session_id, chat_history=session_data["history"])

                # Send frame
                await _safe_send_json(websocket, {
                    "role": "interviewer",
                    "type": "question",
                    "content": msg_content,
                    "question_number": next_q,
                    "total_questions": total_questions,
                    "phase_title": phase_spec["phase_title"],
                    "company_principle_alignment": phase_spec["principle"],
                })

    except (WebSocketDisconnect, RuntimeError):
        logger.info(f"WebSocket client disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error in interview {session_id}: {e}", exc_info=True)
    finally:
        try:
            if persistent_tts_queue:
                await persistent_tts_queue.put(None)
                await asyncio.wait_for(tts_worker_task, timeout=5)
        except Exception:
            if not tts_worker_task.done():
                tts_worker_task.cancel()
        try:
            if session_data and session_data.get("history"):
                await asyncio.to_thread(update_session_state, session_id, chat_history=session_data["history"])
        except Exception:
            pass
        if active_session_key in active_sessions:
            del active_sessions[active_session_key]
        logger.info(f"Session {session_id} cleanup finished.")