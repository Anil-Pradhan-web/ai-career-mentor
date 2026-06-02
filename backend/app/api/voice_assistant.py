# Copyright (c) 2026 Anil Pradhan. All rights reserved.
import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, status
from loguru import logger
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.config import settings
from app.core.database import get_db
from app.models.models import User, Resume, CareerRoadmap, MarketAnalysis
from app.core.security import SECRET_KEY, ALGORITHM
from app.core.activity import log_activity

import websockets

from app.core.rate_limit import get_usage, increment_usage, DAILY_LIMITS

# Maximum call duration in seconds (7.5 minutes)
MAX_CALL_DURATION = 450

router = APIRouter()


def _summarize_market_context(record: MarketAnalysis | None) -> str:
    if not record:
        return "Not researched yet"

    analysis = record.analysis or {}
    def first_items(value, limit: int):
        return value[:limit] if isinstance(value, list) else []

    salary = analysis.get("salary_range")
    if isinstance(salary, dict):
        salary = salary.get("formatted") or salary

    market_context = {
        "target_role": record.target_role,
        "location": analysis.get("location") or record.location,
        "market_trend": analysis.get("market_trend"),
        "salary_range": salary,
        "hiring_volume": analysis.get("hiring_volume"),
        "top_companies": first_items(
            analysis.get("hiring_companies")
            or analysis.get("top_companies")
            or analysis.get("company_hiring_stats")
            or [],
            5,
        ),
        "top_skills": first_items(
            analysis.get("top_skills_freq")
            or analysis.get("top_skills")
            or [],
            8,
        ),
        "summary": analysis.get("summary") or analysis.get("market_summary"),
    }

    return json.dumps(market_context, ensure_ascii=False)[:2000]

@router.websocket("/ws")
async def voice_assistant_ws(
    websocket: WebSocket,
    token: str = None,
    db: Session = Depends(get_db)
):
    """
    Production-grade Secure WebSocket Proxy for Gemini Multimodal Live API.
    Anya persona - Cute/sweet Hinglish AI career coach.
    """
    logger.info("Incoming Voice Assistant WebSocket connection request.")
    
    # 1. Authenticate Token
    if not token:
        logger.warning("Rejected Voice Assistant WS: Missing token parameter")
        await websocket.accept()
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Missing token")
        return

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id or payload.get("type") == "refresh":
            logger.warning("Rejected Voice Assistant WS: Invalid token signature or refresh token used")
            await websocket.accept()
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
            return
    except JWTError as e:
        logger.warning(f"Rejected Voice Assistant WS: JWT decode failed - {e}")
        await websocket.accept()
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
        return

    # 2. Fetch User & Context
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.warning(f"Rejected Voice Assistant WS: User {user_id} not found in database")
        await websocket.accept()
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="User not found")
        return

    logger.info(f"Voice Assistant session starting for user: {user.name} ({user.email})")

    # ── Rate Limit Check (before accepting the WebSocket) ──────────────────
    if not settings.DEBUG:
        voice_limit = 2
        voice_usage = get_usage(user.id, "voice_assistant")
        if voice_usage >= voice_limit:
            logger.warning(f"Voice Assistant rate limit reached for user {user.name} ({voice_usage}/{voice_limit})")
            await websocket.accept()
            await websocket.send_json({
                "type": "error",
                "message": f"Voice call limit reached ({voice_usage}/{voice_limit} calls / 5 min). Try again in 5 minutes."
            })
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Rate limit exceeded")
            return

    # Fetch latest resume
    latest_resume = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.uploaded_at.desc()).first()
    resume_details = "Not provided yet"
    if latest_resume and latest_resume.parsed_content:
        try:
            # Concise summary to keep context window neat
            resume_details = json.dumps(latest_resume.parsed_content)[:2000]
        except Exception as e:
            logger.error(f"Error serializing resume context for Voice Assistant: {e}")

    # Fetch latest roadmap
    latest_roadmap = db.query(CareerRoadmap).filter(CareerRoadmap.user_id == user.id).order_by(CareerRoadmap.created_at.desc()).first()
    roadmap_details = "Not started yet"
    target_role = "Software Engineer"
    if latest_roadmap:
        target_role = latest_roadmap.target_role or target_role
        if latest_roadmap.steps:
            try:
                steps_summary = []
                for step in latest_roadmap.steps:
                    week = step.get("week", "")
                    topics = ", ".join(step.get("topics", []))
                    steps_summary.append(f"Week {week}: {topics}")
                roadmap_details = "; ".join(steps_summary)[:2000]
            except Exception as e:
                logger.error(f"Error serializing roadmap context for Voice Assistant: {e}")

    # Fetch latest market analysis so Anya knows the user's target location and hiring context
    latest_market = None
    market_details = "Not researched yet"
    try:
        latest_market = db.query(MarketAnalysis).filter(MarketAnalysis.user_id == user.id).order_by(MarketAnalysis.created_at.desc()).first()
        market_details = _summarize_market_context(latest_market)
    except Exception as e:
        logger.error(f"Error loading market context for Voice Assistant: {e}")
    if latest_market and not latest_roadmap:
        target_role = latest_market.target_role or target_role

    # 3. Formulate System Prompt
    system_prompt = f"""
You are Anya, a realtime AI Career Mentor from India having a natural voice conversation with the user.

Current user context:
- Name: {user.name}
- Target Role: {target_role}
- Resume Context: {resume_details}
- Learning Roadmap: {roadmap_details}
- Market & Location Context: {market_details}

Conversation behavior:
- Speak naturally like a real human mentor during a live voice call.
- Use casual Hinglish naturally. Mix Hindi and English fluidly instead of forcing full Hindi sentences.
- For simple or short user inputs, keep responses brief, conversational, and real-time friendly (usually 1-2 sentences, a few words).
- If the user asks a detailed, deep, or long question, or specifically asks for depth/explanations, provide a detailed, comprehensive, and longer response as appropriate for a thorough explanation, but still maintain a natural spoken rhythm.
- Avoid sounding robotic, overly formal, overly motivational, or repetitive.
- Do not repeatedly use the user's name in every response. Use it occasionally and naturally.
- Do not repeat the same encouragement phrases again and again.
- Speak like an experienced senior helping a junior developer casually over a voice call.
- If the user sounds confused, explain calmly using simple examples.
- If the user interrupts, immediately stop the current flow and respond to the new query naturally.
- Never use bullet points, numbered lists, markdown, or long paragraphs in spoken response.
- Keep the flow emotionally natural and realistic instead of overly sweet or dramatic.
- Use the resume, roadmap, market, and location context only when relevant to the current conversation.

Your goal is to feel like a realtime intelligent career companion, not a scripted chatbot.
"""
    # 4. Accept Client WebSocket
    await websocket.accept()
    try:
        from app.core.observability import track_active_websocket
        track_active_websocket("connect")
    except Exception:
        pass

    # ── Increment usage counter on successful connection ───────────────────
    if not settings.DEBUG:
        new_count = increment_usage(user.id, "voice_assistant")
        logger.info(f"Voice Assistant usage incremented for user {user.name}: {new_count}/2")
    log_activity(db, str(user.id), "Voice Call with Anya", "voice_assistant")

    # Verify Google API Key
    if not settings.GOOGLE_API_KEY:
        logger.error("GOOGLE_API_KEY is not configured in environment variables.")
        await websocket.send_json({"type": "error", "message": "Google API configuration error."})
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
        return

    # Connect to Gemini Multimodal Live API WebSocket
    gemini_uri = f"wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key={settings.GOOGLE_API_KEY}"
    
    logger.info("Connecting to Gemini Multimodal Live API WebSocket...")
    try:
        async with websockets.connect(gemini_uri) as gemini_ws:
            logger.info("Connected to Gemini Multimodal Live API successfully.")
            
            # Send setup configuration
            setup_msg = {
                "setup": {
                    "model": "models/gemini-2.5-flash-native-audio-latest",
                    "generationConfig": {
                        "responseModalities": ["AUDIO"],
                        "speechConfig": {
                            "voiceConfig": {
                                "prebuiltVoiceConfig": {
                                    "voiceName": "Aoede"
                                }
                            }
                        }
                    },
                    "systemInstruction": {
                        "parts": [
                            {
                                "text": system_prompt
                            }
                        ]
                    }
                }
            }
            await gemini_ws.send(json.dumps(setup_msg))
            logger.info("Sent setup config to Gemini Live API.")

            # Relay tasks
            async def relay_client_to_gemini():
                try:
                    async for message in websocket.iter_text():
                        try:
                            payload = json.loads(message)
                            msg_type = payload.get("type")
                            
                            if msg_type == "audio":
                                # Client sends: {"type": "audio", "data": "base64encodedPCM"}
                                audio_data = payload.get("data")
                                if audio_data:
                                    gemini_audio_msg = {
                                        "realtimeInput": {
                                            "mediaChunks": [
                                                {
                                                    "mimeType": "audio/pcm;rate=16000",
                                                    "data": audio_data
                                                }
                                            ]
                                        }
                                    }
                                    await gemini_ws.send(json.dumps(gemini_audio_msg))
                            elif msg_type == "interrupt":
                                # Client signals interruption when user starts speaking
                                logger.info("User interrupted AI. Relaying interrupt signal to Gemini.")
                                interrupt_msg = {
                                    "clientContent": {
                                        "turns": [],
                                        "turnComplete": False
                                    }
                                }
                                await gemini_ws.send(json.dumps(interrupt_msg))
                        except json.JSONDecodeError:
                            logger.warning("Received invalid JSON from client")
                        except Exception as e:
                            logger.error(f"Error handling client message: {e}")
                            if isinstance(e, websockets.exceptions.ConnectionClosed) or (gemini_ws and gemini_ws.closed):
                                raise e
                except WebSocketDisconnect:
                    logger.info("Client WebSocket disconnected.")
                except Exception as e:
                    if "WebSocket is not connected" in str(e) or "accept" in str(e):
                        logger.info("Client WebSocket disconnected before acceptance completed.")
                    else:
                        logger.error(f"Client to Gemini relay error: {e}")

            async def relay_gemini_to_client():
                try:
                    async for raw_message in gemini_ws:
                        try:
                            response = json.loads(raw_message)
                            
                            # Handle Gemini Server Content
                            server_content = response.get("serverContent", {})
                            if "interrupted" in server_content:
                                # Relayout interrupt event to client
                                await websocket.send_json({"type": "interrupted"})
                                continue

                            model_turn = server_content.get("modelTurn", {})
                            parts = model_turn.get("parts", [])
                            for part in parts:
                                if "text" in part:
                                    # Send transcript chunk
                                    await websocket.send_json({
                                        "type": "transcript",
                                        "text": part["text"]
                                    })
                                if "inlineData" in part:
                                    # Send audio chunk (usually 24kHz PCM)
                                    await websocket.send_json({
                                        "type": "audio",
                                        "data": part["inlineData"]["data"]
                                    })
                        except Exception as e:
                            # Do not log benign write errors after client disconnect
                            if isinstance(e, RuntimeError) and ("ASGI" in str(e) or "websocket.send" in str(e)):
                                continue
                            logger.error(f"Error processing message from Gemini: {e}")
                except Exception as e:
                    # Do not log benign write errors after client disconnect
                    if isinstance(e, RuntimeError) and ("ASGI" in str(e) or "websocket.send" in str(e)):
                        pass
                    else:
                        logger.error(f"Gemini to Client relay error: {e}")

            # Auto-disconnect timer to enforce max call duration
            async def auto_disconnect_timer():
                await asyncio.sleep(MAX_CALL_DURATION)
                logger.info(f"Voice call auto-disconnecting after {MAX_CALL_DURATION}s for user {user.name}")
                try:
                    await websocket.send_json({
                        "type": "time_limit",
                        "message": f"Call time limit reached ({MAX_CALL_DURATION // 60}m {MAX_CALL_DURATION % 60}s). Please start a new call."
                    })
                    await websocket.close(code=1000, reason="Call duration limit reached")
                except Exception:
                    pass

            # Create tasks
            client_task = asyncio.create_task(relay_client_to_gemini())
            gemini_task = asyncio.create_task(relay_gemini_to_client())
            timer_task = asyncio.create_task(auto_disconnect_timer())

            # Wait for the first task to finish
            done, pending = await asyncio.wait(
                [client_task, gemini_task, timer_task],
                return_when=asyncio.FIRST_COMPLETED
            )

            # Cancel remaining tasks
            for task in pending:
                task.cancel()

            # Propagate any exception from completed tasks to trigger correct cleanup blocks
            for task in done:
                if not task.cancelled():
                    exc = task.exception()
                    if exc:
                        raise exc

    except websockets.exceptions.ConnectionClosed as e:
        logger.warning(f"Gemini Live API WebSocket connection closed: {e}")
        try:
            await websocket.send_json({"type": "error", "message": "Gemini connection closed."})
        except Exception:
            pass
    except Exception as e:
        if "WebSocket is not connected" in str(e) or "accept" in str(e):
            logger.info(f"Failed to connect or maintain Gemini Live API session: {e}")
        else:
            logger.error(f"Failed to connect or maintain Gemini Live API session: {e}")
        try:
            await websocket.send_json({"type": "error", "message": "Failed to connect to Gemini Live API."})
        except Exception:
            pass
    finally:
        logger.info(f"Voice Assistant session ended for user {user.name}")
        try:
            from app.core.observability import track_active_websocket
            track_active_websocket("disconnect")
        except Exception:
            pass
        try:
            await websocket.close()
        except Exception:
            pass
