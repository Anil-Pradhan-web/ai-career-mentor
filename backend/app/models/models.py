"""
SQLAlchemy ORM Models — All database tables defined here.

Tables:
  - users           → User accounts
  - resumes         → Uploaded + parsed resumes
  - career_roadmaps → AI-generated learning roadmaps
  - interview_sessions → Mock interview history + scores
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


def _now():
    return datetime.now(timezone.utc)


def _uuid():
    return str(uuid.uuid4())


# ── User ──────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id         = Column(String, primary_key=True, default=_uuid)
    email      = Column(String, unique=True, nullable=False, index=True)
    name       = Column(String, nullable=False)
    hashed_pw  = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now)

    # relationships
    resumes           = relationship("Resume",           back_populates="user", cascade="all, delete")
    roadmaps          = relationship("CareerRoadmap",    back_populates="user", cascade="all, delete")
    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete")

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"


# ── Resume ────────────────────────────────────────────────────────────────────
class Resume(Base):
    __tablename__ = "resumes"

    id              = Column(String, primary_key=True, default=_uuid)
    user_id         = Column(String, ForeignKey("users.id"), nullable=False)
    filename        = Column(String, nullable=False)
    parsed_content  = Column(JSON, nullable=True)   # AI analysis result stored as JSON
    raw_text        = Column(Text, nullable=True)    # extracted plain text from PDF
    uploaded_at     = Column(DateTime(timezone=True), default=_now)

    user = relationship("User", back_populates="resumes")

    def __repr__(self):
        return f"<Resume id={self.id} user_id={self.user_id}>"


# ── CareerRoadmap ─────────────────────────────────────────────────────────────
class CareerRoadmap(Base):
    __tablename__ = "career_roadmaps"

    id          = Column(String, primary_key=True, default=_uuid)
    user_id     = Column(String, ForeignKey("users.id"), nullable=False)
    target_role = Column(String, nullable=False)
    steps       = Column(JSON, nullable=True)    # list of weekly plan steps
    created_at  = Column(DateTime(timezone=True), default=_now)

    user = relationship("User", back_populates="roadmaps")

    def __repr__(self):
        return f"<CareerRoadmap id={self.id} role={self.target_role}>"


# ── InterviewSession ──────────────────────────────────────────────────────────
class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id           = Column(String, primary_key=True, default=_uuid)
    user_id      = Column(String, ForeignKey("users.id"), nullable=False)
    target_role  = Column(String, nullable=False)
    chat_history = Column(JSON, nullable=True)    # list of {role, content} dicts
    score        = Column(Float, nullable=True)   # final score out of 100
    status       = Column(String, default="in_progress")  # in_progress | completed
    created_at   = Column(DateTime(timezone=True), default=_now)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="interview_sessions")

    def __repr__(self):
        return f"<InterviewSession id={self.id} role={self.target_role} score={self.score}>"
