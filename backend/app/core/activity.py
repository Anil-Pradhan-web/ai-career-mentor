from sqlalchemy.orm import Session
from app.models.models import ActivityLog

def log_activity(db: Session, user_id: str, action: str, feature: str):
    """
    Logs an activity into the database.
    Example: log_activity(db, user_id, "Generated Roadmap", "roadmap")
    """
    log = ActivityLog(user_id=user_id, action=action, feature=feature)
    db.add(log)
    db.commit()
