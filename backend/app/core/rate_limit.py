"""
Per-user daily AI feature rate limiter.

Uses Redis (Upstash) to track usage across multiple workers and restarts.
Falls back to in-memory tracking if REDIS_URL is not configured.

Bypassed if settings.DEBUG is True (Local machine testing).
"""

import os
from datetime import timezone, datetime, timedelta
from fastapi import HTTPException, status
from loguru import logger
import redis
from app.core.config import settings

# ── Limits config ─────────────────────────────────────────────────────────────
DAILY_LIMITS: dict[str, int] = {
    "interview":     1,
    "resume":        4,
    "roadmap":       1,
    "full_analysis": 1,
    "linkedin":      4,
    "market":        4,
}

# ── Redis Connection ──────────────────────────────────────────────────────────
REDIS_URL = os.getenv("REDIS_URL", "")
redis_client = None

if REDIS_URL and not settings.DEBUG:
    try:
        # Add 3s timeout to prevent startup hang on slow networks
        redis_client = redis.from_url(
            REDIS_URL, 
            decode_responses=True,
            socket_connect_timeout=3,
            socket_timeout=3
        )
        redis_client.ping()
        logger.info("Upstash Redis connection established for rate limiting.")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}. Falling back to in-memory.")
        redis_client = None

# ── In-memory Fallback ────────────────────────────────────────────────────────
_usage_fallback: dict[str, dict[str, dict]] = {}
_usage_block_fallback: dict[str, dict[str, dict]] = {}


def _get_today_str() -> str:
    """Current UTC date string (YYYY-MM-DD)."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def get_usage(user_id: str | int, feature: str) -> int:
    """Return how many times this user has used this feature today."""
    uid = str(user_id)
    today = _get_today_str()
    key = f"usage:{uid}:{feature}:{today}"

    if redis_client:
        try:
            val = redis_client.get(key)
            return int(val) if val else 0
        except Exception as e:
            logger.error(f"Redis get error: {e}")

    bucket = _usage_fallback.get(uid, {}).get(feature)
    if not bucket or bucket["date"] != today:
        return 0
    return bucket["count"]


def increment_usage(user_id: str | int, feature: str) -> int:
    """Increment counter for this user/feature. Returns new count."""
    # Bypass for local development/testing
    if settings.DEBUG:
        return 0

    uid = str(user_id)
    today = _get_today_str()
    key = f"usage:{uid}:{feature}:{today}"

    # Enforce 2-day gap block
    if feature in ("interview", "full_analysis"):
        if redis_client:
            try:
                redis_client.setex(
                    f"usage_block:{uid}:{feature}",
                    172800,  # 2 days in seconds (48 hours)
                    "blocked"
                )
                logger.info(f"[rate_limit] Set 2-day gap block for user={uid} feature={feature}")
            except Exception as e:
                logger.error(f"Redis setex block error: {e}")
        else:
            if uid not in _usage_block_fallback:
                _usage_block_fallback[uid] = {}
            _usage_block_fallback[uid][feature] = {
                "expires_at": datetime.now(timezone.utc) + timedelta(days=2)
            }
            logger.info(f"[rate_limit] Set in-memory 2-day gap block for user={uid} feature={feature}")

    if redis_client:
        try:
            new_count = redis_client.incr(key)
            if new_count == 1:
                redis_client.expire(key, timedelta(days=1))
            
            logger.info(f"[rate_limit] Redis increment: user={uid} feature={feature} count={new_count}")
            return int(new_count)
        except Exception as e:
            logger.error(f"Redis incr error: {e}")

    if uid not in _usage_fallback:
        _usage_fallback[uid] = {}

    bucket = _usage_fallback[uid].get(feature)
    if not bucket or bucket["date"] != today:
        _usage_fallback[uid][feature] = {"date": today, "count": 0}

    _usage_fallback[uid][feature]["count"] += 1
    new_count = _usage_fallback[uid][feature]["count"]

    logger.info(f"[rate_limit] In-memory increment: user={uid} feature={feature} count={new_count}")
    return new_count


def check_daily_limit(user_id: str | int, feature: str) -> None:
    """
    Check if user has exceeded their daily limit for this feature.
    Raises HTTP 429 if limit is reached.
    """
    # Bypass for local development/testing
    if settings.DEBUG:
        return

    uid = str(user_id)

    # Check 2-day gap block
    if feature in ("interview", "full_analysis"):
        if redis_client:
            try:
                block_exists = redis_client.exists(f"usage_block:{uid}:{feature}")
                if block_exists:
                    logger.warning(f"[rate_limit] 2-DAY GAP ACTIVE user={user_id} feature={feature}")
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="This feature can only be accessed once every 2 days. Please try again later.",
                    )
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Redis block check error: {e}")
        else:
            block = _usage_block_fallback.get(uid, {}).get(feature)
            if block:
                now = datetime.now(timezone.utc)
                if now < block["expires_at"]:
                    logger.warning(f"[rate_limit] In-memory 2-day gap active user={user_id} feature={feature}")
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="This feature can only be accessed once every 2 days. Please try again later.",
                    )

    if feature not in DAILY_LIMITS:
        return

    limit = DAILY_LIMITS[feature]
    current = get_usage(user_id, feature)

    if current >= limit:
        feature_display = feature.replace("_", " ").title()
        logger.warning(f"[rate_limit] LIMIT REACHED user={user_id} feature={feature} limit={limit}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Your daily limit for {feature_display} has been reached "
                f"({limit} uses/day). Please try again tomorrow."
            ),
        )
