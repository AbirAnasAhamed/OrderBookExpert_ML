"""
app/services/trading/backtester.py
─────────────────────────────────────
Runs a simulation of the trading strategy over historical order book data.
"""
import logging
from datetime import datetime
from typing import List, Dict, Any

import pandas as pd

from app.services.ml.features import extract_features
from app.services.ml.inference import predict_realtime, load_model

logger = logging.getLogger(__name__)


def run_backtest(
    snapshots: List[Dict[str, Any]],
    take_profit_pct: float = 0.5,
    stop_loss_pct: float = 0.3,
    position_size: float = 100.0,
    confidence_threshold: float = 0.60,
) -> Dict[str, Any]:
    """
    Simulates trading over a list of historical snapshots.

    Returns a dict containing:
    - equity_curve: list of {time, equity} for charting
    - trades: list of individual trade results
    - summary stats: win_rate, total_pnl, max_drawdown, etc.
    """
    load_model()  # ensure models are loaded

    equity = position_size * 10  # Start with 10x position size as initial balance
    initial_equity = equity
    equity_curve = []
    trades = []

    open_trade = None  # One trade at a time for simplicity

    for snapshot in snapshots:
        ts = snapshot.get("timestamp", datetime.now().isoformat())

        # Get ML signal
        prediction = predict_realtime(snapshot)

        if prediction is None:
            equity_curve.append({"time": str(ts), "equity": round(equity, 2)})
            continue

        signal = prediction.get("signal")
        confidence = prediction.get("confidence", 0)

        mid_price = 0.0
        try:
            bids = snapshot.get("bids", [])
            asks = snapshot.get("asks", [])
            if bids and asks:
                mid_price = (float(bids[0][0]) + float(asks[0][0])) / 2.0
        except (IndexError, ValueError):
            equity_curve.append({"time": str(ts), "equity": round(equity, 2)})
            continue

        # --- Check Exit ---
        if open_trade is not None:
            entry = open_trade["entry_price"]
            side = open_trade["side"]

            if side == "LONG":
                pnl_pct = (mid_price - entry) / entry * 100
            else:
                pnl_pct = (entry - mid_price) / entry * 100

            should_close = (
                pnl_pct >= take_profit_pct or pnl_pct <= -stop_loss_pct
            )

            if should_close:
                pnl_usdt = (pnl_pct / 100) * position_size
                equity += pnl_usdt
                open_trade["exit_price"] = mid_price
                open_trade["pnl"] = round(pnl_usdt, 4)
                open_trade["pnl_pct"] = round(pnl_pct, 4)
                open_trade["exit_time"] = str(ts)
                open_trade["result"] = "WIN" if pnl_usdt > 0 else "LOSS"
                trades.append(open_trade)
                open_trade = None

        # --- Check Entry ---
        if open_trade is None and confidence >= confidence_threshold and mid_price > 0:
            if signal == "bullish":
                open_trade = {
                    "side": "LONG",
                    "entry_price": mid_price,
                    "entry_time": str(ts),
                    "position_size": position_size,
                }
            elif signal == "bearish":
                open_trade = {
                    "side": "SHORT",
                    "entry_price": mid_price,
                    "entry_time": str(ts),
                    "position_size": position_size,
                }

        equity_curve.append({"time": str(ts), "equity": round(equity, 2)})

    # --- Compute Summary ---
    total_trades = len(trades)
    wins = [t for t in trades if t.get("result") == "WIN"]
    losses = [t for t in trades if t.get("result") == "LOSS"]
    total_pnl = sum(t.get("pnl", 0) for t in trades)
    win_rate = (len(wins) / total_trades * 100) if total_trades > 0 else 0.0

    # Max drawdown calculation
    peak = initial_equity
    max_drawdown = 0.0
    for point in equity_curve:
        eq = point["equity"]
        if eq > peak:
            peak = eq
        dd = (peak - eq) / peak * 100 if peak > 0 else 0
        max_drawdown = max(max_drawdown, dd)

    return {
        "summary": {
            "initial_equity": initial_equity,
            "final_equity": round(equity, 2),
            "total_pnl": round(total_pnl, 4),
            "total_pnl_pct": round((total_pnl / initial_equity) * 100, 2),
            "total_trades": total_trades,
            "wins": len(wins),
            "losses": len(losses),
            "win_rate": round(win_rate, 2),
            "max_drawdown_pct": round(max_drawdown, 2),
        },
        "equity_curve": equity_curve,
        "trades": trades,
    }
