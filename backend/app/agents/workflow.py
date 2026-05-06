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
        llm_config=llm_config,
    )

    user_proxy.initiate_chat(

        manager,

        message=(

            f"RESUME DATA:\n"
            f"{resume_text}\n\n"

            f"TARGET ROLE:\n"
            f"{target_role}\n\n"

            f"TARGET LOCATION:\n"
            f"{location}\n\n"

            "====================================================\n"
            "MULTI-AGENT EXECUTION PROTOCOL\n"
            "====================================================\n\n"

            "You are an elite AI hiring intelligence panel composed "
            "of senior recruiters, staff engineers, compensation analysts, "
            "and career strategists.\n\n"

            "Your responsibility is to collaboratively generate a complete "
            "career analysis pipeline with STRICT execution sequencing.\n\n"

            "====================================================\n"
            "MANDATORY EXECUTION ORDER\n"
            "====================================================\n\n"

            "STEP 1 → Resume_Analyst\n"
            "Responsibilities:\n"
            "- Analyze the resume deeply.\n"
            "- Extract technical skills.\n"
            "- Infer soft skills.\n"
            "- Estimate years of experience.\n"
            "- Calculate ATS score with detailed breakdown.\n"
            "- Identify EXACTLY 5 advanced skill gaps.\n"
            "- Infer the candidate's likely hiring readiness.\n\n"

            "STRICT RULES:\n"
            "- Output ONLY raw JSON.\n"
            "- No markdown.\n"
            "- No explanations.\n"
            "- No conversational text.\n\n"

            "WAIT until Resume_Analyst completes before continuing.\n\n"

            "----------------------------------------------------\n\n"

            "STEP 2 → Market_Researcher\n"
            "Responsibilities:\n"
            "- Execute the search_job_trends tool.\n"
            f"- Use role='{target_role}'\n"
            f"- Use location='{location}'\n"
            "- Analyze current hiring trends.\n"
            "- Generate realistic compensation insights.\n"
            "- Identify high-demand market skills.\n"
            "- Detect hiring trend direction.\n"
            "- Identify companies actively hiring.\n\n"

            "STRICT RULES:\n"
            "- MUST use the search_job_trends tool.\n"
            "- MUST wait for tool output before responding.\n"
            "- MUST synthesize realistic market intelligence.\n"
            "- Output ONLY raw JSON.\n"
            "- No markdown.\n"
            "- No hallucinated salary ranges.\n\n"

            "WAIT until Market_Researcher completes before continuing.\n\n"

            "----------------------------------------------------\n\n"

            "STEP 3 → Career_Coach\n"
            "Responsibilities:\n"
            "- Analyze Resume_Analyst output.\n"
            "- Analyze Market_Researcher output.\n"
            "- Build a hyper-personalized 8-week roadmap.\n"
            "- Bridge identified skill gaps.\n"
            "- Prioritize market-demand technologies.\n"
            "- Focus on production-level engineering skills.\n"
            "- Include portfolio-worthy projects.\n"
            "- Ensure progression from fundamentals → advanced systems.\n\n"

            "STRICT RULES:\n"
            "- Output ONLY raw JSON array.\n"
            "- EXACTLY 8 roadmap objects.\n"
            "- No markdown.\n"
            "- No conversational text.\n"
            "- No placeholders.\n"
            "- No generic beginner projects.\n\n"

            "====================================================\n"
            "GLOBAL SYSTEM RULES\n"
            "====================================================\n\n"

            "1. NEVER hallucinate data.\n"
            "2. NEVER wrap JSON using markdown.\n"
            "3. NEVER add explanations outside JSON.\n"
            "4. NEVER skip execution order.\n"
            "5. NEVER combine multiple agent outputs together.\n"
            "6. EACH AGENT must produce ONLY its assigned JSON structure.\n"
            "7. ALL outputs must be machine-parseable valid JSON.\n"
            "8. Maintain production-grade realism and hiring accuracy.\n"
            "9. Prefer modern industry-standard technologies.\n"
            "10. Recommendations must reflect current hiring market realities.\n"
        ),
    )
    return groupchat.messages
