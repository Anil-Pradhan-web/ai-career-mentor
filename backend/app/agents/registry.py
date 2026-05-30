"""
Agent Registry — Thin LLM Caller Only.

This module is ONLY responsible for:
  1. Sending a prompt + user_content to an LLM provider
  2. Exponential backoff, circuit breaker, fallback chain
  3. Optional Pydantic structured-output parsing

Zero business logic. Zero prompts. Zero agent definitions.
All prompts and logic live in their respective API modules.
"""
import json
import time
from typing import Any, Optional, Type

import httpx
from loguru import logger
from pydantic import BaseModel

from app.core.config import settings

# ─────────────────────────────────────────────────────────────────────────────
# Circuit Breaker State (module-level singleton)
# ─────────────────────────────────────────────────────────────────────────────
_CIRCUIT_BREAKER = {"fails": 0, "disabled_until": 0.0}
_CIRCUIT_BREAKERS = {}


def _get_circuit_breaker(provider: str) -> dict:
    if provider not in _CIRCUIT_BREAKERS:
        _CIRCUIT_BREAKERS[provider] = {"fails": 0, "disabled_until": 0.0}
    return _CIRCUIT_BREAKERS[provider]


# ─────────────────────────────────────────────────────────────────────────────
# Public API — used by all agent modules
# ─────────────────────────────────────────────────────────────────────────────

def call_llm(
    system_prompt: str,
    user_content: str,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    response_model: Optional[Type[BaseModel]] = None,
    max_retries: int = 3,
    fallback_chain: Optional[list[str]] = None,
    allow_google: bool = True,
    temperature: Optional[float] = None,
) -> Any:
    """
    Unified LLM caller with:
      - Exponential backoff
      - Provider fallback chain (groq → google, nvidia → google)
      - Circuit breaker (trips after 5 consecutive failures, resets after 60s)
      - Optional structured-output parsing via Pydantic model

    Args:
        system_prompt:  The system/instruction prompt (owned by the caller).
        user_content:   The user-turn content (the data to process).
        provider:       LLM provider override ('groq', 'google', 'nvidia').
                        Falls back to settings.LLM_PROVIDER if None.
        model:          Specific model override.
        response_model: Optional Pydantic BaseModel for structured output.
        max_retries:    Max attempts before giving up.
        fallback_chain: Optional list of fallback providers to override the default.
        allow_google:   If False, prevents using or falling back to Google Gemini models.

    Returns:
        - Parsed dict if response_model provided and parsing succeeds.
        - Raw response string otherwise.
        - None on total failure.
    """
    # For backward compatibility with tests that override _CIRCUIT_BREAKER directly
    if time.time() < _CIRCUIT_BREAKER["disabled_until"]:
        logger.warning("Circuit breaker OPEN (global) — skipping LLM call.")
        return None

    active_provider = provider or settings.LLM_PROVIDER
    if active_provider == "gemini":
        active_provider = "google"

    if not allow_google and active_provider == "google":
        logger.info("Google provider requested but allow_google is False. Switching to groq.")
        active_provider = "groq"

    actual_fallback_chain = fallback_chain if fallback_chain is not None else _build_fallback_chain(active_provider)
    if not allow_google and actual_fallback_chain:
        actual_fallback_chain = [p for p in actual_fallback_chain if p != "google"]

    # Filter active_provider by provider-specific circuit breakers
    while active_provider:
        cb = _get_circuit_breaker(active_provider)
        if time.time() < cb["disabled_until"]:
            logger.warning(f"Circuit breaker OPEN for [{active_provider}] — checking fallback/next provider.")
            active_provider = _next_in_chain(active_provider, actual_fallback_chain)
        else:
            break

    if not active_provider:
        logger.error("All providers in fallback chain have open circuit breakers. Skipping LLM call.")
        return None

    from app.core.observability import track_llm_call, increment_fallback

    for attempt in range(max_retries):
        try:
            start_time = time.time()
            response_text, in_t, out_t = _dispatch(
                active_provider, system_prompt, user_content, model=model, temperature=temperature
            )
            latency = time.time() - start_time

            # Track successful LLM call metrics
            track_llm_call(active_provider, latency, in_t, out_t)

            if response_model and response_text:
                parsed = _parse_structured(response_text, response_model)
                _reset_circuit_breaker(active_provider)
                return parsed

            _reset_circuit_breaker(active_provider)
            return response_text

        except Exception as exc:
            logger.error(
                f"LLM call failed [{active_provider}] attempt {attempt + 1}/{max_retries}: {exc}"
            )

            # Record failure for this specific provider
            cb = _get_circuit_breaker(active_provider)
            cb["fails"] += 1
            if cb["fails"] >= 5:
                cb["disabled_until"] = time.time() + 60
                logger.error(f"Circuit breaker TRIPPED for [{active_provider}] — disabling calls for 60s.")

            # Try next provider in fallback chain immediately
            next_provider = _next_in_chain(active_provider, actual_fallback_chain)
            if next_provider:
                logger.warning(f"Falling back: {active_provider} → {next_provider}")
                increment_fallback(active_provider, next_provider)
                active_provider = next_provider
                continue

            time.sleep(2 ** attempt)

    return None


def escape_json_string_control_chars(s: str) -> str:
    """
    Escapes unescaped ASCII control characters (0-31) inside JSON string literals.
    Leaves structural whitespace (newlines/tabs outside string values) untouched.
    """
    result = []
    in_string = False
    escape = False
    for char in s:
        if char == '"':
            if not escape:
                in_string = not in_string
            escape = False
            result.append(char)
        elif char == '\\':
            if in_string:
                escape = not escape
            result.append(char)
        else:
            escape = False
            if in_string and ord(char) < 32:
                if char == '\n':
                    result.append('\\n')
                elif char == '\t':
                    result.append('\\t')
                elif char == '\r':
                    result.append('\\r')
                else:
                    result.append(f"\\u{ord(char):04x}")
            else:
                result.append(char)
    return "".join(result)


def parse_json(text: Any) -> Optional[Any]:
    """
    Robustly extract a JSON object or array from an LLM response string.
    Handles markdown code fences and partial JSON.
    """
    if not text:
        return None
    if isinstance(text, (dict, list)):
        return text

    import re

    clean = text.strip()

    # Strip markdown code fence
    match = re.search(r"```(?:json)?\s*(.*?)\s*```", clean, re.DOTALL)
    if match:
        clean = match.group(1).strip()
    else:
        # Find outermost [ ] or { }
        s_bracket, s_brace = clean.find("["), clean.find("{")
        if s_bracket != -1 and (s_brace == -1 or s_bracket < s_brace):
            start, end = s_bracket, clean.rfind("]")
        else:
            start, end = s_brace, clean.rfind("}")
        if start != -1 and end > start:
            clean = clean[start : end + 1].strip()

    clean = escape_json_string_control_chars(clean)
    try:
        return json.loads(clean)
    except Exception:
        logger.error(f"JSON parse failed for: {text[:200]}…")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Private helpers
# ─────────────────────────────────────────────────────────────────────────────

def _build_fallback_chain(provider: str) -> list[str]:
    chains = {
        "nvidia": ["nvidia", "groq", "google"],
        "groq":   ["groq",   "google", "nvidia"],
        "google": ["google", "groq",   "nvidia"],
    }
    return chains.get(provider, ["groq", "google", "nvidia"])


def _next_in_chain(current: str, chain: list[str]) -> Optional[str]:
    try:
        idx = chain.index(current)
        return chain[idx + 1] if idx + 1 < len(chain) else None
    except ValueError:
        return None


def _reset_circuit_breaker(provider: Optional[str] = None) -> None:
    if provider:
        cb = _get_circuit_breaker(provider)
        cb["fails"] = 0
    else:
        _CIRCUIT_BREAKERS.clear()
    _CIRCUIT_BREAKER["fails"] = 0


def _dispatch(
    provider: str,
    system_prompt: str,
    user_content: str,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
) -> tuple[str, int, int]:
    """Route to the correct provider and return (raw_response_text, input_tokens, output_tokens)."""
    if provider == "nvidia":
        return _call_nvidia(system_prompt, user_content, model, temperature=temperature)
    if provider == "groq":
        return _call_groq(system_prompt, user_content, model, temperature=temperature)
    return _call_google(system_prompt, user_content, model, temperature=temperature)


def _call_nvidia(
    system_prompt: str,
    user_content: str,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
) -> tuple[str, int, int]:
    safe_prompt = system_prompt if "json" in system_prompt.lower() else system_prompt + "\n\nYou must output in JSON format."
    model_name = model or settings.NVIDIA_MODEL
    temp = temperature if temperature is not None else 0.7
    with httpx.Client() as client:
        resp = client.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json={
                "model": model_name,
                "messages": [
                    {"role": "system", "content": safe_prompt},
                    {"role": "user",   "content": user_content},
                ],
                "temperature": temp,
                "max_tokens": 2048,
            },
            timeout=60.0,
        )
    if resp.status_code != 200:
        raise ValueError(f"NVIDIA API {resp.status_code}: {resp.text}")
    resp_json = resp.json()
    usage = resp_json.get("usage", {})
    in_t = usage.get("prompt_tokens", 0)
    out_t = usage.get("completion_tokens", 0)
    return resp_json["choices"][0]["message"]["content"], in_t, out_t


def _call_groq(
    system_prompt: str,
    user_content: str,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
) -> tuple[str, int, int]:
    safe_prompt = system_prompt if "json" in system_prompt.lower() else system_prompt + "\n\nYou must output in JSON format."
    model_name = model or settings.GROQ_MODEL
    temp = temperature if temperature is not None else 0.7
    with httpx.Client() as client:
        resp = client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": model_name,
                "messages": [
                    {"role": "system", "content": safe_prompt},
                    {"role": "user",   "content": user_content},
                ],
                "response_format": {"type": "json_object"},
                "temperature": temp,
            },
            timeout=60.0,
        )
    if resp.status_code != 200:
        raise ValueError(f"Groq API {resp.status_code}: {resp.text}")
    resp_json = resp.json()
    usage = resp_json.get("usage", {})
    in_t = usage.get("prompt_tokens", 0)
    out_t = usage.get("completion_tokens", 0)
    return resp_json["choices"][0]["message"]["content"], in_t, out_t


def _call_google(
    system_prompt: str,
    user_content: str,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
) -> tuple[str, int, int]:
    from google import genai
    from google.genai import types
    client = genai.Client(api_key=settings.GOOGLE_API_KEY)
    model_name = model or settings.GOOGLE_MODEL
    temp = temperature if temperature is not None else 0.8
    response = client.models.generate_content(
        model=model_name,
        contents=f"{system_prompt}\n\n{user_content}",
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=temp,
        ),
    )
    in_t = 0
    out_t = 0
    if response.usage_metadata:
        in_t = response.usage_metadata.prompt_token_count or 0
        out_t = response.usage_metadata.candidates_token_count or 0
    return response.text, in_t, out_t


def _parse_structured(response_text: str, response_model: Type[BaseModel]) -> dict:
    """Extract JSON from response_text and validate against response_model."""
    import re

    clean = response_text.strip()

    match = re.search(r"```(?:json)?\s*(.*?)\s*```", clean, re.DOTALL)
    if match:
        clean = match.group(1).strip()
    else:
        s_bracket, s_brace = clean.find("["), clean.find("{")
        if s_bracket != -1 and (s_brace == -1 or s_bracket < s_brace):
            start, end = s_bracket, clean.rfind("]")
        else:
            start, end = s_brace, clean.rfind("}")
        if start != -1 and end > start:
            clean = clean[start : end + 1].strip()

    clean = escape_json_string_control_chars(clean)
    parsed = response_model.model_validate_json(clean)
    return parsed.model_dump()