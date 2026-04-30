"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Server, Brain, ActivitySquare, BotIcon } from "lucide-react"
import { useSystemStatus } from "@/hooks/useSystemStatus"

export function SystemStatus() {
  const { data, loading } = useSystemStatus(5000)

  const scraperStatus = data.scraper?.status ?? "stopped"
  const botStatus = data.bot?.status ?? "stopped"

  const statusBadge = (status: string) => {
    if (status === "running") {
      return (
        <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10 animate-pulse">
          ● Running
        </Badge>
      )
    }
    if (status === "error") {
      return (
        <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10">
          ✗ Error
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        ○ Stopped
      </Badge>
    )
  }

  const skeletonBadge = (
    <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
  )

  return (
    <Card className="col-span-4 md:col-span-3">
      <CardHeader>
        <CardTitle>System & Infrastructure</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Scraper */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Data Scraper (WebSocket)</p>
              <p className="text-sm text-muted-foreground mt-1">
                {data.scraper
                  ? `${(data.scraper.rows_collected ?? 0).toLocaleString()} rows collected`
                  : "Listening to Binance L2 Order Book"}
              </p>
            </div>
          </div>
          {loading ? skeletonBadge : statusBadge(scraperStatus)}
        </div>

        {/* ML Engine */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">XGBoost + LSTM Inference</p>
              <p className="text-sm text-muted-foreground mt-1">
                {scraperStatus === "running" ? "Generating ML signals" : "Waiting for scraper"}
              </p>
            </div>
          </div>
          {loading
            ? skeletonBadge
            : scraperStatus === "running"
              ? <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">Active</Badge>
              : <Badge variant="outline" className="text-muted-foreground">Idle</Badge>
          }
        </div>

        {/* Bot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <BotIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Execution Engine (Bot)</p>
              <p className="text-sm text-muted-foreground mt-1">
                {data.bot?.trading_pair ? `Trading ${data.bot.trading_pair}` : "Auto paper trading"}
              </p>
            </div>
          </div>
          {loading ? skeletonBadge : statusBadge(botStatus)}
        </div>

        {/* Celery Worker */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <ActivitySquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Celery Background Worker</p>
              <p className="text-sm text-muted-foreground mt-1">ML retraining & scheduled tasks</p>
            </div>
          </div>
          <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10">
            Idle
          </Badge>
        </div>

      </CardContent>
    </Card>
  )
}
