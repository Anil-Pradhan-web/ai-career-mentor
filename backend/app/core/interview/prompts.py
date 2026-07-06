import random
from typing import Optional

from app.core.interview.constants import (
    COMPANY_PROFILES,
    get_role_category,
    TECHNICAL_CHALLENGE_BANKS,
    TECH_FUNDAMENTALS_BY_CATEGORY,
    SYSTEM_DESIGNS_BY_CATEGORY,
    COMPANY_DESIGN_SCENARIOS,
    PHASE_2_TOPICS,
    PHASE_3_NAMES,
    PHASE_5_NAMES,
    PHASE_5_FOCUS
)


def _build_interview_system_prompt(
    role: str,
    company: str,
    company_style: str,
    company_tier: str,
    interview_type: str = "technical",
    resume_summary: str | None = None,
    candidate_name: str = "Candidate",
    session_id: str | None = None
) -> str:
    target_company_lower = company.lower()
    category = get_role_category(role)
    
    # Use session-based seeding to guarantee consistency during page reloads/reconnects,
    # but total randomness across different sessions.
    local_random = random.Random(session_id) if session_id else random

    # Extract years of experience from resume_summary if available to detect fresher status
    years_of_exp = 0.0
    is_fresher = True
    if resume_summary:
        for line in resume_summary.splitlines():
            if line.startswith("Years of Experience:"):
                try:
                    years_of_exp = float(line.split(":", 1)[1].strip())
                    if years_of_exp > 1.5:
                        is_fresher = False
                except Exception:
                    pass
                break

    # ── Difficulty Logic based on Experience & Company Tier ──────────
    tier = (company_tier or "other").lower()
    
    if tier in ["faang", "hft", "top-indian-product", "fintech", "hardware", "gaming", "security"]:
        if is_fresher:
            difficulty_level = "MEDIUM"
        else:
            difficulty_level = "HARD"
    else:  # indian-service, mid-product, other
        if is_fresher:
            difficulty_level = "EASY"
        else:
            difficulty_level = "MEDIUM"

    # Select 1 random problem from the category bank for this difficulty
    bank = TECHNICAL_CHALLENGE_BANKS.get(category, TECHNICAL_CHALLENGE_BANKS["swe"])
    p1 = local_random.choice(bank[difficulty_level])

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
    
    interviewer_persona = local_random.choice(TECHNICAL_PERSONAS if interview_type == "technical" else BEHAVIORAL_PERSONAS)

    # ── Random Focus Topics (By Category for variety) ──────────────────
    NON_TECH_FUNDAMENTALS = [
        "metrics prioritization (activation, retention, LTV, North Star metric selection)",
        "user research methodology (qualitative vs quantitative, usability testing, persona design)",
        "product execution and roadmap trade-offs (MoSCoW method, RICE scoring framework)",
        "design system consistency and accessibility standards (WCAG guidelines, contrast, responsive grids)",
        "stakeholder alignment and conflict resolution during feature scoping",
        "analytical problem-solving (market sizing, product launch GTM strategy, pricing models)"
    ]

    fundamental_focus = local_random.choice(
        TECH_FUNDAMENTALS_BY_CATEGORY.get(category, TECH_FUNDAMENTALS_BY_CATEGORY["swe"])
        if interview_type == "technical" else NON_TECH_FUNDAMENTALS
    )

    # ── Random System Design Scenarios (By Tier/Company for Variety) ───────
    scenarios = COMPANY_DESIGN_SCENARIOS.get(tier, COMPANY_DESIGN_SCENARIOS["other"])
    raw_scenario = local_random.choice(scenarios)
    try:
        system_design_scenario = raw_scenario.format(company=company)
    except Exception:
        system_design_scenario = raw_scenario

    # Generate a unique seed to prevent LLM caching/repetition
    seed_token = local_random.randint(1000, 9999)

    # ── Phase Naming & Details ────────────────────────────────────────
    p2_name = PHASE_2_TOPICS.get(category, PHASE_2_TOPICS["swe"])

    if category == "swe":
        p3_desc = f"Phase 3: LeetCode Coding Challenge - {p1['title']}. Instructions: Introduce the problem {p1['description']}. Explicitly state that this is similar to the standard LeetCode problem. Ask the candidate to explain their approach and provide the code logic (focusing on {', '.join(p1['concepts'])} and complexity analysis)."
    else:
        ch_name = PHASE_3_NAMES.get(category, "Technical Case Study")
        p3_desc = f"Phase 3: {ch_name} - {p1['title']}. Instructions: Present the scenario: {p1['description']}. Ask the candidate to walk through their solution/logic, covering core concepts ({', '.join(p1['concepts'])}), key decisions, and potential optimization trade-offs."

    p5_desc_name = PHASE_5_NAMES.get(category, "System Design")
    p5_desc = f"Phase 5: {p5_desc_name} (Ask the candidate to design a scalable architecture: {system_design_scenario})."

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
                f"Phase 1: Intro & Personalized Discovery (Welcome {candidate_name}, state that they are applying for target role, and identify key skills from resume. If candidate has professional technical experience like doing any internship (technical) or working at any company, ask what skills they learned through that experience and ask about their experience. Strictly do NOT consider non-professional student activities like college club member or campus ambassador as professional technical experience. If candidate has no professional experience, ask about skills and tools used in their projects instead).\n"
                f"Phase 2: {p2_name}. You MUST ask a question specifically on one of these core subjects: {fundamental_focus}.\n"
                f"{p3_desc}\n"
                "Phase 4: Project Deep-Dive (Identify exactly ONE strong project from candidate's resume, select exactly TWO specific achievements or bullet points from it, and ask candidate to explain the architecture, implementation details, and technical decisions behind those components).\n"
                f"{p5_desc}\n"
                f"Phase 6: Real-life Domain of the Company's Solution (Present a highly realistic, domain-specific business problem and technical solution scenario based on the actual business model, products, or operations of {company} – e.g. for Intel: semiconductor fab optimization, edge AI processing, hardware co-design, chip design automation; for FAANG: global scaling, sub-millisecond latency, distributed systems; for Fintech: transactions integrity, compliance, fraud engines. Ask the candidate how they would design a solution for this company-specific problem using their role's expertise, focusing on practical constraints and technical trade-offs).\n"
                "Phase 7: Closing - Do you have any questions for me?"
            )
        else:
            flow_phases = (
                f"Phase 1: Intro & Tech Stack Discovery (Welcome {candidate_name}, state that they are applying for target role, and ask about the key tech stack/projects they have worked on).\n"
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
        
        behavioral_teamwork = local_random.choice(BEHAVIORAL_SCENARIOS_TEAMWORK)
        behavioral_challenge = local_random.choice(BEHAVIORAL_SCENARIOS_CHALLENGES)

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
    category = get_role_category(role)
    
    if interview_type == "technical":
        if category == "swe":
            rubric_details = "Flawless code logic, optimal space/time complexity, sound algorithm choice, and clean code structure."
        elif category == "data_ai":
            rubric_details = "Strong statistical understanding, mathematically correct modeling assumptions, sound evaluation metrics choice, and pipeline scalability."
        elif category == "infra_cloud":
            rubric_details = "Highly available cloud architecture design, correct container orchestration strategies, sound IaC practices, and network topology correctness."
        elif category == "security":
            rubric_details = "Accurate threat modeling, zero-trust patterns, OWASP vulnerability mitigations, key exchange protocols correctness, and incident recovery logic."
        elif category == "product_design":
            rubric_details = "Clear product metrics prioritization, correct roadmapping frameworks (RICE), accessibility (WCAG), and sound monetization/conversion strategies."
        elif category == "gaming":
            rubric_details = "Frame-rate independence principles, sound collision checking algorithms, optimal netcode/lag compensation, and strict memory/GC allocation hygiene."
        else:
            rubric_details = "Domain-specific protocol correctness, hardware/testing design compliance, and sound system integration methodology."

        scoring_rubric = (
            f"- 90-100: Exceptional. Flawless logic, deep architectural understanding, and {rubric_details}\n"
            f"- 75-89: Strong hire. Good problem-solving, but missed minor edge cases, secondary trade-offs, or optimization details.\n"
            "- 50-74: Needs improvement. Required heavy hinting, struggled with core concepts, or gave superficial/vague answers.\n"
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
        "The interview has concluded. Your task is to provide a brutally honest, highly structured, and concise feedback report.\n\n"
        "SCORING RUBRIC (CRITICAL):\n"
        f"{scoring_rubric}"
        "**WARNING:** Do NOT give a generic 'good' score. You MUST aggressively deduct points for every incorrect, vague, or superficial answer, or if the interviewer had to provide hints/follow-ups to extract basic info.\n\n"
        "REQUIREMENTS:\n"
        "1. Start directly with: 'That concludes our interview today. Thank you for your time. Here is your detailed performance analysis...'\n"
        "2. Structure your feedback clearly using the following sections, keeping it extremely short, direct, and under 150 words total:\n"
        "   - **Executive Summary:** A single brief sentence summarizing their performance.\n"
        "   - **Strengths:** Specific moments they did well (exactly 2 concise bullet points, max 10 words each).\n"
        "   - **Areas of Improvement:** Specific mistakes or gaps (exactly 2 concise bullet points, max 10 words each).\n"
        "   - **Actionable Advice:** Key things to study next (exactly 2 concise bullet points, max 10 words each).\n"
        "3. Tone: Professional, direct, and brief. Do not write paragraphs or explain in detail.\n"
        "4. At the very end of your response, on a new line, you MUST provide the final calculated score strictly in this exact format:\n"
        "OVERALL SCORE : [X]/100"
    )
