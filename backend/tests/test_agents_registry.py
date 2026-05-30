"""
Tests for agents/registry.py — Thin LLM Caller.
Covers: call_llm, parse_json, circuit breaker, fallback chain, dispatch.
"""
import pytest
import json
import time
from unittest.mock import patch, MagicMock
from app.agents.registry import (
    call_llm,
    parse_json,
    _CIRCUIT_BREAKER,
    _build_fallback_chain,
    _next_in_chain,
    _reset_circuit_breaker,
    _dispatch,
)

# Always reset circuit breaker before each test in this file
@pytest.fixture(autouse=True)
def reset_circuit():
    _reset_circuit_breaker()
    _CIRCUIT_BREAKER["disabled_until"] = 0.0


# ── parse_json ─────────────────────────────────────────────────────────────────

class TestParseJson:
    def test_returns_none_for_empty_input(self):
        assert parse_json(None) is None
        assert parse_json("") is None

    def test_returns_dict_unmodified(self):
        d = {"key": "value"}
        assert parse_json(d) is d

    def test_returns_list_unmodified(self):
        lst = [1, 2, 3]
        assert parse_json(lst) is lst

    def test_parses_plain_json_object(self):
        result = parse_json('{"name": "test"}')
        assert result == {"name": "test"}

    def test_parses_plain_json_array(self):
        result = parse_json('[{"week": 1}, {"week": 2}]')
        assert len(result) == 2

    def test_strips_markdown_fence_json(self):
        raw = "```json\n{\"key\": \"value\"}\n```"
        assert parse_json(raw) == {"key": "value"}

    def test_strips_markdown_fence_no_lang(self):
        raw = "```\n{\"key\": \"value\"}\n```"
        assert parse_json(raw) == {"key": "value"}

    def test_extracts_json_from_surrounding_text(self):
        raw = "Here is the result:\n\n{\"weeks\": [{\"week\": 1}]}\n\nDone."
        result = parse_json(raw)
        assert result == {"weeks": [{"week": 1}]}

    def test_extracts_array_from_surrounding_text(self):
        raw = "Output:\n[{\"week\": 1, \"topic\": \"Test\"}]\nEnd."
        result = parse_json(raw)
        assert len(result) == 1
        assert result[0]["week"] == 1

    def test_handles_trailing_commas_in_array(self):
        """parse_json handles trailing commas in arrays via regex fallback."""
        raw = '[{"skills": ["a", "b"], "count": 3}]'
        result = parse_json(raw)
        assert result is not None
        assert result[0]["skills"] == ["a", "b"]


# ── Fallback Chain ─────────────────────────────────────────────────────────────

class TestFallbackChain:
    def test_nvidia_falls_to_google(self):
        assert _build_fallback_chain("nvidia") == ["nvidia", "groq", "google"]

    def test_groq_falls_to_google(self):
        assert _build_fallback_chain("groq") == ["groq", "google", "nvidia"]

    def test_google_falls_to_groq(self):
        assert _build_fallback_chain("google") == ["google", "groq", "nvidia"]

    def test_unknown_provider_defaults_to_google(self):
        assert _build_fallback_chain("unknown") == ["groq", "google", "nvidia"]

    def test_next_in_chain_returns_correct_provider(self):
        chain = ["nvidia", "google"]
        assert _next_in_chain("nvidia", chain) == "google"
        assert _next_in_chain("google", chain) is None

    def test_next_in_chain_unknown_current(self):
        assert _next_in_chain("invalid", ["google"]) is None


# ── Circuit Breaker ────────────────────────────────────────────────────────────

class TestCircuitBreaker:
    def test_initial_state_is_closed(self):
        assert _CIRCUIT_BREAKER["fails"] == 0
        assert _CIRCUIT_BREAKER["disabled_until"] == 0.0
        assert time.time() >= _CIRCUIT_BREAKER["disabled_until"]

    def test_reset_clears_fail_count(self):
        _CIRCUIT_BREAKER["fails"] = 5
        _reset_circuit_breaker()
        assert _CIRCUIT_BREAKER["fails"] == 0

    def test_call_returns_none_when_circuit_open(self):
        _CIRCUIT_BREAKER["disabled_until"] = time.time() + 60
        result = call_llm("prompt", "content")
        assert result is None

    def test_circuit_dispatch_routes_correctly(self, monkeypatch):
        def mock_call_google(*args, **kwargs):
            return '{"result": "ok"}', 10, 20
        monkeypatch.setattr("app.agents.registry._call_google", mock_call_google)
        result = call_llm("test system", "test user", provider="google")
        assert result is not None


# ── call_llm with structured output ────────────────────────────────────────────

class TestCallLlmStructured:
    def test_returns_parsed_model_on_success(self, monkeypatch):
        from app.models.validation import ResumeAnalysisModel

        def mock_call_google(*args, **kwargs):
            return json.dumps({
                "technical_skills": ["Python"],
                "soft_skills": ["Communication"],
                "years_of_experience": 5.0,
                "top_strengths": ["Leadership"],
                "skill_gaps": ["Docker"],
                "ats_score": 75,
                "ats_score_breakdown": {"keywords": 20, "achievements": 20, "action_verbs": 20, "formatting_and_length": 15}
            }), 10, 20

        monkeypatch.setattr("app.agents.registry._call_google", mock_call_google)
        result = call_llm("system", "user", provider="google", response_model=ResumeAnalysisModel)
        assert result is not None
        assert result["technical_skills"] == ["Python"]
        assert result["ats_score"] == 75

    def test_returns_raw_text_when_no_model_provided(self, monkeypatch):
        def mock_call_google(*args, **kwargs):
            return "raw response", 10, 20
        monkeypatch.setattr("app.agents.registry._call_google", mock_call_google)
        result = call_llm("system", "user", provider="google")
        assert result == "raw response"


# ── dispatch ───────────────────────────────────────────────────────────────────

class TestDispatch:
    def test_dispatch_google(self, monkeypatch):
        def mock_call_google(*args, **kwargs):
            return "google response", 10, 20
        monkeypatch.setattr("app.agents.registry._call_google", mock_call_google)
        assert _dispatch("google", "s", "u") == ("google response", 10, 20)

    def test_dispatch_groq(self, monkeypatch):
        def mock_call_groq(*args, **kwargs):
            return "groq response", 10, 20
        monkeypatch.setattr("app.agents.registry._call_groq", mock_call_groq)
        assert _dispatch("groq", "s", "u") == ("groq response", 10, 20)

    def test_dispatch_nvidia(self, monkeypatch):
        def mock_call_nvidia(*args, **kwargs):
            return "nvidia response", 10, 20
        monkeypatch.setattr("app.agents.registry._call_nvidia", mock_call_nvidia)
        assert _dispatch("nvidia", "s", "u") == ("nvidia response", 10, 20)

    def test_dispatch_fallback_to_google(self, monkeypatch):
        def mock_call_google(*args, **kwargs):
            return "google fallback", 10, 20
        monkeypatch.setattr("app.agents.registry._call_google", mock_call_google)
        assert _dispatch("unknown", "s", "u") == ("google fallback", 10, 20)