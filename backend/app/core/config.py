"""
app/core/config.py
──────────────────
Application-wide settings loaded from environment variables.
Pydantic BaseSettings automatically reads from .env file and
validates types at startup — fails fast if a required var is missing.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyUrl
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── App ───────────────────────────────────────────────────
    app_name:    str  = "OrderBookExpert"
    app_version: str  = "1.0.0"
    debug:       bool = False

    # ── CORS ─────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    # ── Database (TimescaleDB) ────────────────────────────────
    database_url: str = (
        "postgresql+asyncpg://obe_user:obe_pass@localhost:5432/obe_db"
    )

    # ── JWT ───────────────────────────────────────────────────
    jwt_secret_key:                    str = "change-this-in-production-min-32-chars"
    jwt_algorithm:                     str = "HS256"
    jwt_access_token_expire_minutes:   int = 60
    jwt_refresh_token_expire_days:     int = 7

    # ── Redis / Celery ────────────────────────────────────────
    redis_url:          str = "redis://localhost:6379/0"
    celery_broker_url:  str = "redis://localhost:6379/1"

    # ── Exchange (defaults, overridden per-user from DB) ──────
    binance_api_key:    str = ""
    binance_api_secret: str = ""


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""
    return Settings()


settings = get_settings()
