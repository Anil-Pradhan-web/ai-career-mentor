"""
Tests for app/models/validation.py — Pydantic validation schemas.
Covers: ResumeAnalysisModel, MarketTrendsModel, LinkedInStrategyModel,
RoadmapModel, RoadmapWeekModel.
"""
import pytest
from pydantic import ValidationError
from app.models.validation import (
    ResumeAnalysisModel,
    MarketTrendsModel,
    LinkedInStrategyModel,
    RoadmapModel,
    RoadmapWeekModel,
)


class TestResumeAnalysisModel:
    def test_valid_resume_analysis(self):
        data = {
            "technical_skills": ["Python", "Docker"],
            "soft_skills": ["Communication"],
            "years_of_experience": 5.0,
            "top_strengths": ["Leadership"],
            "skill_gaps": ["Kubernetes"],
            "ats_score": 75,
            "ats_score_breakdown": {"keywords": 20, "achievements": 20, "action_verbs": 15, "formatting_and_length": 20}
        }
        model = ResumeAnalysisModel(**data)
        assert model.ats_score == 75
        assert len(model.technical_skills) == 2

    def test_ats_score_range(self):
        with pytest.raises(ValidationError):
            ResumeAnalysisModel(
                technical_skills=[],
                soft_skills=[],
                years_of_experience=0,
                top_strengths=[],
                skill_gaps=[],
                ats_score=150,
                ats_score_breakdown={}
            )

    def test_ats_score_min_zero(self):
        with pytest.raises(ValidationError):
            ResumeAnalysisModel(
                technical_skills=[],
                soft_skills=[],
                years_of_experience=0,
                top_strengths=[],
                skill_gaps=[],
                ats_score=-5,
                ats_score_breakdown={}
            )


class TestMarketTrendsModel:
    def test_valid_market_data_with_dict_salary(self):
        data = {
            "role": "Engineer",
            "location": "India",
            "salary_range": {"min": 80000, "max": 120000, "formatted": "$80k-$120k"},
            "market_trend": "Growing",
            "hiring_companies": [{"name": "Google", "hiring_volume": "High"}],
            "top_skills_freq": [{"skill": "Python", "frequency": 90}]
        }
        model = MarketTrendsModel(**data)
        assert model.role == "Engineer"
        assert isinstance(model.salary_range, dict)

    def test_valid_market_data_with_str_salary(self):
        data = {
            "role": "Engineer",
            "location": "India",
            "salary_range": "₹80,000 - ₹1,20,000",
            "market_trend": "Stable",
            "hiring_companies": [],
            "top_skills_freq": []
        }
        model = MarketTrendsModel(**data)
        assert isinstance(model.salary_range, str)

    def test_minimal_valid_market(self):
        data = {
            "role": "Dev",
            "location": "Remote",
            "salary_range": "N/A",
            "market_trend": "Stable",
            "hiring_companies": [],
            "top_skills_freq": []
        }
        model = MarketTrendsModel(**data)
        assert model.hiring_volume == "Actively Hiring"


class TestLinkedInStrategyModel:
    def test_valid_strategy(self):
        data = {
            "headlines": ["Headline 1", "Headline 2"],
            "about_section": "Experienced engineer...",
            "demanding_skills": ["Python", "AI"],
            "ats_keywords_to_inject": ["Python", "ML"],
            "recruiter_search_trends": ["AI Engineers"],
            "profile_density_advice": "Add more keywords",
            "certifications": ["AWS Certified", "GCP Certified"]
        }
        model = LinkedInStrategyModel(**data)
        assert len(model.headlines) == 2
        assert len(model.certifications) == 2

    def test_handles_null_fields(self):
        data = {
            "headlines": None,
            "about_section": None,
            "demanding_skills": None,
            "ats_keywords_to_inject": None,
            "recruiter_search_trends": None,
            "profile_density_advice": None,
            "certifications": None
        }
        model = LinkedInStrategyModel(**data)
        assert model.headlines == []
        assert model.about_section == ""
        assert model.demanding_skills == []
        assert model.certifications == []

    def test_normalizes_certification_dicts(self):
        data = {
            "headlines": [],
            "about_section": "",
            "demanding_skills": [],
            "ats_keywords_to_inject": [],
            "recruiter_search_trends": [],
            "profile_density_advice": "",
            "certifications": [
                {"name": "AWS Solutions Architect"},
                "GCP Certified",
                {"title": "K8s Admin"}
            ]
        }
        model = LinkedInStrategyModel(**data)
        assert "AWS Solutions Architect" in model.certifications
        assert "GCP Certified" in model.certifications
        assert "K8s Admin" in model.certifications

    def test_coerces_certification_strings(self):
        data = {
            "headlines": [],
            "about_section": "",
            "demanding_skills": [],
            "ats_keywords_to_inject": [],
            "recruiter_search_trends": [],
            "profile_density_advice": "",
            "certifications": [123, True]
        }
        model = LinkedInStrategyModel(**data)
        assert all(isinstance(c, str) for c in model.certifications)


class TestRoadmapWeekModel:
    def test_valid_week(self):
        week = RoadmapWeekModel(week=1, topic="Python Basics", estimated_hours=10, mini_project="Build CLI")
        assert week.week == 1
        assert week.topic == "Python Basics"

    def test_missing_optional_fields(self):
        week = RoadmapWeekModel(week=1, topic="Test", estimated_hours=8, mini_project="Project")
        assert week.skill_gap_addressed is None
        assert week.success_criteria is None
        assert week.resource_search_queries == []


class TestRoadmapModel:
    def test_valid_roadmap(self):
        weeks = [
            RoadmapWeekModel(week=i, topic=f"Topic {i}", estimated_hours=10, mini_project=f"Project {i}")
            for i in range(1, 9)
        ]
        roadmap = RoadmapModel(weeks=weeks)
        assert len(roadmap.weeks) == 8

    def test_non_8_weeks_logs_warning(self, caplog):
        import logging
        caplog.set_level(logging.WARNING)
        weeks = [
            RoadmapWeekModel(week=i, topic=f"T{i}", estimated_hours=10, mini_project=f"P{i}")
            for i in range(1, 5)  # 4 weeks only
        ]
        roadmap = RoadmapModel(weeks=weeks)
        assert len(roadmap.weeks) == 4
        assert "Roadmap has 4 weeks" in caplog.text