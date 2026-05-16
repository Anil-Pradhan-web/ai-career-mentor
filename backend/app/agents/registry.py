"""
Agent Registry — Contextual & Modular Runners.
All agent factories and direct LLM runners live here.
"""
import json
import httpx
from typing import Any, Dict, List, Optional
from app.core.config import settings
from loguru import logger


def _call_llm(prompt: str, user_content: str, provider: Optional[str] = None) -> str:
    """Unified LLM caller — uses Groq (OpenAI-compat) or Google Gemini."""
    try:
        active_provider = provider or settings.LLM_PROVIDER
        if active_provider == "groq":
            with httpx.Client() as client:
                response = client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.GROQ_MODEL,
                        "messages": [
                            {"role": "system", "content": prompt},
                            {"role": "user", "content": user_content},
                        ],
                        "response_format": {"type": "json_object"},
                        "temperature": 0.7,
                    },
                    timeout=60.0,
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
                logger.error(f"Groq API Error {response.status_code}: {response.text}")
                return ""
        else:
            import google.generativeai as genai
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            model = genai.GenerativeModel(
                settings.GOOGLE_MODEL,
                generation_config={"response_mime_type": "application/json"},
            )
            response = model.generate_content(f"{prompt}\n\n{user_content}")
            return response.text
    except Exception as e:
        logger.error(f"LLM Call failed: {e}")
        return ""


def _parse_json(text: str) -> Optional[Any]:
    if not text:
        return None
    try:
        clean = text.strip()
        if clean.startswith("```"):
            parts = clean.split("```")
            # Handle ```json ... ``` and ``` ... ```
            inner = parts[1] if len(parts) >= 2 else clean
            if inner.startswith("json"):
                inner = inner[4:]
            clean = inner.strip()
        return json.loads(clean)
    except Exception:
        logger.error(f"JSON Parsing failed for: {text[:200]}...")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# AutoGen Agent Factories
# ─────────────────────────────────────────────────────────────────────────────

def get_user_proxy():
    """Returns a non-interactive UserProxyAgent for single-turn agent tasks."""
    from autogen import UserProxyAgent
    return UserProxyAgent(
        name="UserProxy",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=1,
        code_execution_config=False,
    )


def get_career_coach(llm_config: dict):
    """Career Coach agent for generating 8-week roadmaps."""
    from autogen import AssistantAgent
    return AssistantAgent(
        name="Career_Coach",
        system_message=(
            "You are an elite Career Coach and Senior Staff Engineer. "
            "Design actionable, highly technical career roadmaps that progress logically "
            "from core foundations to advanced, production-grade architectures."
        ),
        llm_config=llm_config,
    )


def get_resume_analyst(llm_config: dict):
    """Resume Analyst agent — augments deterministic ATS output with LLM polish."""
    from autogen import AssistantAgent
    return AssistantAgent(
        name="Resume_Analyst",
        system_message=(
            "You are an elite Senior Technical Recruiter and ATS specialist. "
            "Your job is to take deterministic ATS data and augment it with "
            "human-readable strengths, soft-skill inference, and actionable gap advice. "
            "Always output valid JSON matching the schema given. Never change numeric scores."
        ),
        llm_config=llm_config,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Direct LLM Runners (no AutoGen overhead — used inside LangGraph nodes)
# ─────────────────────────────────────────────────────────────────────────────

def run_resume_analyst(resume_text: str, deterministic_data: dict, provider: Optional[str] = None) -> dict:
    prompt = (
        "You are an elite Senior Technical Recruiter. Format RAW DETERMINISTIC DATA into structured JSON.\n"
        "Input: Deterministic ATS scores, years of experience, and technical skills from a resume.\n"
        "Output ONLY valid JSON matching exactly:\n"
        '{"technical_skills": [], "soft_skills": [], "years_of_experience": 0.0, '
        '"top_strengths": [], "skill_gaps": [], "ats_score": 0, "ats_score_breakdown": {}}'
    )
    user_content = f"DETERMINISTIC DATA:\n{json.dumps(deterministic_data)}\n\nRAW RESUME TEXT:\n{resume_text[:3000]}"
    response_text = _call_llm(prompt, user_content, provider)
    return _parse_json(response_text) or deterministic_data


def run_market_researcher(role: str, location: str, deterministic_data: dict, provider: Optional[str] = None) -> dict:
    prompt = (
        "You are a Tech Market Intelligence Analyst. Format the given market context into a professional JSON summary.\n"
        "Output ONLY valid JSON:\n"
        '{"role": "", "location": "", "salary_range": "", "market_trend": "", '
        '"top_companies": [{"name": "", "hiring_volume": ""}], '
        '"top_skills_freq": [{"skill": "", "frequency": 0}]}'
    )
    user_content = f"DETERMINISTIC DATA:\n{json.dumps(deterministic_data)}\nROLE: {role}\nLOCATION: {location}"
    response_text = _call_llm(prompt, user_content, provider)
    return _parse_json(response_text) or deterministic_data


def run_roadmap_structure(role: str, gaps: list, market_trend: str, provider: Optional[str] = None) -> list:
    prompt = (
        "You are an Elite Career Architect. Create a high-level 8-week technical curriculum structure.\n"
        "Focus on week-by-week topics that bridge the skill gaps for the target role.\n"
        "Output ONLY a valid JSON array of exactly 8 objects:\n"
        '[{"week": 1, "topic": "", "focus_area": ""}]'
    )
    user_content = f"ROLE: {role}\nSKILL GAPS: {json.dumps(gaps)}\nMARKET CONTEXT: {market_trend}"
    response_text = _call_llm(prompt, user_content, provider)
    structure = _parse_json(response_text)

    if isinstance(structure, list) and structure and isinstance(structure[0], dict):
        return structure
    if isinstance(structure, dict):
        for key in ("weeks", "roadmap", "steps", "curriculum"):
            if key in structure and isinstance(structure[key], list):
                return structure[key]

    logger.warning(f"Roadmap structure invalid format: {type(structure)}")
    return []


def run_roadmap_details(week_structure: Any, role: str, provider: Optional[str] = None) -> dict:
    if not isinstance(week_structure, dict):
        logger.error(f"Expected dict for week_structure, got {type(week_structure)}")
        return {
            "week": 0,
            "topic": str(week_structure),
            "mini_project": "Error generating details",
            "resource_search_queries": [],
        }
    prompt = (
        "You are a Staff Engineer. For the given week's topic, design a practical mini-project and search queries.\n"
        "Output ONLY valid JSON:\n"
        '{"mini_project": "", "resource_search_queries": ["query1", "query2", "query3"]}'
    )
    user_content = f"WEEK TOPIC: {week_structure.get('topic', 'General Learning')}\nROLE: {role}"
    response_text = _call_llm(prompt, user_content, provider)
    details = _parse_json(response_text) or {}
    return {**week_structure, **details}


def run_linkedin_optimizer(
    role: str,
    resume_analysis: Optional[dict] = None,
    market_analysis: Optional[dict] = None,
    provider: Optional[str] = None,
) -> dict:
    prompt = (
        f"You are an Elite Tech Career Branding Expert optimizing a LinkedIn profile for a {role} role.\n"
        "Use the provided candidate context to create a personalized strategy.\n"
        "Output ONLY valid JSON:\n"
        '{"headlines": ["headline1", "headline2", "headline3"], '
        '"about_section": "", "demanding_skills": [], "certifications": []}'
    )
    strengths = resume_analysis.get("top_strengths", []) if resume_analysis else []
    gaps = resume_analysis.get("skill_gaps", []) if resume_analysis else []
    market_context = market_analysis.get("market_trend", "Standard demand") if market_analysis else "Standard demand"

    user_content = (
        f"CANDIDATE STRENGTHS: {json.dumps(strengths)}\n"
        f"CANDIDATE GAPS: {json.dumps(gaps)}\n"
        f"MARKET DEMAND: {market_context}"
    )
    response_text = _call_llm(prompt, user_content, provider)
    return _parse_json(response_text) or {"error": "Failed to generate LinkedIn strategy"}
