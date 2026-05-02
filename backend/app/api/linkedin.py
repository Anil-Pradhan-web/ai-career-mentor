import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from loguru import logger

from app.core.database import get_db
from app.agents.registry import get_user_proxy, get_linkedin_reviewer
from app.api.deps import get_current_user
from app.core.rate_limit import check_daily_limit, increment_usage

router = APIRouter()

class LinkedInRequest(BaseModel):
    profile_text: str
    provider: Optional[str] = None

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
    llm_config = settings.get_llm_config(req.provider)
    user_proxy = get_user_proxy()
    reviewer = get_linkedin_reviewer(llm_config=llm_config)

    prompt = f"""
    Please review the following LinkedIn profile text and provide constructive feedback in valid JSON format.
    
    PROFILE TEXT:
    {req.profile_text}
    """
    
    try:
        chat_res = user_proxy.initiate_chat(
            reviewer,
            message=prompt,
            summary_method="last_msg"
        )
        
        content = chat_res.summary
        
        # Parse JSON
        start_idx = content.find('{')
        end_idx = content.rfind('}')
        if start_idx != -1 and end_idx != -1:
            json_str = content[start_idx:end_idx+1]
            result = {"analysis": json.loads(json_str)}
            increment_usage(current_user.id, "linkedin")
            log_activity(db, current_user.id, "Reviewed LinkedIn Profile", "linkedin")
            return result
        else:
            raise ValueError("No JSON object found in response")

    except Exception as e:
        logger.error(f"Error reviewing LinkedIn profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze LinkedIn profile.")

from app.core.activity import log_activity
