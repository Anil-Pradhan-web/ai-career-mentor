# Copyright (c) 2026 Anil Pradhan. All rights reserved.
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from sqlalchemy.orm import Session
from sqlalchemy import text
import time
import traceback

from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.observability import init_sentry
from prometheus_fastapi_instrumentator import Instrumentator
from app.api.admin import router as admin_router, verify_admin_user

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.core.limiter import limiter

from app.core.rag_service import rag_engine

# ── Lifespan (startup/shutdown) ───────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_sentry()
    logger.info("=" * 50)
    logger.info("🚀 AI Career Mentor API starting...")
    logger.info(f"   NVIDIA Model : {settings.NVIDIA_MODEL}")
    logger.info(f"   Groq Model   : {settings.GROQ_MODEL}")
    logger.info(f"   Google Model : {settings.GOOGLE_MODEL}")
    logger.info(f"   Database     : {settings.DATABASE_URL}")
    logger.info(f"   API Keys     : {'✅ Configured' if settings.is_configured else '❌ MISSING — check .env!'}")
    logger.info(f"   Docs         : http://localhost:8000/docs")
    logger.info("=" * 50)

    if not settings.is_configured:
        logger.error("❌ CRITICAL: One or more required LLM API Keys are missing or invalid!")
        raise ValueError("Missing required LLM API Keys for hybrid multi-provider features.")

    # Auto-seed our gold-standard curated links into ChromaDB
    try:
        rag_engine.auto_seed()
    except Exception as e:
        logger.error(f"Failed to auto-seed RAG Engine: {e}")

    # Auto-migrate/verify daily_analytics columns
    try:
        from app.core.database import SessionLocal
        from sqlalchemy import text, inspect
        db_mig = SessionLocal()
        try:
            inspector = inspect(db_mig.bind)
            if 'daily_analytics' in inspector.get_table_names():
                columns = [col['name'] for col in inspector.get_columns('daily_analytics')]
                for col_name in ['groq_cost', 'nvidia_cost', 'google_cost']:
                    if col_name not in columns:
                        logger.info(f"Database auto-migration: adding {col_name} to daily_analytics...")
                        db_mig.execute(text(f"ALTER TABLE daily_analytics ADD COLUMN {col_name} FLOAT DEFAULT 0.0"))
                        db_mig.commit()
        finally:
            db_mig.close()
    except Exception as e:
        logger.error(f"Failed to run database schema auto-migrations: {e}")

    yield
    logger.info("🛑 AI Career Mentor API shutting down.")

openapi_tags = [
    {"name": "Auth",                "description": "Authentication and user management."},
    {"name": "Resume",              "description": "AI-powered resume parsing and skill gap analysis."},
    {"name": "Roadmap",             "description": "Week-by-week career learning plans."},
    {"name": "Market",              "description": "Real-time job market research."},
    {"name": "Career Full Analysis","description": "Parallel multi-agent pipeline via LangGraph."},
    {"name": "Interview",           "description": "Mock interview session management."},
    {"name": "LinkedIn",            "description": "LinkedIn profile optimization."},
    {"name": "User",                "description": "User profile and dashboard stats."},
    {"name": "Health",              "description": "System health and configuration endpoints."},
]

app = FastAPI(
    title="AI Career Mentor API",
    description="Multi-agent career coaching backend — LangGraph + Groq/Gemini.",
    version="1.0.0",
    lifespan=lifespan,
    openapi_tags=openapi_tags,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rate Limiter Middleware ───────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ── Logging Middleware ────────────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    start_time = time.time()
    origin = request.headers.get("origin", "No Origin")
    logger.info(f"→ {request.method} {request.url.path} | Origin: {origin}")
    try:
        response = await call_next(request)
        logger.info(f"← {response.status_code} {request.url.path} ({time.time() - start_time:.3f}s)")
        return response
    except Exception as exc:
        logger.error(f"✗ {request.url.path} — {str(exc)}\n{traceback.format_exc()}")
        from app.core.observability import track_error
        track_error(str(exc), traceback.format_exc())
        if settings.SENTRY_DSN:
            import sentry_sdk
            sentry_sdk.capture_exception(exc)
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred. Please try again later."},
        )

# ── Routes ────────────────────────────────────────────────────────────────────
from app.api import auth, resume, roadmap, market, career, linkedin, interview, user, voice_assistant

app.include_router(auth.router,      prefix="/auth",      tags=["Auth"])

_protected = [Depends(get_current_user)]
app.include_router(resume.router,    prefix="/resume",    tags=["Resume"],              dependencies=_protected)
app.include_router(roadmap.router,   prefix="/roadmap",   tags=["Roadmap"],             dependencies=_protected)
app.include_router(market.router,    prefix="/market",    tags=["Market"],              dependencies=_protected)
app.include_router(career.router,    prefix="/career",    tags=["Career Full Analysis"],dependencies=_protected)
app.include_router(linkedin.router,  prefix="/linkedin",  tags=["LinkedIn"],            dependencies=_protected)
app.include_router(user.router,      prefix="/user",      tags=["User"],                dependencies=_protected)
app.include_router(interview.router, prefix="/interview", tags=["Interview"])
app.include_router(voice_assistant.router, prefix="/career/voice-assistant", tags=["Voice Assistant"])
app.include_router(admin_router,     prefix="/admin",     tags=["Observability"])

# ── Prometheus Instrumentation ────────────────────────────────────────────────
if settings.ENABLE_OBSERVABILITY:
    Instrumentator().instrument(app).expose(
        app,
        endpoint="/admin/prometheus-metrics",
        dependencies=[Depends(verify_admin_user)],
        tags=["Health"]
    )

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health(db: Session = Depends(get_db)):
    import datetime
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error(f"Health Check DB failed: {e}")
        db_status = "disconnected"
    return {
        "status": "ok",
        "database": db_status,
        "service": "AI Career Mentor",
        "version": "1.0.0",
        "provider": "hybrid",
        "model": "hybrid",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

@app.get("/ping", tags=["Health"])
async def ping():
    """Lightweight keep-alive for Render free tier cron."""
    return {"pong": True}

@app.get("/", tags=["Health"])
async def root():
    return {"message": "Welcome to AI Career Mentor API 🚀", "docs": "/docs", "health": "/health"}
