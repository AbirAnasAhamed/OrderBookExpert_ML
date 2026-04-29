"""
app/api/v1/routes/bot.py
─────────────────────────
Bot control endpoints: Start, Stop, Status, Risk Config CRUD.
All routes require a valid Bearer JWT.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.schemas.bot import (
    BotStartRequest, BotStatusResponse,
    RiskConfigRequest, RiskConfigResponse,
)
from app.services import bot_service

router = APIRouter(prefix="/bot", tags=["Bot Control"])


@router.post(
    "/start",
    response_model=BotStatusResponse,
    summary="Start the trading bot",
)
async def start_bot(
    body: BotStartRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BotStatusResponse:
    return await bot_service.start_bot(db, current_user, body)


@router.post(
    "/stop",
    response_model=BotStatusResponse,
    summary="Stop the trading bot",
)
async def stop_bot(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BotStatusResponse:
    return await bot_service.stop_bot(db, current_user)


@router.get(
    "/status",
    response_model=BotStatusResponse,
    summary="Get current bot status",
)
async def bot_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BotStatusResponse:
    return await bot_service.get_bot_status(db, current_user)


@router.put(
    "/config/risk",
    response_model=RiskConfigResponse,
    summary="Update risk management parameters",
)
async def update_risk(
    body: RiskConfigRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RiskConfigResponse:
    return await bot_service.update_risk_config(db, current_user, body)
