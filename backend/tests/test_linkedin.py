import pytest
from unittest.mock import patch
from app.api.linkedin import run_linkedin_agent, _get_fallback_linkedin_strategy

def test_linkedin_fallback_directly():
    res = _get_fallback_linkedin_strategy("Frontend Engineer", ["React", "CSS"], ["Docker"])
    assert "headlines" in res
    assert len(res["headlines"]) > 0
    assert "React" in res["about_section"] or "Frontend" in res["about_section"]
    assert "React" in res["demanding_skills"]

def test_linkedin_agent_handles_llm_failure():
    # Mock call_llm to return None to simulate LLM failure
    with patch("app.api.linkedin.call_llm", return_value=None):
        res = run_linkedin_agent("Backend Engineer", {"top_strengths": ["Python"]}, {"hiring_companies": ["Google"]})
        # Should fallback gracefully to the programmatic strategy instead of returning an error dict
        assert "headlines" in res
        assert "about_section" in res
        assert "FastAPI" in res["about_section"] or "Django" in res["about_section"] or "Backend" in res["about_section"]
