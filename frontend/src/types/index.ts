/**
 * @file types/index.ts
 * @description Central type definitions for the entire application.
 * Maintaining types in a single file ensures consistency and
 * makes refactoring across the codebase straightforward.
 */

export type Exchange = "Binance" | "Bybit" | "KuCoin" | "OKX" | "MEXC"

export type MarketType = "Spot" | "Futures"

export type BotStatus = "running" | "stopped" | "error" | "initializing"

export type ScraperStatus = "running" | "stopped" | "error"

export type SystemServiceStatus = "active" | "idle" | "error" | "initializing"

export interface Trade {
  id: string
  symbol: string
  side: "Buy" | "Sell"
  entryPrice: number
  exitPrice: number | null
  quantity: number
  pnl: number | null
  status: "open" | "closed"
  exchange: Exchange
  marketType: MarketType
  openedAt: string
  closedAt: string | null
}

export interface OrderBookLevel {
  price: number
  size: number
  total: number
  isWall: boolean
}

export interface OrderBook {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  spread: number
  timestamp: number
}

export interface MLPrediction {
  signal: "BUY" | "SELL" | "HOLD"
  confidence: number // 0.0 - 1.0
  wallBreakProbability: number
  wallBounceProbability: number
  modelVersion: string
}

export interface ScraperStats {
  status: ScraperStatus
  rowsCollected: number
  dataSizeMB: number
  exchanges: Exchange[]
  startedAt: string | null
}

export interface RiskConfig {
  maxPositionSizeUSDT: number
  takeProfitPercent: number
  stopLossPercent: number
  maxOpenTrades: number
  maxDailyDrawdownPercent: number
}
