"""
app/api/v1/routes/trades.py
────────────────────────────
Trade history endpoints. Queries the TimescaleDB hypertable.
Supports pagination and filtering by status and pair.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.models.trade import Trade, TradeStatus
from app.schemas.trade import TradeResponse, TradeListResponse

router = APIRouter(prefix="/trades", tags=["Trades"])


@router.get(
    "",
    response_model=TradeListResponse,
    summary="Get paginated trade history",
)
async def list_trades(
    status:    Optional[str] = Query(None, description="Filter by status: open | closed"),
    pair:      Optional[str] = Query(None, description="Filter by trading pair, e.g. BTC/USDT"),
    limit:     int           = Query(50,  ge=1, le=500),
    offset:    int           = Query(0,   ge=0),
    db:        AsyncSession  = Depends(get_db),
    current_user: User       = Depends(get_current_user),
) -> TradeListResponse:
    query = select(Trade).where(Trade.user_id == current_user.id)

    if status:
        try:
            query = query.where(Trade.status == TradeStatus(status))
        except ValueError:
            pass  # Invalid status — ignore filter
    if pair:
        query = query.where(Trade.pair == pair)

    # Counts
    total_result      = await db.execute(select(func.count()).select_from(query.subquery()))
    open_count_result = await db.execute(
        select(func.count()).select_from(
            select(Trade)
            .where(Trade.user_id == current_user.id)
            .where(Trade.status == TradeStatus.OPEN)
            .subquery()
        )
    )

    # PnL sum
    pnl_result = await db.execute(
        select(func.coalesce(func.sum(Trade.pnl), 0)).where(
            Trade.user_id == current_user.id,
            Trade.status == TradeStatus.CLOSED,
        )
    )

    # Paginated rows
    rows_result = await db.execute(
        query.order_by(Trade.opened_at.desc()).limit(limit).offset(offset)
    )
    trades = rows_result.scalars().all()

    return TradeListResponse(
        trades=[TradeResponse.model_validate(t) for t in trades],
        total=total_result.scalar_one(),
        open_count=open_count_result.scalar_one(),
        total_pnl=float(pnl_result.scalar_one()),
    )
