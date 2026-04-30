import { BotControlPanel } from "@/components/features/bot/BotControlPanel"
import { OrderBookContainer } from "@/components/features/orderbook/OrderBookContainer"
import { TradeHistoryTable } from "@/components/features/trading/TradeHistoryTable"

export default function OrderBookPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Order Book & ML Signals</h2>
        <p className="text-muted-foreground">
          Live Level 2 order book with real-time ML inference signals.
        </p>
      </div>
      <BotControlPanel />
      <OrderBookContainer />
      <TradeHistoryTable />
    </div>
  )
}
