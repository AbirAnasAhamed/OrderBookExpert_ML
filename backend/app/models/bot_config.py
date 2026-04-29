"""
app/models/bot_config.py
─────────────────────────
Stores each user's bot trading configuration and current run state.
One config record per user (upserted on change).
"""
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


class MarketType(str, enum.Enum):
    SPOT    = "Spot"
    FUTURES = "Futures"


class BotStatus(str, enum.Enum):
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR   = "error"


class BotConfig(Base):
    __tablename__ = "bot_configs"

    id:      Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # ── Exchange settings ─────────────────────────────────────
    exchange:    Mapped[str]        = mapped_column(String(50),  default="Binance", nullable=False)
    market_type: Mapped[MarketType] = mapped_column(SAEnum(MarketType), default=MarketType.FUTURES, nullable=False)
    trading_pair: Mapped[str]       = mapped_column(String(20),  default="BTC/USDT", nullable=False)

    # ── Risk parameters ───────────────────────────────────────
    max_position_usdt:       Mapped[float] = mapped_column(Float, default=100.0,  nullable=False)
    take_profit_percent:     Mapped[float] = mapped_column(Float, default=0.5,    nullable=False)
    stop_loss_percent:       Mapped[float] = mapped_column(Float, default=0.3,    nullable=False)
    max_open_trades:         Mapped[int]   = mapped_column(Integer, default=3,    nullable=False)
    max_daily_drawdown_pct:  Mapped[float] = mapped_column(Float, default=5.0,    nullable=False)

    # ── Live Trading Settings ─────────────────────────────────
    is_live_trading: Mapped[bool]       = mapped_column(Boolean, default=False, nullable=False)
    api_key:         Mapped[str | None] = mapped_column(String(255), nullable=True)
    api_secret:      Mapped[str | None] = mapped_column(String(255), nullable=True)

    # ── Runtime state ─────────────────────────────────────────
    status:     Mapped[BotStatus] = mapped_column(SAEnum(BotStatus), default=BotStatus.STOPPED, nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<BotConfig user_id={self.user_id} status={self.status} pair={self.trading_pair}>"
