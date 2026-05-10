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
# ADAPTIVE TOPIC SELECTOR ENGINE
# =========================================================

def adaptive_topic_selector(
    role: str,
    company: str,
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

    # Collect all topics
    technical_topics = []
    design_topics = []
    
    levels = ["beginner", "intermediate", "advanced"] if difficulty == "mixed" else [difficulty]
    for level in levels:
        technical_topics.extend(technical_bank.get(level, []))
        design_topics.extend(design_bank.get(level, []))

    # Weighting Engine based on Company Persona
    company_lower = company.lower()
    
    def score_topic(topic: str) -> int:
        topic_lower = topic.lower()
        score = 1
        
        # Netflix / Uber / High-Scale
        if any(c in company_lower for c in ["netflix", "uber", "airbnb", "amazon"]):
            if any(k in topic_lower for k in ["scale", "distributed", "microservices", "streaming", "availability", "load balancing"]):
                score += 10
                
        # Google / Meta / AI-Heavy
        if any(c in company_lower for c in ["google", "meta", "facebook"]):
            if any(k in topic_lower for k in ["graph", "search", "tree", "dynamic programming", "data pipeline"]):
                score += 10
                
        # Fintech / Banks
        if any(c in company_lower for c in ["jpmorgan", "stripe", "razorpay", "goldman", "finance", "bank"]):
            if any(k in topic_lower for k in ["acid", "transaction", "security", "consistency", "sql", "locking"]):
                score += 10
                
        # Service / IT / Enterprise
        if any(c in company_lower for c in ["tcs", "infosys", "wipro", "microsoft", "oracle", "sap"]):
            if any(k in topic_lower for k in ["oop", "dbms", "api", "architecture", "solid", "relational"]):
                score += 10
                
        # Hardware / Core Tech
        if any(c in company_lower for c in ["nvidia", "apple", "intel", "amd"]):
            if any(k in topic_lower for k in ["memory", "concurrency", "os", "c++", "hardware", "latency"]):
                score += 10

        return score + random.randint(0, 3) # Add slight entropy for diversity

    # Sort topics by weighted score descending
    technical_topics = sorted(technical_topics, key=score_topic, reverse=True)
    design_topics = sorted(design_topics, key=score_topic, reverse=True)

    # Pick top weighted topics
    q3_topic = technical_topics[0] if technical_topics else "Data Structures"
    design_topic_1 = design_topics[0] if design_topics else "System Architecture"

    return {
        "role_category": category,
        "role_label": role_data["label"],
        "technical_topics": [q3_topic],
        "design_topics": [design_topic_1],
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

    topics = adaptive_topic_selector(
        role=target_role,
        company=target_company,
        difficulty=difficulty,
    )

    design_topic_1 = topics["design_topics"][0]
    q3_topic = topics["technical_topics"][0]

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
    # 2. Determine Domain Context (Now entirely driven by frontend's company_style)
    domain_context = company_style if company_style else f"the core business operations and scale of {target_company}"

    INTERVIEWER_PERSONAS = [
        "a friendly and supportive mentor who guides the candidate gently",
        "a strict and deeply analytical FAANG interviewer who challenges every assumption",
        "a quiet observer who speaks very little and expects the candidate to drive the conversation",
        "a fast-paced startup engineer who cares most about rapid delivery and practical tradeoffs",
        "an architectural purist who focuses heavily on scale, SOLID principles, and clean design",
    ]
    interviewer_persona = random.choice(INTERVIEWER_PERSONAS)

    return AssistantAgent(

        name="Interviewer",

        llm_config=llm_config,

        system_message=(

            f"You are a Senior Hiring Manager at {target_company} "
            f"conducting a realistic, adaptive mock interview for an Entry-Level / Fresher (Recent B.Tech Graduate) "
            f"applying for the {target_role} role.\n\n"
            
            f"CANDIDATE PROFILE (Fresher):\n"
            f"- The candidate is a 4th-year engineering student or a recent B.Tech graduate.\n"
            f"- Adjust your expectations accordingly: Focus heavily on problem-solving, CS fundamentals, academic projects, and their ability to learn. Do not expect 5+ years of deep industry experience.\n\n"
            
            f"YOUR PERSONALITY:\n"
            f"You must strictly act as {interviewer_persona}. Adapt your tone, pacing, and feedback style to match this persona perfectly.\n\n"

            f"CRITICAL COMPANY PERSONA & FOCUS:\n"
            f"You MUST strictly follow this company's interview style exactly as described:\n"
            f">>> {company_style} <<<\n"
            f"If the company style demands hard algorithms, ask hard algorithms. If it demands core CS fundamentals, ask DBMS/OS/Networks. If it demands behavioral/leadership principles, prioritize that.\n"
            f"Additionally, integrate this domain context into your questions: {domain_context}\n\n"
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

            "DYNAMIC INTERVIEW PHASES (Maximum 7 Questions Total):\n"
            f"Navigate naturally through these phases, entirely adapting the questions to match the {target_company} style:\n"
            "Phase 1: Introduction and background.\n"
            "Phase 2: Technical Screening (CS Fundamentals, OOPs, or basic coding - adapt based on company style).\n"
            "Phase 3: Deep Technical / DSA (Match the difficulty strictly to the company style).\n"
            f"Phase 4: Architecture / System Design (Focus: {design_topic_1} or {target_company} scale).\n"
            f"Phase 5: Real-world {target_company} domain scenario ({domain_context}).\n"
            f"Phase 6: Role-specific Deep Dive / Edge Cases ({q3_topic}).\n"
            "Phase 7: Behavioral / Culture fit (e.g., Leadership Principles, Googleyness, etc).\n\n"

            "ADAPTIVE QUESTIONING & FOLLOW-UP RULES:\n"
            "1. DYNAMIC DIFFICULTY: If the candidate answers well, immediately increase the difficulty. Ask a deep follow-up about tradeoffs, optimization, or edge cases. If they struggle, pivot to easier foundational probing.\n"
            "2. LISTEN AND ADAPT: Do NOT read from a script. Your next question MUST naturally connect to the candidate's previous answer.\n"
            "3. NO REPETITION: Never ask the same concept twice. Vary your topics dynamically.\n"
            "4. ONE QUESTION AT A TIME: Keep it conversational. Ask, listen, react naturally, then probe deeper.\n"
            f"5. COMPANY STRICTNESS: Embody {target_company}. If they are a FAANG, push them on time/space complexity and scalability. If they are a service company, focus on practical usage and fundamentals.\n\n"

            "ENDING RULE:\n"
            "After Phase 7 is completed, you MUST explicitly announce that the interview has concluded in a professional, conversational manner (e.g., 'That concludes our interview today. Thank you for your time, I will now share your feedback.').\n"
            "Then, provide detailed feedback and at the very end write:\n"
            "OVERALL SCORE : [X]/100"
        ),
    )


# =========================================================
# EXAMPLE
# =========================================================

if __name__ == "__main__":

    topics = adaptive_topic_selector(
        role="Backend Engineer",
        company="Netflix",
        difficulty="mixed",
    )

    print(topics)
