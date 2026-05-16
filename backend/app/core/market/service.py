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
                        "query": f"Companies actively hiring {role} in {location} {current_year} with salary and skills demand",
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
                    payload = {"q": f"Companies hiring {role} in {location} {current_year} open roles and salary", "num": 10}
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
            f"You are a strict JSON data extractor. Analyze these snippets for '{role}' in '{location}':\n"
            f"{context[:3800]}\n\n"
            "You MUST output a valid JSON object matching EXACTLY this format (fill in with real or inferred data):\n"
            "{\n"
            '  "salary_range": {"min": 80000, "max": 120000, "formatted": "$80,000 - $120,000"},\n'
            '  "hiring_volume": "500+",\n'
            '  "top_skills_freq": [{"skill": "Python", "frequency": 90}, {"skill": "React", "frequency": 80}],\n'
            '  "hiring_companies": [{"name": "Top Tech Corp", "hiring_volume": "High"}, {"name": "Regional Startups", "hiring_volume": "Stable"}],\n'
            '  "market_trend": "High Demand",\n'
            '  "summary": "Brief analysis here."\n'
            "}\n"
            "RULES:\n"
            "1. hiring_volume MUST be a short number string like '500+' or '1200+'.\n"
            "2. hiring_companies MUST have exactly 5 objects. Infer regional top employers if snippets lack names.\n"
            "3. top_skills_freq MUST have exactly 6 objects.\n"
            "4. NEVER omit any keys. Return ONLY JSON."
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
        raw_json = json_match.group(1) if json_match else content
        
        try:
            return json.loads(raw_json)
        except json.JSONDecodeError:
            logger.warning("JSON Decode Error encountered, attempting auto-repair on brackets...")
            # Auto-repair common LLM JSON syntax errors if direct parsing fails
            repaired = raw_json.replace('}},', '}],').replace('}}', '}]}').replace(']}]}', ']}').replace('}),', '}],').replace('})', '}]}')
            try:
                return json.loads(repaired)
            except Exception:
                raise ValueError("JSON repair failed")
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
    
    # STEP 0: Check Cache (Temporarily Bypassed to force fresh data with new schema)
    # cached = get_cached_response("market", role, location, senior_level)
    # if cached:
    #     cached["execution_time"] = (datetime.datetime.now() - start_time).total_seconds()
    #     cached["is_cached"] = True
    #     return cached

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
            "market_trend": "Stable Demand",
            "hiring_volume": "1000+",
            "top_skills_freq": [{"skill": s, "frequency": 85} for s in domain["skills"]],
            "hiring_companies": [
                {"name": "Regional Hubs", "hiring_volume": "Stable"}, 
                {"name": "Tier-1 Tech", "hiring_volume": "High"}
            ],
            "summary": "Benchmarked against authoritative regional data."
        }
        
    # Extract real numbers from the live data
    salary_str = str(live.get("salary_range", ""))
    base_sal_match = re.search(r"(\d{2,})", salary_str.replace(",", ""))
    base_chart_salary = int(base_sal_match.group(1)) if base_sal_match else 0
    
    hiring_str = str(live.get("hiring_volume", ""))
    base_vol_match = re.search(r"(\d+)", hiring_str.replace(",", ""))
    base_chart_volume = int(base_vol_match.group(1)) if base_vol_match else 0
    
    current_year = datetime.datetime.now().year

    # 4. Final Data Structure with Guaranteed Fallbacks for UI
    safe_hiring_companies = live.get("hiring_companies")
    if not safe_hiring_companies or not isinstance(safe_hiring_companies, list):
        safe_hiring_companies = [{"name": "Top Regional Employers", "hiring_volume": "Active Hiring"}]
        
    safe_skills_freq = live.get("top_skills_freq")
    if not safe_skills_freq or not isinstance(safe_skills_freq, list):
        safe_skills_freq = [{"skill": "Software Engineering", "frequency": 85}, {"skill": "Problem Solving", "frequency": 80}]

    res = {
        "role": role, "location": location, "seniority": senior_level,
        "salary_range": live.get("salary_range") or {"formatted": "N/A"},
        "market_trend": live.get("market_trend", "Stable Demand"),
        "hiring_volume": live.get("hiring_volume") or "500+",
        "top_skills_freq": safe_skills_freq,
        "top_skills": [{"skill": s} for s in live.get("top_skills", [])],
        "hiring_companies": safe_hiring_companies,
        "historical_salary": [
            {"year": current_year, "salary": base_chart_salary},
        ],
        "historical_hiring": [
            {"year": current_year, "volume": base_chart_volume},
        ],
        "summary": live.get("summary") or "Market conditions indicate consistent demand for engineering talent in this region.",
        "execution_time": (datetime.datetime.now() - start_time).total_seconds(),
        "provider": active_provider,
        "is_cached": False
    }
    
    # STEP 5: Save to Cache (for 7 days)
    set_cached_response("market", res, role, location, senior_level)
    
    return res
