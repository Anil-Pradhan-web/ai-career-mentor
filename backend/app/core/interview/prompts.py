import random
from typing import Optional

from app.core.interview.constants import LEETCODE_BHANDARA, COMPANY_PROFILES


def _build_interview_system_prompt(
    role: str,
    company: str,
    company_style: str,
    company_tier: str,
    interview_type: str = "technical",
    resume_summary: str | None = None
) -> str:
    target_company_lower = company.lower()
    
    # ── Difficulty Logic ───────────────────────────────────────────────
    tier = (company_tier or "other").lower()
    if tier in ["faang", "hft"]:
        difficulty_level = "HARD"
    elif tier in ["top-indian-product", "fintech", "mid-product"]:
        difficulty_level = "MEDIUM"
    else:
        difficulty_level = "EASY"

    # Select 1 random problem from the bhandara for this difficulty
    p1 = random.choice(LEETCODE_BHANDARA[difficulty_level])

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

    # ── Random Focus Topics (For Variety) ──────────────────────────────
    TECH_FUNDAMENTALS = [
        "Operating Systems (OS) - memory management (stack vs heap, garbage collection internals, virtual memory)",
        "Operating Systems (OS) - concurrency models (threads, event loops, process synchronization, deadlocks, locks, race conditions)",
        "Database Management Systems (DBMS) - database indexing strategies (B-Trees, LSM Trees, hash indexes) and query planning",
        "Database Management Systems (DBMS) - database transaction isolation levels (ACID properties, dirty reads, phantom reads, serializability)",
        "Computer Networks (CN) - network protocols (HTTP/1.1 vs HTTP/2 vs HTTP/3, gRPC, WebSocket overhead, TCP vs UDP flow control)",
        "Computer Networks (CN) - network routing, DNS resolution, and security essentials (SSL/TLS handshakes, hashing vs encryption)"
    ]
    
    NON_TECH_FUNDAMENTALS = [
        "metrics prioritization (activation, retention, LTV, North Star metric selection)",
        "user research methodology (qualitative vs quantitative, usability testing, persona design)",
        "product execution and roadmap trade-offs (MoSCoW method, RICE scoring framework)",
        "design system consistency and accessibility standards (WCAG guidelines, contrast, responsive grids)",
        "stakeholder alignment and conflict resolution during feature scoping",
        "analytical problem-solving (market sizing, product launch GTM strategy, pricing models)"
    ]

    fundamental_focus = random.choice(TECH_FUNDAMENTALS if interview_type == "technical" else NON_TECH_FUNDAMENTALS)

    # ── Random System Design Scenarios (For Variety) ───────────────────
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
    
    GENERIC_SYSTEM_DESIGNS = [
        "a high-concurrency movie ticket booking platform (similar to BookMyShow)",
        "a real-time multiplayer leaderboard for mobile games",
        "a distributed rate-limiting service protecting public APIs",
        "a URL shortening service (like Bitly) with detailed click analytics",
        "a real-time parcel tracking service for a global logistics network",
        "a collaborative kanban board (like Trello) with instant updates"
    ]

    company_name_clean = company.lower().strip()
    scenarios = None
    for key, val in COMPANY_DESIGN_SCENARIOS.items():
        if key in company_name_clean:
            scenarios = val
            break
            
    if scenarios:
        system_design_scenario = random.choice(scenarios)
    else:
        system_design_scenario = f"a system design scenario related to {company}'s domain, specifically focusing on {random.choice(GENERIC_SYSTEM_DESIGNS)}"

    # Generate a unique seed to prevent LLM caching/repetition
    seed_token = random.randint(1000, 9999)

    # ── Mode-Specific Instructions ─────────────────────────────────────
    if interview_type == "technical":
        mode_instructions = (
            "FOCUS: ONLY TECHNICAL ASSESSMENT.\n"
            "- Deep dive into Data Structures, Algorithms, and System Design (LLD/HLD).\n"
            "- Ask about code optimization, time/space complexity, and scalability.\n"
            "- IMPORTANT: When asking a coding challenge, EXPLICITLY state the standard LeetCode problem name or number (e.g., 'This problem is similar to LeetCode 1: Two Sum'). Do this so the candidate clearly understands the reference.\n"
            f"- Evaluate their ability to solve complex engineering problems for a {role}.\n"
            "- Discuss architecture, trade-offs, and company-specific tech stacks."
        )
        if resume_summary:
            flow_phases = (
                "Phase 1: Intro & Personalized Discovery (Welcome Candidate name, state that they are applying for target role, and identify key skills from resume. If candidate has professional technical experience like doing any internship (technical) or working at any company, ask what skills they learned through that experience and ask about their experience. Strictly do NOT consider non-professional student activities like college club member or campus ambassador as professional technical experience. If candidate has no professional experience, ask about skills and tools used in their projects instead).\n"
                f"Phase 2: CS Fundamentals (Operating Systems [OS], Computer Networks [CN], or Database Management Systems [DBMS]). You MUST ask a question specifically on one of these core subjects: {fundamental_focus}.\n"
                f"Phase 3: LeetCode Coding Challenge - {p1['title']}. Instructions: Introduce the problem {p1['description']}. Explicitly state that this is similar to the standard LeetCode problem. Ask the candidate to explain their approach and provide the code logic (focusing on {', '.join(p1['concepts'])} and complexity analysis).\n"
                "Phase 4: Project Deep-Dive (Identify exactly ONE strong project from candidate's resume, select exactly TWO specific achievements or bullet points from it, and ask candidate to explain the architecture, implementation details, and technical decisions behind those components).\n"
                f"Phase 5: System Design (Ask the candidate to design a scalable architecture: {system_design_scenario}).\n"
                f"Phase 6: Real-life Domain of the Company's Solution (Ask a scenario-based question relevant to {company}'s real-world business and technical domain. E.g., for consulting/service companies like TCS: discuss legacy integration, distributed ledger transaction consistency, or migration strategies; for product/FAANG companies: discuss scale, latency, or content distribution).\n"
                "Phase 7: Closing - Do you have any questions for me?"
            )
        else:
            flow_phases = (
                "Phase 1: Intro & Tech Stack Discovery (Welcome candidate, state that they are applying for target role, and ask about the key tech stack/projects they have worked on).\n"
                f"Phase 2: CS Fundamentals (Operating Systems [OS], Computer Networks [CN], or Database Management Systems [DBMS]). You MUST ask a question specifically on one of these core subjects: {fundamental_focus}.\n"
                f"Phase 3: LeetCode Coding Challenge - {p1['title']}. Instructions: Introduce the problem {p1['description']}. Explicitly state that this is similar to the standard LeetCode problem. Ask the candidate to explain their approach and provide the code logic (focusing on {', '.join(p1['concepts'])} and complexity analysis).\n"
                "Phase 4: Project/Technical Deep-Dive (Ask the candidate to select a major technical project they worked on, describe the system architecture, and detail the technical decisions behind their key achievements).\n"
                f"Phase 5: System Design (Ask the candidate to design a scalable architecture: {system_design_scenario}).\n"
                f"Phase 6: Real-life Domain of the Company's Solution (Ask a scenario-based question relevant to {company}'s real-world business and technical domain. E.g., for consulting/service companies like TCS: discuss legacy integration, distributed ledger transaction consistency, or migration strategies; for product/FAANG companies: discuss scale, latency, or content distribution).\n"
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
