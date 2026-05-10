import json
from fastapi import APIRouter, HTTPException, Query, Depends
from loguru import logger
from app.models.schemas import MarketTrendsResponse
from app.api.deps import get_current_user
from app.models.models import User
from app.core.rate_limit import check_daily_limit, increment_usage
from app.core.cache import get_cached_response, set_cached_response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.activity import log_activity

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
    provider: str = Query(None, description="LLM Provider"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> MarketTrendsResponse:
    try:
        # ── Rate Limiting ─────────────────────────────────────────────────────────
        check_daily_limit(current_user.id, "market")

        # ── Check Cache First ─────────────────────────────────────────────────────
        cached_data = get_cached_response("market", role, location, provider)
        if cached_data:
            increment_usage(current_user.id, "market")
            log_activity(db, current_user.id, f"Researched Market for {role} (Cached)", "market")
            return MarketTrendsResponse(
                role=role,
                location=location,
                historical_salary=cached_data.get("historical_salary", []),
                historical_hiring=cached_data.get("historical_hiring", []),
                company_hiring_stats=cached_data.get("company_hiring_stats", []),
                top_skills_freq=cached_data.get("top_skills_freq", []),
                market_trend=cached_data.get("market_trend", "Stable"),
                salary_range=cached_data.get("salary_range", "Unknown")
            )

        logger.info(f"market/trends: role='{role}' | location='{location}' | provider='{provider}'")

        from app.agents.registry import get_market_researcher, get_user_proxy
        from app.core.config import settings
        from app.core.market_engine import get_deterministic_market_data
        import asyncio

        llm_config = settings.get_llm_config(provider)
        user_proxy = get_user_proxy()
        market_agent = get_market_researcher(llm_config=llm_config)

        # Get real deterministic market data
        raw_market_data = get_deterministic_market_data(role, location)

        prompt = (
            f"Target Role: {role}\n"
            f"Location: {location}\n\n"

            "RAW DETERMINISTIC MARKET DATA (DO NOT MODIFY NUMBERS OR FACTS):\n"
            f"{json.dumps(raw_market_data, indent=2)}\n\n"

            "ANALYSIS REQUIREMENTS:\n\n"
            "You are the formatter and summarizer. Your job is to take the raw data above and format it exactly into the REQUIRED JSON FORMAT.\n\n"

            "market_trend:\n"
            "- Extract the base trend from the raw data (e.g., Growing, Stable).\n"
            "- Add a concise, professional 1-sentence market-based justification based on the provided numbers.\n\n"

            "salary_range:\n"
            "- Summarize the current year salary beautifully into a string.\n\n"

            "STRICT OUTPUT RULES:\n"
            "- Output ONLY raw valid JSON.\n"
            "- No markdown. No explanations. No conversational text. No comments.\n\n"

            "REQUIRED JSON FORMAT:\n"
            "{\n"
            '  "historical_salary": [{"year": 2021, "salary": 120000, "formatted": "$120k"}],\n'
            '  "historical_hiring": [{"year": 2021, "volume": 5000}],\n'
            '  "company_hiring_stats": [{"name": "Company", "hiring_volume": 100}],\n'
            '  "top_skills_freq": [{"skill": "Python", "frequency": 800}],\n'
            '  "salary_range": "beautifully formatted string summary",\n'
            '  "market_trend": "Growing/Stable/Declining - concise reason"\n'
            "}"
        )

        # Terminate the conversation automatically if the agent returns the JSON schema
        user_proxy._is_termination_msg = lambda x: (
            x.get("content") and "historical_salary" in x.get("content", "") and "market_trend" in x.get("content", "")
        )

        try:
            await asyncio.to_thread(
                user_proxy.initiate_chat,
                market_agent,
                message=prompt,
                max_turns=1,
            )
        except Exception as exc:
            logger.exception("market: AutoGen chat failed")
            raise HTTPException(status_code=500, detail=f"Agent error: {str(exc)}")

        try:
            last_msg = user_proxy.last_message(market_agent)
            raw_content = (last_msg.get("content") or "" if last_msg else "").strip()
        except Exception:
            messages = user_proxy.chat_messages.get(market_agent, [])
            raw_content = next(
                (m["content"] for m in reversed(messages) if (m.get("content") or "").strip()),
                "",
            )

        if not raw_content:
            raise HTTPException(status_code=500, detail="Market agent returned no response.")

        try:
            data = _parse_agent_json(raw_content)
        except ValueError as exc:
            raise HTTPException(status_code=500, detail=str(exc))

        # ── Increment Usage ───────────────────────────────────────────────────────
        increment_usage(current_user.id, "market")
        log_activity(db, current_user.id, f"Researched Market for {role}", "market")

        # Save successful response to cache
        set_cached_response("market", data, role, location, provider)

        return MarketTrendsResponse(
            role=role,
            location=location,
            historical_salary=data.get("historical_salary", []),
            historical_hiring=data.get("historical_hiring", []),
            company_hiring_stats=data.get("company_hiring_stats", []),
            top_skills_freq=data.get("top_skills_freq", []),
            market_trend=data.get("market_trend", "Stable"),
            salary_range=data.get("salary_range", "Unknown")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_market_trends: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching market trends.")
