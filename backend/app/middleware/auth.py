from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import User
from app.security import ACCESS_COOKIE, REFRESH_COOKIE, decode_token

_credentials_exc = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
)


async def get_current_user(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> User:
    token = request.cookies.get(ACCESS_COOKIE)
    if not token:
        raise _credentials_exc
    payload = decode_token(token, "access")  # raises 401 on invalid/expired
    user_id = int(payload["sub"])

    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise _credentials_exc
    return user


async def get_optional_user(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> Optional[User]:
    """Used by the public analysis engine so it can attribute (but never trust) a caller."""
    token = request.cookies.get(ACCESS_COOKIE)
    if not token:
        return None
    try:
        payload = decode_token(token, "access")
    except HTTPException:
        return None
    result = await session.execute(select(User).where(User.id == int(payload["sub"])))
    return result.scalar_one_or_none()
