"""
app/api/v1/routes/backtest.py
──────────────────────────────
API endpoint for running backtests using historical order book data.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.services.trading.backtester import run_backtest

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/run", summary="Run a backtest on historical data")
async def run_backtest_endpoint(
    limit: int = Query(default=500, ge=100, le=10000, description="Number of historical snapshots to use"),
    take_profit_pct: float = Query(default=0.5, gt=0),
    stop_loss_pct: float = Query(default=0.3, gt=0),
    position_size: float = Query(default=100.0, gt=0),
    confidence_threshold: float = Query(default=0.60, gt=0, le=1.0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Fetches the last `limit` order book snapshots and runs a full backtest simulation.
    Returns the equity curve and trade-by-trade results for charting.
    """
    try:
        # Fetch historical snapshots
        query = text(
            "SELECT * FROM order_book_snapshots ORDER BY timestamp DESC LIMIT :limit"
        )
        result = await db.execute(query, {"limit": limit})
        rows = result.mappings().all()

        if not rows:
            raise HTTPException(status_code=404, detail="No historical data found. Please run the scraper first.")

        # Reverse so oldest is first (chronological order for simulation)
        snapshots = list(reversed([dict(r) for r in rows]))

        logger.info(f"Running backtest on {len(snapshots)} snapshots for user {current_user.id}")

        result = run_backtest(
            snapshots=snapshots,
            take_profit_pct=take_profit_pct,
            stop_loss_pct=stop_loss_pct,
            position_size=position_size,
            confidence_threshold=confidence_threshold,
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Backtest failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Backtest failed: {str(e)}")
