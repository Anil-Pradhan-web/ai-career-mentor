# Copyright (c) 2026 Anil Pradhan. All rights reserved.
import os
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from loguru import logger
from app.core.config import settings

def get_real_client_ip(request: Request) -> str:
    """
    Extract real client IP considering forward headers (Cloudflare, Vercel, Nginx, Render).
    Prevents all clients sharing a single proxy IP quota in production.
    """
    # 1. Cloudflare header
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.strip()

    # 2. Standard X-Forwarded-For header (first hop is the original client)
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
        if client_ip:
            return client_ip

    # 3. Nginx / reverse proxy X-Real-IP header
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()

    # 4. Fallback to direct client host
    try:
        return get_remote_address(request) or "127.0.0.1"
    except Exception:
        return "127.0.0.1"


# Default limits across endpoints
_limit_rules = ["100000/day"] if settings.DEBUG else ["10000/day", "1000/hour"]
_redis_url = os.getenv("REDIS_URL", "memory://")

# Force in-memory rate limiting in local development to avoid slow/unstable external network queries
if settings.DEBUG or os.getenv("APP_ENV") == "development" or not _redis_url:
    _redis_url = "memory://"
else:
    # Test Redis connectivity safely; fallback to memory:// if unavailable
    try:
        import redis
        _test_client = redis.from_url(_redis_url, socket_connect_timeout=2, socket_timeout=2)
        _test_client.ping()
        logger.info("[limiter] SlowAPI successfully connected to Redis storage.")
    except Exception as e:
        logger.warning(f"[limiter] Redis rate limiting storage unavailable ({e}). Falling back to memory://")
        _redis_url = "memory://"

# Standard rate limit decorator presets
AUTH_RATE_LIMIT = "15/minute"
AI_FEATURE_RATE_LIMIT = "30/minute"
STANDARD_RATE_LIMIT = "60/minute"

limiter = Limiter(
    key_func=get_real_client_ip,
    default_limits=_limit_rules,
    storage_uri=_redis_url,
)

