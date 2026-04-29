import asyncio
from app.tasks.ml_tasks import trigger_model_training

if __name__ == "__main__":
    print("Triggering ML training (XGBoost + LSTM)...")
    # This calls the inner sync task logic directly
    result = trigger_model_training(user_id=1)
    print("Result:", result)
