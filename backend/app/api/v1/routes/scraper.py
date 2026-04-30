"""
app/api/v1/routes/scraper.py
─────────────────────────────
Data scraper control endpoints.
In Phase B, these will trigger the real Binance WebSocket scraper.
For now, they return persisted config state.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.api.v1.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User

from app.services.scraper_service import scraper

router = APIRouter(prefix="/scraper", tags=["Data Scraper"])


class ScraperStatusResponse(BaseModel):
    status:         str
    exchange:       str    = "Binance"
    pair:           str    = "BTC/USDT"
    rows_collected: int    = 0
    data_size_mb:   float  = 0.0
    readiness_pct:  float  = 0.0   # 0–100, based on target_rows
    target_rows:    int | None = None
    auto_retrain:   bool   = False
    next_retrain_h: float | None = None  # hours until next auto-retrain


class TargetRowsUpdate(BaseModel):
    target_rows: int


@router.post("/start", response_model=ScraperStatusResponse, summary="Start the L2 data scraper")
async def start_scraper(
    target_rows: int | None = None,   # e.g. ?target_rows=10000, None = unlimited
    current_user: User = Depends(get_current_user),
) -> ScraperStatusResponse:
    scraper.start(target_rows=target_rows)
    return ScraperStatusResponse(
        status="running",
        pair=scraper.pair_display,
        rows_collected=scraper.rows_collected,
        target_rows=scraper.target_rows,
    )


@router.post("/stop", response_model=ScraperStatusResponse, summary="Stop the L2 data scraper")
async def stop_scraper(
    current_user: User = Depends(get_current_user),
) -> ScraperStatusResponse:
    scraper.stop()
    return ScraperStatusResponse(
        status="idle",
        pair=scraper.pair_display,
        rows_collected=scraper.rows_collected,
        target_rows=scraper.target_rows,
    )


@router.put("/target", response_model=ScraperStatusResponse, summary="Update ML target rows")
async def update_target(
    payload: TargetRowsUpdate,
    current_user: User = Depends(get_current_user),
) -> ScraperStatusResponse:
    scraper.target_rows = payload.target_rows
    return await scraper_stats(current_user)


@router.post("/train", summary="Trigger XGBoost Model Training")
async def trigger_training(
    current_user: User = Depends(get_current_user),
):
    from app.tasks.ml_tasks import trigger_model_training
    # Pass user_id to celery task
    task = trigger_model_training.delay(current_user.id)
    return {"status": "training_queued", "task_id": task.id}


@router.get("/stats", response_model=ScraperStatusResponse, summary="Get scraper stats")
async def scraper_stats(
    current_user: User = Depends(get_current_user),
) -> ScraperStatusResponse:
    status_str = "running" if scraper.is_running else "idle"
    
    # Rough estimate of data size: each row ~500 bytes
    data_size_mb = (scraper.rows_collected * 500) / (1024 * 1024)
    # Use dynamic target_rows for readiness
    readiness = min((scraper.rows_collected / scraper.target_rows) * 100, 100.0) if (scraper.target_rows is not None and scraper.target_rows > 0) else 100.0

    return ScraperStatusResponse(
        status=status_str,
        pair=scraper.pair_display,
        rows_collected=scraper.rows_collected,
        data_size_mb=round(data_size_mb, 2),
        readiness_pct=round(readiness, 2),
        target_rows=scraper.target_rows,
    )


@router.delete("/clear", summary="Clear all scraped L2 data")
async def clear_scraper_data(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """Truncate the order_book_snapshots table and reset the scraper's rows_collected metric."""
    from sqlalchemy import text
    try:
        await db.execute(text("TRUNCATE TABLE order_book_snapshots;"))
        await db.commit()
        scraper.rows_collected = 0
        return {"status": "success", "message": "All scraper data cleared."}
    except Exception as exc:
        return {"status": "error", "message": str(exc)}


@router.get("/auto-retrain-status", summary="Get current auto-retrain setting")
async def get_auto_retrain_status(
    current_user: User = Depends(get_current_user),
):
    import app.tasks.ml_tasks as ml_tasks
    return {
        "auto_retrain_enabled": ml_tasks.auto_retrain_enabled,
        "interval_hours": 6,
    }


@router.post("/auto-retrain/toggle", summary="Enable or disable auto-retraining")
async def toggle_auto_retrain(
    enabled: bool,
    current_user: User = Depends(get_current_user),
):
    """Toggle periodic auto-retraining every 6 hours via Celery Beat."""
    import app.tasks.ml_tasks as ml_tasks
    ml_tasks.auto_retrain_enabled = enabled
    status = "enabled" if enabled else "disabled"
    return {
        "auto_retrain_enabled": enabled,
        "message": f"Auto-retraining {status}. Celery Beat will {'run' if enabled else 'skip'} the next scheduled job.",
    }
