from __future__ import annotations

import datetime as dt
from typing import Any

import jwt
from fastapi import HTTPException, status
from fastapi.responses import Response

from app.config import get_settings

settings = get_settings()

ACCESS_COOKIE = "dp_access"
REFRESH_COOKIE = "dp_refresh"
STATE_COOKIE = "dp_oauth_state"

# Cookies for cross-site (browser → api on different origin) must be
# SameSite=None + Secure. On same-origin dev you can relax to Lax.
_SAMESITE = "none" if settings.environment == "production" else "lax"
_SECURE = settings.environment == "production"


def _now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def create_access_token(user_id: int, github_id: int, username: str) -> str:
    exp = _now() + dt.timedelta(minutes=settings.access_token_ttl_minutes)
    payload = {"sub": str(user_id), "gh": github_id, "user": username, "type": "access", "exp": exp, "iat": _now()}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(user_id: int) -> str:
    exp = _now() + dt.timedelta(days=settings.refresh_token_ttl_days)
    payload = {"sub": str(user_id), "type": "refresh", "exp": exp, "iat": _now()}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str, expected_type: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired") from exc
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    if payload.get("type") != expected_type:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong token type")
    return payload


def set_auth_cookies(response: Response, user_id: int, github_id: int, username: str) -> None:
    access = create_access_token(user_id, github_id, username)
    refresh = create_refresh_token(user_id)
    response.set_cookie(ACCESS_COOKIE, access, httponly=True, samesite=_SAMESITE, secure=_SECURE, path="/")
    response.set_cookie(REFRESH_COOKIE, refresh, httponly=True, samesite=_SAMESITE, secure=_SECURE, path="/")


def clear_auth_cookies(response: Response) -> None:
    for name in (ACCESS_COOKIE, REFRESH_COOKIE, STATE_COOKIE):
        response.delete_cookie(name, path="/")


def set_state_cookie(response: Response, state: str) -> None:
    response.set_cookie(STATE_COOKIE, state, httponly=True, samesite=_SAMESITE, secure=_SECURE, path="/", max_age=600)


def get_cookie(request: "Any", name: str) -> str | None:
    return request.cookies.get(name)
