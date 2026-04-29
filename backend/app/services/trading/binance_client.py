"""
app/services/trading/binance_client.py
──────────────────────────────────────
Provides the CCXT integration to place live orders on Binance.
"""
import ccxt.async_support as ccxt
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class BinanceClient:
    def __init__(self, api_key: str, api_secret: str, testnet: bool = False):
        self.api_key = api_key
        self.api_secret = api_secret
        self.testnet = testnet
        self.exchange = ccxt.binance({
            'apiKey': self.api_key,
            'secret': self.api_secret,
            'enableRateLimit': True,
            'options': {
                'defaultType': 'future', # Default to futures for leverage
            }
        })
        if self.testnet:
            self.exchange.set_sandbox_mode(True)

    async def close(self):
        await self.exchange.close()

    async def place_market_order(self, symbol: str, side: str, amount: float) -> Optional[Dict[str, Any]]:
        """
        Places a live Market order.
        side: 'buy' or 'sell'
        """
        try:
            # For futures, amount is in base currency (e.g., BTC).
            # Convert USDT amount to base currency amount before calling this if needed.
            logger.info(f"[LIVE TRADE] Placing {side.upper()} order for {amount} {symbol}")
            order = await self.exchange.create_market_order(symbol, side, amount)
            logger.info(f"[LIVE TRADE SUCCESS] Order ID: {order.get('id')}")
            return order
        except Exception as e:
            logger.error(f"[LIVE TRADE FAILED] Failed to place {side} order: {e}")
            return None

    async def fetch_balance(self) -> float:
        """Fetches available USDT balance."""
        try:
            balance = await self.exchange.fetch_balance()
            return float(balance.get('free', {}).get('USDT', 0.0))
        except Exception as e:
            logger.error(f"[LIVE TRADE FAILED] Failed to fetch balance: {e}")
            return 0.0
