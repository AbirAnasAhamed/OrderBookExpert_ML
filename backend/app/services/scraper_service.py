"""
app/services/scraper_service.py
────────────────────────────────
Real-time Binance WebSocket Level-2 Order Book Scraper.
Fetches data, broadcasts to WS clients, and saves batches to TimescaleDB.
"""
import asyncio
import json
import logging
from datetime import datetime, timezone

import websockets

from app.core.database import AsyncSessionLocal
from app.models.order_book import OrderBookSnapshot
from app.websocket.orderbook_ws import manager

logger = logging.getLogger(__name__)


class BinanceScraper:
    def __init__(self, pair: str = "BTCUSDT", db_batch_size: int = 10):
        self.pair = pair.lower()
        self.pair_display = f"{pair[:3]}/{pair[3:]}".upper()  # BTCUSDT -> BTC/USDT
        # Stream URL: Top 20 levels, updated every 100ms
        self.stream_url = f"wss://stream.binance.com:9443/ws/{self.pair}@depth20@100ms"
        
        self.db_batch_size = db_batch_size
        self._batch: list[OrderBookSnapshot] = []
        
        self._task: asyncio.Task | None = None
        self._stop_event = asyncio.Event()

        # Stats
        self.rows_collected = 0
        self.target_rows = 10000

    def start(self):
        """Start the scraper task in the background."""
        if self._task is not None and not self._task.done():
            logger.warning(f"Scraper for {self.pair} is already running.")
            return

        # Load ML model if available
        try:
            from app.services.ml.inference import load_model
            load_model()
        except Exception as e:
            logger.error(f"Failed to load ML model on scraper start: {e}")

        self._stop_event.clear()
        self._task = asyncio.create_task(self._run_loop())
        logger.info(f"Started Binance scraper for {self.pair}")

    def stop(self):
        """Signal the scraper task to stop."""
        self._stop_event.set()
        if self._task:
            self._task.cancel()
        logger.info(f"Stopped Binance scraper for {self.pair}")

    @property
    def is_running(self) -> bool:
        return self._task is not None and not self._task.done()

    async def _run_loop(self):
        while not self._stop_event.is_set():
            try:
                async with websockets.connect(self.stream_url) as ws:
                    logger.info(f"Connected to Binance WS: {self.stream_url}")
                    while not self._stop_event.is_set():
                        message = await ws.recv()
                        await self._process_message(message)
            except asyncio.CancelledError:
                break
            except Exception as exc:
                logger.error(f"Binance WS error: {exc}. Reconnecting in 5s...")
                await asyncio.sleep(5)

        # Flush any remaining items in the batch on stop
        await self._flush_batch()

    async def _process_message(self, message: str):
        data = json.loads(message)
        
        # Binance payload: {"lastUpdateId": 123, "bids": [["price", "qty"]], "asks": [["price", "qty"]]}
        if "bids" not in data or "asks" not in data:
            return

        timestamp = datetime.now(timezone.utc)

        # 1. Prepare data for TimescaleDB
        snapshot = OrderBookSnapshot(
            exchange="Binance",
            pair=self.pair_display,
            timestamp=timestamp,
            bids=data["bids"],
            asks=data["asks"],
        )
        self._batch.append(snapshot)
        self.rows_collected += 1

        if len(self._batch) >= self.db_batch_size:
            await self._flush_batch()

        # 2. Prepare data for Frontend WebSocket Broadcast
        # Convert to floats and calculate totals for frontend visualization
        formatted_bids = []
        total_bid = 0.0
        for price_str, qty_str in data["bids"]:
            p = float(price_str)
            q = float(qty_str)
            total_bid += q
            formatted_bids.append({
                "price": p,
                "size": q,
                "total": round(total_bid, 4),
                "is_wall": q > 10.0  # Simple wall logic
            })

        formatted_asks = []
        total_ask = 0.0
        for price_str, qty_str in data["asks"]:
            p = float(price_str)
            q = float(qty_str)
            total_ask += q
            formatted_asks.append({
                "price": p,
                "size": q,
                "total": round(total_ask, 4),
                "is_wall": q > 10.0
            })

        spread = 0.0
        if formatted_asks and formatted_bids:
            spread = round(formatted_asks[0]["price"] - formatted_bids[0]["price"], 2)

        # 3. Real-time ML Inference
        prediction = None
        try:
            from app.services.ml.inference import predict_realtime
            prediction = predict_realtime(data)
        except Exception as e:
            logger.error(f"Inference integration error: {e}")

        broadcast_msg = {
            "pair": self.pair_display,
            "spread": spread,
            "asks": formatted_asks,
            "bids": formatted_bids,
            "timestamp": timestamp.isoformat(),
            "ml_prediction": prediction
        }

        # Broadcast to all connected clients viewing this pair
        await manager.broadcast(self.pair_display, broadcast_msg)

    async def _flush_batch(self):
        if not self._batch:
            return
            
        items_to_insert = self._batch[:]
        self._batch.clear()

        try:
            async with AsyncSessionLocal() as db:
                db.add_all(items_to_insert)
                await db.commit()
            logger.info(f"✅ Saved {len(items_to_insert)} order book snapshots to TimescaleDB. (Total: {self.rows_collected})")
        except Exception as exc:
            logger.error(f"Failed to save {len(items_to_insert)} order book snapshots to DB: {exc}")


# Global instance for the active BTCUSDT scraper
scraper = BinanceScraper(pair="BTCUSDT", db_batch_size=10)
