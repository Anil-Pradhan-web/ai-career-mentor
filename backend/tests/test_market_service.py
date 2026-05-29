"""Market Service Tests — deterministic extraction, no fake benchmark data."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
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
async def test_no_live_context_returns_explicit_unavailable_not_fake_data():
    """When live search is unavailable, service must not invent salary/hiring numbers."""
    with patch("app.core.market.service.get_live_context", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = ""
        result = await get_market_intelligence("Backend Engineer", "Bangalore, India")

    assert result["role"] == "Backend Engineer"
    assert result["is_live"] is False
    assert result["salary_range"]["formatted"] == "Live salary data unavailable"
    assert result["hiring_volume"] == "Live hiring data unavailable"
    assert result["hiring_companies"] == []


@pytest.mark.asyncio
async def test_unified_service_structure_with_live_extraction():
    """Final response structure matches all UI expectations for real extracted data.

    extract_metrics_deterministic is now a sync function (no LLM calls),
    so we patch it with a regular MagicMock, not AsyncMock.
    """
    mock_deterministic_data = {
        "salary_range": {"min": 100_000, "max": 200_000, "currency": "USD", "formatted": "$100,000 - $200,000"},
        "hiring_volume": "1,200+ open roles",
        "top_skills_freq": [
            {"skill": "Python", "frequency": 90},
            {"skill": "AWS", "frequency": 80},
        ],
        "hiring_companies": [
            {"name": "Google", "hiring_volume": "Google is hiring"},
            {"name": "Meta",   "hiring_volume": "Role listing found"},
        ],
        "market_trend": "High demand",
        "sources": ["https://example.com/live-market-source"],
    }

    with patch("app.core.market.service.get_live_context", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = "SOURCE: https://example.com/live-market-source\nCONTENT: live results"
        # sync patch — extract_metrics_deterministic is NOT async
        with patch("app.core.market.service.extract_metrics_deterministic", return_value=mock_deterministic_data) as mock_extract:
            # _llm_summary is a sync function too — stub it so no real LLM call
            with patch("app.core.market.service._llm_summary", return_value="Test summary"):
                result = await get_market_intelligence("Software Engineer", "Worldwide")

    assert result["is_live"] is True
    assert result["salary_range"]["formatted"] == "$100,000 - $200,000"
    assert result["hiring_volume"] == "1,200+ open roles"
    assert result["hiring_companies"][0]["name"] == "Google"
    assert result["sources"] == ["https://example.com/live-market-source"]


@pytest.mark.asyncio
async def test_market_service_with_structured_llm_dict():
    """Service parses structured dict returned by _llm_summary correctly."""
    mock_llm_dict = {
        "salary_range": {
            "min": 120000.0,
            "max": 180000.0,
            "currency": "USD",
            "formatted": "$120,000 – $180,000 per annum"
        },
        "market_trend": "High demand",
        "hiring_volume": "1,500+ open roles",
        "top_skills_freq": [
            {"skill": "Python", "frequency": 95},
            {"skill": "PyTorch", "frequency": 85}
        ],
        "hiring_companies": [
            {"name": "Siemens", "hiring_volume": "Active openings"},
            {"name": "Allianz", "hiring_volume": "Hiring ML Engineers"}
        ],
        "summary": "The ML Engineer market is strong in Munich with high demand for Python and PyTorch skills."
    }

    with patch("app.core.market.service.get_live_context", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = "SOURCE: https://example.com/source1\nCONTENT: Munich jobs"
        with patch("app.core.market.service._llm_summary", return_value=mock_llm_dict):
            result = await get_market_intelligence("ML Engineer", "Munich, Germany")

    assert result["is_live"] is True
    assert result["salary_range"]["formatted"] == "$120,000 – $180,000 per annum"
    assert result["hiring_volume"] == "1,500+ open roles"
    assert result["hiring_companies"][0]["name"] == "Siemens"
    assert result["hiring_companies"][0]["hiring_volume"] == "Active openings"
    assert result["top_skills_freq"][0]["skill"] == "Python"
    assert result["top_skills_freq"][0]["frequency"] == 95
    assert result["summary"] == "The ML Engineer market is strong in Munich with high demand for Python and PyTorch skills."
    assert result["sources"] == ["https://example.com/source1"]