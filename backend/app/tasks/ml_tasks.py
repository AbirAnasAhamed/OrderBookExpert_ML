"""
app/tasks/ml_tasks.py
──────────────────────
Celery background tasks for ML model training and reporting.
Phase A: Task stubs (no-ops that log intent).
Phase B: Will trigger XGBoost/LSTM training pipelines.
"""
import logging
from app.celery_app import celery_app

logger = logging.getLogger(__name__)


import asyncio
from sqlalchemy import text
from app.core.database import engine
from app.services.ml.features import extract_features
from app.services.ml.training import train_xgboost

@celery_app.task(name="tasks.trigger_model_training", bind=True, max_retries=3)
def trigger_model_training(self, user_id: int) -> dict:
    """
    Trigger XGBoost model retraining for a given user.
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

            # 3. Train Model
            metrics = train_xgboost(df)
            
            return {
                "status": "success", 
                "user_id": user_id,
                "metrics": metrics
            }

        except Exception as e:
            logger.error(f"[ML Training] Error: {e}", exc_info=True)
            return {"status": "error", "error": str(e)}

    # Run async function in sync Celery task
    result = asyncio.run(fetch_and_train())
    return result


@celery_app.task(name="tasks.generate_daily_report", bind=True)
def generate_daily_report(self, user_id: int) -> dict:
    """
    Generate daily trading summary report.
    TODO (Phase B): Aggregate trade stats and email/notify user.
    """
    logger.info(f"[Daily Report] Generating for user_id={user_id}")
    return {"status": "queued", "user_id": user_id}


@celery_app.task(name="tasks.cleanup_old_snapshots", bind=True)
def cleanup_old_snapshots(self, days_to_keep: int = 90) -> dict:
    """
    Remove order book snapshots older than N days.
    TimescaleDB's compression handles this automatically, but
    this task provides an extra cleanup layer.
    """
    logger.info(f"[Cleanup] Removing snapshots older than {days_to_keep} days")
    return {"status": "queued", "days_to_keep": days_to_keep}
