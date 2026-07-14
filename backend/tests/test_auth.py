from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app


def test_health() -> None:
    with TestClient(app) as client:
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}


def test_protected_route_requires_auth() -> None:
    with TestClient(app) as client:
        # /me has no cookie → 401
        assert client.get("/me").status_code == 401
        # history requires auth
        assert client.get("/history").status_code == 401


def test_github_oauth_unconfigured_is_handled() -> None:
    with TestClient(app) as client:
        # Without GITHUB_CLIENT_ID set it should return 503, not 500.
        resp = client.post("/auth/github")
        assert resp.status_code in (503, 200)
