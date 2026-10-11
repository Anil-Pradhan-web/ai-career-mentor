# Copyright (c) 2026 Anil Pradhan. All rights reserved.
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, Request, HTTPException, status
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

from app.core.resume.rag_service import rag_engine

# ── Lifespan (startup/shutdown) ───────────────────────────────────────────────
# @asynccontextmanager allows running startup and shutdown codes in a single block using yield
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_sentry()  # Start-up par Sentry error monitoring initialize karta hai
    logger.info("=" * 50)
    logger.info("🚀 AI Career Mentor API starting...")
    logger.info(f"   Groq Model       : {settings.GROQ_MODEL}")
    logger.info(f"   OpenRouter Model : {settings.OPENROUTER_MODEL}")
    logger.info(f"   Embeddings Model : {settings.OPENROUTER_EMBEDDING_MODEL}")
    logger.info(f"   Database         : {settings.DATABASE_URL}")
    logger.info(f"   API Keys         : {'✅ Configured' if settings.is_configured else '❌ MISSING — check .env!'}")
    logger.info(f"   Docs             : http://localhost:8000/docs")
    logger.info("=" * 50)

    if not settings.is_configured:
        if os.getenv("CI") == "true" or os.getenv("TESTING") == "true" or os.getenv("BYPASS_KEY_CHECK") == "true":
            logger.warning("⚠️ Warning: Required LLM API Keys are missing, but continuing startup because CI/Testing/Bypass mode is enabled.")
        else:
            logger.error("❌ CRITICAL: One or more required LLM API Keys are missing or invalid!")
            raise ValueError("Missing required LLM API Keys for hybrid multi-provider features.")

    # Auto-seed our gold-standard curated links into ChromaDB
    try:
        # ChromaDB vector store mein curated resources links automatically load/seed karta hai
        rag_engine.auto_seed()
    except Exception as e:
        logger.error(f"Failed to auto-seed RAG Engine: {e}")

    # Auto-migrate/verify daily_analytics columns
    try:
        from app.core.database import SessionLocal, Base
        from app.models.models import CareerAnalysis
        from sqlalchemy import text, inspect
        db_mig = SessionLocal()
        try:
            # Auto-create tables if they do not exist
            Base.metadata.create_all(bind=db_mig.bind)
            logger.info("Database tables verified/created.")

            # Check karta hai ki database table columns up-to-date hain ya nahi
            inspector = inspect(db_mig.bind)
            if 'daily_analytics' in inspector.get_table_names():
                columns = [col['name'] for col in inspector.get_columns('daily_analytics')]
                for col_name in ['groq_cost', 'nvidia_cost', 'google_cost', 'openrouter_cost']:
                    if col_name not in columns:
                        logger.info(f"Database auto-migration: adding {col_name} to daily_analytics...")
                        # Dynamic SQL schema update: database mein agar cost tracking columns nahi hain toh add kar dega
                        db_mig.execute(text(f"ALTER TABLE daily_analytics ADD COLUMN {col_name} FLOAT DEFAULT 0.0"))
                        db_mig.commit()

            if 'career_analyses' in inspector.get_table_names():
                ca_columns = [col['name'] for col in inspector.get_columns('career_analyses')]
                if 'executive_summary' not in ca_columns:
                    logger.info("Database auto-migration: adding executive_summary to career_analyses...")
                    db_mig.execute(text("ALTER TABLE career_analyses ADD COLUMN executive_summary JSON"))
                    db_mig.commit()
        finally:
            db_mig.close()
    except Exception as e:
        logger.error(f"Failed to run database schema auto-migrations: {e}")

    yield  # yield ke pehle ka code startup par run hoga, aur yield ke baad ka code shutdown par
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
    description="Multi-agent career coaching backend — LangGraph + Groq/OpenRouter.",
    version="1.0.0",
    lifespan=lifespan,
    openapi_tags=openapi_tags,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # CORS allowed domains frontend ke liye config karta hai
    allow_origin_regex=r"https://.*\.vercel\.app",  # Regex match se Vercel ke temporary preview dynamic subdomains ko bypass karta hai
    allow_credentials=True,  # Frontend se cookies aur auth headers receive karne ki authorization
    allow_methods=["*"],  # Saare HTTP request methods (GET, POST, etc.) allowed hain
    allow_headers=["*"],  # Saare custom headers pass karne ki permission deta hai
)

# ── Rate Limiter Middleware ───────────────────────────────────────────────────
app.state.limiter = limiter  # Limiter object application state global storage mein register karta hai
# RateLimitExceeded error aane par custom response structure return karega (client-side error response format)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)  # Requests check karne ke liye controller routing limit filter lagata hai

# ── Logging Middleware ────────────────────────────────────────────────────────
# Custom decorator: Har request call par run hoga and logs metrics aur errors monitor karega
@app.middleware("http")
async def log_requests(request: Request, call_next):
    if request.method == "OPTIONS":
        # Browser pre-flight OPTIONS request ko bypass kar deta hai logs fill hone se bachane ke liye
        return await call_next(request)
    start_time = time.time()
    origin = request.headers.get("origin", "No Origin")
    logger.info(f"→ {request.method} {request.url.path} | Origin: {origin}")
    try:
        # call_next(request) API request flow aage processing nodes ko pass karke execute karwata hai
        response = await call_next(request)
        logger.info(f"← {response.status_code} {request.url.path} ({time.time() - start_time:.3f}s)")
        return response
    except HTTPException as http_exc:
        logger.warning(f"← {http_exc.status_code} {request.url.path} ({time.time() - start_time:.3f}s) — {http_exc.detail}")
        return JSONResponse(
            status_code=http_exc.status_code,
            content={"detail": http_exc.detail},
            headers=getattr(http_exc, "headers", None),
        )
    except Exception as exc:
        # Global Error Catcher: Server crash ke time system log me exception log karega traceback ke sath
        logger.error(f"✗ {request.url.path} — {str(exc)}\n{traceback.format_exc()}")
        from app.core.observability import track_error
        track_error(
            str(exc),
            traceback.format_exc(),
            exc_info=exc,  # Sentry capture tracks internally in track_error
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred. Please try again later."},
        )

# ── Routes ────────────────────────────────────────────────────────────────────
from app.api import auth, resume, roadmap, market, career, linkedin, interview, user

app.include_router(auth.router,      prefix="/auth",      tags=["Auth"])

# JWT verify dependency object jo saare login-required features ko filter karta hai
_protected = [Depends(get_current_user)]
# include_router routing configuration hooks ko load karta hai protected rules ke sath
app.include_router(resume.router,    prefix="/resume",    tags=["Resume"],              dependencies=_protected)
app.include_router(roadmap.router,   prefix="/roadmap",   tags=["Roadmap"],             dependencies=_protected)
app.include_router(market.router,    prefix="/market",    tags=["Market"],              dependencies=_protected)
app.include_router(career.router,    prefix="/career",    tags=["Career Full Analysis"],dependencies=_protected)
app.include_router(linkedin.router,  prefix="/linkedin",  tags=["LinkedIn"],            dependencies=_protected)
app.include_router(user.router,      prefix="/user",      tags=["User"],                dependencies=_protected)
app.include_router(interview.router, prefix="/interview", tags=["Interview"])
app.include_router(admin_router,     prefix="/admin",     tags=["Observability"])

# ── Prometheus Instrumentation ────────────────────────────────────────────────
def verify_prometheus_access(request: Request, db: Session = Depends(get_db)):
    """
    Authorizes Prometheus metric scraping:
    1. If PROMETHEUS_METRICS_TOKEN is set and matches Bearer or X-Prometheus-Token header, allow.
    2. Otherwise, requires standard admin JWT authorization.
    """
    token_config = settings.PROMETHEUS_METRICS_TOKEN.strip()
    auth_header = request.headers.get("authorization", "")
    custom_header = request.headers.get("x-prometheus-token", "")

    if token_config:
        if auth_header.startswith("Bearer "):
            bearer = auth_header[7:].strip()
            if bearer == token_config:
                return "scraper"
        if custom_header == token_config:
            return "scraper"

    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Bearer authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header[7:].strip()
    user = get_current_user(token=token, db=db)
    return verify_admin_user(user)

if settings.ENABLE_OBSERVABILITY:
    Instrumentator().instrument(app).expose(
        app,
        endpoint="/admin/prometheus-metrics",
        dependencies=[Depends(verify_prometheus_access)],
        tags=["Health"]
    )

# ── Health & Diagnostics ──────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health(request: Request, db: Session = Depends(get_db)):
    import datetime
    from app.core.rate_limit import redis_client

    t0 = time.time()
    db_status = "connected"
    db_latency_ms = 0.0
    try:
        db.execute(text("SELECT 1"))
        db_latency_ms = round((time.time() - t0) * 1000, 2)
    except Exception as e:
        logger.error(f"Health Check DB failed: {e}")
        db_status = "disconnected"

    redis_status = "disabled"
    if redis_client:
        try:
            redis_client.ping()
            redis_status = "connected"
        except Exception as e:
            logger.warning(f"Health Check Redis ping failed: {e}")
            redis_status = "degraded"
    else:
        redis_status = "in-memory-fallback"

    llm_configured = settings.is_configured
    sentry_status = "active" if bool(settings.SENTRY_DSN) else "disabled"

    is_healthy = db_status == "connected"
    status_text = "ok" if is_healthy else "unhealthy"
    status_code = 200 if is_healthy else 503

    payload = {
        "status": status_text,
        "service": "AI Career Mentor API",
        "version": "1.0.0",
        "provider": settings.LLM_PROVIDER,
        "model": settings.active_model,
        "database": {
            "status": db_status,
            "latency_ms": db_latency_ms,
        },
        "cache_redis": {
            "status": redis_status,
        },
        "llm_service": {
            "configured": llm_configured,
            "primary_provider": settings.LLM_PROVIDER,
            "active_model": settings.active_model,
        },
        "sentry": {
            "status": sentry_status,
            "environment": settings.APP_ENV,
        },
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

    if not is_healthy:
        return JSONResponse(status_code=status_code, content=payload)
    return payload

@app.get("/ping", tags=["Health"])
async def ping():
    """Lightweight keep-alive for Render free tier cron."""
    return {"pong": True}

@app.get("/", tags=["Health"])
async def root():
    return {"message": "Welcome to AI Career Mentor API 🚀", "docs": "/docs", "health": "/health"}
