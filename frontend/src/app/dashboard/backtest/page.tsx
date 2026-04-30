"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  FlaskConical, TrendingUp, TrendingDown, BarChart3,
  Target, ShieldAlert, Trophy, Loader2
} from "lucide-react"

interface BacktestSummary {
  initial_equity: number
  final_equity: number
  total_pnl: number
  total_pnl_pct: number
  total_trades: number
  wins: number
  losses: number
  win_rate: number
  max_drawdown_pct: number
}

interface BacktestResult {
  summary: BacktestSummary
  equity_curve: { time: string; equity: number }[]
  trades: any[]
}

function StatCard({
  icon: Icon, label, value, suffix = "", positive
}: {
  icon: any; label: string; value: string | number; suffix?: string; positive?: boolean
}) {
  const colorClass = positive === undefined
    ? "text-foreground"
    : positive ? "text-green-500" : "text-red-500"

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-xl font-bold ${colorClass}`}>
              {value}{suffix}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function BacktestPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Config state
  const [snapshotLimit, setSnapshotLimit] = useState(500)
  const [takeProfit, setTakeProfit] = useState(0.5)
  const [stopLoss, setStopLoss] = useState(0.3)
  const [positionSize, setPositionSize] = useState(100)
  const [confidence, setConfidence] = useState(0.60)

  const handleRunBacktest = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const token = (session?.user as any)?.accessToken
      const params = new URLSearchParams({
        limit: snapshotLimit.toString(),
        take_profit_pct: takeProfit.toString(),
        stop_loss_pct: stopLoss.toString(),
        position_size: positionSize.toString(),
        confidence_threshold: confidence.toString(),
      })

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/backtest/run?${params}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Backtest failed")
      }

      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const summary = result?.summary

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Backtesting Engine</h2>
        <p className="text-muted-foreground">
          Simulate your trading strategy on historical order book data to evaluate performance.
        </p>
      </div>

      {/* Config Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Simulation Parameters
          </CardTitle>
          <CardDescription>Configure the backtest settings and run the simulation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { id: "bt-limit", label: "Snapshots", value: snapshotLimit, set: setSnapshotLimit, suffix: "rows" },
              { id: "bt-tp", label: "Take Profit", value: takeProfit, set: setTakeProfit, suffix: "%" },
              { id: "bt-sl", label: "Stop Loss", value: stopLoss, set: setStopLoss, suffix: "%" },
              { id: "bt-pos", label: "Position Size", value: positionSize, set: setPositionSize, suffix: "USDT" },
              { id: "bt-conf", label: "Min Confidence", value: confidence, set: setConfidence, suffix: "" },
            ].map(({ id, label, value, set, suffix }) => (
              <div key={id} className="space-y-1">
                <Label htmlFor={id}>{label}</Label>
                <div className="flex items-center gap-2">
                  <input
                    id={id}
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => set(parseFloat(e.target.value))}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  {suffix && <span className="text-xs text-muted-foreground shrink-0">{suffix}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              id="run-backtest-btn"
              onClick={handleRunBacktest}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running Simulation...</>
              ) : (
                <><FlaskConical className="mr-2 h-4 w-4" /> Run Backtest</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500/50">
          <CardContent className="pt-6 text-red-500 text-sm">{error}</CardContent>
        </Card>
      )}

      {/* Results */}
      {result && summary && (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={TrendingUp}
              label="Total PnL"
              value={summary.total_pnl >= 0 ? `+$${summary.total_pnl.toFixed(2)}` : `-$${Math.abs(summary.total_pnl).toFixed(2)}`}
              positive={summary.total_pnl >= 0}
            />
            <StatCard
              icon={Trophy}
              label="Win Rate"
              value={summary.win_rate.toFixed(1)}
              suffix="%"
              positive={summary.win_rate >= 50}
            />
            <StatCard
              icon={BarChart3}
              label="Total Trades"
              value={summary.total_trades}
            />
            <StatCard
              icon={ShieldAlert}
              label="Max Drawdown"
              value={summary.max_drawdown_pct.toFixed(2)}
              suffix="%"
              positive={summary.max_drawdown_pct <= 5}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={Target} label="Wins" value={summary.wins} positive={true} />
            <StatCard icon={TrendingDown} label="Losses" value={summary.losses} positive={false} />
            <StatCard
              icon={TrendingUp}
              label="Return"
              value={`${summary.total_pnl_pct >= 0 ? "+" : ""}${summary.total_pnl_pct.toFixed(2)}`}
              suffix="%"
              positive={summary.total_pnl_pct >= 0}
            />
          </div>

          {/* Equity Curve Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Equity Curve</CardTitle>
              <CardDescription>
                Portfolio value over the simulation period. Started at ${summary.initial_equity.toFixed(2)}, ended at ${summary.final_equity.toFixed(2)}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.equity_curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={summary.total_pnl >= 0 ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={summary.total_pnl >= 0 ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={false} />
                    <YAxis
                      tickFormatter={(v) => `$${v.toFixed(0)}`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(val: any) => [`$${parseFloat(val).toFixed(2)}`, "Equity"]}
                    />
                    <ReferenceLine y={summary.initial_equity} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke={summary.total_pnl >= 0 ? "#22c55e" : "#ef4444"}
                      strokeWidth={2}
                      fill="url(#equityGrad)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Trade List */}
          {result.trades.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Trade Log</CardTitle>
                <CardDescription>Individual trades executed during the simulation.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-72">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="text-left text-muted-foreground border-b">
                        <th className="pb-2 pr-4">#</th>
                        <th className="pb-2 pr-4">Side</th>
                        <th className="pb-2 pr-4">Entry</th>
                        <th className="pb-2 pr-4">Exit</th>
                        <th className="pb-2 pr-4">PnL</th>
                        <th className="pb-2">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.trades.map((trade, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                          <td className="py-2 pr-4">
                            <Badge variant="outline" className={trade.side === "LONG" ? "text-green-500 border-green-500/30" : "text-red-500 border-red-500/30"}>
                              {trade.side}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4 font-mono">${parseFloat(trade.entry_price).toFixed(2)}</td>
                          <td className="py-2 pr-4 font-mono">${parseFloat(trade.exit_price).toFixed(2)}</td>
                          <td className={`py-2 pr-4 font-mono ${trade.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {trade.pnl >= 0 ? "+" : ""}${trade.pnl?.toFixed(2)}
                          </td>
                          <td className="py-2">
                            <Badge variant={trade.result === "WIN" ? "default" : "destructive"} className="text-xs">
                              {trade.result}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
