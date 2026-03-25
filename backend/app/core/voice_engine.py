import os
import base64
import asyncio
import edge_tts
import tempfile
import re
from loguru import logger

DEFAULT_TTS_VOICE = "en-GB-ThomasNeural"
# Clear Indian-English voice that fits interview conversations well.
INTERVIEW_TTS_VOICE = "en-IN-NeerjaNeural"


async def generate_audio_base64(text: str, voice: str = DEFAULT_TTS_VOICE) -> str:
    """
    Generates speech audio from text using Edge-TTS and returns it as a Base64 string.
    """
    # Remove markdown formatting characters like asterisks, hashes, underscores, backticks
    clean_text = re.sub(r'[*#_~`]', '', text)
    
    try:
        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
            temp_path = f.name
        
        # Initialize communication with Edge-TTS
        communicate = edge_tts.Communicate(clean_text, voice)
        await communicate.save(temp_path)
        
        # Read the audio file and encode to base64
        with open(temp_path, "rb") as f:
            audio_bytes = f.read()
            
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        # Clean up the temporary file
        os.remove(temp_path)
        
        return audio_base64
    except Exception as e:
        logger.error(f"Error generating TTS audio: {e}")
        return ""
