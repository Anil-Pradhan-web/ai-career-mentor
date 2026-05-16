import httpx
import asyncio
import datetime
import json
import re
from typing import List, Dict, Any
from collections import defaultdict
from loguru import logger
from app.core.config import settings

# =========================================================
# 1. KNOWLEDGE BASE (Authority Data)
# =========================================================

REGION_PROFILES = {
    "india": {"baseline_salary": 1400000, "currency": "INR", "symbol": "₹"},
    "usa": {"baseline_salary": 145000, "currency": "USD", "symbol": "$"},
    "uk": {"baseline_salary": 78000, "currency": "GBP", "symbol": "£"},
    "europe": {"baseline_salary": 72000, "currency": "EUR", "symbol": "€"},
    "middle_east": {"baseline_salary": 280000, "currency": "AED", "symbol": "DH"},
    "canada": {"baseline_salary": 115000, "currency": "CAD", "symbol": "C$"},
    "southeast_asia": {"baseline_salary": 85000, "currency": "SGD", "symbol": "S$"},
    "australia": {"baseline_salary": 135000, "currency": "AUD", "symbol": "A$"},
    "global": {"baseline_salary": 95000, "currency": "USD", "symbol": "$"}
}

DOMAIN_PROFILES = {
    "web_fullstack": {"salary_multiplier": 1.0, "skills": ["React", "Next.js", "Node.js", "TypeScript"]},
    "data_ai": {"salary_multiplier": 1.42, "skills": ["Python", "PyTorch", "LLMs", "RAG"]},
    "cloud_infrastructure": {"salary_multiplier": 1.32, "skills": ["Kubernetes", "Terraform", "AWS", "Docker"]},
    "service_generic": {"salary_multiplier": 0.85, "skills": ["Java", "Python", "SQL"]}
}

EXPERIENCE_MULTIPLIERS = {
    "intern": 0.45, "junior": 0.70, "mid": 1.00, "senior": 1.45, "staff": 1.90, "principal": 2.40, "manager": 2.20
}

CITY_TO_COUNTRY = {
    "bangalore": "india", "hyderabad": "india", "mumbai": "india", "pune": "india", "delhi": "india",
    "noida": "india", "gurgaon": "india", "chennai": "india", "ahmedabad": "india", "kolkata": "india",
    "kochi": "india", "indore": "india", "jaipur": "india", "bhubaneswar": "india",
    "san francisco": "usa", "seattle": "usa", "new york": "usa", "austin": "usa", "boston": "usa", "chicago": "usa",
    "london": "uk", "manchester": "uk", "birmingham": "uk",
    "berlin": "germany", "paris": "france", "amsterdam": "netherlands", "dublin": "ireland",
    "dubai": "uae", "abu dhabi": "uae", "riyadh": "saudi arabia",
    "toronto": "canada", "vancouver": "canada",
    "singapore": "singapore", "bangkok": "thailand", "jakarta": "indonesia",
    "sydney": "australia", "melbourne": "australia",
    "tokyo": "japan", "seoul": "south korea", "remote": "global", "worldwide": "global"
}

COUNTRY_TO_REGION = {
    "germany": "europe", "france": "europe", "netherlands": "europe", "ireland": "europe",
    "uae": "middle_east", "saudi arabia": "middle_east",
    "singapore": "southeast_asia", "thailand": "southeast_asia", "indonesia": "southeast_asia",
    "japan": "global", "south korea": "global"
}

# =========================================================
# 2. CLASSIFIER LOGIC (Role Normalization)
# =========================================================

def normalize_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9+#./ ]+", " ", text)
    return re.sub(r"\s+", " ", text)

def classify_role(role_text: str) -> Dict[str, str]:
    norm = normalize_text(role_text)
    
    # Simple Keyword Scoring for Domain
    scores = defaultdict(int)
    rules = {
        "data_ai": ["ai", "machine learning", "data", "ml", "llm"],
        "cloud_infrastructure": ["devops", "cloud", "sre", "infrastructure", "kubernetes"],
        "web_fullstack": ["web", "frontend", "backend", "fullstack", "react", "node"]
    }
    
    for domain, keywords in rules.items():
        for kw in keywords:
            if kw in norm: scores[domain] += 1
            
    domain = max(scores, key=scores.get) if scores else "service_generic"
    
    # Seniority Scoring
    seniority = "mid"
    if any(k in norm for k in ["intern", "fresher", "trainee"]): seniority = "intern"
    elif any(k in norm for k in ["junior", "associate", "entry"]): seniority = "junior"
    elif any(k in norm for k in ["senior", "sr", "lead", "staff", "principal"]): seniority = "senior"
    
    return {"domain": domain, "seniority": seniority}

# =========================================================
# 3. SEARCH & EXTRACTION (Serper.dev / Tavily / LLM)
# =========================================================

async def get_live_context(role: str, location: str) -> str:
    """
    Gather market context. Primary: Tavily (Monthly Reset). Fallback: Serper (One-time).
    """
    current_year = datetime.datetime.now().year
    if not settings.SERPER_API_KEY and not settings.TAVILY_API_KEY:
        return ""

    try:
        async with httpx.AsyncClient() as client:
            # 1. Try Tavily Primary (Monthly Reset)
            if settings.TAVILY_API_KEY:
                try:
                    logger.info(f"Searching Tavily Primary for {role}...")
                    url = "https://api.tavily.com/search"
                    payload = {
                        "api_key": settings.TAVILY_API_KEY, 
                        "query": f"Market report for {role} in {location} {current_year}",
                        "search_depth": "advanced"
                    }
                    res = await client.post(url, json=payload, timeout=15)
                    if res.status_code == 200:
                        data = res.json().get("results", [])
                        if data:
                            return "\n\n".join([f"Content: {r.get('content')}" for r in data])
                except Exception as e:
                    logger.warning(f"Tavily attempt failed: {e}")

            # 2. Try Serper Fallback (One-time credits)
            if settings.SERPER_API_KEY:
                try:
                    logger.info(f"Searching Serper Fallback for {role}...")
                    url = "https://google.serper.dev/search"
                    headers = {'X-API-KEY': settings.SERPER_API_KEY, 'Content-Type': 'application/json'}
                    payload = {"q": f"{role} salary and hiring in {location} {current_year}", "num": 10}
                    res = await client.post(url, headers=headers, json=payload, timeout=10)
                    if res.status_code == 200:
                        data = res.json().get("organic", [])
                        if data:
                            return "\n\n".join([f"Snippet: {r.get('snippet')}" for r in data])
                except Exception as e:
                    logger.warning(f"Serper attempt failed: {e}")
                    
    except Exception as e:
        logger.error(f"Global search error: {e}")
    return ""

async def extract_metrics(context: str, role: str, location: str, provider: str | None) -> Dict[str, Any]:
    if not context: return {}
    try:
        from app.agents.registry import get_user_proxy
        from autogen import AssistantAgent
        
        prompt = (
            f"You are a market data extractor. Based on these snippets for '{role}' in '{location}':\n"
            f"{context[:3800]}\n\n"
            "Generate a JSON object with exactly these keys:\n"
            "- salary_range: {min, max, formatted}\n"
            "- hiring_volume: A string like '500+ active roles'\n"
            "- top_skills: A list of 6 strings\n"
            "- hiring_companies: A list of 5 company names\n"
            "- summary: A 2-sentence professional analysis.\n\n"
            "Respond ONLY with the JSON object."
        )
        
        agent = AssistantAgent(
            name="Analyst", 
            llm_config=settings.get_llm_config(provider), 
            system_message="You are a JSON-only extractor. No talk, only JSON."
        )
        user_proxy = get_user_proxy()
        
        # Reset chat to avoid history interference
        await asyncio.to_thread(user_proxy.initiate_chat, agent, message=prompt, max_turns=1, clear_history=True)
        
        reply = user_proxy.last_message(agent) or {}
        content = reply.get("content", "").strip()
        
        logger.debug(f"RAW LLM Response: {content[:200]}...")
        
        # Clean JSON extraction (handles markdown blocks)
        json_match = re.search(r"({.*})", content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))
            
        return json.loads(content)
    except Exception as e:
        logger.error(f"LLM Extraction failed: {e}")
        return {}

# =========================================================
# 4. UNIFIED ENTRY POINT
# =========================================================

async def get_market_intelligence(role: str, location: str, provider: str | None = None, seniority: str | None = None) -> dict:
    from app.core.cache import get_cached_response, set_cached_response
    
    start_time = datetime.datetime.now()
    cls = classify_role(role)
    senior_level = seniority or cls["seniority"]
    
    # STEP 0: Check Cache (Saves Credits!)
    cached = get_cached_response("market", role, location, senior_level)
    if cached:
        cached["execution_time"] = (datetime.datetime.now() - start_time).total_seconds()
        cached["is_cached"] = True
        return cached

    # STEP 1: Live Search (Tavily/Serper)
    context = await get_live_context(role, location)
    
    # STEP 2: Intelligent Extraction (with Model Switch)
    active_provider = provider or settings.LLM_PROVIDER
    live = await extract_metrics(context, role, location, active_provider)
    
    # 3. Final Calibration (Use KB if live data is sparse)
    if not live:
        logger.warning("No live data found. Using regional benchmarks.")
        city_key = location.split(",")[0].strip().lower()
        country = CITY_TO_COUNTRY.get(city_key, "global")
        
        # Resolve Region for baseline lookup
        region = COUNTRY_TO_REGION.get(country, country)
        prof = REGION_PROFILES.get(region, REGION_PROFILES["global"])
        domain = DOMAIN_PROFILES.get(cls["domain"], DOMAIN_PROFILES["service_generic"])
        mult = EXPERIENCE_MULTIPLIERS.get(senior_level, 1.0)
        base = prof["baseline_salary"] * domain["salary_multiplier"] * mult
        live = {
            "salary_range": {"formatted": f"{prof['symbol']}{int(base*0.85):,} - {int(base*1.15):,}"},
            "hiring_volume": "Stable based on benchmarks",
            "top_skills": domain["skills"],
            "hiring_companies": ["Regional Hubs", "Tier-1 Tech"],
            "summary": "Benchmarked against authoritative regional data."
        }

    # 4. Final Data Structure
    res = {
        "role": role, "location": location, "seniority": senior_level,
        "salary_range": live.get("salary_range"),
        "hiring_volume": live.get("hiring_volume"),
        "top_skills": [{"skill": s} for s in live.get("top_skills", [])],
        "top_companies": [{"name": c} for c in live.get("hiring_companies", [])],
        "summary": live.get("summary"),
        "execution_time": (datetime.datetime.now() - start_time).total_seconds(),
        "provider": active_provider,
        "is_cached": False
    }
    
    # STEP 5: Save to Cache (for 7 days)
    set_cached_response("market", res, role, location, senior_level)
    
    return res
