"""
AI Career Operating System — LangGraph Orchestration.
Architecture: Supervisor Pattern + Validation Layer + Parallel Concurrency.
"""
from typing import List, Dict, Any, Optional, Union, Annotated
import operator
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, START, END
from loguru import logger
import asyncio
import datetime

from app.core.ats_engine import analyze_resume_deterministically
from app.core.market.service import get_market_intelligence
from app.core.search_engine import enrich_weeks_with_resources
from app.agents.registry import (
    run_resume_analyst,
    run_market_researcher,
    run_roadmap_structure,
    run_roadmap_details,
    run_linkedin_optimizer
)
from app.models.validation import (
    ResumeAnalysisModel,
    MarketTrendsModel,
    LinkedInStrategyModel,
    RoadmapModel
)

# 1. THE STATE (REDUCED FOR CONCURRENCY)
class CareerState(BaseModel):
    # Inputs
    resume_text: str
    target_role: str
    location: str
    provider: Optional[str] = None
    
    # Outputs (Validated)
    resume_analysis: Optional[Dict[str, Any]] = None
    market_analysis: Optional[Dict[str, Any]] = None
    linkedin_strategy: Optional[Dict[str, Any]] = None
    roadmap: List[Dict[str, Any]] = []
    
    # Audit & OS Layer (Using reducers for parallel safety)
    logs: Annotated[List[str], operator.add] = []
    metadata: Dict[str, Any] = {}
    errors: Annotated[List[str], operator.add] = []

# 2. THE VALIDATOR (CRITICAL HARDENING)
def validate_output(data: Any, model: Any) -> tuple[bool, str]:
    """Validates LLM output against Pydantic models."""
    try:
        model.model_validate(data)
        return True, "Success"
    except Exception as e:
        return False, str(e)

# 3. NODES
async def resume_node(state: CareerState):
    logger.info("OS_PROCESS: Resume Analysis Starting")
    new_logs = [f"[{datetime.datetime.now()}] Started Resume Analysis"]
    new_errors = []
    
    det_resume = analyze_resume_deterministically(state.resume_text)
    analysis = await asyncio.to_thread(run_resume_analyst, state.resume_text, det_resume, state.provider)
    
    # Validation
    is_valid, err = validate_output(analysis, ResumeAnalysisModel)
    if not is_valid:
        new_errors.append(f"Resume validation failed: {err}")
        new_logs.append("!! REPAIR: Resume analysis failed validation, using deterministic fallback")
        analysis = det_resume # Hard Fallback
        
    return {
        "resume_analysis": analysis,
        "logs": new_logs,
        "errors": new_errors
    }

async def market_node(state: CareerState):
    logger.info("OS_PROCESS: Market Intelligence (Parallel)")
    new_logs = [f"[{datetime.datetime.now()}] Fetching Market Trends"]
    new_errors = []
    
    det_market = await get_market_intelligence(state.target_role, state.location, state.provider)
    analysis = await asyncio.to_thread(run_market_researcher, state.target_role, state.location, det_market, state.provider)
    
    is_valid, err = validate_output(analysis, MarketTrendsModel)
    if not is_valid:
        new_errors.append(f"Market validation failed: {err}")
        analysis = det_market # Fallback
        
    return {
        "market_analysis": analysis,
        "logs": new_logs,
        "errors": new_errors
    }

async def linkedin_node(state: CareerState):
    logger.info("OS_PROCESS: LinkedIn Optimization (Parallel)")
    new_logs = [f"[{datetime.datetime.now()}] Generating LinkedIn Strategy"]
    new_errors = []
    
    strategy = await asyncio.to_thread(
        run_linkedin_optimizer, 
        state.target_role, 
        state.resume_analysis,
        state.market_analysis,
        state.provider
    )
    
    is_valid, err = validate_output(strategy, LinkedInStrategyModel)
    if not is_valid:
        new_errors.append(f"LinkedIn validation failed: {err}")
        
    return {
        "linkedin_strategy": strategy,
        "logs": new_logs,
        "errors": new_errors
    }

async def roadmap_aggregator_node(state: CareerState):
    """Supervisor/Aggregator: Waits for parallel nodes and builds the modular roadmap."""
    logger.info("OS_PROCESS: Roadmap Generation (Modular Steps)")
    new_logs = [f"[{datetime.datetime.now()}] Building Modular Roadmap"]
    new_errors = []
    
    # Step 1: Structure
    gaps = state.resume_analysis.get("skill_gaps", []) if state.resume_analysis else []
    market_trend = state.market_analysis.get("market_trend", "Stable") if state.market_analysis else "Stable"
    structure = await asyncio.to_thread(run_roadmap_structure, state.target_role, gaps, market_trend, state.provider)
    
    # Step 2: Projects (With rate-limit protection: Semaphore 2)
    # This prevents hitting RPM limits of Gemini/Groq Free Tiers
    sem = asyncio.Semaphore(2)
    async def sem_task(week):
        async with sem:
            return await asyncio.to_thread(run_roadmap_details, week, state.target_role, state.provider)

    tasks = [sem_task(week) for week in structure]
    detailed_weeks = await asyncio.gather(*tasks)
    
    # Step 3: Resources
    enriched_roadmap = await asyncio.to_thread(enrich_weeks_with_resources, detailed_weeks)
    
    # Validation
    is_valid, err = validate_output({"weeks": enriched_roadmap}, RoadmapModel)
    if not is_valid:
        new_errors.append(f"Roadmap validation failed: {err}")
        
    new_logs.append(f"[{datetime.datetime.now()}] Analysis Complete")
    
    return {
        "roadmap": enriched_roadmap,
        "logs": new_logs,
        "errors": new_errors,
        "metadata": {"execution_time": "Completed", "agents_involved": 4}
    }

# 4. BUILD THE GRAPH
def create_career_graph():
    workflow = StateGraph(CareerState)
    
    workflow.add_node("resume", resume_node)
    workflow.add_node("market", market_node)
    workflow.add_node("linkedin", linkedin_node)
    workflow.add_node("roadmap", roadmap_aggregator_node)
    
    # FLOW: Resume -> [Market, LinkedIn] in parallel
    workflow.add_edge(START, "resume")
    workflow.add_edge("resume", "market")
    workflow.add_edge("resume", "linkedin")
    
    # FLOW: [Market, LinkedIn] -> Roadmap Join
    workflow.add_edge("market", "roadmap")
    workflow.add_edge("linkedin", "roadmap")
    
    workflow.add_edge("roadmap", END)
    
    return workflow.compile()

# 5. ENTRY POINT
async def run_full_career_analysis(resume_text: str, target_role: str, location: str, provider: str = None) -> dict:
    graph = create_career_graph()
    initial_state = CareerState(
        resume_text=resume_text,
        target_role=target_role,
        location=location,
        provider=provider
    )
    
    # LangGraph ainvoke returns a dictionary of the final state
    result = await graph.ainvoke(initial_state)
    
    errors = result.get("errors", [])
    logs = result.get("logs", [])
    
    # Return separated concerns
    return {
        "status": "success" if not errors else "partial_success",
        "output": {
            "resume_analysis": result.get("resume_analysis"),
            "market_trends": result.get("market_analysis"),
            "roadmap": { "weeks": result.get("roadmap", []), "target_role": target_role },
            "linkedin_strategy": result.get("linkedin_strategy")
        },
        "logs": logs,
        "errors": errors,
        "metadata": result.get("metadata", {})
    }
