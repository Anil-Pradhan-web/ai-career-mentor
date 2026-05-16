"""
Agent Registry — Contextual & Modular Runners.
Upgraded to support personalized LinkedIn branding and modular roadmap generation.
"""
import json
import google.generativeai as genai
import httpx
from typing import Any, Dict, List
from app.core.config import settings
from loguru import logger

def _call_llm(prompt: str, user_content: str, provider: str = None) -> str:
    """Unified LLM caller that respects settings.LLM_PROVIDER or specific provider."""
    try:
        active_provider = provider or settings.LLM_PROVIDER
        if active_provider == "groq":
            # ── Groq (OpenAI-compatible) ──────────────────────────────────
            with httpx.Client() as client:
                response = client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": settings.GROQ_MODEL,
                        "messages": [
                            {"role": "system", "content": prompt},
                            {"role": "user", "content": user_content}
                        ],
                        "response_format": {"type": "json_object"},
                        "temperature": 0.7
                    },
                    timeout=60.0
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"]
                else:
                    logger.error(f"Groq API Error: {response.text}")
                    return ""
        else:
            # ── Google Gemini (Default) ─────────────────────────────────────
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            model = genai.GenerativeModel(
                settings.GOOGLE_MODEL,
                generation_config={"response_mime_type": "application/json"}
            )
            response = model.generate_content(f"{prompt}\n\n{user_content}")
            return response.text
    except Exception as e:
        logger.error(f"LLM Call failed: {e}")
        return ""

def _parse_json(text: str):
    if not text: return None
    try:
        # Clean potential markdown code blocks
        clean_text = text.strip()
        if clean_text.startswith("```"):
            clean_text = clean_text.split("```")[1]
            if clean_text.startswith("json"):
                clean_text = clean_text[4:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
        return json.loads(clean_text)
    except:
        logger.error(f"JSON Parsing failed for: {text[:200]}...")
        return None

# ── USER PROXY (Autogen Helper) ──────────────────────────────────────────────
def get_user_proxy():
    """Returns a dummy user proxy for non-interactive agent tasks."""
    from autogen import UserProxyAgent
    return UserProxyAgent(
        name="UserProxy",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=1,
        code_execution_config=False
    )

def get_career_coach(llm_config: dict):
    from autogen import AssistantAgent
    return AssistantAgent(
        name="Career_Coach",
        system_message="You are an elite Career Coach and Senior Staff Engineer. Design actionable, highly technical career roadmaps that progress logically from core foundations to advanced, production-grade architectures.",
        llm_config=llm_config
    )

# ── RESUME ANALYST ───────────────────────────────────────────────────────────
def run_resume_analyst(resume_text: str, deterministic_data: dict, provider: str = None) -> dict:
    prompt = (
        "You are an elite Senior Technical Recruiter. Format RAW DETERMINISTIC DATA into structured JSON.\n"
        "Input: Deterministic ATS scores, years of experience, and technical skills.\n"
        "Output: JSON {technical_skills: [], soft_skills: [], years_of_experience: float, top_strengths: [], skill_gaps: [], ats_score: int, ats_score_breakdown: {}}"
    )
    user_content = f"DETERMINISTIC DATA:\n{json.dumps(deterministic_data)}\n\nRAW TEXT:\n{resume_text}"
    response_text = _call_llm(prompt, user_content, provider)
    return _parse_json(response_text) or deterministic_data

# ── MARKET RESEARCHER ────────────────────────────────────────────────────────
def run_market_researcher(role: str, location: str, deterministic_data: dict, provider: str = None) -> dict:
    prompt = (
        "You are a Tech Market Intelligence Analyst. Format market snippets into a professional JSON summary.\n"
        "Output: JSON {role: str, location: str, salary_range: str, market_trend: str, top_companies: [{name: str, hiring_volume: str}], top_skills_freq: [{skill: str, frequency: int}]}"
    )
    user_content = f"DETERMINISTIC DATA:\n{json.dumps(deterministic_data)}\nROLE: {role}\nLOCATION: {location}"
    response_text = _call_llm(prompt, user_content, provider)
    return _parse_json(response_text) or deterministic_data

# ── MODULAR ROADMAP (Step 1: Structure) ──────────────────────────────────────
def run_roadmap_structure(role: str, gaps: list, market_trend: str, provider: str = None) -> list:
    prompt = (
        "You are an Elite Career Architect. Create a high-level 8-week technical curriculum structure.\n"
        "Focus on week-by-week topics that bridge the skill gaps for the target role.\n"
        "Output: JSON array of 8 objects: [{week: int, topic: str, focus_area: str}]"
    )
    user_content = f"ROLE: {role}\nSKILL GAPS: {json.dumps(gaps)}\nMARKET CONTEXT: {market_trend}"
    response_text = _call_llm(prompt, user_content, provider)
    structure = _parse_json(response_text)
    
    # Validation: Ensure it's a list of dicts
    if isinstance(structure, list) and len(structure) > 0:
        if isinstance(structure[0], dict):
            return structure
            
    # Handle wrapped dict: {"weeks": [...]} or {"roadmap": [...]}
    if isinstance(structure, dict):
        for key in ["weeks", "roadmap", "steps", "curriculum"]:
            if key in structure and isinstance(structure[key], list):
                return structure[key]
    
    logger.warning(f"Roadmap structure invalid format: {type(structure)}")
    return []

# ── MODULAR ROADMAP (Step 2: Projects & Queries) ─────────────────────────────
def run_roadmap_details(week_structure: Any, role: str, provider: str = None) -> dict:
    # Guard against non-dict structure
    if not isinstance(week_structure, dict):
        logger.error(f"Expected dict for week_structure, got {type(week_structure)}")
        return {"week": 0, "topic": str(week_structure), "mini_project": "Error generating details", "resource_search_queries": []}

    prompt = (
        "You are a Staff Engineer. For the given week's topic, design a practical mini-project and search queries.\n"
        "Output: JSON {mini_project: str, resource_search_queries: [list of 3 queries]}"
    )
    user_content = f"WEEK TOPIC: {week_structure.get('topic', 'General Learning')}\nROLE: {role}"
    response_text = _call_llm(prompt, user_content, provider)
    details = _parse_json(response_text) or {}
    return {**week_structure, **details}

# ── CONTEXTUAL LINKEDIN OPTIMIZER ────────────────────────────────────────────
def run_linkedin_optimizer(role: str, resume_analysis: dict = None, market_analysis: dict = None, provider: str = None) -> dict:
    prompt = (
        f"You are an Elite Tech Career Branding Expert optimizing a profile for a {role} role.\n"
        "Use the provided candidate context (if any) and market demand to create a personalized strategy.\n"
        "Output: JSON {headlines: [3 strings with tech-related emojis like 🚀💻⚙️☁️], about_section: str, demanding_skills: [], certifications: []}"
    )
    
    # Safely extract context
    strengths = resume_analysis.get('top_strengths', []) if resume_analysis else []
    gaps = resume_analysis.get('skill_gaps', []) if resume_analysis else []
    market_context = market_analysis.get('market_trend', 'Standard demand') if market_analysis else "Standard demand"
    
    user_content = (
        f"CANDIDATE STRENGTHS: {json.dumps(strengths)}\n"
        f"CANDIDATE GAPS: {json.dumps(gaps)}\n"
        f"MARKET DEMAND: {market_context}"
    )
    response_text = _call_llm(prompt, user_content, provider)
    return _parse_json(response_text) or {"error": "Failed to generate LinkedIn strategy"}
