"""
Interview Constants — Lean registry of target roles, company profiles, locations, and cultural principles.
"""

# ─── Target Roles & Categories ─────────────────────────────────────────────

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


import re

ROLE_CATEGORY_CONFIG = {
    "swe": {
        "phase_2_display": "CS Fundamentals",
        "phase_3_display": "LeetCode Coding Challenge",
        "phase_8_display": "System Design",
    },
    "data_ai": {
        "phase_2_display": "ML/Stats Fundamentals",
        "phase_3_display": "Data/ML Challenge",
        "phase_8_display": "ML System Design",
    },
    "gaming": {
        "phase_2_display": "Game Dev Fundamentals",
        "phase_3_display": "Game Dev Challenge",
        "phase_8_display": "Game Architecture Design",
    },
    "infra_cloud": {
        "phase_2_display": "Infra/Cloud Fundamentals",
        "phase_3_display": "Cloud/DevOps Challenge",
        "phase_8_display": "Distributed Cloud Architecture",
    },
    "security": {
        "phase_2_display": "Security/OWASP Fundamentals",
        "phase_3_display": "Penetration/Security Challenge",
        "phase_8_display": "Secure Architecture Design",
    },
    "product_design": {
        "phase_2_display": "Product/UX Fundamentals",
        "phase_3_display": "Product Strategy Challenge",
        "phase_8_display": "Product System Design",
    },
    "specialized": {
        "phase_2_display": "Specialized Fundamentals",
        "phase_3_display": "Specialized Engineering Challenge",
        "phase_8_display": "Hardware/Embedded System Design",
    },
}


def get_role_category(role: str) -> str:
    if not role:
        return "swe"
    role_clean = role.strip().lower()
    
    # 1. Exact Match Check
    for category, roles in ROLE_CATEGORIES.items():
        if any(r.lower() == role_clean for r in roles):
            return category
            
    # 2. Canonical Substring Check
    for category, roles in ROLE_CATEGORIES.items():
        if any(r.lower() in role_clean for r in roles):
            return category

    # 3. Structured Keyword Mapping with Word Boundaries
    KEYWORD_MAPPINGS = [
        ([r"game", r"ar/vr", r"vr", r"unreal", r"unity", r"graphics"], "gaming"),
        ([r"machine learning", r"deep learning", r"nlp", r"computer vision", r"\bai\b", r"\bllm\b", r"\bmlops\b", r"data scientist", r"data analyst", r"data engineer"], "data_ai"),
        ([r"devops", r"\bsre\b", r"cloud", r"platform", r"infrastructure", r"kubernetes", r"docker"], "infra_cloud"),
        ([r"security", r"cyber", r"penetration", r"\bsoc\b", r"appsec"], "security"),
        ([r"product", r"ui/ux", r"\bui\b", r"\bux\b"], "product_design"),
        ([r"blockchain", r"solidity", r"smart contract", r"auditor", r"embedded", r"robotics", r"\bqa\b", r"test engineer", r"hardware"], "specialized"),
    ]

    for patterns, category in KEYWORD_MAPPINGS:
        for p in patterns:
            if p.startswith(r"\b") or p.endswith(r"\b"):
                if re.search(p, role_clean):
                    return category
            else:
                if p in role_clean:
                    return category

    return "swe"


# ─── Target Locations ───────────────────────────────────────────────────────

TARGET_LOCATIONS = [
    # Global Tech Hubs
    "San Francisco, USA",
    "New York, USA",
    "Seattle, USA",
    "Austin, USA",
    "Boston, USA",
    "London, UK",
    "Berlin, Germany",
    "Amsterdam, Netherlands",
    "Toronto, Canada",
    "Singapore",
    "Sydney, Australia",
    "Tokyo, Japan",

    # Indian Tech Hubs
    "Bengaluru, India",
    "Hyderabad, India",
    "Pune, India",
    "Gurgaon / Delhi NCR, India",
    "Mumbai, India",
    "Chennai, India",

    # Remote
    "Remote (Global)",
    "Remote (US Only)",
    "Remote (India Only)",
]


# ─── Company Profiles ───────────────────────────────────────────────────────

COMPANY_PROFILES = [
    # ── 1. FAANG & Global Big Tech Giants (30) ──────────────────────────────
    {
        "name": "Google", "tier": "FAANG", "active": True,
        "interviewStyle": "High algorithmic rigor, distributed systems design at planetary scale, clean coding, and Googleyness."
    },
    {
        "name": "Microsoft", "tier": "FAANG", "active": True,
        "interviewStyle": "Data structures & modular system architecture, low-level design trade-offs, and growth mindset."
    },
    {
        "name": "Amazon", "tier": "FAANG", "active": True,
        "interviewStyle": "16 Leadership Principles (STAR format), high-scale system resilience, customer obsession, and Bar Raiser rounds."
    },
    {
        "name": "Apple", "tier": "FAANG", "active": True,
        "interviewStyle": "Deep domain mastery, memory/resource efficiency, product craft, hardware-software integration, and uncompromising quality."
    },
    {
        "name": "Meta", "tier": "FAANG", "active": True,
        "interviewStyle": "Fast-paced algorithmic problem solving (45-min rounds), large-scale social graph architecture, and bias for action."
    },
    {
        "name": "Netflix", "tier": "FAANG", "active": True,
        "interviewStyle": "Seniority-focused system design, chaos engineering, freedom & responsibility culture, and high concurrency."
    },
    {
        "name": "Uber", "tier": "FAANG", "active": True,
        "interviewStyle": "Real-time geospatial indexing, event-driven dispatching, concurrency, and resilient distributed microservices."
    },
    {
        "name": "Airbnb", "tier": "FAANG", "active": True,
        "interviewStyle": "Product craft, cross-functional architecture, relational data modeling, and core values cultural alignment."
    },
    {
        "name": "Lyft", "tier": "FAANG", "active": True,
        "interviewStyle": "Geospatial pricing algorithms, routing optimization, microservice reliability, and real-time streaming."
    },
    {
        "name": "DoorDash", "tier": "FAANG", "active": True,
        "interviewStyle": "Logistics dispatch optimization, graph algorithms, high-throughput delivery state machines, and operational scale."
    },
    {
        "name": "Pinterest", "tier": "FAANG", "active": True,
        "interviewStyle": "Visual search pipelines, graph databases, distributed storage, and recommendation systems."
    },
    {
        "name": "Snap", "tier": "FAANG", "active": True,
        "interviewStyle": "Camera/AR pipelines, ultra-high-throughput ephemeral messaging, low-latency streaming, and client-side optimization."
    },
    {
        "name": "Twitter / X", "tier": "FAANG", "active": True,
        "interviewStyle": "Global event fan-out, high-throughput pub/sub architectures, real-time caching, and lean infrastructure."
    },
    {
        "name": "Spotify", "tier": "FAANG", "active": True,
        "interviewStyle": "Audio streaming codecs, event-driven microservices, music recommendation engines, and agile squad culture."
    },
    {
        "name": "LinkedIn", "tier": "FAANG", "active": True,
        "interviewStyle": "Economic graph modeling, Kafka-centric real-time pipelines, member search indexing, and distributed caching."
    },
    {
        "name": "Adobe", "tier": "FAANG", "active": True,
        "interviewStyle": "Creative cloud desktop/web architectures, WebAssembly graphics engines, document processing, and cloud services."
    },
    {
        "name": "Salesforce", "tier": "FAANG", "active": True,
        "interviewStyle": "Multi-tenant SaaS architecture, concurrency, enterprise scalability, and system integration."
    },
    {
        "name": "Oracle", "tier": "FAANG", "active": True,
        "interviewStyle": "Database storage engine internals, distributed transaction consensus, B+ tree indexing, and cloud infrastructure."
    },
    {
        "name": "Cisco", "tier": "FAANG", "active": True,
        "interviewStyle": "Network protocol internals (TCP/IP, BGP), distributed routing software, packet processing, and enterprise networking."
    },
    {
        "name": "IBM", "tier": "FAANG", "active": True,
        "interviewStyle": "Hybrid cloud architecture, enterprise mainframe integration, quantum computing foundations, and Red Hat ecosystem."
    },
    {
        "name": "VMware", "tier": "FAANG", "active": True,
        "interviewStyle": "Virtualization hypervisors, software-defined networking, container orchestration, and distributed storage."
    },
    {
        "name": "Dell Technologies", "tier": "FAANG", "active": True,
        "interviewStyle": "Enterprise storage architecture, server virtualization, hybrid cloud platforms, and firmware resilience."
    },
    {
        "name": "HP Inc", "tier": "FAANG", "active": True,
        "interviewStyle": "Embedded systems, firmware architecture, print/imaging cloud pipelines, and endpoint security."
    },
    {
        "name": "ServiceNow", "tier": "FAANG", "active": True,
        "interviewStyle": "High-scale enterprise workflow engines, relational metadata architectures, and PaaS platform design."
    },
    {
        "name": "Workday", "tier": "FAANG", "active": True,
        "interviewStyle": "In-memory database architecture, enterprise HR/finance multi-tenancy, and distributed business logic."
    },
    {
        "name": "Intuit", "tier": "FAANG", "active": True,
        "interviewStyle": "Financial tax calculation engines, fraud detection pipelines, microservices modularity, and customer obsession."
    },
    {
        "name": "eBay", "tier": "FAANG", "active": True,
        "interviewStyle": "High-volume distributed marketplace auctions, search indexing, multi-datacenter replication, and checkout resiliency."
    },
    {
        "name": "PayPal", "tier": "fintech", "active": True,
        "interviewStyle": "Fraud risk modeling, two-phase financial transactions, payment gateway isolation, and high availability."
    },
    {
        "name": "Shopify", "tier": "FAANG", "active": True,
        "interviewStyle": "Large-scale Ruby/Rails & Go commerce engines, flash sale scaling (Black Friday), and modular monolith design."
    },
    {
        "name": "Booking.com", "tier": "FAANG", "active": True,
        "interviewStyle": "High-concurrency travel reservation engines, extensive A/B testing infrastructure, and low-latency search."
    },

    # ── 2. AI & Frontier Tech / GenAI / LLM (25) ────────────────────────────
    {
        "name": "OpenAI", "tier": "ai", "active": True,
        "interviewStyle": "Distributed model training infrastructure, CUDA/kernel optimizations, transformer scaling laws, RLHF, and safety evaluations."
    },
    {
        "name": "Anthropic", "tier": "ai", "active": True,
        "interviewStyle": "Model alignment, constitutional AI, steerability benchmarks, safety evaluations, and scalable research engineering."
    },
    {
        "name": "Google DeepMind", "tier": "ai", "active": True,
        "interviewStyle": "Reinforcement learning architectures, frontier multimodal research, neural algorithmic reasoning, and scalable training."
    },
    {
        "name": "Cohere", "tier": "ai", "active": True,
        "interviewStyle": "Enterprise LLM architectures, multilingual embeddings, RAG indexing, semantic search, and fine-tuning pipelines."
    },
    {
        "name": "Mistral AI", "tier": "ai", "active": True,
        "interviewStyle": "Sparse mixture-of-experts (MoE) architectures, efficient inference kernels, open-weights optimization, and lean engineering."
    },
    {
        "name": "Perplexity AI", "tier": "ai", "active": True,
        "interviewStyle": "Real-time search index ranking, RAG synthesis pipelines, citation grounding, and sub-second answer streaming."
    },
    {
        "name": "Scale AI", "tier": "ai", "active": True,
        "interviewStyle": "RLHF data annotation pipelines, synthetic data generation, multimodal dataset curation, and enterprise AI validation."
    },
    {
        "name": "Hugging Face", "tier": "ai", "active": True,
        "interviewStyle": "Open-source ecosystem, PyTorch internals, community-first engineering, model registries, and Transformers library."
    },
    {
        "name": "Midjourney", "tier": "ai", "active": True,
        "interviewStyle": "Diffusion model pipelines, latent space sampling, GPU cluster orchestration, and high-throughput image synthesis."
    },
    {
        "name": "Cursor (Anysphere)", "tier": "ai", "active": True,
        "interviewStyle": "Context-aware code completion models, AST tree manipulation, repo-level RAG indexing, and low-latency IDE streaming."
    },
    {
        "name": "Together AI", "tier": "ai", "active": True,
        "interviewStyle": "Distributed inference acceleration, FlashAttention kernel optimizations, cloud GPU virtualization, and open-source models."
    },
    {
        "name": "Groq", "tier": "ai", "active": True,
        "interviewStyle": "LPU inference engine architecture, compiler tensor scheduling, deterministic SRAM execution, and ultra-high-token streaming."
    },
    {
        "name": "xAI", "tier": "ai", "active": True,
        "interviewStyle": "Frontier LLM training on planetary clusters (Colossus), prompt caching, distributed tensor parallelism, and reasoning models."
    },
    {
        "name": "Jasper AI", "tier": "ai", "active": True,
        "interviewStyle": "Marketing content generation pipelines, enterprise prompt engineering, brand voice fine-tuning, and multimodal workflows."
    },
    {
        "name": "Runway", "tier": "ai", "active": True,
        "interviewStyle": "Generative video diffusion models, temporal consistency architectures, frame interpolation, and GPU rendering pipelines."
    },
    {
        "name": "ElevenLabs", "tier": "ai", "active": True,
        "interviewStyle": "Text-to-speech acoustic modeling, voice cloning neural architectures, real-time audio streaming, and voice safety."
    },
    {
        "name": "Character.ai", "tier": "ai", "active": True,
        "interviewStyle": "High-throughput conversational LLM serving, long-term memory state machines, persona prompting, and low-latency inference."
    },
    {
        "name": "Glean", "tier": "ai", "active": True,
        "interviewStyle": "Enterprise search knowledge graphs, semantic permissions indexing, cross-tool connectors, and secure workplace LLM assistants."
    },
    {
        "name": "Adept AI", "tier": "ai", "active": True,
        "interviewStyle": "Action-taking foundation models, web browser automation agents, multimodal computer control, and workflow execution."
    },
    {
        "name": "Harvey AI", "tier": "ai", "active": True,
        "interviewStyle": "Legal domain model specialization, contract analysis RAG systems, compliance verification, and hallucination reduction."
    },
    {
        "name": "Weights & Biases", "tier": "ai", "active": True,
        "interviewStyle": "ML experiment tracking pipelines, model registry versioning, hyperparameter optimization, and MLOps tooling."
    },
    {
        "name": "Pinecone", "tier": "ai", "active": True,
        "interviewStyle": "Serverless vector indexing, approximate nearest neighbor (ANN) search, metadata filtering, and low-latency RAG retrieval."
    },
    {
        "name": "LangChain", "tier": "ai", "active": True,
        "interviewStyle": "Agent orchestration frameworks, tool calling chains, context window memory buffers, and multi-agent systems."
    },
    {
        "name": "Weaviate", "tier": "ai", "active": True,
        "interviewStyle": "Hybrid vector/keyword search, modular vectorizers, GraphQL querying, and cloud-native vector database storage."
    },
    {
        "name": "Qdrant", "tier": "ai", "active": True,
        "interviewStyle": "Rust-based vector search engine, payload-based filtering, HNSW graph indexing, and memory-efficient quantization."
    },

    # ── 3. Data & Analytics / Modern Data Stack (25) ────────────────────────
    {
        "name": "Snowflake", "tier": "analytics-data", "active": True,
        "interviewStyle": "Cloud data warehouse separation of storage & compute, micro-partitioning, SQL query compilation, and ACID concurrency."
    },
    {
        "name": "Databricks", "tier": "analytics-data", "active": True,
        "interviewStyle": "Lakehouse architecture (Delta Lake), Apache Spark distributed compute internals, MLflow integration, and Unity Catalog."
    },
    {
        "name": "Palantir Technologies", "tier": "analytics-data", "active": True,
        "interviewStyle": "Ontology data modeling, high-security data integration pipelines (Foundry/Gotham), and decision-making platforms."
    },
    {
        "name": "Splunk", "tier": "analytics-data", "active": True,
        "interviewStyle": "High-volume machine data ingestion, inverted index time-series storage, search processing language (SPL), and log analytics."
    },
    {
        "name": "Datadog", "tier": "analytics-data", "active": True,
        "interviewStyle": "High-cardinality metrics ingestion, distributed APM tracing, real-time log pipelines, and agent architecture."
    },
    {
        "name": "MongoDB", "tier": "analytics-data", "active": True,
        "interviewStyle": "Document data modeling, distributed replica sets, WiredTiger storage engine internals, and horizontal sharding."
    },
    {
        "name": "Elastic", "tier": "analytics-data", "active": True,
        "interviewStyle": "Distributed Lucene search indexing, inverted index algorithms, Elasticsearch cluster sharding, and real-time aggregations."
    },
    {
        "name": "Confluent", "tier": "analytics-data", "active": True,
        "interviewStyle": "Apache Kafka distributed log broker internals, partition consensus (KRaft), schema registries, and stream processing (Flink)."
    },
    {
        "name": "ClickHouse", "tier": "analytics-data", "active": True,
        "interviewStyle": "Columnar storage engine, vectorized query execution, real-time analytical aggregations, and high-throughput ingestion."
    },
    {
        "name": "dbt Labs", "tier": "analytics-data", "active": True,
        "interviewStyle": "Analytics engineering workflows, SQL DAG compilation, incremental data modeling, and data warehouse testing."
    },
    {
        "name": "Alteryx", "tier": "analytics-data", "active": True,
        "interviewStyle": "Self-service data analytics workflows, spatial and predictive data transformations, and automated ETL pipelines."
    },
    {
        "name": "Tableau", "tier": "analytics-data", "active": True,
        "interviewStyle": "Data visualization calculation engines, VizQL query language translation, and high-performance in-memory extracts."
    },
    {
        "name": "Teradata", "tier": "analytics-data", "active": True,
        "interviewStyle": "Massively parallel processing (MPP) relational architectures, enterprise data warehousing, and advanced query optimization."
    },
    {
        "name": "SingleStore", "tier": "analytics-data", "active": True,
        "interviewStyle": "Distributed hybrid transactional/analytical processing (HTAP), in-memory rowstores, and columnar disk tables."
    },
    {
        "name": "CockroachDB", "tier": "analytics-data", "active": True,
        "interviewStyle": "Distributed SQL consistency (Raft consensus), Multi-Raft range splitting, serializable isolation, and global survivability."
    },
    {
        "name": "Starburst Data", "tier": "analytics-data", "active": True,
        "interviewStyle": "Trino/Presto distributed SQL query engine, federated cross-data source querying, and pushdown optimizations."
    },
    {
        "name": "Dynatrace", "tier": "analytics-data", "active": True,
        "interviewStyle": "Full-stack observability, AI-driven root cause analysis, automated bytecode instrumentation, and cloud monitoring."
    },
    {
        "name": "New Relic", "tier": "analytics-data", "active": True,
        "interviewStyle": "Telemetry data platform, eBPF-based system tracing, distributed transaction tracing, and query visualization."
    },
    {
        "name": "Grafana Labs", "tier": "analytics-data", "active": True,
        "interviewStyle": "Time-series dashboarding, Prometheus querying (PromQL), Loki log aggregation, and open observability ecosystems."
    },
    {
        "name": "Mixpanel", "tier": "analytics-data", "active": True,
        "interviewStyle": "Event-driven product analytics, user funnel retention queries, high-cardinality cohort analysis, and columnar storage."
    },
    {
        "name": "Amplitude", "tier": "analytics-data", "active": True,
        "interviewStyle": "Behavioral analytics graph engines, cohort segmentation, experimentation frameworks, and event pipeline processing."
    },
    {
        "name": "PostHog", "tier": "analytics-data", "active": True,
        "interviewStyle": "Open-source product analytics, session recording data pipelines, feature flagging architecture, and self-hosted telemetry."
    },
    {
        "name": "Segment", "tier": "analytics-data", "active": True,
        "interviewStyle": "Customer data platform (CDP) event collection, real-time identity resolution, and webhook delivery pipelines."
    },
    {
        "name": "Fivetran", "tier": "analytics-data", "active": True,
        "interviewStyle": "Automated ELT data pipelines, database change data capture (CDC), schema drift handling, and idempotent syncs."
    },
    {
        "name": "Airbyte", "tier": "analytics-data", "active": True,
        "interviewStyle": "Open-source data integration connectors, protocol specification, containerized sync runners, and stream buffering."
    },

    # ── 4. Fintech, Payments & Banking (24) ──────────────────────────────────
    {
        "name": "Stripe", "tier": "fintech", "active": True,
        "interviewStyle": "API elegance, bug squash live debugging, webhook reliability, idempotency, and rigorous engineering craft."
    },
    {
        "name": "Plaid", "tier": "fintech", "active": True,
        "interviewStyle": "Bank API integration protocols, financial account aggregation, OAuth tokens, and credential security."
    },
    {
        "name": "Robinhood", "tier": "fintech", "active": True,
        "interviewStyle": "Real-time options/equity order routing, clearinghouse state machines, market data streaming, and trade execution."
    },
    {
        "name": "Block (Square)", "tier": "fintech", "active": True,
        "interviewStyle": "Point-of-sale offline transactions, merchant settlement ledgers, Cash App P2P transfers, and modular microservices."
    },
    {
        "name": "Brex", "tier": "fintech", "active": True,
        "interviewStyle": "Corporate card ledger architecture, real-time underwriting algorithms, expense management workflows, and high availability."
    },
    {
        "name": "Ramp", "tier": "fintech", "active": True,
        "interviewStyle": "Real-time spend control rules, automated receipt parsing, multi-currency corporate banking, and fast product iteration."
    },
    {
        "name": "Coinbase", "tier": "fintech", "active": True,
        "interviewStyle": "Cryptocurrency hot/cold wallet security, blockchain node synchronization, matching engine architectures, and MPC custody."
    },
    {
        "name": "Revolut", "tier": "fintech", "active": True,
        "interviewStyle": "Multi-currency FX transaction engines, international payment routing, neobank banking security, and reactive microservices."
    },
    {
        "name": "Klarna", "tier": "fintech", "active": True,
        "interviewStyle": "Buy-Now-Pay-Later (BNPL) credit risk assessment, checkout payment integrations, and merchant reconciliation."
    },
    {
        "name": "Adyen", "tier": "fintech", "active": True,
        "interviewStyle": "End-to-end global acquiring payment gateways, direct scheme connections (Visa/MC), and automated payment routing."
    },
    {
        "name": "Chime", "tier": "fintech", "active": True,
        "interviewStyle": "Consumer banking microservices, direct deposit early access processing, and fraud detection algorithms."
    },
    {
        "name": "Affirm", "tier": "fintech", "active": True,
        "interviewStyle": "Point-of-sale installment credit underwriting, loan servicing ledgers, and distributed risk scoring."
    },
    {
        "name": "Razorpay", "tier": "fintech", "active": True,
        "interviewStyle": "Payment switch reliability, two-phase commit transaction processing, webhook delivery, and zero downtime."
    },
    {
        "name": "Zerodha", "tier": "fintech", "active": True,
        "interviewStyle": "Extreme minimalism, low-latency Go/Python, PostgreSQL optimizations, and zero-bloat architecture."
    },
    {
        "name": "Groww", "tier": "fintech", "active": True,
        "interviewStyle": "Trading systems, financial order matching, concurrency, and high-frequency data pipelines."
    },
    {
        "name": "CRED", "tier": "fintech", "active": True,
        "interviewStyle": "High-throughput financial ledger, clean code architecture, reactive programming, and system craft."
    },
    {
        "name": "PhonePe", "tier": "fintech", "active": True,
        "interviewStyle": "UPI switch scalability, distributed caching, idempotency, and fault-tolerant financial transactions."
    },
    {
        "name": "Paytm", "tier": "fintech", "active": True,
        "interviewStyle": "QR payment processing, high-volume wallet ledgers, soundbox IoT messaging, and merchant settlements."
    },
    {
        "name": "BharatPe", "tier": "fintech", "active": True,
        "interviewStyle": "Merchant QR transaction aggregations, merchant lending risk assessment, and low-cost payment switches."
    },
    {
        "name": "Jupiter Money", "tier": "fintech", "active": True,
        "interviewStyle": "Neobanking digital banking layers, banking partner integrations, financial insights, and clean mobile UX."
    },
    {
        "name": "Navi", "tier": "fintech", "active": True,
        "interviewStyle": "Automated digital lending algorithms, insurance underwriting microservices, and instant credit approval pipelines."
    },
    {
        "name": "Pine Labs", "tier": "fintech", "active": True,
        "interviewStyle": "Omnichannel merchant POS terminal protocols, gift card payment switches, and multi-acquirer transaction routing."
    },
    {
        "name": "BillDesk", "tier": "fintech", "active": True,
        "interviewStyle": "High-volume bill payment aggregations (BBPS), payment gateway settlement, and banking network protocols."
    },
    {
        "name": "CoinDCX", "tier": "fintech", "active": True,
        "interviewStyle": "Crypto exchange order matching, liquidity aggregation, wallet security architectures, and regulatory compliance."
    },

    # ── 5. Quantitative & High Frequency Trading (12) ────────────────────────
    {
        "name": "Jane Street", "tier": "hft", "active": True,
        "interviewStyle": "Ultra-low-latency algorithms, mathematical logic, concurrency, functional paradigms (OCaml), and edge-case precision."
    },
    {
        "name": "Citadel Securities", "tier": "hft", "active": True,
        "interviewStyle": "Nanosecond order execution, market microstructure modeling, FPGA hardware acceleration, and kernel bypass networking."
    },
    {
        "name": "Jump Trading", "tier": "hft", "active": True,
        "interviewStyle": "Ultra-low-latency C++, automated liquidity provisioning, high-frequency network protocols, and distributed backtesting."
    },
    {
        "name": "Tower Research", "tier": "hft", "active": True,
        "interviewStyle": "Low-latency C++, lock-free queues, cache-friendly data structures, and memory-mapped IO."
    },
    {
        "name": "Hudson River Trading (HRT)", "tier": "hft", "active": True,
        "interviewStyle": "Algorithmic execution strategies, massive parallel backtesting, high-throughput financial data pipelines, and C++ mastery."
    },
    {
        "name": "Two Sigma", "tier": "hft", "active": True,
        "interviewStyle": "Quantitative machine learning, massive distributed financial data storage, statistical arbitrage, and Python/C++ scale."
    },
    {
        "name": "D.E. Shaw", "tier": "hft", "active": True,
        "interviewStyle": "Systematic quantitative trading algorithms, rigorous mathematical modeling, robust distributed architectures, and Python/C++."
    },
    {
        "name": "Optiver", "tier": "hft", "active": True,
        "interviewStyle": "Market maker pricing models, automated option hedging, ultra-low latency exchange gateways, and deterministic C++."
    },
    {
        "name": "DRW", "tier": "hft", "active": True,
        "interviewStyle": "Multilateral asset class trading systems, low-latency messaging fabrics, real-time risk calculations, and C++ systems."
    },
    {
        "name": "IMC Trading", "tier": "hft", "active": True,
        "interviewStyle": "High-frequency market making, FPGA hardware acceleration, automated execution algorithms, and clean C++ architectures."
    },
    {
        "name": "Akuna Capital", "tier": "hft", "active": True,
        "interviewStyle": "Derivatives options trading systems, low-latency trading engines, Python research toolkits, and C++ performance."
    },
    {
        "name": "Millennium Management", "tier": "hft", "active": True,
        "interviewStyle": "Multi-manager hedge fund platforms, quantitative risk aggregation, portfolio analytics, and high-throughput data."
    },

    # ── 6. Indian Product Unicorns & High-Growth Startups (30) ───────────────
    {
        "name": "Swiggy", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Hyperlocal dispatch, real-time routing algorithms, surge pricing architecture, and resilient order state machines."
    },
    {
        "name": "Zomato", "tier": "top-indian-product", "active": True,
        "interviewStyle": "High peak traffic scalability (NYE spikes), event-driven microservices, restaurant discovery search, and fast execution."
    },
    {
        "name": "Flipkart", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Machine coding rounds, low-level design (LLD) with clean design patterns, and Big Billion Day scale HLD."
    },
    {
        "name": "Meesho", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Tier-2/3 e-commerce optimization, high-scale social seller networks, discovery feed personalization, and lean infrastructure."
    },
    {
        "name": "Zepto", "tier": "top-indian-product", "active": True,
        "interviewStyle": "10-minute quick commerce dark store inventory routing, real-time picker dispatch, and sub-second order allocation."
    },
    {
        "name": "Blinkit", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Quick commerce warehouse fulfillment, localized stock optimization, delivery fleet routing, and high concurrency."
    },
    {
        "name": "Ola", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Geospatial cab matching algorithms, dynamic surge pricing, driver allocation state machines, and EV telemetry."
    },
    {
        "name": "InMobi", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Ad tech bidding engines (RTB), high-throughput auction state machines, user audience graph, and sub-50ms latency."
    },
    {
        "name": "Postman", "tier": "top-indian-product", "active": True,
        "interviewStyle": "API client platform architecture, collaborative workspace synchronization, collections schema parsing, and protocol tooling."
    },
    {
        "name": "Hasura", "tier": "top-indian-product", "active": True,
        "interviewStyle": "GraphQL engine internals, automated SQL compilation, real-time subscriptions over WebSockets, and metadata engines."
    },
    {
        "name": "BrowserStack", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Real-device cloud virtualization, low-latency remote video streaming, browser automation, and Selenium/Appium grids."
    },
    {
        "name": "Freshworks", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Multi-tenant customer engagement SaaS, CRM data pipelines, messaging bots, and scalable AWS cloud infrastructure."
    },
    {
        "name": "Zoho", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Full-stack enterprise application suite, custom database storage layers, private cloud infrastructure, and zero-debt architecture."
    },
    {
        "name": "Delhivery", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Supply chain route optimization, package automated sorting algorithms, logistics hubs, and geospatial tracking."
    },
    {
        "name": "Urban Company", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Service partner matching algorithms, dynamic booking slots scheduling, quality evaluation systems, and marketplace UX."
    },
    {
        "name": "Nykaa", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Beauty/fashion e-commerce platform, flash sale inventory locking, catalog recommendations, and omnichannel retail tech."
    },
    {
        "name": "PolicyBazaar", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Insurance policy comparison engines, insurer API integrations, dynamic premium calculators, and lead management."
    },
    {
        "name": "Cars24", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Used car pricing evaluation algorithms, inspection report parsing, auction bidding engines, and logistics tracking."
    },
    {
        "name": "Dream11", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Fantasy sports match day concurrency (millions of concurrent users), leaderboard updates, and wallet settlements."
    },
    {
        "name": "Gameskraft", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Real-time card game engines, multiplayer WebSocket synchronization, anti-fraud algorithms, and fair play audits."
    },
    {
        "name": "ShareChat", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Vernacular content discovery feeds, high-throughput video processing, recommendation algorithms, and live audio chatrooms."
    },
    {
        "name": "Apna", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Hyperlocal job marketplace algorithms, candidate-employer matching, community chat feeds, and high-scale onboarding."
    },
    {
        "name": "Udaan", "tier": "top-indian-product", "active": True,
        "interviewStyle": "B2B e-commerce trade networks, credit financing ledgers, bulk logistics routing, and catalog discovery."
    },
    {
        "name": "Darwinbox", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Enterprise HR tech workflows, payroll calculation engines, employee life-cycle management, and multi-tenant security."
    },
    {
        "name": "Lenskart", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Omnichannel eyewear retail tech, 3D face scan virtual try-on, automated inventory replenishment, and ERP pipelines."
    },
    {
        "name": "Unacademy", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Live video streaming classroom architectures, real-time educator-student chat, interactive polls, and test engines."
    },
    {
        "name": "PhysicsWallah", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Low-cost high-volume educational streaming platforms, community doubt resolution, and lecture caching."
    },
    {
        "name": "Khatabook", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Digital merchant bookkeeping, offline-first syncing, SMS notifications, and micro-merchant credit solutions."
    },
    {
        "name": "Classplus", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Creator-first education infrastructure, customized mobile apps, secure video DRM streaming, and student analytics."
    },
    {
        "name": "Slice", "tier": "top-indian-product", "active": True,
        "interviewStyle": "Challenger payment card credit engines, cashback reward ledgers, UPI integration, and instant consumer onboarding."
    },

    # ── 7. Cloud, DevOps & Developer Tools (20) ──────────────────────────────
    {
        "name": "Cloudflare", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Edge serverless computing (Workers), global Anycast DNS, DDoS mitigation algorithms, and Rust network proxies."
    },
    {
        "name": "HashiCorp", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Infrastructure-as-Code state machines (Terraform), cluster scheduler consensus (Consul/Nomad), and secret management (Vault)."
    },
    {
        "name": "Twilio", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Telephony carrier integrations, WebRTC audio/video signaling, SMS delivery routing, and high-availability messaging."
    },
    {
        "name": "Fastly", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Edge cloud computing, Varnish configuration language (VCL), real-time cache purging, and WebAssembly runtime."
    },
    {
        "name": "Akamai", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Global content delivery network (CDN), edge security inspection, DNS traffic management, and media streaming."
    },
    {
        "name": "GitLab", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Complete DevOps lifecycle platforms, CI/CD pipeline orchestration, Git repository management, and Ruby/Go architectures."
    },
    {
        "name": "GitHub", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Git storage internals, large-scale code search indexing, GitHub Actions runner orchestration, and platform resilience."
    },
    {
        "name": "Vercel", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Next.js edge runtime, serverless build & deployment pipelines, global CDN routing, and developer experience."
    },
    {
        "name": "Supabase", "tier": "saas-cloud", "active": True,
        "interviewStyle": "PostgreSQL extensions (pgvector/realtime), auto-generated REST/GraphQL APIs, auth identity, and open-source infrastructure."
    },
    {
        "name": "Neon", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Serverless Postgres architecture, separation of storage and compute, instant copy-on-write database branching, and page servers."
    },
    {
        "name": "DigitalOcean", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Developer-friendly cloud hypervisors, simple droplet provisioning, managed databases, and clean developer APIs."
    },
    {
        "name": "Pulumi", "tier": "saas-cloud", "active": True,
        "interviewStyle": "General-purpose programming language IaC compilers, cloud resource graph state tracking, and multi-cloud providers."
    },
    {
        "name": "Docker", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Linux container cgroups & namespaces, container image layered storage, buildkit engines, and desktop tooling."
    },
    {
        "name": "Sentry", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Application error capture SDKs, crash report symbolication, high-volume event ingestion, and real-time alert dispatching."
    },
    {
        "name": "Temporal", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Durable execution workflows, state replay event sourcing, distributed orchestrators, and failure-tolerant business logic."
    },
    {
        "name": "DataStax", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Apache Cassandra distributed storage engines, vector search integration, multi-cloud scalability, and high write throughput."
    },
    {
        "name": "Redis", "tier": "saas-cloud", "active": True,
        "interviewStyle": "In-memory key-value data structures, single-threaded event loops, Redis Cluster sharding, and persistence mechanisms."
    },
    {
        "name": "Kong", "tier": "saas-cloud", "active": True,
        "interviewStyle": "API gateway architectures, high-performance Nginx/Lua/Go plugin engines, service mesh routing, and rate limiting."
    },
    {
        "name": "Figma", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Collaborative canvas WebAssembly rendering, real-time multiplayer CRDT synchronization, and web vector graphics."
    },
    {
        "name": "Canva", "tier": "saas-cloud", "active": True,
        "interviewStyle": "Web-based design editors, template rendering pipelines, collaborative document editing, and multi-asset asset management."
    },

    # ── 8. Cybersecurity & Cloud Defense (12) ────────────────────────────────
    {
        "name": "Palo Alto Networks", "tier": "security", "active": True,
        "interviewStyle": "Next-gen firewall packet inspection, zero trust network architecture (SASE), threat intelligence, and Cortex XDR."
    },
    {
        "name": "CrowdStrike", "tier": "security", "active": True,
        "interviewStyle": "Kernel-level endpoint telemetry sensors (Falcon), threat graph event processing, cloud-native detection, and incident response."
    },
    {
        "name": "Zscaler", "tier": "security", "active": True,
        "interviewStyle": "Cloud security exchange proxies, secure internet access (ZIA), zero trust private access (ZPA), and SSL decryption at scale."
    },
    {
        "name": "Fortinet", "tier": "security", "active": True,
        "interviewStyle": "Security processing unit (ASIC) hardware acceleration, SD-WAN fabrics, unified threat management, and network telemetry."
    },
    {
        "name": "SentinelOne", "tier": "security", "active": True,
        "interviewStyle": "Autonomous AI endpoint detection & response (EDR), behavioral AI detection, story line event graph, and automated remediation."
    },
    {
        "name": "Okta", "tier": "security", "active": True,
        "interviewStyle": "Identity access management (IAM), OAuth2/OIDC protocol flows, universal directory synchronization, and MFA infrastructure."
    },
    {
        "name": "CyberArk", "tier": "security", "active": True,
        "interviewStyle": "Privileged access management (PAM), credential vault encryption, session recording proxies, and identity security."
    },
    {
        "name": "Snyk", "tier": "security", "active": True,
        "interviewStyle": "Developer-first software supply chain security, open-source vulnerability scanning, SAST/DAST analyzers, and container auditing."
    },
    {
        "name": "Wiz", "tier": "security", "active": True,
        "interviewStyle": "Agentless cloud security posture management (CSPM), multi-cloud IAM risk analysis, and full-stack cloud risk graphs."
    },
    {
        "name": "Rapid7", "tier": "security", "active": True,
        "interviewStyle": "Vulnerability management engines (InsightVM), SIEM log analytics, penetration testing tooling (Metasploit), and threat response."
    },
    {
        "name": "Qualys", "tier": "security", "active": True,
        "interviewStyle": "Continuous cloud security scanning, vulnerability detection signatures, asset inventory graphs, and compliance tracking."
    },
    {
        "name": "Check Point", "tier": "security", "active": True,
        "interviewStyle": "Network security gateways, threat prevention engines, sandboxing analysis, and enterprise perimeter defenses."
    },

    # ── 9. Gaming & Metaverses (12) ──────────────────────────────────────────
    {
        "name": "Epic Games", "tier": "gaming", "active": True,
        "interviewStyle": "Unreal Engine C++ architecture, Nanite/Lumen graphics rendering, Fortnite multiplayer netcode, and Epic Games Store."
    },
    {
        "name": "Unity", "tier": "gaming", "active": True,
        "interviewStyle": "Unity game engine internals, C# scripting runtimes, cross-platform compilation, rendering pipelines, and monetization SDKs."
    },
    {
        "name": "Electronic Arts (EA)", "tier": "gaming", "active": True,
        "interviewStyle": "Frostbite engine systems, sports simulation physics (FIFA/Madden), multiplayer matchmaking, and online live services."
    },
    {
        "name": "Activision Blizzard", "tier": "gaming", "active": True,
        "interviewStyle": "High-tickrate Call of Duty netcode, Battle.net distributed services, anti-cheat detection, and large-scale game servers."
    },
    {
        "name": "Riot Games", "tier": "gaming", "active": True,
        "interviewStyle": "League of Legends determinism, client-server tick simulation, Valorant Vanguard anti-cheat, and global game routing."
    },
    {
        "name": "Ubisoft", "tier": "gaming", "active": True,
        "interviewStyle": "Open-world rendering streaming, AI behavioral trees, procedural generation, and Anvil engine architectures."
    },
    {
        "name": "Take-Two (Rockstar Games)", "tier": "gaming", "active": True,
        "interviewStyle": "RAGE game engine, open-world physics simulation, complex NPC interaction AI, and GTA Online server scaling."
    },
    {
        "name": "Sony PlayStation", "tier": "gaming", "active": True,
        "interviewStyle": "PlayStation console SDK architecture, low-level graphics APIs, network services (PSN), and first-party game tech."
    },
    {
        "name": "Nintendo", "tier": "gaming", "active": True,
        "interviewStyle": "Hardware-constrained optimization, game mechanic design craft, custom OS networking, and responsive player controls."
    },
    {
        "name": "Valve", "tier": "gaming", "active": True,
        "interviewStyle": "Source 2 game engine, Steam distributed content delivery, Dota 2/CS2 server netcode, and anti-cheat (VAC)."
    },
    {
        "name": "Roblox", "tier": "gaming", "active": True,
        "interviewStyle": "User-generated content (UGC) cloud physics, Lua scripting sandboxes, planetary multiplayer worlds, and avatar engines."
    },
    {
        "name": "Krafton", "tier": "gaming", "active": True,
        "interviewStyle": "Battle royale server spatial partitioning, mobile Unreal Engine optimization, anti-cheat, and high-concurrency matches."
    },

    # ── 10. Hardware, Silicon & Systems (12) ─────────────────────────────────
    {
        "name": "NVIDIA", "tier": "hardware", "active": True,
        "interviewStyle": "CUDA programming model, GPU streaming multiprocessor architecture, TensorRT inference compilers, and NVLink interconnects."
    },
    {
        "name": "AMD", "tier": "hardware", "active": True,
        "interviewStyle": "Zen CPU microarchitecture, RDNA/CDNA graphics architectures, ROCm open software ecosystem, and chiplet interconnects."
    },
    {
        "name": "Intel", "tier": "hardware", "active": True,
        "interviewStyle": "x86 architecture extensions, compiler vector optimizations (AVX-512), oneAPI, semiconductor fabrication, and server silicon."
    },
    {
        "name": "Qualcomm", "tier": "hardware", "active": True,
        "interviewStyle": "Snapdragon SoC architectures, ARM instruction sets, 5G baseband modem firmware, and mobile DSP/NPU acceleration."
    },
    {
        "name": "ARM", "tier": "hardware", "active": True,
        "interviewStyle": "RISC processor architecture design, instruction set architectures (ISA), low-power mobile cores, and system IP."
    },
    {
        "name": "Broadcom", "tier": "hardware", "active": True,
        "interviewStyle": "Switch silicon ASIC architectures (Tomahawk), high-bandwidth network adapters, optical PHYs, and enterprise drivers."
    },
    {
        "name": "Texas Instruments", "tier": "hardware", "active": True,
        "interviewStyle": "Analog signal processing, embedded microcontroller firmware (MSP430), power management ICs, and RTOS."
    },
    {
        "name": "Micron Technology", "tier": "hardware", "active": True,
        "interviewStyle": "DRAM/NAND flash memory controllers, high-bandwidth memory (HBM3e), memory tiering, and storage endurance."
    },
    {
        "name": "ASML", "tier": "hardware", "active": True,
        "interviewStyle": "Extreme Ultraviolet (EUV) lithography systems, precision optical control, high-throughput metrology, and nanoscale alignment."
    },
    {
        "name": "Synopsys", "tier": "hardware", "active": True,
        "interviewStyle": "Electronic design automation (EDA) logic synthesis, timing closure algorithms, silicon IP verification, and physical design."
    },
    {
        "name": "Cadence Design Systems", "tier": "hardware", "active": True,
        "interviewStyle": "Custom IC design simulation, digital place & route algorithms, PCB simulation, and hardware emulation."
    },
    {
        "name": "Western Digital", "tier": "hardware", "active": True,
        "interviewStyle": "Solid-state drive (SSD) controller firmware, flash translation layers (FTL), NVMe protocol drivers, and reliability."
    },

    # ── 11. IT Consulting & Enterprise Transformation Services (14) ──────────
    {
        "name": "TCS", "tier": "indian-service", "active": True,
        "interviewStyle": "Core programming fundamentals, OOPS concepts, enterprise Java/Spring Boot, SQL queries, and global delivery frameworks."
    },
    {
        "name": "Infosys", "tier": "indian-service", "active": True,
        "interviewStyle": "Full-stack web architectures, Spring Boot microservices, database normalization, cloud migration, and delivery mindset."
    },
    {
        "name": "Accenture", "tier": "indian-service", "active": True,
        "interviewStyle": "Cloud architecture (AWS/Azure/GCP), enterprise SAP/Salesforce integrations, client consulting scenarios, and agile delivery."
    },
    {
        "name": "Wipro", "tier": "indian-service", "active": True,
        "interviewStyle": "Enterprise software testing, cloud infrastructure management, Java/J2EE enterprise applications, and modern IT ops."
    },
    {
        "name": "HCLTech", "tier": "indian-service", "active": True,
        "interviewStyle": "Infrastructure management services, engineering R&D software, cybersecurity operations, and digital workplace solutions."
    },
    {
        "name": "Cognizant", "tier": "indian-service", "active": True,
        "interviewStyle": "Healthcare and financial enterprise systems, full-stack microservices, cloud transformation, and automated QA."
    },
    {
        "name": "Capgemini", "tier": "indian-service", "active": True,
        "interviewStyle": "Enterprise digital transformation, microservices modernization, DevOps automation, and engineering services."
    },
    {
        "name": "LTIMindtree", "tier": "indian-service", "active": True,
        "interviewStyle": "Data analytics engineering, cloud platform migration, enterprise web solutions, and agile software craftsmanship."
    },
    {
        "name": "Persistent Systems", "tier": "indian-service", "active": True,
        "interviewStyle": "Digital product engineering, healthcare and life sciences cloud systems, and modern software architecture."
    },
    {
        "name": "Hexaware Technologies", "tier": "indian-service", "active": True,
        "interviewStyle": "Automated cloud migration (Amaze), enterprise ERP consulting, full-stack testing, and digital solutions."
    },
    {
        "name": "Mphasis", "tier": "indian-service", "active": True,
        "interviewStyle": "Banking & capital markets architecture, cloud-first application development, and cognitive automation systems."
    },
    {
        "name": "Thoughtworks", "tier": "indian-service", "active": True,
        "interviewStyle": "Extreme Programming (XP), Test-Driven Development (TDD), Evolutionary Architecture, microservices, and pair programming."
    },
    {
        "name": "EPAM Systems", "tier": "indian-service", "active": True,
        "interviewStyle": "Custom digital platform engineering, complex software architecture, cloud advisory, and high-quality engineering."
    },
    {
        "name": "Nagarro", "tier": "indian-service", "active": True,
        "interviewStyle": "Fluidic enterprise architecture, modern web and mobile application development, cloud engineering, and design thinking."
    },
]


# ─── Company Cultural Principles & Values ───────────────────────────────────

COMPANY_CULTURAL_PRINCIPLES = {
    "Amazon": [
        "Customer Obsession", "Ownership", "Bias for Action", 
        "Frugality", "Earn Trust", "Deliver Results", "Deep Dive"
    ],
    "Google": [
        "Scalability & Innovation", "Respect the User", "Googlyness",
        "Collaborative Problem Solving", "Technical Rigor"
    ],
    "Meta": [
        "Move Fast", "Focus on Long-Term Impact", "Build Awesome Things",
        "Live in the Future", "Be Direct and Respectful"
    ],
    "Netflix": [
        "Judgment & Selflessness", "Freedom & Responsibility", 
        "Context Not Control", "High Performance", "Informed Risk Taking"
    ],
    "Stripe": [
        "Macro-Ambition", "Extreme Technical Rigor", "Users First",
        "Operate with Efficiency", "Curious & Self-Improving"
    ],
    "Apple": [
        "Deep Craft & Simplicity", "Privacy by Design", "Collaboration",
        "Attention to Detail", "End-to-End Ownership"
    ],
    "Microsoft": [
        "Growth Mindset", "Customer Empathy", "Inclusivity",
        "Platform Thinking", "Ethical AI & Responsibility"
    ],
    "OpenAI": [
        "Mission Alignment", "Empirical Rigor", "Thoughtful Speed",
        "Safety & Responsibility", "Technical Audacity"
    ],
    "Anthropic": [
        "Honesty & Humility", "Constitutional AI", "Long-Horizon Safety",
        "Scientific Inquiry", "Collaborative Discovery"
    ],
    "Databricks": [
        "Data-Driven Decisions", "Customer Obsession", "Open Source Spirit",
        "First-Principles Problem Solving", "One Team"
    ],
    "Snowflake": [
        "Put Customers First", "Get It Done", "Integrity Always",
        "Think Big", "Be an Owner"
    ],
    "Palantir Technologies": [
        "Excellence Over Ego", "Solving Hard Problems", "Mission-First",
        "Intellectual Honesty", "High Agency"
    ],
    "NVIDIA": [
        "Intellectual Honesty", "Innovation & Craft", "Speed & Agility",
        "One Team", "Extreme Excellence"
    ],
    "Uber": [
        "Go Get It", "Trip Obsessed", "Build with Heart",
        "Stand for Safety", "Do the Right Thing"
    ],
    "Airbnb": [
        "Champion the Mission", "Be a Host", "Embrace the Adventure",
        "Be a Cereal Entrepreneur", "Simplify"
    ],
    "Coinbase": [
        "Clear Communication", "Positive Energy", "Continuous Learning",
        "Customer Focus", "High Execution Bar"
    ],
    "Swiggy": [
        "Consumer Comes First", "Always Be Curious", "Stand on Shoulders of Giants",
        "Bias for Action", "Think Win-Win"
    ],
    "Zomato": [
        "Founder's Mindset", "High Velocity", "Customer Love",
        "Continuous Betterment", "Integrity & Resilience"
    ],
    "Flipkart": [
        "Audacity", "Bias for Action", "Customer First",
        "Ownership", "Respect & Openness"
    ],
    "Razorpay": [
        "Integrity Above All", "Transparency", "Customer Obsession",
        "Bias for Action", "High Agency"
    ],
    "CRED": [
        "Excellence as Default", "High Taste & Design Craft", "Trust First",
        "Zero Entitlement", "Deep Ownership"
    ],
    "Zerodha": [
        "Extreme Minimalism", "No Jargon / First-Principles Thinking",
        "Simplicity Over Complexity", "Financial Prudence"
    ],
    "Jane Street": [
        "Intellectual Humility", "Rigorous Quantitative Logic", "Open Collaboration",
        "Direct Candor", "Risk Consciousness"
    ],
    "Citadel Securities": [
        "Winning Culture", "Uncompromising Standards", "Meritocracy",
        "Scientific Inquiry", "Urgency & Focus"
    ],
    "Thoughtworks": [
        "Cultivate Diversity", "Advocate Social Justice", "High Software Craftsmanship",
        "Courageous Communication", "Integrity"
    ],
    "TCS": [
        "Leading by Example", "Integrity", "Respect for the Individual",
        "Excellence", "Responsibility"
    ],
    "Infosys": [
        "Client Value", "Leadership by Example", "Integrity & Transparency",
        "Fairness", "Excellence"
    ],
    "Default": [
        "Clear Problem Decomposition", "STAR Behavioral Structure",
        "Edge-Case Ownership", "Collaborative Communication"
    ]
}


# ─── Interview Modes & Configurations ────────────────────────────────────────

INTERVIEW_MODES = {
    "quick_drill": {
        "id": "quick_drill",
        "label": "Quick Drill",
        "tag": "⚡ Fast Track (~10 mins)",
        "description": "3–4 targeted high-impact questions for rapid warmup and immediate feedback.",
        "default_questions": 4,
    },
    "full_mock": {
        "id": "full_mock",
        "label": "Full Realistic Mock",
        "tag": "🎯 End-to-End (~25 mins)",
        "description": "6–7 comprehensive rounds tailored to your target company and resume.",
        "default_questions": 6,
    },
    "topic_drill": {
        "id": "topic_drill",
        "label": "Topic Focus Drill",
        "tag": "🧠 Deep Dive",
        "description": "Intensive practice on a specific domain (DSA Coding, System Design, or Behavioral).",
        "default_questions": 4,
    },
}

TOPIC_FOCUS_OPTIONS = [
    {"id": "dsa", "label": "DSA & Problem Solving", "desc": "Algorithms, data structures, complexity & live coding"},
    {"id": "system_design", "label": "System Design (HLD & LLD)", "desc": "Scalability, microservices, databases & trade-offs"},
    {"id": "behavioral", "label": "Behavioral & Leadership", "desc": "STAR methodology, conflict resolution & culture fit"},
    {"id": "resume_deep_dive", "label": "Resume Project Grilling", "desc": "Deep technical defense of your past projects and stack"},
]


# ─── Backward-Compatibility Aliases ─────────────────────────────────────────
# Empty stubs so legacy imports in any unmigrated files do not crash.
TECHNICAL_CHALLENGE_BANKS = {}
TECH_FUNDAMENTALS_BY_CATEGORY = {}
SYSTEM_DESIGNS_BY_CATEGORY = {}
COMPANY_DESIGN_SCENARIOS = {}
PHASE_2_TOPICS = {}
PHASE_3_NAMES = {}
PHASE_5_NAMES = {}
PHASE_5_FOCUS = {}