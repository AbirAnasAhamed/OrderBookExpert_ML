"""
app/services/bot_service.py
────────────────────────────
Bot management business logic.
Handles start/stop/status and risk configuration persistence.
In Phase B, this will trigger the actual Scraper and Execution Engine.
"""
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bot_config import BotConfig, BotStatus
from app.models.user import User
from app.schemas.bot import BotStartRequest, BotStatusResponse, RiskConfigRequest, RiskConfigResponse


# ── Internal helpers ──────────────────────────────────────────────────────────
async def _get_or_create_config(db: AsyncSession, user_id: int) -> BotConfig:
    """Fetch bot config for user, creating one with defaults if missing."""
    result = await db.execute(select(BotConfig).where(BotConfig.user_id == user_id))
    config = result.scalar_one_or_none()
    if not config:
        config = BotConfig(user_id=user_id)
        db.add(config)
        await db.flush()
    return config


# ── Start bot ─────────────────────────────────────────────────────────────────
async def start_bot(db: AsyncSession, user: User, req: BotStartRequest) -> BotStatusResponse:
    config = await _get_or_create_config(db, user.id)

    if config.status == BotStatus.RUNNING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bot is already running. Stop it before changing settings.",
        )

    config.exchange     = req.exchange
    config.market_type  = req.market_type   # type: ignore[assignment]
    config.trading_pair = req.trading_pair
    config.status       = BotStatus.RUNNING
    config.started_at   = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(config)

    # TODO (Phase B): Dispatch Celery task to start execution engine
    # from app.tasks.ml_tasks import start_trading_bot
    # start_trading_bot.delay(user.id)

    return _build_status_response(config)


# ── Stop bot ──────────────────────────────────────────────────────────────────
async def stop_bot(db: AsyncSession, user: User) -> BotStatusResponse:
    config = await _get_or_create_config(db, user.id)

    if config.status == BotStatus.STOPPED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bot is already stopped.",
        )

    config.status     = BotStatus.STOPPED
    config.started_at = None

    await db.commit()
    await db.refresh(config)
    return _build_status_response(config)


# ── Get status ────────────────────────────────────────────────────────────────
async def get_bot_status(db: AsyncSession, user: User) -> BotStatusResponse:
    config = await _get_or_create_config(db, user.id)
    await db.commit()
    return _build_status_response(config)


# ── Update risk config ────────────────────────────────────────────────────────
async def update_risk_config(
    db: AsyncSession, user: User, req: RiskConfigRequest
) -> RiskConfigResponse:
    config = await _get_or_create_config(db, user.id)

    config.max_position_usdt      = req.max_position_usdt
    config.take_profit_percent    = req.take_profit_percent
    config.stop_loss_percent      = req.stop_loss_percent
    config.max_open_trades        = req.max_open_trades
    config.max_daily_drawdown_pct = req.max_daily_drawdown_pct

    await db.commit()
    await db.refresh(config)
    return RiskConfigResponse(
        max_position_usdt=config.max_position_usdt,
        take_profit_percent=config.take_profit_percent,
        stop_loss_percent=config.stop_loss_percent,
        max_open_trades=config.max_open_trades,
        max_daily_drawdown_pct=config.max_daily_drawdown_pct,
        updated_at=config.updated_at,
    )


# ── Helpers ───────────────────────────────────────────────────────────────────
def _build_status_response(config: BotConfig) -> BotStatusResponse:
    uptime = None
    if config.status == BotStatus.RUNNING and config.started_at:
        uptime = int((datetime.now(timezone.utc) - config.started_at).total_seconds())

    return BotStatusResponse(
        status=config.status.value,
        exchange=config.exchange,
        market_type=config.market_type.value,
        trading_pair=config.trading_pair,
        started_at=config.started_at,
        uptime_seconds=uptime,
    )
