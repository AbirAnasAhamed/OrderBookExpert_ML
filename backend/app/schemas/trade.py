"""
app/schemas/trade.py
─────────────────────
Pydantic v2 schemas for trade history and statistics endpoints.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class TradeResponse(BaseModel):
    id:            int
    exchange:      str
    pair:          str
    side:          str
    entry_price:   float
    exit_price:    Optional[float] = None
    quantity:      float
    pnl:           Optional[float] = None
    fee:           float
    status:        str
    opened_at:     datetime
    closed_at:     Optional[datetime] = None
    ml_confidence: Optional[float]    = None
    signal_type:   Optional[str]      = None

    model_config = {"from_attributes": True}


class TradeListResponse(BaseModel):
    trades:     List[TradeResponse]
    total:      int
    open_count: int
    total_pnl:  float
