/**
 * @file components/features/orderbook/OrderBookTable.tsx
 * @description Renders a live Level 2 Order Book with animated bid/ask rows.
 * Buy Walls and Sell Walls are highlighted distinctively.
 */
"use client"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { OrderBookLevel, OrderBook } from "@/types"

function OrderBookRow({ level, side }: { level: OrderBookLevel; side: "bid" | "ask" }) {
  const isBid = side === "bid"
  const depthPercent = Math.min((level.total / 300) * 100, 100)

  return (
    <tr className={cn("relative text-xs font-mono transition-all duration-300", level.isWall && "font-bold")}>
      {/* Depth bar background */}
      <td
        className={cn(
          "absolute inset-0 opacity-10 rounded",
          isBid ? "bg-green-500" : "bg-red-500"
        )}
        style={{
          width: `${depthPercent}%`,
          float: isBid ? "right" : "left",
        }}
      />
      <td className={cn("py-[3px] pl-2 w-1/3", isBid ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
        {level.price.toFixed(2)}
        {level.isWall && (
          <span className="ml-1 text-[9px] bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 rounded px-1">WALL</span>
        )}
      </td>
      <td className="py-[3px] text-right text-muted-foreground">{level.size.toFixed(4)}</td>
      <td className="py-[3px] pr-2 text-right text-muted-foreground">{level.total.toFixed(4)}</td>
    </tr>
  )
}

export function OrderBookTable({ orderBook, isConnected }: { orderBook?: OrderBook | null; isConnected?: boolean }) {
  if (!orderBook) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Machine Learning Bot Data</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                Spread: $0.00
              </Badge>
              <span className={cn("h-2 w-2 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-red-500")} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Waiting for data stream...</p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
            {isConnected ? "Waiting for first snapshot..." : "Start the Scraper to connect to live data."}
          </div>
        </CardContent>
      </Card>
    )
  }

  const { bids, asks, spread, timestamp } = orderBook

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Machine Learning Bot Data</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              Spread: ${spread.toFixed(2)}
            </Badge>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date(timestamp).toLocaleTimeString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Asks (Sell orders) */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Asks (Sell)</p>
            <table className="w-full">
              <thead>
                <tr className="text-[10px] text-muted-foreground">
                  <th className="text-left pl-2">Price</th>
                  <th className="text-right">Size</th>
                  <th className="text-right pr-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {[...asks].reverse().map((level, i) => (
                  <OrderBookRow key={`ask-${i}`} level={level} side="ask" />
                ))}
              </tbody>
            </table>
          </div>

          {/* Bids (Buy orders) */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Bids (Buy)</p>
            <table className="w-full">
              <thead>
                <tr className="text-[10px] text-muted-foreground">
                  <th className="text-left pl-2">Price</th>
                  <th className="text-right">Size</th>
                  <th className="text-right pr-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((level, i) => (
                  <OrderBookRow key={`bid-${i}`} level={level} side="bid" />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
