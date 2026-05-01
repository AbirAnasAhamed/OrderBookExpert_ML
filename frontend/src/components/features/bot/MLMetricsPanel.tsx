"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BrainCircuit, TrendingUp, TrendingDown, Activity, Target } from "lucide-react"

export function MLMetricsPanel() {
  // In a real scenario, these would come from a global store or context
  // updated via websockets from the backend.
  const metrics = {
    accuracy: 94.2,
    confidence: 88.5,
    prediction: "BUY" as "BUY" | "SELL" | "HOLD",
    latency: "12ms",
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 pr-4 border-r border-border/50 hidden md:flex">
            <BrainCircuit className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">ML Engine</span>
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 ml-2 font-mono bg-green-500/10 text-green-600 border-green-500/20">
              ● ONLINE
            </Badge>
          </div>

          <div className="flex flex-1 items-center justify-around md:justify-between gap-4">
            {/* Accuracy */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Accuracy:</span>
              </div>
              <div className="text-base font-bold">{metrics.accuracy}%</div>
            </div>

            {/* Confidence */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Confidence:</span>
              </div>
              <div className="text-base font-bold text-blue-500">{metrics.confidence}%</div>
            </div>

            {/* Next Move */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {metrics.prediction === "BUY" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                ) : metrics.prediction === "SELL" ? (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <Activity className="h-3.5 w-3.5 text-yellow-500" />
                )}
                <span className="hidden sm:inline">Action:</span>
              </div>
              <div className={`text-base font-bold ${
                metrics.prediction === "BUY" ? "text-green-500" : 
                metrics.prediction === "SELL" ? "text-red-500" : "text-yellow-500"
              }`}>
                {metrics.prediction}
              </div>
            </div>

            {/* Latency */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Latency:</span>
              </div>
              <div className="text-base font-bold font-mono">{metrics.latency}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
