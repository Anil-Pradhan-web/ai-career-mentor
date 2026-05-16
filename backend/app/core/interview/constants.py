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

# HFT / Trading Firms
COMPANY_PROFILES.extend([
    { "name": "Jane Street", "tier": "hft", "active": True, "interviewStyle": "OCaml functional + low latency, LC-hard (probabilistic), 'design a betting exchange', market microstructure depth" },
    { "name": "Tower Research", "tier": "hft", "active": True, "interviewStyle": "C++ memory pool design, lock-free queues, LC-hard, 'optimize this market data parser for 10 microseconds'" },
    { "name": "Quadeye", "tier": "hft", "active": True, "interviewStyle": "Latency arbitrage, LC-hard, 'detect quote stuffing from tick data', C++ template metaprogramming" },
    { "name": "Jump Trading", "tier": "hft", "active": True, "interviewStyle": "Verilog + C++ hybrid, 'design a packet sniffer timestamping circuit', LC-hard" },
    { "name": "AlphaGrep", "tier": "hft", "active": True, "interviewStyle": "FPGA + software co-design, LC-hard (bit tricks), 'design a risk limiter at nanosecond precision'" }
])

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


# ─── leetcode_bhandara.py ─────────────────────────────────────────────────────

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
