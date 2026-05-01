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
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BrainCircuit className="h-5 w-5 text-primary" />
            ML Model Metrics
          </CardTitle>
          <Badge variant="outline" className="text-xs font-mono bg-green-500/10 text-green-600 border-green-500/20">
            ● MODEL ONLINE
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {/* Accuracy */}
          <div className="flex flex-col gap-1 p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Accuracy</span>
            </div>
            <div className="text-2xl font-bold">{metrics.accuracy}%</div>
          </div>

          {/* Confidence */}
          <div className="flex flex-col gap-1 p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Confidence</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">{metrics.confidence}%</div>
          </div>

          {/* Next Move */}
          <div className="flex flex-col gap-1 p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {metrics.prediction === "BUY" ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : metrics.prediction === "SELL" ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <Activity className="h-4 w-4 text-yellow-500" />
              )}
              <span>Next Move</span>
            </div>
            <div className={`text-2xl font-bold ${
              metrics.prediction === "BUY" ? "text-green-500" : 
              metrics.prediction === "SELL" ? "text-red-500" : "text-yellow-500"
            }`}>
              {metrics.prediction}
            </div>
          </div>

          {/* Latency */}
          <div className="flex flex-col gap-1 p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Inference Time</span>
            </div>
            <div className="text-2xl font-bold font-mono">{metrics.latency}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
