import os
import logging
import xgboost as xgb
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from app.services.ml.training import MODEL_PATH
from app.services.ml.lstm_training import LSTM_MODEL_PATH, SCALER_PATH
import json

logger = logging.getLogger(__name__)

# Global model instances to avoid reloading on every WS message
_model = None
_lstm_model = None
_lstm_scaler = None

# Buffer for LSTM sequence
_feature_buffer = []
SEQ_LEN = 10

def load_model():
    """Loads the XGBoost and LSTM models from disk into memory."""
    global _model, _lstm_model, _lstm_scaler
    
    # Load XGBoost
    if os.path.exists(MODEL_PATH):
        try:
            model = xgb.XGBClassifier()
            model.load_model(MODEL_PATH)
            _model = model
            logger.info("XGBoost model loaded for inference.")
        except Exception as e:
            logger.error(f"Failed to load XGBoost model: {e}")
            _model = None
    else:
        logger.warning(f"No trained XGBoost model found at {MODEL_PATH}")

    # Load LSTM
    try:
        import torch
        import joblib
        from app.services.ml.lstm_model import OrderBookLSTM
        
        if os.path.exists(LSTM_MODEL_PATH) and os.path.exists(SCALER_PATH):
            device = torch.device("cpu") # Use CPU for inference on fast WS stream
            # We hardcode input_dim=8 because we have 8 features in our DataFrame
            lstm = OrderBookLSTM(input_dim=8).to(device)
            lstm.load_state_dict(torch.load(LSTM_MODEL_PATH, map_location=device))
            lstm.eval()
            _lstm_model = lstm
            _lstm_scaler = joblib.load(SCALER_PATH)
            logger.info("PyTorch LSTM model & Scaler loaded for inference.")
        else:
            logger.warning(f"No trained LSTM model found.")
    except ImportError:
        logger.warning("PyTorch not installed. LSTM inference disabled.")
    except Exception as e:
        logger.error(f"Failed to load LSTM model: {e}")
        _lstm_model = None

def predict_realtime(snapshot: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Takes a real-time order book snapshot, extracts features, and runs inference.
    Uses XGBoost, and ensembles with LSTM if available and buffer is full.
    """
    global _model, _lstm_model, _lstm_scaler, _feature_buffer
    if _model is None:
        return None

    try:
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
        
        features_dict = {
            "mid_price": [mid_price],
            "spread": [spread],
            "imbalance": [imbalance],
            "imbalance_5": [imbalance_5],
            "best_bid_qty": [best_bid_qty],
            "best_ask_qty": [best_ask_qty],
            "bids_vol_5": [bids_vol_5],
            "asks_vol_5": [asks_vol_5]
        }
        
        df = pd.DataFrame(features_dict)
        
        # XGBoost Inference
        pred_prob_xgb = _model.predict_proba(df)[0]
        xgb_bullish = float(pred_prob_xgb[1])
        
        # LSTM Inference (Ensemble)
        final_bullish_prob = xgb_bullish
        
        if _lstm_model is not None and _lstm_scaler is not None:
            import torch
            # Extract raw feature list in correct order
            raw_features = df.iloc[0].values
            _feature_buffer.append(raw_features)
            
            # Maintain sequence length
            if len(_feature_buffer) > SEQ_LEN:
                _feature_buffer.pop(0)
                
            if len(_feature_buffer) == SEQ_LEN:
                seq_np = np.array(_feature_buffer)
                seq_scaled = _lstm_scaler.transform(seq_np)
                # Shape required: (batch_size, seq_len, input_dim) -> (1, 10, 8)
                seq_t = torch.tensor(seq_scaled, dtype=torch.float32).unsqueeze(0)
                
                with torch.no_grad():
                    lstm_logits = _lstm_model(seq_t)
                    lstm_bullish = torch.sigmoid(lstm_logits).item()
                    
                # Ensemble: Average of XGBoost and LSTM
                final_bullish_prob = (xgb_bullish + lstm_bullish) / 2.0

        if final_bullish_prob > 0.55:
            signal = "bullish"
        elif final_bullish_prob < 0.45:
            signal = "bearish"
        else:
            signal = "neutral"
            
        return {
            "signal": signal,
            "confidence": round(final_bullish_prob if signal == "bullish" else 1 - final_bullish_prob, 4),
            "bullish_prob": round(final_bullish_prob, 4)
        }
        
    except Exception as e:
        logger.error(f"Inference error: {e}")
        return None
