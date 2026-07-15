"""
Unified LLM Client Wrapper.
Centralizes LLM invocation logic for all agents, ensuring per-agent model selection,
uniform fallback, error handling, and logging.

Each agent now gets its OWN provider + model based on LLMConfigManager profiles.
"""
from typing import Any, Optional, Type
from loguru import logger
from pydantic import BaseModel

from app.agents import registry
from app.core.llm_config import LLMConfigManager


def _call_agent_llm(
    agent_name: str,
    system_prompt: str,
    user_content: str,
    response_model: Optional[Type[BaseModel]] = None,
    temperature: Optional[float] = None,
    allow_google: bool = False,
) -> Any:
    """
    Executes the LLM call using the per-agent model configuration from LLMConfigManager.
    
    Each agent gets its dedicated provider + model based on:
    1. .env override (AGENT_<NAME>_PROVIDER / AGENT_<NAME>_MODEL)
    2. Default profile from llm_config.py
    3. Global fallback
    """
    # Get per-agent config from the new Model Router
    agent_config = LLMConfigManager.get_agent_config(agent_name)
    provider = agent_config["provider"]
    model = agent_config["model"]
    temp = temperature if temperature is not None else agent_config["temperature"]
    fallback_chain = agent_config["fallback_chain"]

    logger.info(
        f"[{agent_name}] Sending LLM request → provider={provider}, "
        f"model={model}, temp={temp}"
    )

    result = registry.call_llm(
        system_prompt=system_prompt,
        user_content=user_content,
        provider=provider,
        model=model,
        response_model=response_model,
        allow_google=allow_google,
        temperature=temp,
        fallback_chain=fallback_chain,
    )
    return result


def run_resume_analysis(
    system_prompt: str,
    user_content: str,
    response_model: Type[BaseModel]
) -> Any:
    """Executes Resume Analyzer LLM Agent (uses Cerebras for structured JSON)."""
    return _call_agent_llm(
        agent_name="resume",
        system_prompt=system_prompt,
        user_content=user_content,
        response_model=response_model,
    )


def run_market_agent(
    system_prompt: str,
    user_content: str,
    response_model: Type[BaseModel]
) -> Any:
    """Executes Market Trends Enrichment Agent (uses Groq for reasoning)."""
    return _call_agent_llm(
        agent_name="market",
        system_prompt=system_prompt,
        user_content=user_content,
        response_model=response_model,
    )


def run_market_intelligence(
    system_prompt: str,
    user_content: str,
    response_model: Type[BaseModel],
    temperature: float = 0.2
) -> Any:
    """Executes Search-based Market Intelligence Summary Agent (uses Groq for reasoning)."""
    return _call_agent_llm(
        agent_name="market_intelligence",
        system_prompt=system_prompt,
        user_content=user_content,
        response_model=response_model,
        temperature=temperature,
    )


def run_linkedin_strategy(
    system_prompt: str,
    user_content: str,
    response_model: Type[BaseModel]
) -> Any:
    """Executes LinkedIn Content Strategy Builder Agent (uses OpenRouter for creative fallback)."""
    return _call_agent_llm(
        agent_name="linkedin",
        system_prompt=system_prompt,
        user_content=user_content,
        response_model=response_model,
    )


def run_roadmap_structure(
    system_prompt: str,
    user_content: str
) -> Any:
    """Executes Roadmap Skeleton Generation Agent (uses Cerebras for reasoning)."""
    return _call_agent_llm(
        agent_name="roadmap_structure",
        system_prompt=system_prompt,
        user_content=user_content,
    )


def run_roadmap_details(
    system_prompt: str,
    user_content: str
) -> Any:
    """Executes Roadmap Enriched Details Batch Agent (uses Groq for cheap/fast)."""
    return _call_agent_llm(
        agent_name="roadmap_details",
        system_prompt=system_prompt,
        user_content=user_content,
    )
