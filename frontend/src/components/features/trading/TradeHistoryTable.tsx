"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTradeHistory } from "@/hooks/useTradeHistory"
import { cn } from "@/lib/utils"

export function TradeHistoryTable() {
  const { data, loading, error } = useTradeHistory()

  if (error) {
    return (
      <Card className="border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-500">Trade History Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Trade History & Positions</CardTitle>
          <CardDescription>
            Live view of automated paper trades executed by the ML engine
          </CardDescription>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground">Open Trades</span>
            <span className="font-bold">{data?.open_count || 0}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground">Realized PnL</span>
            <span className={cn(
              "font-bold",
              (data?.total_pnl || 0) >= 0 ? "text-green-500" : "text-red-500"
            )}>
              ${(data?.total_pnl || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            Loading trades...
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">PnL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data?.trades || data.trades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No trades executed yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.trades.map((trade) => {
                    const isLong = trade.side === "long"
                    const isOpen = trade.status === "open"
                    const pnl = parseFloat(trade.pnl || "0")
                    
                    return (
                      <TableRow key={trade.id}>
                        <TableCell className="text-xs">
                          {new Date(trade.opened_at).toLocaleTimeString()}
                        </TableCell>
                        <TableCell className="font-medium">{trade.pair}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            isLong ? "text-green-500 border-green-500/20 bg-green-500/10" : "text-red-500 border-red-500/20 bg-red-500/10"
                          )}>
                            {trade.side.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          ${parseFloat(trade.entry_price).toFixed(2)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          ${parseFloat(trade.position_size).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn(
                            isOpen && "bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse"
                          )}>
                            {trade.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-mono text-xs",
                          !isOpen && pnl > 0 && "text-green-500",
                          !isOpen && pnl < 0 && "text-red-500",
                          isOpen && "text-muted-foreground"
                        )}>
                          {isOpen ? "---" : `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
