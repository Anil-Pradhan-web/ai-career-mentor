import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # -------------------------------------------------------------------------
    # LLM Provider Configuration
    # Supported providers: "groq", "openrouter"
    # -------------------------------------------------------------------------
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")
    LLM_PROVIDERS_ORDER: list[str] = ["groq", "openrouter"]

    # ── GROQ (High-speed streaming & primary reasoning) ──────────────────────
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

    # ── OpenRouter (Configurable LLM & Remote Embeddings) ─────────────────────
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "nvidia/nemotron-3-super-120b-a12b:free,poolside/laguna-s-2.1:free")
    OPENROUTER_EMBEDDING_MODEL: str = os.getenv("OPENROUTER_EMBEDDING_MODEL", "openai/text-embedding-3-small")
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

    # ── Auth ─────────────────────────────────────────────────────────────────
    SECRET_KEY: str = os.getenv("SECRET_KEY") or os.getenv("JWT_SECRET", "dev-secret-change-in-prod")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")

    # ── Search Engines ───────────────────────────────────────────────────────
    SERPER_API_KEY: str = os.getenv("SERPER_API_KEY", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    BING_SEARCH_API_KEY: str = os.getenv("BING_SEARCH_API_KEY", "")

    # ── App ──────────────────────────────────────────────────────────────────
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = APP_ENV == "development"

    # ── Observability & RBAC ──────────────────────────────────────────────────
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "anilpradhan9644@gmail.com")
    SENTRY_DSN: str = os.getenv("SENTRY_DSN", "")
    SENTRY_TRACES_SAMPLE_RATE: float = float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.2" if os.getenv("APP_ENV") == "production" else "1.0"))
    SENTRY_PROFILES_SAMPLE_RATE: float = float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "0.1" if os.getenv("APP_ENV") == "production" else "1.0"))
    PROMETHEUS_METRICS_TOKEN: str = os.getenv("PROMETHEUS_METRICS_TOKEN", "")
    ENABLE_OBSERVABILITY: bool = os.getenv("ENABLE_OBSERVABILITY", "true").lower() == "true"
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,https://ai-career-mentor.vercel.app,https://ai-career-mentor-anil.vercel.app",
        ).split(",")
        if origin.strip() and origin.strip() != "*"
    ]

    def __init__(self):
        # Normalize PostgreSQL URL schema (Render/Neon/Heroku compatibility)
        if self.DATABASE_URL.startswith("postgres://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql://", 1)

        # Resolve relative SQLite URL to absolute project root directory
        if self.DATABASE_URL.startswith("sqlite:///"):
            db_file = self.DATABASE_URL.split("sqlite:///")[1]
            if db_file.startswith("./") or db_file.startswith(".\\"):
                db_file = db_file[2:]
            
            # Resolve relative path relative to project ROOT folder
            if not os.path.isabs(db_file):
                config_path = Path(os.path.abspath(__file__))
                root_dir = config_path.parent.parent.parent.parent
                abs_db_path = str(root_dir / db_file)
                self.DATABASE_URL = f"sqlite:///{abs_db_path}"

        if self.APP_ENV == "production":
            if self.DATABASE_URL.startswith("sqlite"):
                raise ValueError("CRITICAL: SQLite cannot be used in production! Please set a valid PostgreSQL DATABASE_URL.")
            if self.SECRET_KEY == "dev-secret-change-in-prod":
                raise ValueError("CRITICAL: SECRET_KEY is still the default placeholder! Generate a strong secret for production.")

    def get_llm_config(self, provider: str = None) -> dict:
        """
        Returns technical parameters for LLM providers (Groq, OpenRouter).
        If provider is None, uses the default from LLM_PROVIDER env.
        """
        active_provider = provider or self.LLM_PROVIDER
        
        if active_provider == "openrouter":
            return {
                "config_list": [{
                    "model": self.OPENROUTER_MODEL,
                    "api_key": self.OPENROUTER_API_KEY,
                    "base_url": self.OPENROUTER_BASE_URL,
                    "api_type": "openai",
                    "price": [0.0, 0.0],
                }],
                "temperature": 0.7,
                "timeout": 120,
                "max_tokens": 4096,
                "cache_seed": None,
            }

        elif active_provider == "groq":
            return {
                "config_list": [{
                    "model": self.GROQ_MODEL,
                    "api_key": self.GROQ_API_KEY,
                    "base_url": "https://api.groq.com/openai/v1",
                    "api_type": "openai",
                    "price": [0.00059, 0.00079],
                }],
                "temperature": 0.8,
                "timeout": 120,
                "max_tokens": 4096,
                "cache_seed": None,
            }

        else:
            default_key = self.OPENROUTER_API_KEY or self.GROQ_API_KEY
            default_base = self.OPENROUTER_BASE_URL if self.OPENROUTER_API_KEY else "https://api.groq.com/openai/v1"
            default_model = self.OPENROUTER_MODEL if self.OPENROUTER_API_KEY else self.GROQ_MODEL
            return {
                "config_list": [{
                    "model": default_model,
                    "api_key": default_key,
                    "base_url": default_base,
                    "api_type": "openai",
                    "price": [0.0, 0.0],
                }],
                "temperature": 0.7,
                "timeout": 120,
                "max_tokens": 4096,
                "cache_seed": None,
            }

    @property
    def llm_config(self) -> dict:
        """Default AutoGen-compatible LLM config."""
        return self.get_llm_config()

    @property
    def is_configured(self) -> bool:
        """Returns True if at least one LLM provider API key is set."""
        return bool(self.GROQ_API_KEY or self.OPENROUTER_API_KEY)

    @property
    def active_model(self) -> str:
        """Returns the currently active model name for logging."""
        if self.LLM_PROVIDER == "openrouter":
            return self.OPENROUTER_MODEL
        return self.GROQ_MODEL


# Single global instance
settings = Settings()
