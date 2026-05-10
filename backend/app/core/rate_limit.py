"""
Per-user daily AI feature rate limiter.

Uses Redis (Upstash) to track usage across multiple workers and restarts.
Falls back to in-memory tracking if REDIS_URL is not configured.

Usage limits (per user, per calendar day UTC):
  - interview    : 3
  - resume       : 4
  - roadmap      : 3
  - full_analysis: 4
  - linkedin     : 10
  - market       : 4
"""

import os
from datetime import timezone, datetime, timedelta
from fastapi import HTTPException, status
from loguru import logger
import redis

# ── Limits config ─────────────────────────────────────────────────────────────
DAILY_LIMITS: dict[str, int] = {
    "interview":     3,
    "resume":        4,
    "roadmap":       3,
    "full_analysis": 4,
    "linkedin":      10,
    "market":        4,
}

# ── Redis Connection ──────────────────────────────────────────────────────────
REDIS_URL = os.getenv("REDIS_URL", "")
redis_client = None

if REDIS_URL:
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        redis_client.ping()
        logger.info("Upstash Redis connection established for rate limiting.")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}. Falling back to in-memory.")
        redis_client = None

# ── In-memory Fallback ────────────────────────────────────────────────────────
# Structure: { user_id: { feature: { "date": str, "count": int } } }
_usage_fallback: dict[str, dict[str, dict]] = {}


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
            # fall through to in-memory check if redis fails

    bucket = _usage_fallback.get(uid, {}).get(feature)
    if not bucket or bucket["date"] != today:
        return 0
    return bucket["count"]


def increment_usage(user_id: str | int, feature: str) -> int:
    """Increment counter for this user/feature. Returns new count."""
    uid = str(user_id)
    today = _get_today_str()
    key = f"usage:{uid}:{feature}:{today}"

    if redis_client:
        try:
            # Increment and set expiry to 24 hours to auto-cleanup
            new_count = redis_client.incr(key)
            if new_count == 1:
                redis_client.expire(key, timedelta(days=1))
            
            logger.info(f"[rate_limit] Redis increment: user={uid} feature={feature} count={new_count}")
            return int(new_count)
        except Exception as e:
            logger.error(f"Redis incr error: {e}")

    # Fallback to in-memory
    if uid not in _usage_fallback:
        _usage_fallback[uid] = {}

    bucket = _usage_fallback[uid].get(feature)
    if not bucket or bucket["date"] != today:
        _usage_fallback[uid][feature] = {"date": today, "count": 0}

    _usage_fallback[uid][feature]["count"] += 1
    new_count = _usage_fallback[uid][feature]["count"]

    logger.info(
        f"[rate_limit] In-memory increment: user={uid} feature={feature} "
        f"count={new_count}/{DAILY_LIMITS.get(feature, 'unlimited')} date={today}"
    )
    return new_count


def check_daily_limit(user_id: str | int, feature: str) -> None:
    """
    Check if user has exceeded their daily limit for this feature.
    Raises HTTP 429 if limit is reached.
    """
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
