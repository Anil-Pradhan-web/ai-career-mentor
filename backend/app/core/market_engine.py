from duckduckgo_search import DDGS
import random
import datetime
from loguru import logger

def get_real_market_context(role: str, location: str) -> str:
    """
    Fetch real-time search snippets for the job market, specifically targeting job boards.
    """
    try:
        with DDGS() as ddgs:
            # Better, more targeted queries for real-time data
            queries = [
                f'site:linkedin.com/jobs "{role}" in "{location}"',
                f'"{role}" salaries {location} levels.fyi glassdoor 2025',
                f'current hiring trends "{role}" {location} news 2025',
                f'top tech employers hiring {role} in {location} right now'
            ]
            all_results = []
            for q in queries:
                results = list(ddgs.text(q, max_results=5))
                for r in results:
                    all_results.append(f"Title: {r.get('title')}\nSource: {r.get('href')}\nSnippet: {r.get('body')}")
            
            # If we got no results, try a broader search
            if not all_results:
                broader_results = list(ddgs.text(f"{role} job market {location} 2025", max_results=5))
                for r in broader_results:
                    all_results.append(f"Snippet: {r.get('body')}")

            return "\n\n".join(all_results)
    except Exception as e:
        logger.warning(f"Market search failed: {e}")
        return "No real-time data found."

def get_deterministic_market_data(role: str, location: str) -> dict:
    """
    Generates structured, deterministic market data based on the role and location.
    In a real production system, this would scrape LinkedIn, Levels.fyi, or query a DB.
    For this implementation, we use deterministic seeds so the data is consistent
    but feels extremely realistic and varied based on the role.
    """
    # Create a reproducible seed
    seed_str = f"{role.lower()}_{location.lower()}"
    seed_val = sum(ord(c) for c in seed_str)
    random.seed(seed_val)
    
    current_year = datetime.datetime.now().year
    
    # 1. Historical Salary Data (Last 4 years)
    is_india = "india" in location.lower()
    if is_india:
        base_salary = random.randint(800000, 2500000)
    else:
        base_salary = random.randint(80000, 160000)
        
    salary_growth_rate = random.uniform(0.05, 0.12)
    
    historical_salary = []
    for year in range(current_year - 4, current_year):
        year_salary = int(base_salary * ((1 - salary_growth_rate) ** (current_year - year)))
        # Format properly
        if is_india:
            # e.g., 12.5L
            formatted = f"{(year_salary / 100000):.1f}L"
        else:
            # e.g., $110k
            formatted = f"${int(year_salary / 1000)}k"
            
        historical_salary.append({"year": year, "salary": year_salary, "formatted": formatted})
        
    # Current year
    if is_india:
        formatted = f"{(base_salary / 100000):.1f}L"
    else:
        formatted = f"${int(base_salary / 1000)}k"
    historical_salary.append({"year": current_year, "salary": base_salary, "formatted": formatted})
    
    # 2. Historical Hiring Volume
    base_volume = random.randint(1000, 15000)
    growth_trend = random.choice([0.08, 0.15, -0.02, 0.20, 0.10])
    historical_hiring = []
    
    for year in range(current_year - 4, current_year):
        year_volume = int(base_volume * ((1 - growth_trend) ** (current_year - year)))
        historical_hiring.append({"year": year, "volume": year_volume})
        
    historical_hiring.append({"year": current_year, "volume": base_volume})
    
    # 3. Top Hiring Companies
    # --- GLOBAL POOLS ---
    us_tech_giants = ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Netflix", "Uber", "Salesforce", "Oracle", "IBM", "Adobe"]
    us_startups = ["OpenAI", "Anthropic", "Stripe", "Airbnb", "Databricks", "Snowflake", "Plaid", "Figma", "SpaceX", "Vast", "Scale AI"]
    
    # --- INDIA POOLS ---
    india_service_giants = ["TCS", "Infosys", "Wipro", "Cognizant", "HCLTech", "Tech Mahindra", "LTIMindtree"]
    india_product_unicorns = ["Flipkart", "Zomato", "Swiggy", "Razorpay", "CRED", "Ola", "Paytm", "Jio", "Dream11"]
    india_gics = ["Microsoft IDC", "Google India", "Amazon India", "Goldman Sachs (India)", "JPMC (India)", "ServiceNow (India)", "Uber India"]
    
    # --- UK & EUROPE POOLS ---
    uk_hubs = ["Barclays", "HSBC", "Lloyds", "Monzo", "Revolut", "Deliveroo", "Wise", "DeepMind", "Arm", "Checkout.com"]
    germany_hubs = ["SAP", "Siemens", "Delivery Hero", "N26", "Zalando", "HelloFresh", "Bayer", "BMW Group", "Tier Mobility"]
    netherlands_hubs = ["ASML", "Adyen", "Booking.com", "Mollie", "Just Eat Takeaway", "Phillips", "ING Bank"]
    ireland_hubs = ["Stripe (Dublin)", "Intercom", "Workday", "Accenture (Ireland)", "Google (Dublin)", "Meta (Dublin)"]
    
    # --- ASIA / OCEANIA POOLS ---
    singapore_hubs = ["Grab", "Sea Group", "Shopee", "Lazada", "DBS Bank", "Singtel", "GoTo", "Bytedance (SG)"]
    australia_hubs = ["Atlassian", "Canva", "Afterpay", "Xero", "CommBank", "Telstra", "Woolworths Group", "Airwallex"]
    canada_hubs = ["Shopify", "TD Bank", "RBC", "Hootsuite", "Slack (Canada)", "OpenText", "CGI Group"]
    
    # --- MIDDLE EAST POOLS ---
    uae_hubs = ["Careem", "Property Finder", "Talabat", "Noon", "Bayut", "Etisalat", "First Abu Dhabi Bank", "Kitopi"]

    pool = []
    location_lower = location.lower()
    
    if "india" in location_lower:
        pool = india_product_unicorns + india_gics + india_service_giants
    elif any(loc in location_lower for loc in ["united states", "usa", "san francisco", "new york", "seattle", "austin"]):
        pool = us_tech_giants + us_startups
    elif any(loc in location_lower for loc in ["united kingdom", "uk", "london"]):
        pool = uk_hubs + us_tech_giants
    elif "germany" in location_lower or "berlin" in location_lower:
        pool = germany_hubs + us_tech_giants
    elif "netherlands" in location_lower or "amsterdam" in location_lower:
        pool = netherlands_hubs + us_tech_giants
    elif "ireland" in location_lower or "dublin" in location_lower:
        pool = ireland_hubs + us_tech_giants
    elif "singapore" in location_lower:
        pool = singapore_hubs + us_tech_giants
    elif "australia" in location_lower:
        pool = australia_hubs + us_tech_giants
    elif "canada" in location_lower:
        pool = canada_hubs + us_tech_giants
    elif any(loc in location_lower for loc in ["uae", "dubai", "abu dhabi"]):
        pool = uae_hubs + ["Amazon (Dubai)", "Microsoft (UAE)"]
    else:
        pool = us_tech_giants + india_service_giants + ["Siemens", "SAP", "Samsung"]
        
    # Ensure variety but prioritize local
    selected_companies = random.sample(pool, min(len(pool), 6))
    company_hiring_stats = []
    for comp in selected_companies:
        # Realistic volume for the region/company type
        is_service = any(x in comp for x in ["TCS", "Infosys", "Wipro", "Cognizant", "HCL"])
        max_hiring = 2000 if is_service else 500
        company_hiring_stats.append({
            "name": comp,
            "hiring_volume": random.randint(30, max_hiring)
        })
    company_hiring_stats.sort(key=lambda x: x["hiring_volume"], reverse=True)
    
    # 4. Top Skills Frequency
    common_skills = ["Python", "Java", "React", "Node.js", "AWS", "Docker", "Kubernetes", "SQL", "MongoDB", "TypeScript", "Go", "C++", "System Design", "Machine Learning", "Data Analysis", "CI/CD", "GraphQL", "Redis"]
    
    if "india" in location_lower:
        common_skills += ["Spring Boot", "Angular", "React Native", "Flutter", "SAP"]
    elif "united states" in location_lower or "san francisco" in location_lower:
        common_skills += ["Next.js", "Rust", "Golang", "Terraform", "PyTorch"]
        
    role_skills = random.sample(list(set(common_skills)), 8)
    top_skills_freq = []
    for skill in role_skills:
        top_skills_freq.append({
            "skill": skill,
            "frequency": random.randint(150, 950)
        })
    top_skills_freq.sort(key=lambda x: x["frequency"], reverse=True)
    
    # Reset seed so we don't break other random processes
    random.seed()
    
    return {
        "role": role,
        "location": location,
        "historical_salary": historical_salary,
        "historical_hiring": historical_hiring,
        "company_hiring_stats": company_hiring_stats,
        "top_skills_freq": top_skills_freq,
        "market_trend": "Growing" if growth_trend > 0 else "Stable"
    }
