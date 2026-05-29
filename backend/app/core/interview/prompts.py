import random
from typing import Optional

from app.core.interview.constants import (
    LEETCODE_BHANDARA,
    COMPANY_PROFILES,
    get_role_category,
    ML_CASE_STUDIES,
    INFRA_SCENARIOS,
    SECURITY_SCENARIOS,
    PRODUCT_CASES,
    GAMING_CHALLENGES,
    SPECIALIZED_CHALLENGES
)


def _build_interview_system_prompt(
    role: str,
    company: str,
    company_style: str,
    company_tier: str,
    interview_type: str = "technical",
    resume_summary: str | None = None
) -> str:
    target_company_lower = company.lower()
    category = get_role_category(role)
    
    # ── Difficulty Logic ───────────────────────────────────────────────
    tier = (company_tier or "other").lower()
    if tier in ["faang", "hft"]:
        difficulty_level = "HARD"
    elif tier in ["top-indian-product", "fintech", "mid-product"]:
        difficulty_level = "MEDIUM"
    else:
        difficulty_level = "EASY"

    # Select 1 random problem from the category bank for this difficulty
    PROBLEM_BANKS = {
        "swe": LEETCODE_BHANDARA,
        "data_ai": ML_CASE_STUDIES,
        "infra_cloud": INFRA_SCENARIOS,
        "security": SECURITY_SCENARIOS,
        "product_design": PRODUCT_CASES,
        "gaming": GAMING_CHALLENGES,
        "specialized": SPECIALIZED_CHALLENGES
    }
    bank = PROBLEM_BANKS.get(category, LEETCODE_BHANDARA)
    p1 = random.choice(bank[difficulty_level])

    # ── Persona Logic ──────────────────────────────────────────────────
    TECHNICAL_PERSONAS = [
        "a FAANG Senior Staff Engineer who values scalability and deep technical mastery",
        "a rigorous system architect who focuses on trade-offs and edge cases",
        "a startup CTO who cares about speed, clean code, and solving real-world bugs"
    ]
    BEHAVIORAL_PERSONAS = [
        "an empathetic Hiring Manager who looks for leadership potential and EQ",
        "a culture-focused director who values collaboration, mentorship, and values-alignment",
        "a professional HRBP who evaluates communication, conflict resolution, and growth mindset"
    ]
    
    interviewer_persona = random.choice(TECHNICAL_PERSONAS if interview_type == "technical" else BEHAVIORAL_PERSONAS)

    # ── Random Focus Topics (By Category for variety) ──────────────────
    TECH_FUNDAMENTALS_BY_CATEGORY = {
        "swe": [
            "Operating Systems (OS) - memory management (stack vs heap, garbage collection internals, virtual memory)",
            "Operating Systems (OS) - concurrency models (threads, event loops, process synchronization, deadlocks, locks, race conditions)",
            "Database Management Systems (DBMS) - database indexing strategies (B-Trees, LSM Trees, hash indexes) and query planning",
            "Database Management Systems (DBMS) - database transaction isolation levels (ACID properties, dirty reads, phantom reads, serializability)",
            "Computer Networks (CN) - network protocols (HTTP/1.1 vs HTTP/2 vs HTTP/3, gRPC, WebSocket overhead, TCP vs UDP flow control)",
            "Computer Networks (CN) - network routing, DNS resolution, and security essentials (SSL/TLS handshakes, hashing vs encryption)"
        ],
        "data_ai": [
            "Machine Learning theory (bias-variance tradeoff, overfitting vs underfitting, regularization L1/L2, gradient descent optimization)",
            "Statistical methods (hypothesis testing, A/B testing design, statistical significance, p-values, confidence intervals)",
            "Deep Learning architectures (Transformer self-attention mechanism, multi-head attention, feed-forward layers, backpropagation gradient issues)",
            "Model Evaluation metrics (precision, recall, F1-score, ROC-AUC, confusion matrix, precision-recall tradeoff in classification)",
            "Data Pipeline & Engineering (handling missing data, feature scaling, encoding categorical variables, mitigating high class imbalance)",
            "Generative AI & LLMs (RAG architecture, vector embeddings similarity search, PEFT/LoRA fine-tuning parameters, decoding strategies)"
        ],
        "infra_cloud": [
            "Container Orchestration (Kubernetes pod lifecycle, controllers, service routing, Ingress, scheduling, autoscaling)",
            "Continuous Integration & Continuous Deployment (CI/CD pipeline stages, cache optimization, rollback strategies, secret management)",
            "Infrastructure as Code (Terraform workspace organization, remote state locking, modules, resource dependencies, providers)",
            "Networking in Cloud (VPC peering, Load Balancing algorithms, DNS resolution, CDN caching, SSL/TLS termination, HTTP routing)",
            "Observability & Monitoring (metrics scraping with Prometheus, dashboards in Grafana, log aggregation, tracing, alert thresholds)",
            "High Availability & Disaster Recovery (Active-Active vs Active-Passive setups, database replication delay, failover mechanisms, SLA)"
        ],
        "security": [
            "Application Security vulnerabilities (OWASP Top 10, SQL injection prevention, XSS remediation, CSRF protections)",
            "Network Security essentials (Firewalls, WAF rules, IDS/IPS, network segmentation, zero trust network access)",
            "Cryptography (symmetric vs asymmetric encryption, key exchange protocols like Diffie-Hellman, digital signatures, hashing algorithms)",
            "Threat Modeling methodologies (STRIDE framework, identifying entry points, mapping trust boundaries, mitigation plans)",
            "Identity & Access Management (OAuth2 flow with PKCE, OpenID Connect, JWT validation, role-based access control, session security)",
            "Incident Response & Forensics (containment procedures, system isolation, log analysis, vulnerability scanning, root cause analysis)"
        ],
        "product_design": [
            "Metrics prioritization (activation, retention, LTV, North Star metric selection, product-market fit metrics)",
            "User research & design (qualitative vs quantitative testing, usability feedback loops, user persona design, accessibility WCAG)",
            "Product execution & roadmapping (RICE prioritization framework, MoSCoW prioritization, MVP feature scoping)",
            "Growth & Monetization strategy (freemium vs premium tiers, ad monetization models, user acquisition channels, referral programs)",
            "A/B Testing & Product Experiments (hypothesis definition, MDE estimation, statistical significance, variant rollout strategies)",
            "User Journey Design (onboarding funnel optimizations, drop-off diagnostics, customer lifecycle mapping)"
        ],
        "gaming": [
            "Game Loop Architecture (frame rate independence, delta time, fixed update loops, rendering interpolation)",
            "Character State Management (Finite State Machine design, hierarchical state machines, transition conditions, animator controllers)",
            "Collision Detection & Physics (AABB collision logic, sphere-sphere checks, trigger volumes, rigid body physics, spatial hashing)",
            "Graphics Rendering Pipelines (Forward vs Deferred rendering, G-buffer structure, shader stages, draw call optimizations)",
            "Multiplayer Netcode (client-side prediction, server reconciliation, entity interpolation, lag compensation, state sync)",
            "Memory & GC Optimization (object pooling strategies, avoiding runtime allocations, struct vs class usage, heap fragmentation)"
        ],
        "specialized": [
            "Test Automation & Quality Assurance (test pyramid, Page Object Model design, flaky test mitigation, mock objects)",
            "Embedded Systems & IoT (lightweight protocols like MQTT/CoAP, power management, interrupt-driven firmware, DMA transfer)",
            "Blockchain & Web3 (Solidity smart contract security, reentrancy prevention, mempool gas auctions, gas optimization)",
            "Robotics & Control Systems (sensor fusion Kalman filters, ROS node communication, path planning, control loops PID)",
            "Solutions Architecture (system integration, multi-tenant SaaS isolation, high availability, regulatory compliance)",
            "Research & Experimentation (literature review, performance evaluation, baseline comparison, mathematical formulation)"
        ]
    }
    
    NON_TECH_FUNDAMENTALS = [
        "metrics prioritization (activation, retention, LTV, North Star metric selection)",
        "user research methodology (qualitative vs quantitative, usability testing, persona design)",
        "product execution and roadmap trade-offs (MoSCoW method, RICE scoring framework)",
        "design system consistency and accessibility standards (WCAG guidelines, contrast, responsive grids)",
        "stakeholder alignment and conflict resolution during feature scoping",
        "analytical problem-solving (market sizing, product launch GTM strategy, pricing models)"
    ]

    fundamental_focus = random.choice(
        TECH_FUNDAMENTALS_BY_CATEGORY.get(category, TECH_FUNDAMENTALS_BY_CATEGORY["swe"])
        if interview_type == "technical" else NON_TECH_FUNDAMENTALS
    )

    # ── Random System Design Scenarios (By Category/Company for Variety) ───────
    COMPANY_DESIGN_SCENARIOS = {
        "google": [
            "Google Search Crawler & Indexing system at web scale",
            "Google Docs real-time collaborative document editor",
            "Google Maps location sharing & real-time ETA routing service",
            "Google Translate batch processing and streaming translation pipeline"
        ],
        "netflix": [
            "Netflix Video CDN and streaming delivery network",
            "Netflix real-time personalized recommendation & home feed generation",
            "Netflix video transcoding & encoding workflow queue",
            "Netflix subscriber billing and active subscription management system"
        ],
        "amazon": [
            "Amazon e-commerce flash sale inventory management system handling 100k requests/sec",
            "Amazon product recommendation system based on user shopping carts",
            "Amazon prime delivery logistics tracker and route optimization switch",
            "Amazon seller dashboard analytics and real-time sales reporting ledger"
        ],
        "meta": [
            "Facebook social graph and friend recommendation search",
            "Instagram real-time activity feed and story delivery pipeline",
            "WhatsApp secure group chat messaging with offline sync",
            "Meta Ads auction and real-time impression analytics"
        ],
        "uber": [
            "Uber ride dispatch matching and geospatial vehicle tracker",
            "Uber Eats food delivery order matching and surge pricing calculator",
            "Uber driver payment settlement and transaction reconciliation ledger",
            "Uber pool carpooling routing and fare optimizer"
        ],
        "microsoft": [
            "Teams real-time video conferencing signal server",
            "OneDrive cloud storage folder synchronization system",
            "Xbox cloud gaming session scheduler and matchmaking queue",
            "Azure load balancer and health check monitor"
        ],
        "openai": [
            "ChatGPT real-time streaming chat completions serving infrastructure",
            "OpenAI LLM fine-tuning job scheduler and GPU cluster allocator",
            "DALL-E image generation image store and CDN caching layer",
            "API usage rate-limiter and billing aggregator for developers"
        ]
    }
    
    SYSTEM_DESIGNS_BY_CATEGORY = {
        "swe": [
            "a high-concurrency movie ticket booking platform (similar to BookMyShow)",
            "a distributed rate-limiting service protecting public APIs",
            "a URL shortening service (like Bitly) with detailed click analytics",
            "a collaborative kanban board (like Trello) with instant updates"
        ],
        "data_ai": [
            "a real-time recommendation feed for a short-video platform (like TikTok)",
            "a fraud detection pipeline processing 50k transactions/sec with sub-50ms latency",
            "an enterprise search and Retrieval-Augmented Generation (RAG) assistant indexing 10M documents",
            "an automated image moderation and classification service for a social media platform"
        ],
        "infra_cloud": [
            "a zero-downtime blue-green deployment orchestrator for 500 microservices",
            "a highly available multi-region Kubernetes routing and service mesh architecture",
            "a centralized telemetry, monitoring and alerting system for high-throughput distributed systems",
            "a secure, automated disaster recovery failover framework for a global banking database"
        ],
        "security": [
            "a zero-trust authentication and authorization gateway for an enterprise SaaS platform",
            "a secure web application firewall (WAF) rule distribution and logs collection architecture",
            "an automated security vulnerability scanner and patch deployment system for cloud infrastructure",
            "a secure, tamper-proof audit logging pipeline using cryptography or append-only ledgers"
        ],
        "product_design": [
            "a premium subscription tier model and onboarding flow for a music streaming app",
            "a dynamic, personalized explore page feed dashboard tailored to user interest retention",
            "a global expansion customer acquisition campaign and metrics framework for a neobanking app",
            "a collaborative design prototyping and review tool workspace layout"
        ],
        "gaming": [
            "a real-time multiplayer matchmaking server with latency-based ELO grouping",
            "a state synchronization and physics replication pipeline for a multiplayer battle royale game",
            "a graphics shader rendering asset load optimization strategy for a massive open-world game",
            "a client-side prediction and server reconciliation lag compensation mechanism"
        ],
        "specialized": [
            "a high-throughput IoT telemetry ingestion pipeline handling 100k smart meters",
            "a decentralized identity and credentials verification blockchain platform",
            "a test automation platform orchestrating thousands of parallel browser tests",
            "a real-time sensor fusion and obstacle avoidance system for a warehouse mobile robot"
        ]
    }

    company_name_clean = company.lower().strip()
    scenarios = None
    for key, val in COMPANY_DESIGN_SCENARIOS.items():
        if key in company_name_clean:
            scenarios = val
            break
            
    if scenarios:
        system_design_scenario = random.choice(scenarios)
    else:
        design_pool = SYSTEM_DESIGNS_BY_CATEGORY.get(category, SYSTEM_DESIGNS_BY_CATEGORY["swe"])
        system_design_scenario = f"a system design scenario related to {company}'s domain, specifically focusing on {random.choice(design_pool)}"

    # Generate a unique seed to prevent LLM caching/repetition
    seed_token = random.randint(1000, 9999)

    # ── Phase Naming & Details ────────────────────────────────────────
    phase_2_names = {
        "swe": "CS Fundamentals (Operating Systems [OS], Computer Networks [CN], or Database Management Systems [DBMS])",
        "data_ai": "ML/Stats Fundamentals (Machine Learning theory, statistics, or deep learning)",
        "infra_cloud": "Infrastructure Fundamentals (Containers, CI/CD, or cloud networking)",
        "security": "Security Fundamentals (AppSec, cryptography, or threat modeling)",
        "product_design": "Product/Design Fundamentals (Metrics, prioritization, or user research)",
        "gaming": "Game Dev Fundamentals (Game loops, physics, or rendering pipelines)",
        "specialized": "Domain-Specific Fundamentals (Testing, IoT, or blockchain)"
    }
    p2_name = phase_2_names.get(category, phase_2_names["swe"])

    if category == "swe":
        p3_desc = f"Phase 3: LeetCode Coding Challenge - {p1['title']}. Instructions: Introduce the problem {p1['description']}. Explicitly state that this is similar to the standard LeetCode problem. Ask the candidate to explain their approach and provide the code logic (focusing on {', '.join(p1['concepts'])} and complexity analysis)."
    else:
        challenge_names = {
            "data_ai": "ML Case Study / Coding Challenge",
            "infra_cloud": "Infrastructure Scenario Challenge",
            "security": "Threat/CTF Scenario Challenge",
            "product_design": "Product/Design Case Study",
            "gaming": "Game Dev Challenge (Optimization/Algorithm)",
            "specialized": "Domain-Specific Challenge"
        }
        ch_name = challenge_names.get(category, "Technical Case Study")
        p3_desc = f"Phase 3: {ch_name} - {p1['title']}. Instructions: Present the scenario: {p1['description']}. Ask the candidate to walk through their solution/logic, covering core concepts ({', '.join(p1['concepts'])}), key decisions, and potential optimization trade-offs."

    if category == "swe":
        p5_desc = f"Phase 5: System Design (Ask the candidate to design a scalable architecture: {system_design_scenario})."
    elif category == "data_ai":
        p5_desc = f"Phase 5: ML System Design (Ask the candidate to design an end-to-end Machine Learning system or pipeline: {system_design_scenario})."
    elif category == "infra_cloud":
        p5_desc = f"Phase 5: Cloud Architecture Design (Ask the candidate to design a highly available, secure cloud architecture: {system_design_scenario})."
    elif category == "security":
        p5_desc = f"Phase 5: Security Architecture (Ask the candidate to design a secure systems architecture or threat defense model: {system_design_scenario})."
    elif category == "product_design":
        p5_desc = f"Phase 5: Product Strategy & Growth (Ask the candidate to outline a product strategy or launch plan: {system_design_scenario})."
    elif category == "gaming":
        p5_desc = f"Phase 5: Game Architecture Design (Ask the candidate to design a scalable game systems architecture: {system_design_scenario})."
    else:
        p5_desc = f"Phase 5: Specialized Architecture Design (Ask the candidate to design a domain-specific architecture: {system_design_scenario})."

    # ── Mode-Specific Instructions ─────────────────────────────────────
    if interview_type == "technical":
        if category == "swe":
            mode_instructions = (
                "FOCUS: ONLY TECHNICAL ASSESSMENT.\n"
                "- Deep dive into Data Structures, Algorithms, and System Design (LLD/HLD).\n"
                "- Ask about code optimization, time/space complexity, and scalability.\n"
                "- IMPORTANT: When asking a coding challenge, EXPLICITLY state the standard LeetCode problem name or number (e.g., 'This problem is similar to LeetCode 1: Two Sum'). Do this so the candidate clearly understands the reference.\n"
                f"- Evaluate their ability to solve complex engineering problems for a {role}.\n"
                "- Discuss architecture, trade-offs, and company-specific tech stacks."
            )
        else:
            challenge_focus_text = {
                "data_ai": "ML modeling, statistics, data pipelines, model optimization, and evaluation metrics",
                "infra_cloud": "infrastructure design, container orchestration, CI/CD pipelines, and cloud security",
                "security": "vulnerability remediation, cryptography, threat modeling, and incident response",
                "product_design": "product sense, feature prioritization metrics, wireframing decisions, and growth strategy",
                "gaming": "game loop architecture, rendering pipelines, physics optimization, and netcode",
                "specialized": "domain-specific technologies, automation frameworks, blockchain consensus, or embedded limits"
            }.get(category, "core domain engineering principles")
            
            mode_instructions = (
                "FOCUS: ONLY TECHNICAL ASSESSMENT.\n"
                f"- Deep dive into technical concepts relevant to {role}, including {challenge_focus_text}.\n"
                "- Ask about practical scenario debugging, solution logic, and design trade-offs.\n"
                "- IMPORTANT: Present the challenge as a realistic domain-specific scenario. Ask the candidate to explain their methodology, architectural decisions, and performance considerations.\n"
                f"- Evaluate their ability to solve complex technical problems for a {role}.\n"
                "- Discuss system architecture, trade-offs, and company-specific tech stacks."
            )

        if resume_summary:
            flow_phases = (
                "Phase 1: Intro & Personalized Discovery (Welcome Candidate name, state that they are applying for target role, and identify key skills from resume. If candidate has professional technical experience like doing any internship (technical) or working at any company, ask what skills they learned through that experience and ask about their experience. Strictly do NOT consider non-professional student activities like college club member or campus ambassador as professional technical experience. If candidate has no professional experience, ask about skills and tools used in their projects instead).\n"
                f"Phase 2: {p2_name}. You MUST ask a question specifically on one of these core subjects: {fundamental_focus}.\n"
                f"{p3_desc}\n"
                "Phase 4: Project Deep-Dive (Identify exactly ONE strong project from candidate's resume, select exactly TWO specific achievements or bullet points from it, and ask candidate to explain the architecture, implementation details, and technical decisions behind those components).\n"
                f"{p5_desc}\n"
                f"Phase 6: Real-life Domain of the Company's Solution (Present a highly realistic, domain-specific business problem and technical solution scenario based on the actual business model, products, or operations of {company} – e.g. for Intel: semiconductor fab optimization, edge AI processing, hardware co-design, chip design automation; for FAANG: global scaling, sub-millisecond latency, distributed systems; for Fintech: transactions integrity, compliance, fraud engines. Ask the candidate how they would design a solution for this company-specific problem using their role's expertise, focusing on practical constraints and technical trade-offs).\n"
                "Phase 7: Closing - Do you have any questions for me?"
            )
        else:
            flow_phases = (
                "Phase 1: Intro & Tech Stack Discovery (Welcome candidate, state that they are applying for target role, and ask about the key tech stack/projects they have worked on).\n"
                f"Phase 2: {p2_name}. You MUST ask a question specifically on one of these core subjects: {fundamental_focus}.\n"
                f"{p3_desc}\n"
                "Phase 4: Project/Technical Deep-Dive (Ask the candidate to select a major technical project they worked on, describe the system architecture, and detail the technical decisions behind their key achievements).\n"
                f"{p5_desc}\n"
                f"Phase 6: Real-life Domain of the Company's Solution (Present a highly realistic, domain-specific business problem and technical solution scenario based on the actual business model, products, or operations of {company} – e.g. for Intel: semiconductor fab optimization, edge AI processing, hardware co-design, chip design automation; for FAANG: global scaling, sub-millisecond latency, distributed systems; for Fintech: transactions integrity, compliance, fraud engines. Ask the candidate how they would design a solution for this company-specific problem using their role's expertise, focusing on practical constraints and technical trade-offs).\n"
                "Phase 7: Closing - Do you have any questions for me?"
            )
    else:
        mode_instructions = (
            "FOCUS: ONLY HR & BEHAVIORAL ASSESSMENT.\n"
            "- DYNAMIC DIFFICULTY: If the candidate is a fresher or college student, ask VERY SIMPLE, standard HR questions (e.g., 'Why do you want to work here?', 'Where do you see yourself in 5 years?'). If they are experienced, ask complex situational and leadership questions.\n"
            "- Evaluate communication, confidence, teamwork, and culture fit.\n"
            "- Keep the interview conversational and human-like.\n"
            "- Use STAR-based follow-up questions only for experienced candidates."
        )

        BEHAVIORAL_SCENARIOS_TEAMWORK = [
            "a time you had a major disagreement with a teammate or manager and how you resolved it",
            "a time you had to work with a difficult coworker or handle a team conflict",
            "a time you helped a teammate succeed or mentored someone on your team"
        ]
        BEHAVIORAL_SCENARIOS_CHALLENGES = [
            "a time you failed, made a major mistake, or missed a deadline, and what you learned from it",
            "a time you had to deliver under extremely tight timelines or high pressure",
            "a time you took a calculated risk or made a decision without complete information"
        ]
        
        behavioral_teamwork = random.choice(BEHAVIORAL_SCENARIOS_TEAMWORK)
        behavioral_challenge = random.choice(BEHAVIORAL_SCENARIOS_CHALLENGES)

        flow_phases = (
            "Phase 1: Deep Introduction - Tell me About Yourself. Use this to determine if they are a fresher or experienced.\n"
            "Phase 2: Motivation - 'Why do you want to work here?' or 'Why are you interested in this role?'\n"
            f"Phase 3: Core Competency & Topic. You MUST ask a question specifically on: {fundamental_focus}.\n"
            f"Phase 4: Teamwork/Conflict. You MUST ask a question specifically about: {behavioral_teamwork}.\n"
            f"Phase 5: Challenges/Mistakes. You MUST ask a question specifically about: {behavioral_challenge}.\n"
            "Phase 6: offer and relocation - Salary expectations, relocation.\n"
            "Phase 7: Closing - Do you have any questions for me?."
        )

    resume_instruction = ""
    if interview_type == "technical" and resume_summary:
        resume_instruction = (
            f"\n\nCANDIDATE RESUME PROFILE & PROJECTS:\n"
            f"{resume_summary}\n\n"
            "INSTRUCTION: You must tailor the technical questions specifically to this candidate's resume, projects, experience, and background. "
            "Identify the candidate's current/target role and identify their key skills. "
            "Strictly filter their experience to distinguish professional/technical experience (like software engineering internships or full-time roles) from non-professional student/campus roles (such as campus ambassador, college club member, or class representative) - do NOT treat student activities/club memberships as professional technical experience. "
            "For project-related questions, identify exactly ONE strong project from their resume and select exactly TWO specific achievements/bullet points from it to ask about. "
            "Reference their specific details in your questions where relevant to make the mock interview feel highly realistic. "
            "Do not ask about skills they do not have unless exploring adjacent areas."
        )

    return (
        f"You are a Senior Interviewer at {company} conducting a {interview_type.upper()} mock interview for a {role} role.\n\n"
        f"YOUR PERSONA: You behave as {interviewer_persona}.\n\n"
        f"INTERVIEW MODE: {interview_type.upper()}\n"
        f"Tier/Category: {company_tier}\n"
        f"Difficulty: {difficulty_level}\n"
        f"Session Token: {seed_token}\n"
        f"INSTRUCTION: Ensure this session is fresh and highly customized. Ask unique, variant questions. Do not repeat typical template questions.\n\n"
        f"{mode_instructions}{resume_instruction}\n\n"
        "STRICT VOICE RULES:\n"
        "- No markdown, no bullet points, no emojis.\n"
        "- Ask EXACTLY ONE question at a time. Stop generating immediately after your question.\n"
        "- Keep responses concise (2-4 sentences max).\n"
        "- NEVER roleplay as the candidate. NEVER simulate a two-way dialogue.\n"
        "- Do NOT combine multiple phases. Ask the current phase's question and WAIT.\n\n"
        "ADAPTIVE QUESTIONING (INTELLIGENT RECURSION):\n"
        "- If the candidate gives a weak/wrong answer, ask a simpler follow-up or provide a gentle hint before moving on.\n"
        "- If the candidate gives a strong answer, dive deeper into constraints, edge cases, or optimization.\n\n"
        f"INTERVIEW FLOW:\n{flow_phases}\n\n"
        "Remember: You are the interviewer. First provide a brief, direct review/feedback (1-2 sentences) evaluating the candidate's previous response, then ask the NEXT question, and then STOP."
    )


def _build_feedback_system_prompt(role: str, company: str, interview_type: str = "technical") -> str:
    if interview_type == "technical":
        scoring_rubric = (
            "- 90-100: Exceptional. Flawless logic, optimal code, deep architectural understanding.\n"
            "- 75-89: Strong hire. Good problem-solving, but missed minor edge cases or optimizations.\n"
            "- 50-74: Needs improvement. Required heavy hinting, struggled with core concepts, or gave superficial answers.\n"
            "- 0-49: Reject. Failed to answer basic questions, completely wrong logic, or poor communication.\n"
        )
    else:
        scoring_rubric = (
            "- 90-100: Exceptional. Clear, structured STAR responses, high EQ, strong culture fit and leadership traits.\n"
            "- 75-89: Strong hire. Good answers, but lacked deep specific examples or stumbled slightly on conflict resolution.\n"
            "- 50-74: Needs improvement. Vague answers, struggled to articulate past experiences, or weak motivation.\n"
            "- 0-49: Reject. Poor attitude, red flags in teamwork/conflict, or failed to answer basic HR questions.\n"
        )

    return (
        f"You are an elite, highly critical Senior Hiring Manager at {company} evaluating a candidate's {interview_type.upper()} interview transcript for a {role} position.\n\n"
        "The interview has concluded. Your task is to provide a brutally honest, top-notch, and deeply analytical feedback report.\n\n"
        "SCORING RUBRIC (CRITICAL):\n"
        f"{scoring_rubric}"
        "**WARNING:** Do NOT give a generic 'good' score. You MUST aggressively deduct points for every incorrect, vague, or superficial answer, or if the interviewer had to provide hints/follow-ups to extract basic info.\n\n"
        "REQUIREMENTS:\n"
        "1. Start directly with: 'That concludes our interview today. Thank you for your time. Here is your detailed performance analysis...'\n"
        "2. Structure your feedback clearly using the following sections:\n"
        "   - **Executive Summary:** A brief 2-sentence verdict on their overall performance.\n"
        "   - **Strengths:** Specific moments where the candidate shined.\n"
        "   - **Areas of Improvement:** Explicit examples from the transcript where they answered incorrectly, vaguely, or failed to communicate clearly.\n"
        "   - **Actionable Advice:** What they need to study or practice before their next interview.\n"
        "3. Tone: Professional, highly constructive, and direct. Do not sugarcoat failures.\n"
        "4. At the very end of your response, on a new line, you MUST provide the final calculated score strictly in this exact format:\n"
        "OVERALL SCORE : [X]/100"
    )
