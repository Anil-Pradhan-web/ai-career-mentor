from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
import json

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, DailyAnalytics
from app.core.config import settings
from app.core.rate_limit import redis_client
from app.core.observability import (
    get_active_users_count,
    get_error_logs,
    _in_memory_metrics,
    sync_redis_to_postgres,
)

router = APIRouter()

def verify_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.email.strip().lower() != settings.ADMIN_EMAIL.strip().lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin access required",
        )
    return current_user

@router.get("/metrics", summary="Retrieve all real-time observability metrics")
async def get_admin_metrics(
    db: Session = Depends(get_db),
    admin: User = Depends(verify_admin_user),
):
    # Trigger a sync rollup for today's metrics
    sync_redis_to_postgres(db)

    # 1. Fetch live active connections
    active_users = get_active_users_count()
    
    active_ws = 0
    if redis_client:
        try:
            val = redis_client.get("metrics:active_ws")
            active_ws = int(val) if val else 0
        except Exception:
            active_ws = 0
    else:
        active_ws = _in_memory_metrics["active_ws"]

    # 2. Get sliding window latencies (last 50 requests)
    latencies = {}
    providers = ["nvidia", "groq", "google"]
    for p in providers:
        if redis_client:
            try:
                lats = redis_client.lrange(f"metrics:latency:{p}", 0, 49)
                latencies[p] = [float(l) for l in lats]
            except Exception:
                latencies[p] = []
        else:
            latencies[p] = _in_memory_metrics["latencies"].get(p, [])

    # 3. Get rolling error logs (last 10 exceptions)
    error_logs = get_error_logs()

    # 4. Get historical daily analytics rows from DB (last 7 days)
    history = db.query(DailyAnalytics).order_by(DailyAnalytics.date.desc()).limit(7).all()
    historical_chart = [
        {
            "date": h.date.strftime("%Y-%m-%d") if isinstance(h.date, (datetime, date)) else str(h.date),
            "requests": int(h.total_requests),
            "tokens": int(h.total_tokens),
            "cost": round(h.estimated_cost, 4),
            "fallbacks": int(h.fallback_count),
            "errors": int(h.error_count),
        }
        for h in reversed(history)
    ]

    return {
        "active_users": active_users,
        "active_websockets": active_ws,
        "latencies": latencies,
        "error_logs": error_logs,
        "historical_chart": historical_chart,
        "settings": {
            "llm_provider": settings.LLM_PROVIDER,
            "active_model": settings.active_model,
        }
    }
