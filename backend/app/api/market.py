import json
import asyncio
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
    """
    Robustly extract a JSON object from the agent reply.
    """
    cleaned = raw.strip()

    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        import re
        match = re.search(r"\{\s*\".*\}\s*", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except:
                raise ValueError("Could not repair JSON object from agent response.")
        raise ValueError("Agent response contained no valid JSON object.")

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
            # Increment only on success (cache hit is a success)
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
                salary_range=cached_data.get("salary_range", "Data available")
            )

        from app.agents.registry import get_market_researcher, get_user_proxy
        from app.core.config import settings
        from app.core.market_engine import get_deterministic_market_data, get_real_market_context

        # 1. Get real-time search context
        real_context = await asyncio.to_thread(get_real_market_context, role, location)

        # 2. Get deterministic baseline (for structure and missing trends)
        raw_market_data = get_deterministic_market_data(role, location)

        prompt = (
            f"Target Role: {role}\n"
            f"Location: {location}\n\n"
            "LIVE SEARCH DATA (PRIORITY 1):\n"
            f"{real_context}\n\n"
            "BASELINE REFERENCE (PRIORITY 2 - Only for missing numbers):\n"
            f"{json.dumps(raw_market_data, indent=2)}\n\n"
            "INSTRUCTIONS:\n"
            "1. USE LIVE SEARCH DATA FIRST: Extract company names and specific skills directly from the 'LIVE SEARCH DATA' snippets above.\n"
            "2. LOCALITY: Ensure companies are relevant to the target location. For example, if searching for Hyderabad, ignore companies that are only in the US.\n"
            "3. FALLBACK: Use the 'BASELINE REFERENCE' only if the search snippets are empty or lack specific numbers (like historical volume). But NEVER use company names from the baseline if real ones are found in search.\n"
            "4. OUTPUT FORMAT: Respond ONLY with a valid JSON object matching the schema below.\n\n"
            "JSON SCHEMA:\n"
            "{\n"
            '  "historical_salary": [{"year": 2021, "salary": 120000, "formatted": "$120k"}],\n'
            '  "historical_hiring": [{"year": 2021, "volume": 5000}],\n'
            '  "company_hiring_stats": [{"name": "Real Company from Snippets", "hiring_volume": 100}],\n'
            '  "top_skills_freq": [{"skill": "Real Skill from Snippets", "frequency": 800}],\n'
            '  "salary_range": "summary based on LIVE snippets",\n'
            '  "market_trend": "concise trend based on LIVE data"\n'
            "}"
        )

        async def run_market_agent(p_provider: str):
            l_config = settings.get_llm_config(p_provider)
            u_proxy = get_user_proxy()
            m_agent = get_market_researcher(llm_config=l_config)
            u_proxy._is_termination_msg = lambda x: (
                x.get("content") and "historical_salary" in x.get("content", "") 
                and "market_trend" in x.get("content", "")
            )
            await asyncio.to_thread(u_proxy.initiate_chat, m_agent, message=prompt, max_turns=1)
            last_msg = u_proxy.last_message(m_agent)
            r_content = (last_msg.get("content") or "" if last_msg else "").strip()
            if not r_content:
                messages = u_proxy.chat_messages.get(m_agent, [])
                r_content = next((m["content"] for m in reversed(messages) if (m.get("content") or "").strip()), "")
            if not r_content:
                raise ValueError("Market agent returned no response.")
            return _parse_agent_json(r_content)

        try:
            data = await run_market_agent(provider)
        except Exception as exc:
            msg = str(exc)
            should_fallback = (
                provider == "google" or (not provider and settings.LLM_PROVIDER == "google")
            ) and ("429" in msg or "quota" in msg.lower() or "limit" in msg.lower() or "exhausted" in msg.lower())

            if should_fallback:
                logger.warning("Gemini 429: Falling back to GROQ for market analysis")
                try:
                    data = await run_market_agent("groq")
                except Exception as exc2:
                    logger.exception("Fallback GROQ also failed for market")
                    raise HTTPException(status_code=500, detail=f"Both Gemini and GROQ failed: {exc2}")
            else:
                logger.exception("Market analysis failed")
                raise HTTPException(status_code=500, detail=f"Market research error: {exc}")

        # Save successful response to cache
        set_cached_response("market", data, role, location, provider)

        # ── Increment Usage ONLY ON SUCCESS ───────────────────────────────────────
        increment_usage(current_user.id, "market")
        log_activity(db, current_user.id, f"Researched Market for {role}", "market")

        return MarketTrendsResponse(
            role=role,
            location=location,
            historical_salary=data.get("historical_salary", []),
            historical_hiring=data.get("historical_hiring", []),
            company_hiring_stats=data.get("company_hiring_stats", []),
            top_skills_freq=data.get("top_skills_freq", []),
            market_trend=data.get("market_trend", "Stable"),
            salary_range=data.get("salary_range", "Data not available")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_market_trends: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Market error: {str(e)}")
