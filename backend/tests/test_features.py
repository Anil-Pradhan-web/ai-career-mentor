
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.market_engine import get_deterministic_market_data
from app.api.interview import _build_interview_system_prompt

client = TestClient(app)

def test_market_deterministic_regional_data():
    """Verify that market engine returns correct currency and baseline for different regions."""
    # Test India (City based for better matching)
    india_data = get_deterministic_market_data("Software Engineer", "Bangalore, India")
    assert india_data["symbol"] == "₹"
    assert india_data["currency"] == "INR"
    assert india_data["region"] == "INDIA"
    
    # Test USA
    usa_data = get_deterministic_market_data("Software Engineer", "San Francisco, USA")
    assert usa_data["symbol"] == "$"
    assert usa_data["currency"] == "USD"
    assert usa_data["region"] == "USA"

    # Test Unknown location (defaults to global)
    unknown_data = get_deterministic_market_data("Software Engineer", "Mars")
    assert unknown_data["region"] == "GLOBAL"
    assert unknown_data["currency"] == "USD"

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
