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


from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Global rate limiter setup (strict in production, unlimited in local dev)
limit_rules = ["100000/day"] if settings.DEBUG else ["50/day", "10/hour"]
limiter = Limiter(key_func=get_remote_address, default_limits=limit_rules)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Career Mentor API",
    description="Multi-agent career coaching backend — powered by Microsoft AutoGen + Azure OpenAI.",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ai-career-mentor.vercel.app",
        "*"
    ],   # Lock down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
from app.api import resume as resume_router
from app.api import roadmap as roadmap_router
from app.api import auth

from fastapi import Depends
from app.api.deps import get_current_user

app.include_router(auth.router, prefix="/auth", tags=["Auth"])

# Protected routes
protected_depends = [Depends(get_current_user)]
app.include_router(resume_router.router,  prefix="/resume",  tags=["Resume"], dependencies=protected_depends)
app.include_router(roadmap_router.router, prefix="/roadmap", tags=["Roadmap"], dependencies=protected_depends)

# Future routers (uncomment as features are built):
from app.api import interview
from app.api import market as market_router
from app.api import career as career_router

app.include_router(market_router.router, prefix="/market", tags=["Market"], dependencies=protected_depends)
app.include_router(career_router.router, prefix="/career", tags=["Career Full Analysis"], dependencies=protected_depends)
app.include_router(interview.router, prefix="/interview", tags=["Interview"])


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
