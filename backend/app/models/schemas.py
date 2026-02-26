"""
Pydantic schemas — request/response models for all API endpoints.
"""
from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, EmailStr


# ── Health ────────────────────────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    provider: str
    model: str


# ── Auth ──────────────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    name: Optional[str] = None


# ── Resume ────────────────────────────────────────────────────────────────────
class ResumeAnalysisResponse(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    years_of_experience: float
    top_strengths: List[str]
    skill_gaps: List[str]


# ── Roadmap ───────────────────────────────────────────────────────────────────
class RoadmapRequest(BaseModel):
    target_role: str
    skill_gaps: List[str]


class RoadmapWeek(BaseModel):
    week: int
    topic: str
    resource_url: str
    estimated_hours: int
    mini_project: str


class RoadmapResponse(BaseModel):
    target_role: str
    weeks: List[RoadmapWeek]


# ── Market ────────────────────────────────────────────────────────────────────
class MarketTrendsResponse(BaseModel):
    role: str
    location: str
    top_skills: List[str]
    salary_range: str
    top_companies: List[str]
    market_trend: str  # "Growing" | "Stable" | "Declining"


# ── Interview ─────────────────────────────────────────────────────────────────
class InterviewStartRequest(BaseModel):
    target_role: str
    user_id: Optional[str] = None


class InterviewMessage(BaseModel):
    role: str  # "interviewer" | "candidate"
    content: str
    timestamp: Optional[datetime] = None


class InterviewScoreCard(BaseModel):
    total_score: int  # out of 100
    feedback: str
    question_scores: List[dict]


# ── Full Analysis (Day 6) ─────────────────────────────────────────────────────
class FullAnalysisRequest(BaseModel):
    target_role: str
    resume_text: str
    location: str = "United States"


class FullAnalysisResponse(BaseModel):
    resume_analysis: Any
    market_trends: Any
    roadmap: Any
    agent_logs: List[dict]
