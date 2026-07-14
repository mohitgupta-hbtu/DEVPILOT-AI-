from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./devpilot.db"

    github_client_id: str = ""
    github_client_secret: str = ""
    github_redirect_uri: str = "http://localhost:8000/auth/callback"

    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    access_token_ttl_minutes: int = 15
    refresh_token_ttl_days: int = 7

    cors_origins: str = "http://localhost:5173"
    environment: str = "development"
    frontend_url: str = "http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if settings.environment == "production":
        missing = []
        if not settings.jwt_secret:
            missing.append("JWT_SECRET")
        if not settings.github_client_id:
            missing.append("GITHUB_CLIENT_ID")
        if not settings.github_client_secret:
            missing.append("GITHUB_CLIENT_SECRET")
        if missing:
            raise ValueError(f"Critical environment variables missing for production: {', '.join(missing)}")
    return settings
