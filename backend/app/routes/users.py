from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.middleware.auth import get_current_user
from app.models import User, UserSettings, SavedAnalysis, Favorite
from app.schemas import MeResponse, UserSettingsPublic, UserSettingsUpdate
from app.security import clear_auth_cookies

router = APIRouter(tags=["users"])


@router.get("/me", response_model=MeResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> MeResponse:
    result = await session.execute(
        select(UserSettings).where(UserSettings.user_id == current_user.id)
    )
    settings_row = result.scalar_one_or_none()
    if settings_row is None:
        settings_row = UserSettings(user_id=current_user.id)
        session.add(settings_row)
        await session.commit()
        await session.refresh(settings_row)
    return MeResponse(**current_user.model_dump(), settings=UserSettingsPublic.model_validate(settings_row))


@router.patch("/me/settings", response_model=UserSettingsPublic)
async def update_settings(
    payload: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> UserSettingsPublic:
    result = await session.execute(
        select(UserSettings).where(UserSettings.user_id == current_user.id)
    )
    row = result.scalar_one_or_none()
    if row is None:
        row = UserSettings(user_id=current_user.id)
        session.add(row)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    await session.commit()
    await session.refresh(row)
    return UserSettingsPublic.model_validate(row)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
async def delete_me(
    response: Response,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    # 1. Delete dependent models explicitly for DB design reliability
    await session.execute(delete(UserSettings).where(UserSettings.user_id == current_user.id))
    await session.execute(delete(SavedAnalysis).where(SavedAnalysis.user_id == current_user.id))
    await session.execute(delete(Favorite).where(Favorite.user_id == current_user.id))

    # 2. Delete main User node
    await session.delete(current_user)
    await session.commit()

    # 3. Clear authorization cookies to block subsequent session verification requests
    clear_auth_cookies(response)
