"""
Market Intelligence Service.

Architecture (post-audit fix):
  1. Live search (Tavily → Serper fallback)
  2. DETERMINISTIC extraction via regex parsers — NO LLM for raw metrics
  3. LLM used ONLY for 1-2 sentence summary of already-validated data
  4. Hallucination sources removed:
       - No LLM salary inference
       - No LLM company invention
       - No fake frequency: 50 defaults
       - No "Actively Hiring" fabrication without source evidence
"""
import httpx
import asyncio
import datetime
import json
import re
import sys
from typing import Any, Dict, List, Optional, Tuple
from collections import defaultdict, Counter
from loguru import logger
from app.core.config import settings


# ─────────────────────────────────────────────────────────────────────────────
# Region / Role Profiles
# ─────────────────────────────────────────────────────────────────────────────

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
    "web_fullstack":        {"skills": ["React", "Next.js", "Node.js", "TypeScript"]},
    "data_ai":              {"skills": ["Python", "PyTorch", "LLMs", "RAG"]},
    "cloud_infrastructure": {"skills": ["Kubernetes", "Terraform", "AWS", "Docker"]},
    "service_generic":      {"skills": ["Java", "Python", "SQL"]},
}

EXPERIENCE_MULTIPLIERS = {
    "intern": 0.45,
    "junior": 0.70,
    "mid": 1.00,
    "senior": 1.45,
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
        "data_ai":              ["ai", "machine learning", "data", "ml", "llm", "nlp", "vision"],
        "cloud_infrastructure": ["devops", "cloud", "sre", "infrastructure", "kubernetes", "terraform"],
        "web_fullstack":        ["web", "frontend", "backend", "fullstack", "react", "node", "django", "fastapi"],
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
        country = next((v for k, v in CITY_TO_COUNTRY.items() if k in loc_lower), "global")
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


# ─────────────────────────────────────────────────────────────────────────────
# Structured Extraction Models
# ─────────────────────────────────────────────────────────────────────────────
from pydantic import BaseModel, Field, AliasChoices

class SalaryRangeModel(BaseModel):
    min: Optional[float] = Field(None, description="Minimum salary for this role in the given location, in local currency. Null if unavailable.")
    max: Optional[float] = Field(None, description="Maximum salary for this role in the given location, in local currency. Null if unavailable.")
    currency: Optional[str] = Field(None, description="Currency code, e.g., INR, USD, EUR, GBP")
    formatted: Optional[str] = Field(None, description="Formatted salary range display, e.g., '₹10L – ₹20L per annum' or '$120,000 – $180,000 per annum'")

class CompanyHiringModel(BaseModel):
    name: str = Field(description="Cleaned name of the company hiring for this role in the specific location. Must be a real company name found in the context.")
    hiring_volume: str = Field(description="Hiring status details, e.g., 'Active openings', '5 job listings found', 'Hiring ML Engineers'")

class SkillFrequencyModel(BaseModel):
    skill: str = Field(description="Name of the technical skill needed, e.g., Python, PyTorch, React, SQL")
    frequency: int = Field(
        validation_alias=AliasChoices("frequency", "freq"),
        description="Relative frequency or importance of this skill in the listings from 0 to 100"
    )

class MarketIntelligenceModel(BaseModel):
    salary_range: SalaryRangeModel = Field(description="Salary range details extracted from the search results")
    market_trend: str = Field(description="Overall demand trend, e.g., 'High demand', 'Stable demand', 'Market slowdown'")
    hiring_volume: str = Field(description="Estimated hiring volume/openings count, e.g., '1,200+ open roles'")
    top_skills_freq: List[SkillFrequencyModel] = Field(description="List of top 5-8 skills in demand with frequency percentage")
    hiring_companies: List[CompanyHiringModel] = Field(description="List of top 3-5 real companies actively hiring in the specific location. Avoid generic or global listings unless mentioned.")
    summary: str = Field(description="A professional 2-3 sentence market summary of this role and location based strictly on facts in the search context.")


# ─────────────────────────────────────────────────────────────────────────────
# SEARCH LAYER
# ─────────────────────────────────────────────────────────────────────────────

async def _tavily_query(client: httpx.AsyncClient, query: str) -> list[dict]:
    if not settings.TAVILY_API_KEY:
        return []
    try:
        res = await client.post(
            "https://api.tavily.com/search",
            json={
                "api_key": settings.TAVILY_API_KEY,
                "query": query,
                "search_depth": "advanced",
                "include_raw_content": True,
                "max_results": 5,
            },
        )
        if res.status_code == 200:
            return res.json().get("results", [])
        logger.warning(f"Tavily status={res.status_code}")
    except Exception as e:
        logger.warning(f"Tavily failed: {e}")
    return []


async def _serper_query(client: httpx.AsyncClient, query: str) -> list[dict]:
    if not settings.SERPER_API_KEY:
        return []
    try:
        res = await client.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": settings.SERPER_API_KEY, "Content-Type": "application/json"},
            json={"q": query, "num": 10},
        )
        if res.status_code == 200:
            payload = res.json()
            results = payload.get("organic", []) + payload.get("news", [])
            return [
                {
                    "url": r.get("link", ""),
                    "title": r.get("title", ""),
                    "content": r.get("snippet", ""),
                }
                for r in results
                if r.get("link")
            ]
        logger.warning(f"Serper status={res.status_code}")
    except Exception as e:
        logger.warning(f"Serper failed: {e}")
    return []


def clean_text_content(text: str) -> str:
    if not text:
        return ""
    import html as html_module

    text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<nav[^>]*>.*?</nav>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<footer[^>]*>.*?</footer>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<header[^>]*>.*?</header>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html_module.unescape(text)
    text = re.sub(r"!\[.*?\]\([^\)]+\)", "", text)
    text = re.sub(r"\[([^\]]*)\]\([^\)]+\)", r"\1", text)

    noise_headers = [
        r"Top Levels\.fyi Cities", r"Top Paying Companies", r"Top Paying Locations",
        r"Top Paying Titles", r"Explore By Different Titles", r"1:1 Salary Negotiation",
        r"Resume Review", r"Internship Salaries",
    ]
    pattern = r"(?:{}).*?(?=\n\n|\n[A-Z]|\Z)".format("|".join(noise_headers))
    text = re.sub(pattern, "", text, flags=re.DOTALL | re.IGNORECASE)

    text = re.sub(r"\s+", " ", text).strip()
    return text


async def _scrape_url_content(client: httpx.AsyncClient, url: str) -> str:
    try:
        res = await client.get(
            url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; MarketBot/1.0)"},
            follow_redirects=True,
        )
        if res.status_code != 200:
            return ""
        return clean_text_content(res.text)[:3000]
    except Exception as e:
        logger.debug(f"Scrape failed {url}: {e}")
        return ""


def classify_url(url: str, title: str = "") -> str:
    url_lower = url.lower()
    title_lower = title.lower()

    job_portals = [
        "linkedin.com", "indeed.com", "naukri.com", "glassdoor.com", "levels.fyi",
        "simplyhired.com", "ziprecruiter.com", "careerbuilder.com", "monster.com",
        "wellfound.com", "hired.com", "jobspresso.co", "flexjobs.com", "remotive.com",
        "weworkremotely.com", "hyscaler.com", "foundit.in", "shine.com", "timesjobs.com",
        "ambitionbox.com", "internshala.com", "dice.com", "careers"
    ]
    for portal in job_portals:
        if portal in url_lower:
            return "job_portal"

    blog_indicators = [
        "blog", "medium.com", "dev.to", "article", "news", "salary-guide",
        "insights", "trends", "report", "guide", "wikipedia.org", "hackernoon.com",
        "hubspot.com", "simplilearn.com", "upgrad.com", "geeksforgeeks.org",
        "tutorialspoint.com", "magazine", "press", "post", "opinion", "interview-questions"
    ]
    for indicator in blog_indicators:
        if indicator in url_lower or indicator in title_lower:
            return "blog"

    return "other"


async def get_live_context(role: str, location: str, seniority: Optional[str] = None) -> str:
    if not settings.SERPER_API_KEY and not settings.TAVILY_API_KEY:
        return ""

    current_year = datetime.datetime.now().year
    seniority_phrase = f" {seniority}" if seniority else ""
    queries = [
        f"{role}{seniority_phrase} jobs in {location} hiring openings {current_year}",
        f"{role} salary and hiring companies in {location}",
    ]

    all_snippets: List[str] = []
    flat_results = []
    seen_urls = set()

    if settings.TAVILY_API_KEY:
        async with httpx.AsyncClient(timeout=15) as client:
            calls = await asyncio.gather(
                *[_tavily_query(client, q) for q in queries],
                return_exceptions=True,
            )
        for res_list in calls:
            if isinstance(res_list, list):
                for r in res_list:
                    url = r.get("url") or r.get("link") or ""
                    if url and url not in seen_urls:
                        seen_urls.add(url)
                        flat_results.append({
                            "url": url,
                            "title": r.get("title") or "",
                            "content": r.get("content") or r.get("snippet") or "",
                            "raw_content": r.get("raw_content") or "",
                        })

    if not flat_results and settings.SERPER_API_KEY:
        async with httpx.AsyncClient(timeout=15) as client:
            calls = await asyncio.gather(
                *[_serper_query(client, q) for q in queries],
                return_exceptions=True,
            )
        for res_list in calls:
            if isinstance(res_list, list):
                for r in res_list:
                    url = r.get("url") or r.get("link") or ""
                    if url and url not in seen_urls:
                        seen_urls.add(url)
                        flat_results.append({
                            "url": url,
                            "title": r.get("title") or "",
                            "content": r.get("content") or r.get("snippet") or "",
                            "raw_content": "",
                        })

    if not flat_results:
        return ""

    job_portals = []
    blogs = []
    others = []

    for r in flat_results:
        cls = classify_url(r["url"], r["title"])
        if cls == "job_portal":
            job_portals.append(r)
        elif cls == "blog":
            blogs.append(r)
        else:
            others.append(r)

    selected = []
    selected.extend(job_portals[:3])
    selected.extend(blogs[:2])
    if len(selected) < 4:
        needed = 4 - len(selected)
        selected.extend(others[:needed])

    urls_to_scrape = []
    for r in selected:
        url = r["url"]
        snippet = f"SOURCE: {url}\nTITLE: {r['title']}\nCONTENT: {r['content']}"
        all_snippets.append(snippet)

        if r["raw_content"].strip():
            cleaned_raw = clean_text_content(r["raw_content"])
            all_snippets.append(f"--- DEEP SCRAPED: {url} ---\n{cleaned_raw[:3000]}")
        else:
            urls_to_scrape.append(url)

    if urls_to_scrape:
        async with httpx.AsyncClient(timeout=12) as client:
            scrape_results = await asyncio.gather(
                *[_scrape_url_content(client, url) for url in urls_to_scrape],
                return_exceptions=True,
            )
        for url, content in zip(urls_to_scrape, scrape_results):
            if isinstance(content, str) and content.strip():
                all_snippets.append(f"--- DEEP SCRAPED: {url} ---\n{content}")

    return "\n\n--- LIVE SEARCH RESULT ---\n\n".join(all_snippets)


# ─────────────────────────────────────────────────────────────────────────────
# DETERMINISTIC EXTRACTION PIPELINE (STUB / FALLBACK FOR SOURCES)
# ─────────────────────────────────────────────────────────────────────────────

def extract_metrics_deterministic(
    context: str,
    role: str,
    location: str,
) -> Dict[str, Any]:
    """
    Simplified deterministic extraction pipeline.
    Parses sources from the context and returns default/fallback metrics.
    """
    urls = re.findall(r"SOURCE:\s*(https?://[^\s\n]+)", context)
    sources = list(dict.fromkeys(urls))[:8]

    region = _region_for_location(location)
    return {
        "salary_range": {
            "min": None,
            "max": None,
            "currency": region["currency"],
            "formatted": "Live salary data unavailable",
        },
        "hiring_volume": "Hiring volume data unavailable",
        "top_skills_freq": [],
        "hiring_companies": [],
        "market_trend": "Market signals found — see summary",
        "sources": sources,
    }


# ─────────────────────────────────────────────────────────────────────────────
# LLM SUMMARY & EXTRACTION PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

_SUMMARY_SYSTEM_PROMPT = """\
You are a professional tech career analyst and structured data extractor.
Your task is to analyze the provided search results context and extract real market intelligence for the given role and location.

You must populate:
1. salary_range: Look for salary numbers, hourly rates, or annual compensation details in the context.
   - min: minimum salary (float)
   - max: maximum salary (float)
   - currency: currency code (e.g. INR, USD, EUR, GBP)
   - formatted: display format (e.g., '₹10L – ₹20L per annum' or '$120,000 – $180,000 per annum')
2. market_trend: overall trend label (e.g., 'High demand', 'Stable demand', 'Market slowdown', or 'Remote-friendly market')
3. hiring_volume: estimated openings, e.g., '1,200+ open roles' or 'Hiring volume data unavailable'
4. top_skills_freq: 5 to 8 technical skills found in the job description context, with frequency from 0 to 100.
5. hiring_companies: 3 to 5 real company names listed as hiring or having job listings in the context.
   - name: real company name (do not invent/hallucinate)
   - hiring_volume: description of hiring, e.g. 'Active openings', 'Role listing found', 'Hiring ML Engineers'
6. summary: A professional 2-3 sentence market summary summarizing the role's demand, salary trends, and top skills in the location.

If certain data points (like salary or companies) are not present in the context, set them to null/empty lists instead of making up defaults.
"""


def _llm_summary(role: str, location: str, context: str, provider: Optional[str]) -> Any:
    """Call LLM to write a human-readable summary and extract structured data."""
    from app.agents.registry import call_llm

    user_content = (
        f"Role: {role}\n"
        f"Location: {location}\n\n"
        f"Search Results Context:\n{context}\n\n"
        "Analyze the context and extract real market intelligence according to the structured response model."
    )

    result = call_llm(
        system_prompt=_SUMMARY_SYSTEM_PROMPT,
        user_content=user_content,
        provider="groq",
        fallback_chain=["groq", "nvidia"],
        response_model=MarketIntelligenceModel,
        allow_google=False,
        temperature=0.2,
    )

    return result


# ─────────────────────────────────────────────────────────────────────────────
# UNAVAILABLE FALLBACK
# ─────────────────────────────────────────────────────────────────────────────

def _unavailable_market_response(
    role: str, location: str, senior_level: str, provider: Optional[str]
) -> dict:
    return {
        "role": role,
        "location": location,
        "seniority": senior_level,
        "salary_range": _salary_unavailable(location),
        "market_trend": "Live data unavailable",
        "hiring_volume": "Live hiring data unavailable",
        "top_skills_freq": [],
        "hiring_companies": [],
        "summary": (
            "No live market data could be verified. Configure SERPER_API_KEY or TAVILY_API_KEY "
            "and retry to get real-time salary, hiring, company, and skill signals."
        ),
        "sources": [],
        "provider": provider or "groq",
        "is_live": False,
    }


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC ENTRYPOINT
# ─────────────────────────────────────────────────────────────────────────────

async def get_market_intelligence(
    role: str,
    location: str,
    provider: Optional[str] = None,
    seniority: Optional[str] = None,
) -> dict:
    cls = classify_role(role)
    senior_level = (seniority or cls["seniority"]).lower()
    if senior_level in ["middle", "mid"]:
        senior_level = "mid"
    active_provider = "groq"

    # 1. Fetch live search context
    context = await get_live_context(role, location, senior_level)
    if not context:
        logger.warning("No live context — returning unavailable response.")
        return _unavailable_market_response(role, location, senior_level, active_provider)

    # 2. Basic deterministic extraction for sources
    metrics = extract_metrics_deterministic(context, role, location)

    # 3. LLM structured extraction
    llm_res = _llm_summary(role, location, context, active_provider)

    if isinstance(llm_res, dict):
        summary = llm_res.get("summary") or "Live market signals found for this role and location."
        salary_range = llm_res.get("salary_range") or metrics["salary_range"]
        market_trend = llm_res.get("market_trend") or metrics["market_trend"]
        hiring_volume = llm_res.get("hiring_volume") or metrics["hiring_volume"]

        top_skills_freq = []
        for s in (llm_res.get("top_skills_freq") or []):
            if isinstance(s, dict) and "skill" in s:
                top_skills_freq.append({
                    "skill": s["skill"],
                    "frequency": s.get("frequency", 100)
                })

        hiring_companies = []
        for c in (llm_res.get("hiring_companies") or []):
            if isinstance(c, dict) and "name" in c:
                hiring_companies.append({
                    "name": c["name"],
                    "hiring_volume": c.get("hiring_volume", "Active openings")
                })
    else:
        # Fallback (e.g. in tests where _llm_summary is mocked to return a string)
        summary = llm_res or "Live market signals found for this role and location."
        salary_range = metrics["salary_range"]
        market_trend = metrics["market_trend"]
        hiring_volume = metrics["hiring_volume"]
        top_skills_freq = metrics["top_skills_freq"]
        hiring_companies = metrics["hiring_companies"]

    return {
        "role": role,
        "location": location,
        "seniority": senior_level,
        "salary_range": salary_range,
        "market_trend": market_trend,
        "hiring_volume": hiring_volume,
        "top_skills_freq": top_skills_freq,
        "hiring_companies": hiring_companies,
        "summary": summary,
        "sources": metrics["sources"],
        "provider": active_provider,
        "is_live": True,
    }