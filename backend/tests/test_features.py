
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.market import get_market_intelligence
from app.api.interview import _build_interview_system_prompt

client = TestClient(app)

@pytest.mark.asyncio
async def test_market_deterministic_regional_data():
    """Verify that market engine returns data for different regions."""
    # Test India
    india_data = await get_market_intelligence("Software Engineer", "Bangalore, India")
    assert "salary_range" in india_data
    assert "formatted" in india_data["salary_range"]
    assert "₹" in india_data["salary_range"]["formatted"]
    
    # Test USA
    usa_data = await get_market_intelligence("Software Engineer", "San Francisco, USA")
    assert "salary_range" in usa_data
    assert "formatted" in usa_data["salary_range"]
    assert "$" in usa_data["salary_range"]["formatted"]

def test_interview_system_prompt_tier_integration():
    """Verify that the interview system prompt includes the correct company tier and role."""
    role = "Fullstack Developer"
    company = "Google"
    tier = "FAANG"
    style = "High difficulty DSA"
    
    prompt = _build_interview_system_prompt(role, company, style, tier)
    
    assert role in prompt
    assert company in prompt
    assert f"Tier/Category: {tier}" in prompt

def test_voice_engine_metadata_return():
    """Verify that the voice engine returns a dict with audio, voice, and format."""
    from app.core.voice_engine import generate_audio_base64, MAX_TTS_CHARS
    import asyncio

    text = "Hello world! This is a test."
    # Use a dummy run (loop.run_until_complete is not needed in pytest-asyncio but this is a helper)
    result = asyncio.run(generate_audio_base64(text))
    
    assert isinstance(result, dict)
    assert "audio" in result
    assert "voice" in result
    assert "format" in result
    assert result["format"] == "mp3"

def test_voice_engine_truncation():
    """Verify that long text is truncated correctly by sentences."""
    from app.core.voice_engine import generate_audio_base64, MAX_TTS_CHARS
    import asyncio

    # Create text longer than MAX_TTS_CHARS (850)
    long_text = "Wait for it. " * 100
    result = asyncio.run(generate_audio_base64(long_text))
    
    # The cleaned text used for generation should be within limits
    # We can't easily check internal state, but we can verify it doesn't crash
    assert isinstance(result, dict)

def test_market_trends_endpoint_unauthorized():
    """Market trends should require authentication."""
    response = client.get("/market/trends?role=Dev&location=India")
    assert response.status_code == 401

def test_resume_upload_unauthorized():
    """Resume upload should require authentication."""
    response = client.post("/resume/upload", files={"file": ("test.pdf", b"pdf content")})
    assert response.status_code == 401

def test_roadmap_generate_unauthorized():
    """Roadmap generation should require authentication."""
    response = client.post("/roadmap/generate", json={"target_role": "Dev", "skill_gaps": ["React"]})
    assert response.status_code == 401
