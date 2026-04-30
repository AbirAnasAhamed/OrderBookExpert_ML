/**
 * @file store/useScraperStore.ts
 * @description Global state for the Data Scraper service.
 */
import { create } from "zustand"
import type { ScraperStats, Exchange } from "@/types"

interface ScraperState {
  stats: ScraperStats
  setScraperStatus: (status: ScraperStats["status"]) => void
  incrementRows: (count: number) => void
}

export const useScraperStore = create<ScraperState>((set) => ({
  stats: {
    status: "stopped",
    rowsCollected: 0,
    dataSizeMB: 0,
    exchanges: ["Binance"] as Exchange[],
    startedAt: null,
  },
  setScraperStatus: (status) =>
    set((state) => ({
      stats: {
        ...state.stats,
        status,
        startedAt: status === "running" ? new Date().toISOString() : state.stats.startedAt,
      },
    })),
  incrementRows: (count) =>
    set((state) => ({
      stats: {
        ...state.stats,
        rowsCollected: state.stats.rowsCollected + count,
        dataSizeMB: parseFloat(
          ((state.stats.rowsCollected + count) * 0.0008).toFixed(2)
        ),
      },
    })),
}))
