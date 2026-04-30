/**
 * @file store/useBotStore.ts
 * @description Global state management for bot configuration and trading status.
 * Uses Zustand for lightweight, scalable state management without boilerplate.
 */
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Exchange, MarketType, BotStatus, RiskConfig } from "@/types"

interface BotState {
  // State
  status: BotStatus
  exchange: Exchange
  marketType: MarketType
  tradingPair: string
  riskConfig: RiskConfig
  isLiveTrading: boolean
  apiKey: string
  apiSecret: string

  // Actions
  setStatus: (status: BotStatus) => void
  setExchange: (exchange: Exchange) => void
  setMarketType: (type: MarketType) => void
  setTradingPair: (pair: string) => void
  updateRiskConfig: (config: Partial<RiskConfig>) => void
  setLiveTradingMode: (enabled: boolean) => void
  setApiCredentials: (key: string, secret: string) => void
}

const DEFAULT_RISK_CONFIG: RiskConfig = {
  maxPositionSizeUSDT: 500,
  takeProfitPercent: 0.4,
  stopLossPercent: 0.2,
  maxOpenTrades: 5,
  maxDailyDrawdownPercent: 3,
}

export const useBotStore = create<BotState>()(
  persist(
    (set) => ({
      status: "stopped",
      exchange: "Binance",
      marketType: "Futures",
      tradingPair: "BTC/USDT",
      riskConfig: DEFAULT_RISK_CONFIG,
      isLiveTrading: false,
      apiKey: "",
      apiSecret: "",

      setStatus: (status) => set({ status }),
      setExchange: (exchange) => set({ exchange }),
      setMarketType: (type) => set({ marketType: type }),
      setTradingPair: (pair) => set({ tradingPair: pair }),
      updateRiskConfig: (config) =>
        set((state) => ({
          riskConfig: { ...state.riskConfig, ...config },
        })),
      setLiveTradingMode: (enabled) => set({ isLiveTrading: enabled }),
      setApiCredentials: (key, secret) => set({ apiKey: key, apiSecret: secret }),
    }),
    { name: "obe-bot-config" }
  )
)
