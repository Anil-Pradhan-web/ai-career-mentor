import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # ─────────────────────────────────────────────────────────────────────────
    # LLM_PROVIDER options:
    #   "groq"   → 100% FREE, no credit card, use for DEV (RECOMMENDED!)
    #   "openai" → Direct OpenAI ($5 free credits on new account)
    #   "azure"  → Azure OpenAI (for final hackathon submission)
    # ─────────────────────────────────────────────────────────────────────────
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")

    # ── GROQ (FREE — No Credit Card!) ─────────────────────────────────────────
    # Get key from: https://console.groq.com → API Keys → Create
    # Sign in with Google — that's it!
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    # ── Direct OpenAI (optional) ──────────────────────────────────────────────
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # ── Azure OpenAI (for final submission) ───────────────────────────────────
    AZURE_OPENAI_API_KEY: str = os.getenv("AZURE_OPENAI_API_KEY", "")
    AZURE_OPENAI_ENDPOINT: str = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    AZURE_OPENAI_DEPLOYMENT: str = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
    AZURE_OPENAI_API_VERSION: str = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

    # ── Auth ──────────────────────────────────────────────────────────────────
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-in-prod")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # ── Bing Search (Day 5 — optional) ───────────────────────────────────────
    BING_SEARCH_API_KEY: str = os.getenv("BING_SEARCH_API_KEY", "")

    # ── App ───────────────────────────────────────────────────────────────────
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = APP_ENV == "development"

    @property
    def llm_config(self) -> dict:
        """
        AutoGen-compatible LLM config.
        Switches automatically based on LLM_PROVIDER env variable.
        """
        if self.LLM_PROVIDER == "groq":
            # ── Groq (FREE, OpenAI-compatible API) ───────────────────────────
            return {
                "config_list": [{
                    "model": self.GROQ_MODEL,
                    "api_key": self.GROQ_API_KEY,
                    "base_url": "https://api.groq.com/openai/v1",
                    "api_type": "openai",   # Groq uses OpenAI-compatible format
                }],
                "temperature": 0.7,
                "timeout": 120,
            }

        elif self.LLM_PROVIDER == "azure":
            # ── Azure OpenAI ─────────────────────────────────────────────────
            return {
                "config_list": [{
                    "model": self.AZURE_OPENAI_DEPLOYMENT,
                    "api_key": self.AZURE_OPENAI_API_KEY,
                    "base_url": self.AZURE_OPENAI_ENDPOINT,
                    "api_type": "azure",
                    "api_version": self.AZURE_OPENAI_API_VERSION,
                }],
                "temperature": 0.7,
                "timeout": 120,
            }

        else:
            # ── Direct OpenAI ─────────────────────────────────────────────────
            return {
                "config_list": [{
                    "model": self.OPENAI_MODEL,
                    "api_key": self.OPENAI_API_KEY,
                }],
                "temperature": 0.7,
                "timeout": 120,
            }

    @property
    def is_configured(self) -> bool:
        """Returns True if the required API key is set."""
        if self.LLM_PROVIDER == "groq":
            return bool(self.GROQ_API_KEY and not self.GROQ_API_KEY.startswith("gsk_paste"))
        elif self.LLM_PROVIDER == "azure":
            return bool(self.AZURE_OPENAI_API_KEY and self.AZURE_OPENAI_ENDPOINT)
        return bool(self.OPENAI_API_KEY)

    @property
    def active_model(self) -> str:
        """Returns the currently active model name for logging."""
        if self.LLM_PROVIDER == "groq":
            return self.GROQ_MODEL
        elif self.LLM_PROVIDER == "azure":
            return self.AZURE_OPENAI_DEPLOYMENT
        return self.OPENAI_MODEL


# Single global instance
settings = Settings()
