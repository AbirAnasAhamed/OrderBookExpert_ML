"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import type { OrderBook, MLPrediction } from "@/types"

export function useRealOrderBook(pair: string = "BTC-USDT") {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken
  
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null)
  const [prediction, setPrediction] = useState<MLPrediction | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!token) return

    const baseUrl = (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000").replace(/\/ws\/?$/, "")
    const wsUrl = `${baseUrl}/ws/orderbook/${pair}?token=${token}`
    
    const connect = () => {
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        setIsConnected(true)
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.bids && data.asks) {
            setOrderBook({
              bids: data.bids,
              asks: data.asks,
              spread: data.spread,
              timestamp: new Date(data.timestamp).getTime(),
            })
          }
          
          if (data.ml_prediction) {
            setPrediction({
              signal: data.ml_prediction.signal.toUpperCase(),
              confidence: data.ml_prediction.confidence,
              wallBreakProbability: 0.0, // To be implemented
              wallBounceProbability: 0.0, // To be implemented
              modelVersion: "XGBoost-L2-v1",
            })
          }
        } catch (e) {
          console.error("Failed to parse WS message", e)
        }
      }
      
      ws.onclose = () => {
        setIsConnected(false)
        // Auto-reconnect after 3s
        setTimeout(connect, 3000)
      }
      
      wsRef.current = ws
    }
    
    connect()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [token, pair])

  return { orderBook, prediction, isConnected }
}
