"""
Market Intelligence Service.

The market endpoint is intentionally live-search first:
  - Tavily and Serper are queried for current salary, hiring, company, and skill snippets.
  - LLM extraction is allowed only to structure live snippets into JSON.
  - If no live context is available, the response explicitly says live data is unavailable
    instead of inventing benchmark/fake market numbers.
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


REGION_PROFILES = {
    "india":        {"currency": "INR", "symbol": "₹"},
    "usa":          {"currency": "USD", "symbol": "$"},
    "uk":           {"currency": "GBP", "symbol": "£"},
    "europe":       {"currency": "EUR", "symbol": "€"},
    "middle_east":  {"currency": "AED", "symbol": "DH"},
    "canada":       {"currency": "CAD", "symbol": "C$"},
    "southeast_asia":{"currency": "SGD", "symbol": "S$"},
    "australia":    {"currency": "AUD", "symbol": "A$"},
    "global":       {"currency": "USD", "symbol": "$"},
}

DOMAIN_PROFILES = {
    "web_fullstack":       {"skills": ["React", "Next.js", "Node.js", "TypeScript"]},
    "data_ai":             {"skills": ["Python", "PyTorch", "LLMs", "RAG"]},
    "cloud_infrastructure":{"skills": ["Kubernetes", "Terraform", "AWS", "Docker"]},
    "service_generic":     {"skills": ["Java", "Python", "SQL"]},
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


def _region_for_location(location: str) -> dict:
    loc_lower = location.lower()
    city_key = location.split(",")[0].strip().lower()
    country = CITY_TO_COUNTRY.get(city_key)
    if not country:
        country = next((value for key, value in CITY_TO_COUNTRY.items() if key in loc_lower), "global")
    region = COUNTRY_TO_REGION.get(country, country)
    return REGION_PROFILES.get(region, REGION_PROFILES["global"])


def _salary_unavailable(location: str) -> dict:
    region = _region_for_location(location)
    return {
        "min": None,
        "max": None,
        "currency": region["currency"],
        "formatted": "Live salary data unavailable",
    }


def _format_salary_range(salary: Any, location: str) -> dict:
    if isinstance(salary, dict):
        normalised = dict(salary)
        formatted = str(normalised.get("formatted") or "").strip()
        if formatted and formatted.lower() not in {"n/a", "none", "unknown"}:
            return normalised
        mn = normalised.get("min")
        mx = normalised.get("max")
        if isinstance(mn, (int, float)) and isinstance(mx, (int, float)) and mn > 0 and mx > 0:
            symbol = _region_for_location(location)["symbol"]
            normalised["formatted"] = f"{symbol}{int(mn):,} – {symbol}{int(mx):,}"
            return normalised
    elif isinstance(salary, str) and salary.strip() and salary.strip().lower() not in {"n/a", "none", "unknown"}:
        return {"min": None, "max": None, "currency": _region_for_location(location)["currency"], "formatted": salary.strip()}

    return _salary_unavailable(location)


def _chart_salary_value(salary: dict) -> int:
    mn = salary.get("min")
    mx = salary.get("max")
    if isinstance(mn, (int, float)) and isinstance(mx, (int, float)) and mn > 0 and mx > 0:
        return int((mn + mx) / 2)

    formatted = str(salary.get("formatted", ""))
    if "unavailable" in formatted.lower():
        return 0
    numbers = [int(n.replace(",", "")) for n in re.findall(r"\d[\d,]*", formatted)]
    if not numbers:
        return 0
    multiplier = 100_000 if re.search(r"\b(lpa|lakh|lakhs)\b", formatted, re.I) else 1
    values = [n * multiplier for n in numbers]
    return int(sum(values[:2]) / min(len(values), 2))


def _chart_hiring_value(hiring_volume: str) -> int:
    match = re.search(r"\d[\d,]*", str(hiring_volume))
    return int(match.group(0).replace(",", "")) if match else 0


async def _tavily_query(client: httpx.AsyncClient, query: str) -> str:
    if not settings.TAVILY_API_KEY:
        return ""
    try:
        res = await client.post(
            "https://api.tavily.com/search",
            json={"api_key": settings.TAVILY_API_KEY, "query": query, "search_depth": "advanced", "max_results": 5},
        )
        if res.status_code == 200:
            results = res.json().get("results", [])
            return "\n".join(
                f"SOURCE: {r.get('url', '')}\nTITLE: {r.get('title', '')}\nCONTENT: {r.get('content', '')}"
                for r in results
                if r.get("content")
            )
        logger.warning(f"Tavily search status={res.status_code}: {res.text[:200]}")
    except Exception as e:
        logger.warning(f"Tavily search failed: {e}")
    return ""


async def _serper_query(client: httpx.AsyncClient, query: str) -> str:
    if not settings.SERPER_API_KEY:
        return ""
    try:
        res = await client.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": settings.SERPER_API_KEY, "Content-Type": "application/json"},
            json={"q": query, "num": 10},
        )
        if res.status_code == 200:
            payload = res.json()
            results = payload.get("organic", []) + payload.get("news", [])
            return "\n".join(
                f"SOURCE: {r.get('link', '')}\nTITLE: {r.get('title', '')}\nCONTENT: {r.get('snippet', '')}"
                for r in results
                if r.get("snippet")
            )
        logger.warning(f"Serper search status={res.status_code}: {res.text[:200]}")
    except Exception as e:
        logger.warning(f"Serper search failed: {e}")
    return ""


async def get_live_context(role: str, location: str, seniority: Optional[str] = None) -> str:
    if not settings.SERPER_API_KEY and not settings.TAVILY_API_KEY:
        return ""

    current_year = datetime.datetime.now().year
    seniority_phrase = f" {seniority}" if seniority else ""
    queries = [
        f"{current_year} {seniority_phrase} {role} salary range in {location} compensation",
        f"{current_year} companies actively hiring {seniority_phrase} {role} in {location} open roles",
        f"{current_year} {role} {location} job market demand top skills salary",
    ]

    # ── Primary: Tavily for all 3 queries ──────────────────────────────────────
    async with httpx.AsyncClient(timeout=15) as client:
        results = await asyncio.gather(
            *[_tavily_query(client, q) for q in queries],
            return_exceptions=True,
        )

    context_parts = [r for r in results if isinstance(r, str) and r.strip()]

    # ── Fallback: Serper only if Tavily returned nothing ───────────────────────
    if not context_parts:
        async with httpx.AsyncClient(timeout=15) as client:
            results = await asyncio.gather(
                *[_serper_query(client, q) for q in queries],
                return_exceptions=True,
            )
        context_parts = [r for r in results if isinstance(r, str) and r.strip()]

    return "\n\n--- LIVE SEARCH RESULT ---\n\n".join(context_parts)


async def extract_metrics(context: str, role: str, location: str, provider: Optional[str]) -> Dict[str, Any]:
    if not context:
        return {}

    prompt = (
        f"You are a strict JSON extractor. Use ONLY the live search snippets below for '{role}' in '{location}'.\n"
        "CRITICAL RULE: NEVER invent, estimate, or fabricate data. If a value is not explicitly found in the snippets, set it to null / empty array / 'Live data unavailable'.\n\n"
        "Salary: If salary is not explicitly mentioned in snippets, set formatted to 'Live salary data unavailable' and min/max to null.\n"
        "Hiring volume: Extract the exact number of open roles only if explicitly mentioned (e.g., '1,200+ Openings'). Otherwise set to 'Live hiring data unavailable'.\n"
        "Hiring companies: Only include company names explicitly found in snippets. Empty array if none.\n"
        "Top skills: Only include skills explicitly mentioned in snippets. Empty array if none.\n\n"
        f"LIVE SEARCH SNIPPETS:\n{context[:7000]}\n\n"
        "Return ONLY valid JSON with this exact schema — no extra fields, no markdown:\n"
        "{\n"
        '  "salary_range": {"min": null, "max": null, "currency": "USD", "formatted": "Live salary data unavailable"},\n'
        '  "hiring_volume": "Live hiring data unavailable",\n'
        '  "top_skills_freq": [{"skill": "Python", "frequency": 90}],\n'
        '  "hiring_companies": [{"name": "Company", "hiring_volume": "Active"}],\n'
        '  "market_trend": "Stable Demand",\n'
        '  "summary": "Brief summary grounded only in live snippets.",\n'
        '  "sources": ["https://source-url.example"]\n'
        "}\n"
        "Rules:\n"
        "- hiring_companies: max 5; empty array if none found in snippets.\n"
        "- top_skills_freq: max 6; empty array if none found in snippets.\n"
        "- salary_range.min and salary_range.max MUST be null if not found in snippets.\n"
        "- Do NOT generate placeholder or estimated values for any field.\n"
        "- sources must include only URLs from snippets.\n"
        "- NEVER omit any key — use null, empty array, or 'Live data unavailable' as defaults."
    )

    active_provider = provider or settings.LLM_PROVIDER
    providers_to_try = [active_provider]
    for fallback in ("groq", "google"):
        if fallback not in providers_to_try:
            providers_to_try.append(fallback)

    for p in providers_to_try:
        try:
            content = ""
            if p == "nvidia":
                async with httpx.AsyncClient(timeout=120) as client:
                    res = await client.post(
                        "https://integrate.api.nvidia.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                        },
                        json={
                            "model": settings.NVIDIA_MODEL,
                            "messages": [{"role": "user", "content": prompt}],
                            "temperature": 0.1,
                            "max_tokens": 1400,
                        },
                    )
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"]
                else:
                    raise ValueError(f"NVIDIA API status code {res.status_code}: {res.text}")

            elif p == "groq":
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
                            "temperature": 0.1,
                        },
                    )
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"]
                else:
                    raise ValueError(f"Groq API status code {res.status_code}: {res.text}")

            else:
                import google.generativeai as genai
                genai.configure(api_key=settings.GOOGLE_API_KEY)
                model = genai.GenerativeModel(settings.GOOGLE_MODEL, generation_config={"response_mime_type": "application/json"})
                resp = await asyncio.to_thread(model.generate_content, prompt)
                content = resp.text

            clean = content.strip()
            if clean.startswith("```"):
                clean = re.sub(r"^```(?:json)?", "", clean).rstrip("`").strip()
            parsed = json.loads(clean)
            if isinstance(parsed, dict):
                parsed["extraction_provider"] = p
                return parsed
        except Exception as e:
            logger.warning(f"Market metrics extraction failed on provider '{p}': {e}")

    return {}


def _unavailable_market_response(role: str, location: str, senior_level: str, start_time: datetime.datetime, provider: Optional[str]) -> dict:
    current_year = datetime.datetime.now().year
    salary = _salary_unavailable(location)
    return {
        "role": role,
        "location": location,
        "seniority": senior_level,
        "salary_range": salary,
        "market_trend": "Live data unavailable",
        "hiring_volume": "Live hiring data unavailable",
        "top_skills_freq": [],
        "top_skills": [],
        "hiring_companies": [],
        "top_companies": [],
        "historical_salary": [{"year": current_year, "salary": 0, "formatted": salary["formatted"]}],
        "historical_hiring": [{"year": current_year, "volume": 0}],
        "summary": (
            "No live market data could be verified for this request. Configure SERPER_API_KEY "
            "or TAVILY_API_KEY, then retry to get real-time salary, hiring, company, and skill signals."
        ),
        "sources": [],
        "execution_time": (datetime.datetime.now() - start_time).total_seconds(),
        "provider": provider or settings.LLM_PROVIDER,
        "is_cached": False,
        "is_live": False,
        "data_source": "unavailable",
    }


async def get_market_intelligence(
    role: str,
    location: str,
    provider: Optional[str] = None,
    seniority: Optional[str] = None,
) -> dict:
    start_time = datetime.datetime.now()
    cls = classify_role(role)
    senior_level = (seniority or cls["seniority"]).lower()

    context = await get_live_context(role, location, senior_level)
    if not context:
        logger.warning("No live market context available — returning explicit unavailable response, not benchmark/fake data.")
        return _unavailable_market_response(role, location, senior_level, start_time, provider)

    active_provider = provider or settings.LLM_PROVIDER
    live = await extract_metrics(context, role, location, active_provider)
    if not live:
        logger.warning("Live context was found, but extraction failed — returning explicit unavailable response.")
        return _unavailable_market_response(role, location, senior_level, start_time, active_provider)

    current_year = datetime.datetime.now().year
    salary = _format_salary_range(live.get("salary_range"), location)
    chart_salary = _chart_salary_value(salary)
    hiring_volume = str(live.get("hiring_volume") or "Live hiring data unavailable")
    chart_volume = _chart_hiring_value(hiring_volume)

    hiring_companies = live.get("hiring_companies") if isinstance(live.get("hiring_companies"), list) else []
    top_skills_freq = live.get("top_skills_freq") if isinstance(live.get("top_skills_freq"), list) else []
    sources = live.get("sources") if isinstance(live.get("sources"), list) else []

    res = {
        "role": role,
        "location": location,
        "seniority": senior_level,
        "salary_range": salary,
        "market_trend": live.get("market_trend", "Live Market Signals Found"),
        "hiring_volume": hiring_volume,
        "top_skills_freq": top_skills_freq,
        "top_skills": [{"skill": s.get("skill", str(s))} for s in top_skills_freq if isinstance(s, dict)],
        "hiring_companies": hiring_companies,
        "top_companies": hiring_companies,
        "historical_salary": [{"year": current_year, "salary": chart_salary, "formatted": salary.get("formatted", "")}],
        "historical_hiring": [{"year": current_year, "volume": chart_volume}],
        "summary": live.get("summary") or "Live market signals were found and structured for this role/location.",
        "sources": sources[:8],
        "execution_time": (datetime.datetime.now() - start_time).total_seconds(),
        "provider": live.get("extraction_provider", active_provider),
        "is_cached": False,
        "is_live": True,
        "data_source": "live_search",
    }

    return res
