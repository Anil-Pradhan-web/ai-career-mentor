import hashlib
import json
from loguru import logger
from typing import Optional
from app.core.rate_limit import redis_client

CACHE_EXPIRY_SECONDS = 60 * 60 * 24 * 7  # 7 days

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

    if not redis_client:
        return None
        
    key = _generate_key(prefix, *args)
    try:
        val = redis_client.get(key)
        if val:
            logger.info(f"[cache] HIT: {prefix} ({key[-8:]})")
            return json.loads(val)
    except Exception as e:
        logger.error(f"[cache] Redis GET error: {e}")
        
    return None

def set_cached_response(prefix: str, response: dict, *args) -> None:
    """Save AI response to cache."""
    from app.core.config import settings
    
    # Never set cache in local DEBUG mode
    if settings.DEBUG:
        return

    if not redis_client:
        return
        
    key = _generate_key(prefix, *args)
    try:
        redis_client.setex(key, CACHE_EXPIRY_SECONDS, json.dumps(response))
        logger.info(f"[cache] SET: {prefix} ({key[-8:]})")
    except Exception as e:
        logger.error(f"[cache] Redis SET error: {e}")
