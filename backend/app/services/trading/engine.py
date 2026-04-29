"""
app/services/trading/engine.py
──────────────────────────────
High-performance execution engine.
Evaluates ML signals and executes paper trades based on BotConfig.
Maintains in-memory state to avoid database bottlenecks during the high-frequency WebSocket loop.
"""
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, Optional, Tuple

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.bot_config import BotConfig, BotStatus
from app.models.trade import Trade, TradeStatus, TradeSide
from app.services.trading.binance_client import BinanceClient

logger = logging.getLogger(__name__)


class ExecutionEngine:
    def __init__(self):
        # In-memory caches to prevent DB querying on every tick (10x a second)
        self.active_configs: Dict[int, BotConfig] = {}
        self.open_trades: Dict[int, list[Trade]] = {}
        self._sync_task: Optional[asyncio.Task] = None
        self._running = False

    async def start(self):
        """Start the background synchronization loop."""
        if self._running:
            return
        self._running = True
        # Initial sync
        await self._sync_state_from_db()
        # Start periodic sync (every 5 seconds to pick up new configs/trades from UI)
        self._sync_task = asyncio.create_task(self._sync_loop())
        logger.info("📈 Execution Engine started.")

    async def stop(self):
        self._running = False
        if self._sync_task:
            self._sync_task.cancel()
        logger.info("🛑 Execution Engine stopped.")

    async def _sync_loop(self):
        while self._running:
            try:
                await asyncio.sleep(5)
                await self._sync_state_from_db()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"ExecutionEngine sync error: {e}")

    async def _sync_state_from_db(self):
        """Fetch all running BotConfigs and their open trades from DB."""
        async with AsyncSessionLocal() as db:
            # 1. Fetch running bots
            config_result = await db.execute(select(BotConfig).where(BotConfig.status == BotStatus.RUNNING))
            configs = config_result.scalars().all()
            
            new_active_configs = {c.user_id: c for c in configs}
            self.active_configs = new_active_configs

            # 2. Fetch open trades for these users
            user_ids = list(new_active_configs.keys())
            if user_ids:
                trades_result = await db.execute(
                    select(Trade).where(
                        Trade.user_id.in_(user_ids),
                        Trade.status == TradeStatus.OPEN
                    )
                )
                trades = trades_result.scalars().all()
                
                new_open_trades = {uid: [] for uid in user_ids}
                for t in trades:
                    new_open_trades[t.user_id].append(t)
                self.open_trades = new_open_trades
            else:
                self.open_trades = {}

    async def process_tick(self, pair: str, current_price: float, ml_prediction: Optional[Dict] = None):
        """
        Evaluate entry/exit conditions for all active bots based on the current tick.
        This runs in the hot path of the WebSocket loop.
        """
        if not self.active_configs:
            return

        for user_id, config in self.active_configs.items():
            if config.trading_pair != pair:
                continue

            user_trades = self.open_trades.get(user_id, [])

            # 1. Evaluate Exits (Stop Loss / Take Profit)
            for trade in list(user_trades):  # Copy list because we might remove items
                if self._should_close_trade(trade, current_price, config):
                    await self._close_trade(trade, current_price)
                    user_trades.remove(trade)

            # 2. Evaluate Entries (ML Signal)
            if not ml_prediction:
                continue
            
            signal = ml_prediction.get("signal")
            confidence = ml_prediction.get("confidence", 0)

            # Only open if no active trades for this user (for MVP)
            if len(user_trades) >= config.max_open_trades:
                continue

            # Basic signal thresholding
            if confidence > 0.60:
                if signal == "BULLISH":
                    trade = await self._open_trade(user_id, pair, TradeSide.LONG, current_price, config)
                    if trade:
                        user_trades.append(trade)
                elif signal == "BEARISH":
                    trade = await self._open_trade(user_id, pair, TradeSide.SHORT, current_price, config)
                    if trade:
                        user_trades.append(trade)


    def _should_close_trade(self, trade: Trade, current_price: float, config: BotConfig) -> bool:
        """Check SL/TP conditions."""
        entry = float(trade.entry_price)
        
        if trade.side == TradeSide.LONG:
            pnl_pct = (current_price - entry) / entry * 100
        else:
            pnl_pct = (entry - current_price) / entry * 100

        # Check Take Profit
        if pnl_pct >= float(config.take_profit_percent):
            return True
            
        # Check Stop Loss (negative pnl_pct)
        if pnl_pct <= -float(config.stop_loss_percent):
            return True

        return False

    async def _close_trade(self, trade: Trade, exit_price: float):
        """Commit the trade closure to the DB."""
        async with AsyncSessionLocal() as db:
            # Need to fetch the trade bound to this session
            db_trade = await db.get(Trade, (trade.id, trade.opened_at))
            if not db_trade:
                return

            entry = float(db_trade.entry_price)
            if db_trade.side == TradeSide.LONG:
                pnl = (exit_price - entry) / entry * float(db_trade.position_size)
            else:
                pnl = (entry - exit_price) / entry * float(db_trade.position_size)

            db_trade.status = TradeStatus.CLOSED
            db_trade.exit_price = exit_price
            db_trade.closed_at = datetime.now(timezone.utc)
            db_trade.pnl = pnl

            # ── LIVE TRADING: Execute Market Order ──
            # Note: For real trading, we close LONGs by selling, and close SHORTs by buying.
            if hasattr(db_trade, "user_id"): # Safety check
                # We need the config to get API keys. We can fetch it or pass it.
                # Actually, passing config down is better. Let's fetch it for now.
                config = await db.scalar(select(BotConfig).where(BotConfig.user_id == db_trade.user_id))
                if config and getattr(config, 'is_live_trading', False) and config.api_key and config.api_secret:
                    client = BinanceClient(config.api_key, config.api_secret)
                    close_side = "sell" if db_trade.side == TradeSide.LONG else "buy"
                    
                    # Estimate the base currency amount (e.g., BTC size) from USDT position_size and entry_price
                    # For a real robust bot, you should fetch precise step size from exchange.
                    base_amount = float(db_trade.position_size) / float(db_trade.entry_price)
                    
                    await client.place_market_order(
                        symbol=db_trade.pair.replace("/", ""), # e.g. BTC/USDT -> BTCUSDT
                        side=close_side,
                        amount=round(base_amount, 5)
                    )
                    await client.close()

            await db.commit()
            logger.info(f"💰 Trade {db_trade.id} CLOSED. PnL: ${pnl:.2f}")

    async def _open_trade(self, user_id: int, pair: str, side: TradeSide, current_price: float, config: BotConfig) -> Optional[Trade]:
        """Commit a new open trade to the DB."""
        async with AsyncSessionLocal() as db:
            trade = Trade(
                user_id=user_id,
                exchange=config.exchange,
                pair=pair,
                side=side,
                status=TradeStatus.OPEN,
                entry_price=current_price,
                position_size=config.max_position_usdt,
                opened_at=datetime.now(timezone.utc),
            )
            db.add(trade)
            await db.commit()
            await db.refresh(trade)
            logger.info(f"🚀 Trade {trade.id} OPENED: {side.value.upper()} {pair} @ {current_price}")
            
            # ── LIVE TRADING: Execute Market Order ──
            if getattr(config, 'is_live_trading', False) and config.api_key and config.api_secret:
                client = BinanceClient(config.api_key, config.api_secret)
                open_side = "buy" if side == TradeSide.LONG else "sell"
                
                # Estimate base amount
                base_amount = float(config.max_position_usdt) / float(current_price)
                
                await client.place_market_order(
                    symbol=pair.replace("/", ""),
                    side=open_side,
                    amount=round(base_amount, 5)
                )
                await client.close()
            
            # Detach trade from session so it can be cached in memory
            await db.refresh(trade)
            db.expunge(trade)
            return trade


# Global singleton instance
engine = ExecutionEngine()
