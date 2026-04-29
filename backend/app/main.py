"""
app/main.py
────────────
FastAPI application entry point.
Registers all routers, middleware, CORS, and lifespan events.
"""
from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router
from app.websocket.orderbook_ws import router as ws_router

# Import models so Alembic / Base.metadata knows about them
from app.models import user, bot_config, trade, order_book  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Silence uvicorn access logs for the /stats endpoint to prevent spam
class EndpointFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return record.getMessage().find("/api/v1/scraper/stats") == -1

logging.getLogger("uvicorn.access").addFilter(EndpointFilter())


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: verify DB connection and create tables if they don't exist.
    In production, tables are managed by Alembic migrations.
    """
    logger.info("🚀 OrderBookExpert backend starting up...")

    async with engine.begin() as conn:
        # Create all tables (safe — does nothing if tables already exist)
        await conn.run_sync(Base.metadata.create_all)

        # Enable TimescaleDB extension
        try:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS timescaledb;"))
            logger.info("✅ TimescaleDB extension enabled.")
        except Exception as exc:
            logger.warning(f"TimescaleDB extension unavailable (running plain PG?): {exc}")

        # Convert trades table to TimescaleDB hypertable
        try:
            await conn.execute(text(
                "SELECT create_hypertable('trades', 'opened_at', if_not_exists => TRUE);"
            ))
            logger.info("✅ TimescaleDB hypertable ready: trades.")
        except Exception as exc:
            logger.warning(f"Hypertable creation skipped for trades: {exc}")

        # Convert order_book_snapshots table to TimescaleDB hypertable
        try:
            await conn.execute(text(
                "SELECT create_hypertable('order_book_snapshots', 'timestamp', if_not_exists => TRUE);"
            ))
            logger.info("✅ TimescaleDB hypertable ready: order_book_snapshots.")
            
            # Add Data Retention Policy: Auto-delete data older than 7 days
            try:
                await conn.execute(text(
                    "SELECT add_retention_policy('order_book_snapshots', INTERVAL '7 days', if_not_exists => TRUE);"
                ))
                logger.info("🧹 Data Retention Policy added: 7 days for order_book_snapshots.")
            except Exception as exc:
                # Might fail if not on TimescaleDB Enterprise/Cloud or if already exists
                logger.warning(f"Retention policy setup skipped: {exc}")
                
        except Exception as exc:
            logger.warning(f"Hypertable creation skipped for order_book_snapshots: {exc}")

    logger.info("✅ Database ready.")
    yield
    # Shutdown
    await engine.dispose()
    logger.info("👋 Backend shutdown complete.")


# ── Application factory ───────────────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "OrderBookExpert — ML-powered HFT crypto trading system. "
            "Level 2 order book analysis with XGBoost + LSTM inference."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────
    app.include_router(api_router)       # REST: /api/v1/...
    app.include_router(ws_router)        # WS:   /ws/orderbook/...

    # ── Health check ──────────────────────────────────────────
    @app.get("/health", tags=["System"], summary="Health check")
    async def health() -> dict:
        return {
            "status": "ok",
            "app":    settings.app_name,
            "version": settings.app_version,
        }

    return app


app = create_app()
