from __future__ import annotations

from urllib.parse import urlparse

from fastapi import HTTPException, status


def sanitize_repo_url(raw: str) -> str:
    """Normalize + validate a repository URL. Never trust frontend input."""
    if not raw:
        raise HTTPException(status_code=400, detail="repo_url is required")
    cleaned = raw.strip()
    parsed = urlparse(cleaned)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="repo_url must use http(s)")
    if not parsed.netloc or "." not in parsed.netloc:
        raise HTTPException(status_code=400, detail="repo_url has no valid host")
    return f"{parsed.scheme}://{parsed.netloc}{parsed.path}".rstrip("/")
