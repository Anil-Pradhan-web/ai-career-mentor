"""
Agent Registry — Contextual & Modular Runners.
All agent factories and direct LLM runners live here.
"""
import json
import httpx
import time
from typing import Any, Dict, List, Optional, Type
from pydantic import BaseModel
from app.core.config import settings
from loguru import logger
from app.models.validation import ResumeAnalysisModel, MarketTrendsModel, LinkedInStrategyModel

CIRCUIT_BREAKER = {"fails": 0, "disabled_until": 0.0}


def _call_llm(prompt: str, user_content: str, provider: Optional[str] = None, response_model: Optional[Type[BaseModel]] = None, max_retries: int = 3) -> Any:
    """Unified LLM caller with Exponential Backoff, Circuit Breaker, and Structured Outputs."""
    
    if time.time() < CIRCUIT_BREAKER["disabled_until"]:
        logger.warning("Circuit breaker OPEN. Skipping API call.")
        return None

    active_provider = provider or settings.LLM_PROVIDER
    
    # Establish dynamic fallback chain: groq fallback to gemini, nvidia fallback to gemini
    if active_provider == "nvidia":
        fallback_chain = ["nvidia", "google"]
    elif active_provider == "groq":
        fallback_chain = ["groq", "google"]
    else:
        fallback_chain = ["google"]
    
    for attempt in range(max_retries):
        try:
            response_text = ""
            
            # NVIDIA NIM API (OpenAI Compatible)
            if active_provider == "nvidia":
                safe_prompt = prompt if "json" in prompt.lower() else prompt + "\n\nYou must output in JSON format."
                with httpx.Client() as client:
                    response = client.post(
                        "https://integrate.api.nvidia.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                        },
                        json={
                            "model": settings.NVIDIA_MODEL,
                            "messages": [
                                {"role": "system", "content": safe_prompt},
                                {"role": "user", "content": user_content},
                            ],
                            "temperature": 0.7,
                            "max_tokens": 2048,
                        },
                        timeout=120.0,
                    )
                    if response.status_code == 200:
                        response_text = response.json()["choices"][0]["message"]["content"]
                    else:
                        raise ValueError(f"NVIDIA API Error {response.status_code}: {response.text}")
                        
            # GROQ API (OpenAI Compatible)
            elif active_provider == "groq":
                safe_prompt = prompt if "json" in prompt.lower() else prompt + "\n\nYou must output in JSON format."
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
                                {"role": "system", "content": safe_prompt},
                                {"role": "user", "content": user_content},
                            ],
                            "response_format": {"type": "json_object"},
                            "temperature": 0.7,
                        },
                        timeout=60.0,
                    )
                    if response.status_code == 200:
                        response_text = response.json()["choices"][0]["message"]["content"]
                    else:
                        raise ValueError(f"Groq API Error {response.status_code}: {response.text}")
                        
            # GOOGLE GEMINI API
            else:
                import google.generativeai as genai
                genai.configure(api_key=settings.GOOGLE_API_KEY)
                model = genai.GenerativeModel(
                    settings.GOOGLE_MODEL,
                    generation_config={"response_mime_type": "application/json"},
                )
                response = model.generate_content(f"{prompt}\n\n{user_content}")
                response_text = response.text

            # Parse with Pydantic if model provided
            if response_model and response_text:
                import re
                clean = response_text.strip()
                
                # Robust extraction
                # Try finding markdown code block first
                match = re.search(r"```(?:json)?\s*(.*?)\s*```", clean, re.DOTALL)
                if match:
                    clean = match.group(1).strip()
                else:
                    # Find outermost array '[' or object '{'
                    start_bracket = clean.find('[')
                    start_brace = clean.find('{')
                    
                    if start_bracket != -1 and (start_brace == -1 or start_bracket < start_brace):
                        start = start_bracket
                        end = clean.rfind(']')
                    else:
                        start = start_brace
                        end = clean.rfind('}')
                        
                    if start != -1 and end != -1 and end > start:
                        clean = clean[start:end+1].strip()
                
                parsed = response_model.model_validate_json(clean)
                CIRCUIT_BREAKER["fails"] = 0  # reset on success
                return parsed.model_dump()
            
            CIRCUIT_BREAKER["fails"] = 0
            return response_text

        except Exception as e:
            logger.error(f"LLM Call failed on {active_provider} (Attempt {attempt + 1}/{max_retries}): {e}")
            
            # Fallback logic: If one provider fails, try the next one in the chain immediately
            if active_provider in fallback_chain:
                current_idx = fallback_chain.index(active_provider)
                if current_idx < len(fallback_chain) - 1:
                    next_provider = fallback_chain[current_idx + 1]
                    logger.warning(f"Falling back from {active_provider} to {next_provider}")
                    active_provider = next_provider
                    continue # Try next provider immediately without sleeping
            
            CIRCUIT_BREAKER["fails"] += 1
            if CIRCUIT_BREAKER["fails"] >= 5:
                CIRCUIT_BREAKER["disabled_until"] = time.time() + 60
                logger.error("Circuit breaker TRIPPED! Disabling LLM calls for 60 seconds.")
                break
            time.sleep(2 ** attempt)  # Exponential backoff: 1s, 2s, 4s

    return None

def _parse_json(text: Any) -> Optional[Any]:
    if not text:
        return None
    if isinstance(text, dict) or isinstance(text, list):
        return text
    try:
        import re
        clean = text.strip()
        
        # Robust extraction
        # Try finding markdown code block first
        match = re.search(r"```(?:json)?\s*(.*?)\s*```", clean, re.DOTALL)
        if match:
            clean = match.group(1).strip()
        else:
            # Find outermost array '[' or object '{'
            start_bracket = clean.find('[')
            start_brace = clean.find('{')
            
            if start_bracket != -1 and (start_brace == -1 or start_bracket < start_brace):
                start = start_bracket
                end = clean.rfind(']')
            else:
                start = start_brace
                end = clean.rfind('}')
                
            if start != -1 and end != -1 and end > start:
                clean = clean[start:end+1].strip()
                
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
        "You MUST output exactly this JSON schema:\n"
        '{"technical_skills": [], "soft_skills": [], "years_of_experience": 0.0, "top_strengths": [], "skill_gaps": [], "ats_score": 0, "ats_score_breakdown": {"keywords": 0, "achievements": 0, "action_verbs": 0, "formatting_and_length": 0}}'
    )
    user_content = f"DETERMINISTIC DATA:\n{json.dumps(deterministic_data)}\n\nRAW RESUME TEXT:\n{resume_text[:3000]}"
    result = _call_llm(prompt, user_content, provider, response_model=ResumeAnalysisModel)
    return result or deterministic_data


def run_market_researcher(role: str, location: str, deterministic_data: dict, provider: Optional[str] = None) -> dict:
    prompt = (
        "You are a Tech Market Intelligence Analyst. Format the given market context into a professional JSON summary.\n"
        "Ensure 'hiring_volume' extracts the raw number of open roles if available (e.g., '1,200+ Roles').\n"
        "You MUST output exactly this JSON schema:\n"
        '{"role": "", "location": "", "salary_range": {}, "market_trend": "", "hiring_volume": "", "hiring_companies": [{"name": "", "hiring_volume": "High/Medium/Low"}], "top_skills_freq": [{"skill": "", "frequency": 0}]}'
    )
    user_content = f"DETERMINISTIC DATA:\n{json.dumps(deterministic_data)}\nROLE: {role}\nLOCATION: {location}"
    result = _call_llm(prompt, user_content, provider, response_model=MarketTrendsModel)
    return result or deterministic_data


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


def run_roadmap_details_batch(week_structures: list, role: str, provider: Optional[str] = None) -> list:
    """Processes multiple weeks in a single LLM call to save rate limits."""
    if not week_structures:
        return []
        
    prompt = (
        "You are a Staff Engineer. For the given weeks, design a practical mini-project and search queries.\n"
        "Output ONLY a valid JSON array of objects, one for each input week. Exactly matching this schema per object:\n"
        '[{"mini_project": "", "estimated_hours": 0, "success_criteria": "", "skill_gap_addressed": "", "resource_search_queries": ["query1", "query2"]}]'
    )
    
    topics = "\n".join([f"Week {w.get('week')}: {w.get('topic', 'Learning')}" for w in week_structures])
    user_content = f"WEEKS TO PROCESS:\n{topics}\nROLE: {role}"
    
    response_text = _call_llm(prompt, user_content, provider)
    details_array = _parse_json(response_text) or []
    
    if not isinstance(details_array, list) or len(details_array) < len(week_structures):
        # Fallback if LLM messes up the array size
        details_array = [{} for _ in week_structures]
        
    enriched_weeks = []
    for i, week in enumerate(week_structures):
        details = details_array[i] if i < len(details_array) and isinstance(details_array[i], dict) else {}
        details["estimated_hours"] = details.get("estimated_hours") or 10
        enriched_weeks.append({**week, **details})
        
    return enriched_weeks


def run_linkedin_optimizer(
    role: str,
    resume_analysis: Optional[dict] = None,
    market_analysis: Optional[dict] = None,
    provider: Optional[str] = None,
) -> dict:
    prompt = (
        f"You are an Elite Tech Career Branding Expert optimizing a LinkedIn profile for a {role} role.\n"
        "Use the provided candidate context, market trends, and job match data to create a high-converting personalized strategy.\n"
        "Focus on injecting high-impact ATS keywords, identifying recruiter search trends, and giving strict profile density advice.\n"
        "You MUST output exactly this JSON schema:\n"
        '{"headlines": [], "about_section": "", "demanding_skills": [], "ats_keywords_to_inject": [], "recruiter_search_trends": [], "profile_density_advice": "", "certifications": []}'
    )
    strengths = resume_analysis.get("top_strengths", []) if resume_analysis else []
    gaps = resume_analysis.get("skill_gaps", []) if resume_analysis else []
    market_context = market_analysis.get("market_trend", "Standard demand") if market_analysis else "Standard demand"
    top_companies = market_analysis.get("hiring_companies", []) if market_analysis else []
    top_market_skills = market_analysis.get("top_skills_freq", []) if market_analysis else []

    user_content = (
        f"CANDIDATE STRENGTHS: {json.dumps(strengths)}\n"
        f"CANDIDATE GAPS: {json.dumps(gaps)}\n"
        f"MARKET DEMAND: {market_context}\n"
        f"TOP HIRING COMPANIES: {json.dumps(top_companies)}\n"
        f"HIGH-FREQUENCY MARKET SKILLS: {json.dumps(top_market_skills)}\n"
    )
    result = _call_llm(prompt, user_content, provider, response_model=LinkedInStrategyModel)
    return result or {"error": "Failed to generate LinkedIn strategy"}
