import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export interface Trade {
  id: number
  pair: string
  side: "long" | "short"
  status: "open" | "closed" | "cancelled"
  entry_price: string
  exit_price: string | null
  position_size: string
  pnl: string | null
  opened_at: string
  closed_at: string | null
}

export interface TradeHistoryData {
  trades: Trade[]
  total: number
  open_count: number
  total_pnl: number
}

export function useTradeHistory(refreshIntervalMs = 2000) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken

  const [data, setData] = useState<TradeHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrades = async () => {
    if (!token) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/trades?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Failed to fetch trades")
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrades()
    const interval = setInterval(fetchTrades, refreshIntervalMs)
    return () => clearInterval(interval)
  }, [token, refreshIntervalMs])

  return { data, loading, error, refetch: fetchTrades }
}
