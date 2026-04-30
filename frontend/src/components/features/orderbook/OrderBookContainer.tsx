"use client"

import { useRealOrderBook } from "@/hooks/useRealOrderBook"
import { OrderBookTable } from "./OrderBookTable"
import { MLSignalCard } from "./MLSignalCard"
import { LiquidityHeatmap } from "./LiquidityHeatmap"

export function OrderBookContainer() {
  const { orderBook, prediction, isConnected } = useRealOrderBook()

  return (
    <div className="space-y-6">
      <LiquidityHeatmap orderBook={orderBook} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OrderBookTable orderBook={orderBook} isConnected={isConnected} />
        </div>
        <div>
          <MLSignalCard prediction={prediction} />
        </div>
      </div>
    </div>
  )
}
