/**
 * @file hooks/useMockOrderBook.ts
 * @description Generates a realistic, animated mock L2 Order Book for UI demonstration.
 * This hook will be replaced by a real WebSocket connection to the backend
 * in the production integration phase.
 */
"use client"

import { useState, useEffect, useCallback } from "react"
import type { OrderBookLevel, OrderBook } from "@/types"

const MID_PRICE = 67_250

function generateLevels(
  side: "bid" | "ask",
  count: number,
  midPrice: number
): OrderBookLevel[] {
  const levels: OrderBookLevel[] = []
  let cumulative = 0

  for (let i = 0; i < count; i++) {
    const offset = (i + 1) * (0.5 + Math.random() * 0.5)
    const price =
      side === "bid"
        ? parseFloat((midPrice - offset).toFixed(2))
        : parseFloat((midPrice + offset).toFixed(2))

    // Simulate occasional "walls" (large orders)
    const isWall = Math.random() < 0.08
    const size = isWall
      ? parseFloat((50 + Math.random() * 200).toFixed(4))
      : parseFloat((0.1 + Math.random() * 5).toFixed(4))

    cumulative = parseFloat((cumulative + size).toFixed(4))
    levels.push({ price, size, total: cumulative, isWall })
  }
  return levels
}

export function useMockOrderBook(): OrderBook {
  const [orderBook, setOrderBook] = useState<OrderBook>({
    bids: generateLevels("bid", 20, MID_PRICE),
    asks: generateLevels("ask", 20, MID_PRICE),
    spread: 0.5,
    timestamp: Date.now(),
  })

  const update = useCallback(() => {
    const jitter = (Math.random() - 0.5) * 2
    const newMid = MID_PRICE + jitter
    const bids = generateLevels("bid", 20, newMid)
    const asks = generateLevels("ask", 20, newMid)
    const spread = parseFloat((asks[0].price - bids[0].price).toFixed(2))
    setOrderBook({ bids, asks, spread, timestamp: Date.now() })
  }, [])

  useEffect(() => {
    const interval = setInterval(update, 800)
    return () => clearInterval(interval)
  }, [update])

  return orderBook
}
