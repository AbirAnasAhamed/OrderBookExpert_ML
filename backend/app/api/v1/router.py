"""
app/api/v1/router.py
─────────────────────
Central v1 router — aggregates all sub-routers under /api/v1.
"""
from fastapi import APIRouter
from app.api.v1.routes import auth, bot, trades, scraper, backtest

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(bot.router)
api_router.include_router(trades.router)
api_router.include_router(scraper.router)
api_router.include_router(backtest.router, prefix="/backtest", tags=["backtest"])
