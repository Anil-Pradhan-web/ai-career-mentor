import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from app.core.market.service import classify_role, get_market_intelligence

@pytest.mark.asyncio
async def test_classification_logic():
    """Test if role classification works for different domains."""
    # Test Data AI
    cls_ai = classify_role("Machine Learning Engineer")
    assert cls_ai["domain"] == "data_ai"
    
    # Test Cloud
    cls_cloud = classify_role("DevOps Architect")
    assert cls_cloud["domain"] == "cloud_infrastructure"
    
    # Test Seniority
    cls_senior = classify_role("Sr. Software Engineer")
    assert cls_senior["seniority"] == "senior"

@pytest.mark.asyncio
async def test_kb_fallback_logic():
    """Test if KB fallback works when search fails."""
    # Mocking live search to return empty (fail)
    with patch("app.core.market.service.get_live_context", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = ""
        
        result = await get_market_intelligence("Backend Engineer", "Bangalore, INDIA")
        
        assert result["role"] == "Backend Engineer"
        assert "₹" in result["salary_range"]["formatted"] # Should use India benchmark
        assert result["hiring_volume"] == "Stable based on benchmarks"
        assert len(result["top_skills"]) > 0

@pytest.mark.asyncio
async def test_unified_service_structure():
    """Verify the final response structure matches UI expectations."""
    mock_live_data = {
        "salary_range": {"min": 100, "max": 200, "formatted": "$100 - $200"},
        "hiring_volume": "High",
        "top_skills": ["Python", "AWS"],
        "hiring_companies": ["Google", "Meta"],
        "summary": "Test summary"
    }
    
    with patch("app.core.market.service.get_live_context", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = "some results"
        with patch("app.core.market.service.extract_metrics", new_callable=AsyncMock) as mock_extract:
            mock_extract.return_value = mock_live_data
            
            result = await get_market_intelligence("Engineer", "Worldwide")
            
            # Check 4 Core Pillars for UI
            assert "salary_range" in result
            assert "hiring_volume" in result
            assert "top_skills" in result
            assert "top_companies" in result
            assert result["top_companies"][0]["name"] == "Google"
