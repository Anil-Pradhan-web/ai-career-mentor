"""
AutoGen GroupChat Orchestration — Day 6.

Runs Resume Analyst + Market Researcher + Career Coach as a
collaborative multi-agent pipeline via AutoGen GroupChat.
"""
from autogen import GroupChat, GroupChatManager

from app.agents.registry import (
    get_career_coach,
    get_market_researcher,
    get_resume_analyst,
    get_user_proxy,
)
from app.core.config import settings


def run_full_career_analysis(resume_text: str, target_role: str) -> list[dict]:
    """
    Orchestrates all 3 agents to produce a complete career analysis.

    Returns the full GroupChat message history (list of role/content dicts).
    Implemented on Day 6.
    """
    user_proxy = get_user_proxy()
    resume_analyst = get_resume_analyst()
    market_researcher = get_market_researcher()
    career_coach = get_career_coach()

    groupchat = GroupChat(
        agents=[user_proxy, resume_analyst, market_researcher, career_coach],
        messages=[],
        max_round=6,
    )
    manager = GroupChatManager(
        groupchat=groupchat,
        llm_config=settings.llm_config,
    )

    user_proxy.initiate_chat(
        manager,
        message=(
            f"Resume:\n{resume_text}\n\n"
            f"Target Role: {target_role}\n\n"
            "Please: (1) analyze the resume, (2) research the job market, "
            "(3) generate a personalized learning roadmap."
        ),
    )

    return groupchat.messages
