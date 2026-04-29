"""
app/schemas/bot.py
───────────────────
Pydantic v2 schemas for bot control and configuration endpoints.
"""
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


# ── Bot Start ─────────────────────────────────────────────────────────────────
class BotStartRequest(BaseModel):
    exchange:     str = Field(default="Binance", examples=["Binance", "Bybit"])
    market_type:  str = Field(default="Futures", examples=["Spot", "Futures"])
    trading_pair: str = Field(default="BTC/USDT", examples=["BTC/USDT", "ETH/USDT"])


# ── Bot Status ────────────────────────────────────────────────────────────────
class BotStatusResponse(BaseModel):
    status:        str
    exchange:      Optional[str]      = None
    market_type:   Optional[str]      = None
    trading_pair:  Optional[str]      = None
    started_at:    Optional[datetime] = None
    uptime_seconds: Optional[int]     = None

    model_config = {"from_attributes": True}


# ── Risk Config ───────────────────────────────────────────────────────────────
class RiskConfigRequest(BaseModel):
    max_position_usdt:      float = Field(gt=0,  le=100_000, examples=[100.0])
    take_profit_percent:    float = Field(gt=0,  le=100,     examples=[0.5])
    stop_loss_percent:      float = Field(gt=0,  le=100,     examples=[0.3])
    max_open_trades:        int   = Field(ge=1,  le=50,      examples=[3])
    max_daily_drawdown_pct: float = Field(gt=0,  le=100,     examples=[5.0])


class RiskConfigResponse(RiskConfigRequest):
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Full Config ───────────────────────────────────────────────────────────────
class BotConfigResponse(BotStatusResponse, RiskConfigResponse):
    id: int

    model_config = {"from_attributes": True}
