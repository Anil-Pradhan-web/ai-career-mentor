"""
Agent Registry — Microsoft AutoGen agents for AI Career Mentor.

Agents are implemented progressively:
  Day 3 → Resume Analyst
  Day 4 → Career Coach
  Day 5 → Market Researcher
  Day 7 → Mock Interviewer
"""
# NOTE: autogen is imported lazily inside each function to avoid a 30s+
# startup hang caused by AutoGen doing model-config validation on import.
from app.core.config import settings


def get_user_proxy():
    from autogen import UserProxyAgent  # lazy import
    return UserProxyAgent(
        name="User_Proxy",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=5,
        code_execution_config=False,
    )


def get_resume_analyst():
    """Day 3 — Resume analysis agent."""
    from autogen import AssistantAgent  # lazy import
    return AssistantAgent(
        name="Resume_Analyst",
        llm_config=settings.llm_config,
        system_message=(
            "You are an elite Silicon Valley Technical Recruiter. Your job is to rigorously review the given resume.\n"
            "Do not give generic advice. Be highly specific about modern frameworks, missing system design, or testing skills.\n"
            "CRITICAL: Always respond ONLY with valid JSON using the EXACT following keys:\n"
            "{\n"
            '  "technical_skills": [list of strings (all tech mentioned)],\n'
            '  "soft_skills": [list of strings],\n'
            '  "years_of_experience": float (calculate accurately based on dates),\n'
            '  "top_strengths": [list of 3 strings detailing their best traits],\n'
            '  "skill_gaps": [list of 5 highly specific missing skills/frameworks crucial for top modern tech roles]\n'
            "}"
        ),
    )


def get_career_coach():
    """Day 4 — Career roadmap generation agent.

    Returns a JSON array of weekly learning plan items with this schema:
    [
      {
        "week": 1,
        "topic": "Introduction to Docker",
        "resource_url": "https://docs.docker.com/get-started/",
        "estimated_hours": 8,
        "mini_project": "Containerize a simple Python Flask app"
      },
      ...
    ]
    """
    from autogen import AssistantAgent  # lazy import
    return AssistantAgent(
        name="Career_Coach",
        llm_config=settings.llm_config,
        system_message=(
            "You are an elite Principal Engineer and Career Coach. You build highly detailed, advanced, week-by-week learning roadmaps.\n"
            "You will receive a target role and a list of specific skill gaps the candidate needs to close.\n\n"

            "OUTPUT FORMAT — respond with ONLY a raw JSON array (no extra text, no markdown fences).\n"
            "Each element MUST contain exactly these keys:\n"
            "  week            : integer (1, 2, 3, 4, 5, 6)\n"
            "  topic           : string — A SPECIFIC, DETAILED, and UNIQUE tech topic. (e.g., 'Distributed Tracing & Observability' NOT 'Learn Backend')\n"
            "  resource_url    : string — a real, high-quality, publicly accessible free URL (YouTube video, official docs, "
            "specific article). Must start with https://\n"
            "  estimated_hours : integer — realistic hours for a working professional (8–20 per week)\n"
            "  mini_project    : string — an EXTREMELY specific, concrete, portfolio-worthy project to build that week. Provide a descriptive title or instructions. (e.g., 'Build a Redis-backed token bucket rate limiter API in Node.js')\n\n"

            "CRITICAL GUIDELINES:\n"
            "1. Generate EXACTLY 6 weeks of content.\n"
            "2. Break down the provided 'Skill Gaps' into 6 distinct, highly progressive weekly themes.\n"
            "3. DO NOT repeat topics. Ensure progression from intermediate to advanced.\n"
            "4. Make the mini-projects exciting, incredibly specific, and relevant to modern industry standards. Avoid generic 'todo apps'.\n"
            "5. Do NOT add any explanation, headers, or markdown outside the JSON array."
        ),
    )


def get_market_researcher():
    """Day 5 — Job market research agent."""
    from autogen import AssistantAgent  # lazy import
    return AssistantAgent(
        name="Market_Researcher",
        llm_config=settings.llm_config,
        system_message=(
            "You are a Job Market Analyst. For a given role and location, identify job market trends.\n"
            "CRITICAL: Always respond ONLY with valid JSON using the EXACT following keys:\n"
            "{\n"
            '  "top_skills": [list of strings],\n'
            '  "salary_range": "string",\n'
            '  "top_companies": [list of strings],\n'
            '  "market_trend": "Growing, Stable, or Declining"\n'
            "}"
        ),
    )


def get_interview_agent(target_role: str = "Software Engineer", target_company: str = "A Top Tech Company"):
    """Day 7 — Mock technical interview agent."""
    from autogen import AssistantAgent  # lazy import
    return AssistantAgent(
        name="Interviewer",
        llm_config=settings.llm_config,
        system_message=(
            f"You are a technical interviewer at {target_company} hiring for a {target_role} position.\n"
            "Rules:\n"
            "- Ask ONE question at a time.\n"
            "- Wait for the candidate's answer before continuing.\n"
            "- After each answer, give brief feedback (1-2 sentences).\n"
            "- Score the answer out of 10 internally.\n"
            "- After 5 questions, give a final summary and overall score.\n"
            f"- Tailor questions specifically to the {target_role} target job role at {target_company}.\n"
            "- Adjust the difficulty strictly based on the role and company expectations (e.g., standard for entry-level/startup, deep systems design for senior or FAANG)."
        ),
    )
