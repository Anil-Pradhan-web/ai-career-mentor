"""
Agent Registry — Microsoft AutoGen agents for AI Career Mentor.

Agents are implemented progressively:
  Day 3 → Resume Analyst
  Day 4 → Career Coach
  Day 5 → Market Researcher
  Day 7 → Mock Interviewer
"""
from autogen import AssistantAgent, UserProxyAgent

from app.core.config import settings


def get_user_proxy() -> UserProxyAgent:
    return UserProxyAgent(
        name="User_Proxy",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=0,
        code_execution_config=False,
    )


def get_resume_analyst() -> AssistantAgent:
    """Day 3 — Resume analysis agent."""
    return AssistantAgent(
        name="Resume_Analyst",
        llm_config=settings.llm_config,
        system_message=(
            "You are an expert Technical Recruiter. Analyze the given resume and extract:\n"
            "1. Technical Skills\n"
            "2. Soft Skills\n"
            "3. Total years of experience\n"
            "4. Top 3 strengths\n"
            "5. Top 3 skill gaps for modern tech jobs\n"
            "Always respond in valid JSON format."
        ),
    )


def get_career_coach() -> AssistantAgent:
    """Day 4 — Career roadmap generation agent."""
    return AssistantAgent(
        name="Career_Coach",
        llm_config=settings.llm_config,
        system_message=(
            "You are a Senior Career Coach. Given skill gaps and a target role, "
            "create a week-by-week learning plan. For each week specify: "
            "Topic, Free Resource URL, Estimated Hours, Mini Project. "
            "Always respond in valid JSON format."
        ),
    )


def get_market_researcher() -> AssistantAgent:
    """Day 5 — Job market research agent."""
    return AssistantAgent(
        name="Market_Researcher",
        llm_config=settings.llm_config,
        system_message=(
            "You are a Job Market Analyst. For a given role and location, identify:\n"
            "1. Top 5 in-demand skills\n"
            "2. Salary range\n"
            "3. Top hiring companies\n"
            "4. Market trend: Growing / Stable / Declining\n"
            "Always respond in valid JSON format."
        ),
    )


def get_interview_agent() -> AssistantAgent:
    """Day 7 — Mock technical interview agent."""
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
