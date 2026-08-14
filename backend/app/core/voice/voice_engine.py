import base64
import asyncio
import edge_tts
import re
from app.core.config import settings
from loguru import logger

# ── Voice Config ──────────────────────────────────────────────────────────────
VOICE_NAME = "en-US-AndrewNeural" # Premium Professional US-English (Male)
SPEECH_RATE = "-5%"               # Standard rate for Andrew (already professional)
MAX_TTS_CHARS = 2000               # Truncation limit (increased for feedback)
TTS_TIMEOUT = 60                  # Per-attempt timeout — 60s for longer paragraphs
TTS_SEMAPHORE = asyncio.Semaphore(2)  # Allow 2 concurrent TTS calls for pipelining
TTS_MAX_RETRIES = 3                # Retry transient NoAudioReceived errors
TTS_CACHE = {}
TTS_CACHE_MAX_ENTRIES = 80
TTS_CACHE_MAX_BYTES = 50 * 1024 * 1024  # 50MB max cache size
_tts_cache_bytes = 0


async def generate_audio_base64(text: str, voice: str = VOICE_NAME) -> dict:
    """
    Generates speech audio from text using Edge-TTS and returns it as a base64 string
    with metadata. Uses a semaphore to limit concurrency and a cache for efficiency.
    Includes retry logic for transient Microsoft TTS failures.
    """
    # 1. CLEANING & NOISE REMOVAL
    clean_text = text
    # Normalize unicode punctuation that confuses Microsoft TTS (e.g. non-breaking hyphens, smart quotes)
    clean_text = re.sub(r'[\u2011\u2012\u2013\u2014\u2015\u2212]', '-', clean_text)
    clean_text = re.sub(r'[\u201c\u201d]', '"', clean_text)
    clean_text = re.sub(r'[\u2018\u2019]', "'", clean_text)
    clean_text = re.sub(r'\u2026', '...', clean_text)
    # Remove markdown
    clean_text = re.sub(r'[*#_~`]', '', clean_text)
    # Remove URLs
    clean_text = re.sub(r'https?://\S+', '', clean_text)
    # Remove code blocks
    clean_text = re.sub(r'```.*?```', '', clean_text, flags=re.DOTALL)
    # Remove excessive whitespace
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    # Final safety: normalize remaining unicode to closest ASCII equivalents
    import unicodedata
    clean_text = unicodedata.normalize('NFKD', clean_text).encode('ascii', 'ignore').decode('ascii')
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

    # 4. GENERATION WITH CONCURRENCY LIMIT + RETRY
    async with TTS_SEMAPHORE:
        for attempt in range(1, TTS_MAX_RETRIES + 1):
            try:
                # Generate audio using edge-tts (in-memory streaming, no temp files)
                communicate = edge_tts.Communicate(
                    text=clean_text, 
                    voice=voice,
                    rate=SPEECH_RATE,
                    volume="+0%"
                )
                
                audio_chunks = []
                # Wrap the stream in a timeout to prevent hanging on network issues
                async def _collect_audio():
                    chunks = []
                    async for chunk_msg in communicate.stream():
                        if chunk_msg["type"] == "audio":
                            chunks.append(chunk_msg["data"])
                    return chunks
                
                audio_chunks = await asyncio.wait_for(_collect_audio(), timeout=TTS_TIMEOUT)
                
                if not audio_chunks:
                    raise ValueError("Edge-TTS returned no audio data")

                audio_bytes = b"".join(audio_chunks)
                audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

                result = {
                    "audio": audio_base64,
                    "voice": voice,
                    "format": "mp3"
                }

                # Update cache (bounded by entries and memory, only in non-DEBUG mode)
                if not settings.DEBUG:
                    global _tts_cache_bytes
                    entry_bytes = len(audio_base64)
                    if len(TTS_CACHE) >= TTS_CACHE_MAX_ENTRIES or _tts_cache_bytes + entry_bytes > TTS_CACHE_MAX_BYTES:
                        TTS_CACHE.clear()
                        _tts_cache_bytes = 0
                    TTS_CACHE[cache_key] = result
                    _tts_cache_bytes += entry_bytes

                return result

            except asyncio.TimeoutError:
                logger.warning(f"TTS attempt {attempt}/{TTS_MAX_RETRIES} timed out after {TTS_TIMEOUT}s for: {clean_text[:50]}...")
                if attempt < TTS_MAX_RETRIES:
                    await asyncio.sleep(0.2 * attempt)
            except Exception as e:
                if attempt < TTS_MAX_RETRIES:
                    backoff = 0.2 * attempt  # 0.2s, 0.4s — fast retries
                    logger.warning(f"TTS attempt {attempt}/{TTS_MAX_RETRIES} failed, retrying in {backoff}s: {type(e).__name__}")
                    await asyncio.sleep(backoff)
                else:
                    logger.error(f"TTS failed after {TTS_MAX_RETRIES} attempts for: {clean_text[:50]}... | {type(e).__name__}: {e}")

        return {"audio": "", "voice": voice, "format": "mp3"}


