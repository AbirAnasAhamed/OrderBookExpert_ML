"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { useTradeHistory } from "@/hooks/useTradeHistory"

export function PerformanceChart() {
  const { data, loading } = useTradeHistory(5000)

  // Build equity curve from closed trades sorted by close time
  const closedTrades = (data?.trades ?? [])
    .filter((t) => t.status === "closed" && t.closed_at)
    .sort((a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime())

  let runningPnl = 0
  const chartData = closedTrades.map((t) => {
    runningPnl += parseFloat(t.pnl ?? "0")
    const date = new Date(t.closed_at!)
    return {
      time: `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`,
      value: parseFloat(runningPnl.toFixed(2)),
    }
  })

  // If no real data, show an empty state
  const isEmpty = chartData.length === 0

  const isProfit = runningPnl >= 0

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>PnL Performance (Cumulative)</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </div>
        ) : isEmpty ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
            <p className="text-sm">No closed trades yet.</p>
            <p className="text-xs">Start the bot and let it trade to see your equity curve here.</p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isProfit ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isProfit ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(val: any) => [`$${parseFloat(val).toFixed(2)}`, "Cumulative PnL"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={isProfit ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPnl)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
