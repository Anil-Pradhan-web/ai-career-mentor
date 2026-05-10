from duckduckgo_search import DDGS
import random
import datetime
from loguru import logger

def get_real_market_context(role: str, location: str) -> str:
    """
    Fetch real-time search snippets for the job market.
    """
    try:
        with DDGS() as ddgs:
            queries = [
                f"{role} salary trends {location} 2024 2025",
                f"top companies hiring {role} in {location}",
                f"in-demand skills for {role} {location} 2025"
            ]
            all_results = []
            for q in queries:
                results = list(ddgs.text(q, max_results=3))
                for r in results:
                    all_results.append(f"Source: {r.get('href')}\nSnippet: {r.get('body')}")
            
            return "\n\n".join(all_results)
    except Exception as e:
        logger.warning(f"Market search failed: {e}")
        return "No real-time data found. Use fallback deterministic logic."

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
    tech_giants = ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Netflix", "Uber"]
    startups = ["Stripe", "Airbnb", "Databricks", "Snowflake", "Plaid", "Figma", "OpenAI", "Anthropic"]
    indian_giants = ["TCS", "Infosys", "Wipro", "Cognizant", "HCL", "Tech Mahindra", "Flipkart", "Zomato", "Swiggy"]
    
    pool = []
    if is_india:
        pool = indian_giants + tech_giants + startups
    else:
        pool = tech_giants + startups
        
    selected_companies = random.sample(pool, 6)
    company_hiring_stats = []
    for comp in selected_companies:
        company_hiring_stats.append({
            "name": comp,
            "hiring_volume": random.randint(50, 500)
        })
    company_hiring_stats.sort(key=lambda x: x["hiring_volume"], reverse=True)
    
    # 4. Top Skills Frequency
    common_skills = ["Python", "Java", "React", "Node.js", "AWS", "Docker", "Kubernetes", "SQL", "MongoDB", "TypeScript", "Go", "C++", "System Design", "Machine Learning", "Data Analysis", "CI/CD", "GraphQL", "Redis"]
    role_skills = random.sample(common_skills, 8)
    top_skills_freq = []
    for skill in role_skills:
        top_skills_freq.append({
            "skill": skill,
            "frequency": random.randint(100, 900)
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
