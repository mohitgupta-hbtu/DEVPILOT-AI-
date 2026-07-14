from __future__ import annotations

import asyncio

from fastapi.testclient import TestClient
from sqlmodel import SQLModel

from app.database import engine
from app.main import app
from app.routes import auth as auth_routes


def test_end_to_end_flow() -> None:

    # Mock GitHub OAuth so no network is required.
    from app.config import get_settings
    get_settings().github_client_id = "fake_test_id"

    async def fake_exchange(code: str) -> str:
        return "fake-token"

    auth_routes.exchange_code_for_token = fake_exchange  # type: ignore[assignment]

    class FakeGH:
        id = 12345
        login = "octocat"
        name = "Octo Cat"
        avatar_url = "http://x/a.png"
        email = "o@x.com"
        bio = "hi"

    async def fake_user(token: str) -> FakeGH:
        return FakeGH()

    auth_routes.fetch_github_user = fake_user  # type: ignore[assignment]

    with TestClient(app) as c:
        r = c.post("/auth/github")
        assert r.status_code == 200 and "url" in r.json(), r.text
        state = c.cookies.get("dp_oauth_state")
        assert state

        cb = c.get("/auth/callback", params={"code": "abc", "state": state}, follow_redirects=False)
        assert cb.status_code in (302, 307), cb.status_code
        assert "dp_access" in c.cookies

        me = c.get("/me")
        assert me.status_code == 200, me.text
        assert me.json()["username"] == "octocat"

        sa = c.post("/analysis/save", json={"repo_url": "https://github.com/a/b", "repo_name": "b", "health_score": 88, "ai_summary": "good"})
        assert sa.status_code == 201, sa.text
        hid = sa.json()["id"]

        hist = c.get("/history")
        assert hist.status_code == 200 and hist.json()["total"] == 1

        fav = c.post("/favorites", json={"repo_url": "https://github.com/a/b", "repo_name": "b", "repo_owner": "a"})
        assert fav.status_code == 201, fav.text
        fav_id = fav.json()["id"]

        flist = c.get("/favorites")
        assert flist.status_code == 200 and len(flist.json()) == 1

        assert c.patch("/me/settings", json={"theme": "dark"}).status_code == 200

        assert c.delete(f"/analysis/{hid}").status_code == 204
        assert c.delete(f"/favorites/{fav_id}").status_code == 204

        assert c.post("/logout").status_code == 200
        assert c.get("/me").status_code == 401
