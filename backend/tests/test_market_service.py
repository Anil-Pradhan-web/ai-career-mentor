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


def test_coerce_to_number():
    from app.core.market.service import _coerce_to_number
    assert _coerce_to_number(120000) == 120000.0
    assert _coerce_to_number("120k") == 120000.0
    assert _coerce_to_number("$120,000") == 120000.0
    assert _coerce_to_number("1.5M") == 1500000.0
    assert _coerce_to_number("none") is None


def test_salary_parsing_inr():
    """_parse_salary_from_text correctly parses Indian rupee LPA format."""
    from app.core.market.service import _parse_salary_from_text
    text = "Data Engineers in Bangalore earn ₹10L - ₹20L per annum"
    res = _parse_salary_from_text(text, "Bangalore, India")
    assert res["min"] == 1_000_000.0
    assert res["max"] == 2_000_000.0
    assert res["currency"] == "INR"
    assert "10" in res["formatted"] and "20" in res["formatted"]


def test_salary_parsing_usd():
    """_parse_salary_from_text correctly parses USD k-notation."""
    from app.core.market.service import _parse_salary_from_text
    text = "Software Engineers in Seattle make $150k - $230k"
    res = _parse_salary_from_text(text, "Seattle, USA")
    assert res["min"] == 150_000.0
    assert res["max"] == 230_000.0
    assert res["currency"] == "USD"


def test_salary_parsing_unavailable():
    """_parse_salary_from_text returns unavailable dict when no salary found."""
    from app.core.market.service import _parse_salary_from_text
    res = _parse_salary_from_text("No salary info here.", "Bangalore, India")
    assert res["min"] is None
    assert res["max"] is None
    assert res["formatted"] == "Live salary data unavailable"


def test_extract_skills_from_text():
    """_extract_skills_from_text counts real occurrences — no fake frequency defaults."""
    from app.core.market.service import _extract_skills_from_text
    text = "Python Python Python React React Docker skills required"
    skills = _extract_skills_from_text(text)
    assert len(skills) > 0
    names = [s["skill"].lower() for s in skills]
    assert "python" in names
    # Python appeared most — must have highest frequency (100)
    python_entry = next(s for s in skills if s["skill"].lower() == "python")
    assert python_entry["frequency"] == 100
    # No skill should have fabricated frequency=50 as default when count > 0
    for s in skills:
        assert isinstance(s["frequency"], int)
        assert 0 < s["frequency"] <= 100


def test_extract_skills_empty():
    """_extract_skills_from_text returns empty list when no known skills found."""
    from app.core.market.service import _extract_skills_from_text
    result = _extract_skills_from_text("completely unrelated text about cooking recipes")
    assert result == []


def test_extract_hiring_volume():
    """_extract_hiring_volume finds job count from text."""
    from app.core.market.service import _extract_hiring_volume
    text = "Find 1500+ Data Engineer jobs in Bangalore"
    vol = _extract_hiring_volume(text, "Data Engineer")
    assert "1500+" in vol

    # No numbers → unavailable (not fabricated)
    no_vol = _extract_hiring_volume("Some generic market text", "Data Engineer")
    assert no_vol == "Hiring volume data unavailable"


def test_extract_companies_no_global_leaderboard_pollution():
    """_extract_companies_from_text must NOT return global leaderboard companies."""
    from app.core.market.service import _extract_companies_from_text
    text = """
    Top Paying Companies globally: Meta Netflix Google Amazon Microsoft

    Infosys is hiring data engineers in Bangalore.
    """
    companies = _extract_companies_from_text(text, "Bangalore, India")
    names = [c["name"].lower() for c in companies]
    # Global noise must be stripped
    assert "meta" not in names
    assert "netflix" not in names
    assert "google" not in names
    # Local hiring signal must be preserved
    assert "infosys" in names


def test_extract_market_trend():
    """_extract_market_trend returns correct label from keywords."""
    from app.core.market.service import _extract_market_trend
    assert _extract_market_trend("There is high demand for ML engineers") == "High demand"
    assert _extract_market_trend("Industry is facing layoffs and hiring freeze") == "Market slowdown"
    assert _extract_market_trend("Demand is steady and consistent") == "Stable demand"
    assert _extract_market_trend("no signal here") == "Market signals found — see summary"