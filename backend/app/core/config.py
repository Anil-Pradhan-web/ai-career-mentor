import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # ─────────────────────────────────────────────────────────────────────────
    # LLM_PROVIDER options:
    #   "groq"   → 100% FREE, no credit card, use for DEV (RECOMMENDED!)
    #   "google" → Google Gemini 1.5 (Pro or Flash) via Vertex AI / AI Studio
    # ─────────────────────────────────────────────────────────────────────────
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")

    # ── GROQ (FREE — No Credit Card!) ─────────────────────────────────────────
    # Get key from: https://console.groq.com → API Keys → Create
    # Sign in with Google — that's it!
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    # ── Google Gemini (via ag2 google library) ──────────────────────────────
    # Get key from: https://aistudio.google.com/
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GOOGLE_MODEL: str = os.getenv("GOOGLE_MODEL", "gemini-2.5-flash")

    # ── NVIDIA NIM (Enterprise Grade) ───────────────────────────────────────
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_MODEL: str = os.getenv("NVIDIA_MODEL", "deepseek-ai/deepseek-v4-pro")

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

    # ── Auth ──────────────────────────────────────────────────────────────────
    SECRET_KEY: str = os.getenv("SECRET_KEY") or os.getenv("JWT_SECRET", "dev-secret-change-in-prod")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")

    # ── Search Engines (Professional APIs) ──────────────────────────────────
    SERPER_API_KEY: str = os.getenv("SERPER_API_KEY", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    BING_SEARCH_API_KEY: str = os.getenv("BING_SEARCH_API_KEY", "")

    # ── App ───────────────────────────────────────────────────────────────────
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = APP_ENV == "development"
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,https://ai-career-mentor.vercel.app,https://ai-career-mentor-anil.vercel.app",
        ).split(",")
        if origin.strip() and origin.strip() != "*"
    ]

    def __init__(self):
        if self.APP_ENV == "production":
            if self.DATABASE_URL.startswith("sqlite"):
                raise ValueError("CRITICAL: SQLite cannot be used in production! Please set a valid PostgreSQL DATABASE_URL.")
            if self.SECRET_KEY == "dev-secret-change-in-prod":
                raise ValueError("CRITICAL: SECRET_KEY is still the default placeholder! Generate a strong secret for production.")

    def get_llm_config(self, provider: str = None) -> dict:
        """
        Returns technical parameters for LLM providers (Gemini, Groq, Nvidia).
        If provider is None, uses the default from LLM_PROVIDER env.
        """
        active_provider = provider or self.LLM_PROVIDER
        
        if active_provider == "groq":
            # ── Groq (FREE, OpenAI-compatible API) ───────────────────────────
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

        elif active_provider == "nvidia":
            # ── NVIDIA NIM (Enterprise-grade, OpenAI-compatible API) ─────────
            return {
                "config_list": [{
                    "model": self.NVIDIA_MODEL,
                    "api_key": self.NVIDIA_API_KEY,
                    "base_url": "https://integrate.api.nvidia.com/v1",
                    "api_type": "openai",
                    "price": [0.0007, 0.0007],
                }],
                "temperature": 0.7,
                "timeout": 120,
                "max_tokens": 4096,
                "cache_seed": None,
            }

        else:
            # ── Google Gemini (Default Fallback) ─────────────────────────────
            return {
                "config_list": [{
                    "model": self.GOOGLE_MODEL,
                    "api_key": self.GOOGLE_API_KEY,
                    "api_type": "google",
                    "price": [0.000075, 0.0003], # Prevent AutoGen pricing warning
                }],
                "temperature": 0.8,
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
        """Returns True if the required API key is set."""
        if self.LLM_PROVIDER == "groq":
            return bool(self.GROQ_API_KEY and not self.GROQ_API_KEY.startswith("gsk_paste"))
        if self.LLM_PROVIDER == "nvidia":
            return bool(self.NVIDIA_API_KEY)
        return bool(self.GOOGLE_API_KEY)

    @property
    def active_model(self) -> str:
        """Returns the currently active model name for logging."""
        if self.LLM_PROVIDER == "groq":
            return self.GROQ_MODEL
        if self.LLM_PROVIDER == "nvidia":
            return self.NVIDIA_MODEL
        return self.GOOGLE_MODEL


# Single global instance
settings = Settings()
