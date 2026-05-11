import json
import asyncio
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from loguru import logger

from app.core.database import get_db
from app.agents.registry import get_user_proxy, get_linkedin_reviewer
from app.api.deps import get_current_user
from app.core.rate_limit import check_daily_limit, increment_usage
from app.core.activity import log_activity

router = APIRouter()

class LinkedInRequest(BaseModel):
    profile_text: str
    provider: Optional[str] = None

def _parse_linkedin_json(raw: str) -> dict:
    cleaned = raw.strip()
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()

    # Try direct parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Regex fallback: find first { and last }
    start = raw.find("{")
    end = raw.rfind("}")
    if start != -1 and end != -1:
        try:
            return json.loads(raw[start:end+1])
        except:
            pass
    raise ValueError("Could not extract JSON from LinkedIn review response.")

@router.post("/review")
async def review_linkedin(
    req: LinkedInRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    check_daily_limit(current_user.id, "linkedin")
    if not req.profile_text or len(req.profile_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Profile text is too short. Please provide more text.")

    from app.core.config import settings

    prompt = (
        "Please review the following LinkedIn profile text and provide constructive feedback in valid JSON format.\n\n"
        f"PROFILE TEXT:\n{req.profile_text}"
    )

    async def run_linkedin_agent(p_provider: str) -> dict:
        llm_config = settings.get_llm_config(p_provider)
        user_proxy = get_user_proxy()
        reviewer = get_linkedin_reviewer(llm_config=llm_config)

        await asyncio.to_thread(
            user_proxy.initiate_chat,
            reviewer,
            message=prompt,
            max_turns=1,
        )

        last_msg = user_proxy.last_message(reviewer)
        content = (last_msg.get("content") or "" if last_msg else "").strip()
        if not content:
            msgs = user_proxy.chat_messages.get(reviewer, [])
            content = next((m["content"] for m in reversed(msgs) if (m.get("content") or "").strip()), "")

        if not content:
            raise ValueError("LinkedIn agent returned no response.")

        return _parse_linkedin_json(content)

    try:
        try:
            result = await run_linkedin_agent(req.provider)
        except Exception as exc:
            msg = str(exc)
            should_fallback = (
                req.provider == "google" or (not req.provider and settings.LLM_PROVIDER == "google")
            ) and ("429" in msg or "quota" in msg.lower() or "exhausted" in msg.lower())

            if should_fallback:
                logger.warning("Gemini 429: Falling back to GROQ for LinkedIn review")
                result = await run_linkedin_agent("groq")
            else:
                raise

        increment_usage(current_user.id, "linkedin")
        log_activity(db, current_user.id, "Reviewed LinkedIn Profile", "linkedin")
        return {"analysis": result}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reviewing LinkedIn profile: {e}")
        raise HTTPException(status_code=500, detail=f"LinkedIn review failed: {str(e)}")

