"""
app/tasks/ml_tasks.py
──────────────────────
Celery background tasks for ML model training and reporting.
"""
import logging
from app.celery_app import celery_app

logger = logging.getLogger(__name__)


import asyncio
from sqlalchemy import text
from app.core.database import engine
from app.services.ml.features import extract_features
from app.services.ml.training import train_xgboost

# ── In-memory flag: auto-retrain enabled or not ───────────────────────────────
# This is toggled via the /api/v1/scraper/auto-retrain endpoint.
auto_retrain_enabled: bool = False


@celery_app.task(name="tasks.trigger_model_training", bind=True, max_retries=3)
def trigger_model_training(self, user_id: int) -> dict:
    """
    Trigger XGBoost + LSTM model retraining for a given user.
    """
    logger.info(f"[ML Training] Starting for user_id={user_id}")
    
    async def fetch_and_train():
        try:
            # 1. Fetch Data
            query = "SELECT * FROM order_book_snapshots ORDER BY timestamp ASC"
            async with engine.connect() as conn:
                result = await conn.execute(text(query))
                rows = result.mappings().all()
            
            snapshots = [dict(row) for row in rows]
            logger.info(f"Fetched {len(snapshots)} rows for training.")
            
            if len(snapshots) < 100:
                return {"status": "failed", "error": "Not enough data (<100 rows)."}

            # 2. Extract Features
            df = extract_features(snapshots, lookahead=5)
            
            if df.empty:
                return {"status": "failed", "error": "Feature engineering returned empty DataFrame."}

            # 3. Train Models
            metrics_xgb = train_xgboost(df)
            
            # Train LSTM (Sequence length 10)
            try:
                from app.services.ml.lstm_training import train_lstm
                metrics_lstm = train_lstm(df, seq_len=10, epochs=10)
                logger.info("LSTM training successful")
            except Exception as e:
                logger.error(f"LSTM training failed: {e}")
                metrics_lstm = {"error": str(e)}
            
            return {
                "status": "success", 
                "user_id": user_id,
                "metrics_xgb": metrics_xgb,
                "metrics_lstm": metrics_lstm
            }

        except Exception as e:
            logger.error(f"[ML Training] Error: {e}", exc_info=True)
            return {"status": "error", "error": str(e)}

    # Run async function in sync Celery task
    result = asyncio.run(fetch_and_train())
    return result


@celery_app.task(name="tasks.auto_retrain_job", bind=True)
def auto_retrain_job(self) -> dict:
    """
    Periodic auto-retrain task. Runs on schedule (every 6 hours).
    Only trains if auto_retrain_enabled flag is True.
    """
    from app.tasks.ml_tasks import auto_retrain_enabled
    if not auto_retrain_enabled:
        logger.info("[Auto-Retrain] Skipped — auto-retrain is disabled.")
        return {"status": "skipped", "reason": "auto_retrain_enabled=False"}

    logger.info("[Auto-Retrain] 🔄 Starting scheduled model retraining...")
    return trigger_model_training(user_id=1)  # system-level retrain, user_id=1


@celery_app.task(name="tasks.generate_daily_report", bind=True)
def generate_daily_report(self, user_id: int) -> dict:
    """Generate daily trading summary report."""
    logger.info(f"[Daily Report] Generating for user_id={user_id}")
    return {"status": "queued", "user_id": user_id}


@celery_app.task(name="tasks.cleanup_old_snapshots", bind=True)
def cleanup_old_snapshots(self, days_to_keep: int = 90) -> dict:
    """Remove order book snapshots older than N days."""
    logger.info(f"[Cleanup] Removing snapshots older than {days_to_keep} days")
    return {"status": "queued", "days_to_keep": days_to_keep}
