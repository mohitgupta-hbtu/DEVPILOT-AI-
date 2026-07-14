from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.lib.sanitize import sanitize_repo_url
from app.middleware.auth import get_current_user
from app.models import Favorite, User
from app.schemas import FavoriteCreate, FavoritePublic

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=list[FavoritePublic])
async def list_favorites(
    q: str | None = Query(default=None, max_length=200),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[Favorite]:
    stmt = select(Favorite).where(Favorite.user_id == current_user.id)
    if q:
        stmt = stmt.where(Favorite.repo_name.ilike(f"%{q}%") | Favorite.repo_url.ilike(f"%{q}%"))
    result = await session.execute(stmt.order_by(Favorite.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=FavoritePublic, status_code=201)
async def add_favorite(
    payload: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Favorite:
    favorite = Favorite(
        user_id=current_user.id,
        repo_url=sanitize_repo_url(payload.repo_url),
        repo_name=payload.repo_name,
        repo_owner=payload.repo_owner,
        note=payload.note,
    )
    session.add(favorite)
    await session.commit()
    await session.refresh(favorite)
    return favorite


@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
async def remove_favorite(
    favorite_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    result = await session.execute(
        select(Favorite).where(Favorite.id == favorite_id, Favorite.user_id == current_user.id)
    )
    favorite = result.scalar_one_or_none()
    if favorite is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorite not found")
    await session.delete(favorite)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
