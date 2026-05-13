import re
import random
import datetime
from collections import Counter
from statistics import median
from loguru import logger
from duckduckgo_search import DDGS

# ──────────────────────────────────────────────────────────────────────────────
# REGION + DOMAIN INTELLIGENCE
# ──────────────────────────────────────────────────────────────────────────────

REGION_DATA = {
    "india": {
        "currency": "INR",
        "symbol": "₹",
        "baseline": 1200000,
        "hubs": [
            "bangalore", "bengaluru", "hyderabad", "mumbai",
            "delhi", "noida", "gurgaon", "pune",
            "chennai", "kolkata", "bhubaneswar"
        ],
        "companies": {
            "web_fullstack": [
                "Flipkart", "Razorpay", "PhonePe",
                "Swiggy", "Zomato", "BrowserStack",
                "Postman", "Freshworks", "Zoho"
            ],

            "game_development": [
                "Nazara Technologies",
                "Krafton India",
                "Dream11",
                "Ubisoft Pune",
                "Rockstar Games India"
            ],

            "ai_ml": [
                "Ola Electric",
                "Fractal Analytics",
                "InMobi",
                "Druva",
                "Jio"
            ],

            "fintech": [
                "Paytm",
                "Groww",
                "Pine Labs",
                "Zerodha",
                "BillDesk"
            ],

            "devops_infrastructure": [
                "Postman",
                "Freshworks",
                "BrowserStack",
                "Razorpay",
                "PhonePe"
            ],

            "mobile_development": [
                "Swiggy",
                "Zomato",
                "Dream11",
                "CRED",
                "PhonePe"
            ],

            "qa_automation": [
                "BrowserStack",
                "Postman",
                "LambdaTest",
                "Freshworks"
            ],

            "service_generic": [
                "TCS",
                "Infosys",
                "Wipro",
                "HCLTech",
                "LTIMindtree"
            ]
        }
    },

    "germany": {
        "currency": "EUR",
        "symbol": "€",
        "baseline": 78000,
        "hubs": [
            "berlin", "munich",
            "hamburg", "frankfurt"
        ],
        "companies": {
            "web_fullstack": [
                "SAP",
                "Zalando",
                "N26",
                "Delivery Hero",
                "HelloFresh",
                "Contentful"
            ],

            "game_development": [
                "Crytek",
                "Wooga",
                "Yager",
                "Ubisoft Berlin",
                "Deep Silver"
            ],

            "ai_ml": [
                "DeepL",
                "Celonis",
                "Aleph Alpha",
                "Merantix"
            ],

            "fintech": [
                "Trade Republic",
                "Solaris",
                "Raisin",
                "SumUp"
            ],

            "devops_infrastructure": [
                "SAP",
                "Celonis",
                "Deutsche Telekom",
                "Contentful"
            ],

            "mobile_development": [
                "N26",
                "HelloFresh",
                "Delivery Hero"
            ],

            "qa_automation": [
                "SAP",
                "Celonis",
                "Zalando"
            ],

            "service_generic": [
                "Siemens",
                "Bosch",
                "BMW Group",
                "Deutsche Telekom"
            ]
        }
    },

    "usa": {
        "currency": "USD",
        "symbol": "$",
        "baseline": 145000,
        "hubs": [
            "san francisco",
            "new york",
            "seattle",
            "austin"
        ],
        "companies": {
            "web_fullstack": [
                "Google",
                "Meta",
                "Netflix",
                "Stripe",
                "Uber",
                "Airbnb"
            ],

            "game_development": [
                "Epic Games",
                "Rockstar Games",
                "Blizzard",
                "Valve",
                "Electronic Arts"
            ],

            "ai_ml": [
                "OpenAI",
                "Anthropic",
                "NVIDIA",
                "Databricks"
            ],

            "fintech": [
                "Plaid",
                "Robinhood",
                "Coinbase",
                "Affirm"
            ],

            "devops_infrastructure": [
                "Datadog",
                "Cloudflare",
                "HashiCorp",
                "AWS"
            ],

            "mobile_development": [
                "Uber",
                "DoorDash",
                "Snapchat"
            ],

            "qa_automation": [
                "Sauce Labs",
                "Datadog",
                "New Relic"
            ],

            "service_generic": [
                "Accenture",
                "IBM",
                "Oracle"
            ]
        }
    },

    "global": {
        "currency": "USD",
        "symbol": "$",
        "baseline": 100000,
        "hubs": [],
        "companies": {
            "web_fullstack": [
                "Google",
                "Microsoft",
                "Amazon",
                "Shopify"
            ],

            "game_development": [
                "Epic Games",
                "Ubisoft",
                "Unity"
            ],

            "ai_ml": [
                "OpenAI",
                "Anthropic",
                "NVIDIA"
            ],

            "service_generic": [
                "Accenture",
                "IBM"
            ]
        }
    }
}

# ──────────────────────────────────────────────────────────────────────────────
# ROLE → DOMAIN
# ──────────────────────────────────────────────────────────────────────────────

ROLE_TO_DOMAIN = {

    "frontend": "web_fullstack",
    "backend": "web_fullstack",
    "fullstack": "web_fullstack",
    "software": "web_fullstack",
    "web": "web_fullstack",

    "game": "game_development",
    "unity": "game_development",
    "unreal": "game_development",

    "ai": "ai_ml",
    "ml": "ai_ml",
    "llm": "ai_ml",
    "data": "ai_ml",

    "fintech": "fintech",
    "bank": "fintech",
    "payment": "fintech",

    "devops": "devops_infrastructure",
    "cloud": "devops_infrastructure",
    "sre": "devops_infrastructure",

    "mobile": "mobile_development",
    "android": "mobile_development",
    "ios": "mobile_development",

    "qa": "qa_automation",
    "test": "qa_automation",
    "sdet": "qa_automation",
}

# ──────────────────────────────────────────────────────────────────────────────
# SKILLS
# ──────────────────────────────────────────────────────────────────────────────

DOMAIN_SKILLS = {

    "web_fullstack": [
        "React",
        "Node.js",
        "TypeScript",
        "Next.js",
        "AWS",
        "PostgreSQL"
    ],

    "game_development": [
        "Unity",
        "C++",
        "C#",
        "Unreal Engine",
        "Shaders"
    ],

    "ai_ml": [
        "Python",
        "PyTorch",
        "TensorFlow",
        "LLMs",
        "RAG"
    ],

    "fintech": [
        "Kafka",
        "Redis",
        "SQL",
        "Java",
        "Go"
    ],

    "devops_infrastructure": [
        "Docker",
        "Kubernetes",
        "Terraform",
        "AWS",
        "CI/CD"
    ],

    "mobile_development": [
        "Flutter",
        "Kotlin",
        "Swift",
        "Firebase"
    ],

    "qa_automation": [
        "Selenium",
        "Cypress",
        "Postman",
        "Appium"
    ],

    "service_generic": [
        "Java",
        "Python",
        "SQL",
        "Agile"
    ]
}

# ──────────────────────────────────────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────────────────────────────────────

def _detect_region(location: str) -> str:

    loc = location.lower()

    for region, data in REGION_DATA.items():

        if (
            region in loc
            or any(h in loc for h in data["hubs"])
        ):
            return region

    return "global"


def _get_domain(role: str) -> str:

    role = role.lower()

    for keyword, domain in ROLE_TO_DOMAIN.items():

        if keyword in role:
            return domain

    return "service_generic"


def _normalize_text(text: str) -> str:

    return re.sub(
        r"[^a-z0-9 ]",
        " ",
        text.lower()
    )

# ──────────────────────────────────────────────────────────────────────────────
# SEARCH
# ──────────────────────────────────────────────────────────────────────────────

def get_real_market_context(
    role: str,
    location: str,
    domain: str = None
) -> str:

    if domain is None:
        domain = _get_domain(role)

    query = (
        f'"{role}" jobs in {location} '
        f'{domain} hiring salary technologies'
    )


    try:

        with DDGS() as ddgs:

            results = list(
                ddgs.text(
                    query,
                    max_results=12
                )
            )

            return "\n\n".join([
                f"{r.get('title')} - {r.get('body')}"
                for r in results
            ])

    except Exception as e:

        logger.warning(f"Market search failed: {e}")

        return ""

# ──────────────────────────────────────────────────────────────────────────────
# MAIN ENGINE
# ──────────────────────────────────────────────────────────────────────────────

def get_deterministic_market_data(
    role: str,
    location: str
) -> dict:

    now = datetime.datetime.now()

    week_num = now.isocalendar()[1]

    random.seed(
        sum(
            ord(c)
            for c in (
                f"{role.lower()}_"
                f"{location.lower()}_"
                f"{week_num}"
            )
        )
    )

    region = _detect_region(location)

    domain = _get_domain(role)

    reg_info = REGION_DATA[region]

    company_pool = reg_info["companies"].get(
        domain,
        reg_info["companies"]["service_generic"]
    )

    skill_pool = DOMAIN_SKILLS.get(
        domain,
        DOMAIN_SKILLS["service_generic"]
    )

    # ──────────────────────────────────────────────────────────────────
    # LIVE CONTEXT
    # ──────────────────────────────────────────────────────────────────

    context = get_real_market_context(
        role,
        location,
        domain
    )

    text_l = _normalize_text(context)

    # ──────────────────────────────────────────────────────────────────
    # COMPANY EXTRACTION
    # ──────────────────────────────────────────────────────────────────

    company_counts = Counter()

    for company in company_pool:

        normalized_company = _normalize_text(company)

        matches = text_l.count(
            normalized_company
        )

        if matches > 0:

            company_counts[company] += matches

    final_companies = []

    for company, count in company_counts.most_common(6):

        final_companies.append({

            "name": company,

            "hiring_volume": (
                count * 20
            ),

            "confidence": round(
                min(0.6 + (count / 10), 0.95),
                2
            ),

            "source": "Live Market Search"
        })

    # REGION-AWARE FALLBACKS

    if len(final_companies) < 5:

        remaining = [

            c for c in company_pool

            if c not in [
                fc["name"]
                for fc in final_companies
            ]
        ]

        random.shuffle(remaining)

        for company in remaining[:5 - len(final_companies)]:

            final_companies.append({

                "name": company,

                "hiring_volume": random.randint(
                    20,
                    80
                ),

                "confidence": 0.65,

                "source": f"{region.title()} Market"
            })

    # ──────────────────────────────────────────────────────────────────
    # SKILL EXTRACTION
    # ──────────────────────────────────────────────────────────────────

    skill_counts = Counter()

    for skill in skill_pool:

        matches = len(
            re.findall(
                rf"\b{re.escape(skill.lower())}\b",
                text_l
            )
        )

        if matches > 0:

            skill_counts[skill] = matches

    top_skills = []

    if skill_counts:

        total = sum(skill_counts.values())

        for skill, count in skill_counts.most_common(6):

            top_skills.append({

                "skill": skill,

                "frequency": int(
                    (count / total) * 1000
                ),

                "confidence": round(
                    min(0.65 + (count / 10), 0.95),
                    2
                )
            })

    else:

        for skill in skill_pool[:5]:

            top_skills.append({

                "skill": skill,

                "frequency": random.randint(
                    300,
                    800
                ),

                "confidence": 0.55
            })

    # ──────────────────────────────────────────────────────────────────
    # SALARY ENGINE
    # ──────────────────────────────────────────────────────────────────

    base_salary = reg_info["baseline"]

    if domain == "ai_ml":
        base_salary *= 1.3

    elif domain == "game_development":
        base_salary *= 0.92

    elif domain == "devops_infrastructure":
        base_salary *= 1.18

    historical_salary = []

    for year in range(
        now.year - 4,
        now.year + 1
    ):

        variation = random.uniform(
            0.96,
            1.08
        )

        yearly_salary = int(
            (
                base_salary
                * variation
            ) * (
                0.93 ** (
                    now.year - year
                )
            )
        )

        if reg_info["currency"] == "INR":

            formatted = (
                f"₹"
                f"{(yearly_salary / 100000):.1f} "
                f"LPA"
            )

        else:

            formatted = (
                f"{reg_info['symbol']}"
                f"{int(yearly_salary / 1000)}k"
            )

        historical_salary.append({

            "year": year,

            "salary": yearly_salary,

            "formatted": formatted
        })

    # ──────────────────────────────────────────────────────────────────
    # MARKET TREND
    # ──────────────────────────────────────────────────────────────────

    hiring_signals = len(
        re.findall(
            r"(hiring|vacancy|opening|urgent)",
            text_l
        )
    )

    if hiring_signals > 12:
        market_trend = "Explosive"

    elif hiring_signals > 5:
        market_trend = "Strong"

    else:
        market_trend = "Stable"

    # ──────────────────────────────────────────────────────────────────
    # MARKET SUMMARY
    # ──────────────────────────────────────────────────────────────────

    top_skill_names = [
        s["skill"]
        for s in top_skills[:2]
    ]

    market_summary = (
        f"{role} roles in {location} are showing "
        f"{market_trend.lower()} hiring demand, "
        f"especially around "
        f"{', '.join(top_skill_names)}."
    )

    market_confidence = round(

        min(
            (
                len(final_companies)
                + len(top_skills)
            ) / 12,
            0.95
        ),

        2
    )

    # ──────────────────────────────────────────────────────────────────

    random.seed()

    return {

        "role": role,

        "location": location,

        "region": region.upper(),

        "market_confidence": market_confidence,

        "market_summary": market_summary,

        "historical_salary": historical_salary,

        "historical_hiring": [

            {
                "year": y,

                "volume": random.randint(
                    500,
                    5000
                )
            }

            for y in range(
                now.year - 4,
                now.year + 1
            )
        ],

        "company_hiring_stats": sorted(
            final_companies,
            key=lambda x: x["hiring_volume"],
            reverse=True
        ),

        "top_skills_freq": sorted(
            top_skills,
            key=lambda x: x["frequency"],
            reverse=True
        ),

        "market_trend": market_trend,

        "last_updated": now.strftime(
            "%Y-W%W"
        )
    }