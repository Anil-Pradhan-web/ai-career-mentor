"""
Agent Registry — Thin LLM Caller Only.

Responsible for:
  1. Sending prompt + user_content to Groq or OpenRouter
  2. Exponential backoff, circuit breaker, fallback chain
  3. Optional Pydantic structured-output parsing
  4. Persistent connection pooling via shared httpx client

Standardized on Groq and OpenRouter. Gemini and NVIDIA completely purged.
"""
import json
import time
from typing import Any, Optional, Type, Union

import httpx
from loguru import logger
from pydantic import BaseModel

from app.core.config import settings

# -----------------------------------------------------------------------------
# Shared Persistent HTTP Client (Prevents socket thrashing on Render)
# -----------------------------------------------------------------------------
_http_client: Optional[httpx.Client] = None

def _get_http_client() -> httpx.Client:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.Client(
            timeout=90.0,
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=50),
        )
    return _http_client

# -----------------------------------------------------------------------------
# Circuit Breaker State (module-level singleton)
# -----------------------------------------------------------------------------
_CIRCUIT_BREAKER = {"fails": 0, "disabled_until": 0.0}
_CIRCUIT_BREAKERS: dict[str, dict] = {}
_CB_FAIL_THRESHOLD = 4       # failures before tripping
_CB_BASE_DISABLE_SECS = 20   # initial disable window (exponential on repeated trips)
_CB_PERMANENT_DISABLE_SECS = 3600  # long disable for auth/payment/billing errors


class ProviderAuthError(Exception):
    """Permanent provider failure (401 Unauthorized, 402 Payment Required, 403 Forbidden)."""


def _is_permanent_provider_error(exc: Exception) -> bool:
    """True if the error is a billing/auth problem that retrying will never fix."""
    return isinstance(exc, ProviderAuthError)


def _extract_rate_limit_wait(exc: Exception) -> float:
    """
    Parse the 'Please try again in X s' hint from provider 429 responses.
    Capped at 5s to avoid freezing the process.
    """
    import re as _re
    msg = str(exc)
    if "rate_limit_exceeded" not in msg and "429" not in msg:
        return 0.0
    match = _re.search(r"try again in\s*([0-9.]+)\s*s", msg)
    if match:
        return min(float(match.group(1)) + 0.5, 8.5)
    return 3.0  # generic rate-limit fallback wait


def _get_circuit_breaker(provider: str) -> dict:
    if provider not in _CIRCUIT_BREAKERS:
        _CIRCUIT_BREAKERS[provider] = {"fails": 0, "disabled_until": 0.0}
    return _CIRCUIT_BREAKERS[provider]


# -----------------------------------------------------------------------------
# Public API — used by all agent modules
# -----------------------------------------------------------------------------

def call_llm(
    system_prompt: str,
    user_content: str,
    provider: Optional[str] = None,
    model: Optional[str] = None,
    response_model: Optional[Type[BaseModel]] = None,
    max_retries: int = 3,
    fallback_chain: Optional[list[str]] = None,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    **kwargs: Any,
) -> Any:
    """
    Unified LLM caller with:
      - Exponential backoff
      - Provider fallback chain (groq <-> openrouter)
      - Circuit breaker
      - Optional structured-output parsing via Pydantic model
    """
    if time.time() < _CIRCUIT_BREAKER["disabled_until"]:
        logger.warning("Circuit breaker OPEN (global) — skipping LLM call.")
        return None

    original_provider = provider or (settings.LLM_PROVIDERS_ORDER[0] if settings.LLM_PROVIDERS_ORDER else settings.LLM_PROVIDER)

    raw_fallback_chain = fallback_chain if fallback_chain is not None else _build_fallback_chain(original_provider)
    
    # Filter out providers that do not have their API keys configured in settings
    actual_fallback_chain = []
    for p in raw_fallback_chain:
        if p == "openrouter" and not settings.OPENROUTER_API_KEY:
            continue
        if p == "groq" and not settings.GROQ_API_KEY:
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

        max_retries_per_provider = 2
        permanent_failure = False
        for attempt in range(max_retries_per_provider):
            try:
                start_time = time.time()
                active_model = model
                if active_provider != original_provider:
                    if active_provider == "groq":
                        active_model = settings.GROQ_MODEL
                    elif active_provider == "openrouter":
                        active_model = settings.OPENROUTER_MODEL

                response_text, in_t, out_t = _dispatch(
                    active_provider,
                    system_prompt,
                    user_content,
                    model=active_model,
                    temperature=temperature,
                    json_mode=(response_model is not None),
                    max_tokens=max_tokens,
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

                if _is_permanent_provider_error(exc):
                    logger.error(
                        f"Permanent provider failure [{active_provider}] — fail-fast. "
                        f"Disabling for {_CB_PERMANENT_DISABLE_SECS}s: {exc}"
                    )
                    cb["fails"] = 1
                    cb["disabled_until"] = time.time() + _CB_PERMANENT_DISABLE_SECS
                    permanent_failure = True
                    break

                track_error(
                    f"LLM call failed [{active_provider}] attempt {attempt + 1}/{max_retries_per_provider}: {exc}",
                    traceback_str=traceback.format_exc()
                )
                logger.error(
                    f"LLM call failed [{active_provider}] attempt {attempt + 1}/{max_retries_per_provider}: {exc}"
                )

                if attempt < max_retries_per_provider - 1:
                    wait = _extract_rate_limit_wait(exc)
                    if wait > 0:
                        logger.warning(
                            f"Rate-limited [{active_provider}] — waiting {wait:.1f}s before retry"
                        )
                        time.sleep(wait)
                    else:
                        time.sleep(1 * (attempt + 1))

        if not permanent_failure:
            cb["fails"] += 1
            trips = cb["fails"]
            disable_secs = min(_CB_BASE_DISABLE_SECS * (2 ** (trips - 1)), 60)
            cb["disabled_until"] = time.time() + disable_secs
            logger.error(
                f"Circuit breaker TRIPPED for [{active_provider}] "
                f"(fail #{trips}, disabled {disable_secs}s)."
            )

        current_idx += 1
        if current_idx < len(actual_fallback_chain):
            next_provider = actual_fallback_chain[current_idx]
            logger.warning(f"Falling back: {active_provider} → {next_provider}")
            increment_fallback(active_provider, next_provider)

    return None


def escape_json_string_control_chars(s: str) -> str:
    """
    Escapes unescaped ASCII control characters (0-31) and invalid backslashes
    inside JSON string literals.
    """
    result = []
    in_string = False
    i = 0
    n = len(s)
    
    while i < n:
        char = s[i]
        if char == '"':
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
            if i + 1 < n:
                next_char = s[i + 1]
                if next_char in ['"', '\\', '/', 'b', 'f', 'n', 'r', 't']:
                    result.append('\\')
                    result.append(next_char)
                    i += 2
                elif next_char == 'u' and i + 5 < n and all(c in '0123456789abcdefABCDEF' for c in s[i+2:i+6]):
                    result.append('\\')
                    result.append('u')
                    for k in range(4):
                        result.append(s[i + 2 + k])
                    i += 6
                else:
                    result.append('\\\\')
                    i += 1
            else:
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


def parse_json(raw: Any) -> Optional[Union[dict, list]]:
    """Parse JSON string, dictionary, or list, with markdown fence stripping and repair."""
    if raw is None or raw == "":
        return None
    if isinstance(raw, (dict, list)):
        return raw
    if not isinstance(raw, str):
        return None

    clean = raw.strip()
    if not clean:
        return None

    import re
    import json

    # Try direct parse first if it already starts and ends with braces/brackets
    if (clean.startswith("{") and clean.endswith("}")) or (clean.startswith("[") and clean.endswith("]")):
        target = escape_json_string_control_chars(clean)
        try:
            return json.loads(target)
        except Exception:
            repaired = re.sub(r',\s*([}\]])', r'\1', target)
            try:
                return json.loads(repaired)
            except Exception:
                pass

    # If wrapped in markdown code fence
    fence_match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", clean, re.DOTALL)
    candidate = clean
    if fence_match and (clean.startswith("```") or not (clean.startswith("{") or clean.startswith("["))):
        candidate = fence_match.group(1).strip()
    
    # Check for { or [ in candidate
    s_bracket, s_brace = candidate.find("["), candidate.find("{")
    if s_bracket != -1 and (s_brace == -1 or s_bracket < s_brace):
        start, end = s_bracket, candidate.rfind("]")
        if start != -1 and end > start:
            candidate = candidate[start : end + 1].strip()
        else:
            # Handle truncated JSON array: find last '}' before end
            last_brace = candidate.rfind("}")
            if start != -1 and last_brace > start:
                candidate = candidate[start : last_brace + 1].strip() + "\n]"
    else:
        start, end = s_brace, candidate.rfind("}")
        if start != -1 and end > start:
            candidate = candidate[start : end + 1].strip()

    candidate = escape_json_string_control_chars(candidate)
    try:
        return json.loads(candidate)
    except Exception:
        repaired = re.sub(r',\s*([}\]])', r'\1', candidate)
        try:
            return json.loads(repaired)
        except Exception:
            pass

    return None


# -----------------------------------------------------------------------------
# Private helpers & callers
# -----------------------------------------------------------------------------

def _build_fallback_chain(provider: str) -> list[str]:
    chains = {
        "groq": ["groq", "openrouter"],
        "openrouter": ["openrouter", "groq"],
    }
    return chains.get(provider, ["groq", "openrouter"])


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
        cb["disabled_until"] = 0.0
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
    max_tokens: Optional[int] = None,
) -> tuple[str, int, int]:
    """
    Route to the correct provider and return (raw_response_text, input_tokens, output_tokens).
    """
    actual_model = model
    if provider == "openrouter":
        return _call_openrouter(system_prompt, user_content, actual_model, temperature=temperature, json_mode=json_mode, max_tokens=max_tokens)
    elif provider == "groq":
        return _call_groq(system_prompt, user_content, actual_model, temperature=temperature, json_mode=json_mode, max_tokens=max_tokens)
    
    # Fallback to configured provider
    if settings.OPENROUTER_API_KEY:
        return _call_openrouter(system_prompt, user_content, actual_model, temperature=temperature, json_mode=json_mode, max_tokens=max_tokens)
    return _call_groq(system_prompt, user_content, actual_model, temperature=temperature, json_mode=json_mode, max_tokens=max_tokens)


def _call_groq(
    system_prompt: str,
    user_content: str,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    json_mode: bool = False,
    max_tokens: Optional[int] = None,
) -> tuple[str, int, int]:
    safe_prompt = system_prompt if "json" in system_prompt.lower() else system_prompt + "\n\nYou must output in JSON format."
    model_name = model or settings.GROQ_MODEL
    temp = temperature if temperature is not None else 0.7
    req_tokens = max_tokens or (2500 if "qwen" in model_name.lower() else 4096)
    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": safe_prompt},
            {"role": "user",   "content": user_content},
        ],
        "temperature": temp,
        "max_tokens": req_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    client = _get_http_client()
    resp = client.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
    )
    if resp.status_code != 200:
        if resp.status_code in (401, 402, 403):
            raise ProviderAuthError(f"Groq API {resp.status_code}: {resp.text}")
        raise ValueError(f"Groq API {resp.status_code}: {resp.text}")
    resp_json = resp.json()
    usage = resp_json.get("usage", {})
    in_t = usage.get("prompt_tokens", 0)
    out_t = usage.get("completion_tokens", 0)
    msg = resp_json["choices"][0]["message"]
    content = msg.get("content") or msg.get("reasoning") or ""
    return content, in_t, out_t


def _call_openrouter(
    system_prompt: str,
    user_content: str,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    json_mode: bool = False,
    max_tokens: Optional[int] = None,
) -> tuple[str, int, int]:
    safe_prompt = system_prompt if "json" in system_prompt.lower() else system_prompt + "\n\nYou must output in JSON format."
    model_name = model or settings.OPENROUTER_MODEL
    temp = temperature if temperature is not None else 0.7
    req_tokens = max_tokens or 4096
    payload = {
        "messages": [
            {"role": "system", "content": safe_prompt},
            {"role": "user",   "content": user_content},
        ],
        "temperature": temp,
        "max_tokens": req_tokens,
    }
    if "," in model_name:
        payload["models"] = [m.strip() for m in model_name.split(",") if m.strip()]
    else:
        payload["model"] = model_name

    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    client = _get_http_client()
    resp = client.post(
        f"{settings.OPENROUTER_BASE_URL}/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ai-career-mentor.vercel.app",
            "X-Title": "AI Career Mentor",
        },
        json=payload,
    )
    if resp.status_code != 200:
        if resp.status_code in (401, 402, 403):
            raise ProviderAuthError(f"OpenRouter API {resp.status_code}: {resp.text}")
        raise ValueError(f"OpenRouter API {resp.status_code}: {resp.text}")
    resp_json = resp.json()
    usage = resp_json.get("usage", {})
    in_t = usage.get("prompt_tokens", 0)
    out_t = usage.get("completion_tokens", 0)
    msg = resp_json["choices"][0]["message"]
    content = msg.get("content") or msg.get("reasoning") or ""
    return content, in_t, out_t


def _normalize_llm_output(data: dict, model_name: str) -> dict:
    """
    Normalize common LLM output format mismatches before Pydantic validation.
    """
    if not isinstance(data, dict):
        return data

    if "top_skills_freq" in data:
        val = data["top_skills_freq"]
        if isinstance(val, dict):
            data["top_skills_freq"] = [
                {"skill": k, "frequency": v} for k, v in val.items()
            ]
        elif isinstance(val, list):
            normalized = []
            for item in val:
                if isinstance(item, dict):
                    skill = item.get("skill") or item.get("name") or item.get("technology") or item.get("skill_name") or ""
                    freq = item.get("frequency") or item.get("freq") or item.get("score") or item.get("demand") or 50
                    if isinstance(freq, str) and freq.isdigit():
                        freq = int(freq)
                    normalized.append({"skill": str(skill), "frequency": int(freq) if isinstance(freq, (int, float)) else 50})
            data["top_skills_freq"] = normalized

    if "hiring_companies" in data and isinstance(data["hiring_companies"], list):
        normalized = []
        for item in data["hiring_companies"]:
            if isinstance(item, dict):
                name = item.get("name") or item.get("company") or item.get("company_name") or item.get("employer") or ""
                vol = item.get("hiring_volume") or item.get("status") or item.get("volume") or item.get("openings") or "Active openings"
                normalized.append({"name": str(name), "hiring_volume": str(vol)})
        data["hiring_companies"] = normalized

    if "salary_range" in data and isinstance(data["salary_range"], dict):
        sr = data["salary_range"]
        if "formatted" not in sr or not sr["formatted"]:
            mn, mx, cur = sr.get("min"), sr.get("max"), sr.get("currency", "")
            if mn and mx:
                sr["formatted"] = f"{cur}{mn:,.0f} - {cur}{mx:,.0f} per annum"

    if "headlines" in data and isinstance(data["headlines"], str):
        data["headlines"] = [h.strip() for h in data["headlines"].split("\n") if h.strip()]

    return data


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

    import json
    try:
        raw = json.loads(clean)
    except Exception:
        # Auto-repair trailing commas before closing braces/brackets
        repaired = re.sub(r',\s*([}\]])', r'\1', clean)
        try:
            raw = json.loads(repaired)
        except Exception:
            raw = None

    if isinstance(raw, dict):
        raw = _normalize_llm_output(raw, model_name=response_model.__name__)
        validated = response_model.model_validate(raw)
        return validated.model_dump()
    elif isinstance(raw, list):
        return raw

    try:
        validated = response_model.model_validate_json(clean)
        return validated.model_dump()
    except Exception:
        # Try validating with repaired trailing commas
        repaired = re.sub(r',\s*([}\]])', r'\1', clean)
        validated = response_model.model_validate_json(repaired)
        return validated.model_dump()