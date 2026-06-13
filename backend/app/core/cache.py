import hashlib
import json
import time
from loguru import logger
from typing import Optional
from app.core.rate_limit import redis_client

CACHE_EXPIRY_SECONDS = 60 * 60 * 24 * 7  # 7 days

# In-memory fallback cache for when Redis is offline or not configured
_cache_fallback: dict[str, dict] = {}

def _generate_key(prefix: str, *args) -> str:
    """Generate a unique SHA-256 hash key based on inputs."""
    raw = "|".join(str(arg).strip().lower() for arg in args)
    hash_obj = hashlib.sha256(raw.encode("utf-8"))
    return f"ai_cache:{prefix}:{hash_obj.hexdigest()}"

def get_cached_response(prefix: str, *args) -> Optional[dict]:
    """Retrieve cached AI response if it exists."""
    from app.core.config import settings
    
    # Always bypass cache in local DEBUG mode
    if settings.DEBUG:
        return None

    key = _generate_key(prefix, *args)

    if redis_client:
        try:
            val = redis_client.get(key)
            if val:
                logger.info(f"[cache] Redis HIT: {prefix} ({key[-8:]})")
                return json.loads(val)
        except Exception as e:
            logger.error(f"[cache] Redis GET error: {e}")
            
    # Fallback to in-memory cache
    if key in _cache_fallback:
        entry = _cache_fallback[key]
        if time.time() < entry["expires_at"]:
            logger.info(f"[cache] IN-MEMORY HIT: {prefix} ({key[-8:]})")
            return entry["data"]
        else:
            # Clean up expired entry
            del _cache_fallback[key]
        
    return None

def set_cached_response(prefix: str, response: dict, *args) -> None:
    """Save AI response to cache."""
    from app.core.config import settings
    
    # Never set cache in local DEBUG mode
    if settings.DEBUG:
        return

    key = _generate_key(prefix, *args)

    if redis_client:
        try:
            redis_client.set(key, json.dumps(response), ex=CACHE_EXPIRY_SECONDS)
            logger.info(f"[cache] Redis SET: {prefix} ({key[-8:]})")
            return
        except Exception as e:
            logger.error(f"[cache] Redis SET error: {e}")
            
    # Fallback to in-memory cache
    expires_at = time.time() + CACHE_EXPIRY_SECONDS
    _cache_fallback[key] = {
        "data": response,
        "expires_at": expires_at
    }
    logger.info(f"[cache] IN-MEMORY SET: {prefix} ({key[-8:]})")
