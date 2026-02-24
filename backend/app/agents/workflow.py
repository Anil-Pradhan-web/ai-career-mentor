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


def run_full_career_analysis(resume_text: str, target_role: str, location: str) -> list[dict]:
    """
    Orchestrates all 3 agents to produce a complete career analysis.

    Returns the full GroupChat message history (list of role/content dicts).
    Implemented on Day 6.
    """
    user_proxy = get_user_proxy()
    resume_analyst = get_resume_analyst()
    market_researcher = get_market_researcher()
    career_coach = get_career_coach()

    from autogen import register_function
    from app.tools.market_search import search_job_trends
    
    # We must register the search tool to allow Market Researcher to operate
    register_function(
        search_job_trends,
        caller=market_researcher,
        executor=user_proxy,
        name="search_job_trends",
        description="Search job market trends for a role and location."
    )

    groupchat = GroupChat(
        agents=[user_proxy, resume_analyst, market_researcher, career_coach],
        messages=[],
        max_round=10,
        speaker_selection_method="auto"
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
            f"Location: {location}\n\n"
            "INSTRUCTIONS:\n"
            "1. Resume_Analyst MUST speak first to extract skills/gaps from the resume and return pure JSON.\n"
            f"2. Market_Researcher MUST then use 'search_job_trends' (use args role='{target_role}' and location='{location}') and return pure JSON for market insights.\n"
            "3. Career_Coach MUST use the gaps found by Resume_Analyst to make a 6-week roadmap array in pure JSON.\n"
            "When outputting your JSON, DO NOT append any extra chit-chat."
        ),
    )

    return groupchat.messages
