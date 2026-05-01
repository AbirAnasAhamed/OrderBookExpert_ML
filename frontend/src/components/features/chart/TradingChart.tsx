"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, Time, CandlestickSeries, createSeriesMarkers, SeriesMarker } from "lightweight-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const TIMEFRAMES = ["1m", "3m", "5m", "15m", "1h", "4h", "1d", "1M"]

// Fetch historical candlestick data from Binance REST API
async function fetchHistoricalData(interval: string): Promise<CandlestickData<Time>[]> {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=1000`)
    const data = await res.json()
    
    return data.map((d: any) => ({
      time: (d[0] / 1000) as Time,
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
    }))
  } catch (error) {
    console.error("Failed to fetch historical data", error)
    return []
  }
}

export function TradingChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  
  const [isLive, setIsLive] = useState(false)
  const [timeframe, setTimeframe] = useState("1m")

  // Initialize the chart instance once
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255, 255, 255, 0.7)",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.1)" },
        horzLines: { color: "rgba(255, 255, 255, 0.1)" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      autoSize: true,
    })
    
    chartRef.current = chart

    return () => {
      chart.remove()
      chartRef.current = null
    }
  }, [])

  // Handle Data and WebSocket connection when timeframe changes
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    let isMounted = true
    setIsLive(false)

    // Add new candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    })

    const markersList: SeriesMarker<Time>[] = []
    const markersPlugin = createSeriesMarkers(candlestickSeries, markersList)

    let ws: WebSocket | null = null
    let currentCandle: CandlestickData<Time> | null = null

    const initData = async () => {
      try {
        // 1. Fetch initial historical data for the selected timeframe
        const initialData = await fetchHistoricalData(timeframe)
        if (!isMounted) return // Abort if component was unmounted or timeframe changed
        
        if (initialData.length > 0) {
          candlestickSeries.setData(initialData)
          currentCandle = { ...initialData[initialData.length - 1] }
        }

        // 2. Connect to Binance live WebSocket (Combined Stream: Kline + AggTrades for tick-by-tick speed)
        ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=btcusdt@kline_${timeframe}/btcusdt@aggTrade`)
        
        ws.onopen = () => {
          if (isMounted) setIsLive(true)
        }
        
        ws.onclose = () => {
          if (isMounted) setIsLive(false)
        }

        ws.onerror = (error) => {
          console.error("WebSocket Error:", error)
          if (isMounted) setIsLive(false)
        }
        
        ws.onmessage = (event) => {
          if (!isMounted) return
          try {
            const payload = JSON.parse(event.data)
            const stream = payload.stream
            const data = payload.data
            
            if (stream === `btcusdt@kline_${timeframe}`) {
              const kline = data.k
              if (kline) {
                currentCandle = {
                  time: (kline.t / 1000) as Time,
                  open: parseFloat(kline.o),
                  high: parseFloat(kline.h),
                  low: parseFloat(kline.l),
                  close: parseFloat(kline.c),
                }
                candlestickSeries.update(currentCandle)
                
                // Temporary marker simulation for testing
                if (kline.x && Math.random() > 0.95) {
                  const isBuy = Math.random() > 0.5
                  markersList.push({
                    time: currentCandle.time,
                    position: isBuy ? 'belowBar' : 'aboveBar',
                    color: isBuy ? '#22c55e' : '#ef4444',
                    shape: isBuy ? 'arrowUp' : 'arrowDown',
                    text: isBuy ? 'Bot Buy' : 'Bot Sell',
                  })
                  markersPlugin.setMarkers(markersList)
                }
              }
            } else if (stream === 'btcusdt@aggTrade') {
              // Real-time tick update to make the chart feel instantly responsive
              if (currentCandle) {
                const price = parseFloat(data.p)
                const tradeTimeMs = data.T
                const candleTimeMs = (currentCandle.time as number) * 1000
                
                // Only update the current candle if the trade belongs to it
                if (tradeTimeMs >= candleTimeMs) {
                  currentCandle = {
                    ...currentCandle,
                    close: price,
                    high: Math.max(currentCandle.high, price),
                    low: Math.min(currentCandle.low, price),
                  }
                  candlestickSeries.update(currentCandle)
                }
              }
            }
          } catch (e) {
            console.error("Failed to parse WS message", e)
          }
        }
      } catch (err) {
        console.error("Error in initData:", err)
      }
    }

    initData()

    // Cleanup function when timeframe changes or component unmounts
    return () => {
      isMounted = false
      if (ws) {
        ws.close()
      }
      try {
        chart.removeSeries(candlestickSeries)
      } catch (e) {
        // Series might have already been removed or chart destroyed
      }
    }
  }, [timeframe])

  return (
    <Card className="flex flex-col h-[700px]">
      <CardHeader className="py-3 px-4 shrink-0 border-b">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-3">
            <span>BTC/USDT</span>
            <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    timeframe === tf
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary-foreground/10"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={isLive ? "text-green-500 border-green-500/50" : "text-muted-foreground"}>
              {isLive ? "● LIVE" : "CONNECTING..."}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative">
        <div 
          ref={chartContainerRef} 
          className="absolute inset-0 w-full h-full"
        />
      </CardContent>
    </Card>
  )
}
