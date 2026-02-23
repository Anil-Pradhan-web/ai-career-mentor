from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import settings


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
    yield
    # Shutdown
    logger.info("🛑 AI Career Mentor API shutting down.")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Career Mentor API",
    description="Multi-agent career coaching backend — powered by Microsoft AutoGen + Azure OpenAI.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Lock down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
from app.api import resume as resume_router
app.include_router(resume_router.router, prefix="/resume", tags=["Resume"])

# Future routers (uncomment as features are built):
# from app.api import auth, roadmap, market, interview
# app.include_router(auth.router,      prefix="/auth",      tags=["Auth"])
# app.include_router(roadmap.router,   prefix="/roadmap",   tags=["Roadmap"])
# app.include_router(market.router,    prefix="/market",    tags=["Market"])
# app.include_router(interview.router, prefix="/interview", tags=["Interview"])


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "service": "AI Career Mentor",
        "version": "1.0.0",
        "provider": settings.LLM_PROVIDER,
        "model": settings.active_model,
    }


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to AI Career Mentor API 🚀",
        "docs": "/docs",
        "health": "/health",
    }
