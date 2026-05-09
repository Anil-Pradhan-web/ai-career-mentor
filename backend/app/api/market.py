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
                top_skills=cached_data.get("top_skills", []),
                salary_range=cached_data.get("salary_range", "Unknown"),
                top_companies=cached_data.get("top_companies", []),
                market_trend=cached_data.get("market_trend", "Stable")
            )

        logger.info(f"market/trends: role='{role}' | location='{location}' | provider='{provider}'")

        from app.agents.registry import get_market_researcher, get_user_proxy
        from app.core.config import settings
        from app.tools.market_search import search_job_trends
        from autogen import register_function

        llm_config = settings.get_llm_config(provider)
        user_proxy = get_user_proxy()
        market_agent = get_market_researcher(llm_config=llm_config)

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

            "ALWAYS use the search_job_trends tool first. "
            f"Run AT LEAST 2-3 targeted searches such as:\n"
            f"  - '{role} jobs {location} 2025 salary'\n"
            f"  - 'top companies hiring {role} {location}'\n"
            f"  - '{role} in-demand skills {location} market trend'\n\n"

            "ANALYSIS REQUIREMENTS:\n\n"

            "top_skills:\n"
            "- Return exactly 6 skills.\n"
            "- Include modern frameworks, tools, cloud technologies, languages, and domain-specific platforms.\n"
            "- Skills must reflect current market demand for the role.\n"
            "- Avoid generic filler skills unless strongly relevant.\n\n"

            "salary_range:\n"
            "- Provide realistic location-adjusted salary ranges.\n"
            "- Use proper local compensation formatting.\n"
            "- Examples:\n"
            "  India: ₹6-12 LPA\n"
            "  USA: $120k-$180k\n"
            "  Europe: €70k-€110k\n"
            "- Never generate unrealistic compensation figures.\n\n"

            "top_companies:\n"
            "- Return exactly 6 companies.\n"
            "- Include companies actively hiring for this role.\n"
            "- Prioritize globally recognized or regionally dominant firms.\n\n"

            "market_trend:\n"
            "- Must begin with ONLY one of: Growing / Stable / Declining\n"
            "- Follow with a concise market-based justification.\n\n"

            "STRICT OUTPUT RULES:\n"
            "- Output ONLY raw valid JSON.\n"
            "- No markdown. No explanations. No conversational text. No comments. No trailing commas.\n\n"

            "REQUIRED JSON FORMAT:\n"
            "{\n"
            '  "top_skills": ["skill_1", "skill_2", "skill_3", "skill_4", "skill_5", "skill_6"],\n'
            '  "salary_range": "realistic salary range",\n'
            '  "top_companies": ["company_1", "company_2", "company_3", "company_4", "company_5", "company_6"],\n'
            '  "market_trend": "Growing/Stable/Declining - concise reason"\n'
            "}"
        )

        # Terminate the conversation automatically if the agent returns the JSON schema
        user_proxy._is_termination_msg = lambda x: (
            x.get("content") and "top_skills" in x.get("content", "") and "market_trend" in x.get("content", "")
        )

        try:
            user_proxy.initiate_chat(
                market_agent,
                message=prompt,
                max_turns=5,  # Allow enough turns for tool calling
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
            top_skills=data.get("top_skills", []),
            salary_range=data.get("salary_range", "Unknown"),
            top_companies=data.get("top_companies", []),
            market_trend=data.get("market_trend", "Stable")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_market_trends: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching market trends.")
