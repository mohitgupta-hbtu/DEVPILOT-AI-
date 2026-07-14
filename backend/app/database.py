from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from app.config import get_settings

settings = get_settings()

fallback_sqlite_url = "sqlite+aiosqlite:///./devpilot.db"
primary_url = settings.database_url

# Create primary engine
engine = create_async_engine(primary_url, echo=settings.environment == "development", pool_pre_ping=True)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def init_db() -> None:
    global engine, async_session_factory
    try:
        # Try connecting and initializing the database
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        print("Connected and initialized primary database successfully.")
    except Exception as e:
        print(f"Database connection to primary database failed: {e}")
        if primary_url != fallback_sqlite_url:
            print(f"Falling back to local SQLite database: {fallback_sqlite_url}")
            engine = create_async_engine(fallback_sqlite_url, echo=settings.environment == "development", pool_pre_ping=True)
            async_session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
            async with engine.begin() as conn:
                await conn.run_sync(SQLModel.metadata.create_all)
            print("Fallback SQLite database initialized successfully.")
        else:
            raise e


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session


__all__ = ["engine", "init_db", "get_session", "SQLModel"]
