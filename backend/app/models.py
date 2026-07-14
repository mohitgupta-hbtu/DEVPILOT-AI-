from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    __tablename__ = "users"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    github_id: int = Field(index=True, unique=True)
    username: str = Field(index=True)
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime = Field(default_factory=_utcnow)
    last_login: datetime = Field(default_factory=_utcnow)


class UserSettings(SQLModel, table=True):
    __tablename__ = "user_settings"  # type: ignore[assignment]

    user_id: Optional[int] = Field(default=None, foreign_key="users.id", primary_key=True)
    theme: str = Field(default="system")            # system | light | dark
    ai_provider: str = Field(default="openai")      # Extension point for multi-provider
    language: str = Field(default="en")
    email_notifications: bool = Field(default=True)
    product_updates: bool = Field(default=True)
    public_profile: bool = Field(default=False)
    updated_at: datetime = Field(default_factory=_utcnow)


class SavedAnalysis(SQLModel, table=True):
    __tablename__ = "saved_analyses"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, ondelete="CASCADE")
    repo_url: str = Field(index=True)
    repo_name: str
    analysis_date: datetime = Field(default_factory=_utcnow)
    health_score: Optional[int] = None
    ai_summary: Optional[str] = None
    tech_stack: Optional[str] = None       # JSON-string list, kept as text for portability
    learning_roadmap: Optional[str] = None  # JSON-string steps
    commit_sha: Optional[str] = None
    created_at: datetime = Field(default_factory=_utcnow)


class Favorite(SQLModel, table=True):
    __tablename__ = "favorites"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, ondelete="CASCADE")
    repo_url: str = Field(index=True)
    repo_name: str
    repo_owner: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=_utcnow)

    __table_args__ = ({"sqlite_autoincrement": False},)
