"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, DollarSign, Activity, Zap, TrendingDown } from "lucide-react"
import { useTradeHistory } from "@/hooks/useTradeHistory"

export function StatsCards() {
  const { data, loading } = useTradeHistory(5000)

  // Compute stats from live trades
  const totalPnl = data?.total_pnl ?? 0
  const openCount = data?.open_count ?? 0
  const trades = data?.trades ?? []

  const closedTrades = trades.filter((t) => t.status === "closed")
  const wins = closedTrades.filter((t) => parseFloat(t.pnl ?? "0") > 0).length
  const winRate = closedTrades.length > 0
    ? ((wins / closedTrades.length) * 100).toFixed(1)
    : "—"

  // Max drawdown: most negative single PnL
  const pnlValues = closedTrades.map((t) => parseFloat(t.pnl ?? "0"))
  const maxLoss = pnlValues.length > 0 ? Math.min(...pnlValues) : 0
  const positionSize = parseFloat(trades[0]?.position_size ?? "100")
  const drawdownPct = positionSize > 0 ? ((maxLoss / positionSize) * 100).toFixed(2) : "0.00"

  const pnlPositive = totalPnl >= 0

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-8 bg-muted animate-pulse rounded w-24 mb-2" />
              <div className="h-4 bg-muted animate-pulse rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total PnL */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${pnlPositive ? "text-green-500" : "text-red-500"}`}>
            {pnlPositive ? "+" : ""}${totalPnl.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {pnlPositive
              ? <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              : <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
            }
            <span className={pnlPositive ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
              {closedTrades.length} closed trades
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Active Trades */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {openCount > 0 ? "Bot positions are open" : "No open positions"}
          </p>
        </CardContent>
      </Card>

      {/* Win Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${parseFloat(winRate) >= 50 ? "text-green-500" : "text-red-500"}`}>
            {winRate}{winRate !== "—" ? "%" : ""}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {wins} wins / {closedTrades.length - wins} losses
          </p>
        </CardContent>
      </Card>

      {/* Max Drawdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Max Single Loss</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {maxLoss < 0 ? `$${maxLoss.toFixed(2)}` : "$0.00"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {parseFloat(drawdownPct) < 0 ? `${drawdownPct}% of position` : "No losses recorded"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
