"""
Tests for app/api/roadmap.py — Roadmap agent functions.
Covers: run_roadmap_structure, run_roadmap_details_batch, _parse_agent_json,
_normalise_week, _generate_fallback_roadmap, _build_validated_weeks.
"""
import pytest
import json
from app.api.roadmap import (
    _parse_agent_json,
    _normalise_week,
    _generate_fallback_roadmap,
    _build_validated_weeks,
    run_roadmap_structure,
    run_roadmap_details_batch,
)


# ── _parse_agent_json ──────────────────────────────────────────────────────────

class TestParseAgentJson:
    def test_parses_clean_array(self):
        raw = '[{"week": 1, "topic": "Test"}]'
        result = _parse_agent_json(raw)
        assert len(result) == 1
        assert result[0]["week"] == 1

    def test_parses_with_json_fence(self):
        raw = '```json\n[{"week": 1}]\n```'
        result = _parse_agent_json(raw)
        assert len(result) == 1

    def test_parses_with_generic_fence(self):
        raw = '```\n[{"week": 1}]\n```'
        result = _parse_agent_json(raw)
        assert len(result) == 1

    def test_extracts_array_from_dict(self):
        raw = '{"weeks": [{"week": 1}, {"week": 2}]}'
        result = _parse_agent_json(raw)
        assert len(result) == 2

    def test_handles_trailing_comma(self):
        raw = '[{"week": 1, "topic": "Test",}]'
        result = _parse_agent_json(raw)
        assert len(result) == 1
        assert result[0]["topic"] == "Test"

    def test_raises_on_invalid(self):
        with pytest.raises(ValueError):
            _parse_agent_json("not json at all")

    def test_extracts_via_regex_fallback(self):
        raw = "Some text before [{\"week\": 1}] and after"
        result = _parse_agent_json(raw)
        assert len(result) == 1


# ── _normalise_week ────────────────────────────────────────────────────────────

class TestNormaliseWeek:
    def test_normalises_minimal_week(self):
        w = _normalise_week({"topic": "Test"}, 0)
        assert w["week"] == 1
        assert w["topic"] == "Test"
        assert 6 <= w["estimated_hours"] <= 20
        assert w["mini_project"] is not None
        assert w["resource_search_queries"] == []

    def test_handles_alternate_keys(self):
        w = _normalise_week({"title": "Alt Title", "hours": "10 hours", "project": "Build X"}, 0)
        assert w["topic"] == "Alt Title"
        assert w["estimated_hours"] == 10
        assert w["mini_project"] == "Build X"

    def test_uses_index_for_week_number(self):
        w = _normalise_week({"topic": "T"}, 4)
        assert w["week"] == 5


# ── _generate_fallback_roadmap ─────────────────────────────────────────────────

class TestGenerateFallbackRoadmap:
    def test_generates_exactly_8_weeks(self):
        weeks = _generate_fallback_roadmap("Software Engineer", ["React", "Docker"])
        assert len(weeks) == 8

    def test_uses_core_concepts_fallback_when_no_gaps(self):
        weeks = _generate_fallback_roadmap("Dev", [])
        assert len(weeks) == 8
        assert all(w["skill_gap_addressed"] == "Core Concepts" for w in weeks)

    def test_each_week_has_required_fields(self):
        weeks = _generate_fallback_roadmap("Engineer", ["Kubernetes"])
        for w in weeks:
            assert "week" in w
            assert "topic" in w
            assert "skill_gap_addressed" in w
            assert "estimated_hours" in w
            assert "mini_project" in w
            assert "success_criteria" in w
            assert "resource_search_queries" in w

    def test_estimated_hours_increase_over_time(self):
        weeks = _generate_fallback_roadmap("Dev", ["React"])
        assert weeks[0]["estimated_hours"] < weeks[7]["estimated_hours"]


# ── _build_validated_weeks ─────────────────────────────────────────────────────

class TestBuildValidatedWeeks:
    def test_validates_and_normalises(self):
        raw = json.dumps([{"week": 1, "topic": "Python"}, {"week": 2, "topic": "Docker"}]*4)
        weeks = _build_validated_weeks(raw)
        assert len(weeks) == 8
        assert weeks[0]["week"] == 1
        assert weeks[7]["week"] == 8

    def test_pads_when_less_than_8(self):
        raw = json.dumps([{"week": 1, "topic": "Python"}])
        weeks = _build_validated_weeks(raw)
        assert len(weeks) == 8

    def test_truncates_when_more_than_8(self):
        raw = json.dumps([{"week": i, "topic": f"W{i}"} for i in range(1, 15)])
        weeks = _build_validated_weeks(raw)
        assert len(weeks) == 8

    def test_raises_on_empty(self):
        with pytest.raises(ValueError):
            _build_validated_weeks("[]")


# ── run_roadmap_structure (mocked at registry level) ───────────────────────────

class TestRunRoadmapStructure:
    def test_returns_empty_on_llm_failure(self, monkeypatch):
        """call_llm is imported locally inside run_roadmap_structure,
        so we patch it at the registry module level."""
        def mock_call_llm(*args, **kwargs):
            return None
        monkeypatch.setattr("app.agents.registry.call_llm", mock_call_llm)
        result = run_roadmap_structure("Dev", ["React"])
        assert result == []

    def test_returns_max_8_weeks(self, monkeypatch):
        def mock_call_llm(*args, **kwargs):
            return json.dumps([{"week": i, "topic": f"W{i}"} for i in range(1, 12)])
        monkeypatch.setattr("app.agents.registry.call_llm", mock_call_llm)
        result = run_roadmap_structure("Dev", ["React"])
        assert len(result) == 8

    def test_uses_custom_prompt_when_provided(self, monkeypatch):
        calls = []
        def mock_call_llm(system_prompt, user_content, provider=None, response_model=None, max_retries=3):
            calls.append(user_content)
            return json.dumps([{"week": 1, "topic": "Test"}])
        monkeypatch.setattr("app.agents.registry.call_llm", mock_call_llm)
        result = run_roadmap_structure("Dev", ["React"], custom_prompt="my custom prompt")
        assert calls[0] == "my custom prompt"
        assert len(result) == 1


# ── run_roadmap_details_batch (mocked at registry level) ───────────────────────

class TestRunRoadmapDetailsBatch:
    def test_returns_input_on_llm_failure(self, monkeypatch):
        def mock_call_llm(*args, **kwargs):
            return None
        monkeypatch.setattr("app.agents.registry.call_llm", mock_call_llm)
        chunk = [{"week": 1, "topic": "Python"}]
        result = run_roadmap_details_batch(chunk, "Dev")
        assert result == chunk

    def test_returns_fallback_on_parse_failure(self, monkeypatch):
        def mock_call_llm(*args, **kwargs):
            return "invalid json"
        monkeypatch.setattr("app.agents.registry.call_llm", mock_call_llm)
        chunk = [{"week": 1, "topic": "Python"}]
        result = run_roadmap_details_batch(chunk, "Dev")
        assert result == chunk

    def test_returns_enriched_result(self, monkeypatch):
        def mock_call_llm(*args, **kwargs):
            return json.dumps([{"week": 1, "topic": "Python", "mini_project": "Build API", "estimated_hours": 10, "why_it_matters": "Important", "success_criteria": "Done"}])
        monkeypatch.setattr("app.agents.registry.call_llm", mock_call_llm)
        chunk = [{"week": 1, "topic": "Python"}]
        result = run_roadmap_details_batch(chunk, "Dev")
        assert len(result) == 1
        assert result[0].get("mini_project") == "Build API"