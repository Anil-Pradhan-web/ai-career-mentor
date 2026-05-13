from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Resume, ActivityLog, CareerRoadmap

router = APIRouter()

@router.get("/stats", summary="Get user dashboard stats from DB")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # 1. Last Resume Analysis
    last_resume = db.query(Resume).filter(
        Resume.user_id == current_user.id,
        Resume.parsed_content != None
    ).order_by(Resume.uploaded_at.desc()).first()
    
    resume_analysis = last_resume.parsed_content if last_resume else None

    # 2. Roadmaps (to track primary goal progress)
    roadmaps = db.query(CareerRoadmap).filter(CareerRoadmap.user_id == current_user.id).order_by(CareerRoadmap.created_at.desc()).all()
    roadmap_history = [
        {
            "id": r.id,
            "target_role": r.target_role,
            "weeks": r.steps,
            "created_at": r.created_at.isoformat()
        }
        for r in roadmaps
    ]

    # 3. Today's usage counts (for rate limits progress rings)
    today_logs = db.query(
        ActivityLog.feature, 
        func.count(ActivityLog.id)
    ).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.created_at >= today_start
    ).group_by(ActivityLog.feature).all()
    
    usage_today = {feature: count for feature, count in today_logs}

    # 3. Weekly activity (last 7 days)
    seven_days_ago = today_start - timedelta(days=6)
    weekly_logs = db.query(
        func.date(ActivityLog.created_at).label('day'),
        func.count(ActivityLog.id)
    ).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.created_at >= seven_days_ago
    ).group_by(func.date(ActivityLog.created_at)).all()
    
    # Format weekly data
    weekly_activity = []
    for i in range(7):
        d = seven_days_ago + timedelta(days=i)
        date_str = d.strftime("%Y-%m-%d")
        day_name = d.strftime("%a")
        
        # Find count for this date
        count = next((count for log_date, count in weekly_logs if str(log_date) == date_str), 0)
        weekly_activity.append({"day": day_name, "actions": count})

    # 4. Top 5 recent activities
    recent_logs = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id
    ).order_by(ActivityLog.created_at.desc()).limit(5).all()
    
    color_map = {
        "resume": "#818cf8",
        "roadmap": "#34d399",
        "interview": "#f59e0b",
        "linkedin": "#a78bfa",
        "full_analysis": "#06b6d4"
    }

    activity_log = [
        {
            "label": log.action,
            "time": log.created_at.isoformat(),
            "color": color_map.get(log.feature, "#818cf8")
        }
        for log in recent_logs
    ]

    # 5. Calculate Streak
    active_dates = db.query(func.date(ActivityLog.created_at)).filter(
        ActivityLog.user_id == current_user.id
    ).distinct().all()
    
    active_date_strs = {str(d[0]) for d in active_dates if d[0]}
    
    streak = 0
    curr_date = now.date()
    curr_date_str = curr_date.isoformat()
    yesterday = curr_date - timedelta(days=1)
    yesterday_str = yesterday.isoformat()

    if curr_date_str in active_date_strs:
        streak += 1
        curr_date = yesterday
    elif yesterday_str in active_date_strs:
        curr_date = yesterday
    else:
        # Streak is 0
        active_date_strs = set()
        
    while curr_date.isoformat() in active_date_strs:
        streak += 1
        curr_date -= timedelta(days=1)

    return {
        "lastResumeAnalysis": resume_analysis,
        "usageToday": usage_today,
        "weeklyActivity": weekly_activity,
        "activityLog": activity_log,
        "roadmapHistory": roadmap_history,
        "streak": streak
    }
