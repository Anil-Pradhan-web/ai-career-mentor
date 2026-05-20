from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Normalize PostgreSQL URL schema (Render/Neon/Heroku compatibility)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# For SQLite we need connect_args; for Postgres it's not needed.
_is_sqlite = db_url.startswith("sqlite")
connect_args = {"check_same_thread": False} if _is_sqlite else {}

# SQLite doesn't support connection pooling args; Render free tier has limited RAM
_pool_kwargs = {} if _is_sqlite else {
    "pool_size": 3,           # Render free = 512MB RAM, keep small
    "max_overflow": 5,
    "pool_timeout": 30,
    "pool_recycle": 300,      # Recycle every 5 min (Neon drops idle connections)
    "pool_pre_ping": True,    # Crucial: checks connection health before use
}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False,               # Never echo SQL in production
    **_pool_kwargs,
)

# ─── Session ───────────────────────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ─── Base ──────────────────────────────────────────────────────────────────────
Base = declarative_base()


# ─── Dependency (use in FastAPI routes via Depends) ────────────────────────────
def get_db():
    """Yield a DB session and ensure it's closed after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
