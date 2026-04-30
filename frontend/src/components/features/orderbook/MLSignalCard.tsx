/**
 * @file components/features/orderbook/MLSignalCard.tsx
 * @description Displays the ML model's current signal and confidence score.
 */
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { MLPrediction } from "@/types"

export function MLSignalCard({ prediction }: { prediction?: MLPrediction | null }) {
  const signalConfig = {
    BUY: { label: "BUY SIGNAL", color: "bg-green-500/15 text-green-600 border-green-500/30", icon: TrendingUp, barColor: "bg-green-500" },
    SELL: { label: "SELL SIGNAL", color: "bg-red-500/15 text-red-500 border-red-500/30", icon: TrendingDown, barColor: "bg-red-500" },
    BULLISH: { label: "BUY SIGNAL", color: "bg-green-500/15 text-green-600 border-green-500/30", icon: TrendingUp, barColor: "bg-green-500" },
    BEARISH: { label: "SELL SIGNAL", color: "bg-red-500/15 text-red-500 border-red-500/30", icon: TrendingDown, barColor: "bg-red-500" },
    HOLD: { label: "HOLD", color: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30", icon: Minus, barColor: "bg-yellow-500" },
    NEUTRAL: { label: "HOLD", color: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30", icon: Minus, barColor: "bg-yellow-500" },
  } as Record<string, any>

  if (!prediction) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            ML Inference Engine
          </CardTitle>
          <p className="text-xs text-muted-foreground">Waiting for inference data...</p>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
            Start the Scraper to see real-time signals.
          </div>
        </CardContent>
      </Card>
    )
  }

  const config = signalConfig[prediction.signal] || signalConfig.HOLD
  const SignalIcon = config.icon

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          ML Inference Engine
        </CardTitle>
        <p className="text-xs text-muted-foreground">{prediction.modelVersion}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Main Signal */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-medium">Current Signal</span>
          <Badge variant="outline" className={config.color}>
            <SignalIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        {/* Confidence */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Model Confidence</span>
            <span className="font-semibold font-mono">{(prediction.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${config.barColor}`}
              style={{ width: `${prediction.confidence * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
