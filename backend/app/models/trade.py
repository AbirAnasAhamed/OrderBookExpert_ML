"""
app/models/trade.py
────────────────────
Trade ORM model designed as a TimescaleDB hypertable partitioned on opened_at.

TimescaleDB requirement: the partition column (opened_at) MUST be part of
the primary key. We use a composite PK (id, opened_at) to satisfy this.
"""
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, ForeignKey, Integer, Numeric, String, Enum as SAEnum, PrimaryKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column
import enum

from app.core.database import Base


class TradeSide(str, enum.Enum):
    LONG  = "long"
    SHORT = "short"


class TradeStatus(str, enum.Enum):
    OPEN      = "open"
    CLOSED    = "closed"
    CANCELLED = "cancelled"


class Trade(Base):
    __tablename__ = "trades"

    # Composite PK required by TimescaleDB: (id, opened_at)
    __table_args__ = (
        PrimaryKeyConstraint("id", "opened_at"),
    )

    id:      Mapped[int] = mapped_column(Integer, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # ── Market identifiers ────────────────────────────────────
    exchange: Mapped[str]       = mapped_column(String(50), nullable=False)
    pair:     Mapped[str]       = mapped_column(String(20), nullable=False, index=True)
    side:     Mapped[TradeSide] = mapped_column(SAEnum(TradeSide), nullable=False)

    # ── Price & quantity ──────────────────────────────────────
    entry_price: Mapped[float]        = mapped_column(Numeric(20, 8), nullable=False)
    exit_price:  Mapped[float | None] = mapped_column(Numeric(20, 8), nullable=True)
    quantity:    Mapped[float]        = mapped_column(Numeric(20, 8), nullable=False)

    # ── P&L ──────────────────────────────────────────────────
    pnl: Mapped[float | None] = mapped_column(Numeric(20, 8), nullable=True)
    fee: Mapped[float]        = mapped_column(Numeric(20, 8), default=0.0, nullable=False)

    # ── Status & timestamps ───────────────────────────────────
    status:    Mapped[TradeStatus] = mapped_column(SAEnum(TradeStatus), default=TradeStatus.OPEN, nullable=False)
    opened_at: Mapped[datetime]    = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # ── ML metadata ───────────────────────────────────────────
    ml_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    signal_type:   Mapped[str | None]   = mapped_column(String(50), nullable=True)

    def __repr__(self) -> str:
        return f"<Trade id={self.id} pair={self.pair} side={self.side} status={self.status}>"
