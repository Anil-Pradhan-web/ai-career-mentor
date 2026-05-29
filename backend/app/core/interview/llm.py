import asyncio
import re
from loguru import logger
from starlette.websockets import WebSocket
from openai import OpenAI

from app.core.config import settings
from app.core.voice_engine import generate_audio_base64


def _get_openai_client(provider: str = "nvidia"):
    """Get an OpenAI-compatible client for NVIDIA or GROQ."""
    if provider == "nvidia":
        return OpenAI(
            api_key=settings.NVIDIA_API_KEY,
            base_url="https://integrate.api.nvidia.com/v1",
        )
    return OpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )


async def _safe_send_json_local(ws: WebSocket, payload: dict) -> bool:
    """Send JSON payload safely without throwing exceptions on closed sockets."""
    try:
        await ws.send_json(payload)
        return True
    except Exception as e:
        logger.warning(f"Local WS send failed in LLM module: {e}")
        return False


async def _stream_llm_response(messages: list[dict], ws: WebSocket, system_prompt: str, provider: str = "nvidia") -> str:
    """
    Stream LLM response word-by-word over WebSocket for real-time feel.
    INCREMENTAL TTS: Buffers sentences and streams audio concurrently.
    """
    providers_to_try = ["nvidia", "groq"]
    stream = None
    last_err = None

    for active_provider in providers_to_try:
        try:
            client = _get_openai_client(active_provider)
            model_name = settings.NVIDIA_MODEL if active_provider == "nvidia" else settings.GROQ_MODEL
            full_msgs = [{"role": "system", "content": system_prompt}] + messages

            def _do_stream(cl=client, md=model_name):
                return cl.chat.completions.create(
                    model=md,
                    messages=full_msgs,
                    temperature=0.65,
                    max_tokens=800,
                    stream=True,
                )

            stream = await asyncio.to_thread(_do_stream)
            logger.info(f"Successfully initiated interview stream with provider: {active_provider}")
            break
        except Exception as e:
            logger.warning(f"Interview stream failed to initiate with provider {active_provider}: {e}")
            last_err = e

    if stream is None:
        logger.error(f"All providers failed to stream LLM response. Last error: {last_err}")
        raise last_err


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
                        await _safe_send_json_local(ws, {
                            "role": "interviewer", 
                            "audio": audio_result["audio"], 
                            "fragment": True
                        })
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
                if not await _safe_send_json_local(ws, {"role": "interviewer_stream", "content": text_to_send}):
                    break
                chunk_buffer = " ".join(words[CHUNK_SIZE:])
            
            # Sentence buffering for TTS
            if any(p in sentence_buffer for p in ['. ', '? ', '! ', '\n']):
                match = re.search(r'([.?!]\s+|\n+)', sentence_buffer)
                if match:
                    idx = match.end()
                    sentence = sentence_buffer[:idx].strip()
                    sentence_buffer = sentence_buffer[idx:]
                    if len(sentence) > 2:
                        await tts_queue.put(sentence)

    # Flush remaining text
    if chunk_buffer.strip():
        await _safe_send_json_local(ws, {"role": "interviewer_stream", "content": chunk_buffer})
    
    # Flush remaining sentence
    if sentence_buffer.strip():
        await tts_queue.put(sentence_buffer.strip())

    # Stop TTS worker
    await tts_queue.put(None)
    await worker_task

    return full_response.strip()
