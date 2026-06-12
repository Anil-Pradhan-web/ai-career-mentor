# ─── roles.py ───────────────────────────────────────────────────────────────

TARGET_ROLES = [
    # Software Engineering
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile App Developer (Android)",
    "Mobile App Developer (iOS)",

    # Data & AI
    "Data Scientist",
    "Data Analyst",
    "Machine Learning Engineer",
    "Deep Learning Engineer",
    "Generative AI / LLM Engineer",
    "Computer Vision Engineer",
    "NLP Engineer",
    "MLOps Engineer",
    "Data Engineer",

    # Infrastructure & Cloud
    "DevOps Engineer",
    "Site Reliability Engineer (SRE)",
    "Cloud Engineer",
    "Cloud Architect",

    # Security
    "Cybersecurity Analyst",
    "Security Engineer",
    "Penetration Tester",

    # Product & Design
    "Product Manager",
    "Technical Product Manager",
    "UI/UX Designer",

    # Specialized Engineering
    "Blockchain Developer",
    "Game Developer",
    "AR/VR Developer",
    "Embedded Systems / IoT Engineer",
    "Robotics & Automation Engineer",
    "QA / Test Engineer",
    "Solutions Architect",
    "Research Engineer",
]

ROLE_CATEGORIES = {
    "swe": [
        "Software Engineer", "Frontend Developer", "Backend Developer", 
        "Full Stack Developer", "Mobile App Developer (Android)", "Mobile App Developer (iOS)"
    ],
    "data_ai": [
        "Data Scientist", "Data Analyst", "Machine Learning Engineer", "Deep Learning Engineer",
        "Generative AI / LLM Engineer", "Computer Vision Engineer", "NLP Engineer", 
        "MLOps Engineer", "Data Engineer"
    ],
    "infra_cloud": [
        "DevOps Engineer", "Site Reliability Engineer (SRE)", "Cloud Engineer", "Cloud Architect"
    ],
    "security": [
        "Cybersecurity Analyst", "Security Engineer", "Penetration Tester"
    ],
    "product_design": [
        "Product Manager", "Technical Product Manager", "UI/UX Designer"
    ],
    "gaming": [
        "Game Developer", "AR/VR Developer"
    ],
    "specialized": [
        "Blockchain Developer", "Embedded Systems / IoT Engineer", 
        "Robotics & Automation Engineer", "QA / Test Engineer", 
        "Solutions Architect", "Research Engineer"
    ]
}

def get_role_category(role: str) -> str:
    if not role:
        return "swe"
    role_clean = role.strip().lower()
    
    # 1. Exact Match Check against ROLE_CATEGORIES
    for category, roles in ROLE_CATEGORIES.items():
        if any(r.lower() == role_clean for r in roles):
            return category
            
    # 2. Canonical Substring Check (e.g., "Senior Backend Developer" -> "backend developer")
    for category, roles in ROLE_CATEGORIES.items():
        if any(r.lower() in role_clean for r in roles):
            return category

    # 3. Structured Keyword Mapping
    # Ordered list of keywords to match priorities
    KEYWORD_MAPPINGS = [
        # Gaming
        (["game", "ar/vr", "vr", "unreal", "unity", "graphics engineer"], "gaming"),
        # Data & AI
        (["machine learning", "deep learning", "nlp", "computer vision", "generative ai", "llm", "mlops", "data scientist", "data analyst", "data engineer", "ai engineer", "ml engineer"], "data_ai"),
        # Security
        (["cybersecurity", "security", "pentest", "penetration", "threat", "infosec"], "security"),
        # Infrastructure & Cloud
        (["devops", "sre", "reliability", "cloud", "infrastructure", "kubernetes", "platform engineer"], "infra_cloud"),
        # Product & Design
        (["product manager", "tpm", "pm", "ui/ux", "ux", "designer", "product owner"], "product_design"),
        # Specialized
        (["embedded", "robotics", "qa", "test", "solutions architect", "blockchain", "solidity", "research engineer", "hardware engineer"], "specialized"),
        # Software Engineering (Fallback keywords)
        (["software engineer", "developer", "programmer", "frontend", "backend", "fullstack", "mobile developer", "ios", "android"], "swe")
    ]
    
    for keywords, category in KEYWORD_MAPPINGS:
        if any(kw in role_clean for kw in keywords):
            return category
            
    # 4. Strict word-boundary matching for short acronyms to avoid false positives (e.g., "ai" in "maintainer")
    tokens = role_clean.split()
    if "ai" in tokens or "ml" in tokens:
        return "data_ai"
    if "qa" in tokens:
        return "specialized"
        
    return "swe"

# ─── companies.py ────────────────────────────────────────────────────────────

# Company Tiers: FAANG, top-indian-product, indian-service, fintech, mid-product, hardware, gaming, security, hft, other

COMPANY_PROFILES = [
    # ── FAANG / Big Tech ──────────────────────────────────────────────────────
    {
        "name": "Google", "tier": "FAANG", "active": True,
        "interviewStyle": "LC-hard DSA (graph/trie/dp optimizations), 4-system design rounds with Google-scale distributed systems, Googleyness + leadership, 'how would you design YouTube search?'"
    },
    {
        "name": "Microsoft", "tier": "FAANG", "active": True,
        "interviewStyle": "LC-medium/hard (tree/array manipulations), 2 design interviews (low-level + high-level), growth mindset: 'tell me about a time you failed and learned', possible 'how does Windows scheduler work?'"
    },
    {
        "name": "Amazon", "tier": "FAANG", "active": True,
        "interviewStyle": "5 Leadership Principles rounds (STAR grilled hard), LC-medium DSA but tricky edge cases, Bar Raiser will ask 'design Amazon's inventory system at 1M orders/sec'"
    },
    {
        "name": "Apple", "tier": "FAANG", "active": True,
        "interviewStyle": "Deep domain expertise (ARM/Metal/Swift depending on team), practical coding on Xcode, 'how would you improve iPhone battery life by 10%?', quality obsession"
    },
    {
        "name": "Adobe", "tier": "FAANG", "active": True,
        "interviewStyle": "LC-medium with creative twist (image processing algos), system design for creative cloud, deep-dive into past projects: 'how did you optimize that O(n²) solution?'"
    },
    {
        "name": "Oracle", "tier": "FAANG", "active": True,
        "interviewStyle": "Database internals deep-dive (B+ trees, MVCC, query optimization), LC-medium (SQL-heavy sometimes), 'design a distributed transaction coordinator'"
    },
    {
        "name": "Salesforce", "tier": "FAANG", "active": True,
        "interviewStyle": "LC-medium (multithreading often), multi-tenant SaaS design, Ohana values: 'how do you mentor juniors?', Apex/triggers knowledge plus"
    },
    {
        "name": "SAP", "tier": "FAANG", "active": True,
        "interviewStyle": "Enterprise integration puzzles, LC-easy/medium (ABAP or Java), solution architecture: 'design a supply chain demand forecasting module'"
    },
    {
        "name": "Meta", "tier": "FAANG", "active": True,
        "interviewStyle": "LC-hard (graph BFS/DFS with optimizations 45min), system design for social graph: 'design Facebook friend recommendation', behavioral: move fast culture"
    },
    {
        "name": "Netflix", "tier": "FAANG", "active": True,
        "interviewStyle": "Culture-fit heavy (freedom & responsibility), system design for chaos engineering, fault tolerance, LC-hard DP, 'how would you design Netflix's CDN?'"
    },
    {
        "name": "Uber", "tier": "FAANG", "active": True,
        "interviewStyle": "LC-hard (geospatial + priority queues), real-time dispatch: 'design Uber eats matching at 50k orders/min', strong distributed systems with circuit breakers"
    },
    {
        "name": "Airbnb", "tier": "FAANG", "active": True,
        "interviewStyle": "Front-end React/Backend distributed, LC-medium/hard with product sense: 'design a pricing recommendation engine', pixel-perfect expectation"
    },
    {
        "name": "Atlassian", "tier": "FAANG", "active": True,
        "interviewStyle": "Pair programming live (they code with you), LC-medium (Jira-like ticket system design), 'how would you add real-time collaboration to Confluence?'"
    },

    # ── AI Research & Infrastructure ──────────────────────────────────────────
    {
        "name": "OpenAI", "tier": "FAANG", "active": True,
        "interviewStyle": "Large-scale distributed training, 'optimize a transformer kernel for 100k tokens/sec', RLHF theory, LC-hard (concurrency heavy), safety alignment"
    },
    {
        "name": "Anthropic", "tier": "FAANG", "active": True,
        "interviewStyle": "Constitutional AI principles, 'design a robust evaluation framework for model bias', LC-hard, deep dive into LLM scaling laws"
    },
    {
        "name": "Hugging Face", "tier": "mid-product", "active": True,
        "interviewStyle": "Open-source ecosystem, 'design a versioned model registry for 1M models', LC-medium/hard, PyTorch/JAX internals, community-first engineering"
    },
    {
        "name": "Mistral AI", "tier": "mid-product", "active": True,
        "interviewStyle": "Efficient inference, 'design a MoE (Mixture of Experts) routing layer', low-latency C++/CUDA, sparse attention mechanisms"
    },
    {
        "name": "Databricks", "tier": "FAANG", "active": True,
        "interviewStyle": "Spark internals, 'optimize a distributed join for 10PB of data', Lakehouse architecture, LC-hard DSA, query optimizer design"
    },
    {
        "name": "Snowflake", "tier": "FAANG", "active": True,
        "interviewStyle": "Multi-tenant data warehouse, 'design a cloud-agnostic storage layer with 99.999% durability', LC-hard, SQL engine performance"
    },
    {
        "name": "Cohere", "tier": "mid-product", "active": True,
        "interviewStyle": "Enterprise RAG (Retrieval Augmented Generation), 'design a vector database connector with sub-10ms latency', LC-medium/hard, NLP depth"
    },
    {
        "name": "Perplexity", "tier": "mid-product", "active": True,
        "interviewStyle": "Real-time search & synthesis, 'design a streaming response aggregator for multi-source RAG', LC-medium/hard, product-focused AI"
    },

    # ── Top Indian Product ────────────────────────────────────────────────────
    {
        "name": "Zerodha", "tier": "top-indian-product", "active": True,
        "interviewStyle": "No-fluff: live trading system design, idempotency of orders, fintech depth: 'how to prevent double debit?', LC-medium (but practical only)"
    },
    {
        "name": "Razorpay", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Payments webhook reliability, idempotency keys, 'design a fraud detection rule engine', LC-medium with concurrency questions"
    },
    {
        "name": "CRED", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Premium app design, 'reverse engineer our referral leaderboard', LC-medium, product intuition: 'why does CRED use gamification?'"
    },
    {
        "name": "PhonePe", "tier": "top-indian-product", "active": True,
        "interviewStyle": "UPI switch design, transaction reconciliation at scale, LC-medium DSA (sliding window problems), 'design a bill payment reminder system'"
    },
    {
        "name": "Groww", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Mutual fund order routing, 'design a stock price ticker at 100ms latency', LC-medium, startup ownership: 'describe your fastest feature launch'"
    },
    {
        "name": "Postman", "tier": "top-indian-product", "active": True,
        "interviewStyle": "API lifecycle depth, 'design a request mock server with matching rules', LC-medium, developer tooling: 'how to improve API collection runner?'"
    },
    {
        "name": "BrowserStack", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Browser VM orchestration, 'design a parallel test execution framework', LC-medium, cross-browser quirks knowledge expected"
    },
    {
        "name": "Freshworks", "tier": "top-indian-product", "active": True,
        "interviewStyle": "SaaS multi-tenant data isolation, LC-medium, 'design a ticket SLA escalation engine', customer-centric metrics"
    },
    {
        "name": "Zoho", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Strong CS fundamentals (OS + DBMS grilled), practical low-level design, 'build a mini Excel formula parser', LC-easy but thorough"
    },
    {
        "name": "Ola Electric", "tier": "top-indian-product", "active": True,
        "interviewStyle": "IoT + EV telemetry processing, 'design a battery health prediction system', LC-medium, hardware-software integration"
    },
    {
        "name": "Unacademy", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Ed-tech content delivery, 'design a live class recording system', LC-medium, CDN caching strategies"
    },
    {
        "name": "ShareChat", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Social media at India-scale, 'design a viral feed for regional languages', LC-medium/hard with recommendation basics"
    },

    # ── E-commerce & Consumer ─────────────────────────────────────────────────
    {
        "name": "Flipkart", "tier": "mid-product", "active": True,
        "interviewStyle": "LC-medium/hard (graph + heap), e-commerce scale: 'design Flipkart's Big Billion Days inventory service', warehouse allocation puzzles"
    },
    {
        "name": "Swiggy", "tier": "mid-product", "active": True,
        "interviewStyle": "Real-time logistics matching, 'design a delivery agent assignment algorithm with surge', LC-medium DSA, SLA breach handling"
    },
    {
        "name": "Zomato", "tier": "mid-product", "active": True,
        "interviewStyle": "Restaurant search ranking, 'design a restaurant discovery with dynamic filters', LC-medium, hyperlocal caching strategies"
    },
    {
        "name": "Meesho", "tier": "mid-product", "active": True,
        "interviewStyle": "Social commerce graph, 'design a reseller commission tracking system', LC-medium, frugal engineering with WhatsApp API integration"
    },
    {
        "name": "Ola", "tier": "mid-product", "active": True,
        "interviewStyle": "MAPS API integration, 'design a real-time ETA prediction', LC-medium DSA (Dijkstra variations), mobility platform"
    },
    {
        "name": "Nykaa", "tier": "mid-product", "active": True,
        "interviewStyle": "Inventory management for beauty, 'design a flash sale checkout system', LC-easy/medium, D2C thinking"
    },
    {
        "name": "InMobi", "tier": "mid-product", "active": True,
        "interviewStyle": "Ad-tech real-time bidding (RTB), 'design an ad auction with 100ms SLA', LC-medium, DSP/SSP knowledge plus"
    },
    {
        "name": "Paytm", "tier": "mid-product", "active": True,
        "interviewStyle": "Super-app scale: 'design a QR code payment retry logic with idempotency', LC-medium, high-throughput system design"
    },
    {
        "name": "Dream11", "tier": "mid-product", "active": True,
        "interviewStyle": "Fantasy sports team validation, 'design a live score updater under 1 sec latency', LC-medium, concurrency + leaderboard"
    },
    {
        "name": "Myntra", "tier": "mid-product", "active": True,
        "interviewStyle": "Fashion recommendation engine, 'design a size recommendation system', LC-medium, returns logistics puzzles"
    },
    {
        "name": "Maersk", "tier": "mid-product", "active": True,
        "interviewStyle": "Global logistics visibility, 'design a container tracking system with IoT telemetry', LC-medium, supply chain resilience"
    },
    {
        "name": "HighRadius", "tier": "mid-product", "active": True,
        "interviewStyle": "AI-driven treasury management, 'design an automated invoice matching engine', LC-medium, B2B SaaS architecture"
    },
    {
        "name": "Delhivery", "tier": "mid-product", "active": True,
        "interviewStyle": "Last-mile delivery optimization, 'design a courier routing algorithm for 1M parcels/day', LC-medium/hard, high-throughput ingestion"
    },
    {
        "name": "FedEx", "tier": "mid-product", "active": True,
        "interviewStyle": "Global shipment orchestration, 'design a cross-border logistics clearing house simulation', LC-medium, legacy modernization"
    },
    {
        "name": "DHL", "tier": "mid-product", "active": True,
        "interviewStyle": "Supply chain digitization, 'design a warehouse automation sensor dashboard', LC-medium, inventory forecasting"
    },
    {
        "name": "Blue Dart", "tier": "mid-product", "active": True,
        "interviewStyle": "Express delivery networks, 'design a flight-based shipment scheduling system', LC-easy/medium, reliability and SLA tracking"
    },
    {
        "name": "Rivigo", "tier": "mid-product", "active": True,
        "interviewStyle": "Relay trucking logistics, 'design a driver-relay matching algorithm with real-time ETA', LC-medium, geospatial indexing"
    },
    {
        "name": "Shadowfax", "tier": "mid-product", "active": True,
        "interviewStyle": "Hyperlocal delivery fleet, 'design a multi-tenant gig-economy task allocator', LC-medium, real-time surge pricing"
    },

    # ── Fintech ───────────────────────────────────────────────────────────────
    {
        "name": "NPCI", "tier": "fintech", "active": True,
        "interviewStyle": "UPI switch infrastructure, transaction reconciliation at India-scale, 'design a real-time fraud detection for UPI', idempotency in payments"
    },
    {
        "name": "Pine Labs", "tier": "fintech", "active": True,
        "interviewStyle": "POS terminal reconciliation, 'design an offline payment capture system', LC-medium, embedded fintech + EMI logic"
    },
    {
        "name": "PolicyBazaar", "tier": "fintech", "active": True,
        "interviewStyle": "Insurance comparison engine, 'design a premium calculation rule engine with 500+ rules', LC-medium, web scraper design"
    },
    {
        "name": "JPMorgan", "tier": "fintech", "active": True,
        "interviewStyle": "Object-oriented design for trading platform, LC-medium (core Java/C++), 'design a limit order book', financial derivatives basics"
    },
    {
        "name": "Goldman Sachs", "tier": "fintech", "active": True,
        "interviewStyle": "Quant-heavy: DP + math, LC-hard, 'design a risk calculation system for derivatives', low-latency C++ expectations"
    },
    {
        "name": "Stripe", "tier": "fintech", "active": True,
        "interviewStyle": "Bug squash round (live debugging), pair programming API design, 'design a webhook delivery system with exponential backoff', high bar"
    },
    {
        "name": "PayPal", "tier": "fintech", "active": True,
        "interviewStyle": "Distributed transaction monitoring, LC-medium, 'design a fraud detection rule engine', REST API security deep-dive"
    },
    {
        "name": "Coinbase", "tier": "fintech", "active": True,
        "interviewStyle": "Blockchain transaction handling, 'design a crypto wallet with double-spend prevention', LC-medium/hard, Web3 knowledge plus"
    },
    {
        "name": "Niyo", "tier": "fintech", "active": True,
        "interviewStyle": "Neobanking international travel card, 'design forex rate alert system', LC-medium, zero-balance account logic"
    },
    {
        "name": "BharatPe", "tier": "fintech", "active": True,
        "interviewStyle": "QR code lending, 'design a merchant cash advance repayment tracker', LC-medium, UPI switching insights"
    },
    {
        "name": "ICICI Bank", "tier": "fintech", "active": True,
        "interviewStyle": "Banking API security, 'design a secure mobile banking login with MFA', LC-easy/medium, transaction atomicity"
    },
    {
        "name": "Axis Bank", "tier": "fintech", "active": True,
        "interviewStyle": "Retail banking digital transformation, 'design a credit card reward point ledger', LC-easy/medium, RDBMS deep-dive"
    },

    # ── IT Services ───────────────────────────────────────────────────────────
    {
        "name": "TCS", "tier": "indian-service", "active": True,
        "interviewStyle": "NQT style: aptitude + coding, LC-easy (array rotation, string palindrome), 'identify output of this C pointer code', communication"
    },
    {
        "name": "Infosys", "tier": "indian-service", "active": True,
        "interviewStyle": "Specialist role: Java concurrency or Spring boot, LC-easy, 'design an employee leave management system', articulation matters"
    },
    {
        "name": "Wipro", "tier": "indian-service", "active": True,
        "interviewStyle": "Turbo coding: 2 LC-easy in 30 mins, OOPS concepts grilled, 'explain polymorphism with real example', project walkthrough"
    },
    {
        "name": "HCLTech", "tier": "indian-service", "active": True,
        "interviewStyle": "Domain-specific (networking/cloud), LC-easy, 'write SQL query for second highest salary', client handling scenarios"
    },
    {
        "name": "Tech Mahindra", "tier": "indian-service", "active": True,
        "interviewStyle": "5G knowledge plus, LC-easy (recursion basics), 'debug this Java code snippet', telecom domain"
    },
    {
        "name": "LTIMindtree", "tier": "indian-service", "active": True,
        "interviewStyle": "Full stack basics, LC-easy/medium (two-sum variation), 'design a mini shopping cart REST API', delivery mindset"
    },
    {
        "name": "Cognizant", "tier": "indian-service", "active": True,
        "interviewStyle": "Genc next: LC-easy (array + string), 'what happens when you type URL?', client communication simulation"
    },
    {
        "name": "Mphasis", "tier": "indian-service", "active": True,
        "interviewStyle": "Fintech adjacent: basic transaction processing, LC-easy, 'design a simple bank account class', cloud basics (AWS EC2)"
    },
    {
        "name": "Accenture", "tier": "indian-service", "active": True,
        "interviewStyle": "Agile + cloud basics, LC-easy/medium, 'describe a sprint where you delivered under pressure', consulting scenario"
    },
    {
        "name": "IBM", "tier": "indian-service", "active": True,
        "interviewStyle": "Enterprise integration puzzles, LC-easy/medium, 'design a message queue with pub-sub', legacy modernization"
    },
    {
        "name": "Capgemini", "tier": "indian-service", "active": True,
        "interviewStyle": "Basic OOPS + database normalization, LC-easy, 'explain 3NF with example', Excel for client communication"
    },
    {
        "name": "Deloitte USI", "tier": "indian-service", "active": True,
        "interviewStyle": "Consulting + tech: 'design an expense approval workflow', LC-easy, case interview with ROI calculation"
    },
    {
        "name": "PwC India", "tier": "indian-service", "active": True,
        "interviewStyle": "Consulting + tech: 'design an expense approval workflow', LC-easy, client pitch simulation"
    },
    {
        "name": "EY India", "tier": "indian-service", "active": True,
        "interviewStyle": "Risk advisory and digital transformation, 'design a regulatory compliance tracker', LC-easy/medium, SQL heavy"
    },
    {
        "name": "KPMG India", "tier": "indian-service", "active": True,
        "interviewStyle": "Business consulting + data, 'solve this supply chain optimization case', LC-easy, data storytelling"
    },
    {
        "name": "Hexaware", "tier": "indian-service", "active": True,
        "interviewStyle": "Automation-first mindset, 'how to automate this manual testing scenario?', LC-easy, cloud basics"
    },
    {
        "name": "DXC Technology", "tier": "indian-service", "active": True,
        "interviewStyle": "Modern IT operations, 'design a system health monitoring dashboard', LC-easy, ITSM knowledge"
    },
    {
        "name": "Coforge", "tier": "indian-service", "active": True,
        "interviewStyle": "Travel and insurance domain focus, 'design a flight booking retry logic', LC-easy/medium, API design"
    },
    {
        "name": "Infogain", "tier": "indian-service", "active": True,
        "interviewStyle": "Digital product engineering, 'design a real-time event logging system', LC-easy/medium, Spring/React depth"
    },
    {
        "name": "ITC Infotech", "tier": "indian-service", "active": True,
        "interviewStyle": "Manufacturing and CPG solutions, 'design a warehouse inventory tracker', LC-easy, PL/SQL depth"
    },
    {
        "name": "Optum", "tier": "indian-service", "active": True,
        "interviewStyle": "Healthcare data scale, 'design a HIPAA-compliant patient record system', LC-medium, distributed systems"
    },

    # ── Hardware / Semiconductor / Core ────────────────────────────────────────
    {
        "name": "NVIDIA", "tier": "hardware", "active": True,
        "interviewStyle": "CUDA kernel optimization, 'parallelize matrix multiplication on GPU', LC-hard DSA + memory bandwidth questions"
    },
    {
        "name": "Intel", "tier": "hardware", "active": True,
        "interviewStyle": "Cache coherency protocols, 'design a branch predictor', LC-medium/hard with x86 assembly sometimes"
    },
    {
        "name": "Qualcomm", "tier": "hardware", "active": True,
        "interviewStyle": "IoT power management, 'design an interrupt handler for sensor', LC-medium, DSP + signal processing"
    },
    {
        "name": "Texas Instruments", "tier": "hardware", "active": True,
        "interviewStyle": "Embedded C + RTOS task scheduling, 'design a watchdog timer', circuit-level debugging scenarios"
    },
    {
        "name": "Tata Elxsi", "tier": "hardware", "active": True,
        "interviewStyle": "AUTOSAR + CAN bus simulation, 'design a brake-by-wire message handler', LC-easy/medium, ISO 26262 awareness"
    },
    {
        "name": "KPIT", "tier": "hardware", "active": True,
        "interviewStyle": "MISRA C compliance, 'design a adaptive cruise control state machine', CAN/LIN protocol deep-dive"
    },
    {
        "name": "ARM", "tier": "hardware", "active": True,
        "interviewStyle": "Pipeline hazards and forwarding, 'design a simple 5-stage CPU', LC-hard (bit manipulation heavy)"
    },
    {
        "name": "AMD", "tier": "hardware", "active": True,
        "interviewStyle": "RDNA architecture, 'optimize a ray tracing shader', LC-hard + GPU compute model"
    },
    {
        "name": "Micron", "tier": "hardware", "active": True,
        "interviewStyle": "Memory controller design, 'solve DDR4 timing constraints', LC-medium, transistor-level basics"
    },
    {
        "name": "Samsung", "tier": "hardware", "active": True,
        "interviewStyle": "Consumer electronics scale, 'design a smart TV app store backend', LC-medium, memory management in C/C++"
    },
    {
        "name": "Robert Bosch", "tier": "hardware", "active": True,
        "interviewStyle": "Automotive software engineering, 'design a lane-keep assist control logic', C/C++ depth, RTOS fundamentals"
    },
    {
        "name": "HP Inc", "tier": "hardware", "active": True,
        "interviewStyle": "Print/PC firmware engineering, 'design a print queue priority manager', LC-easy/medium, embedded systems"
    },
    {
        "name": "Dell", "tier": "hardware", "active": True,
        "interviewStyle": "Enterprise infrastructure, 'design a RAID controller simulation', LC-easy/medium, server-side fundamentals"
    },
    {
        "name": "Hyundai", "tier": "hardware", "active": True,
        "interviewStyle": "Connected car tech (BlueLink), 'design a remote vehicle unlock API with security', LC-easy/medium, IoT protocols"
    },
    {
        "name": "Tata Technologies", "tier": "hardware", "active": True,
        "interviewStyle": "Product lifecycle management (PLM), 'design a bill of materials (BOM) hierarchy', LC-easy, CAD/CAM integration"
    },
    {
        "name": "Reliance Industries", "tier": "other", "active": True,
        "interviewStyle": "Large scale industrial automation, 'design a refinery sensor monitoring system', LC-easy/medium, high availability"
    },
    {
        "name": "Adani Group", "tier": "other", "active": True,
        "interviewStyle": "Infrastructure management, 'design a power grid load balancer simulation', LC-easy, scalability basics"
    },
    {
        "name": "Voltas", "tier": "hardware", "active": True,
        "interviewStyle": "Mechanical-electrical systems, 'design a smart AC thermostat logic', LC-easy, control systems basics"
    },
    {
        "name": "TVS", "tier": "hardware", "active": True,
        "interviewStyle": "EV battery management systems (BMS), 'design a charging station finder with real-time slots', LC-easy/medium"
    },

    # ── Security ──────────────────────────────────────────────────────────────
    {
        "name": "Palo Alto Networks", "tier": "security", "active": True,
        "interviewStyle": "Network threat modeling with STRIDE, 'design a next-gen firewall rule matcher', LC-medium, SIEM log correlation"
    },
    {
        "name": "CrowdStrike", "tier": "security", "active": True,
        "interviewStyle": "Endpoint detection: 'design a behavioral detection engine', EDR event deduplication, LC-medium, incident response playbook"
    },
    {
        "name": "Quick Heal / Seqrite", "tier": "security", "active": True,
        "interviewStyle": "Malware signature generation, 'design a heuristic virus detector', LC-easy/medium, PE file parsing"
    },
    {
        "name": "Zscaler", "tier": "security", "active": True,
        "interviewStyle": "Zero trust architecture, 'design a SSL inspection proxy', LC-medium, TLS handshake deep-dive"
    },
    {
        "name": "Fortinet", "tier": "security", "active": True,
        "interviewStyle": "IPS signature performance, 'design a fast pattern matcher (Aho-Corasick)', LC-hard, network protocols"
    },

    # ── Analytics / AI / Specialized ───────────────────────────────────────────
    {
        "name": "Fractal Analytics", "tier": "other", "active": True,
        "interviewStyle": "ML case study: 'predict customer churn with XGBoost', LC-medium, statistics quiz (p-value, bias-variance)"
    },
    {
        "name": "Mu Sigma", "tier": "other", "active": True,
        "interviewStyle": "Analytics consulting: 'solve this business case with data storytelling', LC-easy, guesstimates + logic puzzles"
    },
    {
        "name": "Tiger Analytics", "tier": "other", "active": True,
        "interviewStyle": "Python pandas deep-dive, 'optimize a slow data pipeline', LC-medium, A/B testing design"
    },
    {
        "name": "LatentView", "tier": "other", "active": True,
        "interviewStyle": "Data visualization insights, 'find anomalies in this sales data', LC-easy, stakeholder presentation mock"
    },
    {
        "name": "Informatica", "tier": "other", "active": True,
        "interviewStyle": "Data integration and ETL, 'design a metadata-driven data pipeline', LC-medium, SQL and data modeling"
    },
    {
        "name": "Finastra", "tier": "fintech", "active": True,
        "interviewStyle": "Open banking APIs, 'design a multi-currency payment gateway', LC-medium, transaction reliability"
    },
    {
        "name": "Temenos", "tier": "fintech", "active": True,
        "interviewStyle": "Core banking transformations, 'design a real-time interest calculation engine', LC-medium, financial software architecture"
    },
    {
        "name": "Rapyuta Robotics", "tier": "other", "active": True,
        "interviewStyle": "Multi-robot orchestration, 'design a collision avoidance algorithm for warehouse robots', LC-hard, ROS knowledge"
    },
    {
        "name": "MAQ Software", "tier": "indian-service", "active": True,
        "interviewStyle": "Power BI and Azure focus, 'design a dashboard for 10M rows', LC-easy, SQL and data warehousing"
    },
    {
        "name": "Tudip Technologies", "tier": "indian-service", "active": True,
        "interviewStyle": "Agile product engineering, 'how to handle changing requirements in a sprint?', LC-easy, full-stack basics"
    },
    {
        "name": "FactSet", "tier": "fintech", "active": True,
        "interviewStyle": "Financial data analytics, 'design a real-time stock price feed aggregator', LC-medium, data structure efficiency"
    },
    {
        "name": "Odessa Tech", "tier": "other", "active": True,
        "interviewStyle": "Asset finance software, 'design a lease schedule calculator', LC-easy/medium, OOPS and database design"
    },
    {
        "name": "Kloudgin", "tier": "other", "active": True,
        "interviewStyle": "Field service and asset management, 'design a real-time field technician tracking system', LC-easy/medium, mobile-first SaaS"
    },
    {
        "name": "Bitwise", "tier": "indian-service", "active": True,
        "interviewStyle": "Data warehousing and ETL, 'how to optimize a slow SQL query with 1B rows?', LC-easy/medium, ETL tools"
    },
    {
        "name": "CGI", "tier": "indian-service", "active": True,
        "interviewStyle": "End-to-end IT consulting, 'design a citizen portal for government services', LC-easy, client handling"
    },
    {
        "name": "Directi", "tier": "mid-product", "active": True,
        "interviewStyle": "Engineering-first culture, 'design a high-performance HTTP proxy', LC-hard DSA, deep networking fundamentals"
    },
    {
        "name": "Ericsson", "tier": "other", "active": True,
        "interviewStyle": "5G and networking infra, 'design a network congestion control algorithm', LC-medium, networking protocols (TCP/IP)"
    },
    {
        "name": "MediaMint", "tier": "other", "active": True,
        "interviewStyle": "Ad-operations and digital marketing tech, 'design a real-time ad performance tracking system', LC-easy, data management"
    },

    # ── Telecom / Infra ───────────────────────────────────────────────────────
    {
        "name": "Jio Platforms", "tier": "other", "active": True,
        "interviewStyle": "5G core network slicing, 'design a subscriber location registrar', LC-medium, telecom signaling (Diameter/HTTP2)"
    },
    {
        "name": "Cisco", "tier": "other", "active": True,
        "interviewStyle": "Routing protocol simulation, 'design a BGP route reflector', LC-medium, TCP state machine questions"
    },
    {
        "name": "Nokia", "tier": "other", "active": True,
        "interviewStyle": "OSS/BSS integration, 'design a network alarm correlation engine', LC-medium, SNMP knowledge"
    },
    {
        "name": "Ericsson", "tier": "other", "active": True,
        "interviewStyle": "RAN optimization, 'design a handover decision algorithm at 500 km/h', LC-medium, 3GPP spec awareness"
    },
    {
        "name": "Airtel", "tier": "other", "active": True,
        "interviewStyle": "Digital transformation: 'design a prepaid recharge stack with 50M users', LC-medium, partner API integration"
    },

    # ── SaaS & Cloud ─────────────────────────────────────────────────────────
    {
        "name": "CleverTap", "tier": "other", "active": True,
        "interviewStyle": "User engagement: 'design a push notification throttler at 1M/sec', LC-medium, segmentation engine"
    },
    {
        "name": "Chargebee", "tier": "other", "active": True,
        "interviewStyle": "Subscription billing: 'design a proration calculation engine with 200+ plans', LC-medium, idempotent invoicing"
    },
    {
        "name": "Wingify", "tier": "other", "active": True,
        "interviewStyle": "A/B testing platform, 'design a feature flag service with 0.1% latency', LC-medium, statistical significance"
    },
    {
        "name": "Whatfix", "tier": "other", "active": True,
        "interviewStyle": "Digital adoption platform, 'design an in-app widget position resolver', LC-medium, DOM traversal puzzles"
    },

    # ── Automotive Tech ───────────────────────────────────────────────────────
    {
        "name": "Bosch Global Software", "tier": "hardware", "active": True,
        "interviewStyle": "ESP algorithm, 'design a brake pressure estimator', LC-medium, ISO 26262 functional safety"
    },
    {
        "name": "Mercedes-Benz R&D India", "tier": "hardware", "active": True,
        "interviewStyle": "MBUX infotainment, 'design a voice command parser with slot filling', LC-medium, HMI design"
    },

    # ── HealthTech ────────────────────────────────────────────────────────────
    {
        "name": "Practo", "tier": "other", "active": True,
        "interviewStyle": "Video consultation reliability, 'design a doctor slot booking race condition resolver', LC-medium, HIPAA basics"
    },
    {
        "name": "PharmEasy", "tier": "other", "active": True,
        "interviewStyle": "Medicine delivery SLA, 'design a prescription expiry checker', LC-medium, regulatory compliance"
    },

    # ── EdTech ────────────────────────────────────────────────────────────────
    {
        "name": "upGrad", "tier": "other", "active": True,
        "interviewStyle": "Assessment platform, 'design a proctoring event collector', LC-medium, anti-cheating heuristics"
    },
    {
        "name": "Vedantu", "tier": "other", "active": True,
        "interviewStyle": "Live class whiteboard sync (WebRTC), 'design a hand raise queue manager', LC-medium, realtime signaling"
    },

    # ── Gaming ────────────────────────────────────────────────────────────────
    {
        "name": "MPL (Mobile Premier League)", "tier": "gaming", "active": True,
        "interviewStyle": "Game server tick rate, 'design a matchmaking ELO balancer', LC-medium, websocket game sync"
    },
    {
        "name": "Nazara Technologies", "tier": "gaming", "active": True,
        "interviewStyle": "Esports tournament bracket generator, 'design a fairness verifier for random draws', LC-medium"
    },

    # ── Proptech ─────────────────────────────────────────────────────────────
    {
        "name": "NoBroker", "tier": "other", "active": True,
        "interviewStyle": "Rental property search with polygon filters, 'design a mutual match notification system', LC-medium, geo-spatial index"
    },
    {
        "name": "Magicbricks", "tier": "other", "active": True,
        "interviewStyle": "Property valuation model backend, 'design a search with price range slider at 100ms', LC-medium, faceted search"
    },

    # ── Blockchain ────────────────────────────────────────────────────────────
    {
        "name": "Polygon", "tier": "other", "active": True,
        "interviewStyle": "zk-rollup transaction batching, 'design a mempool with gas auction', LC-hard, EIP-1559 understanding"
    },
    {
        "name": "CoinDCX", "tier": "other", "active": True,
        "interviewStyle": "DEX aggregation, 'design an order book for crypto options', LC-medium/hard, WebSocket API design"
    },
]


# ─── locations.py ────────────────────────────────────────────────────────────


TARGET_LOCATIONS = [
    # ── United States ─────────────────────────────────────────────
    "San Francisco, USA",
    "New York, USA",
    "Seattle, USA",
    "Austin, USA",
    "Boston, USA",
    "Chicago, USA",
    "Los Angeles, USA",
    "San Diego, USA",
    # ── Canada ───────────────────────────────────────────────────
    "Toronto, Canada",
    "Vancouver, Canada",

    # ── United Kingdom ───────────────────────────────────────────
    "London, UK",
    "Manchester, UK",
    "Edinburgh, UK",

    # ── Germany ──────────────────────────────────────────────────
    "Berlin, Germany",
    "Munich, Germany",
    "Hamburg, Germany",
    "Frankfurt, Germany",

    # ── France ───────────────────────────────────────────────────
    "Paris, France",
    # ── Netherlands ──────────────────────────────────────────────
    "Amsterdam, Netherlands",
    "Rotterdam, Netherlands",

    # ── Ireland ──────────────────────────────────────────────────
    "Dublin, Ireland",

    # ── Switzerland ──────────────────────────────────────────────
    "Zurich, Switzerland",
    "Geneva, Switzerland",

    # ── Sweden ───────────────────────────────────────────────────
    "Stockholm, Sweden",


    # ── UAE / Middle East ────────────────────────────────────────
    "Dubai, UAE",
    "Abu Dhabi, UAE",
    "Riyadh, Saudi Arabia",
    "Doha, Qatar",

    # ── Singapore / Southeast Asia ───────────────────────────────
    "Singapore",
    "Kuala Lumpur, Malaysia",
    "Bangkok, Thailand",
    "Jakarta, Indonesia",
    "Ho Chi Minh City, Vietnam",

    # ── India ────────────────────────────────────────────────────
    "Bangalore, India",
    "Hyderabad, India",
    "Pune, India",
    "Chennai, India",
    "Mumbai, India",
    "Delhi NCR, India",
    "Kolkata, India",
    "Ahmedabad, India",
    "Noida, India",
    "Gurgaon, India",
    "Bhubaneswar, India",

    # ── Japan ────────────────────────────────────────────────────
    "Tokyo, Japan",
    "Osaka, Japan",

    # ── South Korea ──────────────────────────────────────────────
    "Seoul, South Korea",

    # ── China ────────────────────────────────────────────────────
    "Beijing, China",
    "Shanghai, China",
    "Shenzhen, China",

    # ── Australia / New Zealand ──────────────────────────────────
    "Sydney, Australia",
    "Melbourne, Australia",
    "Brisbane, Australia",
    "Perth, Australia",
    "Auckland, New Zealand",

    # ── Africa ───────────────────────────────────────────────────
    "Cape Town, South Africa",

    # ── South America ────────────────────────────────────────────
    "Sao Paulo, Brazil",
    "Buenos Aires, Argentina",
    "Santiago, Chile",

    # ── Remote ───────────────────────────────────────────────────
    "Remote",
    "Worldwide Remote"
]




LEETCODE_BHANDARA = {
    "EASY": [
        { "title": "Two Sum", "id": "#1", "description": "Find two numbers in array that add up to target.", "concepts": ["Hash Map", "Array"], "optimizations": ["O(n) time with Hash Map"] },
        { "title": "Valid Parentheses", "id": "#20", "description": "Check if brackets (), {}, [] are closed correctly.", "concepts": ["Stack"], "optimizations": ["O(n) time and space"] },
        { "title": "Best Time to Buy/Sell Stock", "id": "#121", "description": "Max profit from one buy and one sell.", "concepts": ["Greedy", "One-pass"], "optimizations": ["O(n) time, O(1) space"] },
        { "title": "Merge Two Sorted Lists", "id": "#21", "description": "Merge two sorted LL into one.", "concepts": ["Linked List", "Dummy Node"], "optimizations": ["O(n) iterative"] },
        { "title": "Reverse Linked List", "id": "#206", "description": "Reverse a singly linked list.", "concepts": ["Linked List", "Pointers"], "optimizations": ["O(n) time, O(1) space"] },
        { "title": "Contains Duplicate", "id": "#217", "description": "Check if any value appears twice.", "concepts": ["Hash Set", "Array"], "optimizations": ["O(n) time and space"] },
        { "title": "Valid Anagram", "id": "#242", "description": "Check if two strings are anagrams.", "concepts": ["Frequency Map", "String"], "optimizations": ["O(n) time, O(1) extra space (26 chars)"] },
        { "title": "Maximum Subarray", "id": "#53", "description": "Find contiguous subarray with largest sum.", "concepts": ["Kadane's Algorithm"], "optimizations": ["O(n) time, O(1) space"] },
        { "title": "Climbing Stairs", "id": "#70", "description": "Ways to reach n steps (1 or 2 steps at a time).", "concepts": ["DP", "Fibonacci"], "optimizations": ["O(n) time, O(1) space"] },
        { "title": "Palindrome Linked List", "id": "#234", "description": "Check if a LL is a palindrome.", "concepts": ["Fast/Slow Pointers", "LL Reversal"], "optimizations": ["O(n) time, O(1) space"] },
        { "title": "Remove Duplicates from Sorted Array", "id": "#26", "description": "In-place removal of duplicates.", "concepts": ["Two Pointers"], "optimizations": ["O(n) time, O(1) space"] },
        { "title": "Intersection of Two Arrays II", "id": "#350", "description": "Find common elements with frequency.", "concepts": ["Hash Map", "Two Pointers"], "optimizations": ["O(n+m) time"] },
        { "title": "Min Stack", "id": "#155", "description": "Stack with min value in O(1).", "concepts": ["Stack", "Auxiliary DS"], "optimizations": ["O(1) for all ops"] },
        { "title": "Binary Tree Inorder Traversal", "id": "#94", "description": "Return inorder traversal of binary tree.", "concepts": ["Tree", "Iterative/Recursive"], "optimizations": ["O(n) time and space"] },
        { "title": "Happy Number", "id": "#202", "description": "Sum of squares of digits leads to 1?", "concepts": ["Cycle Detection", "Floyd"], "optimizations": ["O(log n) time, O(1) space"] }
    ],
    "MEDIUM": [
        { "title": "3Sum", "id": "#15", "description": "Triplets that sum to zero.", "concepts": ["Sorting", "Two Pointers"], "optimizations": ["O(n^2) time"] },
        { "title": "Longest Substring Without Repeating Chars", "id": "#3", "description": "Length of longest distinct substring.", "concepts": ["Sliding Window", "Hash Map"], "optimizations": ["O(n) time"] },
        { "title": "Container With Most Water", "id": "#11", "description": "Max water trapped by two lines.", "concepts": ["Two Pointers", "Greedy"], "optimizations": ["O(n) time, O(1) space"] },
        { "title": "Number of Islands", "id": "#200", "description": "Count connected components in grid.", "concepts": ["DFS", "BFS", "Graph"], "optimizations": ["O(m*n) time and space"] },
        { "title": "Group Anagrams", "id": "#49", "description": "Group strings that are anagrams.", "concepts": ["Hash Map", "String Sorting"], "optimizations": ["O(N*K log K) time"] },
        { "title": "Course Schedule", "id": "#207", "description": "Check if dependency cycle exists.", "concepts": ["Topological Sort", "Cycle Detection"], "optimizations": ["O(V+E) time"] },
        { "title": "Subsets", "id": "#78", "description": "Generate all power set elements.", "concepts": ["Backtracking"], "optimizations": ["O(n * 2^n) time"] },
        { "title": "Permutations", "id": "#46", "description": "Generate all possible orderings.", "concepts": ["Backtracking"], "optimizations": ["O(n * n!) time"] },
        { "title": "Letter Combinations of Phone Number", "id": "#17", "description": "Generate combinations from digits.", "concepts": ["Backtracking", "Map"], "optimizations": ["O(3^n * 4^m) time"] },
        { "title": "Validate BST", "id": "#98", "description": "Check if a tree is a valid BST.", "concepts": ["Tree", "In-order", "Bounds"], "optimizations": ["O(n) time and space"] },
        { "title": "Lowest Common Ancestor (BST)", "id": "#235", "description": "Find LCA using BST properties.", "concepts": ["BST Property"], "optimizations": ["O(h) time, O(1) space"] },
        { "title": "Word Search", "id": "#79", "description": "Find if word exists in grid.", "concepts": ["DFS", "Backtracking"], "optimizations": ["O(N * 3^L) time"] },
        { "title": "Implement Trie (Prefix Tree)", "id": "#208", "description": "Design a prefix tree.", "concepts": ["Trie", "DS Design"], "optimizations": ["O(L) for all ops"] },
        { "title": "Find Median from Data Stream", "id": "#295", "description": "Dynamic median tracking.", "concepts": ["Two Heaps"], "optimizations": ["O(log n) add, O(1) find"] },
        { "title": "Rotate Image", "id": "#48", "description": "Rotate n x n matrix by 90 deg.", "concepts": ["Matrix", "In-place"], "optimizations": ["O(n^2) time, O(1) space"] },
        { "title": "Spiral Matrix", "id": "#54", "description": "Traverse matrix in spiral order.", "concepts": ["Matrix", "Boundary Traversal"], "optimizations": ["O(m*n) time"] },
        { "title": "Jump Game", "id": "#55", "description": "Check if last index is reachable.", "concepts": ["Greedy", "DP"], "optimizations": ["O(n) greedy approach"] },
        { "title": "Longest Consecutive Sequence", "id": "#128", "description": "Longest unsorted sequence of consecutive ints.", "concepts": ["Hash Set", "O(n)"], "optimizations": ["O(n) time and space"] },
        { "title": "Product of Array Except Self", "id": "#238", "description": "Return array of products minus index.", "concepts": ["Prefix/Suffix Products"], "optimizations": ["O(n) time, O(1) extra space"] },
        { "title": "Encode & Decode Strings", "id": "#271", "description": "Design algorithm to serialize list of strings.", "concepts": ["String Parsing", "Custom Delimiter"], "optimizations": ["O(n) time for both"] },
        { "title": "Copy List with Random Pointer", "id": "#138", "description": "Deep copy of LL with random links.", "concepts": ["Linked List", "Hash Map", "Interweaving"], "optimizations": ["O(n) time, O(1) extra space with interweaving"] },
        { "title": "Pacific Atlantic Water Flow", "id": "#417", "description": "Find cells that flow to both oceans.", "concepts": ["Multi-source BFS/DFS"], "optimizations": ["O(m*n) time and space"] },
        { "title": "Minimum Window Substring", "id": "#76", "description": "Smallest window in S containing all T chars.", "concepts": ["Sliding Window", "Char Count"], "optimizations": ["O(n) time"] },
        { "title": "Clone Graph", "id": "#133", "description": "Deep copy of connected graph.", "concepts": ["BFS", "DFS", "Hash Map"], "optimizations": ["O(V+E) time and space"] },
        { "title": "LRU Cache", "id": "#146", "description": "Design Least Recently Used cache.", "concepts": ["Doubly LL", "Hash Map"], "optimizations": ["O(1) for all ops"] }
    ],
    "HARD": [
        { "title": "Median of Two Sorted Arrays", "id": "#4", "description": "Median of merged sorted arrays in O(log(m+n)).", "concepts": ["Binary Search", "Divide & Conquer"], "optimizations": ["O(log(min(m,n)))"] },
        { "title": "Trapping Rain Water", "id": "#42", "description": "Amount of water trapped between bars.", "concepts": ["Two Pointers", "DP", "Stack"], "optimizations": ["O(n) time, O(1) space"] },
        { "title": "Merge k Sorted Lists", "id": "#23", "description": "Merge k sorted LL into one.", "concepts": ["Min-Heap", "Merge Sort"], "optimizations": ["O(N log k) time"] },
        { "title": "Word Ladder", "id": "#127", "description": "Shortest transformation length.", "concepts": ["BFS", "Graph Transformation"], "optimizations": ["Bidirectional BFS"] },
        { "title": "Sliding Window Maximum", "id": "#239", "description": "Max element in each sliding window.", "concepts": ["Monotonic Deque"], "optimizations": ["O(n) time and space"] },
        { "title": "Edit Distance", "id": "#72", "description": "Min ops to transform word1 to word2.", "concepts": ["2D DP"], "optimizations": ["O(m*n) time, O(n) space"] },
        { "title": "Regular Expression Matching", "id": "#10", "description": "Implement regex with . and *.", "concepts": ["DP", "Recursion"], "optimizations": ["O(m*n) time"] },
        { "title": "N-Queens", "id": "#51", "description": "Place n queens on n x n board.", "concepts": ["Backtracking", "Constraint Pruning"], "optimizations": ["O(n!) time"] },
        { "title": "Serialize & Deserialize Binary Tree", "id": "#297", "description": "Convert tree to string and back.", "concepts": ["Tree Traversal", "String Parsing"], "optimizations": ["O(n) time and space"] },
        { "title": "Maximum Profit in Job Scheduling", "id": "#1235", "description": "Max profit from non-overlapping jobs.", "concepts": ["DP", "Binary Search"], "optimizations": ["O(n log n) time"] }
    ]
}

ML_CASE_STUDIES = {
    "EASY": [
        {
            "title": "Imbalanced Classification in Credit Fraud",
            "id": "#ML-1",
            "description": "Design a baseline machine learning pipeline to detect fraudulent credit card transactions where the positive class represents only 0.1% of the dataset.",
            "concepts": ["Class Imbalance", "Evaluation Metrics", "Logistic Regression"],
            "optimizations": ["Precision-Recall AUC tracking instead of Accuracy", "SMOTE oversampling with stratified split", "Class weight adjustments in loss function"]
        },
        {
            "title": "Data Leakage via Feature Preprocessing",
            "id": "#ML-2",
            "description": "A team notices their customer churn model achieves 99% accuracy during cross-validation but performs poorly in production. Audit the preprocessing pipeline.",
            "concepts": ["Data Leakage", "Cross-Validation", "Feature Scaling"],
            "optimizations": ["Fit escalers/imputers strictly on training folds", "Incorporate pipeline steps inside cross-validation loops", "Remove time-future target indicators"]
        },
        {
            "title": "Evaluating an E-Commerce Recommender System",
            "id": "#ML-3",
            "description": "Select and implement appropriate metrics to measure the relevance and ranking quality of a newly launched collaborative filtering product recommendation widget.",
            "concepts": ["Ranking Metrics", "Collaborative Filtering", "Validation Strategies"],
            "optimizations": ["Compute NDCG@K and MAP@K to track rank positioning", "Establish hit-rate baselines for user sessions", "Track catalog coverage to minimize item popular bias"]
        },
        {
            "title": "Overfitting Mitigation in Tabular Models",
            "id": "#ML-4",
            "description": "An XGBoost model trained on internal user demographic data performs exceptionally well on training data but generalizes poorly to newer geographic cohorts.",
            "concepts": ["Regularization", "Gradient Boosting", "Generalization"],
            "optimizations": ["Tune early stopping rounds based on validation loss", "Lower max_depth and adjust subsample/colsample_bytree ratios", "Add L1/L2 regularization via alpha and lambda parameters"]
        },
        {
            "title": "Text Classification Feature Engineering",
            "id": "#ML-5",
            "description": "Build a simple, compute-efficient spam classification model for short SMS text entries without using resource-heavy deep learning transformers.",
            "concepts": ["TF-IDF Matrix", "Naive Bayes", "Text Normalization"],
            "optimizations": ["Apply sublinear TF scaling to damp extreme token counts", "Use alphanumeric regex filtering and lemmatization", "Implement bi-gram parsing to catch sequential phrase cues"]
        },
        {
            "title": "Linear Regression Assumption Auditing",
            "id": "#ML-6",
            "description": "A marketing mix model built using ordinary least squares (OLS) yields unstable feature coefficients that change drastically when minor data rows are updated.",
            "concepts": ["Multicollinearity", "Variance Inflation Factor (VIF)", "Residual Analysis"],
            "optimizations": ["Drop highly correlated features with VIF scores greater than 5", "Switch to Ridge or Lasso regression to stabilize parameters", "Log-transform highly skewed independent spending metrics"]
        },
        {
            "title": "Baseline Missing Value Imputation",
            "id": "#ML-7",
            "description": "Handle a healthcare dataset where crucial metrics like blood pressure and BMI contain up to 25% missing records before training a tree-based model.",
            "concepts": ["Imputation Strategies", "Missing Data Mechanisms", "Data Distributions"],
            "optimizations": ["Utilize median imputation grouped by age/gender cohorts", "Add binary missingness indicator columns to preserve signal", "Leverage LightGBM's native missing value handling pattern"]
        },
        {
            "title": "Image Augmentation for Small Datasets",
            "id": "#ML-8",
            "description": "A manufacturing quality inspection team has only 500 images of defective parts. Propose an image data strategy to train a basic ResNet classifier.",
            "concepts": ["Data Augmentation", "Computer Vision Baseline", "Transfer Learning"],
            "optimizations": ["Apply deterministic geometric rotations and horizontal flips", "Utilize ImageNet pre-trained weights for feature extraction", "Implement mixup or CutMix data transformations"]
        },
        {
            "title": "K-Means Customer Segmentation Setup",
            "id": "#ML-9",
            "description": "Group millions of retail customers into distinct purchasing profiles using behavioral metrics like recency, frequency, and monetary value.",
            "concepts": ["Unsupervised Clustering", "Distance Metrics", "Feature Standardization"],
            "optimizations": ["Apply StandardScaler to unify unit variances across metrics", "Use the Elbow Method paired with Silhouette analysis", "Incorporate mini-batch K-Means to speed up computation times"]
        },
        {
            "title": "Evaluating CTR Prediction Models",
            "id": "#ML-10",
            "description": "An ad tech team needs to evaluate a click-through rate (CTR) prediction model on an ongoing stream of streaming real-time ad impression events.",
            "concepts": ["Binary Cross-Entropy", "Log Loss", "Online Evaluation"],
            "optimizations": ["Track continuous Log Loss to capture probability calibration", "Utilize progressive validation windows on streaming flows", "Incorporate normalized entropy metrics to compare model baselines"]
        }
    ],
    "MEDIUM": [
        {
            "title": "Detecting and Remedying Concept Drift",
            "id": "#ML-11",
            "description": "A loan approval model's performance slowly degrades over 6 months due to shifting macroeconomic conditions. Design a drift detection and adaptation pipeline.",
            "concepts": ["Concept Drift", "Statistical Testing", "Retraining Strategies"],
            "optimizations": ["Implement Kolmogorov-Smirnov tests on feature prediction outputs", "Deploy a shadow model pipeline to compare production pipelines", "Establish automated sample-weighted retraining windows"]
        },
        {
            "title": "Optimizing RAG Retrieval Accuracy",
            "id": "#ML-12",
            "description": "A corporate legal document Retrieval-Augmented Generation (RAG) system frequently pulls irrelevant context blocks, leading to hallucinated LLM responses.",
            "concepts": ["Vector Embeddings", "Chunking Strategies", "Re-ranking Models"],
            "optimizations": ["Implement parent-child element chunking with semantic overlap", "Deploy a Cross-Encoder re-ranker stage post vector retrieval", "Utilize hybrid search combining dense embeddings with BM25"]
        },
        {
            "title": "Object Detection for High-Speed Manufacturing",
            "id": "#ML-13",
            "description": "Design an object detection system to identify microscopic surface cracks on a high-speed assembly line conveyor belt running at 60 frames per second.",
            "concepts": ["YOLO Architecture", "Edge Deployment", "Inference Speed"],
            "optimizations": ["Quantize the model from FP32 to INT8 precision", "Compile the network graph via NVIDIA TensorRT engine engines", "Implement frame skipping or localized region-of-interest cropping"]
        },
        {
            "title": "Parameter-Efficient Fine-Tuning (PEFT) of LLMs",
            "id": "#ML-14",
            "description": "Fine-tune a 70B parameter open-source large language model for specialized internal medical record summarization using restricted consumer GPU infrastructure.",
            "concepts": ["LoRA / QLoRA", "Memory Management", "Quantization"],
            "optimizations": ["Implement 4-bit NormalFloat (NF4) quantization baseline", "Apply adapter rank tuning to specific target projection matrices", "Leverage gradient checkpointing to reduce peak VRAM use"]
        },
        {
            "title": "Time-Series Forecasting with Seasonality",
            "id": "#ML-15",
            "description": "Predict daily resource demands for a national ride-sharing fleet featuring prominent weekly seasonal spikes and sharp holiday drop-offs.",
            "concepts": ["Temporal Cross-Validation", "Prophet / DeepAR", "Exogenous Variables"],
            "optimizations": ["Enforce strict time-series rolling window validation splits", "Incorporate localized holiday calendar matrices as features", "Apply Fourier terms to capture high-frequency seasonal periods"]
        },
        {
            "title": "Feature Store Architecture for Real-Time Models",
            "id": "#ML-16",
            "description": "Design a system that serves real-time click historical features to a fraud model with sub-20ms latency while keeping historical records intact for batch training.",
            "concepts": ["Feature Stores", "Lambda/Kappa Data Paths", "Latency Profiling"],
            "optimizations": ["Deploy Redis as an ultra-fast online feature layer registry", "Utilize Feast to unify feature definitions across tracks", "Stream real-time telemetry inputs via Apache Kafka directly"]
        },
        {
            "title": "Sentiment Analysis under Low-Label Constraints",
            "id": "#ML-17",
            "description": "Build a sentiment classifier for customer product reviews in a niche domain where only 200 explicitly labeled examples are accessible.",
            "concepts": ["Few-Shot Learning", "Contrastive Learning", "Data Distillation"],
            "optimizations": ["Leverage SetFit frameworks to optimize sentence embedding spaces", "Generate synthetic training variants via LLM prompting styles", "Incorporate zero-shot predictions as auxiliary proxy inputs"]
        },
        {
            "title": "Model Compression for Mobile Devices",
            "id": "#ML-18",
            "description": "Deploy an audio keyword-spotting neural network directly onto consumer mobile handsets without severely draining battery life or storage arrays.",
            "concepts": ["Knowledge Distillation", "Model Pruning", "MobileNet"],
            "optimizations": ["Train a small student network using soft teacher probabilities", "Apply structured structured channel pruning to weight arrays", "Convert parameters to specialized CoreML / TensorFlow Lite runtimes"]
        },
        {
            "title": "Diagnosing Multi-Modal Alignment Flaws",
            "id": "#ML-19",
            "description": "A cross-modal text-to-image search engine yields low-quality results because text descriptors fail to align with conceptual image variations.",
            "concepts": ["CLIP Architecture", "Contrastive Losses", "Embedding Spaces"],
            "optimizations": ["Fine-tune projection heads using custom paired product catalogs", "Incorporate hard-negative mining strategies during model loops", "Apply temperature parameter tuning inside cross-entropy objectives"]
        },
        {
            "title": "Data Pipeline Scalability for Tera-Scale Inputs",
            "id": "#ML-20",
            "description": "An image classification preprocessing job crashes repeatedly with Out-Of-Memory errors while attempting to read a 5 Terabyte dataset.",
            "concepts": ["Apache Spark", "TFRecord / WebDataset", "Streaming Data Ingestion"],
            "optimizations": ["Shard raw assets into sequential tar-ball WebDataset formats", "Utilize lazy loading iterator primitives inside batch loops", "Distribute feature transformations across horizontal Spark nodes"]
        }
    ],
    "HARD": [
        {
            "title": "Distributed Multi-GPU Training of a 15B Transformer",
            "id": "#ML-21",
            "description": "Configure an infrastructure pipeline to train a custom 15-Billion parameter language model from scratch across 64 interconnected A100 GPU nodes without running out of device memory.",
            "concepts": ["Megatron-LM / DeepSpeed", "ZeRO Sharding Stages", "Interconnect Topology"],
            "optimizations": ["Enable ZeRO-Stage 3 to partition weights, gradients, and states", "Combine tensor parallelism with pipeline parallelism layouts", "Leverage FlashAttention-3 to mitigate quadratic sequence overhead"]
        },
        {
            "title": "Real-Time Graph Neural Network for Anti-Money Laundering",
            "id": "#ML-22",
            "description": "Design an online transaction scanning platform that detects complex money-laundering rings passing funds through millions of cyclic accounts with sub-50ms latency boundaries.",
            "concepts": ["Graph Neural Networks (GNN)", "Dynamic Graph Sampling", "Low-Latency Inference"],
            "optimizations": ["Implement a dynamic localized subgraph neighborhood sampler (GraphSAGE)", "Deploy a specialized graph engine like Neo4j or Memgraph with Redis caching", "Quantize GNN execution paths into custom C++ runtime layers"]
        },
        {
            "title": "Ultra-Low Latency LLM Serving via Speculative Decoding",
            "id": "#ML-23",
            "description": "A conversational AI platform experiences unsustainable latency metrics when running a 405B parameter LLM for real-time customer customer interactions. Maximize token generation throughput.",
            "concepts": ["Speculative Decoding", "KV Caching Profiles", "Continuous Batching"],
            "optimizations": ["Deploy a small 8B draft model to verify tokens in parallel drafts", "Implement vLLM page-backed KV memory layout architectures", "Incorporate FP8 tensor core calculation precision paths"]
        },
        {
            "title": "Continual Reinforcement Learning for Autonomous Fleets",
            "id": "#ML-24",
            "description": "Design a reinforcement learning setup for delivery drones navigating dynamically changing urban centers, ensuring models learn continually without suffering catastrophic forgetting.",
            "concepts": ["Catastrophic Forgetting", "PPO / Soft Actor-Critic", "Experience Replay"],
            "optimizations": ["Implement Elastic Weight Consolidation (EWC) to protect critical pathways", "Deploy a dual-network setup using functional generative replay matrices", "Incorporate progressive neural network layers for expanding tasks"]
        },
        {
            "title": "Privacy-Preserving Federated Learning Architecture",
            "id": "#ML-25",
            "description": "A healthcare consortium needs to train a diagnostic model across 50 competing hospitals without any institution moving sensitive patient data outside their local firewalls.",
            "concepts": ["Federated Learning", "Differential Privacy", "Secure Aggregation"],
            "optimizations": ["Utilize Federated Averaging (FedAvg) protocols with secure multi-party compute", "Inject calibrated Gaussian noise to enforce strict epsilon differential boundaries", "Apply homomorphic encryption vectors to global weight updates"]
        },
        {
            "title": "High-Throughput Vision-Language Model Pipeline",
            "id": "#ML-26",
            "description": "Design an automated automated platform to moderate, index, and tag 50,000 incoming user video streams simultaneously using a multi-modal Vision-Language Model.",
            "concepts": ["Multi-Modal Embedding", "Video Frame Sharding", "Triton Model Server"],
            "optimizations": ["Deploy dynamic frame sampling triggered by optical flow changes", "Configure Triton Model Server with dynamic request batching arrays", "Enforce decoupled execution loops for visual and textual networks"]
        },
        {
            "title": "Adversarial Robustness in Autonomous Perception",
            "id": "#ML-27",
            "description": "An autonomous driving perception module fails when malicious actors place specific pixel stickers on traffic signs, tricking the model into misclassifying a stop sign as a speed limit sign.",
            "concepts": ["Adversarial Attacks", "Robustness Training", "Defensive Distillation"],
            "optimizations": ["Incorporate Projected Gradient Descent (PGD) perturbations in training", "Apply random input transformations (blur/quantization) during inference", "Enforce multi-task voting heads across semantic branches"]
        },
        {
            "title": "Optimizing Custom Training Loss for Sparse CTR Data",
            "id": "#ML-28",
            "description": "An ad platform needs to train a recommendation model on data where the click signal is highly sparse and standard log-loss formulations fail to separate subtle conversion probabilities.",
            "concepts": ["Focal Loss Modification", "Deep & Cross Networks", "Embedding Sparsity"],
            "optimizations": ["Implement an adaptive Focal Loss formulation to emphasize hard examples", "Apply down-pour asynchronous gradient updates across parameter servers", "Utilize hash-collision mitigation arrays for dynamic feature allocation"]
        },
        {
            "title": "Self-Supervised Pretraining for Proprietary Imagery",
            "id": "#ML-29",
            "description": "A satellite intelligence group possesses 100 million unlabeled high-resolution global images. Design an optimal framework to build a robust foundation backbone asset.",
            "concepts": ["Masked Autoencoders (MAE)", "Contrastive Learning (MoCo)", "Distributed Vision Engines"],
            "optimizations": ["Implement a patch-masking autoencoder pipeline targeting an 80% drop rate", "Leverage large-scale asymmetric vision transformers (ViT-Huge)", "Employ mixed-precision scaling matrices within distributed clusters"]
        },
        {
            "title": "LLM Alignment via Direct Preference Optimization (DPO)",
            "id": "#ML-30",
            "description": "Align a base LLM to resist jailbreaking attempts and maintain safety guidelines without causing performance degradation on standard reasoning benchmarks.",
            "concepts": ["DPO Framework", "Kullback-Leibler (KL) Divergence", "Reference Models"],
            "optimizations": ["Utilize paired preference data with implicit token-level reward weights", "Enforce strict KL-divergence constraint limits against a frozen reference model", "Implement multi-stage evaluation configurations for safe responses"]
        }
    ]
}

INFRA_SCENARIOS = {
    "EASY": [
        {
            "title": "Kubernetes Pod CrashLoopBackOff Resolution",
            "id": "#INF-1",
            "description": "A standard microservice fails to boot up in staging, reporting a continuous 'CrashLoopBackOff' status flag. Troubleshoot the root operational cause.",
            "concepts": ["Pod Lifecycle", "Container Probes", "Log Analysis"],
            "optimizations": ["Inspect exit codes via kubectl describe container configurations", "Correct configuration typos inside environment variable injector keys", "Adjust liveness probe initial delay values to match app initialization"]
        },
        {
            "title": "Docker Image Layer Optimization",
            "id": "#INF-2",
            "description": "A simple Node.js container image takes up 1.5 Gigabytes of disk storage space, severely slowing down team continuous integration builds.",
            "concepts": ["Multi-stage Builds", "Base Images", "Layer Caching"],
            "optimizations": ["Switch to official lightweight Alpine or Distroless base images", "Consolidate RUN commands and leverage build-argument definitions", "Add a .dockerignore file to exclude local node_modules artifacts"]
        },
        {
            "title": "Terraform State Locking Conflicts",
            "id": "#INF-3",
            "description": "Two infrastructure engineers try to apply infrastructure modifications concurrently, triggering backend state file lock warnings.",
            "concepts": ["State Management", "Distributed Locks", "Backend Storage"],
            "optimizations": ["Configure a remote S3 state backend combined with DynamoDB locking", "Utilize distinct Terraform workspaces for separate testing tracks", "Enforce mandatory pipeline-driven executions to bypass local run collisions"]
        },
        {
            "title": "Nginx Reverse Proxy High Memory Consumption",
            "id": "#INF-4",
            "description": "An ingress proxy instance encounters performance drops and drops customer HTTP connections under moderate load spikes.",
            "concepts": ["Proxy Buffers", "Connection Timeouts", "Worker Configurations"],
            "optimizations": ["Adjust worker_connections and worker_processes to align with core counts", "Optimize client_body_buffer_size and proxy_buffers allocations", "Enable TCP keepalive configurations to recycle active sockets efficiently"]
        },
        {
            "title": "AWS IAM Least Privilege Rectification",
            "id": "#INF-5",
            "description": "An auditing scan flags a production application server instance that is running with full administrator cross-resource execution permissions.",
            "concepts": ["IAM Roles", "Least Privilege", "Instance Profiles"],
            "optimizations": ["Replace inline wildcard configurations with scoped ARN asset targets", "Bind short-lived AWS IAM roles via instance profile linkages", "Incorporate boundary condition validations inside specific automation keys"]
        },
        {
            "title": "Automating Central GitHub Actions Workflows",
            "id": "#INF-6",
            "description": "An engineering department needs to ensure that 50 independent application repositories execute identical linting and vulnerability checks.",
            "concepts": ["CI/CD Templates", "Reusable Workflows", "Central Governance"],
            "optimizations": ["Implement centralized GitHub Actions reusable workflow yml declarations", "Utilize secret inheritance features across child pipeline runners", "Enforce branch protection rules that require centralized check passes"]
        },
        {
            "title": "Resolving Disk Space Saturation from System Logs",
            "id": "#INF-7",
            "description": "An application server crashes unexpectedly over the weekend because the root partition reached 100% disk usage capacity.",
            "concepts": ["Log Rotation", "Disk Allocations", "Systemd Logind"],
            "optimizations": ["Deploy logrotate patterns configured with mandatory size limits", "Configure external storage partitions for system /var/log directories", "Restrict journald retention caps inside central system files"]
        },
        {
            "title": "Configuring Basic SSL/TLS via Let's Encrypt",
            "id": "#INF-8",
            "description": "Automate the provisioning, deployment, and ongoing validation renewal of SSL certificates for a growing consumer-facing web domain infrastructure.",
            "concepts": ["Certbot Integration", "ACME Protocols", "Automated Renewal"],
            "optimizations": ["Deploy automated Certbot renewal cron processes", "Incorporate DNS-01 validation challenges to support wildcard certificates", "Configure Nginx to auto-reload configuration files post certificate rotation"]
        },
        {
            "title": "Fixing High Ingress Drop Metrics via Security Groups",
            "id": "#INF-9",
            "description": "A newly deployed internal API microservice cannot receive internal incoming connection requests from an adjacent cluster subnet.",
            "concepts": ["Network Security Groups", "VPC Routing Rules", "Subnet Boundaries"],
            "optimizations": ["Explicitly allow ingress traffic from targeted security group IDs", "Verify stateful return paths on active security rules", "Trace network paths using Flow Logs to spot drop points"]
        },
        {
            "title": "Basic S3 Storage Cost Optimization",
            "id": "#INF-10",
            "description": "A platform team notices that their raw database backup storage costs on AWS S3 are increasing linearly month over month.",
            "concepts": ["Object Lifecycles", "Storage Classes", "Retention Policies"],
            "optimizations": ["Implement S3 Lifecycle rules to move logs to Glacier Deep Archive", "Enable object expiration tags for temporary staging artifacts", "Utilize S3 Intelligent-Tiering for unpredictable access profiles"]
        }
    ],
    "MEDIUM": [
        {
            "title": "Mitigating High-Volume Layer 7 DDoS Waves",
            "id": "#INF-11",
            "description": "A retail application experiences severe application downtime from a distributed botnet executing targeted HTTP POST request floods.",
            "concepts": ["Rate Limiting", "WAF Rules", "Edge Caching"],
            "optimizations": ["Deploy Cloudflare WAF JS challenge rules for suspected user patterns", "Enforce token bucket rate-limiting thresholds at the ingress gateway", "Configure aggressive caching rules for non-mutating edge responses"]
        },
        {
            "title": "Scaling Kubernetes Clusters Under Traffic Spikes",
            "id": "#INF-12",
            "description": "An entertainment portal's pods scale out too slowly during live events, causing regional connection drops before new nodes join.",
            "concepts": ["Cluster Autoscaler", "Horizontal Pod Autoscaler (HPA)", "Over-provisioning"],
            "optimizations": ["Configure placeholder Pause Pods with low priority for instant scaling capacity", "Switch HPA tracking metrics from CPU thresholds to custom Prometheus request rates", "Incorporate Karpenter for faster cloud node provisioning speeds"]
        },
        {
            "title": "Zero-Downtime PostgreSQL Major Version Upgrade",
            "id": "#INF-13",
            "description": "Upgrade a production core database from version 13 to 17 containing hundreds of gigabytes of transaction records with zero customer write service interruption.",
            "concepts": ["Logical Replication", "Database Migration", "Connection Pooling"],
            "optimizations": ["Establish a secondary cluster target via logical data stream replication", "Utilize PgBouncer to buffer connection traffic during cutover windows", "Execute precise DNS switches with low TTL configurations"]
        },
        {
            "title": "Centralized Prometheus Observability Scaling",
            "id": "#INF-14",
            "description": "A single Prometheus instance runs out of memory while attempting to ingest millions of metrics from diverse global Kubernetes clusters.",
            "concepts": ["Thanos Architecture", "Metric Cardinality", "Long-term Storage"],
            "optimizations": ["Deploy Thanos sidecars to offload metric blocks to object stores", "Enforce Prometheus dropping rules for high-cardinality label inputs", "Implement horizontal query splitters across global storage points"]
        },
        {
            "title": "Terraform Multi-Region Pipeline Execution Structure",
            "id": "#INF-15",
            "description": "Design an automated Terraform pipeline that provisions network infrastructures simultaneously across US, EU, and AP cloud regions safely.",
            "concepts": ["Provider Aliases", "Module Parameterization", "State Sharding"],
            "optimizations": ["Utilize explicit provider alias links for localized region contexts", "Implement Terragrunt dry-run configurations to minimize duplicate code blocks", "Decouple environment variables using structured dynamic configurations"]
        },
        {
            "title": "Designing a Multi-Tenant Ingress Gateway",
            "id": "#INF-16",
            "description": "Isolate multiple business units sharing a large internal Kubernetes cluster, ensuring distinct routing controls and domain boundaries.",
            "concepts": ["Ingress Classes", "NetworkPolicies", "Namespace Isolation"],
            "optimizations": ["Deploy isolated Ingress Controller controllers per tenant group", "Enforce default-deny NetworkPolicies across cluster namespaces", "Incorporate cert-manager to manage distinct tenant automated domains"]
        },
        {
            "title": "Migrating Legacy VMs into Dockerized Containers",
            "id": "#INF-17",
            "description": "Transition a monolithic enterprise application running on manual bare-metal machines into a containerized deployment layout.",
            "concepts": ["Application State Decoupling", "Volume Bindings", "Signal Handling"],
            "optimizations": ["Offload state variables to centralized Redis and S3 clusters", "Configure tini init entrypoints to handle system signals cleanly", "Utilize read-only root filesystems to enforce container immutability"]
        },
        {
            "title": "Optimizing Cross-Availability Zone Data Costs",
            "id": "#INF-18",
            "description": "A cloud financial review reveals unexpected data transfer charges driven by chatter between internal microservice applications.",
            "concepts": ["Cross-AZ Data Transfers", "Topology-Aware Routing", "Service Meshes"],
            "optimizations": ["Enable TopologyAwareHints inside native Kubernetes service mappings", "Configure Istio locality-prioritized routing configurations", "Consolidate chatty application dependencies inside identical zones"]
        },
        {
            "title": "Designing an Automated Backup and Restore Validation Engine",
            "id": "#INF-19",
            "description": "An organization wants to guarantee their database disaster recovery backups actually function by validating restorations programmatically.",
            "concepts": ["Disaster Recovery Strategy", "Automation Pipelines", "Isolated Testing Environments"],
            "optimizations": ["Schedule daily headless restore jobs inside sandboxed cloud networks", "Execute data sanity checks via automated SQL assert frameworks", "Export verification signals into central monitoring alerts"]
        },
        {
            "title": "Kafka Cluster Broker Performance Tuning",
            "id": "#INF-20",
            "description": "An Apache Kafka ingestion cluster exhibits high partition lag metrics under intense write-heavy message event flows.",
            "concepts": ["Partition Allocations", "Disk I/O Profiles", "JVM Garbage Collection"],
            "optimizations": ["Increase target topic partition counts to distribute consumer groups", "Switch disk storage configurations to low-latency NVMe arrays", "Tune G1GC garbage collection paths to eliminate broker freeze periods"]
        }
    ],
    "HARD": [
        {
            "title": "Active-Active Multi-Region Infrastructure Design",
            "id": "#INF-21",
            "description": "Design an infrastructure architecture that handles live user writes simultaneously in both the US-East and EU-West cloud centers while ensuring global low-latency consistency.",
            "concepts": ["Anycast Routing", "Multi-Region Multi-Master Database", "Global Traffic Management"],
            "optimizations": ["Deploy AWS Global Accelerator with latency-based Anycast configuration", "Utilize a distributed SQL engine like CockroachDB with locality flags", "Implement application-level transactional idempotency keys to handle race states"]
        },
        {
            "title": "Graceful Migration of Bare-Metal Core Network to AWS Direct Connect",
            "id": "#INF-22",
            "description": "Migrate a fintech core processing application from private on-premise hardware infrastructure to AWS with zero packet drops, maintaining strict low-latency requirements.",
            "concepts": ["BGP Route Leak Mitigation", "Direct Connect Failover", "VPC Transit Gateways"],
            "optimizations": ["Establish redundant DX connections across separate data center entries", "Configure BGP AS-Prepend adjustments for deterministic traffic paths", "Deploy backup IPSec VPN links to handle failover routing states"]
        },
        {
            "title": "Building a Ephemeral Multi-Tenant Serverless Sandbox Engine",
            "id": "#INF-23",
            "description": "Design a secure compute platform that executes untrusted user-submitted code snippets within 50 milliseconds, ensuring zero kernel breakout risk.",
            "concepts": ["MicroVM Architectures", "Firecracker / gVisor", "Resource Cgroups Control"],
            "optimizations": ["Utilize AWS Firecracker microVM snapshots for fast initial boot times", "Enforce strict seccomp system-call filter matrices per execution thread", "Implement network namespaces that completely block local loop tracking"]
        },
        {
            "title": "Remediating a Global DNS Cascading Outage Scenario",
            "id": "#INF-24",
            "description": "An infrastructure team rolls out an invalid central internal DNS configuration, causing a massive cascading crash loop across 10,000 global production nodes.",
            "concepts": ["DNS Exponential Backoff", "CoreDNS Cache Tuning", "Circuit Breaking"],
            "optimizations": ["Deploy local NodeLocal DNSCache instances to intercept lookup loops", "Implement aggressive negative-caching configurations to minimize upstream noise", "Configure application retry frameworks with jitter to prevent thundering herds"]
        },
        {
            "title": "Zero-Trust Infrastructure Network Isolation at Scale",
            "id": "#INF-25",
            "description": "Design a network mesh for a microservices footprint handling sensitive financial data, ensuring no network packet can be transmitted unauthenticated or unencrypted.",
            "concepts": ["mTLS Enforcement", "SPIFFE/SPIRE Identity", "eBPF Network Controls"],
            "optimizations": ["Leverage Cilium eBPF profiles for kernel-level network validation", "Deploy SPIRE runtime nodes to issue cryptographic identity vectors", "Enforce strict mTLS encryption with automated short-lived certificate lifecycles"]
        },
        {
            "title": "Automated Cloud Spend Anomaly Remediation Engine",
            "id": "#INF-26",
            "description": "Design an infrastructure tracking solution that detects and terminates rogue, runaway cloud workloads (e.g., unauthorized GPU mining) within 5 minutes of launch.",
            "concepts": ["FinOps Stream Automation", "Stream Processing Metrics", "Autoscaling Policies"],
            "optimizations": ["Ingest real-time cloud provider event trails into AWS Lambda engines", "Compare active run signatures against cost-baseline matrices", "Implement automated quarantine security controls on unvetted instances"]
        },
        {
            "title": "Orchestrating Bare-Metal Kubernetes over Edge Infrastructure",
            "id": "#INF-27",
            "description": "Design a control framework to deploy and operate localized Kubernetes instances across 5,000 distinct remote physical retail store installations with unreliable internet connectivity.",
            "concepts": ["K3s Architecture", "Autonomous Edge Operations", "GitOps at Scale"],
            "optimizations": ["Deploy K3s configurations with embedded SQLite database backends", "Configure ArgoCD in a pull-based operational pattern per node site", "Enable localized cluster fallback paths during long WAN isolation windows"]
        },
        {
            "title": "High-Throughput Log Aggregation Optimization (10TB+/Day)",
            "id": "#INF-28",
            "description": "A ride-sharing network's centralized logging architecture chokes and drops telemetry tracking rows during weekend evening usage peaks.",
            "concepts": ["Vector / FluentBit Routing", "Kafka Buffering Pools", "Elasticsearch Sharding Index"],
            "optimizations": ["Deploy Vector as a lightweight edge daemon routing to disk buffers", "Partition Kafka log ingest streams based on regional geohash indicators", "Implement dynamic index rollover states using ILM policies"]
        },
        {
            "title": "Recovering from a Complete Cloud Region Deletion Scenario",
            "id": "#INF-29",
            "description": "A catastrophic security breach leads to an attacker completely purging a company's primary cloud deployment account. Execute a full infrastructure recovery.",
            "concepts": ["Cross-Account Backups", "Air-Gapped Infrastructure", "Immutable IaC Enforcements"],
            "optimizations": ["Maintain air-gapped, read-only replica stores inside a separate account", "Enforce locked, version-controlled remote state tracking strategies", "Execute continuous automated infrastructure recovery drills using simulated accounts"]
        },
        {
            "title": "Optimizing Kernel Network Stack for Ultra-Low Latency Trading",
            "id": "#INF-30",
            "description": "Fine-tune standard Linux server environments to support direct high-frequency trading application workloads, minimizing microsecond packet delivery latencies.",
            "concepts": ["SR-IOV Network Cards", "Kernel Bypass (DPDK)", "CPU Core Pinning"],
            "optimizations": ["Implement Data Plane Development Kit (DPDK) to bypass the OS network stack", "Isolate application processing threads via taskset / isolcpus configurations", "Disable power management savings states (C-states) inside BIOS configurations"]
        }
    ]
}

SECURITY_SCENARIOS = {
    "EASY": [
        {
            "title": "Remediating SQL Injection in Legacy Forms",
            "id": "#SEC-1",
            "description": "A vulnerability report flags a classical raw string concatenation query pattern inside an internal legacy application search box.",
            "concepts": ["SQL Injection", "Parameterized Queries", "Input Validation"],
            "optimizations": ["Refactor raw queries to use prepared parameters exclusively", "Implement Object-Relational Mapping (ORM) query abstraction layers", "Apply strict white-list character filtering patterns across input controllers"]
        },
        {
            "title": "Securing Session Cookies against XSS",
            "id": "#SEC-2",
            "description": "An application audit reveals authentication tokens are vulnerable to theft via Cross-Site Scripting (XSS) due to insecure session configurations.",
            "concepts": ["XSS Vulnerabilities", "Cookie Flag Enforcements", "Session Hijacking"],
            "optimizations": ["Apply HttpOnly and Secure flags to sensitive cookies", "Enforce SameSite=Strict properties on transactional sessions", "Inject robust Content Security Policy (CSP) headers across frontend routes"]
        },
        {
            "title": "Mitigating Basic Cross-Site Request Forgery",
            "id": "#SEC-3",
            "description": "A bank transfer route lacks defensive checks, allowing malicious third-party external layouts to trigger transfers on behalf of authenticated users.",
            "concepts": ["CSRF Flaws", "Anti-CSRF Tokens", "State-Changing Actions"],
            "optimizations": ["Implement unique cryptographically secure anti-CSRF tokens per user session", "Enforce strict custom headers like X-Requested-With for API calls", "Transition authentication contexts to utilize short-lived Bearer tokens"]
        },
        {
            "title": "Fixing Broken Object Level Authorization (BOLA)",
            "id": "#SEC-4",
            "description": "Users find they can view alternative user profile tracking logs simply by incrementing the numerical ID parameter within the URL path.",
            "concepts": ["BOLA / IDOR", "Access Control Matrices", "UUID Implementation"],
            "optimizations": ["Enforce strict database-level checks matching current session contexts", "Replace incremental integer primary keys with random UUIDv4 structures", "Implement centralized authorization lookup middleware handlers"]
        },
        {
            "title": "Remediating Sensitive Data Exposure in Logs",
            "id": "#SEC-5",
            "description": "An internal audit discovers that cleartext user passwords and credit card numbers are being captured inside central logging clusters.",
            "concepts": ["Data PII Masking", "Logging Sanitization", "Compliance Standards"],
            "optimizations": ["Deploy regex-based string scrubbing masks inside application log layers", "Implement automated pre-commit hooks to flag cleartext field exposures", "Enforce strict RBAC access controls over debugging log destinations"]
        },
        {
            "title": "Configuring Secure SSH Daemon Access",
            "id": "#SEC-6",
            "description": "Secure a fleet of newly provisioned virtual cloud servers against automated internet brute-force password scanning attacks.",
            "concepts": ["SSH Hardening", "Public Key Authentication", "Brute-force Mitigation"],
            "optimizations": ["Disable password-based logins, allowing public-key access only", "Reconfigure default port parameters to atypical high-range targets", "Deploy Fail2ban daemon tracking routines to drop repetitive offender IPs"]
        },
        {
            "title": "Fixing Directory Traversal Vulnerability",
            "id": "#SEC-7",
            "description": "An unvetted file download route allows external downloaders to pass generic path characters to read systemic server files.",
            "concepts": ["Directory Traversal", "Path Sanitization", "File System Permissions"],
            "optimizations": ["Utilize path.basename validations to extract localized file strings", "Map access parameters against strict whitelisted target catalogs", "Execute the application worker process inside an isolated chroot jail"]
        },
        {
            "title": "Enforcing HTTPS via HSTS Configuration",
            "id": "#SEC-8",
            "description": "Ensure that user clients never communicate with web backend targets over unencrypted HTTP pathways, preventing downgrade attacks.",
            "concepts": ["HSTS Implementations", "Transport Layer Encryption", "Downgrade Mitigations"],
            "optimizations": ["Inject Strict-Transport-Security headers with long max-age durations", "Include the includeSubDomains and preload parameters in HSTS setups", "Deploy automatic permanent 301 redirection rules for all port 80 requests"]
        },
        {
            "title": "Remediating Insecure Third-Party Component Alerts",
            "id": "#SEC-9",
            "description": "An automated scanning engine flags a high-severity remote code execution vulnerability inside an application's open-source dependency library.",
            "concepts": ["Software Composition Analysis (SCA)", "Dependency Management", "Patch Management"],
            "optimizations": ["Execute automated snyk or npm audit remediation updates", "Pin explicit secure dependency versions within lock files", "Integrate automated vulnerability gates directly into testing pipelines"]
        },
        {
            "title": "Fixing Information Disclosure via HTTP Headers",
            "id": "#SEC-10",
            "description": "An external vulnerability scanner notes that server response headers disclose explicit underlying operating system and framework version details.",
            "concepts": ["Information Disclosure", "Header Obfuscation", "Attack Surface Reduction"],
            "optimizations": ["Disable the Server and X-Powered-By header tags in Nginx/Apache", "Configure custom error pages to prevent raw stack trace leaks", "Deploy an edge reverse proxy to standardize outgoing headers"]
        }
    ],
    "MEDIUM": [
        {
            "title": "Remediating Server-Side Request Forgery (SSRF) in Webhooks",
            "id": "#SEC-11",
            "description": "A company's custom webhook platform allows external premium users to input arbitrary URLs, which the internal server fetches directly, exposing internal network metadata links.",
            "concepts": ["SSRF Vectors", "Network Segmentation", "DNS Resolution Hooks"],
            "optimizations": ["Validate target URLs against internal private IP block blacklists", "Route webhook egress traffic through an isolated proxy architecture", "Implement custom DNS resolver layers to catch multi-destination race conditions"]
        },
        {
            "title": "Designing Secure OAuth2/OIDC Flow with PKCE",
            "id": "#SEC-12",
            "description": "Architect a secure authentication authorization link for a new native mobile application interacting with internal financial database resources.",
            "concepts": ["OAuth2 authorization_code Flow", "PKCE Extensions", "Token Storage Patterns"],
            "optimizations": ["Enforce mandatory Proof Key for Code Exchange (PKCE) code validations", "Store authorization vectors inside secure mobile keychain storage vaults", "Set short lifespan intervals for access tokens paired with rotation cycles"]
        },
        {
            "title": "STRIDE Threat Modeling for Cloud Wallets",
            "id": "#SEC-13",
            "description": "Perform a comprehensive STRIDE risk evaluation framework analysis for a microservice platform processing real-time user digital asset payments.",
            "concepts": ["STRIDE Framework", "Data Flow Documentation", "Security Countermeasures"],
            "optimizations": ["Implement cryptographic digital signatures on all ledger mutations", "Store all operational audit trails within immutable write-once logs", "Enforce request-level concurrency locks to prevent race condition abuse"]
        },
        {
            "title": "Remediating XML External Entity (XXE) Ingestion",
            "id": "#SEC-14",
            "description": "An enterprise B2B payload processing terminal is found vulnerable to XXE injections, allowing external attackers to extract server configuration keys.",
            "concepts": ["XXE Attack Vectors", "Parser Configuration Tuning", "Data Ingestion Formats"],
            "optimizations": ["Explicitly disable External Entity Resolution (DTD) flags in the XML parser", "Transition historical payload structures to modern JSON format specifications", "Isolate file parser run loops within restricted sandboxed user profiles"]
        },
        {
            "title": "Designing Centralized Secret Management Workflows",
            "id": "#INF-15",
            "description": "Eliminate the systemic risk of engineers inadvertently hardcoding database passwords and application API tokens into source repositories.",
            "concepts": ["Secret Vaulting Engines", "Dynamic Token Issuance", "Automated Rotation"],
            "optimizations": ["Deploy HashiCorp Vault integrated with IAM machine identity authentication", "Configure automated 30-day secret rotation structures with webhook notifications", "Inject secrets as ephemeral memory variables during application boot states"]
        },
        {
            "title": "Remediating Cross-Origin Resource Sharing (CORS) Misconfigurations",
            "id": "#SEC-16",
            "description": "An API engine features a broad Access-Control-Allow-Origin header set to reflect incoming origin strings, allowing malicious sites to scrape user dashboards.",
            "concepts": ["CORS Controls", "Browser Origin Isolation", "Exploitation Mechanics"],
            "optimizations": ["Replace dynamic origin reflection blocks with strict whitelisted domains", "Block the use of credentials (Access-Control-Allow-Credentials) alongside wildcards", "Segregate highly sensitive API actions into dedicated subdomains"]
        },
        {
            "title": "Implementing Secure API Rate Limiting Infrastructure",
            "id": "#SEC-17",
            "description": "An open authentication lookup path is abused by automated login credential-stuffing botnets, degrading server response metrics.",
            "concepts": ["Credential Stuffing", "Sliding-Window Rate Limits", "Device Fingerprinting"],
            "optimizations": ["Deploy Redis sliding-window counters grouped by IP and username blocks", "Incorporate CAPTCHA triggers for anomalous login sequences", "Enforce strict IP reputation score updates via Cloudflare edge lookups"]
        },
        {
            "title": "Hardening Container Runtime Environments",
            "id": "#SEC-18",
            "description": "Audit and harden a production Kubernetes container configuration where application pods run with root privileges and raw socket access.",
            "concepts": ["Pod Security Standards", "Linux Capabilities", "Namespace Isolation"],
            "optimizations": ["Inject strict securityContext rules requiring runAsNonRoot configuration", "Drop all default Linux capabilities except explicit required network flags", "Configure readOnlyRootFilesystem parameters with ephemeral emptyDir paths"]
        },
        {
            "title": "Designing Incident Containment Workflows for Compromised Hosts",
            "id": "#SEC-19",
            "description": "An internal alert indicates that a virtual app host is actively beaconing data out to a known malicious command-and-control IP server address.",
            "concepts": ["Incident Isolation", "Forensic Data Capture", "Egress Filtering Rules"],
            "optimizations": ["Automate the injection of an isolated isolation Security Group rule", "Trigger automated live memory dumps via security tools prior to termination", "Revoke compromised cloud credentials attached to the host profile immediately"]
        },
        {
            "title": "Securing Multi-Tenant Database Architecture",
            "id": "#SEC-20",
            "description": "Design an operational database structural logic that prevents data leaks between distinct enterprise clients sharing a single software instance.",
            "concepts": ["Row-Level Security (RLS)", "Logical Separation", "Query Interceptors"],
            "optimizations": ["Enable native PostgreSQL Row-Level Security parameters linked to session contexts", "Utilize distinct schema boundaries with localized connection pools", "Implement runtime query validation wrappers to enforce tenant filters"]
        }
    ],
    "HARD": [
        {
            "title": "Zero-Trust Service-to-Service Architecture Design",
            "id": "#SEC-21",
            "description": "Design an enterprise cloud microservices communication framework where network localization is assumed compromised, preventing all unauthorized lateral movement.",
            "concepts": ["Cryptographic Identity (SPIFFE)", "Hardware Security Modules (HSM)", "Ephemeral Token Validation"],
            "optimizations": ["Enforce end-to-end mTLS encryption using keys held in hardware modules", "Utilize transient JWT authorization claims evaluated at local sidecar nodes", "Deploy eBPF system tracing tools to block anomalous cross-process connections"]
        },
        {
            "title": "Remediating Subversion via BGP Hijacking and Certificate Forgery",
            "id": "#SEC-22",
            "description": "An online trading engine faces sophisticated state-sponsored actors routing traffic via BGP exploitation and attempting certificate generation hacks.",
            "concepts": ["BGP Route Validation (RPKI)", "CAA DNS Records", "Certificate Transparency Logs"],
            "optimizations": ["Configure strict RPKI route verification filtering across core networks", "Deploy DNS CAA records to restrict certificate issuance authorization keys", "Build real-time monitoring tools to scan Certificate Transparency logs for domain anomalies"]
        },
        {
            "title": "Designing a Cryptographically Secure Multi-Party Core Engine",
            "id": "#SEC-23",
            "description": "Architect a core settlement infrastructure framework where no single administrative employee can execute any asset movement transaction alone.",
            "concepts": ["Multi-Party Computation (MPC)", "Threshold Cryptography", "Audit Trail Immutability"],
            "optimizations": ["Deploy Shamir's Secret Sharing variations requiring M-of-N node validation signatures", "Utilize Trusted Execution Environments (TEEs) to process consensus operations", "Bind transactions to append-only Merkle tree database storage engines"]
        },
        {
            "title": "Mitigating Timing and Side-Channel Crypto Vulnerabilities",
            "id": "#SEC-24",
            "description": "A high-performance custom validation decryption pipeline exhibits subtle microsecond response discrepancies, exposing key values.",
            "concepts": ["Timing Side-Channels", "Constant-Time Implementations", "Memory Access Controls"],
            "optimizations": ["Refactor validation checks to run inside deterministic constant-time algorithms", "Inject synthetic random timing delay padding variables to confound tracking tools", "Implement memory blinding vectors over cryptographic extraction pathways"]
        },
        {
            "title": "Engineering Automated Binary Deobfuscation and Analysis Ingestion",
            "id": "#SEC-25",
            "description": "Design a malware ingestion sandbox engine that accepts untrusted, obfuscated desktop application binaries and determines internal API hook actions safely.",
            "concepts": ["Dynamic Binary Instrumentation", "Hypervisor Isolation", "YARA Rule Targeting"],
            "optimizations": ["Execute binary execution paths inside customized nested kernel environments", "Utilize Frida or Intel PIN architectures to hook internal memory modifications", "Deploy machine learning classification layers over extracted execution logs"]
        },
        {
            "title": "Remediating Blind SSFR via Advanced Out-of-Band Analysis",
            "id": "#SEC-26",
            "description": "A financial data processing cluster features an isolated internal document parser that resolves external image metadata links without return pathways.",
            "concepts": ["Out-of-Band Vectors", "Asynchronous Sanitization", "Egress Air-Gapping"],
            "optimizations": ["Enforce strict egress firewalls that route completely outside standard web protocols", "Incorporate decoupled offline conversion stages to parse assets within RAM storage", "Deploy internal DNS firewalls to sinkhole arbitrary external link evaluations"]
        },
        {
            "title": "Designing a Multi-Region Corporate PKI Infrastructure",
            "id": "#SEC-27",
            "description": "Architect an enterprise-wide public key infrastructure to issue, sign, and revoke millions of short-lived machine identification certificates daily.",
            "concepts": ["Root vs. Subordinate CAs", "OCSP Stapling Mechanics", "Hardware Key Protection"],
            "optimizations": ["Isolate the offline Root CA key configuration inside physical HSM vaults", "Deploy fast OCSP stapling frameworks to eliminate real-time revocation bottlenecks", "Automate intermediate certificate rotation routines using cloud-native connectors"]
        },
        {
            "title": "Securing CI/CD Pipeline Against Software Supply Chain Injection",
            "id": "#SEC-28",
            "description": "Design defensive controls to prevent an attacker from manipulating open-source package repositories to inject backdoor vectors into production software builds.",
            "concepts": ["SLSA Framework Controls", "Cryptographic Code Signing", "Reproducible Builds"],
            "optimizations": ["Enforce cosign cryptographic verification of all container layers", "Utilize isolated, single-use pipeline runners that lack network access", "Implement strict lock-file checksum validation gates across dependency configurations"]
        },
        {
            "title": "Remediating Kernel Privilege Escalation via Exploited System Calls",
            "id": "#SEC-29",
            "description": "A container escape incident occurs where an attacker leverages an unpatched local kernel vulnerability to gain root access over host machines.",
            "concepts": ["Kernel Privilege Exploits", "Seccomp Profile Filtering", "AppArmor / SELinux Hardening"],
            "optimizations": ["Deploy custom seccomp configurations to block non-essential system call routes", "Enforce strict AppArmor baseline definitions across container execution paths", "Implement automated container kernel patching cadences with minimal disruptions"]
        },
        {
            "title": "Designing Anonymized Data Leakage Prevention Architectures",
            "id": "#SEC-30",
            "description": "Design an automated data extraction platform that exports production records to external research groups while guaranteeing zero data re-identification capabilities.",
            "concepts": ["Differential Privacy", "K-Anonymity / L-Diversity", "Tokenization Architecture"],
            "optimizations": ["Inject dynamic mathematical noise configurations to enforce differential privacy boundaries", "Apply strict k-anonymity validation routines to data export pipelines", "Replace direct PII parameters with irreversible cryptographic hash values"]
        }
    ]
}

PRODUCT_CASES = {
    "EASY": [
        {
            "title": "Optimizing Sign-Up Onboarding Funnel Conversions",
            "id": "#PM-1",
            "description": "A popular B2B software app suffers a steep 45% drop-off rate on its 4-step user signup configuration panel. Redesign the user progression flow.",
            "concepts": ["Funnel Analysis", "User Friction", "Activation Metrics"],
            "optimizations": ["Implement single-click OAuth social authentication paths", "Transition long static entry pages into progressive profile configurations", "Incorporate live verification fields to prevent terminal validation breaks"]
        },
        {
            "title": "Formulating a Feature Prioritization Framework via RICE",
            "id": "#PM-2",
            "description": "A product team is divided over whether to build an internal user dark mode option or a high-demand CSV dashboard exporter module.",
            "concepts": ["RICE Matrix Model", "Opportunity Analysis", "Resource Allocation"],
            "optimizations": ["Normalize reach values using validated internal application telemetry metrics", "Calculate confidence metrics based on direct customer interview data", "Compare product impact value scores against concrete developer engineering effort estimates"]
        },
        {
            "title": "Diagnosing a Sudden Notification Engagement Drop",
            "id": "#PM-3",
            "description": "Following a major application release, the click-through rates on mobile push notification alerts plunge by 30% over 48 hours.",
            "concepts": ["Engagement Telemetry", "Cohort Categorization", "Feature Audits"],
            "optimizations": ["Segment metric drops across explicit handset OS version categories", "Audit notification delivery success metrics to isolate delivery failures", "Implement quick token permission checks inside application onboarding steps"]
        },
        {
            "title": "Designing a Feedback Loop for Customer Support Tickets",
            "id": "#PM-4",
            "description": "Translate a growing influx of unstructured customer service request tickets into actionable engineering development roadmaps.",
            "concepts": ["Feedback Aggregation", "Tagging Taxonomy", "Impact Matrix Mapping"],
            "optimizations": ["Deploy automated NLP classification taggers over incoming ticket queues", "Correlate product ticket recurrences against explicit user lifetime values", "Establish weekly cross-functional syncs to review systemic platform issues"]
        },
        {
            "title": "Setting and Tracking North Star Metrics for EdTech",
            "id": "#PM-5",
            "description": "Define and establish the primary North Star user value tracking metric for an online video learning application business platform.",
            "concepts": ["North Star Metrics", "Retention Leading Indicators", "User Value Realization"],
            "optimizations": ["Select 'Weekly Completed Learning Hours' over superficial login traffic metrics", "Verify the metric correlates with long-term 90-day retention performance", "Expose the target metric tracking across all internal analytics dashboards"]
        },
        {
            "title": "A/B Testing Setup for E-Commerce Checkout Buttons",
            "id": "#PM-6",
            "description": "Design an A/B experimentation loop to determine if modifying checkout call-to-action button color schemes increases transaction counts.",
            "concepts": ["Statistical Significance", "Sample Size Calculation", "Minimum Detectable Effect"],
            "optimizations": ["Utilize automated experimentation tools to ensure even user bucket allocations", "Enforce fixed experiment lifespans to prevent early measurement bias errors", "Track total average basket checkout values as an auxiliary guardrail metric"]
        },
        {
            "title": "Improving Mobile App Accessibility (WCAG Baseline)",
            "id": "#PM-7",
            "description": "An educational application risks exclusion from public procurement due to non-compliance with digital accessibility guidelines.",
            "concepts": ["WCAG 2.2 Guidelines", "Contrast Ratios", "Screen Reader Mappings"],
            "optimizations": ["Enforce a minimum 4.5:1 text-to-background visual color contrast ratio", "Inject explicit touch target size rules across mobile interface components", "Incorporate mandatory descriptive alt-text metadata inputs for visual content assets"]
        },
        {
            "title": "Defining MVP Scope for a Local Delivery Application",
            "id": "#PM-8",
            "description": "A startup wants to enter a competitive hyper-local food delivery market quickly. Define a lean Minimum Viable Product scope.",
            "concepts": ["MVP Scoping", "Core Value Proposition", "Feature De-scoping"],
            "optimizations": ["Focus strictly on single-payment, single-vendor ordering workflows", "De-prioritize advanced recommendation widgets for a flat catalog matrix", "Leverage third-party delivery map APIs to skip building proprietary tracking layers"]
        },
        {
            "title": "Reducing User Churn in a Subscription News App",
            "id": "#PM-9",
            "description": "A digital media application notices user churn rising significantly among cohorts who joined during recent promotional pricing campaigns.",
            "concepts": ["Churn Drivers", "Subscription Lifecycles", "Value Reinforcement"],
            "optimizations": ["Implement personalized weekly reading recap emails based on user interests", "Introduce dynamic, multi-tier subscription choices ahead of renewal terms", "Deploy targeted discount triggers when users exhibit low-usage engagement behaviors"]
        },
        {
            "title": "Analyzing a Freemium Tier Conversion Funnel",
            "id": "#PM-10",
            "description": "A cloud productivity tool has millions of free accounts but struggles to convert more than 1.5% of them into premium paying accounts.",
            "concepts": ["Paywall Optimization", "Feature Gate Strategies", "Usage-Based Triggers"],
            "optimizations": ["Introduce usage-based paywall limits rather than completely locking features", "Deploy contextual inline product upsell prompts during peak workflows", "Offer time-bound trial extensions for users who max out storage thresholds"]
        }
    ],
    "MEDIUM": [
        {
            "title": "Deconstructive Retention Cohort Inversion",
            "id": "#PM-11",
            "description": "An enterprise SaaS platform experiences steady top-line traffic growth, but deeper analysis reveals 60-day user cohort retention metrics are falling by 5% month-over-month.",
            "concepts": ["Cohort Inversion Models", "Feature Usage Affinity", "Value Realization Timing"],
            "optimizations": ["Map specific product event activations within the initial 48-hour onboarding window", "Deploy localized in-app tooltips targeted at low-adoption features", "Redesign subscription tiers to tie billing steps directly to primary value metrics"]
        },
        {
            "title": "Designing a Global Multi-Tier Monetization Transition",
            "id": "#PM-12",
            "description": "Transition a legacy business model into a modern usage-based consumption structure without causing user backlash or severe revenue drops.",
            "concepts": ["Usage Pricing Topologies", "Grandfathering Frameworks", "Revenue Modeling Simulation"],
            "optimizations": ["Provide interactive dashboard tools that simulate bill impacts before changes take effect", "Launch transition phases by applying updates to new signups first", "Implement tier options that cap maximum overage expenses for predictability"]
        },
        {
            "title": "Optimizing Algorithmic Feeds for Long-Term User Retention",
            "id": "#PM-13",
            "description": "A social video network maximizes immediate click engagement but triggers high user fatigue metrics, causing long-term active account drops.",
            "concepts": ["Algorithmic Fatigue Curves", "Diversity Metric Ratios", "Delayed Reward Tracking"],
            "optimizations": ["Introduce diversification caps to prevent repetitive theme recommendations", "Adjust core ranking loops to weigh deep completion metrics over brief clicks", "Incorporate negative feedback inputs directly into personal feed calculations"]
        },
        {
            "title": "GTM Strategy for Regulated European Financial Infrastructure",
            "id": "#PM-14",
            "description": "Launch a cross-border digital payment infrastructure across European regions while complying with strict local security and sovereignty regulations.",
            "concepts": ["Compliance Strategy", "Localization Frameworks", "Trust Engineering"],
            "optimizations": ["Deploy localized regional data residency storage clusters out-of-the-box", "Build specialized auditing views to satisfy validation reviews", "Establish strategic integrations with regional electronic identification providers"]
        },
        {
            "title": "Product Strategy for Marketplace Cold-Start Overhaul",
            "id": "#PM-15",
            "description": "A peer-to-peer specialized item marketplace struggles to expand into new cities due to severe matching delays between buyers and sellers.",
            "concepts": ["Two-Sided Market Mechanics", "Liquidity Engineering", "Subsidization Strategy"],
            "optimizations": ["Deploy targeted programmatic incentives to secure core sellers first", "Restrict early catalog indexing to tight, highly sought-after categories", "Implement automated cross-region listing options to fill early demand"]
        },
        {
            "title": "Redesigning a Search Experience for High-Intent Buyers",
            "id": "#PM-16",
            "description": "An industrial supply marketplace discovers that users take an average of 18 minutes and 6 search queries to locate and purchase specialized parts.",
            "concepts": ["Search Relevance Filters", "Intent Classification", "B2B Procurement Workflows"],
            "optimizations": ["Implement attribute-based facet structures matched to professional parts nomenclature", "Incorporate cross-reference serial number matching models inside search routing", "Deploy a 'Quick Reorder' portal that maps to historical procurement records"]
        },
        {
            "title": "Structuring Enterprise Collaboration Governance Features",
            "id": "#PM-17",
            "description": "A productivity software suite wins mid-market accounts but gets blocked from Fortune 500 deals due to a lack of administrative data management capabilities.",
            "concepts": ["Enterprise Readines", "RBAC Policies", "Audit Trail Frameworks"],
            "optimizations": ["Design centralized administrative control workspaces for enterprise system leads", "Incorporate SAML SSO and automated SCIM provisioning workflows", "Build continuous compliance exporting protocols that support SIEM integration patterns"]
        },
        {
            "title": "Launching a Developer API Platform as a Growth Driver",
            "id": "#PM-18",
            "description": "An established design platform wants to build an external developer ecosystem to drive long-term workflow integration and retention.",
            "concepts": ["API Productization", "Developer Experience (DX)", "Ecosystem Monetization"],
            "optimizations": ["Build self-service developer consoles featuring sandbox testing networks", "Establish a public integration marketplace inside the main user application dashboard", "Formulate clear api rate-limiting limits paired with tiered commercial tracks"]
        },
        {
            "title": "Managing Feature Deprecation in a High-Volume Product",
            "id": "#PM-19",
            "description": "A mature project management tool needs to retire a legacy document-sharing feature used by 8% of daily active accounts to save maintenance costs.",
            "concepts": ["Feature Lifecycles", "Migration Frameworks", "Customer Sentiment Risk Mitigation"],
            "optimizations": ["Embed automated context alerts detailing upcoming feature migration choices", "Provide programmatic migration scripts to export data into modern targets", "Deploy progressive read-only states to smoothly transition remaining users"]
        },
        {
            "title": "Optimizing a Mobile App's First-Time User Experience (FTUE)",
            "id": "#PM-20",
            "description": "A meditation and wellness application experiences a 60% drop-off immediately after users download the application and launch it for the first time.",
            "concepts": ["Time-to-Value (TTV)", "Activation Event Discovery", "In-App Onboarding Mechanics"],
            "optimizations": ["Allow users to try core application features before requiring profile creation", "Utilize brief onboarding quizzes to customize content tracks", "Implement subtle, interactive user tooltips to highlight value functions"]
        }
    ],
    "HARD": [
        {
            "title": "Ecosystem Orchestration for Global Super-App Expansion",
            "id": "#PM-21",
            "description": "Design a strategic product architecture for a multi-vertical super-app (transport, logistics, payments) operating across highly fragmented emerging economies.",
            "concepts": ["Unified Core Identity Linkage", "Contextual Super-App Portals", "Dynamic Localized Configuration Engine"],
            "optimizations": ["Deploy a modular micro-frontend shell to host third-party services smoothly", "Implement a shared, cross-vertical loyalty and rewards program configuration", "Configure offline data persistence layers for low-bandwidth cellular markets"]
        },
        {
            "title": "Structuring AI Governance and Bias Audits for Healthcare Product Lines",
            "id": "#PM-22",
            "description": "Launch an AI-driven predictive triage platform for hospitals, ensuring compliance with strict healthcare bias, privacy, and regulatory safety frameworks.",
            "concepts": ["Algorithmic Transparency Control", "Clinical Efficacy Safety Guardrails", "Multi-Cohort Fair Treatment Validation"],
            "optimizations": ["Incorporate explicit explanation generation interfaces for clinical user reviews", "Establish rigorous verification pipelines that cross-check diagnostic outputs against historic demographic data", "Deploy shadow testing tracks to monitor AI advice ahead of primary platform integration"]
        },
        {
            "title": "Designing a Multi-Sided Network Optimization for Autonomous Delivery Assets",
            "id": "#PM-23",
            "description": "Orchestrate real-time product matching mechanics for an autonomous delivery vehicle network balancing volatile customer delivery demands, vehicle charge levels, and maintenance schedules.",
            "concepts": ["Dynamic Surcharging Algorithms", "Fleet Optimization Metrics", "Predictive Demand Micro-Routing"],
            "optimizations": ["Implement predictive clustering algorithms to preposition fleet units before demand spikes", "Deploy automated pricing models that adjust delivery fees based on immediate battery reserves", "Configure alternative dispatch options that group nearby multi-order drop-offs"]
        },
        {
            "title": "Formulating Product Defensibility and Migration Protections Against AI-Commoditization",
            "id": "#PM-24",
            "description": "A high-revenue writing assistant tool faces severe market disruption due to free, embedded base LLM capabilities inside operating systems. Re-architect product defensibility.",
            "concepts": ["Proprietary Context Capitalization", "Deep Workflow Integration Patterns", "Enterprise Knowledge System Integrations"],
            "optimizations": ["Pivot product focus to index corporate-specific brand patterns and guidelines", "Build secure integrations with internal enterprise knowledge repositories", "Introduce automated multi-channel document assembly templates for complex enterprise operations"]
        },
        {
            "title": "Re-Architecting Global Data Localization Protocols for B2B Enterprise Compliance",
            "id": "#PM-25",
            "description": "A high-growth collaboration software needs to modify its underlying data pipelines to support data sovereignty demands from international enterprise customers.",
            "concepts": ["Tenant Infrastructure Isolation", "Cross-Border Regulatory Compliance", "Zero-Knowledge Cloud Encryption Options"],
            "optimizations": ["Design decentralized tenant routing nodes that keep asset text data within local regions", "Deploy client-side cryptographic key configurations to secure enterprise data blocks", "Introduce custom compliance reporting dashboards for enterprise IT admins"]
        },
        {
            "title": "Optimizing B2B SaaS Expansion via Dynamic Product-Led Growth (PLG) Engines",
            "id": "#PM-26",
            "description": "Design an automated automated expansion model inside an enterprise communication product to organically transition individual users into enterprise contracts.",
            "concepts": ["Product-Qualified Lead (PQL) Triggers", "Cross-Organization Workspace Sharing", "Viral Expansion Loops"],
            "optimizations": ["Implement automated triggers that flag accounts when internal team sizes hit critical thresholds", "Create single-click workspace consolidation paths for overlapping corporate groups", "Deploy contextual enterprise feature showcases to high-usage internal teams"]
        },
        {
            "title": "Managing Complex Technical Debt Modernization in Core Banking Products",
            "id": "#PM-27",
            "description": "Formulate a multi-year product modernization roadmap to replace a core banking platform's transactional accounting layer without impacting ongoing client payment tracks.",
            "concepts": ["Strangler Fig Application Design", "Risk Mitigation Frameworks", "Parallel System Verifications"],
            "optimizations": ["Execute the transformation by routing minor customer segment cohorts through the updated path first", "Deploy real-time transaction verification checks to cross-compare old and new output streams", "Establish quick rollback rollback steps to insulate core client accounts from errors"]
        },
        {
            "title": "Designing Monetization Networks for Multi-User Creative Platforms",
            "id": "#PM-28",
            "description": "Architect a creator payouts and marketplace engine for a major global 3D asset generation ecosystem, ensuring fair economic models for asset designers.",
            "concepts": ["Dynamic Micro-Payout Distribution Matrices", "Digital Asset Licensing Frameworks", "Platform Economy Protections"],
            "optimizations": ["Implement engagement-weighted payout algorithms that reward creators based on usage metrics", "Deploy automated detection tools to flag and suppress plagiarized asset listings", "Introduce modular licensing packages designed for commercial game production studios"]
        },
        {
            "title": "Revamping User Engagement Models for Hyper-Casual Content Ecosystems",
            "id": "#PM-29",
            "description": "A short-form streaming video service experiences high initial app downloads but drops significantly in 30-day user engagement due to shifting social trends.",
            "concepts": ["Dynamic Content Recommendation Hooks", "User Interest Drift Tracks", "Community Feature Loops"],
            "optimizations": ["Introduce interactive co-watching feature configurations to enhance social engagement", "Deploy real-time trend-spotting models to adjust homepage feeds dynamically", "Create automated push channels tailored to emerging micro-interest cohorts"]
        },
        {
            "title": "Structuring Accessibility Capabilities for Immersive Hardware Portals",
            "id": "#PM-30",
            "description": "Design product accessibility guidelines for a newly engineered spatial computing hardware headset, ensuring users with limited motor control can navigate fluidly.",
            "concepts": ["Multimodal Interface Inputs", "Eye-Tracking Calibration Interfaces", "Adaptive UI Density Layouts"],
            "optimizations": ["Incorporate high-accuracy voice synthesis commands to alternate with physical inputs", "Deploy automatic layout scaling that simplifies interface densities when jitter is detected", "Configure alternative eye-tracking gesture profiles to support varied user capabilities"]
        }
    ]
}

GAMING_CHALLENGES = {
    "EASY": [
        {
            "title": "Deterministic Game Loop Implementation",
            "id": "#GAME-1",
            "description": "Implement a core game loop structure in C++ that guarantees game physics update consistently across diverse hardware frame rates.",
            "concepts": ["Fixed Timestep", "Variable Rendering Paths", "Accumulator Patterns"],
            "optimizations": ["Enforce a fixed physics update loop coupled with an accumulator variable", "Interpolate spatial transforms for object rendering states during lag frames", "Clamp extreme delta-time inputs to prevent erratic system behavior caps"]
        },
        {
            "title": "Finite State Machine (FSM) Enemy Patrol Logic",
            "id": "#GAME-2",
            "description": "Design an AI character control model handling transitions between Patrolling, Chasing, and Attacking behaviors without state overlap.",
            "concepts": ["FSM Architecture", "State Transition Validation", "Clean Separation of Concerns"],
            "optimizations": ["Implement an explicit state-pattern interface structure using strongly typed enums", "Drive condition transitions using parameterized trigger events", "Incorporate entry and exit lifecycle hooks for every character state"]
        },
        {
            "title": "Optimizing 2D Spatial Sorting via AABB",
            "id": "#GAME-3",
            "description": "A 2D platformer game slows down because it evaluates potential collision interactions across every entity object on screen simultaneously.",
            "concepts": ["Axis-Aligned Bounding Boxes", "Broad-phase Filtering", "Spatial Partitioning"],
            "optimizations": ["Implement a Sweep-and-Prune broad-phase sorting layer", "Perform quick interval overlap tests before executing fine pixel checks", "Cache dynamic object dimension boundaries inside unified memory arrays"]
        },
        {
            "title": "Reducing Graphics Draw Calls via Static Batching",
            "id": "#GAME-4",
            "description": "A 3D mobile game experiences low framerates because it dispatches unique render instructions for thousands of isolated structural props.",
            "concepts": ["Draw Call Bottlenecks", "Static Batching Patterns", "Material Consolidation"],
            "optimizations": ["Combine disparate structural prop textures into single texture atlases", "Mark non-moving scene objects as static to enable automatic engine grouping", "Utilize instanced rendering calls for identical repeating geometry blocks"]
        },
        {
            "title": "Mitigating Garbage Collection Spikes in Unity UI",
            "id": "#GAME-5",
            "description": "A mobile racing title encounters frequent micro-stutter anomalies because its HUD interface updates string values every single frame.",
            "concepts": ["Garbage Collection Overhead", "String Allocation Optimization", "UI Canvas Layout Separation"],
            "optimizations": ["Utilize specialized non-allocating string formatter engines", "Split rapidly updating HUD text nodes onto distinct child canvas layers", "Cache structural UI element references to bypass repetitive search lookups"]
        },
        {
            "title": "Implementing a Smooth Camera Tracking Script",
            "id": "#GAME-6",
            "description": "A third-person game's camera tracking feels erratic and jagged when following a fast-moving player character across terrain.",
            "concepts": ["Linear Interpolation (Lerp)", "Camera Deadzones", "Frame-Rate Independent Smoothing"],
            "optimizations": ["Apply target position smoothing factored by exponential delta-time values", "Establish custom deadzone bounding areas to ignore subtle player movements", "Incorporate look-ahead offset points aligned with the player's vector input"]
        },
        {
            "title": "Object Pooling for Weapon Projectiles",
            "id": "#GAME-7",
            "description": "A top-down shooter game experiences performance drops and lag spikes when players fire high-rate-of-fire weapons that instantiate hundreds of lasers.",
            "concepts": ["Memory Allocation Overhead", "Object Pooling Pattern", "Active/Inactive State Management"],
            "optimizations": ["Pre-allocate projectile collections inside application loading screens", "Recycle spent projectiles via active/inactive state toggles", "Enforce maximum active projectile caps to protect runtime memory allocations"]
        },
        {
            "title": "Configuring Basic Audio Mix Grouping",
            "id": "#GAME-8",
            "description": "An action game's sound balance becomes muddy and overwhelming during heavy combat scenes because ambient sounds mask crucial combat feedback queues.",
            "concepts": ["Audio Mixing Hierarchies", "Dynamic Audio Ducking", "Priority Voice Assignment"],
            "optimizations": ["Organize audio channels into structured master, ambient, and effects categories", "Configure automated ducking triggers to lower ambient sound levels when dialogue flags are active", "Limit active concurrent sound effect play channels to optimize engine compute usage"]
        },
        {
            "title": "Optimizing Mobile Texture Compress Configurations",
            "id": "#GAME-9",
            "description": "A high-fidelity mobile title exceeds maximum application package size limitations, limiting downloads across user devices.",
            "concepts": ["Texture Formats", "ASTC/ETC2 Compression", "Mip-Mapping Applications"],
            "optimizations": ["Convert texture catalogs to highly compressed ASTC block profiles", "Disable generation of mip-maps for strictly flat UI element components", "Limit maximum texture import limits to 2048x2048 parameters for non-critical assets"]
        },
        {
            "title": "Basic Enemy Navigation Mesh Routing",
            "id": "#GAME-10",
            "description": "Characters in a 3D tactical game struggle to navigate around basic environmental props, frequently sliding against wall edges.",
            "concepts": ["Navigation Meshes (NavMesh)", "Agent Radius Tuning", "Path Cost Modifications"],
            "optimizations": ["Bake explicit environmental static navigation mesh barriers into scenes", "Tune agent width parameters to prevent clipping against geometry edges", "Apply specialized navigation area costs to guide characters away from terrain obstacles"]
        }
    ],
    "MEDIUM": [
        {
            "title": "Client-Side Prediction and Reconciliation in Netcode",
            "id": "#GAME-11",
            "description": "An online multiplayer competitive shooter exhibits rubber-banding issues for users experiencing moderate network round-trip latencies.",
            "concepts": ["Network Client Prediction", "Server Reconciliation Loop", "Input History Buffering"],
            "optimizations": ["Execute local user movement inputs instantly before receiving server validation packets", "Maintain an indexed local historical input buffer to replay states upon misprediction alerts", "Apply smooth positional error interpolation over multiple frames during corrections"]
        },
        {
            "title": "Designing a High-Performance Entity Component System (ECS)",
            "id": "#GAME-12",
            "description": "An open-world strategy simulation game struggles to simulate and update 50,000 active unit agents using standard object-oriented hierarchies.",
            "concepts": ["Data-Oriented Design", "Cache Locality Optimization", "ECS Sytem Decoupling"],
            "optimizations": ["Organize component fields inside continuous array configurations to optimize CPU cache lines", "Isolate transformation updates into vectorized SIMD instructions", "Eliminate polymorphic virtual updates inside main system loops"]
        },
        {
            "title": "A* Pathfinding Optimization for Large Fleets",
            "id": "#GAME-13",
            "description": "An RTS title encounters CPU thread spikes whenever groups of 200 units are ordered to traverse across dense terrain maps simultaneously.",
            "concepts": ["A* Pathfinding Algorithm", "Hierarchical Pathfinding", "Asynchronous Path Request Queues"],
            "optimizations": ["Deploy a dual-layer hierarchical pathfinding layout for coarse long-distance routing", "Distribute path calculation updates across multiple frames using worker queues", "Incorporate localized string-pulling (Funnel Algorithm) to optimize path nodes"]
        },
        {
            "title": "Frustum and Occlusion Culling Custom Framework",
            "id": "#GAME-14",
            "description": "A first-person adventure game wastes massive GPU cycles rendering interior geometries and props located behind structural room walls.",
            "concepts": ["Frustum Culling Basics", "Occlusion Culling Systems", "Bounding Volume Hierarchies"],
            "optimizations": ["Bake static visibility cells to map visibility links across rooms", "Utilize low-polygon proxy shapes for early hardware occlusion testing loops", "Leverage compute shaders to execute high-speed hierarchical frustum tests on instances"]
        },
        {
            "title": "Dynamic Skeletal Animation Blending",
            "id": "#GAME-15",
            "description": "A sports title displays abrupt, disjointed movement transitions when characters shift from a high-speed sprint state into a sliding kick animation.",
            "concepts": ["Animation Blend Trees", "Crossfading Parameters", "Root Motion Control"],
            "optimizations": ["Implement multidimensional blend tree structures driven by velocity inputs", "Incorporate inertial blending methodologies to maintain momentum across state changes", "Synchronize animation footstep phases during transition windows to eliminate sliding visuals"]
        },
        {
            "title": "Implementing a Customizable Input Buffering System",
            "id": "#GAME-16",
            "description": "A fighting game fails to register special attack combinations reliably when players input commands quickly during hit-stun animation states.",
            "concepts": ["Input Buffering Patterns", "Command Matching Windows", "Action State Invalidation"],
            "optimizations": ["Maintain a rolling historical command frame queue tracking inputs", "Introduce custom leniency windows to accept valid command variations", "Incorporate clear frame consumption rules to reset inputs upon action execution"]
        },
        {
            "title": "Mobile Memory Lifecycle and Asset Unloading",
            "id": "#GAME-17",
            "description": "A narrative-driven mobile game crashes frequently during long play sessions due to low memory warnings from the mobile operating system.",
            "concepts": ["Asset Bundle Lifecycles", "Asynchronous Resource Loading", "Memory Leak Auditing"],
            "optimizations": ["Implement modular asset bundle schemas to load resources dynamically", "Enforce explicit garbage collection triggers during scene transition windows", "Deploy weak reference trackers to catch hidden texture leaks inside script instances"]
        },
        {
            "title": "Optimizing Custom UI Layout Rendering",
            "id": "#GAME-18",
            "description": "An RPG inventory screen featuring hundreds of item icons causes significant framerate drops whenever the player filters their equipment view.",
            "concepts": ["UI Overdraw Diagnostics", "Dynamic Grid Virtualization", "Canvas Layout Segregation"],
            "optimizations": ["Implement UI element virtualization to reuse row nodes outside view boundaries", "Combine item element sprites into a unified UI texture sheet", "Pre-sort item display states inside memory arrays before calling visual updates"]
        },
        {
            "title": "Designing a Robust Save Game Serialization Engine",
            "id": "#GAME-19",
            "description": "An open-world survival game generates massive, multi-megabyte save files that take over 10 seconds to read or write, interrupting gameplay loops.",
            "concepts": ["Binary Serialization", "Delta Save Enforcements", "Asynchronous File I/O"],
            "optimizations": ["Transition text-heavy storage formats to highly optimized binary layouts", "Serialize only mutated world state components rather than saving intact actors", "Offload disk file writing operations onto separate background worker threads"]
        },
        {
            "title": "Implementing Localized Audio Obstruction Systems",
            "id": "#GAME-20",
            "description": "A stealth title fails to convey spatial awareness because footsteps behind concrete columns sound identical to footfalls in open corridors.",
            "concepts": ["Acoustic Raycasting Protocols", "Low-Pass Filter Applications", "Dynamic Reverb Adjustments"],
            "optimizations": ["Execute asynchronous raycasts from audio sources to player listeners", "Apply low-pass filters when structural geometry blocks clear sightlines", "Adjust runtime audio send levels based on room geometric volumes"]
        }
    ],
    "HARD": [
        {
            "title": "Lag Compensation via Rewind and Hit-Registration Engineering",
            "id": "#GAME-21",
            "description": "Design a hit-registration validation system for a fast-paced multiplayer shooter that ensures accurate projectile impact checks, even when players have a 150ms network ping.",
            "concepts": ["Server-Side State Rewinding", "Bounding Volume History Trees", "Network Time Synchronization"],
            "optimizations": ["Maintain a rolling history of entity bounding volumes on the server for up to 1 second", "Interpolate target hitboxes back to the exact frame time context of the client input", "Validate client shot trajectories against calculated historical server positions"]
        },
        {
            "title": "GPU-Driven Rendering pipeline for Ultra-Dense Environments",
            "id": "#GAME-22",
            "description": "Architect a rendering framework capable of displaying a dense forest containing millions of individual trees and rocks at 4K resolution and 120 FPS.",
            "concepts": ["Compute Shader Frustum Culling", "Indirect Draw Commands (DrawIndirect)", "Hi-Z Occlusion Filtering"],
            "optimizations": ["Execute object frustum and occlusion culling inside compute shaders", "Utilize MultiDrawElementsIndirect to submit thousands of mesh instances in a single call", "Leverage virtualized geometry techniques to scale mesh detail based on screen space visibility"]
        },
        {
            "title": "Building a Lock-Free Multi-Threaded Task Scheduler",
            "id": "#GAME-23",
            "description": "Design a high-performance engine job system that distributes systems like animation, physics, and AI across 16 CPU cores without stalling the main thread.",
            "concepts": ["Work-Stealing Scheduling Patterns", "Lock-Free Ring Buffers", "Cache Line Contention Control"],
            "optimizations": ["Implement a lock-free work-stealing deque architecture using atomic pointers", "Align job task metadata allocations to 64-byte boundaries to avoid false sharing", "Utilize light fibers or worker thread pools to eliminate context-switching overhead"]
        },
        {
            "title": "Large-Scale Deterministic Lockstep Network Architecture",
            "id": "#GAME-24",
            "description": "Design a network synchronization framework for a lockstep strategy game supporting 10,000 active automated units without transmitting absolute object spatial values.",
            "concepts": ["Fixed-Point Mathematical Frameworks", "Input Verification Synchronization", "Desynchronization Analysis Frameworks"],
            "optimizations": ["Replace floating-point math calls with predictable fixed-point integer structures", "Transmit only user command changes rather than sync state variables across network links", "Generate execution state checksums to catch and resolve desynchronization bugs instantly"]
        },
        {
            "title": "Custom Global Illumination and Light-Probe Core Framework",
            "id": "#GAME-25",
            "description": "Design a high-performance, real-time indirect lighting solution for an open-world console game featuring a fully dynamic day-night cycle.",
            "concepts": ["Spherical Harmonics Math", "Dynamic Voxelization Arrays", "Spatio-Temporal Filtering"],
            "optimizations": ["Utilize third-order Spherical Harmonics to represent global probe light inputs", "Update light probe coefficients asynchronously across rolling frame loops", "Incorporate temporal accumulation strategies to smooth out illumination changes"]
        },
        {
            "title": "Real-Time Cloth and Soft-Body Physics Solver",
            "id": "#GAME-26",
            "description": "Implement a high-performance cloth simulation system for character capes and flags that interacts naturally with wind forces without clipping into characters.",
            "concepts": ["Position-Based Dynamics (PBD)", "GPU Verlet Integration", "Spatial Hash Grid Collisions"],
            "optimizations": ["Implement constraint relaxation solvers inside highly parallel compute shaders", "Utilize spatial hash grid layouts to speed up vertex self-collision tests", "Apply distance constraints to prevent cloth models from penetrating character meshes"]
        },
        {
            "title": "Building a Distributed MMO World Replication Architecture",
            "id": "#GAME-27",
            "description": "Design a network replication engine capable of hosting 50,000 active concurrent players within a single interconnected open-world space.",
            "concepts": ["Dynamic Spatial Partitioning", "Interest Management Rings", "Seamless Server Handovers"],
            "optimizations": ["Deploy dynamic quadtree subdivision systems to balance server processing loads", "Implement client interest visibility circles to limit data updates to nearby events", "Orchestrate ghost-entity replication states along cluster server boundary lines"]
        },
        {
            "title": "Custom Virtual Memory Streaming for Open-World Assets",
            "id": "#GAME-28",
            "description": "An open-world action title encounters severe asset streaming hitches and texture pop-in when players traverse terrain at high speeds.",
            "concepts": ["Asynchronous Direct Storage APIs", "Ring Buffer Asset Management", "Texture Tile Pooling Matrices"],
            "optimizations": ["Leverage hardware-level DirectStorage options to bypass standard file system routing", "Pre-allocate continuous GPU memory tile structures to avoid runtime resizing", "Implement prioritized texture streaming arrays driven by camera look vectors"]
        },
        {
            "title": "GPU Fluid and Particle Simulation Framework",
            "id": "#GAME-29",
            "description": "Design an interactive weather simulation handling millions of individual physical rain drops and water ripples that react to characters moving through environments.",
            "concepts": ["Smoothed Particle Hydrodynamics", "GPU Rasterization Transforms", "Vector Field Interactions"],
            "optimizations": ["Execute particle transform updates inside compute shaders to minimize VRAM-CPU copying", "Utilize signed distance fields to handle physics collisions against terrain models", "Apply temporal noise filters to maintain high-quality visual outputs at lower particle counts"]
        },
        {
            "title": "Advanced Audio Propagation via Acoustic Wave Solvers",
            "id": "#GAME-30",
            "description": "Design an audio simulation engine for a tactical infiltration title that calculates realistic sound path reflections around complex room corners.",
            "concepts": ["Acoustic Wave Diffraction", "Voxelized Sound Path Fields", "Runtime Portal Node Netting"],
            "optimizations": ["Pre-calculate environmental geometric portal paths to map acoustic routing", "Utilize dynamic low-pass filters to simulate sound passing through thick walls", "Incorporate ray-traced audio reflections to render spatial reverberations"]
        }
    ]
}

SPECIALIZED_CHALLENGES = {
    "EASY": [
        {
            "title": "Playwright Page Object Model Setup",
            "id": "#SPEC-1",
            "description": "A web testing suite becomes unstable and fails frequently because UI component changes require updating selectors across dozens of individual integration test files.",
            "concepts": ["Page Object Model (POM)", "Locator Strategies", "Test Maintainability"],
            "optimizations": ["Encapsulate interface elements inside centralized class page models", "Utilize stable user-facing data-testid selectors over volatile CSS paths", "Implement clean async initialization hooks within test setup configurations"]
        },
        {
            "title": "IoT Temperature Sensor MQTT Ingestion",
            "id": "#SPEC-2",
            "description": "An industrial IoT telemetry node drops metrics messages when network connectivity fluctuates inside a remote manufacturing warehouse site.",
            "concepts": ["MQTT QoS Levels", "Clean Session Flags", "Client Reconnection Retry Loops"],
            "optimizations": ["Configure MQTT Quality of Service Level 1 to guarantee at-least-once message delivery", "Set CleanSession flags to false to retain subscriptions during client drops", "Implement exponential backoff retry logic within the sensor's connection loops"]
        },
        {
            "title": "Remediating ERC-20 Smart Contract Reentrancy",
            "id": "#SPEC-3",
            "description": "An audit flags a token withdrawal smart contract method that mutates user balances only after triggering external address ether transfer calls.",
            "concepts": ["Reentrancy Vulnerability", "Checks-Effects-Interactions Pattern", "State Transitions"],
            "optimizations": ["Apply the Checks-Effects-Interactions pattern to update user balances before execution", "Integrate OpenZeppelin's nonReentrant function modifiers into critical routes", "Utilize explicit transfer limits to prevent unexpected nested code calls"]
        },
        {
            "title": "Basic Robot Controller PID Loop Tuning",
            "id": "#SPEC-4",
            "description": "A automated automated sorting arm overshoots its target drop positions, oscillating erratically before coming to a stop.",
            "concepts": ["Proportional-Integral-Derivative (PID)", "Overshoot Mitigation", "Loop Sampling Cadences"],
            "optimizations": ["Lower the proportional gain coefficient while increasing the derivative damping parameter", "Implement anti-windup clamping algorithms on the integration tracking term", "Enforce fixed, high-frequency execution timers for sensor measurement updates"]
        },
        {
            "title": "Designing a HIPAA-Compliant S3 Blueprint",
            "id": "#SPEC-5",
            "description": "Configure an AWS storage environment to store medical patient record scans while satisfying strict health security privacy guidelines.",
            "concepts": ["HIPAA Data Compliance", "Encryption at Rest", "Access Auditing Trails"],
            "optimizations": ["Enforce AWS SSE-KMS encryption configurations using dedicated customer-managed keys", "Enable S3 Object Lock in compliance mode to prevent historical data mutations", "Route all data access events to cloud audit trails with logging tracking enabled"]
        },
        {
            "title": "Optimizing Low-Power Firmware Sleep States",
            "id": "#SPEC-6",
            "description": "A battery-powered environmental monitoring node drains its power cell within 4 days instead of surviving its 6-month operation mandate.",
            "concepts": ["Deep Sleep Frameworks", "Peripheral Power Gating", "Interrupt-Driven Wakeups"],
            "optimizations": ["Configure the microcontroller to remain in deep sleep mode between task events", "Power down non-essential sensor communication pins via hardware controls", "Utilize hardware interrupt pins instead of continuous software checking loops"]
        },
        {
            "title": "Automating API Contract Validation Testing",
            "id": "#SPEC-7",
            "description": "Frontend interfaces crash frequently because backend developers modify API payload keys without alerting adjacent engineering teams.",
            "concepts": ["Contract Testing Patterns", "Pact Framework Integration", "CI/CD Gate Integrations"],
            "optimizations": ["Define core consumer contract specifications using standard Pact file declarations", "Execute automated contract schema checks during every build validation loop", "Fail backend deployment pipelines when payload mutations break contract baselines"]
        },
        {
            "title": "Modbus RTU Industrial Telemetry Connection Setup",
            "id": "#SPEC-8",
            "description": "An automation system receives corrupted, unreadable data packets when polling factory floor electricity meters over RS485 connections.",
            "concepts": ["Modbus RTU Protocols", "Serial Line Noise Protections", "CRC Error Checking"],
            "optimizations": ["Verify matching baud rate and parity bit parameters across all devices", "Deploy terminating resistor blocks along the physical RS485 network ends", "Implement cyclic redundancy check (CRC) validation blocks to isolate bad inputs"]
        },
        {
            "title": "Securing Smart Contract Ownership Transfers",
            "id": "#SPEC-9",
            "description": "A smart contract risk assessment flags an owner-privilege transition routine that updates permissions instantly via single-step transaction calls.",
            "concepts": ["Privilege Escalation Risks", "Two-Step Transfer Patterns", "Access Validation Guardrails"],
            "optimizations": ["Implement a two-step transfer pattern requiring explicit acceptance from new owners", "Enforce access controls using OpenZeppelin's Ownable2Step structures", "Incorporate multi-day timelocks before administrative privilege changes take effect"]
        },
        {
            "title": "Implementing Basic Appium Mobile UI Automated Locators",
            "id": "#SPEC-10",
            "description": "An automated mobile application testing suite fails frequently because element paths change when moving across Android and iOS deployments.",
            "concepts": ["Cross-Platform Accessibility Identifiers", "Appium Locator Strategies", "UI Test Stabilization"],
            "optimizations": ["Enforce explicit accessibilityIdentifier tags within native view layouts", "Avoid using unstable, performance-heavy XPath structures in mobile testing scripts", "Implement implicit dynamic waiting functions to accommodate slower asset loading targets"]
        }
    ],
    "MEDIUM": [
        {
            "title": "Playwright Parallel Execution Flaws in Multi-Tenant Environments",
            "id": "#SPEC-11",
            "description": "An automated testing suite yields intermittent failures during parallel execution tracks because separate workers modify shared user settings in the backend database.",
            "concepts": ["Test Database Isolation", "Dynamic Tenant Seeding", "Parallel Execution Anchors"],
            "optimizations": ["Generate unique, isolated database tenant schemas for each parallel worker thread", "Utilize randomized data generation models to create test entities", "Enforce strict teardown routines to clean up worker footprints post test execution"]
        },
        {
            "title": "Designing a High-Throughput MQTT Broker Cluster Optimization",
            "id": "#SPEC-12",
            "description": "A fleet of 100,000 connected vehicle nodes drops telemetry tracking updates when passing messages through a single backend broker node during commute peaks.",
            "concepts": ["Shared-Subscription Clustering", "EMQX / Mosquitto Tuning", "Keep-Alive Timeout Adjustments"],
            "optimizations": ["Deploy an EMQX cluster architecture behind high-performance load balancers", "Utilize MQTT shared subscription structures to distribute message delivery loads", "Tune socket buffer limits and system maximum open file descriptors on brokers"]
        },
        {
            "title": "Remediating Flash Loan Exploits in DeFi Protocols",
            "id": "#SPEC-13",
            "description": "A decentralized lending protocol loses token reserves because an external contract manipulates shallow automated market maker asset pricing within a single block transaction.",
            "concepts": ["Flash Loan Arbitrage Vectors", "Decentralized Price Oracles", "Time-Weighted Average Price (TWAP)"],
            "optimizations": ["Integrate Chainlink decentralized price feeds instead of relying on single pool states", "Implement dynamic pricing models using Time-Weighted Average Price values", "Incorporate strict slippage check thresholds on major token exchange routes"]
        },
        {
            "title": "Sensor Fusion via Extended Kalman Filtering for Drones",
            "id": "#SPEC-14",
            "description": "An autonomous drone exhibits erratic drift tracking when computing its indoor flight position using noisy IMU acceleration data and sporadic camera landmarks.",
            "concepts": ["Extended Kalman Filter (EKF)", "State Vector Estimation", "Covariance Matrix Tuning"],
            "optimizations": ["Implement an EKF engine to unify IMU calculations with landmark updates", "Calibrate measurement covariance matrices based on empirical sensor error profiles", "Execute sensor data preprocessing validation to discard anomalous measurement readings"]
        },
        {
            "title": "Designing a Multi-Region GxP-Compliant Bio-Pharma Data Vault",
            "id": "#SPEC-15",
            "description": "Architect a cloud data pipeline to store clinical trial logs while adhering to strict FDA 21 CFR Part 11 auditing and validation rules.",
            "concepts": ["GxP Compliance Rules", "Cryptographic Audit Trails", "Electronic Signature Workflows"],
            "optimizations": ["Store records inside write-once-read-many (WORM) immutable cloud buckets", "Generate SHA-256 integrity checksum files alongside every dataset modification", "Deploy independent ledger logging accounts to store administrative access data"]
        },
        {
            "title": "Optimizing OTA Firmware Updates over Low-Bandwidth Cellular Links",
            "id": "#SPEC-16",
            "description": "An industrial asset management tracking system crashes and fails during critical over-the-air update deployments to remote monitoring stations.",
            "concepts": ["Delta Compression Formats", "Dual-Bank Bootloader Configurations", "Rollback Trigger Controls"],
            "optimizations": ["Generate highly compact binary delta patches instead of transmitting complete system images", "Implement a dual-bank flash memory configuration to enable active background writes", "Configure automated bootloader recovery pathways to restore functional states on errors"]
        },
        {
            "title": "Automating Volumetric Visual Regression Layout Testing",
            "id": "#SPEC-17",
            "description": "A complex dashboard application suffers frequent visual layout breakages because regular element style fixes inadvertently displace adjacent rendering blocks.",
            "concepts": ["Visual Regression Automated Testing", "Pixel-Match Threshold Configurations", "Dynamic Content Masking"],
            "optimizations": ["Deploy automated screenshot comparison checks using modern engine pipelines", "Configure pixel mismatch tolerance thresholds to filter out subtle rendering differences", "Apply explicit canvas masking blocks to hide variable data areas during tests"]
        },
        {
            "title": "Industrial Robotic Safety Bus Integration (EtherCAT/PROFIsafe)",
            "id": "#SPEC-18",
            "description": "A factory production line encounters emergency system stalls because electromagnetic noise triggers false alarms along robotic field networks.",
            "concepts": ["EtherCAT Industrial Communication", "PROFIsafe Safety Profiles", "Watchdog Timer Management"],
            "optimizations": ["Deploy high-quality shielded twisted-pair cabling paths away from power lines", "Tune network watchdog timeout thresholds to accommodate predictable noise spikes", "Configure safe-state fallback matrices inside programmable logic controllers"]
        },
        {
            "title": "Optimizing Smart Contract Gas Usage in High-Volume Operations",
            "id": "#SPEC-19",
            "description": "A blockchain-based distribution tracking network becomes cost-prohibitive because user transactions consume excessive gas limits during execution.",
            "concepts": ["EVM Storage Optimization", "Calldata Pack Operations", "Assembly-Level Custom Tuning"],
            "optimizations": ["Consolidate independent boolean variables into compact single-slot bitmasks", "Utilize calldata passing parameters instead of duplicating data arrays in memory", "Implement structural custom errors over verbose string error messages"]
        },
        {
            "title": "Designing a High-Performance Distributed Testing Grid",
            "id": "#SPEC-20",
            "description": "An enterprise QA group faces long release bottlenecks because their web functional testing catalog takes over 9 hours to execute sequentially.",
            "concepts": ["Distributed Testing Orchestration", "Container Sharding Layouts", "Resource Allocation Profiles"],
            "optimizations": ["Deploy dynamic selenium/playwright node grids inside auto-scaling clusters", "Implement intelligent test sharding algorithms based on historic execution runtimes", "Incorporate early-failure cancellation triggers to stop invalid pipeline executions"]
        }
    ],
    "HARD": [
        {
            "title": "Designing a Fault-Tolerant Fleet Robotics Coordination Framework",
            "id": "#SPEC-21",
            "description": "Design an online orchestration architecture for 1,000 automated mobile warehouse fulfillment robots that prevents collisions and maintains delivery paths when localized wireless signals drop out.",
            "concepts": ["Decentralized Path Coordination", "Dynamic Window Motion Obstacle Control", "Time-Bounded Real-Time Consensus Networks"],
            "optimizations": ["Implement localized reciprocal velocity obstacle mechanics for fast point avoidance", "Deploy fallback peer-to-peer mesh radio linkages to maintain communication during network drops", "Configure spatial block booking reservation systems to manage intersection crossings safely"]
        },
        {
            "title": "Enterprise-Wide Solutions Architecture for Cross-Border Healthcare Systems",
            "id": "#SPEC-22",
            "description": "Architect an enterprise-grade cloud data management architecture for a global healthcare analytics vendor processing records across US (HIPAA), European (GDPR), and Asian digital health domains.",
            "concepts": ["Dynamic Data Tokenization Layers", "Polymorphic Regulatory Access Rules", "Zero-Knowledge Federated Query Engines"],
            "optimizations": ["Deploy strict local data boundary nodes to enforce regional sovereignty regulations", "Utilize format-preserving tokenization engines to mask sensitive identifiers at ingest points", "Implement homomorphic federated query pipelines to compute insights without decrypting source fields"]
        },
        {
            "title": "Designing a Highly Scalable IoT Real-Time Stream Processing Architecture",
            "id": "#SPEC-23",
            "description": "Design an industrial analytics ingestion pipeline capable of capturing, processing, and analyzing 5,000,000 concurrent sensor messages per second from global aircraft engine monitors.",
            "concepts": ["Zero-Copy Network Buffers", "Dynamic Stream Backpressure Processing", "Time-Series Lakehouse Partitioning Patterns"],
            "optimizations": ["Deploy high-performance Apache Kafka clusters optimized for network-level direct disk writes", "Implement adaptive traffic shedding mechanisms within edge ingestion nodes", "Organize target data lakehouse partitions by sensor type and rolling time-window blocks"]
        },
        {
            "title": "Advanced Formal Smart Contract Verification against Vulnerability Matrices",
            "id": "#SPEC-24",
            "description": "Design an automated formal verification script matrix for a complex cross-chain decentralized financial asset vault protocol handling $500M in assets.",
            "concepts": ["Mathematical Property Specifications", "Symbolic Execution Path Auditing", "Invariant Assertion Mapping"],
            "optimizations": ["Define strict global invariant mathematical assertions using Certora Prover setups", "Execute deep symbolic pathway analysis using specialized smart contract auditing tools", "Integrate automated mutation testing checkpoints directly into core release systems"]
        },
        {
            "title": "Building a Real-Time Deterministic Testing Infrastructure for Medical Hardware",
            "id": "#SPEC-25",
            "description": "Design a hardware-in-the-loop (HIL) automation test network that validates safety shutdown code routines on critical cardiac pump systems within a 2ms window.",
            "concepts": ["Real-Time Operating System Tasks", "FPGA-Driven Signal Generation", "Deterministic Execution Audits"],
            "optimizations": ["Configure test orchestration loops on hardware running dedicated RTOS platforms", "Utilize programmable field arrays (FPGAs) to simulate sensor signal inputs accurately", "Implement high-precision clock capture cards to track safety latency metrics down to nanoseconds"]
        },
        {
            "title": "Remediating Complex MEV Sandwich Attack Vulnerabilities",
            "id": "#SPEC-26",
            "description": "A decentral decentralized liquid staking protocol encounters continuous yield loss due to malicious searcher bots executing front-running sandwich attacks on asset rebalancing transactions.",
            "concepts": ["Maximal Extractable Value (MEV)", "Private Transaction Routing (Flashbots)", "Slippage Control Optimization Models"],
            "optimizations": ["Route rebalancing pool mutations through private execution rails like Flashbots Protect", "Implement dynamic, oracle-driven slip constraints rather than relying on static values", "Batch transactional adjustments across randomized execution blocks to eliminate searcher targets"]
        },
        {
            "title": "Designing a Hardened Cyber-Physical Energy Management Network",
            "id": "#SPEC-27",
            "description": "Architect an automation control architecture for an offshore wind turbine network, ensuring resilience against physical signal spoofing and cyber-warfare intrusion vectors.",
            "concepts": ["IEC 62443 Security Standards", "Cryptographic Data Authentication", "Air-Gapped Network Enforcements"],
            "optimizations": ["Deploy unidirectional security gateways to isolate operational zones from external systems", "Enforce cryptographic signature checks on all Modbus/TCP command payloads", "Implement anomalies analysis models to flag command sequences that violate physical constraints"]
        },
        {
            "title": "Building a High-Throughput Web Automated Framework with Zero Memory Leaks",
            "id": "#SPEC-28",
            "description": "Design a continuous testing infrastructure that executes 100,000 individual browser validation test loops 24/7 without requiring agent machine reboots due to memory exhaustion.",
            "concepts": ["V8 Process Memory Profiles", "Headless Browser Recycling Profiles", "Garbage Collection Hook Integrations"],
            "optimizations": ["Implement mandatory worker process lifecycle limits to clean out browser instances regularly", "Intercept and block non-essential media asset requests to save operational memory", "Deploy process profiling daemons to terminate leaked node contexts automatically"]
        },
        {
            "title": "Autonomous Mapping and Localization in Denied Environments",
            "id": "#SPEC-29",
            "description": "Design a localization pipeline for mining exploration robots operating deep underground where GPS, wireless, and magnetic signals are completely blocked.",
            "concepts": ["LIDAR Odometry Models", "Factor Graph Optimizations", "Loop Closure Detection Engines"],
            "optimizations": ["Implement a robust visual-inertial localization framework using factor graph arrays", "Deploy scan-matching algorithms to process point clouds without point lag spikes", "Incorporate bag-of-words spatial indexing models to recognize visited areas accurately"]
        },
        {
            "title": "Ultra-Low-Power Edge Compute Classification Framework Design",
            "id": "#SPEC-30",
            "description": "Design a wildlife monitoring camera system that runs an on-device animal classification model for up to 5 years on a single charge, minimizing power drain.",
            "concepts": ["Hardware-Accelerated Neural Networks", "Dynamic Voltage Scaling Configurations", "Event-Triggered Hardware Pins"],
            "optimizations": ["Deploy model weights onto specialized low-power neural processing units (NPUs)", "Utilize micro-amp passive infrared sensors to wake the system up from deep sleep on motion", "Implement dynamic system frequency scaling to adjust clock speeds based on workload size"]
        }
    ]
}


# ─── Centralized Mock Interview Scenario & Fundamental Topics ─────────────────

ROLE_CATEGORY_CONFIG = {
    "swe": {
        "fundamentals_topics": [
            "Operating Systems (OS) - memory management (stack vs heap, garbage collection internals, virtual memory)",
            "Operating Systems (OS) - concurrency models (threads, event loops, process synchronization, deadlocks, locks, race conditions)",
            "Database Management Systems (DBMS) - database indexing strategies (B-Trees, LSM Trees, hash indexes) and query planning",
            "Database Management Systems (DBMS) - database transaction isolation levels (ACID properties, dirty reads, phantom reads, serializability)",
            "Computer Networks (CN) - network protocols (HTTP/1.1 vs HTTP/2 vs HTTP/3, gRPC, WebSocket overhead, TCP vs UDP flow control)",
            "Computer Networks (CN) - network routing, DNS resolution, and security essentials (SSL/TLS handshakes, hashing vs encryption)"
        ],
        "system_designs": [
            "a high-concurrency movie ticket booking platform (similar to BookMyShow)",
            "a distributed rate-limiting service protecting public APIs",
            "a URL shortening service (like Bitly) with detailed click analytics",
            "a collaborative kanban board (like Trello) with instant updates"
        ],
        "phase_2_display": "CS Fundamentals (specifically Operating Systems [OS], Computer Networks [CN], or Database Management Systems [DBMS])",
        "phase_3_display": "LeetCode Coding Challenge",
        "phase_5_display": "System Design",
        "phase_5_focus": "design it from a high-level perspective (caching, database, APIs, load balancing)."
    },
    "data_ai": {
        "fundamentals_topics": [
            "Machine Learning theory (bias-variance tradeoff, overfitting vs underfitting, regularization L1/L2, gradient descent optimization)",
            "Statistical methods (hypothesis testing, A/B testing design, statistical significance, p-values, confidence intervals)",
            "Deep Learning architectures (Transformer self-attention mechanism, multi-head attention, feed-forward layers, backpropagation gradient issues)",
            "Model Evaluation metrics (precision, recall, F1-score, ROC-AUC, confusion matrix, precision-recall tradeoff in classification)",
            "Data Pipeline & Engineering (handling missing data, feature scaling, encoding categorical variables, mitigating high class imbalance)",
            "Generative AI & LLMs (RAG architecture, vector embeddings similarity search, PEFT/LoRA fine-tuning parameters, decoding strategies)"
        ],
        "system_designs": [
            "a real-time recommendation feed for a short-video platform (like TikTok)",
            "a fraud detection pipeline processing 50k transactions/sec with sub-50ms latency",
            "an enterprise search and Retrieval-Augmented Generation (RAG) assistant indexing 10M documents",
            "an automated image moderation and classification service for a social media platform"
        ],
        "phase_2_display": "ML/Stats Fundamentals (specifically Machine Learning theory, statistics, or deep learning)",
        "phase_3_display": "ML Case Study / Coding Challenge",
        "phase_5_display": "ML System Design",
        "phase_5_focus": "design it from an end-to-end perspective (data ingestion, model training, feature store, serving infrastructure)."
    },
    "infra_cloud": {
        "fundamentals_topics": [
            "Container Orchestration (Kubernetes pod lifecycle, controllers, service routing, Ingress, scheduling, autoscaling)",
            "Continuous Integration & Continuous Deployment (CI/CD pipeline stages, cache optimization, rollback strategies, secret management)",
            "Infrastructure as Code (Terraform workspace organization, remote state locking, modules, resource dependencies, providers)",
            "Networking in Cloud (VPC peering, Load Balancing algorithms, DNS resolution, CDN caching, SSL/TLS termination, HTTP routing)",
            "Observability & Monitoring (metrics scraping with Prometheus, dashboards in Grafana, log aggregation, tracing, alert thresholds)",
            "High Availability & Disaster Recovery (Active-Active vs Active-Passive setups, database replication delay, failover mechanisms, SLA)"
        ],
        "system_designs": [
            "a zero-downtime blue-green deployment orchestrator for 500 microservices",
            "a highly available multi-region Kubernetes routing and service mesh architecture",
            "a centralized telemetry, monitoring and alerting system for high-throughput distributed systems",
            "a secure, automated disaster recovery failover framework for a global banking database"
        ],
        "phase_2_display": "Infrastructure Fundamentals (specifically container orchestration, CI/CD, or cloud networking)",
        "phase_3_display": "Infrastructure Scenario Challenge",
        "phase_5_display": "Cloud Architecture Design",
        "phase_5_focus": "design a secure, highly available cloud infrastructure (load balancers, autoscaling groups, network routing, IaC)."
    },
    "security": {
        "fundamentals_topics": [
            "Application Security vulnerabilities (OWASP Top 10, SQL injection prevention, XSS remediation, CSRF protections)",
            "Network Security essentials (Firewalls, WAF rules, IDS/IPS, network segmentation, zero trust network access)",
            "Cryptography (symmetric vs asymmetric encryption, key exchange protocols like Diffie-Hellman, digital signatures, hashing algorithms)",
            "Threat Modeling methodologies (STRIDE framework, identifying entry points, mapping trust boundaries, mitigation plans)",
            "Identity & Access Management (OAuth2 flow with PKCE, OpenID Connect, JWT validation, role-based access control, session security)",
            "Incident Response & Forensics (containment procedures, system isolation, log analysis, vulnerability scanning, root cause analysis)"
        ],
        "system_designs": [
            "a zero-trust authentication and authorization gateway for an enterprise SaaS platform",
            "a secure web application firewall (WAF) rule distribution and logs collection architecture",
            "an automated security vulnerability scanner and patch deployment system for cloud infrastructure",
            "a secure, tamper-proof audit logging pipeline using cryptography or append-only ledgers"
        ],
        "phase_2_display": "Security Fundamentals (specifically application security, cryptography, or threat modeling)",
        "phase_3_display": "Threat/CTF Scenario Challenge",
        "phase_5_display": "Security Architecture Design",
        "phase_5_focus": "design a secure system structure (threat modeling, authentication/authorization, data isolation, transit encryption)."
    },
    "product_design": {
        "fundamentals_topics": [
            "Metrics prioritization (activation, retention, LTV, North Star metric selection, product-market fit metrics)",
            "User research & design (qualitative vs quantitative testing, usability feedback loops, user persona design, accessibility WCAG)",
            "Product execution & roadmapping (RICE prioritization framework, MoSCoW prioritization, MVP feature scoping)",
            "Growth & Monetization strategy (freemium vs premium tiers, ad monetization models, user acquisition channels, referral programs)",
            "A/B Testing & Product Experiments (hypothesis definition, MDE estimation, statistical significance, variant rollout strategies)",
            "User Journey Design (onboarding funnel optimizations, drop-off diagnostics, customer lifecycle mapping)"
        ],
        "system_designs": [
            "a premium subscription tier model and onboarding flow for a music streaming app",
            "a dynamic, personalized explore page feed dashboard tailored to user interest retention",
            "a global expansion customer acquisition campaign and metrics framework for a neobanking app",
            "a collaborative design prototyping and review tool workspace layout"
        ],
        "phase_2_display": "Product/Design Fundamentals (specifically metrics, prioritization, or user research)",
        "phase_3_display": "Product/Design Case Study",
        "phase_5_display": "Product Strategy & Growth Design",
        "phase_5_focus": "outline a product strategy, target segment prioritization, and monetization/launch metrics."
    },
    "gaming": {
        "fundamentals_topics": [
            "Game Loop Architecture (frame rate independence, delta time, fixed update loops, rendering interpolation)",
            "Character State Management (Finite State Machine design, hierarchical state machines, transition conditions, animator controllers)",
            "Collision Detection & Physics (AABB collision logic, sphere-sphere checks, trigger volumes, rigid body physics, spatial hashing)",
            "Graphics Rendering Pipelines (Forward vs Deferred rendering, G-buffer structure, shader stages, draw call optimizations)",
            "Multiplayer Netcode (client-side prediction, server reconciliation, entity interpolation, lag compensation, state sync)",
            "Memory & GC Optimization (object pooling strategies, avoiding runtime allocations, struct vs class usage, heap fragmentation)"
        ],
        "system_designs": [
            "a real-time multiplayer matchmaking server with ELO grouping",
            "a state synchronization and physics replication pipeline for a battle royale game",
            "a graphics shader rendering asset load optimization strategy for a massive open-world game",
            "a client-side prediction and server reconciliation lag compensation mechanism"
        ],
        "phase_2_display": "Game Dev Fundamentals (specifically game loop, physics, or rendering pipelines)",
        "phase_3_display": "Game Dev Challenge (Optimization/Algorithm)",
        "phase_5_display": "Game Architecture Design",
        "phase_5_focus": "design a game systems architecture (matchmaking queues, entity state sync, physics replication, load optimization)."
    },
    "specialized": {
        "fundamentals_topics": [
            "Test Automation & Quality Assurance (test pyramid, Page Object Model design, flaky test mitigation, mock objects)",
            "Embedded Systems & IoT (lightweight protocols like MQTT/CoAP, power management, interrupt-driven firmware, DMA transfer)",
            "Blockchain & Web3 (Solidity smart contract security, reentrancy prevention, mempool gas auctions, gas optimization)",
            "Robotics & Control Systems (sensor fusion Kalman filters, ROS node communication, path planning, control loops PID)",
            "Solutions Architecture (system integration, multi-tenant SaaS isolation, high availability, regulatory compliance)",
            "Research & Experimentation (literature review, performance evaluation, baseline comparison, mathematical formulation)"
        ],
        "system_designs": [
            "a high-throughput IoT telemetry ingestion pipeline handling 100k smart meters",
            "a decentralized identity and credentials verification blockchain platform",
            "a test automation platform orchestrating thousands of parallel browser tests",
            "a real-time sensor fusion and obstacle avoidance system for a warehouse mobile robot"
        ],
        "phase_2_display": "Domain-Specific Fundamentals (specifically testing, IoT, or blockchain)",
        "phase_3_display": "Domain-Specific Challenge",
        "phase_5_display": "Specialized Architecture Design",
        "phase_5_focus": "design a specialized systems architecture tailored to the domain requirements."
    }
}

COMPANY_DESIGN_SCENARIOS = {
    "faang": [
        "{company} Search Crawler & Indexing system at web scale",
        "{company} real-time collaborative document editor",
        "{company} location sharing & real-time ETA routing service",
        "{company} Video CDN and streaming delivery network",
        "{company} real-time personalized recommendation & home feed generation",
        "{company} e-commerce flash sale inventory management system handling 100k requests/sec",
        "{company} prime delivery logistics tracker and route optimization switch",
        "{company} real-time activity feed and story delivery pipeline",
        "{company} secure group chat messaging with offline sync",
        "{company} real-time video conferencing signal server",
        "{company} cloud storage folder synchronization system",
        "{company} real-time streaming LLM completions serving infrastructure",
        "{company} LLM fine-tuning job scheduler and GPU cluster allocator",
        "{company} lakehouse query optimizer and distributed join coordinator",
        "{company} multi-tenant database warehouse storage optimizer"
    ],
    "top-indian-product": [
        "{company} UPI payment switch and transaction reconciliation engine at 50k requests/sec",
        "{company} low-latency real-time stock trading and limit order matching book",
        "{company} SaaS multi-tenant database router with data isolation and custom routing",
        "{company} API testing mock server client with dynamic routing and sandbox generation",
        "{company} browser-based virtual machine orchestration framework for parallel test executions",
        "{company} bill payments notification dispatch scheduler with retry guarantees and batching",
        "{company} high-throughput user referral points ledger and real-time gamified leaderboard"
    ],
    "fintech": [
        "{company} multi-currency payment ledger with double-entry accounting constraints",
        "Real-time financial transaction fraud detection engine for {company} using streaming rules",
        "{company} digital wallet ledger with strict idempotency and consistency guarantees",
        "{company} cross-border multi-hop payment routing network optimizer",
        "{company} credit scoring and credit risk evaluation pipeline processing real-time bureau logs",
        "{company} cryptocurrency exchange order book matching engine with atomic transactions"
    ],
    "mid-product": [
        "{company} e-commerce shopping cart checkout and flash-sale reservation service",
        "{company} hyper-local food/grocery delivery dispatch matching and routing coordinator",
        "{company} live tracking system for delivery partner locations using geospatial index",
        "{company} ad-server impression tracking and real-time click analytics dashboard",
        "{company} open-source LLM model repository registry with versioning and CDN caches",
        "{company} multi-source search retrieval engine with streaming response aggregation for RAG"
    ],
    "hardware": [
        "{company} self-driving vehicle real-time sensor fusion pipeline (LiDAR, Radar, Camera)",
        "{company} IoT smart home appliance controller hub and telemetry data aggregator",
        "{company} firmware OTA (Over-The-Air) update distribution system for 10M edge devices",
        "{company} GPU cluster CUDA kernel job resource scheduler and allocator",
        "{company} automotive gateway router and vehicle dashboard event logging system",
        "{company} high-frequency embedded system control loop monitoring network"
    ],
    "gaming": [
        "{company} real-time multiplayer game lobby matchmaking engine matching users by skill ratings",
        "{company} global high-throughput gaming leaderboard with real-time score updates",
        "{company} online multiplayer game state synchronization server with lag compensation",
        "{company} in-game virtual currency purchase transaction log and inventory management system"
    ],
    "security": [
        "{company} high-throughput intrusion detection system (IDS) parsing network packet streams",
        "{company} zero-trust enterprise identity and access management (IAM) proxy gateway",
        "{company} distributed cloud-based antivirus and malware signature scanning service",
        "{company} real-time DDoS attack mitigation and edge traffic scrubbing firewall"
    ],
    "indian-service": [
        "{company} enterprise resource planning (ERP) payroll processing batch system",
        "{company} hospital patient records portal with granular role-based access control (RBAC)",
        "{company} aviation flight reservation aggregator and ticket booking system",
        "{company} compliance audit ledger for tracking internal corporate financial movements",
        "{company} government public utility billing system with bulk invoice generation"
    ],
    "other": [
        "{company} distributed telemetry logs collector and agent aggregation server",
        "{company} content delivery management system with multi-tenant workspace isolation",
        "{company} web analytics tracking script backend handling billions of events daily",
        "{company} helpdesk ticketing and customer support queue sorting system",
        "{company} telecom network performance monitor and cellular cell-tower health checker"
    ]
}

TECHNICAL_CHALLENGE_BANKS = {
    "swe": LEETCODE_BHANDARA,
    "data_ai": ML_CASE_STUDIES,
    "infra_cloud": INFRA_SCENARIOS,
    "security": SECURITY_SCENARIOS,
    "product_design": PRODUCT_CASES,
    "gaming": GAMING_CHALLENGES,
    "specialized": SPECIALIZED_CHALLENGES
}

# Derived helper dictionaries to satisfy prompts.py imports
TECH_FUNDAMENTALS_BY_CATEGORY = {
    cat: config["fundamentals_topics"] for cat, config in ROLE_CATEGORY_CONFIG.items()
}

SYSTEM_DESIGNS_BY_CATEGORY = {
    cat: config["system_designs"] for cat, config in ROLE_CATEGORY_CONFIG.items()
}

PHASE_2_TOPICS = {
    cat: config["phase_2_display"] for cat, config in ROLE_CATEGORY_CONFIG.items()
}

PHASE_3_NAMES = {
    cat: config["phase_3_display"] for cat, config in ROLE_CATEGORY_CONFIG.items()
}

PHASE_5_NAMES = {
    cat: config["phase_5_display"] for cat, config in ROLE_CATEGORY_CONFIG.items()
}

PHASE_5_FOCUS = {
    cat: config["phase_5_focus"] for cat, config in ROLE_CATEGORY_CONFIG.items()
}