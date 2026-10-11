"""
Interview Prompts — Dynamic, context-aware prompt architecture for realistic mock interviews.
Tailors questions to candidate resume, company engineering culture, role seniority, and practice mode.
"""
from typing import Optional
from app.core.interview.constants import (
    COMPANY_CULTURAL_PRINCIPLES,
    get_role_category,
    INTERVIEW_MODES,
)


def get_company_domain_context(company: str, company_tier: str = "other", role: str = "Software Engineer") -> str:
    """Returns company-specific engineering challenges, architectures, and domain context."""
    c = (company or "").lower()

    if "google" in c:
        return "Google scale: distributed systems (Spanner/Bigtable), planetary edge caching, sub-millisecond search indexing, low P99 latency, and algorithmic efficiency."
    if "amazon" in c or "aws" in c:
        return "Amazon scale: high-availability microservices, DynamoDB partitioning, event-driven order processing, customer obsession trade-offs, and Bar Raiser standards."
    if "meta" in c or "facebook" in c:
        return "Meta scale: massive social graph traversal (TAO), real-time feed ranking, high-volume video streaming, and fast-paced pragmatic execution."
    if "apple" in c:
        return "Apple craft: memory and battery efficiency, privacy-by-design, clean APIs, hardware-software integration, and uncompromising reliability."
    if "netflix" in c:
        return "Netflix architecture: chaos engineering, resilient distributed microservices, Open Connect CDN edge caching, and high concurrency."
    if "uber" in c:
        return "Uber engineering: geospatial indexing (H3), real-time rider-driver matching dispatch algorithms, dynamic surge pricing, and event-driven architecture."
    if "stripe" in c:
        return "Stripe engineering: financial transaction idempotency, two-phase commits, webhook delivery retry mechanisms, zero-downtime database migrations, and API elegance."
    if "openai" in c:
        return "OpenAI research & infra: large-scale GPU cluster training, KV cache optimization, token generation latency, transformer inference acceleration, and model safety."
    if "anthropic" in c:
        return "Anthropic engineering: constitutional AI alignment, model steerability, safety evaluations, scalable training harnesses, and research engineering."
    if "zerodha" in c:
        return "Zerodha architecture: extreme minimalism, low-latency Go/Python microservices, PostgreSQL indexing, real-time market tick websockets, and zero-bloat systems."
    if "swiggy" in c or "zomato" in c:
        return "Hyperlocal delivery scale: real-time rider routing, surge traffic spikes (NYE/IPL), order state machines, geohashing, and live GPS tracking."
    if "flipkart" in c or "meesho" in c:
        return "E-commerce scale: flash sale flash traffic (Big Billion Day), distributed machine coding with clean design patterns, inventory locking, and cart checkout."
    if "razorpay" in c or "phonepe" in c or "paytm" in c:
        return "Fintech payment switch: UPI high-throughput processing, multi-bank gateway failover, sub-second latency, and ACID financial ledgers."
    if "cred" in c:
        return "CRED architecture: high-throughput financial ledgers, reactive microservices, clean code craft, and real-time reward state machines."
    if "snowflake" in c:
        return "Snowflake architecture: separation of storage and compute, micro-partitioning, vectorized query execution, and ACID concurrency."
    if "databricks" in c:
        return "Databricks architecture: Apache Spark distributed engine internals, Delta Lake transactions, MLflow, and scalable data lakehouses."
    if "palantir" in c:
        return "Palantir architecture: ontology graphs, secure data integration pipelines (Foundry), enterprise access controls, and mission-critical decision systems."
    if "cloudflare" in c or "fastly" in c:
        return "Edge cloud architecture: Anycast routing, edge serverless computing, DDoS mitigation, Rust network proxies, and sub-10ms global delivery."
    if "datadog" in c or "splunk" in c:
        return "Observability scale: high-cardinality metrics ingestion, distributed tracing (APM), real-time log parsing, and time-series indexing."
    if "mongodb" in c or "cockroach" in c:
        return "Database internals: distributed consensus (Raft), storage engine indexing (B+ trees / LSM trees), multi-region replication, and ACID isolation."
    if "confluent" in c:
        return "Confluent/Kafka internals: distributed commit logs, KRaft consensus, partition rebalancing, schema registries, and stream processing."
    if "jane street" in c or "citadel" in c or "jump" in c or "tower" in c or "hudson river" in c:
        return "Quantitative/HFT scale: nanosecond execution, lock-free queues, cache-friendly data structures, kernel-bypass networking, and deterministic performance."
    if "tcs" in c or "infosys" in c or "wipro" in c or "accenture" in c or "cognizant" in c or "hcl" in c:
        return "Enterprise consulting: core programming fundamentals (OOPS, Java/Spring Boot, SQL), database normalization, clean code, and client delivery."
    if "nvidia" in c or "amd" in c or "intel" in c or "qualcomm" in c:
        return "Silicon & Systems: CUDA / GPU architecture, memory bandwidth, hardware-software co-design, compiler optimizations, and firmware."
    if "epic games" in c or "unity" in c or "riot" in c or "activision" in c:
        return "Gaming & Graphics: real-time frame rates, client-server netcode synchronization, physics engines, anti-cheat, and asset streaming."

    # Tier-based fallback
    tier_lower = (company_tier or "").lower()
    if tier_lower == "ai":
        return f"{company} AI systems: frontier model serving, vector indexing, inference throughput, and GPU utilization."
    if tier_lower in ("fintech", "banking"):
        return f"{company} fintech systems: transactional consistency, ledger accuracy, fraud detection, and regulatory compliance."
    if tier_lower in ("analytics-data", "data"):
        return f"{company} data systems: distributed queries, stream processing, high-volume ingestion, and data lakehouse architectures."
    if tier_lower == "hft":
        return f"{company} low-latency systems: high-frequency algorithms, lock-free structures, and execution speed."
    if tier_lower in ("top-indian-product", "mid-product"):
        return f"{company} product scale: high concurrency, resilient microservices, clean API design, and rapid feature iteration."
    if tier_lower == "security":
        return f"{company} security systems: zero-trust network inspection, threat intelligence, vulnerability detection, and secure identity."
    if tier_lower in ("saas-cloud", "infra_cloud"):
        return f"{company} cloud infrastructure: multi-tenant architectures, container orchestration, high availability, and developer tooling."

    return f"{company} engineering standards: production scalability, architectural trade-offs, clean implementation, and operational resilience."


def get_interview_phase_spec(
    question_num: int,
    total_questions: int,
    mode: str = "full_mock",
    topic_focus: str = "",
    interview_type: str = "technical",
    role: str = "Software Engineer",
    company: str = "Company",
    role_level: str = "fresher",
) -> dict:
    """
    Returns the exact phase specification for question turn question_num.
    Guarantees a rigorous, logically sequenced flow from experience to fundamentals, coding, system design, and culture fit.
    """
    company_domain = get_company_domain_context(company, "", role)
    q_idx = max(1, min(question_num, total_questions))

    # ── A. Behavioral Focus Interview ───────────────────────────────────────
    if interview_type == "behavioral":
        phases = [
            {
                "phase_title": "Phase 1: Experience & Ownership Walkthrough",
                "phase_goal": f"Establish candidate's background and probe a major achievement or project they led.",
                "concept_guidance": "Ask for a 60-second summary of a complex project they owned and why it mattered.",
                "principle": "Ownership & Communication",
            },
            {
                "phase_title": "Phase 2: Delivering Under Ambiguity & Deadlines",
                "phase_goal": f"STAR-format question on navigating unclear requirements or high-pressure deadlines.",
                "concept_guidance": "Ask how they prioritized trade-offs when resources or time were constrained.",
                "principle": "Bias for Action & Resourcefulness",
            },
            {
                "phase_title": "Phase 3: Technical Conflict & Stakeholder Alignment",
                "phase_goal": "Evaluate how candidate resolves disagreements with peers, leads, or product managers.",
                "concept_guidance": "Ask about a time they strongly disagreed with a technical direction and how it was resolved.",
                "principle": "Earn Trust & Conflict Resolution",
            },
            {
                "phase_title": "Phase 4: Handling Failure, Production Outages & Accountability",
                "phase_goal": f"Probe extreme ownership and psychological safety after a critical mistake or bug.",
                "concept_guidance": "Ask about their hardest production failure or post-mortem and what systemic changes they made.",
                "principle": "Extreme Ownership & Resilience",
            },
            {
                "phase_title": "Phase 5: Technical Leadership & Mentorship",
                "phase_goal": f"Assess team lift, code quality stewardship, and engineering culture contribution.",
                "concept_guidance": "Ask how they raised the bar for code quality, architectural standards, or mentored junior engineers.",
                "principle": "Leadership & People Stewardship",
            },
            {
                "phase_title": f"Phase 6: Cultural Alignment with {company}",
                "phase_goal": f"Evaluate alignment with {company}'s signature cultural values.",
                "concept_guidance": f"Ask a situational question probing what attracts them to {company}'s engineering pace and principles.",
                "principle": f"{company} Cultural Alignment",
            },
        ]
        # Slice or pad to total_questions
        idx = min(q_idx - 1, len(phases) - 1)
        spec = phases[idx].copy()
        spec["company_context"] = company_domain
        return spec

    # ── B. Topic Drill Mode (4 Questions Focused on 1 Domain) ────────────────
    if mode == "topic_drill":
        tf = (topic_focus or "dsa").lower()
        if tf == "dsa":
            phases = [
                {
                    "phase_title": "Phase 1: Data Structures & Complexity Foundations",
                    "phase_goal": f"Test fundamental data structure selection and big-O analysis for {role}.",
                    "concept_guidance": "Ask about internal mechanics and amortized complexities of arrays, hash maps, heaps, or trees.",
                    "principle": "Data Structure Foundations",
                },
                {
                    "phase_title": "Phase 2: Algorithmic Strategy & Problem Solving",
                    "phase_goal": f"Present a concrete algorithmic challenge (Graph, Tree, Two-Pointers, or DP).",
                    "concept_guidance": "Ask how they decompose the problem and outline their approach before coding.",
                    "principle": "Algorithm Design",
                },
                {
                    "phase_title": "Phase 3: Space/Time Optimization & Memory Constraints",
                    "phase_goal": f"Push on optimizing space or time complexity under tight memory or streaming constraints.",
                    "concept_guidance": "Ask how they reduce auxiliary space or optimize the inner loop to sub-quadratic time.",
                    "principle": "Performance Optimization",
                },
                {
                    "phase_title": "Phase 4: Concurrency, Edge Cases & Scaled Implementation",
                    "phase_goal": f"Test concurrency safety, edge-case validation, and production application.",
                    "concept_guidance": f"Ask how this algorithm behaves under multi-threaded writes or huge dataset scales at {company}.",
                    "principle": "Production Edge Cases & Scale",
                },
            ]
        elif tf == "system_design":
            phases = [
                {
                    "phase_title": "Phase 1: Scope, Functional Requirements & Back-of-the-Envelope Estimation",
                    "phase_goal": f"Evaluate requirements clarification, traffic scale (QPS), and storage estimations.",
                    "concept_guidance": f"Present a system relevant to {company} and ask candidate to define functional scope and capacity needs.",
                    "principle": "Requirements & Capacity Planning",
                },
                {
                    "phase_title": "Phase 2: High-Level Architecture & Data Model Selection",
                    "phase_goal": f"Evaluate microservices breakdown, API design, and SQL vs NoSQL schema decisions.",
                    "concept_guidance": "Ask candidate to walk through the end-to-end request lifecycle and primary data models.",
                    "principle": "Architecture & Data Modeling",
                },
                {
                    "phase_title": "Phase 3: Scalability, Caching & Distributed Consensus",
                    "phase_goal": f"Probe horizontal sharding, caching strategies, replication, and CAP trade-offs.",
                    "concept_guidance": f"Ask how they partition data and handle cache stampedes or read/write hotspots at {company} scale.",
                    "principle": "Distributed Scalability",
                },
                {
                    "phase_title": "Phase 4: Fault Tolerance, Single Points of Failure & Observability",
                    "phase_goal": f"Test chaos resilience, circuit breakers, rate limiting, and observability.",
                    "concept_guidance": "Introduce an unexpected datacenter partition or downstream failure and ask how the system degrades.",
                    "principle": "Fault Tolerance & Resiliency",
                },
            ]
        elif tf == "behavioral":
            phases = [
                {
                    "phase_title": "Phase 1: Project Ownership & Accountability (STAR)",
                    "phase_goal": "Evaluate deep personal ownership over a high-stakes engineering initiative.",
                    "concept_guidance": "Ask about a project where they owned outcomes from conception to production delivery.",
                    "principle": "Ownership & Execution",
                },
                {
                    "phase_title": "Phase 2: Technical Disagreements & Collaboration",
                    "phase_goal": "Assess handling opposing architectural views and reaching consensus.",
                    "concept_guidance": "Ask about a time they disagreed on architecture and how they resolved it with data.",
                    "principle": "Earn Trust & Collaboration",
                },
                {
                    "phase_title": "Phase 3: Handling System Outages & Critical Failures",
                    "phase_goal": "Evaluate calm execution and blameless retrospective mindset under crisis.",
                    "concept_guidance": "Ask about an outage they caused or triaged and what preventative guardrails they instituted.",
                    "principle": "Resilience & Post-Mortem Rigor",
                },
                {
                    "phase_title": f"Phase 4: Core Cultural Alignment with {company}",
                    "phase_goal": f"Probe specific alignment with {company}'s operating philosophy and standards.",
                    "concept_guidance": f"Ask how their work habits and decision making embody {company}'s core principles.",
                    "principle": f"{company} Engineering Culture",
                },
            ]
        else:  # resume_deep_dive
            phases = [
                {
                    "phase_title": "Phase 1: Project Architecture & Tech Stack Rationale",
                    "phase_goal": "Drill into architectural decisions and why specific technologies were chosen in past work.",
                    "concept_guidance": "Ask candidate why they chose their primary framework/database over alternative industry standards.",
                    "principle": "Technical Decision Making",
                },
                {
                    "phase_title": "Phase 2: Hardest Bug & Performance Bottleneck",
                    "phase_goal": "Probe the candidate's deepest debugging war story and analytical methodology.",
                    "concept_guidance": "Ask candidate to describe the most elusive production bug or performance bottleneck they debugged.",
                    "principle": "Deep Debugging & Root Cause Analysis",
                },
                {
                    "phase_title": "Phase 3: Scalability, Database Schemas & Growth Challenges",
                    "phase_goal": "Examine database migrations, query optimizations, and traffic growth handling.",
                    "concept_guidance": "Ask how their past system handled data growth and where the first structural bottleneck appeared.",
                    "principle": "System Evolution & Database Scaling",
                },
                {
                    "phase_title": "Phase 4: Architectural Retrospective & Lessons Learned",
                    "phase_goal": "Assess self-awareness, technical maturity, and what they would re-engineer today.",
                    "concept_guidance": "Ask what architectural choice in that project they regret and how they would redesign it now.",
                    "principle": "Architectural Maturity & Retrospection",
                },
            ]
        idx = min(q_idx - 1, len(phases) - 1)
        spec = phases[idx].copy()
        spec["company_context"] = company_domain
        return spec

    # ── C. Quick Drill Mode (4 Questions Fast Track) ────────────────────────
    if mode == "quick_drill":
        phases = [
            {
                "phase_title": "Phase 1: Technical Background & Key Project Verification",
                "phase_goal": f"Quickly ground interview in candidate's strongest past technical contribution.",
                "concept_guidance": f"Ask for their primary technical strength and one significant project component they architected.",
                "principle": "Domain Verification",
            },
            {
                "phase_title": "Phase 2: Core Engineering Fundamentals & Trade-offs",
                "phase_goal": f"Rapid conceptual drill on foundational concepts for {role}.",
                "concept_guidance": "Ask a sharp conceptual question testing underlying mechanics and complexity trade-offs.",
                "principle": "Core Engineering Fundamentals",
            },
            {
                "phase_title": f"Phase 3: Company-Scale Engineering Challenge at {company}",
                "phase_goal": f"Present a targeted practical problem reflecting {company}'s real business domain.",
                "concept_guidance": f"Ask how they would architect a high-throughput component under {company}'s real-world constraints.",
                "principle": f"{company} Domain Problem Solving",
            },
            {
                "phase_title": "Phase 4: Production Resiliency & Operational Maturity",
                "phase_goal": f"Test how candidate handles failure recovery, monitoring, and engineering leadership.",
                "concept_guidance": "Ask how they ensure zero-downtime deployments or handle unexpected latency spikes.",
                "principle": "Operational Maturity & Reliability",
            },
        ]
        idx = min(q_idx - 1, len(phases) - 1)
        spec = phases[idx].copy()
        spec["company_context"] = company_domain
        return spec

    # ── D. Full Realistic Mock (6 Questions Comprehensive Flow) ─────────────
    phases = [
        {
            "phase_title": "Phase 1: Candidate Verification & Project Deep-Dive",
            "phase_goal": f"Examine candidate's verified background and probe a key project from their resume.",
            "concept_guidance": f"Welcome candidate in 1 warm sentence to {company}. Then ask about the architecture, key components, or hardest challenge in their most prominent project.",
            "principle": "Technical Ownership & Architecture",
        },
        {
            "phase_title": "Phase 2: Core CS & Domain Fundamentals Drill",
            "phase_goal": f"Deep conceptual drill on fundamental concepts required for {role} at {company}.",
            "concept_guidance": f"Ask a deep conceptual question testing under-the-hood mechanics (concurrency, memory models, indexing, network protocols, or ML math) - not trivial trivia.",
            "principle": "Computer Science Fundamentals",
        },
        {
            "phase_title": f"Phase 3: Applied Technical & Algorithmic Scenario ({company} Context)",
            "phase_goal": f"Present a concrete algorithmic or coding challenge reflecting {company}'s problem domain.",
            "concept_guidance": f"Ask candidate how they would design the algorithm or data structures to solve this problem with optimal time/space complexity.",
            "principle": "Algorithmic Problem Solving",
        },
        {
            "phase_title": f"Phase 4: High-Scale System Design & Architecture ({company} Scale)",
            "phase_goal": f"Present an architectural design scenario reflecting {company}'s real business challenges.",
            "concept_guidance": f"Ask candidate to architect the distributed components, data storage (SQL/NoSQL), caching, and communication protocols at scale.",
            "principle": "Scalable Systems Architecture",
        },
        {
            "phase_title": "Phase 5: Production Resiliency, Bottlenecks & Debugging",
            "phase_goal": f"Push on unexpected failure modes, cascading outages, hot partitions, or latency spikes.",
            "concept_guidance": "Introduce a severe production failure or 10x traffic spike to their design and ask how they diagnose and mitigate it.",
            "principle": "Fault Tolerance & Production Reliability",
        },
        {
            "phase_title": f"Phase 6: Engineering Leadership & Company Culture Fit",
            "phase_goal": f"Evaluate alignment with {company}'s core principles using a realistic situational scenario.",
            "concept_guidance": f"Ask a STAR-format situational question testing technical disagreement, post-mortem ownership, or cross-functional delivery.",
            "principle": f"{company} Cultural Alignment",
        },
    ]

    idx = min(q_idx - 1, len(phases) - 1)
    spec = phases[idx].copy()
    spec["company_context"] = company_domain
    return spec


def _get_phases_overview(
    total_questions: int,
    mode: str = "full_mock",
    topic_focus: str = "",
    interview_type: str = "technical",
    role: str = "Software Engineer",
    company: str = "Company",
    role_level: str = "fresher",
) -> str:
    """Generates the numbered phase overview for the system prompt."""
    lines = []
    for q in range(1, total_questions + 1):
        spec = get_interview_phase_spec(
            q, total_questions, mode=mode, topic_focus=topic_focus,
            interview_type=interview_type, role=role, company=company, role_level=role_level
        )
        lines.append(f"  - Turn {q}: {spec['phase_title']} [{spec['principle']}]")
    return "\n".join(lines)


def _build_interview_system_prompt(
    role: str,
    company: str,
    company_style: str = "",
    company_tier: str = "other",
    interview_type: str = "technical",
    resume_summary: Optional[str] = None,
    candidate_name: str = "Candidate",
    session_id: Optional[str] = None,
    role_level: str = "fresher",
    mode: str = "full_mock",
    topic_focus: str = "",
    total_questions: int = 10,
) -> str:
    """
    Builds the active conversational interviewer system prompt.
    Produces an elite, authentic interviewer persona grounded in candidate background and company standards.
    """
    category = get_role_category(role)

    # 1. Company Cultural & Technical Context
    principles = COMPANY_CULTURAL_PRINCIPLES.get(company, COMPANY_CULTURAL_PRINCIPLES.get("Default", []))
    principles_str = ", ".join(principles)
    company_domain_brief = get_company_domain_context(company, company_tier, role)

    # 2. Seniority & Difficulty Calibration
    tier = (company_tier or "other").lower()
    if tier in ["indian-service", "service"]:
        difficulty = "EASY" if role_level in ("intern", "fresher") else "MEDIUM"
    elif tier in ["faang", "hft", "top-indian-product", "fintech", "hardware", "gaming", "security", "ai", "analytics-data", "saas-cloud"]:
        difficulty = "HARD" if role_level == "senior" else "MEDIUM"
    else:
        difficulty = "MEDIUM" if role_level in ("mid", "senior") else "EASY"

    SENIORITY_GUIDELINES = {
        "intern": "Focus on computer science fundamentals, clear communication, curiosity, and code readability. Be encouraging and provide gentle hints if stuck.",
        "fresher": "Focus on core data structures, algorithms, foundational system components, and clean implementation. Test understanding of time/space complexity.",
        "mid": "Expect strong problem-solving independence, awareness of production trade-offs, edge-case anticipation, and clean API/modular design.",
        "senior": "Expect deep architectural mastery, distributed systems trade-offs, scalability bottlenecks, operational reliability, and technical leadership.",
    }
    level_guideline = SENIORITY_GUIDELINES.get(role_level, SENIORITY_GUIDELINES["fresher"])

    # Role Domain Keywords
    ROLE_TOPICS = {
        "swe": "- Focus Areas: LeetCode Coding Challenge, CS Fundamentals, System Design",
        "data_ai": "- Focus Areas: ML/Stats Fundamentals, ML Case Study / Coding Challenge, ML System Design",
        "gaming": "- Focus Areas: Game Dev Challenge, Game Dev Fundamentals, Game Architecture Design",
        "infra_cloud": "- Focus Areas: Infra/Cloud Fundamentals, Cloud/DevOps Challenge, Distributed Cloud Architecture",
        "security": "- Focus Areas: Security/OWASP Fundamentals, Penetration/Security Challenge, Secure Architecture Design",
        "product_design": "- Focus Areas: Product/UX Fundamentals, Product Strategy Challenge, Product System Design",
        "specialized": "- Focus Areas: Specialized Fundamentals, Specialized Engineering Challenge, Hardware/Embedded System Design",
    }
    role_topic_guidance = ROLE_TOPICS.get(category, ROLE_TOPICS["swe"])

    # 3. Resume Grounding Block
    resume_block = ""
    if resume_summary and resume_summary.strip():
        resume_block = (
            f"\n\nCANDIDATE'S VERIFIED RESUME BACKGROUND:\n"
            f"{resume_summary.strip()}\n"
            "INSTRUCTION: Actively ground your discussion in their listed tech stack and past projects where applicable."
        )

    # 4. Mode & Focus Guidelines
    mode_instructions = ""
    if mode == "quick_drill":
        mode_instructions = f"SESSION FORMAT: QUICK DRILL ({total_questions} questions total). Focus rapidly on high-signal core questions without lengthy pleasantries."
    elif mode == "topic_drill":
        focus_label = topic_focus.upper() if topic_focus else "FOCUSED DOMAIN"
        mode_instructions = f"SESSION FORMAT: TOPIC DRILL ({focus_label}). Spend the session drilling deeply into {focus_label} concepts, edge cases, and practical problems."
    else:
        mode_instructions = f"SESSION FORMAT: FULL REALISTIC MOCK ({total_questions} questions total). Deliver a balanced end-to-end interview simulation covering fundamentals, real-world application, system design/architecture, and practical problem solving."

    phases_roadmap = _get_phases_overview(
        total_questions, mode=mode, topic_focus=topic_focus,
        interview_type=interview_type, role=role, company=company, role_level=role_level
    )

    clean_candidate_name = candidate_name.strip() if candidate_name and candidate_name.strip().lower() not in ("administrator", "admin", "user", "root", "none") else "Candidate"

    return f"""\
You are an expert Senior Technical Interviewer and Engineering Leader conducting a realistic mock interview at {company} for a {role} position ({role_level.capitalize()} level).

INTERVIEW CONTEXT:
- Candidate: {clean_candidate_name}
- TARGET COMPANY: {company} (Culture & Principles: {principles_str})
- Tier/Category: {company_tier}
- Difficulty: {difficulty}
- COMPANY STYLE: {company_style or "High engineering standards, production trade-offs, and practical execution"}
- COMPANY DOMAIN REALITY: {company_domain_brief}
- Role Seniority: {role_level.upper()} ({level_guideline})
- Interview Type: {interview_type.upper()}
{role_topic_guidance}
- INTERVIEW FLOW ({total_questions} QUESTIONS TOTAL)
- {mode_instructions}

MANDATORY PHASE ROADMAP FOR THIS SESSION:
{phases_roadmap}
{resume_block}

CONVERSATIONAL RULES (CRITICAL):
1. CRISP SPOKEN BREVITY (PARAMOUNT FOR AUDIO VOICE):
   - Your response is converted to spoken audio via Text-to-Speech in real-time. Long speeches sound robotic and exhausting.
   - MAXIMUM LENGTH: Keep your ENTIRE turn under 35–45 words total (2 to 3 sentences maximum).
   - NEVER recite long project summaries, never give long lectures, and never ask multi-part compound questions.
   - Opening turn: 1 crisp welcoming sentence + 1 direct question strictly in Phase 1.
   - Later turns: 1 brief insightful reaction (1 sentence acknowledging their technical choice) + 1 direct targeted question for the current phase.
2. NATURAL ADDRESS: Address the candidate naturally as {clean_candidate_name}. Do NOT call them "Administrator" or "Admin".
3. EXACTLY ONE QUESTION PER TURN: Ask only one clear, focused question per turn matching the assigned phase.
4. NO SCRIPT META-TAGS: Never prefix your responses with labels like "Interviewer:", "Phase 1:", "Question 2:", or internal scoring notes. Speak directly as a human interviewer.
5. CLEAN VOICE FORMATTING: Do NOT use markdown tables or emoji in your spoken dialogue. Use clean paragraphs and concise code blocks when asking for code.
6. ADAPTIVITY: If the candidate gives a shallow response, probe their specific assumption. If strong, push deeper into company-scale constraints.
"""


def build_scoring_rubric(role: str, interview_type: str = "technical", role_level: str = "fresher") -> str:
    """Builds the comprehensive evaluation rubric for candidate scoring."""
    category = get_role_category(role)

    if interview_type == "technical":
        rubric_details = {
            "swe": "Flawless code logic, optimal space/time complexity, sound algorithm choice, and clean code structure.",
            "data_ai": "Strong statistical understanding, mathematically correct modeling assumptions, sound evaluation metrics choice, and pipeline scalability.",
            "infra_cloud": "Highly available cloud architecture design, correct container orchestration strategies, sound IaC practices, and network topology correctness.",
            "security": "Accurate threat modeling, zero-trust patterns, OWASP vulnerability mitigations, key exchange protocols correctness, and incident recovery logic.",
            "product_design": "Clear product metrics prioritization, correct roadmapping frameworks (RICE), accessibility (WCAG), and sound monetization/conversion strategies.",
            "gaming": "Frame-rate independence principles, sound collision checking algorithms, optimal netcode/lag compensation, and strict memory/GC allocation hygiene.",
        }.get(category, "Domain-specific protocol correctness, hardware/testing design compliance, and sound system integration methodology.")

        if role_level in ("intern", "fresher"):
            scoring_rubric = (
                f"- 90-100: Exceptional. Clear reasoning, solid fundamentals, attempted optimization, and {rubric_details}\n"
                f"- 75-89: Strong hire. Good problem-solving for their level, minor gaps in edge cases or optimization.\n"
                "- 50-74: Needs improvement. Struggled with core concepts, required significant hinting, or gave vague answers.\n"
                "- 0-49: Reject. Unable to articulate basic approach, fundamental misunderstandings, or poor communication.\n"
            )
        else:
            scoring_rubric = (
                f"- 90-100: Exceptional. Flawless logic, deep architectural understanding, production-grade reasoning, and {rubric_details}\n"
                f"- 75-89: Strong hire. Good problem-solving, but missed edge cases, secondary trade-offs, or optimization details.\n"
                "- 50-74: Needs improvement. Required heavy hinting, struggled with core concepts, or gave superficial/vague answers.\n"
                "- 0-49: Reject. Failed to answer basic questions, completely wrong logic, or poor communication.\n"
            )
    else:
        # Behavioral scoring
        if role_level in ("intern", "fresher"):
            scoring_rubric = (
                "- 90-100: Exceptional. Clear, honest responses, good self-awareness, and genuine enthusiasm.\n"
                "- 75-89: Strong hire. Good answers, but lacked specific examples or stumbled slightly on some questions.\n"
                "- 50-74: Needs improvement. Vague answers, struggled to articulate experiences, or weak motivation.\n"
                "- 0-49: Reject. Poor communication, red flags in attitude, or failed to answer basic HR questions.\n"
            )
        else:
            scoring_rubric = (
                "- 90-100: Exceptional. Clear, structured STAR responses, high EQ, strong culture fit and leadership traits.\n"
                "- 75-89: Strong hire. Good answers, but lacked deep specific examples or stumbled slightly on conflict resolution.\n"
                "- 50-74: Needs improvement. Vague answers, struggled to articulate past experiences, or weak motivation.\n"
                "- 0-49: Reject. Poor attitude, red flags in teamwork/conflict, or failed to answer basic HR questions.\n"
            )

    return scoring_rubric


def _build_feedback_system_prompt(role: str, company: str, interview_type: str = "technical", role_level: str = "fresher") -> str:
    """Legacy feedback system prompt for backward compatibility."""
    scoring_rubric = build_scoring_rubric(role, interview_type, role_level)

    return (
        f"You are a Senior Hiring Manager at {company}. Evaluate this {interview_type.upper()} interview transcript for a {role} position.\n\n"
        f"SCORING RUBRIC:\n{scoring_rubric}\n\n"
        "OUTPUT FORMAT — follow this EXACTLY. Do NOT repeat these instructions. Do NOT explain what you are doing. Just produce the feedback:\n\n"
        "That concludes our interview today. Thank you for your time. Here is your detailed performance analysis.\n\n"
        "**Executive Summary:** [One sentence summarizing performance]\n\n"
        "**Strengths:**\n"
        "- [Strength 1 — max 10 words]\n"
        "- [Strength 2 — max 10 words]\n\n"
        "**Areas of Improvement:**\n"
        "- [Gap 1 — max 10 words]\n"
        "- [Gap 2 — max 10 words]\n\n"
        "**Actionable Advice:**\n"
        "- [Study topic 1 — max 10 words]\n"
        "- [Study topic 2 — max 10 words]\n\n"
        "OVERALL SCORE : [X]/100"
    )
