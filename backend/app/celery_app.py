"""
app/celery_app.py
──────────────────
Celery application factory.
Uses Redis as both the broker and the result backend.
"""
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "obe_worker",
    broker=settings.celery_broker_url,
    backend=settings.redis_url,
    include=["app.tasks.ml_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    worker_max_tasks_per_child=200,   # Prevent memory leaks in long-running workers
    beat_schedule={
        "auto-retrain-every-6h": {
            "task": "tasks.auto_retrain_job",
            "schedule": 6 * 60 * 60,   # every 6 hours in seconds
        },
    },
)
