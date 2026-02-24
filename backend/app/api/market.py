import json
from fastapi import APIRouter, HTTPException, Query
from loguru import logger
from app.models.schemas import MarketTrendsResponse

router = APIRouter()

def _parse_agent_json(raw: str) -> dict:
    import json
    cleaned = raw.strip()
    # Strip markdown code fences
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.warning(f"market: JSON parse failed — {exc}. raw={raw[:300]}")
        raise ValueError(f"Agent returned non-JSON output: {str(exc)}")

    return parsed

@router.get(
    "/trends",
    response_model=MarketTrendsResponse,
    summary="Fetch live job market trends for a role and location",
)
async def get_market_trends(
    role: str = Query(..., description="Target job role, e.g., 'Data Scientist'"),
    location: str = Query(..., description="Target location, e.g., 'United States' or 'Remote'"),
) -> MarketTrendsResponse:
    logger.info(f"market/trends: role='{role}' | location='{location}'")

    from app.agents.registry import get_market_researcher, get_user_proxy
    from app.tools.market_search import search_job_trends
    from autogen import register_function

    user_proxy = get_user_proxy()
    market_agent = get_market_researcher()

    # Register the search tool for the agents
    register_function(
        search_job_trends,
        caller=market_agent,
        executor=user_proxy,
        name="search_job_trends",
        description="Search the web for live job market trends, salaries, top skills, and hiring companies for a specific role and location."
    )

    prompt = (
        f"Target Role: {role}\n"
        f"Location: {location}\n\n"
        "Please use the 'search_job_trends' tool to find real data. Then, combine the search results with your own knowledge "
        "and return exactly a JSON dictionary with these keys:\n"
        "  'top_skills' (list of 5 strings),\n"
        "  'salary_range' (string),\n"
        "  'top_companies' (list of strings),\n"
        "  'market_trend' (string: 'Growing', 'Stable', or 'Declining').\n"
        "No other text, just the raw JSON dict."
    )

    try:
        user_proxy.initiate_chat(
            market_agent,
            message=prompt,
            max_turns=3,  # proxy asks, agent calls tool, proxy executes, agent responds
        )
    except Exception as exc:
        logger.exception("market: AutoGen chat failed")
        raise HTTPException(status_code=500, detail=f"Agent error: {str(exc)}")

    try:
        last_msg = user_proxy.last_message(market_agent)
        raw_content = (last_msg.get("content", "") if last_msg else "").strip()
    except Exception:
        messages = user_proxy.chat_messages.get(market_agent, [])
        raw_content = next(
            (m["content"] for m in reversed(messages) if m.get("content", "").strip()),
            "",
        )

    if not raw_content:
        raise HTTPException(status_code=500, detail="Market agent returned no response.")

    try:
        data = _parse_agent_json(raw_content)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return MarketTrendsResponse(
        role=role,
        location=location,
        top_skills=data.get("top_skills", []),
        salary_range=data.get("salary_range", "Unknown"),
        top_companies=data.get("top_companies", []),
        market_trend=data.get("market_trend", "Stable")
    )
