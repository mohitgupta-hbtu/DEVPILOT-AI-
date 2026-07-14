from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import get_settings
from app.database import init_db
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.routes import analyses, auth, favorites, users
from app.api.routers.mentor import router as mentor_router
from app.api.routers.analyze import router as analyze_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


openapi_url = "/openapi.json" if settings.environment == "development" else None
docs_url = "/docs" if settings.environment == "development" else None
redoc_url = "/redoc" if settings.environment == "development" else None

app = FastAPI(
    title="DevPilot AI — Workspace API",
    version="1.0.0",
    lifespan=lifespan,
    openapi_url=openapi_url,
    docs_url=docs_url,
    redoc_url=redoc_url,
)

app.add_middleware(RateLimitMiddleware, max_requests=120, window_seconds=60)
app.add_middleware(LoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(analyses.router)
app.include_router(favorites.router)
app.include_router(mentor_router)
app.include_router(analyze_router, prefix="/api")


logger = logging.getLogger("devpilot.errors")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    correlation_id = getattr(request.state, "correlation_id", "unknown")
    logger.exception(f"Unhandled error occurred: {exc} | Correlation ID: {correlation_id}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"An unexpected error occurred. Please contact support with Correlation ID: {correlation_id}"
        },
    )


@app.get("/health", tags=["meta"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
