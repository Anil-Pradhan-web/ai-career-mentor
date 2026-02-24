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
            "You are an expert Technical Recruiter. Analyze the given resume and extract information.\n"
            "CRITICAL: Always respond ONLY with valid JSON using the EXACT following keys:\n"
            "{\n"
            '  "technical_skills": [list of strings],\n'
            '  "soft_skills": [list of strings],\n'
            '  "years_of_experience": float,\n'
            '  "top_strengths": [list of 3 strings],\n'
            '  "skill_gaps": [list of 3 strings]\n'
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
            "You are a Senior Technical Career Coach who builds highly detailed, diverse, and personalised week-by-week learning roadmaps.\n"
            "You will receive a target role and a list of skill gaps the candidate needs to close.\n\n"

            "OUTPUT FORMAT — respond with ONLY a raw JSON array (no extra text, no markdown fences).\n"
            "Each element MUST contain exactly these keys:\n"
            "  week            : integer (1, 2, 3, 4, 5, 6)\n"
            "  topic           : string — A SPECIFIC, DETAILED, and UNIQUE tech topic or sub-skill to learn that week. DO NOT REPEAT topics.\n"
            "  resource_url    : string — a real, publicly accessible free URL (YouTube video, official docs, "
            "free Coursera/freeCodeCamp course, or a specific article). Must start with https://\n"
            "  estimated_hours : integer — realistic hours for a working professional (4–15 per week)\n"
            "  mini_project    : string — a highly specific, concrete, role-relevant project to build that week. Provide a descriptive title or instructions.\n\n"

            "CRITICAL GUIDELINES:\n"
            "1. Generate EXACTLY 6 weeks of content.\n"
            "2. Break down the provided 'Skill Gaps' into 6 distinct, progressive weekly themes (e.g. Week 1: Core concepts, Week 3: Databases, Week 5: Architecture). If there's only 1 skill gap, expand it into 6 progressive sub-topics.\n"
            "3. DO NOT repeat the exact same topic or generic terms like 'System Design' every week. Progression is key!\n"
            "4. Prefer free resources: YouTube, official docs, freeCodeCamp, The Odin Project, MDN, Kaggle, AWS/GCP/Azure free tiers.\n"
            "5. Make the mini-projects exciting and very specific to the week's topic (e.g. 'Build a React auth flow with JWT' instead of 'Build a web app').\n"
            "6. Do NOT add any explanation, headers, or markdown outside the JSON array."
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


def get_interview_agent():
    """Day 7 — Mock technical interview agent."""
    from autogen import AssistantAgent  # lazy import
    return AssistantAgent(
        name="Interviewer",
        llm_config=settings.llm_config,
        system_message=(
            "You are a senior technical interviewer at a top tech company. Rules:\n"
            "- Ask ONE question at a time.\n"
            "- After each answer, give brief feedback (1-2 sentences).\n"
            "- After 5 questions, give a final summary with an overall score out of 100.\n"
            "- Tailor questions to the candidate's target role."
        ),
    )
