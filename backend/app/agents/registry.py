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

    original_provider = provider or (settings.LLM_PROVIDERS_ORDER[0] if settings.LLM_PROVIDERS_ORDER else settings.LLM_PROVIDER)
    if original_provider in ("google", "gemini"):
        original_provider = settings.LLM_PROVIDERS_ORDER[0] if settings.LLM_PROVIDERS_ORDER else settings.LLM_PROVIDER

    raw_fallback_chain = fallback_chain if fallback_chain is not None else _build_fallback_chain(original_provider)
    
    # Filter out providers that do not have their API keys configured in settings
    actual_fallback_chain = []
    for p in raw_fallback_chain:
        if p == "cerebras" and not settings.CEREBRAS_API_KEY:
            continue
        if p == "groq" and not settings.GROQ_API_KEY:
            continue
        if p == "openrouter" and not settings.OPENROUTER_API_KEY:
            continue
        actual_fallback_chain.append(p)

    if not actual_fallback_chain:
        logger.error("No configured LLM providers available in the fallback chain. Skipping LLM call.")
        return None

    # Find the first active provider that is not disabled by circuit breaker
    current_idx = 0
    while current_idx < len(actual_fallback_chain):
        provider_candidate = actual_fallback_chain[current_idx]
        cb = _get_circuit_breaker(provider_candidate)
        if time.time() < cb["disabled_until"]:
            logger.warning(f"Circuit breaker OPEN for [{provider_candidate}] — checking next fallback/provider.")
            current_idx += 1
        else:
            break

    if current_idx >= len(actual_fallback_chain):
        logger.error("All providers in fallback chain have open circuit breakers. Skipping LLM call.")
        return None

    from app.core.observability import track_llm_call, increment_fallback

    while current_idx < len(actual_fallback_chain):
        active_provider = actual_fallback_chain[current_idx]
        cb = _get_circuit_breaker(active_provider)
        
        # Double check circuit breaker state
        if time.time() < cb["disabled_until"]:
            current_idx += 1
            continue

        # Try this provider up to 2 times
        max_retries_per_provider = 2
        for attempt in range(max_retries_per_provider):
            try:
                start_time = time.time()
                # Dynamically resolve model ID for fallback provider to avoid 404s
                active_model = model
                if active_provider != original_provider:
                    if active_provider == "groq":
                        active_model = settings.GROQ_MODEL
                    elif active_provider == "openrouter":
                        active_model = settings.OPENROUTER_MODEL
                    elif active_provider == "cerebras":
                        active_model = settings.CEREBRAS_MODEL

                response_text, in_t, out_t = _dispatch(
                    active_provider,
                    system_prompt,
                    user_content,
                    model=active_model,
                    temperature=temperature,
                    json_mode=(response_model is not None)
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
                import traceback
                from app.core.observability import track_error
                track_error(
                    f"LLM call failed [{active_provider}] attempt {attempt + 1}/{max_retries_per_provider}: {exc}",
                    traceback_str=traceback.format_exc()
                )
                logger.error(
                    f"LLM call failed [{active_provider}] attempt {attempt + 1}/{max_retries_per_provider}: {exc}"
                )

                if attempt < max_retries_per_provider - 1:
                    time.sleep(1 * (attempt + 1))

        # Trip the circuit breaker for this specific provider since all attempts failed
        cb["disabled_until"] = time.time() + 60  # Disable for 60 seconds
        logger.error(f"Circuit breaker TRIPPED for [{active_provider}] due to failure — disabling calls for 60s to allow other agents to bypass it.")

        # Advance to the next provider in the chain
        current_idx += 1
        if current_idx < len(actual_fallback_chain):
            next_provider = actual_fallback_chain[current_idx]
            logger.warning(f"Falling back: {active_provider} → {next_provider}")
            increment_fallback(active_provider, next_provider)

    return None


def escape_json_string_control_chars(s: str) -> str:
    """
    Escapes unescaped ASCII control characters (0-31) and invalid backslashes
    inside JSON string literals (e.g. LaTeX equations generated by LLMs).
    """
    result = []
    in_string = False
    i = 0
    n = len(s)
    
    while i < n:
        char = s[i]
        if char == '"':
            # Check if this quote is escaped
            is_escaped = False
            backslashes = 0
            j = len(result) - 1
            while j >= 0 and result[j] == '\\':
                backslashes += 1
                j -= 1
            if backslashes % 2 == 1:
                is_escaped = True
            
            if not is_escaped:
                in_string = not in_string
            result.append(char)
            i += 1
        elif char == '\\' and in_string:
            # Check the escape sequence
            if i + 1 < n:
                next_char = s[i + 1]
                if next_char in ['"', '\\', '/', 'b', 'f', 'n', 'r', 't']:
                    # Valid simple escape
                    result.append('\\')
                    result.append(next_char)
                    i += 2
                elif next_char == 'u' and i + 5 < n and all(c in '0123456789abcdefABCDEF' for c in s[i+2:i+6]):
                    # Valid unicode escape
                    result.append('\\')
                    result.append('u')
                    for k in range(4):
                        result.append(s[i + 2 + k])
                    i += 6
                else:
                    # Invalid escape sequence! Double the backslash.
                    result.append('\\\\')
                    i += 1
            else:
                # Trailing backslash
                result.append('\\\\')
                i += 1
        else:
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
            i += 1
            
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

    # Strip markdown code fence ONLY if it wraps the entire response (outermost)
    if clean.startswith("```"):
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
    except Exception as exc:
        import traceback
        from app.core.observability import track_error
        track_error(
            f"JSON parse failed for response: {str(text)[:200]}...",
            traceback_str=traceback.format_exc()
        )
        logger.error(f"JSON parse failed for: {text[:200]}…")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Private helpers
# ─────────────────────────────────────────────────────────────────────────────

def _build_fallback_chain(provider: str) -> list[str]:
    chains = {
        "cerebras": ["cerebras", "groq", "openrouter"],
        "openrouter":   ["openrouter", "cerebras", "groq"],
        "groq":     ["groq",   "cerebras", "openrouter"],
    }
    return chains.get(provider, ["cerebras", "groq", "openrouter"])


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
    json_mode: bool = False,
) -> tuple[str, int, int]:
    """
    Route to the correct provider and return (raw_response_text, input_tokens, output_tokens).
    
    Each provider now receives the per-agent model name passed from LLMConfigManager.
    If model is None, the provider's own default (from settings) is used.
    """
    actual_model = model  # This is now set by LLMConfigManager per agent!
    if provider == "openrouter":
        return _call_openrouter(system_prompt, user_content, actual_model, temperature=temperature)
    elif provider == "groq":
        return _call_groq(system_prompt, user_content, actual_model, temperature=temperature, json_mode=json_mode)
    return _call_cerebras(system_prompt, user_content, actual_model, temperature=temperature, json_mode=json_mode)


def _call_openrouter(
    system_prompt: str,
    user_content: str,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
) -> tuple[str, int, int]:
    safe_prompt = system_prompt if "json" in system_prompt.lower() else system_prompt + "\n\nYou must output in JSON format."
    model_name = model or settings.OPENROUTER_MODEL
    temp = temperature if temperature is not None else 0.7
    with httpx.Client() as client:
        resp = client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://github.com/Anil-Pradhan-web/ai-career-mentor",
                "X-Title": "AI Career Mentor",
            },
            json={
                "model": model_name,
                "messages": [
                    {"role": "system", "content": safe_prompt},
                    {"role": "user",   "content": user_content},
                ],
                "temperature": temp,
            },
            timeout=45.0,
        )
    if resp.status_code != 200:
        raise ValueError(f"OpenRouter API {resp.status_code}: {resp.text}")
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
    json_mode: bool = False,
) -> tuple[str, int, int]:
    safe_prompt = system_prompt if "json" in system_prompt.lower() else system_prompt + "\n\nYou must output in JSON format."
    model_name = model or settings.GROQ_MODEL
    temp = temperature if temperature is not None else 0.7
    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": safe_prompt},
            {"role": "user",   "content": user_content},
        ],
        "temperature": temp,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    with httpx.Client() as client:
        resp = client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=45.0,
        )
    if resp.status_code != 200:
        raise ValueError(f"Groq API {resp.status_code}: {resp.text}")
    resp_json = resp.json()
    usage = resp_json.get("usage", {})
    in_t = usage.get("prompt_tokens", 0)
    out_t = usage.get("completion_tokens", 0)
    return resp_json["choices"][0]["message"]["content"], in_t, out_t


def _call_cerebras(
    system_prompt: str,
    user_content: str,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    json_mode: bool = False,
) -> tuple[str, int, int]:
    safe_prompt = system_prompt if "json" in system_prompt.lower() else system_prompt + "\n\nYou must output in JSON format."
    model_name = model or settings.CEREBRAS_MODEL
    temp = temperature if temperature is not None else 0.7
    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": safe_prompt},
            {"role": "user",   "content": user_content},
        ],
        "temperature": temp,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    with httpx.Client() as client:
        resp = client.post(
            "https://api.cerebras.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.CEREBRAS_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=45.0,
        )
    if resp.status_code != 200:
        raise ValueError(f"Cerebras API {resp.status_code}: {resp.text}")
    resp_json = resp.json()
    usage = resp_json.get("usage", {})
    in_t = usage.get("prompt_tokens", 0)
    out_t = usage.get("completion_tokens", 0)
    return resp_json["choices"][0]["message"]["content"], in_t, out_t



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