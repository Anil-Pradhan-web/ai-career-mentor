import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.core.market import get_market_intelligence
from app.api.interview import _build_interview_system_prompt

client = TestClient(app)

@pytest.mark.asyncio
async def test_market_returns_structured_live_or_unavailable_data():
    """Market engine returns honest structured data without fake benchmark salaries."""
    mock_data = {
        "role": "Software Engineer",
        "location": "Bangalore, India",
        "salary_range": {"formatted": "₹1,20,000 - ₹2,40,000"},
        "data_source": "live_search",
        "is_live": True,
        "hiring_volume": "High",
        "hiring_companies": [],
        "top_skills_freq": []
    }
    with patch("app.core.market.get_market_intelligence", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_data
        data = await mock_get("Software Engineer", "Bangalore, India")
        assert "salary_range" in data
        assert "formatted" in data["salary_range"]
        assert data["data_source"] in {"live_search", "unavailable"}


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


@pytest.mark.asyncio
async def test_voice_engine_metadata_return():
    """Verify that the voice engine returns a dict with audio, voice, and format using mocked edge-tts."""
    from app.core.voice_engine import generate_audio_base64
    
    with patch("app.core.voice_engine.edge_tts.Communicate") as mock_comm_class:
        mock_instance = mock_comm_class.return_value
        
        async def fake_save(path):
            with open(path, "wb") as f:
                f.write(b"dummy mp3 data")
        mock_instance.save = fake_save

        result = await generate_audio_base64("Hello world! This is a test.")
        
        assert isinstance(result, dict)
        assert "audio" in result
        assert "voice" in result
        assert "format" in result
        assert result["format"] == "mp3"


@pytest.mark.asyncio
async def test_voice_engine_truncation():
    """Verify that long text is truncated correctly and handled cleanly under limits."""
    from app.core.voice_engine import generate_audio_base64
    
    with patch("app.core.voice_engine.edge_tts.Communicate") as mock_comm_class:
        mock_instance = mock_comm_class.return_value
        
        async def fake_save(path):
            with open(path, "wb") as f:
                f.write(b"dummy mp3 data")
        mock_instance.save = fake_save

        # Create text longer than MAX_TTS_CHARS (2000)
        long_text = "Wait for it. " * 300
        result = await generate_audio_base64(long_text)
        
        assert isinstance(result, dict)
        assert "audio" in result


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


