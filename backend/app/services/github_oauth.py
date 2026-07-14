from __future__ import annotations

import secrets
from typing import Any
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException

from app.config import get_settings
from app.schemas import GitHubUser

settings = get_settings()

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_API_USER = "https://api.github.com/user"
GITHUB_API_EMAILS = "https://api.github.com/user/emails"


def generate_state() -> str:
    return secrets.token_urlsafe(32)


def build_authorize_url(state: str) -> str:
    params = {
        "client_id": settings.github_client_id,
        "redirect_uri": settings.github_redirect_uri,
        "scope": "read:user user:email",
        "state": state,
        "allow_signup": "true",
    }
    return f"{GITHUB_AUTHORIZE_URL}?{urlencode(params)}"


async def exchange_code_for_token(code: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                GITHUB_TOKEN_URL,
                data={
                    "client_id": settings.github_client_id,
                    "client_secret": settings.github_client_secret,
                    "code": code,
                    "redirect_uri": settings.github_redirect_uri,
                },
                headers={"Accept": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail="GitHub rejected the OAuth code.") from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Could not reach GitHub: {exc}") from exc

    if "access_token" not in data:
        raise HTTPException(status_code=502, detail="GitHub did not return an access token.")
    return data["access_token"]


async def fetch_github_user(access_token: str) -> GitHubUser:
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            user_resp = await client.get(GITHUB_API_USER, headers=headers)
            user_resp.raise_for_status()
            user_data: dict[str, Any] = user_resp.json()

            email = user_data.get("email")
            if not email:
                emails_resp = await client.get(GITHUB_API_EMAILS, headers=headers)
                if emails_resp.status_code == 200:
                    for entry in emails_resp.json():
                        if entry.get("primary") and entry.get("verified"):
                            email = entry.get("email")
                            break
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail="GitHub rejected the access token.") from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Could not reach GitHub: {exc}") from exc

    return GitHubUser(
        id=user_data["id"],
        login=user_data["login"],
        name=user_data.get("name"),
        avatar_url=user_data.get("avatar_url"),
        email=email,
        bio=user_data.get("bio"),
    )

