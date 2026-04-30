/**
 * @file components/features/bot/BotControlPanel.tsx
 * @description The main bot configuration and start/stop control panel.
 * Reads/writes from the global Zustand BotStore.
 */
"use client"

import { useBotStore } from "@/store/useBotStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Zap, AlertTriangle } from "lucide-react"
import type { Exchange, MarketType } from "@/types"

const EXCHANGES: Exchange[] = ["Binance", "Bybit", "KuCoin", "OKX", "MEXC"]
const TRADING_PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT"]

export function BotControlPanel() {
  const { status, exchange, marketType, tradingPair, setStatus, setExchange, setMarketType, setTradingPair } =
    useBotStore()

  const isRunning = status === "running"

  const handleToggle = (checked: boolean) => {
    setStatus(checked ? "running" : "stopped")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Bot Control Panel
            </CardTitle>
            <CardDescription className="mt-1">
              Configure exchange, market type, and toggle the bot on or off.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {isRunning ? "Running" : "Stopped"}
            </span>
            <Switch
              id="bot-master-switch"
              checked={isRunning}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>
        <div className="mt-2">
          {isRunning ? (
            <Badge className="bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/20 animate-pulse">
              ● LIVE TRADING
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              ● INACTIVE
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-3">
        {/* Exchange Selector */}
        <div className="space-y-2">
          <Label htmlFor="exchange-select">Exchange</Label>
          <Select
            value={exchange}
            onValueChange={(val) => setExchange(val as Exchange)}
            disabled={isRunning}
          >
            <SelectTrigger id="exchange-select">
              <SelectValue placeholder="Select Exchange" />
            </SelectTrigger>
            <SelectContent>
              {EXCHANGES.map((ex) => (
                <SelectItem key={ex} value={ex}>{ex}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Market Type Toggle */}
        <div className="space-y-2">
          <Label htmlFor="market-type-select">Market Type</Label>
          <Select
            value={marketType}
            onValueChange={(val) => setMarketType(val as MarketType)}
            disabled={isRunning}
          >
            <SelectTrigger id="market-type-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Spot">Spot</SelectItem>
              <SelectItem value="Futures">Futures (Perpetual)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trading Pair Selector */}
        <div className="space-y-2">
          <Label htmlFor="pair-select">Trading Pair</Label>
          <Select
            value={tradingPair}
            onValueChange={(val) => val && setTradingPair(val)}
            disabled={isRunning}
          >
            <SelectTrigger id="pair-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRADING_PAIRS.map((pair) => (
                <SelectItem key={pair} value={pair}>{pair}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isRunning && (
          <div className="sm:col-span-3 flex items-center gap-2 text-sm text-yellow-600 bg-yellow-500/10 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Settings are locked while the bot is running. Stop the bot to make changes.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
