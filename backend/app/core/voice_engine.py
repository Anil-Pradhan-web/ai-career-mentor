import os
import base64
import asyncio
import edge_tts
import tempfile
import re
from app.core.config import settings
from loguru import logger

# ── Voice Config ──────────────────────────────────────────────────────────────
VOICE_NAME = "en-IN-PrabhatNeural" # Professional Indian-English (Male)
SPEECH_RATE = "+10%"              # Faster for natural flow
MAX_TTS_CHARS = 750               # Truncation limit
TTS_TIMEOUT = 12                  # Max wait time for generation
TTS_SEMAPHORE = asyncio.Semaphore(2)
TTS_CACHE = {}


async def generate_audio_base64(text: str, voice: str = VOICE_NAME) -> dict:
    """
    Generates speech audio from text using Edge-TTS and returns it as a base64 string
    with metadata. Uses a semaphore to limit concurrency and a cache for efficiency.
    """
    # 1. CLEANING & NOISE REMOVAL
    clean_text = text
    # Remove markdown
    clean_text = re.sub(r'[*#_~`]', '', clean_text)
    # Remove URLs
    clean_text = re.sub(r'https?://\S+', '', clean_text)
    # Remove code blocks
    clean_text = re.sub(r'```.*?```', '', clean_text, flags=re.DOTALL)
    # Remove excessive whitespace
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()

    # Skip tiny text
    if len(clean_text) < 8:
        return {"audio": "", "voice": voice, "format": "mp3"}

    # 2. SMART TRUNCATION (By Sentences)
    if len(clean_text) > MAX_TTS_CHARS:
        sentences = re.split(r'(?<=[.!?]) +', clean_text)
        final_text = ""
        for s in sentences:
            if len(final_text + s) > MAX_TTS_CHARS:
                break
            final_text += s + " "
        clean_text = final_text.strip()

    # 3. CACHING CHECK (Bypass in DEBUG mode for local testing)
    cache_key = f"{voice}:{clean_text}:{SPEECH_RATE}"
    if not settings.DEBUG and cache_key in TTS_CACHE:
        return TTS_CACHE[cache_key]

    # 4. GENERATION WITH CONCURRENCY LIMIT
    async with TTS_SEMAPHORE:
        temp_path = None
        try:
            # Create a temporary file to store the audio
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
                temp_path = f.name

            # Generate audio using edge-tts
            communicate = edge_tts.Communicate(
                text=clean_text, 
                voice=voice,
                rate=SPEECH_RATE,
                volume="+0%"
            )
            
            await asyncio.wait_for(
                communicate.save(temp_path), 
                timeout=TTS_TIMEOUT
            )

            # Read the file and encode to base64
            with open(temp_path, "rb") as audio_file:
                audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')

            result = {
                "audio": audio_base64,
                "voice": voice,
                "format": "mp3"
            }

            # Update cache (limit size to 100 entries, only in non-DEBUG mode)
            if not settings.DEBUG:
                if len(TTS_CACHE) > 100:
                    TTS_CACHE.clear()
                TTS_CACHE[cache_key] = result

            return result

        except Exception:
            logger.exception(f"TTS Generation failed for text snippet: {clean_text[:50]}...")
            return {"audio": "", "voice": voice, "format": "mp3"}
        finally:
            # Cleanup temp file
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass
