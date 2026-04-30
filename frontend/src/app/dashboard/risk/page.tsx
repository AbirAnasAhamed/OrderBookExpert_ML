"use client"

import { useBotStore } from "@/store/useBotStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Info } from "lucide-react"

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
  const { riskConfig, updateRiskConfig } = useBotStore()

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

    </div>
  )
}
