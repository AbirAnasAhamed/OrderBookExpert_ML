/**
 * @file components/features/scraper/ScraperControl.tsx
 * @description UI panel to control the data scraper service and
 * monitor collection progress. Connects to real FastAPI backend.
 */
"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Activity, Play, Square, Settings2, Trash2, Database, Brain, HardDrive, Rows3, RefreshCw } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ScraperControl() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken
  
  const [status, setStatus] = useState("idle")
  const [rowsCollected, setRowsCollected] = useState(0)
  const [dataSizeMB, setDataSizeMB] = useState(0)
  const [readinessPct, setReadinessPct] = useState(0)
  const [targetRows, setTargetRows] = useState(10000)
  const [loading, setLoading] = useState(false)
  const [autoRetrain, setAutoRetrain] = useState(false)
  const [autoRetrainLoading, setAutoRetrainLoading] = useState(false)

  const isRunning = status === "running"

  const fetchStats = async () => {
    if (!token) return
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const headers = { Authorization: `Bearer ${token}` }
      const [statsRes, autoRes] = await Promise.all([
        fetch(`${baseUrl}/api/v1/scraper/stats`, { headers }),
        fetch(`${baseUrl}/api/v1/scraper/auto-retrain-status`, { headers }),
      ])
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStatus(data.status)
        setRowsCollected(data.rows_collected)
        setDataSizeMB(data.data_size_mb)
        setReadinessPct(data.readiness_pct)
        setTargetRows(data.target_rows ?? 10000)
      }
      if (autoRes.ok) {
        const autoData = await autoRes.json()
        setAutoRetrain(autoData.auto_retrain_enabled)
      }
    } catch (e) {
      console.error("Failed to fetch stats", e)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 2000)
    return () => clearInterval(interval)
  }, [token])

  const handleAction = async (action: "start" | "stop" | "clear" | "train") => {
    if (!token) return
    setLoading(true)
    try {
      const method = action === "clear" ? "DELETE" : "POST"
      // When starting, pass target_rows as query param so backend auto-stops
      const url = action === "start"
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/scraper/start?target_rows=${targetRows}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/scraper/${action}`
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        await fetchStats()
      }
    } catch (e) {
      console.error(`Failed to ${action} scraper`, e)
    } finally {
      setLoading(false)
    }
  }

  const handleTargetUpdate = async (newTarget: number) => {
    if (!token) return
    setTargetRows(newTarget)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/scraper/target`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ target_rows: newTarget })
      })
      fetchStats()
    } catch (e) {
      console.error("Failed to update target rows", e)
    }
  }

  const formatRows = (n: number | null | undefined) => {
    if (n == null) return "∞"
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return n.toString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              L2 Data Scraper
            </CardTitle>
            <CardDescription className="mt-1">
              Collects real-time L2 order book snapshots for ML model training.
            </CardDescription>
          </div>
          {isRunning ? (
            <Badge className="bg-green-500/15 text-green-600 border-green-500/30 animate-pulse">
              ● COLLECTING DATA
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">● IDLE</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Rows3 className="h-4 w-4" />
              <span className="text-sm">Rows Collected</span>
            </div>
            <p className="text-2xl font-bold font-mono">{formatRows(rowsCollected)}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              <span className="text-sm">Data Size</span>
            </div>
            <p className="text-2xl font-bold font-mono">{dataSizeMB.toFixed(2)} MB</p>
          </div>
        </div>

        {/* Progress toward training threshold */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                ML Training Readiness
              </span>
              <span className="font-medium">{readinessPct}% of {formatRows(targetRows)} rows</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${readinessPct}%` }}
              />
            </div>
          </div>
          
          {/* Target Slider */}
          <div className="rounded-md bg-secondary/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Settings2 className="h-4 w-4" />
                Target Threshold
              </span>
              <span className="font-mono">{formatRows(targetRows)}</span>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                className="flex-1"
                defaultValue={[targetRows]}
                value={[targetRows]}
                min={10000}
                max={1000000}
                step={10000}
                onValueChange={(val) => setTargetRows(Array.isArray(val) ? val[0] : (val as unknown as number))}
              />
              <Button size="sm" variant="outline" onClick={() => handleTargetUpdate(targetRows)}>
                Set Target
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Adjust how many rows you want to collect before triggering ML training. 10k is suitable for fast local testing.
            </p>
          </div>
        </div>

        {/* Auto-Retrain Toggle + Controls */}
        <div className="space-y-4 pt-2">

          {/* Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="auto-retrain-toggle" className="text-sm font-medium flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                Auto Re-training
              </Label>
              <p className="text-xs text-muted-foreground">
                {autoRetrain
                  ? "✅ ON — Model retrains automatically every 6 hours via Celery"
                  : "⏸️ OFF — Use the Train button below to retrain manually"}
              </p>
            </div>
            <Switch
              id="auto-retrain-toggle"
              checked={autoRetrain}
              disabled={autoRetrainLoading}
              onCheckedChange={async (val) => {
                setAutoRetrainLoading(true)
                try {
                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/scraper/auto-retrain/toggle?enabled=${val}`,
                    { method: "POST", headers: { Authorization: `Bearer ${(session?.user as any)?.accessToken}` } }
                  )
                  if (res.ok) setAutoRetrain(val)
                } finally {
                  setAutoRetrainLoading(false)
                }
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => handleAction("start")}
              disabled={isRunning || loading}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="h-4 w-4" />
              Start Scraper
            </Button>
            <Button
              onClick={() => handleAction("stop")}
              disabled={!isRunning || loading}
              variant="secondary"
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Scraper
            </Button>

            <div className="flex-1" />

            {/* Manual Train — only visible when auto-retrain is OFF */}
            {!autoRetrain && (
              <Button
                id="manual-train-btn"
                onClick={() => handleAction("train")}
                disabled={readinessPct < 100 || loading}
                variant="default"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Brain className="h-4 w-4" />
                Train ML Model
              </Button>
            )}

            <Button
              onClick={() => handleAction("clear")}
              disabled={isRunning || loading}
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
