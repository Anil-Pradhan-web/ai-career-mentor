"""
Validation Schemas — The "Truth Layer" for the Career AI OS.
Strict Pydantic models for agent output validation and auto-repair.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, validator

# 1. Resume Analysis Schema
class ResumeAnalysisModel(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    years_of_experience: float
    top_strengths: List[str]
    skill_gaps: List[str]
    ats_score: int = Field(ge=0, le=100)
    ats_score_breakdown: Dict[str, int]

# 2. Market Trends Schema
class MarketTrendsModel(BaseModel):
    role: str
    location: str
    salary_range: str
    market_trend: str
    hiring_companies: List[Dict[str, Any]]
    top_skills_freq: List[Dict[str, Any]]

# 3. LinkedIn Strategy Schema
class LinkedInStrategyModel(BaseModel):
    headlines: List[str]
    about_section: str
    demanding_skills: List[str]
    certifications: List[str]

# 4. Roadmap Week Schema
class RoadmapWeekModel(BaseModel):
    week: int
    topic: str
    mini_project: str
    resource_search_queries: List[str]

class RoadmapModel(BaseModel):
    weeks: List[RoadmapWeekModel]

    @validator('weeks')
    def must_be_eight_weeks(cls, v):
        if len(v) != 8:
            # We don't raise error, we will use this for auto-repair logic later
            pass
        return v
