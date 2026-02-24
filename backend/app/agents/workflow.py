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

    def custom_speaker_selection(last_speaker, groupchat):
        messages = groupchat.messages
        if len(messages) <= 1:
            return resume_analyst
            
        if last_speaker == user_proxy:
            return market_researcher
            
        if last_speaker == resume_analyst:
            return market_researcher
            
        if last_speaker == market_researcher:
            # If a tool call was suggested, direct to User_Proxy to execute it
            last_msg = messages[-1]
            if "tool_calls" in last_msg or (last_msg.get("content") and "suggested" in last_msg.get("content", "").lower()):
                return user_proxy
            # Otherwise, Market Researcher is done, on to Career Coach
            return career_coach
            
        if last_speaker == career_coach:
            return None # Terminate the chat!

    groupchat = GroupChat(
        agents=[user_proxy, resume_analyst, market_researcher, career_coach],
        messages=[],
        max_round=15,
        speaker_selection_method=custom_speaker_selection
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
            "1. Resume_Analyst MUST extract detailed tech skills and highly robust, advanced skill gaps. Return pure JSON.\n"
            f"2. Market_Researcher MUST use 'search_job_trends' (role='{target_role}', location='{location}'). Return pure JSON.\n"
            "3. Career_Coach MUST deeply analyze the gaps and provide an incredibly detailed, advanced 6-week roadmap with specific mini-projects. Return pure JSON array.\n"
            "When outputting your JSON, DO NOT append any extra chit-chat."
        ),
    )

    return groupchat.messages
