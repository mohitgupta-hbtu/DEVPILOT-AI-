from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models import UserSettings


# ---------- Auth / User ----------
class GitHubUser(BaseModel):
    id: int
    login: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    github_id: int
    username: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime
    last_login: datetime


class MeResponse(UserPublic):
    settings: "UserSettingsPublic"


# ---------- Settings ----------
class UserSettingsPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    theme: str
    ai_provider: str
    language: str
    email_notifications: bool
    product_updates: bool
    public_profile: bool
    updated_at: datetime


class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = Field(default=None, pattern="^(system|light|dark)$")
    ai_provider: Optional[str] = None
    language: Optional[str] = Field(default=None, min_length=2, max_length=8)
    email_notifications: Optional[bool] = None
    product_updates: Optional[bool] = None
    public_profile: Optional[bool] = None


# ---------- Analyses ----------
class AnalysisSaveRequest(BaseModel):
    repo_url: str = Field(min_length=5, max_length=512)
    repo_name: str = Field(min_length=1, max_length=200)
    health_score: Optional[int] = Field(default=None, ge=0, le=100)
    ai_summary: Optional[str] = Field(default=None, max_length=20000)
    tech_stack: Optional[str] = Field(default=None, max_length=5000)
    learning_roadmap: Optional[str] = Field(default=None, max_length=20000)
    commit_sha: Optional[str] = Field(default=None, max_length=64)


class AnalysisPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    repo_url: str
    repo_name: str
    analysis_date: datetime
    health_score: Optional[int] = None
    ai_summary: Optional[str] = None
    tech_stack: Optional[str] = None
    learning_roadmap: Optional[str] = None
    commit_sha: Optional[str] = None
    created_at: datetime


class HistoryQuery(BaseModel):
    q: Optional[str] = Field(default=None, max_length=200)
    sort: str = Field(default="created_at", pattern="^(created_at|analysis_date|repo_name|health_score)$")
    order: str = Field(default="desc", pattern="^(asc|desc)$")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=100)


class HistoryResponse(BaseModel):
    items: list[AnalysisPublic]
    total: int
    page: int
    page_size: int


# ---------- Favorites ----------
class FavoriteCreate(BaseModel):
    repo_url: str = Field(min_length=5, max_length=512)
    repo_name: str = Field(min_length=1, max_length=200)
    repo_owner: Optional[str] = Field(default=None, max_length=100)
    note: Optional[str] = Field(default=None, max_length=500)


class FavoritePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    repo_url: str
    repo_name: str
    repo_owner: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime


MeResponse.model_rebuild()
