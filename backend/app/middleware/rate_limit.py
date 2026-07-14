from __future__ import annotations

import time
from collections import defaultdict, deque
from typing import Optional

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Per-IP token-bucket rate limiter.

    ponytail: in-memory is the minimum that works for a single process.
    Upgrade path: back it with Redis when running multiple instances.
    """

    def __init__(self, app, max_requests: int = 60, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def _client_ip(self, request: Request) -> str:
        fwd = request.headers.get("x-forwarded-for")
        if fwd:
            return fwd.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path
        
        # 1. Enforce strict rate limits on authentication handshakes (Max 5 attempts / min)
        if path.startswith(("/auth/callback", "/auth/github/login")):
            ip = self._client_ip(request)
            now = time.time()
            bucket = self._hits[f"auth_{ip}"]
            while bucket and bucket[0] <= now - 60:
                bucket.popleft()
            if len(bucket) >= 5:
                resp = Response("Too many login attempts. Please wait.", status_code=429)
                resp.headers["Retry-After"] = "60"
                return resp
            bucket.append(now)

        # 2. General endpoint throttling for write/parse endpoints (Max 120 / min)
        if path.startswith(("/auth/", "/analysis", "/favorites", "/api/analyze")) and request.method in ("POST", "DELETE", "GET"):
            ip = self._client_ip(request)
            now = time.time()
            bucket = self._hits[ip]
            while bucket and bucket[0] <= now - self.window_seconds:
                bucket.popleft()
            if len(bucket) >= self.max_requests:
                resp = Response("Too many requests", status_code=429)
                resp.headers["Retry-After"] = str(self.window_seconds)
                return resp
            bucket.append(now)

        return await call_next(request)
