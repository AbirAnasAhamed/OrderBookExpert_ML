"use client"

import { useState } from "react"
import { useBotStore } from "@/store/useBotStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Info, KeyRound, AlertTriangle, Eye, EyeOff } from "lucide-react"

function RiskInput({
  id, label, description, value, onChange, suffix
}: {
  id: string; label: string; description: string;
  value: number; onChange: (v: number) => void; suffix?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        {label}
        <span className="text-muted-foreground" title={description}>
          <Info className="h-3 w-3" />
        </span>
      </Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {suffix && <span className="text-sm text-muted-foreground shrink-0">{suffix}</span>}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

export default function RiskPage() {
  const { riskConfig, updateRiskConfig, isLiveTrading, apiKey, apiSecret, setLiveTradingMode, setApiCredentials } = useBotStore()
  const [localApiKey, setLocalApiKey] = useState(apiKey)
  const [localApiSecret, setLocalApiSecret] = useState(apiSecret)
  const [showSecret, setShowSecret] = useState(false)

  const handleSaveCredentials = () => {
    setApiCredentials(localApiKey, localApiSecret)
    // Also sync to backend (fire and forget)
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
        <h2 className="text-3xl font-bold tracking-tight">Risk Management</h2>
        <p className="text-muted-foreground">Configure maximum position sizes, take profit, and stop loss parameters.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />Risk Parameters</CardTitle>
          <CardDescription>These settings govern the bot&apos;s exposure and are critical for capital preservation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <RiskInput id="max-position" label="Max Position Size" description="Maximum USDT allocated per single trade entry." value={riskConfig.maxPositionSizeUSDT} onChange={(v) => updateRiskConfig({ maxPositionSizeUSDT: v })} suffix="USDT" />
          <RiskInput id="take-profit" label="Take Profit (%)" description="Percentage gain at which the bot will close a position for profit." value={riskConfig.takeProfitPercent} onChange={(v) => updateRiskConfig({ takeProfitPercent: v })} suffix="%" />
          <RiskInput id="stop-loss" label="Stop Loss (%)" description="Percentage loss at which the bot will automatically cut a losing trade." value={riskConfig.stopLossPercent} onChange={(v) => updateRiskConfig({ stopLossPercent: v })} suffix="%" />
          <RiskInput id="max-trades" label="Max Open Trades" description="Maximum number of concurrent open positions allowed." value={riskConfig.maxOpenTrades} onChange={(v) => updateRiskConfig({ maxOpenTrades: v })} />
          <RiskInput id="max-drawdown" label="Max Daily Drawdown (%)" description="If total losses in a day exceed this %, the bot will stop trading for 24h." value={riskConfig.maxDailyDrawdownPercent} onChange={(v) => updateRiskConfig({ maxDailyDrawdownPercent: v })} suffix="%" />
          <div className="sm:col-span-2 pt-2"><Button id="save-risk-btn" className="w-full sm:w-auto">Save Risk Configuration</Button></div>
        </CardContent>
      </Card>

      {/* ── Live Trading Section ── */}
      <Card className={isLiveTrading ? "border-orange-500/50" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Trading Mode & API Keys
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
    </div>
  )
}
