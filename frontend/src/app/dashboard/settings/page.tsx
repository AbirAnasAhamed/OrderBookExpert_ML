/**
 * @file app/dashboard/settings/page.tsx
 * @description Settings page — includes Trading Mode & API Keys section
 * (moved here from Risk Management), plus quick navigation links.
 */
"use client"

import { useState } from "react"
import Link from "next/link"
import { useBotStore } from "@/store/useBotStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Settings, KeyRound, ArrowRight, FlaskConical, ShieldCheck, AlertTriangle, Eye, EyeOff } from "lucide-react"

const QUICK_LINKS = [
  {
    icon: ShieldCheck,
    title: "Risk Parameters",
    description: "Configure Take Profit, Stop Loss, Max Position Size and daily drawdown limits.",
    href: "/dashboard/risk",
    label: "Go to Risk Management",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: FlaskConical,
    title: "Backtesting Engine",
    description: "Simulate your ML strategy on historical order book data to evaluate performance.",
    href: "/dashboard/backtest",
    label: "Go to Backtesting",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
]

export default function SettingsPage() {
  const { isLiveTrading, apiKey, apiSecret, setLiveTradingMode, setApiCredentials, riskConfig } = useBotStore()
  const [localApiKey, setLocalApiKey] = useState(apiKey)
  const [localApiSecret, setLocalApiSecret] = useState(apiSecret)
  const [showSecret, setShowSecret] = useState(false)

  const handleSaveCredentials = () => {
    setApiCredentials(localApiKey, localApiSecret)
    // Sync to backend (fire and forget)
    fetch("/api/bot/risk-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        max_position_usdt: riskConfig.maxPositionSizeUSDT,
        take_profit_percent: riskConfig.takeProfitPercent,
        stop_loss_percent: riskConfig.stopLossPercent,
        max_open_trades: riskConfig.maxOpenTrades,
        max_daily_drawdown_pct: riskConfig.maxDailyDrawdownPercent,
        is_live_trading: isLiveTrading,
        api_key: localApiKey || null,
        api_secret: localApiSecret || null,
      }),
    }).catch(() => {})
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your trading mode, API keys, and system preferences.
        </p>
      </div>

      {/* ── Trading Mode & API Keys ── */}
      <Card className={isLiveTrading ? "border-orange-500/50" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Trading Mode &amp; API Keys
              </CardTitle>
              <CardDescription className="mt-1">
                Toggle between Paper Trading (simulated) and Live Trading (real money).
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                {isLiveTrading ? "Live" : "Paper"}
              </span>
              <Switch
                id="live-trading-switch"
                checked={isLiveTrading}
                onCheckedChange={setLiveTradingMode}
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
          </div>
          {isLiveTrading && (
            <Badge variant="outline" className="w-fit mt-2 border-orange-500/50 text-orange-500 gap-1">
              <AlertTriangle className="h-3 w-3" />
              LIVE MODE — Real money at risk
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Binance API Key</Label>
            <input
              id="api-key"
              type="text"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="Enter your Binance API Key..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-secret">Binance API Secret</Label>
            <div className="relative">
              <input
                id="api-secret"
                type={showSecret ? "text" : "password"}
                value={localApiSecret}
                onChange={(e) => setLocalApiSecret(e.target.value)}
                placeholder="Enter your Binance API Secret..."
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            ⚠️ API Keys are stored locally in your browser and sent securely to the backend only when saving. Never share your Secret Key.
          </p>
          <Button id="save-api-btn" onClick={handleSaveCredentials} variant={isLiveTrading ? "default" : "outline"}>
            Save API Credentials
          </Button>
        </CardContent>
      </Card>

      {/* ── Quick Navigation ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Quick Navigation
          </CardTitle>
          <CardDescription>
            Other configuration settings are organized into dedicated pages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {QUICK_LINKS.map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </div>
              <Link
                href={item.href}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0 px-3 py-1.5 rounded-md hover:bg-muted"
              >
                {item.label}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
