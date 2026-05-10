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


def run_full_career_analysis(resume_text: str, target_role: str, location: str, provider: str = None) -> list[dict]:
    """
    Orchestrates all 3 agents to produce a complete career analysis.

    Returns the full GroupChat message history (list of role/content dicts).
    Implemented on Day 6.
    """
    llm_config = settings.get_llm_config(provider)
    user_proxy = get_user_proxy()
    resume_analyst = get_resume_analyst(llm_config=llm_config)
    market_researcher = get_market_researcher(llm_config=llm_config)
    career_coach = get_career_coach(llm_config=llm_config)

    def custom_speaker_selection(last_speaker, groupchat):
        messages = groupchat.messages
        if len(messages) <= 1:
            return resume_analyst
            
        if last_speaker == resume_analyst:
            return market_researcher
            
        if last_speaker == market_researcher:
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
        llm_config=llm_config,
    )

    from app.core.ats_engine import analyze_resume_deterministically
    from app.core.market_engine import get_deterministic_market_data
    import json
    
    deterministic_resume = analyze_resume_deterministically(resume_text)
    deterministic_market = get_deterministic_market_data(target_role, location)

    user_proxy.initiate_chat(

        manager,

        message=(

            f"RAW RESUME TEXT:\n"
            f"{resume_text}\n\n"

            f"TARGET ROLE:\n"
            f"{target_role}\n\n"

            f"TARGET LOCATION:\n"
            f"{location}\n\n"

            "====================================================\n"
            "MULTI-AGENT EXECUTION PROTOCOL (DETERMINISTIC PIPELINE)\n"
            "====================================================\n\n"

            "You are an elite AI hiring intelligence panel composed "
            "of Formatter Agents taking structured deterministic inputs.\n\n"

            "====================================================\n"
            "MANDATORY EXECUTION ORDER\n"
            "====================================================\n\n"

            "STEP 1 → Resume_Analyst\n"
            "Responsibilities:\n"
            "- Take the following deterministic data and format it into the required JSON.\n"
            "- Infer soft skills from the resume text.\n"
            "- Polish the strengths and gaps into professional sentences.\n"
            "- KEEP the 'ats_score' and 'ats_score_breakdown' EXACTLY as provided.\n"
            "- KEEP 'technical_skills' and 'years_of_experience' EXACTLY as provided.\n\n"
            f"DETERMINISTIC ATS DATA:\n{json.dumps(deterministic_resume, indent=2)}\n\n"
            "WAIT until Resume_Analyst completes before continuing.\n\n"
            "----------------------------------------------------\n\n"

            "STEP 2 → Market_Researcher\n"
            "Responsibilities:\n"
            "- Take the following deterministic market data and format it into the required JSON.\n"
            "- DO NOT guess or hallucinate numbers.\n"
            "- Create a 1-sentence market trend justification based on the volume data.\n"
            "- Format the salary numbers nicely.\n\n"
            f"DETERMINISTIC MARKET DATA:\n{json.dumps(deterministic_market, indent=2)}\n\n"
            "WAIT until Market_Researcher completes before continuing.\n\n"
            "----------------------------------------------------\n\n"

            "STEP 3 → Career_Coach\n"
            "Responsibilities:\n"
            "- Analyze the Resume_Analyst and Market_Researcher outputs.\n"
            "- Build a hyper-personalized 8-week roadmap.\n"
            "- Provide high-quality 'resource_search_queries' for the backend search engine.\n"
            "- Bridge the identified skill gaps.\n\n"
            "STRICT RULES:\n"
            "- Output ONLY a raw JSON array of 8 objects.\n"
            "- Do NOT generate URLs directly. Use resource_search_queries.\n"
            "- No markdown.\n\n"

            "====================================================\n"
            "GLOBAL SYSTEM RULES\n"
            "====================================================\n\n"
            "1. EACH AGENT must produce ONLY its assigned JSON structure.\n"
            "2. NEVER hallucinate numbers—use the deterministic data provided.\n"
            "3. ALL outputs must be raw, valid JSON. No markdown code fences like ```json.\n"
        ),
    )
    return groupchat.messages
