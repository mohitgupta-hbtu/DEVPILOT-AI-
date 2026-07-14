from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Security hardening headers. Tuned for a cookie-authenticated SPA talking to
# this API. CSP allows only same-origin scripts/styles (Vite/React ship hashed
# or bundled assets); tighten further if you add third-party scripts.
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Content-Security-Policy": (
        "default-src 'self'; "
        "img-src 'self' data: https://avatars.githubusercontent.com https://*.githubusercontent.com; "
        "style-src 'self' 'unsafe-inline'; "
        "script-src 'self'; "
        "connect-src 'self'; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    ),
}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        path = request.url.path
        is_swagger = path.startswith(("/docs", "/redoc", "/openapi.json"))

        for key, value in SECURITY_HEADERS.items():
            if key == "Content-Security-Policy" and is_swagger:
                continue
            response.headers.setdefault(key, value)

        # HSTS only makes sense over HTTPS (production). Safe to set always;
        # browsers ignore it on plain HTTP.
        if request.url.scheme == "https":
            response.headers.setdefault(
                "Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"
            )
        return response
