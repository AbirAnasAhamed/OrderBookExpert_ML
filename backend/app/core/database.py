"""
app/core/database.py
─────────────────────
Async SQLAlchemy engine and session factory for TimescaleDB.
Uses asyncpg driver for maximum throughput on time-series writes.
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings


# ── Engine ────────────────────────────────────────────────────────────────────
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,           # Log SQL only in debug mode
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,            # Verify connections before use
)

# ── Session Factory ───────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,        # Avoid lazy-load issues after commit
    autocommit=False,
    autoflush=False,
)

# ── Base Model ────────────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """All ORM models inherit from this base."""
    pass


# ── Dependency ────────────────────────────────────────────────────────────────
async def get_db() -> AsyncSession:
    """
    FastAPI dependency that yields an async DB session per request.
    Automatically closes the session when the request is complete.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
