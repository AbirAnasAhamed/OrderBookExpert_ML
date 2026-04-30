import { Header } from "@/components/layout/Header"
import { OrderBookContainer } from "@/components/features/orderbook/OrderBookContainer"

export default function PublicOrderBookPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Machine Learning Bot</h1>
          <p className="text-muted-foreground mt-2">
            Real-time Level 2 order book and ML inference signals.
          </p>
        </div>
        
        <OrderBookContainer />
      </main>
    </div>
  )
}
