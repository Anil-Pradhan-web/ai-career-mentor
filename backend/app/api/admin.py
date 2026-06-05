from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta, timezone
import json

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, DailyAnalytics, ActivityLog
from app.core.config import settings
from app.core.rate_limit import redis_client
from app.core.limiter import limiter
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
@limiter.exempt
async def get_admin_metrics(
    request: Request,
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

    # 5. Fetch cumulative all-time activity totals
    totals = db.query(
        ActivityLog.feature, 
        func.count(ActivityLog.id)
    ).group_by(ActivityLog.feature).all()
    totals_map = {feat: count for feat, count in totals}

    # 6. Fetch all-time total LLM costs
    total_costs = db.query(
        func.sum(DailyAnalytics.groq_cost),
        func.sum(DailyAnalytics.nvidia_cost),
        func.sum(DailyAnalytics.google_cost)
    ).first()
    
    total_groq_cost = float(total_costs[0] or 0.0) if total_costs else 0.0
    total_nvidia_cost = float(total_costs[1] or 0.0) if total_costs else 0.0
    total_google_cost = float(total_costs[2] or 0.0) if total_costs else 0.0

    # 7. Fetch daily breakdown of activities for the last 7 days
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=7)
    daily_logs = db.query(ActivityLog).filter(ActivityLog.created_at >= cutoff_date).all()
    
    daily_activity = {}  # (date_str, feature) -> count
    for log in daily_logs:
        log_date = log.created_at.strftime("%Y-%m-%d")
        daily_activity[(log_date, log.feature)] = daily_activity.get((log_date, log.feature), 0) + 1

    # 8. Format historical chart items with counts and provider costs
    historical_chart = [
        {
            "date": h.date.strftime("%Y-%m-%d") if isinstance(h.date, (datetime, date)) else str(h.date),
            "requests": int(h.total_requests),
            "tokens": int(h.total_tokens),
            "cost": round(h.estimated_cost, 4),
            "fallbacks": int(h.fallback_count),
            "errors": int(h.error_count),
            
            # Daily breakdown of execution counts
            "resumes": daily_activity.get((h.date.strftime("%Y-%m-%d") if isinstance(h.date, (datetime, date)) else str(h.date), "resume"), 0),
            "interviews": daily_activity.get((h.date.strftime("%Y-%m-%d") if isinstance(h.date, (datetime, date)) else str(h.date), "interview"), 0),
            "roadmaps": daily_activity.get((h.date.strftime("%Y-%m-%d") if isinstance(h.date, (datetime, date)) else str(h.date), "roadmap"), 0),
            "full_analyses": daily_activity.get((h.date.strftime("%Y-%m-%d") if isinstance(h.date, (datetime, date)) else str(h.date), "full_analysis"), 0),
            
            # Daily breakdown of costs by model
            "groq_cost": round(h.groq_cost or 0.0, 4),
            "nvidia_cost": round(h.nvidia_cost or 0.0, 4),
            "google_cost": round(h.google_cost or 0.0, 4),
        }
        for h in reversed(history)
    ]

    response_totals = {
        "resume": totals_map.get("resume", 0),
        "interview": totals_map.get("interview", 0),
        "roadmap": totals_map.get("roadmap", 0),
        "full_analysis": totals_map.get("full_analysis", 0),
        "groq_cost": round(total_groq_cost, 4),
        "nvidia_cost": round(total_nvidia_cost, 4),
        "google_cost": round(total_google_cost, 4),
        "all_time_cost": round(total_groq_cost + total_nvidia_cost + total_google_cost, 4),
    }

    return {
        "active_users": active_users,
        "active_websockets": active_ws,
        "latencies": latencies,
        "error_logs": error_logs,
        "historical_chart": historical_chart,
        "totals": response_totals,
        "settings": {
            "llm_provider": "hybrid",
            "active_model": settings.active_model,
        }
    }
