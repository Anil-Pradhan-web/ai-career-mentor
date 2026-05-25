"""
Validation Schemas — The Truth Layer for the Career AI OS.
Strict Pydantic models for agent output validation.

FIXES:
  - MarketTrendsModel.salary_range: str → Any  (service returns dict, not str)
  - RoadmapModel validator uses @model_validator (Pydantic v2 compatible)
"""
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, field_validator, model_validator


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
    """
    Lenient LinkedIn model: tolerates LLMs that return certifications as dicts,
    null/missing string fields, and partially filled responses.
    """
    headlines: List[str] = []
    about_section: str = ""
    demanding_skills: List[str] = []
    ats_keywords_to_inject: List[str] = []
    recruiter_search_trends: List[str] = []
    profile_density_advice: str = ""
    certifications: List[Any] = []  # Accept str or dict from LLM

    @field_validator("certifications", mode="before")
    @classmethod
    def normalise_certifications(cls, v: Any) -> List[str]:
        """Coerce each certification item to a plain string."""
        if not isinstance(v, list):
            return []
        result = []
        for item in v:
            if isinstance(item, str):
                result.append(item)
            elif isinstance(item, dict):
                # e.g. {"name": "AWS", "expiration_date": "2025-12-31"}
                name = item.get("name") or item.get("title") or item.get("certification", "")
                result.append(str(name) if name else str(item))
            else:
                result.append(str(item))
        return result

    @field_validator("about_section", "profile_density_advice", mode="before")
    @classmethod
    def coerce_str(cls, v: Any) -> str:
        """Convert None / non-string values to an empty string."""
        if v is None:
            return ""
        return str(v)

    @field_validator("headlines", "demanding_skills", "ats_keywords_to_inject", "recruiter_search_trends", mode="before")
    @classmethod
    def coerce_list(cls, v: Any) -> List[str]:
        """Ensure any list-typed field is always a list of strings."""
        if v is None:
            return []
        if isinstance(v, list):
            return [str(i) for i in v if i is not None]
        return []


# ── Roadmap ───────────────────────────────────────────────────────────────────
class RoadmapWeekModel(BaseModel):
    week: int
    topic: str
    estimated_hours: int
    skill_gap_addressed: Optional[str] = None
    mini_project: str
    success_criteria: Optional[str] = None
    resource_search_queries: List[str] = []
    completed: Optional[bool] = False


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
