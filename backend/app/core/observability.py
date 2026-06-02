import time
import os
import sentry_sdk
from datetime import datetime, date, timezone
from loguru import logger
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.core.rate_limit import redis_client
from app.models.models import DailyAnalytics

# ── Sentry SDK Initialization ───────────────────────────────────────────────
def init_sentry():
    if settings.SENTRY_DSN:
        try:
            sentry_sdk.init(
                dsn=settings.SENTRY_DSN,
                traces_sample_rate=1.0,
                environment=settings.APP_ENV,
            )
            logger.info("Sentry SDK initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Sentry: {e}")

# ── Real-Time Metrics Store & In-Memory Fallback ──────────────────────────────
_in_memory_metrics: Dict[str, Any] = {
    "active_users": {},       # user_id -> timestamp
    "active_ws": 0,
    "fallback_count": 0,
    "total_requests": 0,
    "total_tokens": 0,
    "estimated_cost": 0.0,
    "error_count": 0,
    "latencies": {},          # provider -> list of floats
    "error_logs": [],         # list of dicts {timestamp, message, traceback}
}

# ── API Calls & Token Cost Helpers ────────────────────────────────────────────
def track_llm_call(provider: str, latency: float, input_tokens: int, output_tokens: int) -> None:
    """Record LLM request latency, tokens, and estimated cost."""
    # Approximate pricing per 1M tokens (in USD)
    pricing = {
        "groq": {"input": 0.59, "output": 0.79},
        "nvidia": {"input": 0.70, "output": 0.70},
        "google": {"input": 0.075, "output": 0.30},
    }
    rates = pricing.get(provider.lower(), {"input": 0.0, "output": 0.0})
    cost = ((input_tokens / 1_000_000) * rates["input"]) + ((output_tokens / 1_000_000) * rates["output"])

    if redis_client:
        try:
            today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            # LPUSH latency and trim to keep last 50 entries
            lat_key = f"metrics:latency:{provider}"
            redis_client.lpush(lat_key, latency)
            redis_client.ltrim(lat_key, 0, 49)

            # Increment total counters
            redis_client.incrbyfloat(f"metrics:cost:{today}", cost)
            redis_client.incrby(f"metrics:tokens:{today}", input_tokens + output_tokens)
            redis_client.incrby(f"metrics:requests:{today}", 1)
            return
        except Exception as e:
            logger.error(f"Redis track_llm_call error: {e}")

    # Fallback to In-Memory
    _in_memory_metrics["total_requests"] += 1
    _in_memory_metrics["total_tokens"] += (input_tokens + output_tokens)
    _in_memory_metrics["estimated_cost"] += cost
    if provider not in _in_memory_metrics["latencies"]:
        _in_memory_metrics["latencies"][provider] = []
    _in_memory_metrics["latencies"][provider].append(latency)
    if len(_in_memory_metrics["latencies"][provider]) > 50:
        _in_memory_metrics["latencies"][provider].pop(0)


def increment_fallback(from_provider: str, to_provider: str) -> None:
    """Record LLM provider fallback events."""
    if redis_client:
        try:
            today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            redis_client.incrby(f"metrics:fallback:{today}", 1)
            return
        except Exception as e:
            logger.error(f"Redis increment_fallback error: {e}")

    _in_memory_metrics["fallback_count"] += 1


# ── Active Connection Trackers ────────────────────────────────────────────────
def track_active_websocket(action: str) -> None:
    """Track active WebSocket connections (interviews & voice assistant)."""
    if redis_client:
        try:
            if action == "connect":
                redis_client.incr("metrics:active_ws", 1)
            elif action == "disconnect":
                # Ensure we don't drop below 0
                val = redis_client.get("metrics:active_ws")
                if val and int(val) > 0:
                    redis_client.decr("metrics:active_ws", 1)
            return
        except Exception as e:
            logger.error(f"Redis track_active_websocket error: {e}")

    # Fallback
    if action == "connect":
        _in_memory_metrics["active_ws"] += 1
    elif action == "disconnect" and _in_memory_metrics["active_ws"] > 0:
        _in_memory_metrics["active_ws"] -= 1


def track_active_user(user_id: str | int) -> None:
    """Add user to active set and prune inactive users (>5 minutes)."""
    now_ts = time.time()
    uid = str(user_id)
    if redis_client:
        try:
            # ZADD active user
            redis_client.zadd("metrics:active_users", {uid: now_ts})
            # Prune inactive users (>5 mins ago)
            cutoff = now_ts - 300
            redis_client.zremrangebyscore("metrics:active_users", "-inf", cutoff)
            return
        except Exception as e:
            logger.error(f"Redis track_active_user error: {e}")

    # Fallback
    _in_memory_metrics["active_users"][uid] = now_ts
    # Prune in-memory older than 5 mins
    cutoff = now_ts - 300
    _in_memory_metrics["active_users"] = {
        u: t for u, t in _in_memory_metrics["active_users"].items() if t >= cutoff
    }


def get_active_users_count() -> int:
    """Get active users count."""
    if redis_client:
        try:
            now_ts = time.time()
            cutoff = now_ts - 300
            redis_client.zremrangebyscore("metrics:active_users", "-inf", cutoff)
            return redis_client.zcard("metrics:active_users")
        except Exception as e:
            logger.error(f"Redis get_active_users_count error: {e}")

    # Fallback
    now_ts = time.time()
    cutoff = now_ts - 300
    return len([t for t in _in_memory_metrics["active_users"].values() if t >= cutoff])


# ── Error Logging & Exception Trackers ────────────────────────────────────────
import json

def _persist_error(message: str, traceback_str: str = "") -> None:
    """Core persistence logic for error metrics without any logger.error calls to prevent sink loops."""
    err_obj = {
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "message": message,
        "traceback": traceback_str,
    }

    if redis_client:
        try:
            today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            redis_client.incrby(f"metrics:errors:{today}", 1)
            # Store in rolling list
            redis_client.lpush("metrics:error_logs", json.dumps(err_obj))
            redis_client.ltrim("metrics:error_logs", 0, 9)
            return
        except Exception:
            pass

    _in_memory_metrics["error_count"] += 1
    _in_memory_metrics["error_logs"].insert(0, err_obj)
    if len(_in_memory_metrics["error_logs"]) > 10:
        _in_memory_metrics["error_logs"].pop()


def track_error(message: str, traceback_str: str = "") -> None:
    """Log an error and track it in our rolling logs array."""
    logger.error(f"Observability Tracked Error: {message}")
    _persist_error(message, traceback_str)


# ── Loguru Global Error Interceptor ───────────────────────────────────────────
_sink_registered = False

def register_observability_sink() -> None:
    global _sink_registered
    if _sink_registered:
        return

    import traceback

    def observability_sink(message) -> None:
        try:
            record = message.record
            msg_str = record.get("message", "")

            # Avoid infinite recursion loop and ignore logs from this module
            if "Observability Tracked Error" in msg_str:
                return
            if record.get("name") == "app.core.observability":
                return

            # Extract traceback string if available
            traceback_str = ""
            exc = record.get("exception")
            if exc:
                traceback_str = "".join(traceback.format_exception(exc.type, exc.value, exc.traceback))

            _persist_error(msg_str, traceback_str)
        except Exception:
            pass

    logger.add(observability_sink, level="ERROR")
    _sink_registered = True

# Register sink automatically on import
register_observability_sink()


def get_error_logs() -> List[Dict[str, Any]]:
    """Retrieve the last 10 errors from Redis or in-memory."""
    import json
    if redis_client:
        try:
            logs = redis_client.lrange("metrics:error_logs", 0, 9)
            return [json.loads(log) for log in logs]
        except Exception as e:
            logger.error(f"Redis get_error_logs error: {e}")

    return _in_memory_metrics["error_logs"]


# ── PostgreSQL Rollup Scheduler ───────────────────────────────────────────────
_last_sync_time = 0.0

def sync_redis_to_postgres(db: Session) -> None:
    """Aggregates Redis metrics and syncs/saves them to Postgres."""
    global _last_sync_time
    import time
    now = time.time()
    if now - _last_sync_time < 60.0:
        return
    _last_sync_time = now

    today_date = datetime.now(timezone.utc).date()
    today_str = today_date.strftime("%Y-%m-%d")

    # Fetch daily summaries from Redis
    if redis_client:
        try:
            requests = int(redis_client.get(f"metrics:requests:{today_str}") or 0)
            tokens = int(redis_client.get(f"metrics:tokens:{today_str}") or 0)
            cost = float(redis_client.get(f"metrics:cost:{today_str}") or 0.0)
            fallbacks = int(redis_client.get(f"metrics:fallback:{today_str}") or 0)
            errors = int(redis_client.get(f"metrics:errors:{today_str}") or 0)
        except Exception as e:
            logger.error(f"Failed to fetch Redis rollup values: {e}")
            return
    else:
        # Fallback values
        requests = _in_memory_metrics["total_requests"]
        tokens = _in_memory_metrics["total_tokens"]
        cost = _in_memory_metrics["estimated_cost"]
        fallbacks = _in_memory_metrics["fallback_count"]
        errors = _in_memory_metrics["error_count"]

    try:
        # Check if record already exists for today
        analytics = db.query(DailyAnalytics).filter(DailyAnalytics.date == today_date).first()
        if not analytics:
            analytics = DailyAnalytics(date=today_date)
            db.add(analytics)

        analytics.total_requests = requests
        analytics.total_tokens = tokens
        analytics.estimated_cost = cost
        analytics.fallback_count = fallbacks
        analytics.error_count = errors

        db.commit()
        logger.info(f"Successfully synced metrics to Postgres for {today_str}.")
    except Exception as e:
        db.rollback()
        logger.error(f"Database error syncing metrics to Postgres: {e}")
