import json
from fastapi import APIRouter, HTTPException
from loguru import logger

from app.models.schemas import FullAnalysisRequest, FullAnalysisResponse

router = APIRouter()

def _extract_json_from_agent_messages(messages, agent_name: str):
    """
    Finds the last message sent by a specific agent and extracts JSON.
    """
    # Search backwards for the most recent message from 'agent_name'
    agent_msg = ""
    for m in reversed(messages):
        if m.get("name") == agent_name and m.get("content"):
            agent_msg = m["content"].strip()
            break
            
    if not agent_msg:
        logger.warning(f"No message found from {agent_name}")
        return {}

    # Extract JSON inside code blocks if present
    cleaned = agent_msg
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.warning(f"JSON decode failed for {agent_name}: {exc}. Raw: {cleaned[:300]}")
        return {}


@router.post(
    "/full-analysis",
    response_model=FullAnalysisResponse,
    summary="Run all 3 agents (Resume Analyst, Market, Career Coach) via GroupChat"
)
async def run_full_analysis(request: FullAnalysisRequest) -> FullAnalysisResponse:
    from app.agents.workflow import run_full_career_analysis
    
    logger.info(f"career/full-analysis: Started for role='{request.target_role}'")
    
    try:
        # 1. Run the GroupChat orchestration
        messages = run_full_career_analysis(request.resume_text, request.target_role, request.location)
    except Exception as exc:
        logger.exception("Full career analysis GroupChat failed")
        raise HTTPException(status_code=500, detail=str(exc))
        
    # 2. Extract specific agent outputs
    resume_data = _extract_json_from_agent_messages(messages, "Resume_Analyst")
    market_data = _extract_json_from_agent_messages(messages, "Market_Researcher")
    coach_data = _extract_json_from_agent_messages(messages, "Career_Coach")
    
    # 3. Handle fallback parsing in case LLaMA got confused about agent names 
    # (Sometimes the proxy impersonates or the system returns lists instead of dicts)
    
    # Career_Coach outputs a list of dicts. If missing, check all messages for a list structure.
    if not coach_data:
        for m in reversed(messages):
            if m.get("content"):
                try:
                    p = json.loads(m["content"].split("```json")[-1].split("```")[0])
                    if isinstance(p, list) and len(p) > 0 and "week" in p[0]:
                        coach_data = p
                        break
                except:
                    pass

    return FullAnalysisResponse(
        resume_analysis=resume_data if resume_data else {"technical_skills": [], "soft_skills": [], "skill_gaps": [], "top_strengths": [], "years_of_experience": 0},
        market_trends=market_data if market_data else {"top_skills": [], "salary_range": "Unknown", "top_companies": [], "market_trend": "Unknown"},
        roadmap={"target_role": request.target_role, "weeks": coach_data} if isinstance(coach_data, list) else {"target_role": request.target_role, "weeks": []},
        agent_logs=messages
    )
