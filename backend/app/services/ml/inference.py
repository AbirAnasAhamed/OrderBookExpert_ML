import os
import logging
import xgboost as xgb
import pandas as pd
from typing import Dict, Any, Optional
from app.services.ml.training import MODEL_PATH
import json

logger = logging.getLogger(__name__)

# Global model instance to avoid reloading it on every WS message
_model = None

def load_model():
    """Loads the XGBoost model from disk into memory."""
    global _model
    if os.path.exists(MODEL_PATH):
        try:
            model = xgb.XGBClassifier()
            model.load_model(MODEL_PATH)
            _model = model
            logger.info("XGBoost model loaded for inference.")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            _model = None
    else:
        logger.warning(f"No trained model found at {MODEL_PATH}")

def predict_realtime(snapshot: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Takes a real-time order book snapshot, extracts features, and runs inference.
    
    Args:
        snapshot: Dict containing "bids" and "asks"
    
    Returns:
        Dict with prediction info (e.g., {"prediction": "bullish", "confidence": 0.85})
        or None if model is not loaded.
    """
    global _model
    if _model is None:
        return None

    try:
        # Extract features (similar to features.py but for a single row)
        # Bids and asks are lists of lists e.g. [["60000.0", "0.5"], ...]
        bids = snapshot.get("bids", [])
        asks = snapshot.get("asks", [])
        
        if not bids or not asks:
            return None
            
        best_bid = float(bids[0][0])
        best_bid_qty = float(bids[0][1])
        
        best_ask = float(asks[0][0])
        best_ask_qty = float(asks[0][1])
        
        bids_vol_5 = sum(float(lvl[1]) for lvl in bids[:5])
        asks_vol_5 = sum(float(lvl[1]) for lvl in asks[:5])
        
        mid_price = (best_bid + best_ask) / 2.0
        spread = best_ask - best_bid
        
        imbalance = (best_bid_qty - best_ask_qty) / (best_bid_qty + best_ask_qty + 1e-8)
        imbalance_5 = (bids_vol_5 - asks_vol_5) / (bids_vol_5 + asks_vol_5 + 1e-8)
        
        # Create a single-row DataFrame with exact same columns as training
        features = {
            "mid_price": [mid_price],
            "spread": [spread],
            "imbalance": [imbalance],
            "imbalance_5": [imbalance_5],
            "best_bid_qty": [best_bid_qty],
            "best_ask_qty": [best_ask_qty],
            "bids_vol_5": [bids_vol_5],
            "asks_vol_5": [asks_vol_5]
        }
        
        df = pd.DataFrame(features)
        
        # Inference
        pred_prob = _model.predict_proba(df)[0]
        # pred_prob[1] is probability of class 1 (UP)
        bullish_prob = float(pred_prob[1])
        
        if bullish_prob > 0.55:
            signal = "bullish"
        elif bullish_prob < 0.45:
            signal = "bearish"
        else:
            signal = "neutral"
            
        return {
            "signal": signal,
            "confidence": round(bullish_prob if signal == "bullish" else 1 - bullish_prob, 4),
            "bullish_prob": round(bullish_prob, 4)
        }
        
    except Exception as e:
        logger.error(f"Inference error: {e}")
        return None
