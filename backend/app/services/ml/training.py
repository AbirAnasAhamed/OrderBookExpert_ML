import os
import logging
import xgboost as xgb
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import json

logger = logging.getLogger(__name__)

MODEL_DIR = "/app/models/weights"
MODEL_PATH = os.path.join(MODEL_DIR, "xgboost_model.json")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.json")

def train_xgboost(df: pd.DataFrame) -> dict:
    """
    Trains an XGBoost classifier on the engineered features.
    
    Args:
        df: pd.DataFrame containing feature columns and the 'target' column.
        
    Returns:
        dict containing training metrics (accuracy, etc.)
    """
    if df.empty or "target" not in df.columns:
        raise ValueError("DataFrame is empty or missing 'target' column.")
    
    # Ensure model directory exists
    os.makedirs(MODEL_DIR, exist_ok=True)

    X = df.drop("target", axis=1)
    y = df["target"]

    # Split data (80% train, 20% test). 
    # For time-series, shuffle=False is better to prevent data leakage.
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
    
    logger.info(f"Training XGBoost on {len(X_train)} samples. Testing on {len(X_test)} samples.")

    # Initialize XGBoost Classifier
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        eval_metric="logloss",
        use_label_encoder=False
    )

    # Train
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    logger.info(f"Model Training Completed. Accuracy: {accuracy:.4f}")
    
    report = classification_report(y_test, y_pred, output_dict=True)

    # Save Model
    model.save_model(MODEL_PATH)
    logger.info(f"Model saved to {MODEL_PATH}")

    # Save Metrics
    metrics = {
        "accuracy": float(accuracy),
        "samples_trained": len(X_train),
        "samples_tested": len(X_test),
        "features": list(X.columns),
        "report": report
    }
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=4)
        
    return metrics
