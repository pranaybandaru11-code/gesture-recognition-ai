from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Pydantic-settings automatically reads from .env file and
    environment variables — env vars take priority over .env file.
    """

    # ─── Project ─────────────────────────────────────────
    PROJECT_NAME: str = "Gesture Recognition System"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    # ─── Security ────────────────────────────────────────
    SECRET_KEY: str = "fallback-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ─── Database ────────────────────────────────────────
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "gesture_db"
    POSTGRES_USER: str = "gesture_user"
    POSTGRES_PASSWORD: str = "gesture_secret_password_2024"

    @property
    def DATABASE_URL(self) -> str:
        """Async database URL for SQLAlchemy."""
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:"
            f"{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:"
            f"{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def SYNC_DATABASE_URL(self) -> str:
        """Sync database URL used only by Alembic migrations."""
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:"
            f"{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:"
            f"{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # ─── ML Service ──────────────────────────────────────
    ML_SERVICE_URL: str = "http://ml-service:8001"

    # ─── CORS ────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    # ─── Pydantic v2 style config ────────────────────────
    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }


# Single instance used across the entire app
settings = Settings()