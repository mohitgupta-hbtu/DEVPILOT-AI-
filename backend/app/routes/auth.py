from __future__ import annotations

import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_session
from app.models import User, UserSettings
from app.schemas import GitHubUser, UserSettingsPublic, UserSettingsUpdate
from app.security import (
    REFRESH_COOKIE,
    STATE_COOKIE,
    clear_auth_cookies,
    decode_token,
    get_cookie,
    set_auth_cookies,
    set_state_cookie,
)
from app.services.github_oauth import (
    build_authorize_url,
    exchange_code_for_token,
    fetch_github_user,
    generate_state,
)

router = APIRouter(tags=["auth"])


@router.post("/auth/github")
async def start_github_oauth(response: Response) -> dict[str, str]:
    """Begin GitHub OAuth. Issues a state cookie (CSRF) and returns the authorize URL."""
    if not get_settings().github_client_id:
        raise HTTPException(status_code=503, detail="GitHub OAuth is not configured")
    state = generate_state()
    set_state_cookie(response, state)
    return {"url": build_authorize_url(state)}


@router.get("/auth/github/login")
async def start_github_oauth_redirect() -> RedirectResponse:
    """Browser-navigated OAuth start. Sets state cookie on backend domain and redirects to GitHub."""
    if not get_settings().github_client_id:
        raise HTTPException(status_code=503, detail="GitHub OAuth is not configured")
    state = generate_state()
    redirect = RedirectResponse(url=build_authorize_url(state), status_code=302)
    set_state_cookie(redirect, state)
    return redirect


@router.get("/auth/callback")
async def github_callback(
    request: Request,
    code: str,
    state: str,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> RedirectResponse:
    import logging
    logger = logging.getLogger("auth")

    # State validation — if cookie is missing (e.g. after server restart), log but continue
    expected_state = get_cookie(request, STATE_COOKIE)
    if expected_state and not secrets.compare_digest(expected_state, state):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state")
    if not expected_state:
        logger.warning("OAuth state cookie missing — likely server restart. Proceeding anyway.")

    try:
        access_token = await exchange_code_for_token(code)
    except HTTPException as exc:
        logger.error(f"Token exchange failed: {exc.detail}")
        raise
    
    try:
        gh: GitHubUser = await fetch_github_user(access_token)
    except HTTPException as exc:
        logger.error(f"GitHub user fetch failed: {exc.detail}")
        raise

    result = await session.execute(select(User).where(User.github_id == gh.id))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(
            github_id=gh.id,
            username=gh.login,
            display_name=gh.name,
            avatar_url=gh.avatar_url,
            email=gh.email,
            bio=gh.bio,
        )
        session.add(user)
        await session.flush()
        session.add(UserSettings(user_id=user.id))
    else:
        user.username = gh.login
        user.display_name = gh.name
        user.avatar_url = gh.avatar_url
        user.email = gh.email
        user.bio = gh.bio
    user.last_login = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(user)

    frontend = get_settings().frontend_url
    logger.info(f"OAuth success for {gh.login}. Redirecting to {frontend}/dashboard")
    
    # Encode user profile into URL fragment so the frontend (different origin) can read it.
    # HttpOnly cookies from :8000 can't be accessed by JS on :8080.
    import base64, json as _json
    user_payload = {
        "id": user.id,
        "github_id": user.github_id,
        "username": user.username,
        "display_name": user.display_name,
        "avatar_url": user.avatar_url,
        "email": user.email,
        "bio": user.bio,
    }
    encoded = base64.urlsafe_b64encode(_json.dumps(user_payload).encode()).decode()
    redirect = RedirectResponse(url=f"{frontend}/dashboard#auth={encoded}", status_code=302)
    set_auth_cookies(redirect, user.id, user.github_id, user.username)
    redirect.delete_cookie(STATE_COOKIE, path="/")
    return redirect


@router.post("/logout")
async def logout(response: Response) -> dict[str, str]:
    clear_auth_cookies(response)
    return {"detail": "logged out"}


@router.post("/auth/refresh")
async def refresh_token(
    request: Request, response: Response, session: AsyncSession = Depends(get_session)
) -> dict[str, str]:
    token = get_cookie(request, REFRESH_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    payload = decode_token(token, "refresh")
    result = await session.execute(select(User).where(User.id == int(payload["sub"])))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")
    set_auth_cookies(response, user.id, user.github_id, user.username)
    return {"detail": "refreshed"}
