import pandas as pd
import numpy as np
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

def extract_features(snapshots: List[Dict[str, Any]], lookahead: int = 5) -> pd.DataFrame:
    """
    Converts raw order book snapshots into a DataFrame of engineered features.
    
    Args:
        snapshots: List of dicts representing OrderBookSnapshot rows from DB.
        lookahead: Number of rows ahead to use for creating the target variable.
        
    Returns:
        pd.DataFrame containing feature columns and the target column.
    """
    if not snapshots:
        return pd.DataFrame()

    df = pd.DataFrame(snapshots)
    df.sort_values(by="timestamp", inplace=True)
    df.reset_index(drop=True, inplace=True)

    logger.info(f"Extracting features from {len(df)} rows...")

    # Basic features from top of the book (index 0)
    # We use vectorization. The bids/asks are lists of [price, qty]
    try:
        # Extract top bids and asks
        # df["bids"] and df["asks"] contain strings (JSON) or lists if already parsed.
        # Ensure they are lists
        import json
        if isinstance(df["bids"].iloc[0], str):
            df["bids"] = df["bids"].apply(json.loads)
            df["asks"] = df["asks"].apply(json.loads)

        df["best_bid"] = df["bids"].apply(lambda x: float(x[0][0]) if x else 0.0)
        df["best_bid_qty"] = df["bids"].apply(lambda x: float(x[0][1]) if x else 0.0)
        
        df["best_ask"] = df["asks"].apply(lambda x: float(x[0][0]) if x else 0.0)
        df["best_ask_qty"] = df["asks"].apply(lambda x: float(x[0][1]) if x else 0.0)

        # Depth sums (top 5 levels)
        df["bids_vol_5"] = df["bids"].apply(lambda x: sum(float(lvl[1]) for lvl in x[:5]) if x else 0.0)
        df["asks_vol_5"] = df["asks"].apply(lambda x: sum(float(lvl[1]) for lvl in x[:5]) if x else 0.0)

        # Feature Engineering
        df["mid_price"] = (df["best_bid"] + df["best_ask"]) / 2.0
        df["spread"] = df["best_ask"] - df["best_bid"]
        
        # Order Book Imbalance (OBI)
        # 1 means heavily bid (bullish), -1 means heavily asked (bearish)
        df["imbalance"] = (df["best_bid_qty"] - df["best_ask_qty"]) / (df["best_bid_qty"] + df["best_ask_qty"] + 1e-8)
        df["imbalance_5"] = (df["bids_vol_5"] - df["asks_vol_5"]) / (df["bids_vol_5"] + df["asks_vol_5"] + 1e-8)

        # Create Target (Classification: 1 if UP, 0 if DOWN or FLAT)
        # We look ahead `lookahead` rows.
        df["future_mid_price"] = df["mid_price"].shift(-lookahead)
        
        # Target: 1 if future price > current price
        df["target"] = (df["future_mid_price"] > df["mid_price"]).astype(int)

        # Drop NaNs created by shifting
        df.dropna(inplace=True)

        # Select only feature columns and target
        feature_cols = [
            "mid_price", "spread", "imbalance", "imbalance_5",
            "best_bid_qty", "best_ask_qty", "bids_vol_5", "asks_vol_5"
        ]
        
        return df[feature_cols + ["target"]].copy()

    except Exception as e:
        logger.error(f"Error extracting features: {e}")
        return pd.DataFrame()
