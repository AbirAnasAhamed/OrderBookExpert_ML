import { BotControlPanel } from "@/components/features/bot/BotControlPanel"
import { OrderBookContainer } from "@/components/features/orderbook/OrderBookContainer"
import { TradeHistoryTable } from "@/components/features/trading/TradeHistoryTable"

export default function OrderBookPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Machine Learning Bot</h2>
        <p className="text-muted-foreground">
          Live Machine Learning Bot with real-time inference signals.
        </p>
      </div>
      <BotControlPanel />
      <OrderBookContainer />
      <TradeHistoryTable />
    </div>
  )
}
