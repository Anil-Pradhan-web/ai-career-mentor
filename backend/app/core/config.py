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
    GOOGLE_MODEL: str = os.getenv("GOOGLE_MODEL", "gemini-1.5-flash")

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

    # ── Auth ──────────────────────────────────────────────────────────────────
    SECRET_KEY: str = os.getenv("SECRET_KEY") or os.getenv("JWT_SECRET", "dev-secret-change-in-prod")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")

    # ── Bing Search (Day 5 — optional) ───────────────────────────────────────
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
        if origin.strip()
    ]

    def get_llm_config(self, provider: str = None) -> dict:
        """
        Returns AutoGen-compatible LLM config for a specific provider.
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

        else:
            # ── Google Gemini (Default) ─────────────────────────────────────
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
        return bool(self.GOOGLE_API_KEY)

    @property
    def active_model(self) -> str:
        """Returns the currently active model name for logging."""
        if self.LLM_PROVIDER == "groq":
            return self.GROQ_MODEL
        return self.GOOGLE_MODEL


# Single global instance
settings = Settings()
