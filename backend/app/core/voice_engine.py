import os
import base64
import asyncio
import edge_tts
import tempfile
import re
from loguru import logger

DEFAULT_TTS_VOICE = "en-US-ChristopherNeural"
# Very clear, professional male US-English voice that fits technical interviews perfectly.
INTERVIEW_TTS_VOICE = "en-US-ChristopherNeural"

TTS_TIMEOUT_SECONDS = 30  # Max time to wait for TTS generation


async def generate_audio_base64(text: str, voice: str = DEFAULT_TTS_VOICE) -> str:
    """
    Generates speech audio from text using Edge-TTS and returns it as a Base64 string.
    Times out after TTS_TIMEOUT_SECONDS to prevent infinite hangs on Render.
    """
    # Remove markdown formatting characters like asterisks, hashes, underscores, backticks
    clean_text = re.sub(r'[*#_~`]', '', text)
    
    # Truncate very long text to prevent huge audio files + timeouts
    if len(clean_text) > 3000:
        clean_text = clean_text[:3000] + "... and that concludes the feedback."
    
    temp_path = None
    try:
        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
            temp_path = f.name
        
        # Initialize communication with Edge-TTS (with timeout)
        communicate = edge_tts.Communicate(clean_text, voice)
        await asyncio.wait_for(communicate.save(temp_path), timeout=TTS_TIMEOUT_SECONDS)
        
        # Read the audio file and encode to base64
        with open(temp_path, "rb") as f:
            audio_bytes = f.read()
            
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return audio_base64
    except asyncio.TimeoutError:
        logger.warning(f"TTS generation timed out after {TTS_TIMEOUT_SECONDS}s")
        return ""
    except Exception as e:
        logger.error(f"Error generating TTS audio: {e}")
        return ""
    finally:
        # Safe cleanup — handles Windows file locking too
        if temp_path:
            try:
                os.remove(temp_path)
            except OSError:
                pass

