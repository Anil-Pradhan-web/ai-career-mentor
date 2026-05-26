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
    "london": "uk", "manchester": "uk", "edinburgh": "uk", "glasgow": "uk", "birmingham": "uk",
    "bristol": "uk", "leeds": "uk", "liverpool": "uk", "cambridge": "uk", "oxford": "uk",
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


def _coerce_to_number(val: Any) -> Optional[float]:
    """Coerces numeric values, string numbers, or abbreviations (like '120k', '1.2m') to floats."""
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        val_lower = val.lower().strip()
        match = re.search(r"([\d\.,]+)", val_lower)
        if match:
            num_str = match.group(1).replace(",", "")
            try:
                num = float(num_str)
                if "k" in val_lower:
                    num *= 1000
                elif "m" in val_lower:
                    num *= 1000000
                return num
            except ValueError:
                pass
    return None


def _format_salary_range(salary: Any, location: str) -> dict:
    """Format and normalize the salary range returned by LLMs or raw text search."""
    if isinstance(salary, dict):
        normalised = dict(salary)
        mn = _coerce_to_number(normalised.get("min"))
        mx = _coerce_to_number(normalised.get("max"))
        
        if mn is not None and mx is not None and mn > 0 and mx > 0:
            normalised["min"] = mn
            normalised["max"] = mx
            symbol = _region_for_location(location)["symbol"]
            currency = normalised.get("currency") or _region_for_location(location)["currency"]
            normalised["currency"] = currency
            normalised["formatted"] = f"{symbol}{int(mn):,} - {symbol}{int(mx):,}"
            return normalised
            
        formatted = str(normalised.get("formatted") or "").strip()
        if formatted and formatted.lower() not in {"n/a", "none", "unknown"}:
            return {
                "min": mn,
                "max": mx,
                "currency": normalised.get("currency") or _region_for_location(location)["currency"],
                "formatted": formatted
            }
            
    elif isinstance(salary, str) and salary.strip() and salary.strip().lower() not in {"n/a", "none", "unknown"}:
        salary_str = salary.strip()
        parts = re.findall(r"([\d\.,]+\s*[kKmM]?)", salary_str)
        mn, mx = None, None
        if len(parts) >= 2:
            mn = _coerce_to_number(parts[0])
            mx = _coerce_to_number(parts[1])
        elif len(parts) == 1:
            mn = _coerce_to_number(parts[0])
            
        currency = _region_for_location(location)["currency"]
        return {
            "min": mn,
            "max": mx,
            "currency": currency,
            "formatted": salary_str
        }

    return _salary_unavailable(location)



async def _tavily_query(client: httpx.AsyncClient, query: str) -> tuple[str, list[str]]:
    """Returns (snippets_text, list_of_source_urls)"""
    if not settings.TAVILY_API_KEY:
        return "", []
    try:
        res = await client.post(
            "https://api.tavily.com/search",
            json={"api_key": settings.TAVILY_API_KEY, "query": query, "search_depth": "advanced", "max_results": 5},
        )
        if res.status_code == 200:
            results = res.json().get("results", [])
            snippets = "\n".join(
                f"SOURCE: {r.get('url', '')}\nTITLE: {r.get('title', '')}\nCONTENT: {r.get('content', '')}"
                for r in results
                if r.get("content")
            )
            urls = [r.get("url", "") for r in results if r.get("url")]
            return snippets, urls
        logger.warning(f"Tavily search status={res.status_code}: {res.text[:200]}")
    except Exception as e:
        logger.warning(f"Tavily search failed: {e}")
    return "", []


async def _serper_query(client: httpx.AsyncClient, query: str) -> tuple[str, list[str]]:
    """Returns (snippets_text, list_of_source_urls)"""
    if not settings.SERPER_API_KEY:
        return "", []
    try:
        res = await client.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": settings.SERPER_API_KEY, "Content-Type": "application/json"},
            json={"q": query, "num": 10},
        )
        if res.status_code == 200:
            payload = res.json()
            results = payload.get("organic", []) + payload.get("news", [])
            snippets = "\n".join(
                f"SOURCE: {r.get('link', '')}\nTITLE: {r.get('title', '')}\nCONTENT: {r.get('snippet', '')}"
                for r in results
                if r.get("snippet")
            )
            urls = [r.get("link", "") for r in results if r.get("link")]
            return snippets, urls
        logger.warning(f"Serper search status={res.status_code}: {res.text[:200]}")
    except Exception as e:
        logger.warning(f"Serper search failed: {e}")
    return "", []


async def _scrape_url_content(client: httpx.AsyncClient, url: str) -> str:
    """Fetch and extract readable text from a URL for data extraction."""
    try:
        res = await client.get(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml",
            },
            follow_redirects=True,
        )
        if res.status_code != 200:
            return ""
        
        html = res.text
        # Simple HTML to text extraction — remove scripts, styles, tags
        import re as _re
        # Remove script and style blocks
        html = _re.sub(r"<script[^>]*>.*?</script>", "", html, flags=_re.DOTALL | _re.IGNORECASE)
        html = _re.sub(r"<style[^>]*>.*?</style>", "", html, flags=_re.DOTALL | _re.IGNORECASE)
        html = _re.sub(r"<nav[^>]*>.*?</nav>", "", html, flags=_re.DOTALL | _re.IGNORECASE)
        html = _re.sub(r"<footer[^>]*>.*?</footer>", "", html, flags=_re.DOTALL | _re.IGNORECASE)
        html = _re.sub(r"<header[^>]*>.*?</header>", "", html, flags=_re.DOTALL | _re.IGNORECASE)
        # Remove all HTML tags
        text = _re.sub(r"<[^>]+>", " ", html)
        # Decode HTML entities
        import html as html_module
        text = html_module.unescape(text)
        # Collapse whitespace
        text = _re.sub(r"\s+", " ", text).strip()
        # Limit to ~3000 chars per URL to avoid token overflow
        return text[:3000]
    except Exception as e:
        logger.debug(f"Failed to scrape {url}: {e}")
        return ""


async def get_live_context(role: str, location: str, seniority: Optional[str] = None) -> str:
    if not settings.SERPER_API_KEY and not settings.TAVILY_API_KEY:
        return ""

    current_year = datetime.datetime.now().year
    seniority_phrase = f" {seniority}" if seniority else ""
    queries = [
        f"{current_year} {seniority_phrase} {role} in {location} salary range, top skills, and companies actively hiring",
    ]

    all_snippets = []
    all_urls = []

    # ── Primary: Tavily ────────────────────────────────────────────────────────
    async with httpx.AsyncClient(timeout=15) as client:
        results = await asyncio.gather(
            *[_tavily_query(client, q) for q in queries],
            return_exceptions=True,
        )

    for r in results:
        if isinstance(r, tuple):
            snippets, urls = r
            if snippets:
                all_snippets.append(snippets)
            all_urls.extend(urls)

    # ── Fallback: Serper only if Tavily returned nothing ───────────────────────
    if not all_snippets:
        async with httpx.AsyncClient(timeout=15) as client:
            results = await asyncio.gather(
                *[_serper_query(client, q) for q in queries],
                return_exceptions=True,
            )
        for r in results:
            if isinstance(r, tuple):
                snippets, urls = r
                if snippets:
                    all_snippets.append(snippets)
                all_urls.extend(urls)

    # ── Deep Scrape: Fetch actual page content from top 3 URLs ─────────────────
    if all_urls:
        unique_urls = list(dict.fromkeys(all_urls))[:3]  # top 3 unique URLs
        logger.info(f"Market: Deep scraping {len(unique_urls)} source URLs for richer data")
        async with httpx.AsyncClient(timeout=12) as client:
            scrape_results = await asyncio.gather(
                *[_scrape_url_content(client, url) for url in unique_urls],
                return_exceptions=True,
            )
        for url, content in zip(unique_urls, scrape_results):
            if isinstance(content, str) and content.strip():
                all_snippets.append(f"--- DEEP SCRAPED FROM: {url} ---\n{content}")

    return "\n\n--- LIVE SEARCH RESULT ---\n\n".join(all_snippets)


async def extract_metrics(context: str, role: str, location: str, provider: Optional[str]) -> Dict[str, Any]:
    if not context:
        return {}

    prompt = (
        f"You are a strict JSON data extractor. Extract market data for '{role}' in '{location}' "
        f"ONLY from the live search data provided below.\n\n"
        f"LIVE SEARCH DATA:\n{context[:12000]}\n\n"
        "CRITICAL RULES:\n"
        "- Extract ONLY data that is explicitly stated in the search data above.\n"
        "- NEVER invent, estimate, or fabricate any numbers, company names, or skills.\n"
        "- If a salary range is mentioned for the broader region (e.g., UK-wide for a city in UK), that is REAL data — extract it.\n"
        "- If skills or companies are mentioned in relation to this role, they are REAL data — extract them.\n"
        "- If a data point is genuinely NOT present in the search data, use null or 'Data not found in sources'.\n\n"
        "Return ONLY valid JSON with this exact schema — no extra fields, no markdown:\n"
        "{\n"
        '  "salary_range": {"min": <number or null>, "max": <number or null>, "currency": "<ISO code>", "formatted": "<human readable>"},\n'
        '  "hiring_volume": "<string from data or \'Data not found in sources\'>",\n'
        '  "top_skills_freq": [{"skill": "<skill name>", "frequency": <0-100>}],\n'
        '  "hiring_companies": [{"name": "<company>", "hiring_volume": "<from data>"}],\n'
        '  "market_trend": "<trend from data or \'Data not found in sources\'>",\n'
        '  "summary": "<2-3 sentence summary using ONLY facts from the search data>",\n'
        '  "sources": ["<actual URLs from the data>"]\n'
        "}\n"
        "Rules:\n"
        "- salary_range min/max MUST be numbers. Convert 'k' = x1000. Use correct local currency.\n"
        "- top_skills_freq: max 6. frequency = how prominently the skill appears in data (0-100).\n"
        "- hiring_companies: max 5. Only include companies explicitly mentioned.\n"
        "- sources: Only include real URLs from the search data.\n"
    )

    active_provider = provider or "groq"
    if active_provider == "groq":
        providers_to_try = ["groq", "google", "nvidia"]
    elif active_provider == "google":
        providers_to_try = ["google", "groq", "nvidia"]
    else:
        providers_to_try = ["nvidia", "groq", "google"]

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
            from app.agents.registry import escape_json_string_control_chars
            clean = escape_json_string_control_chars(clean)
            parsed = json.loads(clean)
            if isinstance(parsed, dict):
                parsed["extraction_provider"] = p
                return parsed
        except Exception as e:
            logger.warning(f"Market metrics extraction failed on provider '{p}': {e}")

    return {}


def _unavailable_market_response(role: str, location: str, senior_level: str, start_time: datetime.datetime, provider: Optional[str]) -> dict:
    salary = _salary_unavailable(location)
    return {
        "role": role,
        "location": location,
        "seniority": senior_level,
        "salary_range": salary,
        "market_trend": "Live data unavailable",
        "hiring_volume": "Live hiring data unavailable",
        "top_skills_freq": [],
        "hiring_companies": [],
        "summary": (
            "No live market data could be verified for this request. Configure SERPER_API_KEY "
            "or TAVILY_API_KEY, then retry to get real-time salary, hiring, company, and skill signals."
        ),
        "sources": [],
        "provider": provider or settings.LLM_PROVIDER,
        "is_live": False,
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

    salary = _format_salary_range(live.get("salary_range"), location)
    hiring_volume = str(live.get("hiring_volume") or "Live hiring data unavailable")

    hiring_companies = live.get("hiring_companies") if isinstance(live.get("hiring_companies"), list) else []
    top_skills_freq = live.get("top_skills_freq") if isinstance(live.get("top_skills_freq"), list) else []
    sources = live.get("sources") if isinstance(live.get("sources"), list) else []

    return {
        "role": role,
        "location": location,
        "seniority": senior_level,
        "salary_range": salary,
        "market_trend": live.get("market_trend", "Live Market Signals Found"),
        "hiring_volume": hiring_volume,
        "top_skills_freq": top_skills_freq,
        "hiring_companies": hiring_companies,
        "summary": live.get("summary") or "Live market signals were found and structured for this role/location.",
        "sources": sources[:8],
        "provider": live.get("extraction_provider", active_provider),
        "is_live": True,
    }


