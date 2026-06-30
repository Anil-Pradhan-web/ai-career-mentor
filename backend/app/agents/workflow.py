"""
AI Career Operating System — LangGraph Orchestration.

TARGET PRODUCTION ARCHITECTURE (SUPERVISOR PATTERN):
  Supervisor -> Task Planner -> Agent Executor -> Validator -> Repair Agent

CURRENT IMPLEMENTATION:
  Static DAG with Parallel Fan-Out/Fan-In and Inline Validation/Repair loops.
  (Ready for migration to dynamic Supervisor Agent routing in v2)
"""
from typing import List, Dict, Any, Optional, Annotated
import operator
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from loguru import logger
import asyncio
import datetime

from app.core.resume.ats_engine import analyze_resume_deterministically
from app.core.market.service import get_market_intelligence
from app.core.search_engine import enrich_weeks_with_resources

# ── Agent imports from their owning API modules ───────────────────────────────
from app.api.resume import run_resume_agent
from app.api.market import run_market_agent
from app.api.linkedin import run_linkedin_agent
from app.core.roadmap.agents import run_roadmap_structure, run_roadmap_details_batch
from app.core.roadmap.helpers import generate_fallback_roadmap as _generate_fallback_roadmap

from app.models.validation import (
    ResumeAnalysisModel,
    MarketTrendsModel,
    LinkedInStrategyModel,
    RoadmapModel,
)


# ─────────────────────────────────────────────────────────────────────────────
# 1. STATE  — TypedDict, NOT Pydantic BaseModel
#    LangGraph's StateGraph requires TypedDict for state reducers to work.
# ─────────────────────────────────────────────────────────────────────────────
class CareerState(TypedDict):
    # Inputs
    resume_text: str
    target_role: str
    location: str
    provider: Optional[str]
    experience_level: Optional[str]
    learning_style: Optional[str]

    # Outputs (accumulated by nodes)
    resume_analysis: Optional[Dict[str, Any]]
    market_analysis: Optional[Dict[str, Any]]
    linkedin_strategy: Optional[Dict[str, Any]]
    roadmap: List[Dict[str, Any]]

    # Audit — Annotated with operator.add so parallel nodes can both append
    logs: Annotated[List[str], operator.add]
    errors: Annotated[List[str], operator.add]
    metadata: Dict[str, Any]


# ─────────────────────────────────────────────────────────────────────────────
# 2. VALIDATOR
# ─────────────────────────────────────────────────────────────────────────────
def validate_output(data: Any, model: Any) -> tuple[bool, str]:
    try:
        model.model_validate(data)
        return True, "Success"
    except Exception as e:
        return False, str(e)


# ─────────────────────────────────────────────────────────────────────────────
# 3. NODES
# ─────────────────────────────────────────────────────────────────────────────
async def resume_node(state: CareerState) -> dict:
    logger.info("OS_NODE: Resume Analysis Starting")
    ts = datetime.datetime.now().isoformat()
    new_logs = [f"[{ts}] Started Resume Analysis"]
    new_errors: List[str] = []

    det_resume = analyze_resume_deterministically(state["resume_text"], target_role=state.get("target_role"))
    analysis = await asyncio.to_thread(
        run_resume_agent, state["resume_text"], det_resume, state.get("target_role"), None
    )

    is_valid, err = validate_output(analysis, ResumeAnalysisModel)
    if not is_valid:
        new_errors.append(f"Resume validation failed: {err}")
        new_logs.append("!! REPAIR: using deterministic fallback")
        analysis = det_resume

    new_logs.append(f"[{datetime.datetime.now().isoformat()}] Resume Node Complete")

    return {
        "resume_analysis": analysis,
        "logs": new_logs,
        "errors": new_errors,
    }


async def market_node(state: CareerState) -> dict:
    logger.info("OS_NODE: Market Intelligence (Parallel)")
    ts = datetime.datetime.now().isoformat()
    new_logs = [f"[{ts}] Fetching Market Trends"]
    new_errors: List[str] = []

    det_market = await get_market_intelligence(
        state["target_role"], state["location"], None
    )
    analysis = await asyncio.to_thread(
        run_market_agent,
        state["target_role"],
        state["location"],
        det_market,
        None,
    )

    is_valid, err = validate_output(analysis, MarketTrendsModel)
    if not is_valid:
        new_errors.append(f"Market validation failed: {err}")
        analysis = det_market

    new_logs.append(f"[{datetime.datetime.now().isoformat()}] Market Node Complete")

    return {
        "market_analysis": analysis,
        "logs": new_logs,
        "errors": new_errors,
    }


async def linkedin_node(state: CareerState) -> dict:
    logger.info("OS_NODE: LinkedIn Optimization (Parallel)")
    ts = datetime.datetime.now().isoformat()
    new_logs = [f"[{ts}] Generating LinkedIn Strategy"]
    new_errors: List[str] = []

    strategy = await asyncio.to_thread(
        run_linkedin_agent,
        state["target_role"],
        state.get("resume_analysis"),
        state.get("market_analysis"),
        None,
    )

    is_valid, err = validate_output(strategy, LinkedInStrategyModel)
    if not is_valid:
        new_errors.append(f"LinkedIn validation failed: {err}")

    new_logs.append(f"[{datetime.datetime.now().isoformat()}] LinkedIn Node Complete")

    return {
        "linkedin_strategy": strategy,
        "logs": new_logs,
        "errors": new_errors,
    }


async def roadmap_aggregator_node(state: CareerState) -> dict:
    """Supervisor/Aggregator: waits for market + linkedin, then builds modular roadmap."""
    logger.info("OS_NODE: Roadmap Generation (Modular Steps)")
    ts = datetime.datetime.now().isoformat()
    new_logs = [f"[{ts}] Building Modular Roadmap"]
    new_errors: List[str] = []

    gaps = (state.get("resume_analysis") or {}).get("skill_gaps", [])
    market_trend = (state.get("market_analysis") or {}).get("market_trend", "Stable")

    # Step 1: LLM-generated week structure
    # Provider/model selection is handled centrally by LLMConfigManager
    exp_level = state.get("experience_level") or "intermediate"
    learn_style = state.get("learning_style") or "balanced"

    structure = await asyncio.to_thread(
        run_roadmap_structure,
        target_role=state["target_role"],
        skill_gaps=gaps,
        market_trend=market_trend,
        resume_analysis=state.get("resume_analysis"),
        experience_level=exp_level,
        learning_style=learn_style,
    )

    if not structure:
        new_errors.append("Roadmap structure returned empty — using fallback skeleton")
        structure = _generate_fallback_roadmap(state["target_role"], gaps)

    # Step 2: Per-week projects (Batched to save API rate limits: sizes 3, 3, 2)
    chunk_1 = structure[0:3]
    chunk_2 = structure[3:6]
    chunk_3 = structure[6:]

    # Run the chunks in parallel to drastically improve latency
    # Provider/model selection is handled centrally by LLMConfigManager
    tasks = [
        asyncio.to_thread(run_roadmap_details_batch, chunk, state["target_role"])
        for chunk in (chunk_1, chunk_2, chunk_3)
    ]
    batch_results = await asyncio.gather(*tasks)

    # Flatten the results
    detailed_weeks = []
    for batch in batch_results:
        detailed_weeks.extend(batch)

    # Step 3: Enrich with real resource URLs
    enriched_roadmap = await asyncio.to_thread(enrich_weeks_with_resources, detailed_weeks)

    is_valid, err = validate_output({"weeks": enriched_roadmap}, RoadmapModel)
    if not is_valid:
        new_errors.append(f"Roadmap validation failed: {err}")

    new_logs.append(f"[{datetime.datetime.now().isoformat()}] Analysis Complete")

    return {
        "roadmap": enriched_roadmap,
        "logs": new_logs,
        "errors": new_errors,
        "metadata": {
            "execution_time": "Completed",
            "agents_involved": 4,
            "roadmap_weeks": len(enriched_roadmap),
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# 4. GRAPH BUILDER
#
#  Flow:
#         START
#        /     \
#    resume   market
#      |   \ /   |
#      |    X    |
#      |   / \   |
#   linkedin  roadmap
#        \     /
#          END
#
#  Allows maximum concurrency. Total latency is:
#  max(resume, market) + max(linkedin, roadmap)
# ─────────────────────────────────────────────────────────────────────────────
def create_career_graph():
    workflow = StateGraph(CareerState)

    workflow.add_node("resume", resume_node)
    workflow.add_node("market", market_node)
    workflow.add_node("linkedin", linkedin_node)
    workflow.add_node("roadmap", roadmap_aggregator_node)

    # Parallel Start
    workflow.add_edge(START, "resume")
    workflow.add_edge(START, "market")

    # linkedin and roadmap wait for both resume and market to complete
    workflow.add_edge("resume", "linkedin")
    workflow.add_edge("market", "linkedin")

    workflow.add_edge("resume", "roadmap")
    workflow.add_edge("market", "roadmap")

    # Parallel End
    workflow.add_edge("linkedin", END)
    workflow.add_edge("roadmap", END)

    return workflow.compile()


# ─────────────────────────────────────────────────────────────────────────────
# 5. ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────
async def run_full_career_analysis(
    resume_text: str,
    target_role: str,
    location: str,
    provider: Optional[str] = None,
) -> dict:
    graph = create_career_graph()

    initial_state: CareerState = {
        "resume_text": resume_text,
        "target_role": target_role,
        "location": location,
        "provider": provider,
        "resume_analysis": None,
        "market_analysis": None,
        "linkedin_strategy": None,
        "roadmap": [],
        "logs": [],
        "errors": [],
        "metadata": {},
    }

    # ainvoke returns a dict of the final state — not a Pydantic model
    result: dict = await graph.ainvoke(initial_state)

    errors = result.get("errors", [])

    return {
        "status": "success" if not errors else "partial_success",
        "output": {
            "resume_analysis": result.get("resume_analysis"),
            "market_trends": result.get("market_analysis"),
            "roadmap": {
                "weeks": result.get("roadmap", []),
                "target_role": target_role,
            },
            "linkedin_strategy": result.get("linkedin_strategy"),
        },
        "logs": result.get("logs", []),
        "errors": errors,
        "metadata": result.get("metadata", {}),
    }