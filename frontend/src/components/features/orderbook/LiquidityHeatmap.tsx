"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import type { OrderBook } from "@/types"
import { useMemo } from "react"

interface LiquidityHeatmapProps {
  orderBook: OrderBook | null
}

export function LiquidityHeatmap({ orderBook }: LiquidityHeatmapProps) {
  // Transform the order book data into a format suitable for Recharts
  const chartData = useMemo(() => {
    if (!orderBook || !orderBook.bids.length || !orderBook.asks.length) return []

    // 1. Process Bids (Reverse order so price goes from lowest to highest)
    // Recharts requires sorted X-axis for AreaChart
    const bidsData = [...orderBook.bids].reverse().map((bid) => ({
      price: bid.price,
      bidSize: bid.total,
      askSize: null, // null so it doesn't render an ask area here
    }))

    // 2. Process Asks
    const asksData = orderBook.asks.map((ask) => ({
      price: ask.price,
      bidSize: null,
      askSize: ask.total,
    }))

    // Merge into a single continuous array
    return [...bidsData, ...asksData]
  }, [orderBook])

  const midPrice = useMemo(() => {
    if (!orderBook || !orderBook.bids.length || !orderBook.asks.length) return null
    return (orderBook.bids[0].price + orderBook.asks[0].price) / 2
  }, [orderBook])

  if (!orderBook) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liquidity Depth Heatmap</CardTitle>
          <CardDescription>Awaiting order book data...</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <span className="text-muted-foreground animate-pulse">Loading visualization...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Liquidity Depth Heatmap</CardTitle>
        <CardDescription>Cumulative Order Book Volume</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorAsk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="price" 
                type="number" 
                domain={['dataMin', 'dataMax']} 
                tickFormatter={(val) => `$${val.toFixed(2)}`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickMargin={10}
              />
              <YAxis 
                hide 
                domain={[0, 'dataMax']} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: any) => [parseFloat(value).toFixed(2), "Volume"]}
                labelFormatter={(label: any) => `Price: $${parseFloat(label).toFixed(2)}`}
              />
              <Area 
                type="step" 
                dataKey="bidSize" 
                stroke="#22c55e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorBid)" 
                isAnimationActive={false} // Disable animation for high-frequency updates
              />
              <Area 
                type="step" 
                dataKey="askSize" 
                stroke="#ef4444" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAsk)" 
                isAnimationActive={false}
              />
              {midPrice && (
                <ReferenceLine 
                  x={midPrice} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="3 3" 
                  label={{ position: 'top', value: 'Mid', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
