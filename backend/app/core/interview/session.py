import re
import time
import asyncio
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from loguru import logger

from app.models.models import User, Resume
from app.core.security import ALGORITHM, SECRET_KEY
from app.core.config import settings
from app.core.interview.llm import _get_openai_client
from app.core.observability import track_llm_call


# Active session cache map
active_sessions = {}
_SESSION_MAX_AGE_SECONDS = 7200  # 2 hours


def _purge_stale_sessions():
    """Remove sessions older than SESSION_MAX_AGE to prevent memory leaks."""
    now = time.time()
    stale_keys = [
        k for k, v in active_sessions.items()
        if now - v.get("created_at", now) > _SESSION_MAX_AGE_SECONDS
    ]
    for k in stale_keys:
        del active_sessions[k]
    if stale_keys:
        logger.info(f"[interview] Purged {len(stale_keys)} stale sessions from memory.")


def _get_user_from_token(token: str | None, db: Session) -> User | None:
    """Decode JWT token and retrieve the user."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except JWTError:
        return None
    if not user_id:
        return None
    return db.query(User).filter(User.id == user_id).first()


def build_compressed_resume_summary(resume: Resume | None, current_user: User, candidate_name: str | None = None) -> str:
    """Builds a structured, token-efficient resume summary from the database record."""
    if not resume:
        return ""
    
    parsed = resume.parsed_content or {}
    tech_skills = ", ".join(parsed.get("technical_skills", []))
    soft_skills = ", ".join(parsed.get("soft_skills", []))
    exp = parsed.get("years_of_experience", 0.0)
    strengths = "\n- ".join(parsed.get("top_strengths", []))
    gaps = "\n- ".join(parsed.get("skill_gaps", []))
    
    # Exclude massive 8000+ character raw text. Extract only the first 1500 characters
    # of raw text (enough to discover project names and achievements) to avoid prompt bloat.
    raw_text = resume.raw_text or ""
    projects_summary = ""
    if raw_text:
        projects_summary = raw_text[:1500].strip()
        
    name = candidate_name or current_user.name
    return (
        f"Candidate Name: {name}\n"
        f"Years of Experience: {exp}\n"
        f"Technical Skills: {tech_skills}\n"
        f"Soft Skills: {soft_skills}\n"
        f"Top Strengths:\n- {strengths}\n"
        f"Identified Gaps:\n- {gaps}\n\n"
        f"COMPRESSED EXPERIENCE & PROJECTS:\n"
        f"{projects_summary}"
    )


async def _update_rolling_memory(current_memory: str, last_candidate_msg: str, last_interviewer_msg: str, provider: str = "nvidia") -> str:
    """Invokes LLM in the background to update JSON metrics regarding candidate performance."""
    prompt = (
        "You are an AI tracking candidate performance. Update the candidate profile JSON based on the latest exchange.\n"
        "Output ONLY valid JSON:\n"
        '{"weak_areas": [], "strong_areas": [], "communication_score": 0}'
    )
    user_content = f"CURRENT MEMORY: {current_memory}\nINTERVIEWER: {last_interviewer_msg}\nCANDIDATE: {last_candidate_msg}"
    
    providers_to_try = ["nvidia", "groq"]
    last_err = None
    
    for active_provider in providers_to_try:
        try:
            client = _get_openai_client(active_provider)
            model_name = settings.NVIDIA_MODEL if active_provider == "nvidia" else settings.GROQ_MODEL
            def _do_call(cl=client, md=model_name):
                return cl.chat.completions.create(
                    model=md,
                    messages=[{"role": "system", "content": prompt}, {"role": "user", "content": user_content}],
                    response_format={"type": "json_object"},
                    temperature=0.3
                )
            start_time = time.time()
            resp = await asyncio.to_thread(_do_call)
            latency = time.time() - start_time
            
            output_content = resp.choices[0].message.content or ""
            input_tokens = (len(prompt) + len(user_content)) // 4
            output_tokens = len(output_content) // 4
            try:
                track_llm_call(active_provider, latency, input_tokens, output_tokens)
            except Exception as e:
                logger.warning(f"Failed to track rolling memory LLM call: {e}")
                
            return output_content or current_memory
        except Exception as e:
            logger.warning(f"Interview rolling memory update failed with provider {active_provider}: {e}")
            last_err = e
            
    logger.error(f"All providers failed for interview rolling memory update. Last error: {last_err}")
    return current_memory



def _extract_interview_score(msg_content: str) -> float:
    """Normalize final interview scores to a 0-100 scale."""
    match_overall = re.search(r'OVERALL SCORE\s*:\s*(\d+)\s*/\s*(\d+)', msg_content, re.IGNORECASE)
    if match_overall:
        score = float(match_overall.group(1))
        denom = float(match_overall.group(2))
        if denom > 0:
            return (score / denom) * 100

    for pattern, denom in [(r'(\d+)\s*/\s*100', 100), (r'(\d+)\s*/\s*70', 70), (r'(\d+)\s*/\s*50', 50), (r'(\d+)\s*/\s*10', 10)]:
        m = re.search(pattern, msg_content)
        if m:
            return (float(m.group(1)) / denom) * 100

    return 80.0
