from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.lib.sanitize import sanitize_repo_url
from app.middleware.auth import get_current_user
from app.models import SavedAnalysis, User
from app.schemas import (
    AnalysisPublic,
    AnalysisSaveRequest,
    HistoryResponse,
)

router = APIRouter(tags=["analyses"])


@router.post("/analysis/save", response_model=AnalysisPublic, status_code=201)
async def save_analysis(
    payload: AnalysisSaveRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> SavedAnalysis:
    repo_url = sanitize_repo_url(payload.repo_url)
    analysis = SavedAnalysis(
        user_id=current_user.id,
        repo_url=repo_url,
        repo_name=payload.repo_name,
        health_score=payload.health_score,
        ai_summary=payload.ai_summary,
        tech_stack=payload.tech_stack,
        learning_roadmap=payload.learning_roadmap,
        commit_sha=payload.commit_sha,
    )
    session.add(analysis)
    await session.commit()
    await session.refresh(analysis)
    return analysis


@router.get("/history", response_model=HistoryResponse)
async def list_history(
    q: str | None = Query(default=None, max_length=200),
    sort: str = Query(default="created_at", pattern="^(created_at|analysis_date|repo_name|health_score)$"),
    order: str = Query(default="desc", pattern="^(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> HistoryResponse:
    column = getattr(SavedAnalysis, sort)
    ordered = column.asc() if order == "asc" else column.desc()

    base = select(SavedAnalysis).where(SavedAnalysis.user_id == current_user.id)
    if q:
        like = f"%{q}%"
        base = base.where(
            SavedAnalysis.repo_name.ilike(like) | SavedAnalysis.repo_url.ilike(like)
        )

    total = await session.scalar(
        select(func.count()).select_from(base.subquery())
    )
    result = await session.execute(
        base.order_by(ordered)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = result.scalars().all()
    return HistoryResponse(items=items, total=total or 0, page=page, page_size=page_size)


@router.get("/analysis/{analysis_id}", response_model=AnalysisPublic)
async def get_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> SavedAnalysis:
    analysis = await _owned_analysis(session, analysis_id, current_user.id)
    return analysis


@router.delete("/analysis/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
async def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    analysis = await _owned_analysis(session, analysis_id, current_user.id)
    await session.delete(analysis)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


async def _owned_analysis(session: AsyncSession, analysis_id: int, user_id: int) -> SavedAnalysis:
    result = await session.execute(
        select(SavedAnalysis).where(
            SavedAnalysis.id == analysis_id, SavedAnalysis.user_id == user_id
        )
    )
    analysis = result.scalar_one_or_none()
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return analysis
