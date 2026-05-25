"""Market Service Tests — live-search-first, no fake benchmark data."""
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
    """Final response structure matches all UI expectations for real extracted data."""
    mock_live_data = {
        "salary_range": {"min": 100_000, "max": 200_000, "currency": "USD", "formatted": "$100,000 - $200,000"},
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
        "sources": ["https://example.com/live-market-source"],
    }

    with patch("app.core.market.service.get_live_context", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = "SOURCE: https://example.com/live-market-source\nCONTENT: live results"
        with patch("app.core.market.service.extract_metrics", new_callable=AsyncMock) as mock_extract:
            mock_extract.return_value = mock_live_data
            result = await get_market_intelligence("Software Engineer", "Worldwide")

    assert result["is_live"] is True
    assert result["salary_range"]["formatted"] == "$100,000 - $200,000"
    assert result["hiring_volume"] == "1,200+"
    assert result["hiring_companies"][0]["name"] == "Google"
    assert result["sources"] == ["https://example.com/live-market-source"]


def test_coerce_to_number():
    from app.core.market.service import _coerce_to_number
    assert _coerce_to_number(120000) == 120000.0
    assert _coerce_to_number("120k") == 120000.0
    assert _coerce_to_number("$120,000") == 120000.0
    assert _coerce_to_number("1.5M") == 1500000.0
    assert _coerce_to_number("none") is None


def test_format_salary_range_robustness():
    from app.core.market.service import _format_salary_range
    # Dictionary with string numbers
    sal_dict = {"min": "100k", "max": "150k", "currency": "USD"}
    res = _format_salary_range(sal_dict, "New York")
    assert res["min"] == 100000.0
    assert res["max"] == 150000.0
    assert res["formatted"] == "$100,000 - $150,000"

    # String ranges
    res_str = _format_salary_range("$100k - $200k", "New York")
    assert res_str["min"] == 100000.0
    assert res_str["max"] == 200000.0
    assert "$100k - $200k" in res_str["formatted"]

