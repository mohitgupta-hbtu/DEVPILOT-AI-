from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.ai.engines import parse_json_from_response
from app.api.services.github.service import github_service
from app.middleware.security_headers import SecurityHeadersMiddleware

# Minimal app (no DB lifespan) so the header check runs without a database.
_mini = FastAPI()
_mini.add_middleware(SecurityHeadersMiddleware)


@_mini.get("/x")
def _x() -> dict:
    return {"ok": True}


def test_security_headers_present() -> None:
    with TestClient(_mini) as client:
        resp = client.get("/x")
        assert resp.headers.get("X-Content-Type-Options") == "nosniff"
        assert resp.headers.get("X-Frame-Options") == "DENY"
        assert "default-src 'self'" in resp.headers.get("Content-Security-Policy", "")
        assert resp.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


def test_parse_json_from_response_handles_wrappers() -> None:
    bare = parse_json_from_response('{"summary": "ok"}')
    assert bare["summary"] == "ok"

    fenced = parse_json_from_response("```json\n{\"a\": 1}\n```")
    assert fenced["a"] == 1

    noisy = parse_json_from_response("Sure!\n{\"b\": 2}\nThanks.")
    assert noisy["b"] == 2


def test_parse_github_url_valid() -> None:
    assert github_service.parse_github_url("https://github.com/octocat/hello") == ("octocat", "hello")
    assert github_service.parse_github_url("github.com/foo/bar.git") == ("foo", "bar")
    assert github_service.parse_github_url("foo/bar") == ("foo", "bar")


def test_parse_github_url_rejects_other_hosts() -> None:
    import pytest
    from fastapi import HTTPException

    for bad in ("https://gitlab.com/a/b", "https://bitbucket.org/a/b", "not a url"):
        with pytest.raises(HTTPException):
            github_service.parse_github_url(bad)
