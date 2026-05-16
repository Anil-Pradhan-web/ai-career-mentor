"""
Market Intelligence Service.

FIXES:
  1. KB fallback hiring_volume was "1000+" but test asserted "Stable based on benchmarks".
     Aligned both: KB fallback now returns a clear string and test uses the correct value.
  2. top_companies key added to final response (was missing, causing test failures).
  3. extract_metrics replaced AutoGen agent call with direct httpx call to Groq/Gemini
     — much faster, no AutoGen overhead, no event-loop conflicts.
  4. All salary_range returns are dicts (not strings) to match MarketTrendsModel.
"""
import httpx
import asyncio
import datetime
import json
import re
from typing import Any, Dict, List, Optional
from collections import defaultdict
from loguru import logger
from app.core.config import settings


# ─────────────────────────────────────────────────────────────────────────────
# 1. KNOWLEDGE BASE
# ─────────────────────────────────────────────────────────────────────────────
REGION_PROFILES = {
    "india":        {"baseline_salary": 1_400_000, "currency": "INR", "symbol": "₹"},
    "usa":          {"baseline_salary": 145_000,   "currency": "USD", "symbol": "$"},
    "uk":           {"baseline_salary": 78_000,    "currency": "GBP", "symbol": "£"},
    "europe":       {"baseline_salary": 72_000,    "currency": "EUR", "symbol": "€"},
    "middle_east":  {"baseline_salary": 280_000,   "currency": "AED", "symbol": "DH"},
    "canada":       {"baseline_salary": 115_000,   "currency": "CAD", "symbol": "C$"},
    "southeast_asia":{"baseline_salary": 85_000,   "currency": "SGD", "symbol": "S$"},
    "australia":    {"baseline_salary": 135_000,   "currency": "AUD", "symbol": "A$"},
    "global":       {"baseline_salary": 95_000,    "currency": "USD", "symbol": "$"},
}

DOMAIN_PROFILES = {
    "web_fullstack":       {"salary_multiplier": 1.00, "skills": ["React", "Next.js", "Node.js", "TypeScript"]},
    "data_ai":             {"salary_multiplier": 1.42, "skills": ["Python", "PyTorch", "LLMs", "RAG"]},
    "cloud_infrastructure":{"salary_multiplier": 1.32, "skills": ["Kubernetes", "Terraform", "AWS", "Docker"]},
    "service_generic":     {"salary_multiplier": 0.85, "skills": ["Java", "Python", "SQL"]},
}

EXPERIENCE_MULTIPLIERS = {
    "intern": 0.45, "junior": 0.70, "mid": 1.00,
    "senior": 1.45, "staff": 1.90, "principal": 2.40, "manager": 2.20,
}

CITY_TO_COUNTRY = {
    "bangalore": "india", "hyderabad": "india", "mumbai": "india", "pune": "india",
    "delhi": "india", "noida": "india", "gurgaon": "india", "chennai": "india",
    "ahmedabad": "india", "kolkata": "india", "kochi": "india", "bhubaneswar": "india",
    "san francisco": "usa", "seattle": "usa", "new york": "usa", "austin": "usa",
    "boston": "usa", "chicago": "usa", "los angeles": "usa",
    "london": "uk", "manchester": "uk",
    "berlin": "germany", "munich": "germany", "paris": "france",
    "amsterdam": "netherlands", "dublin": "ireland",
    "dubai": "uae", "abu dhabi": "uae", "riyadh": "saudi arabia",
    "toronto": "canada", "vancouver": "canada",
    "singapore": "singapore", "bangkok": "thailand", "jakarta": "indonesia",
    "sydney": "australia", "melbourne": "australia",
    "tokyo": "japan", "seoul": "south korea",
    "remote": "global", "worldwide": "global",
}

COUNTRY_TO_REGION = {
    "germany": "europe", "france": "europe", "netherlands": "europe", "ireland": "europe",
    "uae": "middle_east", "saudi arabia": "middle_east",
    "singapore": "southeast_asia", "thailand": "southeast_asia", "indonesia": "southeast_asia",
    "japan": "global", "south korea": "global",
}


# ─────────────────────────────────────────────────────────────────────────────
# 2. CLASSIFIER
# ─────────────────────────────────────────────────────────────────────────────
def normalize_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9+#./ ]+", " ", text)
    return re.sub(r"\s+", " ", text)


def classify_role(role_text: str) -> Dict[str, str]:
    norm = normalize_text(role_text)
    scores: Dict[str, int] = defaultdict(int)
    rules = {
        "data_ai":             ["ai", "machine learning", "data", "ml", "llm", "nlp", "vision"],
        "cloud_infrastructure":["devops", "cloud", "sre", "infrastructure", "kubernetes", "terraform"],
        "web_fullstack":       ["web", "frontend", "backend", "fullstack", "react", "node", "django", "fastapi"],
    }
    for domain, keywords in rules.items():
        for kw in keywords:
            if kw in norm:
                scores[domain] += 1

    domain = max(scores, key=scores.get) if scores else "service_generic"

    seniority = "mid"
    if any(k in norm for k in ["intern", "fresher", "trainee", "entry"]):
        seniority = "intern"
    elif any(k in norm for k in ["junior", "associate"]):
        seniority = "junior"
    elif any(k in norm for k in ["senior", "sr.", "sr ", "lead", "staff", "principal"]):
        seniority = "senior"

    return {"domain": domain, "seniority": seniority}


# ─────────────────────────────────────────────────────────────────────────────
# 3. LIVE SEARCH (Tavily primary → Serper fallback)
# ─────────────────────────────────────────────────────────────────────────────
async def get_live_context(role: str, location: str) -> str:
    if not settings.SERPER_API_KEY and not settings.TAVILY_API_KEY:
        return ""

    current_year = datetime.datetime.now().year

    async with httpx.AsyncClient(timeout=15) as client:
        # Tavily (monthly reset — try first)
        if settings.TAVILY_API_KEY:
            try:
                res = await client.post(
                    "https://api.tavily.com/search",
                    json={
                        "api_key": settings.TAVILY_API_KEY,
                        "query": (
                            f"Companies actively hiring {role} in {location} {current_year} "
                            "salary range and required skills"
                        ),
                        "search_depth": "advanced",
                    },
                )
                if res.status_code == 200:
                    results = res.json().get("results", [])
                    if results:
                        return "\n\n".join(r.get("content", "") for r in results)
            except Exception as e:
                logger.warning(f"Tavily search failed: {e}")

        # Serper (one-time credits — fallback)
        if settings.SERPER_API_KEY:
            try:
                res = await client.post(
                    "https://google.serper.dev/search",
                    headers={"X-API-KEY": settings.SERPER_API_KEY, "Content-Type": "application/json"},
                    json={
                        "q": f"Companies hiring {role} in {location} {current_year} salary open roles",
                        "num": 10,
                    },
                )
                if res.status_code == 200:
                    results = res.json().get("organic", [])
                    if results:
                        return "\n\n".join(r.get("snippet", "") for r in results)
            except Exception as e:
                logger.warning(f"Serper search failed: {e}")

    return ""


# ─────────────────────────────────────────────────────────────────────────────
# 4. METRIC EXTRACTION — Direct LLM call (no AutoGen, no event-loop issues)
# ─────────────────────────────────────────────────────────────────────────────
async def extract_metrics(context: str, role: str, location: str, provider: Optional[str]) -> Dict[str, Any]:
    if not context:
        return {}

    prompt = (
        f"You are a strict JSON data extractor. Analyze these market research snippets for "
        f"'{role}' in '{location}':\n\n"
        f"{context[:3800]}\n\n"
        "Return ONLY valid JSON — no markdown, no explanation:\n"
        "{\n"
        '  "salary_range": {"min": 80000, "max": 120000, "formatted": "$80,000 - $120,000"},\n'
        '  "hiring_volume": "500+",\n'
        '  "top_skills_freq": [{"skill": "Python", "frequency": 90}],\n'
        '  "hiring_companies": [{"name": "Top Tech Corp", "hiring_volume": "High"}],\n'
        '  "market_trend": "High Demand",\n'
        '  "summary": "Brief market analysis here."\n'
        "}\n"
        "Rules:\n"
        "- hiring_companies must have exactly 5 objects.\n"
        "- top_skills_freq must have exactly 6 objects.\n"
        "- hiring_volume must be a short string like '500+' or '1,200+'.\n"
        "- salary_range must be a dict with min, max, and formatted keys.\n"
        "- NEVER omit any key."
    )

    active_provider = provider or settings.LLM_PROVIDER

    try:
        if active_provider == "groq":
            async with httpx.AsyncClient(timeout=60) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.GROQ_MODEL,
                        "messages": [{"role": "user", "content": prompt}],
                        "response_format": {"type": "json_object"},
                        "temperature": 0.3,
                    },
                )
            if res.status_code != 200:
                logger.error(f"Groq market extraction failed: {res.text}")
                return {}
            content = res.json()["choices"][0]["message"]["content"]
        else:
            import google.generativeai as genai
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            model = genai.GenerativeModel(
                settings.GOOGLE_MODEL,
                generation_config={"response_mime_type": "application/json"},
            )
            # Run blocking call in thread
            resp = await asyncio.to_thread(model.generate_content, prompt)
            content = resp.text

        # Parse JSON — handle potential markdown fencing from some models
        clean = content.strip()
        if clean.startswith("```"):
            clean = re.sub(r"^```(?:json)?", "", clean).rstrip("`").strip()

        return json.loads(clean)

    except json.JSONDecodeError as e:
        logger.warning(f"Market JSON decode failed: {e}")
        return {}
    except Exception as e:
        logger.error(f"Market extraction failed: {e}")
        return {}


# ─────────────────────────────────────────────────────────────────────────────
# 5. UNIFIED ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────
async def get_market_intelligence(
    role: str,
    location: str,
    provider: Optional[str] = None,
    seniority: Optional[str] = None,
) -> dict:
    from app.core.cache import get_cached_response, set_cached_response

    start_time = datetime.datetime.now()
    cls = classify_role(role)
    senior_level = seniority or cls["seniority"]

    # Cache check
    cached = get_cached_response("market", role, location, senior_level)
    if cached:
        cached["execution_time"] = (datetime.datetime.now() - start_time).total_seconds()
        cached["is_cached"] = True
        return cached

    # Live search
    context = await get_live_context(role, location)

    # LLM extraction (direct httpx, not AutoGen)
    active_provider = provider or settings.LLM_PROVIDER
    live = await extract_metrics(context, role, location, active_provider)

    # KB fallback when live data is empty
    if not live:
        logger.warning("No live market data — using regional KB benchmarks.")
        city_key = location.split(",")[0].strip().lower()
        country = CITY_TO_COUNTRY.get(city_key, "global")
        region = COUNTRY_TO_REGION.get(country, country)
        prof = REGION_PROFILES.get(region, REGION_PROFILES["global"])
        domain = DOMAIN_PROFILES.get(cls["domain"], DOMAIN_PROFILES["service_generic"])
        mult = EXPERIENCE_MULTIPLIERS.get(senior_level, 1.0)
        base = int(prof["baseline_salary"] * domain["salary_multiplier"] * mult)
        sym = prof["symbol"]

        live = {
            "salary_range": {
                "min": int(base * 0.85),
                "max": int(base * 1.15),
                "formatted": f"{sym}{int(base * 0.85):,} – {sym}{int(base * 1.15):,}",
            },
            "market_trend": "Stable Demand",
            # FIX: test_market_service.py asserts this exact string for KB fallback
            "hiring_volume": "Stable based on benchmarks",
            "top_skills_freq": [
                {"skill": s, "frequency": 85} for s in domain["skills"]
            ],
            "hiring_companies": [
                {"name": "Top Regional Employers", "hiring_volume": "Active Hiring"},
                {"name": "Tier-1 Tech Companies",  "hiring_volume": "High"},
            ],
            "summary": (
                f"Benchmarked against regional salary data for {location}. "
                f"Expected range: {sym}{int(base*0.85):,}–{sym}{int(base*1.15):,} "
                f"for {senior_level}-level {role}."
            ),
        }

    current_year = datetime.datetime.now().year

    # Normalise salary for chart
    salary_str = str(live.get("salary_range", ""))
    sal_match = re.search(r"(\d{2,})", salary_str.replace(",", ""))
    chart_salary = int(sal_match.group(1)) if sal_match else 0

    hiring_str = str(live.get("hiring_volume", ""))
    vol_match = re.search(r"(\d+)", hiring_str.replace(",", ""))
    chart_volume = int(vol_match.group(1)) if vol_match else 0

    # Ensure hiring_companies is always a valid list
    hiring_companies = live.get("hiring_companies") or [
        {"name": "Top Regional Employers", "hiring_volume": "Active Hiring"}
    ]

    # top_skills_freq safe default
    top_skills_freq = live.get("top_skills_freq") or [
        {"skill": "Software Engineering", "frequency": 85}
    ]

    res = {
        "role": role,
        "location": location,
        "seniority": senior_level,
        "salary_range": live.get("salary_range") or {"formatted": "N/A"},
        "market_trend": live.get("market_trend", "Stable Demand"),
        "hiring_volume": live.get("hiring_volume", "500+"),
        "top_skills_freq": top_skills_freq,
        # top_skills for backward compat (some routes use this key)
        "top_skills": [{"skill": s["skill"]} for s in top_skills_freq],
        "hiring_companies": hiring_companies,
        # FIX: expose top_companies alias — test_market_service.py uses this key
        "top_companies": hiring_companies,
        "historical_salary": [{"year": current_year, "salary": chart_salary}],
        "historical_hiring": [{"year": current_year, "volume": chart_volume}],
        "summary": live.get("summary") or (
            "Market conditions indicate consistent demand for engineering talent in this region."
        ),
        "execution_time": (datetime.datetime.now() - start_time).total_seconds(),
        "provider": active_provider,
        "is_cached": False,
    }

    set_cached_response("market", res, role, location, senior_level)
    return res
