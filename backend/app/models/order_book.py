"""
app/models/order_book.py
────────────────────────
TimescaleDB hypertable model for storing Level-2 Order Book snapshots.
"""
from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer, String, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class OrderBookSnapshot(Base):
    __tablename__ = "order_book_snapshots"

    # Composite PK required by TimescaleDB: (id, timestamp)
    __table_args__ = (
        PrimaryKeyConstraint("id", "timestamp"),
    )

    id:        Mapped[int] = mapped_column(Integer, autoincrement=True)
    exchange:  Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    pair:      Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    
    # TimescaleDB hypertable partition key
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Store top N levels as JSONB arrays: [[price, quantity], ...]
    bids: Mapped[list | dict] = mapped_column(JSONB, nullable=False)
    asks: Mapped[list | dict] = mapped_column(JSONB, nullable=False)

    def __repr__(self) -> str:
        return f"<OrderBookSnapshot id={self.id} pair={self.pair} timestamp={self.timestamp}>"
