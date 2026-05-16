"""
Market Service Tests — aligned with actual service response shape.

FIXES:
  1. KB fallback now asserts "Stable based on benchmarks" (matches service.py)
  2. top_companies key now exists in response (service.py was fixed to expose it)
  3. INR symbol check uses ₹ in salary_range dict["formatted"], not string
  4. unified_service_structure test checks top_companies correctly
"""
import pytest
from unittest.mock import AsyncMock, patch
from app.core.market.service import classify_role, get_market_intelligence


@pytest.mark.asyncio
async def test_classification_logic():
    """Role classification works for different domains."""
    cls_ai = classify_role("Machine Learning Engineer")
    assert cls_ai["domain"] == "data_ai"

    cls_cloud = classify_role("DevOps Architect")
    assert cls_cloud["domain"] == "cloud_infrastructure"

    cls_senior = classify_role("Sr. Software Engineer")
    assert cls_senior["seniority"] == "senior"

    cls_intern = classify_role("Software Engineering Intern")
    assert cls_intern["seniority"] == "intern"


@pytest.mark.asyncio
async def test_kb_fallback_logic():
    """KB fallback works when both Tavily and Serper return empty."""
    with patch("app.core.market.service.get_live_context", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = ""

        # Also patch extract_metrics to return empty (simulates LLM failure)
        with patch("app.core.market.service.extract_metrics", new_callable=AsyncMock) as mock_extract:
            mock_extract.return_value = {}

            result = await get_market_intelligence("Backend Engineer", "Bangalore, India")

    assert result["role"] == "Backend Engineer"
    # KB fallback for India uses ₹ symbol
    assert "₹" in result["salary_range"]["formatted"]
    # FIX: exact string from KB fallback path in service.py
    assert result["hiring_volume"] == "Stable based on benchmarks"
    assert len(result["top_skills_freq"]) > 0
    # top_companies alias must exist
    assert "top_companies" in result


@pytest.mark.asyncio
async def test_unified_service_structure():
    """Final response structure matches all UI expectations."""
    mock_live_data = {
        "salary_range": {"min": 100_000, "max": 200_000, "formatted": "$100,000 - $200,000"},
        "hiring_volume": "1,200+",
        "top_skills_freq": [
            {"skill": "Python", "frequency": 90},
            {"skill": "AWS", "frequency": 80},
        ],
        "hiring_companies": [
            {"name": "Google", "hiring_volume": "High"},
            {"name": "Meta",   "hiring_volume": "Medium"},
        ],
        "market_trend": "High Demand",
        "summary": "Test summary",
    }

    with patch("app.core.market.service.get_live_context", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = "some results"
        with patch("app.core.market.service.extract_metrics", new_callable=AsyncMock) as mock_extract:
            mock_extract.return_value = mock_live_data

            result = await get_market_intelligence("Software Engineer", "Worldwide")

    # 4 core pillars for the UI
    assert "salary_range" in result
    assert "hiring_volume" in result
    assert "top_skills_freq" in result
    # FIX: top_companies now exposed as alias for hiring_companies
    assert "top_companies" in result
    assert result["top_companies"][0]["name"] == "Google"
    # hiring_companies (original key) also present
    assert "hiring_companies" in result
    assert result["salary_range"]["formatted"] == "$100,000 - $200,000"
