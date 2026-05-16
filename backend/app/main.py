# Copyright (c) 2026 Anil Pradhan. All rights reserved.
# Unauthorized copying of this file, via any medium is strictly prohibited.
# Proprietary and confidential.

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

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# ── Lifespan (startup/shutdown) ───────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("=" * 50)
    logger.info("🚀 AI Career Mentor API starting...")
    logger.info(f"   Provider : {settings.LLM_PROVIDER.upper()} ({settings.active_model})")
    logger.info(f"   API Key  : {'✅ Set' if settings.is_configured else '❌ NOT SET — check .env!'}")
    logger.info(f"   Docs     : http://localhost:8000/docs")
    logger.info("=" * 50)
    
    if not settings.is_configured:
        logger.error("❌ CRITICAL: LLM API Key is missing or invalid!")
        raise ValueError(f"Missing API Key for configured LLM Provider: {settings.LLM_PROVIDER}")

    yield
    # Shutdown
    logger.info("🛑 AI Career Mentor API shutting down.")

# Global rate limiter setup
limit_rules = ["100000/day"] if settings.DEBUG else ["1000/day", "100/hour"]
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
limiter = Limiter(key_func=get_remote_address, default_limits=limit_rules, storage_uri=redis_url)

openapi_tags = [
    {"name": "Auth", "description": "Authentication and user management including JWT tokens."},
    {"name": "Resume", "description": "AI-powered resume parsing and skill gap analysis."},
    {"name": "Roadmap", "description": "Generation of highly tailored, week-by-week career learning plans."},
    {"name": "Market", "description": "Real-time job market research via DuckDuckGo Search APIs."},
    {"name": "Career Full Analysis", "description": "GroupChat orchestration combining all agents."},
    {"name": "Interview", "description": "Mock interview session management."},
    {"name": "User", "description": "User profile and settings management."},
    {"name": "Health", "description": "System health and configuration endpoints."},
]

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Career Mentor API",
    description="Multi-agent career coaching backend — powered by Microsoft AutoGen + Llama 3/Google Gemini.",
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
    logger.info(f"Incoming request: {request.method} {request.url.path} | Origin: {origin}")
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"Completed request: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s")
        return response
    except Exception as exc:
        process_time = time.time() - start_time
        logger.error(f"Failed request: {request.method} {request.url.path} - Error: {str(exc)} - Time: {process_time:.4f}s")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred. Please try again later."},
        )

# ── Routes ────────────────────────────────────────────────────────────────────
from app.api import auth, resume, roadmap, market, career, linkedin, interview, user

# Public routes
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

# Protected routes dependency
protected_depends = [Depends(get_current_user)]

app.include_router(resume.router,  prefix="/resume",  tags=["Resume"], dependencies=protected_depends)
app.include_router(roadmap.router, prefix="/roadmap", tags=["Roadmap"], dependencies=protected_depends)
app.include_router(market.router,  prefix="/market",  tags=["Market"], dependencies=protected_depends)
app.include_router(career.router,  prefix="/career",  tags=["Career Full Analysis"], dependencies=protected_depends)
app.include_router(linkedin.router,prefix="/linkedin",tags=["LinkedIn"], dependencies=protected_depends)
app.include_router(user.router,    prefix="/user",    tags=["User"], dependencies=protected_depends)

# Interview router has its own auth logic for WebSockets usually, but standard endpoints are protected
app.include_router(interview.router, prefix="/interview", tags=["Interview"])

# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health(db: Session = Depends(get_db)):
    """
    Check if the API and Database are alive.
    Also serves to keep the DB connection warm on certain hosting platforms.
    """
    import datetime
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error(f"Health Check: Database connection failed: {e}")
        db_status = "disconnected"

    return {
        "status": "ok",
        "database": db_status,
        "service": "AI Career Mentor",
        "version": "1.0.0",
        "provider": settings.LLM_PROVIDER,
        "model": settings.active_model,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

# ── Cron Keep-Alive (Render Free Tier) ────────────────────────────────────────
@app.get("/ping", tags=["Health"])
async def ping():
    """
    Ultra-lightweight endpoint for cron-job keep-alive.
    No DB query, no auth — just proves the process is alive.
    Use this URL in your cron job: https://your-app.onrender.com/ping
    """
    return {"pong": True}

# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to AI Career Mentor API 🚀",
        "docs": "/docs",
        "health": "/health",
    }

