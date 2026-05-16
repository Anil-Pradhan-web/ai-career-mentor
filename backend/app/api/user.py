from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Resume, ActivityLog, CareerRoadmap, InterviewSession

router = APIRouter()

@router.get("/stats", summary="Get user dashboard stats from DB")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # 1. Last Resume Analysis
    resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id,
        Resume.parsed_content != None
    ).order_by(Resume.uploaded_at.desc()).all()
    
    last_resume = resumes[0] if resumes else None
    resume_analysis = last_resume.parsed_content if last_resume else None

    # Get career analysis logs as well
    career_logs = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.feature == "full_analysis"
    ).all()

    analysis_history = []
    for r in resumes:
        dt_str = r.uploaded_at.isoformat()
        analysis_history.append({
            "created_at": f"{dt_str}Z" if not dt_str.endswith("Z") else dt_str
        })
    for l in career_logs:
        dt_str = l.created_at.isoformat()
        analysis_history.append({
            "created_at": f"{dt_str}Z" if not dt_str.endswith("Z") else dt_str
        })

    # 2. Roadmaps (to track primary goal progress)
    roadmaps = db.query(CareerRoadmap).filter(CareerRoadmap.user_id == current_user.id).order_by(CareerRoadmap.created_at.desc()).all()
    roadmap_history = [
        {
            "id": r.id,
            "target_role": r.target_role,
            "weeks": r.steps,
            "created_at": f"{r.created_at.isoformat()}Z" if not r.created_at.isoformat().endswith("Z") else r.created_at.isoformat()
        }
        for r in roadmaps
    ]

    # 2.5 Interviews
    interviews = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).order_by(InterviewSession.created_at.desc()).all()
    
    interview_history = [
        {
            "score": i.score,
            "created_at": f"{i.created_at.isoformat()}Z" if not i.created_at.isoformat().endswith("Z") else i.created_at.isoformat()
        }
        for i in interviews if i.score is not None
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
    check_date = now.date()

    # If today has activity, count it and move backward
    if check_date.isoformat() in active_date_strs:
        streak += 1
        check_date -= timedelta(days=1)
    # If today has no activity but yesterday does, start from yesterday
    elif (check_date - timedelta(days=1)).isoformat() in active_date_strs:
        check_date -= timedelta(days=1)
    else:
        # No recent activity — streak is 0
        check_date = None

    # Count consecutive past days
    while check_date and check_date.isoformat() in active_date_strs:
        streak += 1
        check_date -= timedelta(days=1)

    return {
        "lastResumeAnalysis": resume_analysis,
        "usageToday": usage_today,
        "weeklyActivity": weekly_activity,
        "activityLog": activity_log,
        "roadmapHistory": roadmap_history,
        "interviewHistory": interview_history,
        "analysisHistory": analysis_history,
        "streak": streak
    }
