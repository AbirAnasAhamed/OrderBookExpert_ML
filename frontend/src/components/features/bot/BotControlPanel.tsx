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
    <Card className="shadow-sm">
      <CardContent className="p-3">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          
          {/* Left: Title & Status Toggle */}
          <div className="flex items-center gap-4 pr-4 md:border-r border-border/50 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2 shrink-0">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Bot Control</span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Switch
                id="bot-master-switch"
                checked={isRunning}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-green-500 scale-[0.8]"
              />
              {isRunning ? (
                <Badge className="text-[10px] h-5 px-1.5 font-mono bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/20 animate-pulse">
                  ● LIVE
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono text-muted-foreground">
                  ● OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Selectors */}
          <div className="flex flex-1 w-full items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground hidden lg:inline whitespace-nowrap">Exchange:</span>
              <Select value={exchange} onValueChange={(val) => setExchange(val as Exchange)} disabled={isRunning}>
                <SelectTrigger className="h-8 text-xs font-medium"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXCHANGES.map((ex) => <SelectItem key={ex} value={ex} className="text-xs">{ex}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground hidden lg:inline whitespace-nowrap">Market:</span>
              <Select value={marketType} onValueChange={(val) => setMarketType(val as MarketType)} disabled={isRunning}>
                <SelectTrigger className="h-8 text-xs font-medium"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spot" className="text-xs">Spot</SelectItem>
                  <SelectItem value="Futures" className="text-xs">Futures</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground hidden lg:inline whitespace-nowrap">Pair:</span>
              <Select value={tradingPair} onValueChange={(val) => val && setTradingPair(val)} disabled={isRunning}>
                <SelectTrigger className="h-8 text-xs font-medium"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRADING_PAIRS.map((pair) => <SelectItem key={pair} value={pair} className="text-xs">{pair}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isRunning && (
          <div className="mt-3 flex items-center gap-2 text-xs text-yellow-600 bg-yellow-500/10 rounded px-2 py-1.5 w-fit">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Settings locked while bot is running. Stop the bot to make changes.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
