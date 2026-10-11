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
    experience_breakdown: List[str] = []
    top_strengths: List[str]
    skill_gaps: List[str]
    ats_score: int = Field(ge=0, le=100)
    ats_score_breakdown: Dict[str, int]
    rag_benchmarks: Optional[Dict[str, Any]] = None
    bullet_improvements: List[Dict[str, str]] = []
    prioritized_gaps: Dict[str, List[str]] = Field(default_factory=lambda: {"critical": [], "differentiators": [], "bonus": []})
    recruiter_pitch: Optional[str] = ""

    @field_validator("bullet_improvements", mode="before")
    @classmethod
    def normalise_bullet_improvements(cls, v: Any) -> List[Dict[str, str]]:
        if not isinstance(v, list):
            return []
        res = []
        for item in v:
            if isinstance(item, dict):
                res.append({
                    "original": str(item.get("original") or ""),
                    "improved": str(item.get("improved") or item.get("rewritten") or ""),
                    "reason": str(item.get("reason") or item.get("impact") or ""),
                })
            elif isinstance(item, str):
                res.append({"original": item, "improved": item, "reason": "Enhanced with action verbs and metrics."})
        return res

    @field_validator("prioritized_gaps", mode="before")
    @classmethod
    def normalise_prioritized_gaps(cls, v: Any) -> Dict[str, List[str]]:
        if not isinstance(v, dict):
            return {"critical": [], "differentiators": [], "bonus": []}
        return {
            "critical": [str(x) for x in v.get("critical", []) if x],
            "differentiators": [str(x) for x in v.get("differentiators", []) if x],
            "bonus": [str(x) for x in v.get("bonus", []) if x],
        }

    @field_validator("recruiter_pitch", mode="before")
    @classmethod
    def normalise_recruiter_pitch(cls, v: Any) -> str:
        return str(v) if v is not None else ""

    @field_validator("experience_breakdown", mode="before")
    @classmethod
    def normalise_experience_breakdown(cls, v: Any) -> List[str]:
        """Coerce each experience breakdown item to a plain formatted string."""
        if not isinstance(v, list):
            return []
        result = []
        for item in v:
            if isinstance(item, str):
                result.append(item)
            elif isinstance(item, dict):
                role = item.get("job_title") or item.get("role") or item.get("title")
                company = item.get("company") or item.get("company_name") or item.get("organization")
                duration = item.get("duration") or item.get("dates") or item.get("period")
                desc = item.get("description") or item.get("summary") or item.get("achievements")
                
                parts = []
                if role and company:
                    parts.append(f"{role} at {company}")
                elif role:
                    parts.append(role)
                elif company:
                    parts.append(company)
                    
                if duration:
                    parts.append(f"({duration})")
                    
                main_str = " ".join(parts)
                if desc:
                    if main_str:
                        main_str = f"{main_str}: {desc}"
                    else:
                        main_str = desc
                
                if main_str:
                    result.append(main_str)
                else:
                    result.append(str(item))
            else:
                result.append(str(item))
        return result

    @model_validator(mode="after")
    def clean_ats_score(self) -> "ResumeAnalysisModel":
        """
        Ensure ats_score_breakdown categories do not exceed their maximum limits
        and ats_score is updated to equal their sum.
        Max limits: keywords: 35, achievements: 30, action_verbs: 20, formatting_and_length: 15.
        """
        bd = self.ats_score_breakdown or {}
        
        # Define limits
        limits = {
            "keywords": 35,
            "achievements": 30,
            "action_verbs": 20,
            "formatting_and_length": 15
        }
        
        # Cap values
        capped_bd = {}
        for key, max_val in limits.items():
            val = bd.get(key, 0)
            capped_bd[key] = max(0, min(val, max_val))
            
        self.ats_score_breakdown = capped_bd
        self.ats_score = sum(capped_bd.values())
        return self






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
    summary: Optional[str] = ""
    sources: List[str] = []
    negotiation_tactics: List[str] = []
    emerging_signals: List[str] = []

    @field_validator("negotiation_tactics", "emerging_signals", mode="before")
    @classmethod
    def normalise_market_lists(cls, v: Any) -> List[str]:
        if not isinstance(v, list):
            return []
        return [str(x) for x in v if x is not None]


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
    outreach_templates: List[Dict[str, str]] = []
    featured_post_draft: Optional[str] = ""

    @field_validator("outreach_templates", mode="before")
    @classmethod
    def normalise_outreach_templates(cls, v: Any) -> List[Dict[str, str]]:
        if not isinstance(v, list):
            return []
        res = []
        for item in v:
            if isinstance(item, dict):
                res.append({
                    "target": str(item.get("target") or "Recruiter"),
                    "subject": str(item.get("subject") or ""),
                    "message": str(item.get("message") or item.get("body") or ""),
                })
            elif isinstance(item, str):
                res.append({"target": "Connection", "subject": "Networking", "message": item})
        return res

    @field_validator("featured_post_draft", mode="before")
    @classmethod
    def normalise_featured_post_draft(cls, v: Any) -> str:
        return str(v) if v is not None else ""

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
    prerequisites: List[str] = []
    success_criteria: Optional[str] = None
    resource_search_queries: List[str] = []
    explore_more_questions: List[str] = []
    completed: Optional[bool] = False
    project_milestones: List[str] = []
    interview_prep_questions: List[Dict[str, str]] = []
    curated_resources: List[Dict[str, str]] = []

    @field_validator("project_milestones", mode="before")
    @classmethod
    def normalise_project_milestones(cls, v: Any) -> List[str]:
        if not isinstance(v, list):
            return []
        res = []
        for item in v:
            if isinstance(item, dict):
                title = item.get("title") or item.get("name") or item.get("step") or ""
                desc = item.get("description") or item.get("details") or ""
                res.append(f"{title}: {desc}".strip(": ") if title and desc else str(title or desc or item))
            elif item is not None:
                res.append(str(item))
        return res

    @field_validator("interview_prep_questions", mode="before")
    @classmethod
    def normalise_interview_prep_questions(cls, v: Any) -> List[Dict[str, str]]:
        if not isinstance(v, list):
            return []
        res = []
        for item in v:
            if isinstance(item, dict):
                res.append({
                    "question": str(item.get("question") or item.get("q") or ""),
                    "answer_hint": str(item.get("answer_hint") or item.get("hint") or item.get("answer") or ""),
                })
            elif isinstance(item, str):
                res.append({"question": item, "answer_hint": "Focus on core architectural principles and trade-offs."})
        return res

    @field_validator("curated_resources", mode="before")
    @classmethod
    def normalise_curated_resources(cls, v: Any) -> List[Dict[str, str]]:
        if not isinstance(v, list):
            return []
        res = []
        for item in v:
            if isinstance(item, dict):
                res.append({
                    "title": str(item.get("title") or item.get("name") or "Official Documentation"),
                    "type": str(item.get("type") or "guide"),
                    "url": str(item.get("url") or item.get("link") or ""),
                })
            elif isinstance(item, str):
                res.append({"title": item, "type": "resource", "url": ""})
        return res


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


# ── Executive Career Synthesis ───────────────────────────────────────────────
class ExecutiveSummaryModel(BaseModel):
    market_fit_narrative: str = ""
    key_strengths_identified: List[str] = []
    primary_bottlenecks: List[str] = []
    execution_bridge: str = ""
    offer_strategy: str = ""

    @field_validator("market_fit_narrative", mode="before")
    @classmethod
    def normalise_market_fit(cls, v: Any) -> str:
        return str(v) if v is not None else ""

    @field_validator("key_strengths_identified", "primary_bottlenecks", mode="before")
    @classmethod
    def normalise_str_list(cls, v: Any) -> List[str]:
        if isinstance(v, list):
            return [str(item) for item in v if item]
        if isinstance(v, str) and v.strip():
            return [v.strip()]
        return []

    @field_validator("execution_bridge", "offer_strategy", mode="before")
    @classmethod
    def normalise_strategy_str(cls, v: Any) -> str:
        return str(v) if v is not None else ""

