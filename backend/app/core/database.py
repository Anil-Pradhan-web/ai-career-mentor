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

def run_db_migrations():
    """Ensure newly added columns exist in SQLite or Postgres tables."""
    try:
        from sqlalchemy import text, inspect
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        
        with engine.begin() as conn:
            if 'daily_analytics' in table_names:
                columns = [col['name'] for col in inspector.get_columns('daily_analytics')]
                for col_name in ['groq_cost', 'nvidia_cost', 'google_cost', 'openrouter_cost']:
                    if col_name not in columns:
                        conn.execute(text(f"ALTER TABLE daily_analytics ADD COLUMN {col_name} FLOAT DEFAULT 0.0"))

            if 'career_analyses' in table_names:
                ca_columns = [col['name'] for col in inspector.get_columns('career_analyses')]
                if 'executive_summary' not in ca_columns:
                    conn.execute(text("ALTER TABLE career_analyses ADD COLUMN executive_summary JSON"))
    except Exception:
        pass

# Run auto-migration check once on engine setup
run_db_migrations()

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

