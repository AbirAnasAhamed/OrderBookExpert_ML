"""
app/websocket/orderbook_ws.py
──────────────────────────────
WebSocket endpoint that streams live Level 2 order book data.
Phase A: Sends mock data every 500ms.
Phase B: Will bridge to real Binance WebSocket feed.
Clients must pass a valid JWT as a query parameter: ?token=<access_token>
"""
import asyncio
import json
import random
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import JWTError

from app.core.security import decode_token

router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, pair: str):
        await websocket.accept()
        if pair not in self.active_connections:
            self.active_connections[pair] = []
        self.active_connections[pair].append(websocket)

    def disconnect(self, websocket: WebSocket, pair: str):
        if pair in self.active_connections:
            if websocket in self.active_connections[pair]:
                self.active_connections[pair].remove(websocket)
            if not self.active_connections[pair]:
                del self.active_connections[pair]

    async def broadcast(self, pair: str, message: dict):
        if pair in self.active_connections:
            disconnected = []
            for connection in self.active_connections[pair]:
                try:
                    await connection.send_text(json.dumps(message))
                except WebSocketDisconnect:
                    disconnected.append(connection)
            for d in disconnected:
                self.disconnect(d, pair)

manager = ConnectionManager()


@router.websocket("/ws/orderbook/{pair}")
async def orderbook_websocket(
    websocket: WebSocket,
    pair:      str,
    token:     str = Query(..., description="Valid JWT access token"),
) -> None:
    """
    Stream Level 2 order book data for a given trading pair.
    Requires a valid JWT passed as ?token=<access_token>.
    """
    # ── Auth check ────────────────────────────────────────────
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            await websocket.close(code=4001, reason="Invalid token type.")
            return
    except JWTError:
        await websocket.close(code=4001, reason="Unauthorized.")
        return

    pair_key = pair.replace("-", "/").upper()
    await manager.connect(websocket, pair_key)

    try:
        while True:
            # Keep connection open. The scraper will broadcast messages using manager.broadcast()
            # If we need a keep-alive or ping, we can do it here.
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, pair_key)
