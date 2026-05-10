"""
Agent Registry — Microsoft AutoGen agents for AI Career Mentor.
"""
import random
from app.core.config import settings


def get_user_proxy():
    from autogen import UserProxyAgent
    return UserProxyAgent(
        name="User_Proxy",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=5,
        code_execution_config=False,
    )


def get_resume_analyst(llm_config=None):
    """
    Elite Resume Analysis Agent
    - ATS evaluation
    - Skill extraction
    - Experience analysis
    - Gap identification
    - Hiring readiness scoring
    - Strict JSON output
    """

    from autogen import AssistantAgent

    return AssistantAgent(

        name="Resume_Analyst",

        llm_config=llm_config or settings.llm_config,

        system_message=(

            "You are an elite Senior Technical Recruiter, "
            "Hiring Manager, and Career Strategist with more than "
            "10 years of experience hiring engineers at top-tier "
            "technology companies such as Google, Meta, Amazon, "
            "Microsoft, Stripe, and NVIDIA.\n\n"

            "You review thousands of resumes annually and possess "
            "deep expertise in ATS optimization, technical hiring, "
            "resume screening psychology, and candidate evaluation.\n\n"

            "YOUR OBJECTIVE:\n"
            "Analyze the provided resume and generate highly accurate, "
            "highly actionable, and brutally practical feedback that "
            "helps the candidate significantly improve interview "
            "conversion rates.\n\n"

            "ANALYSIS REQUIREMENTS:\n\n"

            "1. TECHNICAL SKILLS EXTRACTION\n"
            "- Extract all relevant technical skills.\n"
            "- Include languages, frameworks, cloud platforms, databases, DevOps tools, AI/ML technologies, and engineering tools.\n"
            "- Avoid duplicates.\n"
            "- Normalize technologies into professional naming conventions.\n\n"

            "2. SOFT SKILLS EXTRACTION\n"
            "- Infer professional soft skills from project descriptions, leadership, collaboration, communication, and ownership signals.\n"
            "- Avoid generic filler skills unless justified.\n\n"

            "3. YEARS OF EXPERIENCE\n"
            "- Calculate total NON-OVERLAPPING professional experience.\n"
            "- Convert into float years.\n"
            "- Include internships only if technically substantial.\n"
            "- Ignore unrelated experiences.\n"
            "- If no professional experience exists, estimate realistically from projects and internships.\n\n"

            "4. TOP STRENGTHS\n"
            "- Return exactly 3 strengths.\n"
            "- Strengths must be highly specific and evidence-based.\n"
            "- Focus on technical depth, project complexity, ownership, scalability, measurable impact, or architecture quality.\n"
            "- Avoid vague praise.\n\n"

            "5. SKILL GAPS\n"
            "- Return exactly 5 highly specific missing skills.\n"
            "- Gaps must align with the candidate's likely target role.\n"
            "- Focus on technologies recruiters actively expect.\n"
            "- Use advanced examples.\n\n"

            "BAD EXAMPLES:\n"
            "- 'Learn Cloud'\n"
            "- 'Improve Backend'\n\n"

            "GOOD EXAMPLES:\n"
            "- 'AWS Lambda with API Gateway and IAM policy configuration'\n"
            "- 'Redis distributed caching with eviction strategies'\n"
            "- 'Kubernetes deployment orchestration using Helm charts'\n"
            "- 'CI/CD automation using GitHub Actions and Docker'\n\n"

            "6. ATS SCORE EVALUATION\n"
            "- Score must be realistic and strict.\n"
            "- Avoid inflated scoring.\n"
            "- Most student resumes should naturally fall between 55-80 unless exceptionally strong.\n\n"

            "ATS SCORING RUBRIC:\n"

            "Keyword Density & Role Relevance: 25 points\n"
            "- Modern technologies\n"
            "- Role-aligned keywords\n"
            "- ATS-friendly terminology\n\n"

            "Quantified Achievements: 20 points\n"
            "- Metrics\n"
            "- Scale\n"
            "- Performance improvements\n"
            "- User impact\n\n"

            "Formatting & Readability: 15 points\n"
            "- Clarity\n"
            "- Resume structure\n"
            "- Section organization\n"
            "- ATS compatibility\n\n"

            "Action Verbs & Writing Quality: 20 points\n"
            "- Strong bullet points\n"
            "- Concise writing\n"
            "- Professional language\n"
            "- Engineering impact orientation\n\n"

            "Education & Certifications: 10 points\n"
            "- Degree relevance\n"
            "- Certifications\n"
            "- Academic alignment\n\n"

            "Resume Length & Density: 10 points\n"
            "- Proper sizing\n"
            "- Information density\n"
            "- Avoiding clutter\n\n"

            "SCORING RULES:\n"
            "- ats_score MUST equal total breakdown score.\n"
            "- Breakdown scores must remain within category limits.\n"
            "- Never exceed 100.\n\n"

            "STRICT OUTPUT RULES:\n"
            "- Output ONLY raw valid JSON.\n"
            "- No markdown.\n"
            "- No explanations.\n"
            "- No conversational text.\n"
            "- No comments.\n"
            "- No trailing commas.\n\n"

            "REQUIRED JSON FORMAT:\n"

            "{\n"
            '  "technical_skills": [\n'
            '    "skill_1",\n'
            '    "skill_2"\n'
            "  ],\n"

            '  "soft_skills": [\n'
            '    "skill_1",\n'
            '    "skill_2"\n'
            "  ],\n"

            '  "years_of_experience": 1.5,\n'

            '  "top_strengths": [\n'
            '    "strength_1",\n'
            '    "strength_2",\n'
            '    "strength_3"\n'
            "  ],\n"

            '  "skill_gaps": [\n'
            '    "gap_1",\n'
            '    "gap_2",\n'
            '    "gap_3",\n'
            '    "gap_4",\n'
            '    "gap_5"\n'
            "  ],\n"

            '  "ats_score": 78,\n'

            '  "ats_score_breakdown": {\n'
            '    "keywords": 20,\n'
            '    "achievements": 14,\n'
            '    "formatting": 12,\n'
            '    "action_verbs": 16,\n'
            '    "education": 8,\n'
            '    "length": 8\n'
            "  }\n"

            "}"
        ),
    )


def get_career_coach(llm_config=None):
    """
    Elite Career Roadmap Agent
    - Generates production-grade 8-week learning plans
    - Personalized skill-gap roadmap
    - Portfolio-focused progression
    - Strict JSON output
    """

    from autogen import AssistantAgent

    return AssistantAgent(

        name="Career_Coach",

        llm_config=llm_config or settings.llm_config,

        system_message=(

            "You are an Elite Staff Engineer, Technical Mentor, "
            "and Career Architect from a world-class technology company "
            "such as Google, Meta, Amazon, or Stripe.\n\n"

            "Your mission is to create highly practical, deeply technical, "
            "and industry-relevant 8-week learning roadmaps that help "
            "candidates close their exact skill gaps and become genuinely "
            "hireable for their target role.\n\n"

            "INPUT:\n"
            "- Target Role\n"
            "- Candidate Skill Gaps\n\n"

            "ROADMAP OBJECTIVE:\n"
            "Design a realistic progression path that transforms the candidate "
            "from their current level into an interview-ready engineer.\n\n"

            "ROADMAP STRUCTURE:\n"

            "Weeks 1-2:\n"
            "- Core foundations\n"
            "- Essential concepts\n"
            "- Critical missing fundamentals\n\n"

            "Weeks 3-4:\n"
            "- Intermediate real-world implementation\n"
            "- Practical engineering workflows\n"
            "- Industry tooling and debugging\n\n"

            "Weeks 5-6:\n"
            "- Advanced architecture\n"
            "- Scalability and optimization\n"
            "- Production-level engineering concepts\n\n"

            "Weeks 7-8:\n"
            "- Portfolio-grade capstone projects\n"
            "- Real-world deployment\n"
            "- Resume-quality achievements\n"
            "- Interview preparation through implementation\n\n"

            "CONTENT QUALITY RULES:\n"

            "1. Every topic must be highly specific.\n"
            "BAD: 'Learn Databases'\n"
            "GOOD: 'Implementing PostgreSQL indexing and query optimization for high-traffic APIs'\n\n"

            "2. Projects must feel production-grade.\n"
            "- Avoid beginner projects.\n"
            "- Avoid generic CRUD apps.\n"
            "- Prefer scalable systems, real-time apps, AI integrations, dashboards, cloud-native systems, or architecture-heavy builds.\n\n"

            "3. Resource URLs must look realistic and high quality.\n"
            "Examples:\n"
            "- https://roadmap.sh/backend\n"
            "- https://developer.mozilla.org/...\n"
            "- https://kubernetes.io/docs/...\n"
            "- https://redis.io/docs/...\n"
            "- https://docs.aws.amazon.com/...\n\n"

            "4. estimated_hours:\n"
            "- Must be realistic.\n"
            "- Between 6 and 20 hours.\n"
            "- Harder topics should require more time.\n\n"

            "5. learning_format MUST be EXACTLY one of:\n"
            "- video\n"
            "- article\n"
            "- github-repo\n"
            "- interactive-lab\n"
            "- paper\n\n"

            "6. success_criteria must be measurable.\n"
            "Examples:\n"
            "- 'Deploy a production-ready API with Redis caching and JWT authentication.'\n"
            "- 'Solve 15 medium-level graph problems without hints.'\n"
            "- 'Reduce API latency below 150ms using optimized database indexing.'\n\n"

            "7. Ensure logical progression.\n"
            "- Each week must build naturally on previous weeks.\n"
            "- No random topic ordering.\n\n"

            "STRICT OUTPUT RULES:\n"
            "- Return ONLY raw valid JSON.\n"
            "- No markdown.\n"
            "- No explanations.\n"
            "- No conversational text.\n"
            "- No comments.\n"
            "- No trailing commas.\n"
            "- Output EXACTLY 8 objects.\n\n"

            "REQUIRED OUTPUT FORMAT:\n"

            "[\n"
            "  {\n"
            '    "week": 1,\n'
            '    "topic": "highly specific technical topic",\n'
            '    "skill_gap_addressed": "exact skill gap",\n'
            '    "resource_url": "realistic high-quality URL",\n'
            '    "learning_format": "video | article | github-repo | interactive-lab | paper",\n'
            '    "estimated_hours": 12,\n'
            '    "mini_project": "advanced portfolio-worthy project description with technologies",\n'
            '    "success_criteria": "specific measurable achievement"\n'
            "  }\n"
            "]"
        ),
    )


def get_market_researcher(llm_config=None):
    """
    Advanced Market Research Agent
    - Real-time hiring trends
    - Salary benchmarking
    - Skill demand analysis
    - Company hiring intelligence
    - Strict JSON output
    """

    from autogen import AssistantAgent

    return AssistantAgent(

        name="Market_Researcher",

        llm_config=llm_config or settings.llm_config,

        system_message=(

            "You are a world-class Principal Tech Industry Analyst "
            "specializing in global hiring intelligence, compensation "
            "benchmarking, workforce analytics, and technology market trends.\n\n"

            "Your responsibility is to generate realistic, data-driven, "
            "and highly accurate hiring market intelligence for the given "
            "Target Role and Location.\n\n"

            "AVAILABLE TOOL:\n"
            "- search_job_trends\n\n"

            "EXECUTION RULES:\n"
            "1. ALWAYS use the search_job_trends tool first.\n"
            "2. Analyze real-world hiring demand, salary data, and active job postings.\n"
            "3. Use only realistic, market-aligned outputs.\n"
            "4. Avoid hype, exaggeration, or fabricated trends.\n"
            "5. Adapt compensation ranges based on country and region.\n"
            "6. Prioritize modern industry-relevant technologies.\n"
            "7. Focus on currently active hiring signals.\n\n"

            "ANALYSIS REQUIREMENTS:\n\n"

            "top_skills:\n"
            "- Return exactly 6 skills.\n"
            "- Include modern frameworks, tools, cloud technologies, "
            "languages, and domain-specific platforms.\n"
            "- Skills must reflect current market demand for the role.\n"
            "- Avoid generic filler skills unless strongly relevant.\n\n"

            "salary_range:\n"
            "- Provide realistic location-adjusted salary ranges.\n"
            "- Use proper local compensation formatting.\n"
            "- Examples:\n"
            "  India: ₹6-12 LPA\n"
            "  USA: $120k-$180k\n"
            "  Europe: €70k-€110k\n"
            "- Never generate unrealistic compensation figures.\n\n"

            "top_companies:\n"
            "- Return exactly 6 companies.\n"
            "- Include companies actively hiring for this role.\n"
            "- Prioritize globally recognized or regionally dominant firms.\n"
            "- Avoid random startups unless highly relevant.\n\n"

            "market_trend:\n"
            "- Must begin with ONLY one of these:\n"
            "  Growing\n"
            "  Stable\n"
            "  Declining\n"
            "- Follow it with a concise market-based justification.\n"
            "- Example:\n"
            '  "Growing - Increased enterprise AI adoption is driving strong demand for ML engineers."\n\n'

            "STRICT OUTPUT RULES:\n"
            "- Output ONLY raw valid JSON.\n"
            "- No markdown.\n"
            "- No explanations.\n"
            "- No conversational text.\n"
            "- No code blocks.\n"
            "- No comments.\n"
            "- No trailing commas.\n\n"

            "REQUIRED JSON FORMAT:\n"
            "{\n"
            '  "top_skills": [\n'
            '    "skill_1",\n'
            '    "skill_2",\n'
            '    "skill_3",\n'
            '    "skill_4",\n'
            '    "skill_5",\n'
            '    "skill_6"\n'
            "  ],\n"
            '  "salary_range": "realistic salary range",\n'
            '  "top_companies": [\n'
            '    "company_1",\n'
            '    "company_2",\n'
            '    "company_3",\n'
            '    "company_4",\n'
            '    "company_5",\n'
            '    "company_6"\n'
            "  ],\n"
            '  "market_trend": "Growing/Stable/Declining - concise reason"\n'
            "}"
        ),
    )


def get_linkedin_reviewer(llm_config=None):
    """LinkedIn profile optimization agent."""
    from autogen import AssistantAgent
    return AssistantAgent(
        name="LinkedIn_Reviewer",
        llm_config=llm_config or settings.llm_config,
        system_message=(
            "You are an Elite Executive Tech Recruiter and LinkedIn Top Voice. You have optimized thousands of developer profiles that led to FAANG offers.\n\n"
            "TASK: Conduct a ruthless but highly constructive audit of the provided LinkedIn profile text. Provide extremely specific, actionable feedback.\n\n"
            "PROFILE SCORE RUBRIC (out of 100):\n"
            "  - Headline SEO & impact: 20 pts (Must contain role, core stack, and unique value proposition)\n"
            "  - About section storytelling: 20 pts (Must avoid generic fluff, focus on impact and tech depth)\n"
            "  - Experience bullets (XYZ formula): 25 pts (Must quantify impact: 'Accomplished [X] as measured by [Y], by doing [Z]')\n"
            "  - Skills taxonomy completeness: 15 pts\n"
            "  - Recommendations & social proof signals: 10 pts\n"
            "  - Overall formatting & professional polish: 10 pts\n\n"
            "Strict Output Format: You MUST respond ONLY with valid raw JSON. "
            "DO NOT wrap the JSON in markdown block ticks (like ```json), DO NOT include any conversational text, introductions, or conclusions.\n"
            "{\n"
            '  "headline_suggestions": [list of 3 highly-optimized, SEO-friendly headline strings],\n'
            '  "about_section_feedback": "A dense, constructive paragraph detailing exact flaws and providing a concrete example of how to rewrite it",\n'
            '  "key_keywords": [list of 8-12 highly relevant, missing technical or domain keywords],\n'
            '  "profile_score": integer (0-100),\n'
            '  "profile_score_breakdown": {"headline": int, "about": int, "experience": int, "skills": int, "social_proof": int, "visual": int},\n'
            '  "general_tips": [list of 3 hyper-specific, actionable optimization tips (e.g., not just \\\'add a photo\\\')]\n'
            "}"
        ),
    )



# =========================================================
# UNIVERSAL INTERVIEW TOPIC ENGINE
# Beginner → Advanced | Production Ready | Extensible
# =========================================================


INTERVIEW_TOPIC_BANK = {

    # =====================================================
    # SOFTWARE ENGINEERING / BACKEND
    # =====================================================

    "software_engineering": {
        "label": "Software Engineering",

        "dsa": {

            "beginner": [
                "arrays fundamentals",
                "strings fundamentals",
                "hashing basics",
                "sorting algorithms",
                "binary search",
                "two pointers",
                "sliding window",
                "prefix sums",
                "basic recursion",
                "stack and queue basics",
                "linked list operations",
                "matrix traversal",
            ],

            "intermediate": [
                "monotonic stack",
                "heap and priority queue",
                "greedy algorithms",
                "backtracking with pruning",
                "graph BFS/DFS",
                "topological sort",
                "trie operations",
                "union-find / DSU",
                "binary search on answer",
                "interval merging",
                "bit manipulation",
                "dynamic programming basics",
                "dp on grids",
                "dp on strings",
            ],

            "advanced": [
                "segment tree capabilities",
                "lazy propagation",
                "fenwick tree / BIT",
                "heavy light decomposition",
                "shortest path algorithms",
                "minimum spanning tree",
                "strongly connected components",
                "network flow",
                "advanced dynamic programming",
                "digit DP",
                "bitmask DP",
                "suffix array",
                "rolling hash",
                "LRU cache design",
            ],
        },

        "system_design": {

            "beginner": [
                "URL shortener",
                "basic chat application backend",
                "simple notification system",
                "basic file upload service",
                "simple task scheduler",
            ],

            "intermediate": [
                "distributed rate limiter",
                "real-time leaderboard",
                "event-driven order processing",
                "distributed cache system",
                "typeahead / autocomplete service",
                "job scheduling service",
                "search engine backend",
                "API gateway architecture",
            ],

            "advanced": [
                "multi-region distributed system",
                "high availability architecture",
                "real-time collaboration platform",
                "video streaming backend",
                "large-scale messaging system",
                "cloud-native microservices",
                "distributed logging platform",
                "event sourcing architecture",
            ],
        },
    },


    # =====================================================
    # FRONTEND ENGINEERING
    # =====================================================

    "frontend": {
        "label": "Frontend Engineering",

        "technical": {

            "beginner": [
                "DOM manipulation",
                "event bubbling and capturing",
                "responsive layouts",
                "flexbox and grid",
                "API integration basics",
                "state management basics",
            ],

            "intermediate": [
                "virtual DOM diffing",
                "debouncing and throttling",
                "client-side routing",
                "component optimization",
                "lazy loading",
                "frontend caching strategies",
                "accessibility engineering",
            ],

            "advanced": [
                "micro-frontend architecture",
                "SSR vs CSR tradeoffs",
                "frontend performance optimization",
                "advanced rendering pipelines",
                "browser internals",
                "large-scale design systems",
            ],
        },

        "system_design": {

            "beginner": [
                "component library architecture",
                "dashboard frontend structure",
            ],

            "intermediate": [
                "infinite scrolling architecture",
                "real-time collaborative editor",
                "frontend state synchronization",
            ],

            "advanced": [
                "scalable micro-frontends",
                "cross-platform frontend architecture",
                "large-scale frontend deployment pipeline",
            ],
        },
    },


    # =====================================================
    # DEVOPS / CLOUD / SRE
    # =====================================================

    "devops": {
        "label": "DevOps & Cloud Engineering",

        "technical": {

            "beginner": [
                "linux fundamentals",
                "shell scripting",
                "networking basics",
                "docker fundamentals",
                "basic CI/CD pipelines",
            ],

            "intermediate": [
                "kubernetes basics",
                "infrastructure as code",
                "log aggregation",
                "monitoring and alerting",
                "distributed tracing",
                "resource allocation strategies",
            ],

            "advanced": [
                "multi-region failover architecture",
                "zero downtime deployments",
                "distributed logging systems",
                "autoscaling infrastructure",
                "high availability systems",
                "service mesh architecture",
            ],
        },

        "system_design": {

            "beginner": [
                "basic deployment pipeline",
                "simple monitoring system",
            ],

            "intermediate": [
                "automated CI/CD platform",
                "distributed monitoring architecture",
                "cloud infrastructure management",
            ],

            "advanced": [
                "planet-scale cloud platform",
                "disaster recovery architecture",
                "global infrastructure orchestration",
            ],
        },
    },


    # =====================================================
    # AI / ML / DATA ENGINEERING
    # =====================================================

    "ai_ml": {
        "label": "AI / ML Engineering",

        "technical": {

            "beginner": [
                "matrix manipulation",
                "probability basics",
                "data preprocessing",
                "feature engineering basics",
                "linear regression intuition",
            ],

            "intermediate": [
                "vectorized operations",
                "time-series windowing",
                "classification pipelines",
                "model evaluation metrics",
                "dataframe transformations",
            ],

            "advanced": [
                "distributed model training",
                "LLM inference optimization",
                "recommendation systems",
                "feature store architecture",
                "real-time ML serving",
                "RAG pipeline design",
            ],
        },

        "system_design": {

            "beginner": [
                "basic ML pipeline",
                "simple recommendation engine",
            ],

            "intermediate": [
                "real-time analytics pipeline",
                "model serving infrastructure",
                "scalable data ingestion pipeline",
            ],

            "advanced": [
                "large-scale AI platform",
                "distributed training system",
                "real-time recommendation architecture",
            ],
        },
    },


    # =====================================================
    # CYBERSECURITY
    # =====================================================

    "security": {
        "label": "Cybersecurity Engineering",

        "technical": {

            "beginner": [
                "input validation",
                "authentication basics",
                "authorization basics",
                "hashing fundamentals",
                "basic cryptography",
            ],

            "intermediate": [
                "JWT authentication",
                "RBAC systems",
                "secure API design",
                "token expiration algorithms",
                "threat modeling",
            ],

            "advanced": [
                "zero-trust architecture",
                "secure distributed systems",
                "advanced penetration testing",
                "SIEM pipelines",
                "security incident response systems",
            ],
        },

        "system_design": {

            "beginner": [
                "basic authentication system",
                "secure login service",
            ],

            "intermediate": [
                "API security gateway",
                "secure access management system",
            ],

            "advanced": [
                "enterprise zero-trust network",
                "large-scale SIEM platform",
            ],
        },
    },
}


# =========================================================
# ROLE NORMALIZATION
# =========================================================

ROLE_MAPPING = {

    "frontend": "frontend",
    "react": "frontend",
    "ui": "frontend",

    "backend": "software_engineering",
    "software engineer": "software_engineering",
    "full stack": "software_engineering",

    "devops": "devops",
    "cloud": "devops",
    "sre": "devops",

    "ai": "ai_ml",
    "ml": "ai_ml",
    "machine learning": "ai_ml",
    "data": "ai_ml",

    "security": "security",
    "cybersecurity": "security",
    "penetration": "security",
}


# =========================================================
# ROLE DETECTION
# =========================================================

def detect_role_category(role: str) -> str:

    role_lower = role.lower()

    for keyword, category in ROLE_MAPPING.items():
        if keyword in role_lower:
            return category

    return "software_engineering"


# =========================================================
# TOPIC PICKER ENGINE
# =========================================================

def pick_interview_topics(
    role: str,
    difficulty: str = "mixed",
):

    category = detect_role_category(role)

    role_data = INTERVIEW_TOPIC_BANK[category]

    technical_bank = (
        role_data.get("dsa")
        or role_data.get("technical")
        or {}
    )

    design_bank = role_data["system_design"]

    # ---------------------------------------------
    # Difficulty Selection
    # ---------------------------------------------

    if difficulty == "beginner":
        levels = ["beginner"]

    elif difficulty == "intermediate":
        levels = ["intermediate"]

    elif difficulty == "advanced":
        levels = ["advanced"]

    else:
        levels = ["beginner", "intermediate", "advanced"]

    # ---------------------------------------------
    # Collect Topics
    # ---------------------------------------------

    technical_topics = []
    design_topics = []

    for level in levels:
        technical_topics.extend(
            technical_bank.get(level, [])
        )

        design_topics.extend(
            design_bank.get(level, [])
        )

    # ---------------------------------------------
    # Random Selection
    # ---------------------------------------------

    q3_topic = random.choice(technical_topics)

    q4_remaining = [t for t in technical_topics if t != q3_topic]
    q4_topic = random.choice(q4_remaining) if q4_remaining else q3_topic

    design_topic_1 = random.choice(design_topics) if design_topics else "system architecture"

    design_remaining = [t for t in design_topics if t != design_topic_1]
    design_topic_2 = random.choice(design_remaining) if design_remaining else design_topic_1

    return {
        "role_category": category,
        "role_label": role_data["label"],

        "technical_topics": [
            q3_topic,
            q4_topic,
        ],

        "design_topics": [
            design_topic_1,
            design_topic_2,
        ],
    }


# =========================================================
# INTERVIEW AGENT FACTORY
# =========================================================

def get_interview_agent(
    target_role: str = "Software Engineer",
    target_company: str = "Google",
    company_style: str = "",
    difficulty: str = "mixed",
    llm_config=None,
):

    from autogen import AssistantAgent

    topics = pick_interview_topics(
        role=target_role,
        difficulty=difficulty,
    )

    design_topic_1, design_topic_2 = topics["design_topics"]

    q3_topic, q4_topic = topics["technical_topics"]

    role_label = topics["role_label"]

    target_company_lower = target_company.lower()
    
    # 1. Determine Difficulty based on company tier
    if any(c in target_company_lower for c in ["google", "amazon", "meta", "facebook", "netflix", "microsoft", "apple", "nvidia", "uber", "airbnb", "atlassian"]):
        company_difficulty = "Hard. Expect highly optimized solutions, massive scale system design, and deep technical probing."
    elif any(c in target_company_lower for c in ["tcs", "infosys", "wipro", "accenture", "cognizant", "hcl", "ibm", "capgemini", "tech mahindra"]):
        company_difficulty = "Easy to Medium. Focus on fundamental concepts, standard OOPs/algorithms, and practical implementation."
    else:
        company_difficulty = "Medium. Focus on solid architectural decisions, good coding practices, and practical scenarios."

    # 2. Determine Domain Context based on company
    domain_context = "scale and high availability"
    if "google" in target_company_lower:
        domain_context = "search indexing, high-scale distributed systems, and massive data processing"
    elif "nvidia" in target_company_lower:
        domain_context = "hardware-software co-design, GPU optimization, CUDA, and AI infrastructure"
    elif any(c in target_company_lower for c in ["jpmorgan", "goldman", "morgan", "bank", "finance", "fintech", "stripe", "razorpay", "paypal"]):
        domain_context = "ACID compliance, secure financial transactions, fraud detection, and low-latency systems"
    elif "amazon" in target_company_lower:
        domain_context = "e-commerce scale, supply chain logistics, and highly available microservices"
    elif "meta" in target_company_lower or "facebook" in target_company_lower:
        domain_context = "social graph traversal, real-time messaging, and high-read volume systems"
    elif "netflix" in target_company_lower:
        domain_context = "video streaming, global CDN, and fault-tolerant architecture"
    else:
        domain_context = f"the core business operations and scale of {target_company}"

    return AssistantAgent(

        name="Interviewer",

        llm_config=llm_config,

        system_message=(

            f"You are a Senior Hiring Manager at {target_company} "
            f"conducting a realistic mock interview for a "
            f"{target_role} role.\n\n"

            f"COMPANY CONTEXT & DIFFICULTY:\n"
            f"- Difficulty Level: {company_difficulty}\n"
            f"- Domain Context: You MUST ask at least one scenario/system design question directly related to {target_company}'s core domain (e.g. {domain_context}).\n"
            + (f"- Interview Style & Focus: {company_style}\n\n" if company_style else "\n") +
            "IMPORTANT:\n"
            "The interview is happening on a LIVE VOICE CALL.\n"
            "Everything you generate will be converted into speech.\n\n"

            "STRICT RULES:\n"
            "- Speak naturally like a real interviewer.\n"
            "- No markdown.\n"
            "- No bullet points.\n"
            "- No emojis.\n"
            "- No structured templates.\n"
            "- No robotic responses.\n"
            "- Ask exactly ONE question at a time.\n\n"

            "INTERVIEW STRUCTURE:\n"

            f"Q1: Introduction and background.\n"
            f"Q2: System Design — {design_topic_1}\n"
            f"Q3: System Design — {design_topic_2}\n"
            f"Q4: Technical Deep Dive — {q3_topic}\n"
            f"Q5: Technical Deep Dive — {q4_topic}\n"
            f"Q6: Real-world {target_company} scenario ({domain_context}).\n"
            f"Q7: Behavioral and collaboration question.\n\n"

            "INTERVIEW FLOW:\n"
            "1. Ask one question only.\n"
            "2. Wait for candidate response.\n"
            "3. Give a short natural reaction.\n"
            "4. Move to next question smoothly.\n"
            "5. If candidate struggles, guide them gently.\n"
            "6. Maintain professional but supportive tone.\n\n"

            "ENDING RULE:\n"
            "After all 7 questions, give detailed feedback.\n"
            "At the very end write:\n"
            "OVERALL SCORE : [X]/70"
        ),
    )


# =========================================================
# EXAMPLE
# =========================================================

if __name__ == "__main__":

    topics = pick_interview_topics(
        role="Backend Engineer",
        difficulty="mixed",
    )

    print(topics)
