from __future__ import annotations

import logging
import time
import uuid

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("devpilot.request")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Attaches a correlation id to every request and logs method/path/status/latency."""

    async def dispatch(self, request: Request, call_next) -> Response:
        correlation_id = request.headers.get("x-request-id") or uuid.uuid4().hex[:16]
        request.state.correlation_id = correlation_id
        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000
        response.headers["x-request-id"] = correlation_id
        logger.info(
            "request",
            extra={
                "correlation_id": correlation_id,
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "ms": round(elapsed_ms, 2),
                "ip": request.client.host if request.client else None,
            },
        )
        return response
