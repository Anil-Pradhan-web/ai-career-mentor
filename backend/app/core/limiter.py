# Copyright (c) 2026 Anil Pradhan. All rights reserved.
import os
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import settings

_limit_rules = ["100000/day"] if settings.DEBUG else ["1000/day", "100/hour"]
_redis_url = os.getenv("REDIS_URL", "memory://")

# Force in-memory rate limiting in local development to avoid slow/unstable external network queries
if settings.DEBUG or os.getenv("APP_ENV") == "development":
    _redis_url = "memory://"

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=_limit_rules,
    storage_uri=_redis_url,
)
