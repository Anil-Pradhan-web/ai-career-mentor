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

# ─────────────────────────────────────────────────────────────────────────────
# Known tech skills for frequency counting (deterministic)
# ─────────────────────────────────────────────────────────────────────────────

KNOWN_SKILLS = [
    "python", "java", "javascript", "typescript", "golang", "go", "rust", "c++", "c#",
    "react", "next.js", "nextjs", "angular", "vue", "svelte",
    "node.js", "nodejs", "django", "fastapi", "flask", "spring boot", "springboot",
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "terraform",
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "cassandra",
    "kafka", "rabbitmq", "spark", "hadoop",
    "machine learning", "deep learning", "nlp", "llm", "rag", "pytorch", "tensorflow",
    "scikit-learn", "pandas", "numpy", "hugging face",
    "git", "ci/cd", "jenkins", "github actions", "linux",
    "microservices", "rest api", "graphql", "grpc",
    "sql", "nosql", "data structures", "algorithms", "system design",
]

# Patterns that indicate a company is actually hiring (not just mentioned)
HIRING_SIGNAL_PATTERNS = [
    r"is hiring",
    r"is looking for",
    r"open (?:position|role|job)",
    r"job opening",
    r"we.re hiring",
    r"join (?:our|the) team",
    r"apply (?:now|at|to)",
    r"careers at",
    r"(?:full.time|part.time|contract) (?:position|role)",
    r"(?:software|backend|frontend|data|ml|ai|devops) (?:engineer|developer|scientist) at",
]

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

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


def _coerce_to_number(val: Any) -> Optional[float]:
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
                    num *= 1_000_000
                return num
            except ValueError:
                pass
    return None


# ─────────────────────────────────────────────────────────────────────────────
# DETERMINISTIC SALARY EXTRACTION  (no LLM)
# ─────────────────────────────────────────────────────────────────────────────

# Pattern groups ordered from most specific → least specific
_SALARY_PATTERNS: List[Tuple[str, str]] = [
    # ₹ LPA / L patterns  (Indian rupee lakh)
    (r"₹\s*([\d,.]+)\s*(?:lakh|l|lpa)\s*[-–to]+\s*₹?\s*([\d,.]+)\s*(?:lakh|l|lpa)", "INR_L"),
    (r"([\d,.]+)\s*(?:lakh|l|lpa)\s*[-–to]+\s*([\d,.]+)\s*(?:lakh|l|lpa)", "INR_L"),
    (r"rs\.?\s*([\d,.]+)\s*(?:lakh|l|lpa)\s*[-–to]+\s*rs\.?\s*([\d,.]+)\s*(?:lakh|l|lpa)", "INR_L"),
    # INR per annum k/pa
    (r"₹\s*([\d,.]+)[k]\s*[-–to]+\s*₹?\s*([\d,.]+)[k]", "INR_K"),
    (r"inr\s*([\d,.]+)\s*[-–to]+\s*([\d,.]+)", "INR_RAW"),
    # USD
    (r"\$([\d,.]+)[k]\s*[-–to]+\s*\$?([\d,.]+)[k]", "USD_K"),
    (r"\$([\d,]+)\s*[-–to]+\s*\$?([\d,]+)", "USD_RAW"),
    (r"usd\s*([\d,]+)\s*[-–to]+\s*([\d,]+)", "USD_RAW"),
    # GBP
    (r"£([\d,.]+)[k]\s*[-–to]+\s*£?([\d,.]+)[k]", "GBP_K"),
    (r"£([\d,]+)\s*[-–to]+\s*£?([\d,]+)", "GBP_RAW"),
    # EUR
    (r"€([\d,.]+)[k]\s*[-–to]+\s*€?([\d,.]+)[k]", "EUR_K"),
    (r"€([\d,]+)\s*[-–to]+\s*€?([\d,]+)", "EUR_RAW"),
    # Generic per annum mentions (last resort)
    (r"salary[:\s]+([\d,.]+)\s*[-–to]+\s*([\d,.]+)\s*(lpa|lakh|k|usd|inr|gbp|eur)?", "GENERIC"),
]


def _parse_salary_from_text(text: str, location: str) -> dict:
    """
    Deterministic salary extraction using regex.
    Returns first confident match found in text.
    Does NOT call LLM.
    """
    region = _region_for_location(location)
    currency = region["currency"]
    symbol = region["symbol"]
    text_lower = text.lower()

    for pattern, ptype in _SALARY_PATTERNS:
        for m in re.finditer(pattern, text_lower, re.IGNORECASE):
            try:
                raw_min = m.group(1).replace(",", "")
                raw_max = m.group(2).replace(",", "")
                mn = float(raw_min)
                mx = float(raw_max)
            except (IndexError, ValueError):
                continue

            if mn <= 0 or mx <= 0 or mn > mx * 3:  # sanity check
                continue

            # Unit normalisation
            if ptype == "INR_L":
                mn_val = mn * 100_000
                mx_val = mx * 100_000
                cur = "INR"
                fmt = f"₹{mn:.1f}L – ₹{mx:.1f}L per annum"
            elif ptype == "INR_K":
                mn_val = mn * 1_000
                mx_val = mx * 1_000
                cur = "INR"
                fmt = f"₹{int(mn_val):,} – ₹{int(mx_val):,}"
            elif ptype == "INR_RAW":
                mn_val, mx_val, cur = mn, mx, "INR"
                fmt = f"₹{int(mn_val):,} – ₹{int(mx_val):,}"
            elif ptype == "USD_K":
                mn_val = mn * 1_000
                mx_val = mx * 1_000
                cur = "USD"
                fmt = f"${int(mn_val):,} – ${int(mx_val):,}"
            elif ptype == "USD_RAW":
                mn_val, mx_val, cur = mn, mx, "USD"
                fmt = f"${int(mn_val):,} – ${int(mx_val):,}"
            elif ptype == "GBP_K":
                mn_val = mn * 1_000
                mx_val = mx * 1_000
                cur = "GBP"
                fmt = f"£{int(mn_val):,} – £{int(mx_val):,}"
            elif ptype == "GBP_RAW":
                mn_val, mx_val, cur = mn, mx, "GBP"
                fmt = f"£{int(mn_val):,} – £{int(mx_val):,}"
            elif ptype == "EUR_K":
                mn_val = mn * 1_000
                mx_val = mx * 1_000
                cur = "EUR"
                fmt = f"€{int(mn_val):,} – €{int(mx_val):,}"
            elif ptype == "EUR_RAW":
                mn_val, mx_val, cur = mn, mx, "EUR"
                fmt = f"€{int(mn_val):,} – €{int(mx_val):,}"
            else:
                mn_val, mx_val, cur = mn, mx, currency
                fmt = f"{symbol}{int(mn_val):,} – {symbol}{int(mx_val):,}"

            return {
                "min": mn_val,
                "max": mx_val,
                "currency": cur,
                "formatted": fmt,
            }

    return _salary_unavailable(location)


# ─────────────────────────────────────────────────────────────────────────────
# DETERMINISTIC SKILL EXTRACTION  (no LLM)
# ─────────────────────────────────────────────────────────────────────────────

def _extract_skills_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Count how many times each known skill appears in the raw search context.
    Returns list sorted by real count, descending. No fake frequency defaults.
    """
    text_lower = text.lower()
    counts: Counter = Counter()
    for skill in KNOWN_SKILLS:
        # Word-boundary aware count
        pattern = r"\b" + re.escape(skill) + r"\b"
        c = len(re.findall(pattern, text_lower))
        if c > 0:
            counts[skill] += c

    if not counts:
        return []

    # Normalise to 0-100 scale based on max count
    max_count = max(counts.values())
    results = []
    for skill, count in counts.most_common(8):
        # Pretty-print skill name
        display = skill.title() if "." not in skill and "/" not in skill else skill
        freq = round((count / max_count) * 100)
        results.append({"skill": display, "frequency": freq})

    return results[:6]  # top 6 only


# ─────────────────────────────────────────────────────────────────────────────
# DETERMINISTIC COMPANY EXTRACTION  (no LLM)
# ─────────────────────────────────────────────────────────────────────────────

# Regex to find capitalized company names near hiring signals
# Requires clean PascalCase start — avoids "Companies like Infosys" false positives
_COMPANY_NEAR_HIRING = re.compile(
    r"(?:^|[\n\s])([A-Z][a-z]+(?:[A-Z][a-z]+)*(?:\s[A-Z][a-zA-Z0-9&]+){0,2})\s+(?:is hiring|is looking|are hiring|hiring for)",
    re.MULTILINE,
)

_ROLE_AT_COMPANY = re.compile(
    r"(?:engineer|developer|scientist|analyst|architect|manager|designer)\s+at\s+([A-Z][a-zA-Z0-9&]{2,}(?:\s[A-Z][a-zA-Z]{2,}){0,1})(?:\s+(?:requires?|needs?|is|are|will|\-)|\s*$|\s*[\.,])",
    re.IGNORECASE | re.MULTILINE,
)

# Blocklist — common English words + global-only companies (unless locally confirmed)
_COMPANY_BLOCKLIST = {
    "top", "the", "and", "for", "with", "our", "team", "join", "apply",
    "companies", "find", "data", "software", "tech", "technology",
    "meta", "netflix", "google", "amazon", "microsoft", "apple",
}

_GLOBAL_LEADERBOARD_NOISE = re.compile(
    r"top (?:paying|companies|employers|hiring).*?(?:\n\n|\Z)",
    re.DOTALL | re.IGNORECASE,
)


def _extract_companies_from_text(text: str, location: str) -> List[Dict[str, str]]:
    """
    Extract companies that show explicit hiring signals in the raw search text.
    NEVER invents or infers. Returns only companies with direct hiring evidence.
    """
    # Strip global leaderboard sections first
    cleaned = _GLOBAL_LEADERBOARD_NOISE.sub("", text)

    city = location.split(",")[0].strip().lower()
    found: Dict[str, str] = {}  # name → hiring signal text

    for m in _COMPANY_NEAR_HIRING.finditer(cleaned):
        name = m.group(1).strip()
        if len(name) < 2 or name.lower() in _COMPANY_BLOCKLIST:
            continue
        # Verify company name appears near location context
        ctx_start = max(0, m.start() - 300)
        ctx_end = min(len(cleaned), m.end() + 300)
        snippet = cleaned[ctx_start:ctx_end].lower()
        if city in snippet or "india" in snippet or "remote" in snippet:
            # Extract verbatim signal phrase
            signal = cleaned[m.start():m.end()].strip()
            found[name] = signal[:60]

    for m in _ROLE_AT_COMPANY.finditer(cleaned):
        name = m.group(1).strip()
        if len(name) < 2 or name.lower() in _COMPANY_BLOCKLIST:
            continue
        ctx_start = max(0, m.start() - 300)
        ctx_end = min(len(cleaned), m.end() + 300)
        snippet = cleaned[ctx_start:ctx_end].lower()
        if city in snippet or "india" in snippet or "remote" in snippet:
            if name not in found:
                found[name] = "Role listing found"

    result = []
    for name, signal in list(found.items())[:5]:
        # Clean name: strip newlines, URL fragments, leading junk
        clean_name = re.sub(r"[\n\r]", " ", name).strip()
        clean_name = re.sub(r"^[\w]+\.\w{2,4}\s*", "", clean_name).strip()  # strip leading domain
        clean_name = re.sub(r"\s+", " ", clean_name).strip()
        if not clean_name or len(clean_name) < 2:
            continue
        result.append({
            "name": clean_name,
            "hiring_volume": signal if signal else "Mentioned in job listings",
        })

    return result


# ─────────────────────────────────────────────────────────────────────────────
# DETERMINISTIC HIRING VOLUME EXTRACTION
# ─────────────────────────────────────────────────────────────────────────────

def _extract_hiring_volume(text: str, role: str) -> str:
    """Extract explicit job count mentions from search snippets."""
    patterns = [
        r"find\s+([\d,]+\+?)\s+(?:\w+\s+){0,3}(?:jobs?|positions?|roles?)",
        r"([\d,]+\+?)\s+(?:\w+\s+){0,3}(?:jobs?|positions?|roles?|openings?|listings?)\s+(?:in|for|at|available)",
        r"([\d,]+\+?)\s+(?:open\s+)?(?:jobs?|positions?|roles?|openings?|listings?)",
        r"([\d,]+\+?)\s+(?:active\s+)?(?:job\s+)?postings?",
        r"hiring\s+([\d,]+\+?)\s+(?:people|engineers|developers|candidates)",
        r"over\s+([\d,]+\+?)\s+(?:jobs?|positions?|roles?)",
        r"([\d,]+\+?)\s+(?:jobs?|positions?)\s+(?:available|found|listed|posted)",
        r"([\d,]+\+?)\s+(?:job\s+)?vacancies",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return f"{m.group(1)} open roles"
    return "Hiring volume data unavailable"


# ─────────────────────────────────────────────────────────────────────────────
# MARKET TREND EXTRACTION (deterministic keywords)
# ─────────────────────────────────────────────────────────────────────────────

_TREND_SIGNALS = [
    (r"high demand|strong demand|growing demand|talent shortage", "High demand"),
    (r"slowing|layoffs|hiring freeze|slowdown|cautious", "Market slowdown"),
    (r"steady|stable|consistent demand", "Stable demand"),
    (r"surging|boom|explosive growth", "Surging demand"),
    (r"remote.?first|hybrid work|distributed team", "Remote-friendly market"),
]

def _extract_market_trend(text: str) -> str:
    text_lower = text.lower()
    for pattern, label in _TREND_SIGNALS:
        if re.search(pattern, text_lower):
            return label
    return "Market signals found — see summary"


# ─────────────────────────────────────────────────────────────────────────────
# SEARCH LAYER (unchanged)
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


async def _serper_query(client: httpx.AsyncClient, query: str) -> Tuple[str, List[str]]:
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
        logger.warning(f"Serper status={res.status_code}")
    except Exception as e:
        logger.warning(f"Serper failed: {e}")
    return "", []


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

    # Strip global leaderboard noise sections
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


async def get_live_context(role: str, location: str, seniority: Optional[str] = None) -> str:
    if not settings.SERPER_API_KEY and not settings.TAVILY_API_KEY:
        return ""

    current_year = datetime.datetime.now().year
    seniority_phrase = f" {seniority}" if seniority else ""
    queries = [
        f"{current_year}{seniority_phrase} {role} jobs {location} salary",
        f"{role} hiring companies {location} {current_year}",
    ]

    all_snippets: List[str] = []
    all_urls: List[str] = []

    # ── Tavily ─────────────────────────────────────────────────────────────────
    if settings.TAVILY_API_KEY:
        async with httpx.AsyncClient(timeout=15) as client:
            calls = await asyncio.gather(
                *[_tavily_query(client, q) for q in queries],
                return_exceptions=True,
            )
        for res_list in calls:
            if isinstance(res_list, list):
                for idx, r in enumerate(res_list):
                    url = r.get("url", "")
                    if url:
                        all_urls.append(url)
                    snippet = f"SOURCE: {url}\nTITLE: {r.get('title')}\nCONTENT: {r.get('content')}"
                    all_snippets.append(snippet)
                    if idx < 3:
                        raw = r.get("raw_content") or ""
                        if raw.strip():
                            cleaned_raw = clean_text_content(raw)
                            all_snippets.append(f"--- DEEP SCRAPED: {url} ---\n{cleaned_raw[:3000]}")

    # ── Serper fallback ────────────────────────────────────────────────────────
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

        if all_urls:
            unique_urls = list(dict.fromkeys(all_urls))[:3]
            async with httpx.AsyncClient(timeout=12) as client:
                scrape_results = await asyncio.gather(
                    *[_scrape_url_content(client, url) for url in unique_urls],
                    return_exceptions=True,
                )
            for url, content in zip(unique_urls, scrape_results):
                if isinstance(content, str) and content.strip():
                    all_snippets.append(f"--- DEEP SCRAPED: {url} ---\n{content}")

    return "\n\n--- LIVE SEARCH RESULT ---\n\n".join(all_snippets)


# ─────────────────────────────────────────────────────────────────────────────
# DETERMINISTIC METRICS PIPELINE  (replaces extract_metrics LLM call)
# ─────────────────────────────────────────────────────────────────────────────

def extract_metrics_deterministic(
    context: str,
    role: str,
    location: str,
) -> Dict[str, Any]:
    """
    Pure deterministic extraction pipeline.
    NO LLM calls. All data from regex + pattern matching.
    Returns empty dict fields instead of fabricated defaults.
    """
    if not context:
        return {}

    salary = _parse_salary_from_text(context, location)
    skills = _extract_skills_from_text(context)
    companies = _extract_companies_from_text(context, location)
    hiring_volume = _extract_hiring_volume(context, role)
    market_trend = _extract_market_trend(context)

    # Extract URLs from context
    urls = re.findall(r"SOURCE:\s*(https?://[^\s\n]+)", context)
    sources = list(dict.fromkeys(urls))[:8]

    return {
        "salary_range": salary,
        "hiring_volume": hiring_volume,
        "top_skills_freq": skills,
        "hiring_companies": companies,
        "market_trend": market_trend,
        "sources": sources,
    }


# ─────────────────────────────────────────────────────────────────────────────
# LLM SUMMARY — ONLY summarizes already-validated data, NEVER invents metrics
# ─────────────────────────────────────────────────────────────────────────────

_SUMMARY_SYSTEM_PROMPT = """\
You are a tech career analyst. Write a 2-3 sentence market summary.
You are given VERIFIED facts extracted deterministically from live search data.
DO NOT add any numbers, companies, or skills not present in the input.
DO NOT fabricate. Summarize only what is given.
"""


def _llm_summary(role: str, location: str, verified_data: dict, provider: Optional[str]) -> str:
    """Call LLM ONLY to write a human-readable summary of already-validated data."""
    from app.agents.registry import call_llm

    active_provider = provider or "groq"
    if active_provider == "google":
        active_provider = "groq"

    user_content = (
        f"Role: {role}\nLocation: {location}\n\n"
        f"Verified market data:\n{json.dumps(verified_data, indent=2)}\n\n"
        "Write a 2-3 sentence professional summary of this market. "
        "Use ONLY the data above. Do not add any new information."
    )

    result = call_llm(
        system_prompt=_SUMMARY_SYSTEM_PROMPT,
        user_content=user_content,
        provider=active_provider,
        allow_google=False,
        temperature=0.3,
    )

    if isinstance(result, str) and result.strip():
        return result.strip()
    if isinstance(result, dict) and result.get("content"):
        return str(result["content"]).strip()
    return "Live market signals found for this role and location."


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
        "provider": provider or settings.LLM_PROVIDER,
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
    active_provider = provider or settings.LLM_PROVIDER

    # 1. Fetch live search context
    context = await get_live_context(role, location, senior_level)
    if not context:
        logger.warning("No live context — returning unavailable response.")
        return _unavailable_market_response(role, location, senior_level, active_provider)

    # 2. Deterministic extraction — no LLM
    metrics = extract_metrics_deterministic(context, role, location)
    if not metrics:
        logger.warning("Deterministic extraction returned empty — returning unavailable response.")
        return _unavailable_market_response(role, location, senior_level, active_provider)

    # 3. LLM generates ONLY the human-readable summary (no raw metrics)
    summary = _llm_summary(role, location, metrics, active_provider)

    return {
        "role": role,
        "location": location,
        "seniority": senior_level,
        "salary_range": metrics["salary_range"],
        "market_trend": metrics["market_trend"],
        "hiring_volume": metrics["hiring_volume"],
        "top_skills_freq": metrics["top_skills_freq"],
        "hiring_companies": metrics["hiring_companies"],
        "summary": summary,
        "sources": metrics["sources"],
        "provider": active_provider,
        "is_live": True,
    }