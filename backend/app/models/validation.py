"""
Validation Schemas — The Truth Layer for the Career AI OS.
Strict Pydantic models for agent output validation.

FIXES:
  - MarketTrendsModel.salary_range: str → Any  (service returns dict, not str)
  - RoadmapModel validator uses @model_validator (Pydantic v2 compatible)
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, model_validator


# ── Resume Analysis ───────────────────────────────────────────────────────────
class ResumeAnalysisModel(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    years_of_experience: float
    top_strengths: List[str]
    skill_gaps: List[str]
    ats_score: int = Field(ge=0, le=100)
    ats_score_breakdown: Dict[str, int]


# ── Market Trends ─────────────────────────────────────────────────────────────
class MarketTrendsModel(BaseModel):
    """
    salary_range is Any because the service layer returns a dict
    like {"min": 80000, "max": 120000, "formatted": "₹80,000 – ₹1,20,000"}.
    Downstream code only reads salary_range["formatted"] so we keep it flexible.
    """
    role: str
    location: str
    hiring_volume: Optional[str] = "Actively Hiring"
    salary_range: Any          # dict OR str — both valid
    market_trend: str
    hiring_companies: List[Dict[str, Any]]
    top_skills_freq: List[Dict[str, Any]]


# ── LinkedIn Strategy ─────────────────────────────────────────────────────────
class LinkedInStrategyModel(BaseModel):
    headlines: List[str]
    about_section: str
    demanding_skills: List[str]
    ats_keywords_to_inject: List[str]
    recruiter_search_trends: List[str]
    profile_density_advice: str
    certifications: List[str]


# ── Roadmap ───────────────────────────────────────────────────────────────────
class RoadmapWeekModel(BaseModel):
    week: int
    topic: str
    estimated_hours: int
    skill_gap_addressed: Optional[str] = None
    mini_project: str
    success_criteria: Optional[str] = None
    resource_search_queries: List[str] = []


class RoadmapModel(BaseModel):
    weeks: List[RoadmapWeekModel]

    @model_validator(mode="after")
    def check_eight_weeks(self) -> "RoadmapModel":
        """
        Log a warning (but don't raise) if the roadmap is not exactly 8 weeks.
        Raising here would trigger the fallback path and lose all data.
        """
        if len(self.weeks) != 8:
            import logging
            logging.getLogger(__name__).warning(
                f"Roadmap has {len(self.weeks)} weeks; expected 8. "
                "This is allowed but may indicate an LLM issue."
            )
        return self
