import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export interface ScraperStats {
  status: "running" | "stopped" | "error"
  rows_collected: number
  data_size_mb: number
  started_at: string | null
}

export interface BotStatusData {
  status: "running" | "stopped" | "error"
  trading_pair: string | null
}

export interface SystemStatusData {
  scraper: ScraperStats | null
  bot: BotStatusData | null
}

export function useSystemStatus(refreshIntervalMs = 5000) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken

  const [data, setData] = useState<SystemStatusData>({ scraper: null, bot: null })
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    if (!token) return
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [scraperRes, botRes] = await Promise.all([
        fetch(`${baseUrl}/api/v1/scraper/stats`, { headers }),
        fetch(`${baseUrl}/api/v1/bot/status`, { headers }),
      ])

      const scraper = scraperRes.ok ? await scraperRes.json() : null
      const bot = botRes.ok ? await botRes.json() : null

      setData({ scraper, bot })
    } catch {
      // silently fail for status checks
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, refreshIntervalMs)
    return () => clearInterval(interval)
  }, [token, refreshIntervalMs])

  return { data, loading }
}
