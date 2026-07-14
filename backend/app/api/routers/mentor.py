from __future__ import annotations

from typing import Dict, Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.ai.mentor import mentor
from app.api.services.github.service import github_service
from app.middleware.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/mentor", tags=["mentor"])


class MentorRepoRequest(BaseModel):
    repositoryUrl: str = Field(min_length=3, max_length=512)


class MentorChatRequest(MentorRepoRequest):
    question: str = Field(min_length=1, max_length=2000)
    history: List[Dict[str, str]] = Field(default_factory=list, max_length=40)


class MentorContextResponse(BaseModel):
    name: str
    owner: str
    description: str
    stars: int
    forks: int
    language: str
    topics: List[str]
    defaultBranch: str
    languages: List[Dict[str, Any]]
    techStack: List[str]
    entryPoints: List[str]
    suggestedStartingFolders: List[str]
    dependencies: List[Dict[str, Any]]
    healthScore: Optional[int]
    readmeSnippet: str
    fileCount: int
    topFolders: List[str]


@router.post("/context", response_model=MentorContextResponse)
async def mentor_context(
    payload: MentorRepoRequest,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    owner, repo = github_service.parse_github_url(payload.repositoryUrl)
    try:
        mc = await mentor.load_context(owner, repo)
    except HTTPException:
        raise
    except Exception as e:  # network/parse failures surface as 502
        raise HTTPException(status_code=502, detail=f"Failed to load repository context: {str(e)}")
    return mc.summary


@router.post("/chat")
async def mentor_chat(
    payload: MentorChatRequest,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    owner, repo = github_service.parse_github_url(payload.repositoryUrl)
    try:
        return await mentor.ask(owner, repo, payload.question, payload.history)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Mentor failed to answer: {str(e)}")
