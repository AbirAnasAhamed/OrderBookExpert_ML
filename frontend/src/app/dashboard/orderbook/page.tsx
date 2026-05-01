import { BotControlPanel } from "@/components/features/bot/BotControlPanel"
import { OrderBookContainer } from "@/components/features/orderbook/OrderBookContainer"
import { TradeHistoryTable } from "@/components/features/trading/TradeHistoryTable"
import { MLMetricsPanel } from "@/components/features/bot/MLMetricsPanel"
import { TradingChart } from "@/components/features/chart/TradingChart"

export default function OrderBookPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Machine Learning Bot</h2>
        <p className="text-muted-foreground">
          Live Machine Learning Bot with real-time inference signals.
        </p>
      </div>

      {/* Top Controls */}
      <BotControlPanel />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side: Chart & Metrics (Takes 2/3 width on large screens) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <MLMetricsPanel />
          <TradingChart />
        </div>
        
        {/* Right Side: Order Book (Takes 1/3 width on large screens) */}
        <div className="xl:col-span-1 h-full">
          <OrderBookContainer />
        </div>
      </div>

      {/* Bottom Trade History */}
      <TradeHistoryTable />
    </div>
  )
}
