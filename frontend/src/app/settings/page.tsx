/**
 * @file app/settings/page.tsx
 * @description Exchange API Key management settings page.
 * API keys are masked in the UI for security. Real implementation
 * should encrypt keys server-side before persisting.
 */
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Eye, EyeOff, PlusCircle, Trash2 } from "lucide-react"

const EXCHANGES = ["Binance", "Bybit", "KuCoin", "OKX", "MEXC"]

type ApiKeyEntry = {
  exchange: string
  apiKey: string
  apiSecret: string
  connected: boolean
}

const MOCK_KEYS: ApiKeyEntry[] = [
  { exchange: "Binance", apiKey: "bna_xxxx...yyyy", apiSecret: "***", connected: true },
  { exchange: "Bybit", apiKey: "bbt_xxxx...yyyy", apiSecret: "***", connected: false },
]

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKeyEntry[]>(MOCK_KEYS)
  const [visible, setVisible] = useState<Record<number, boolean>>({})

  const toggleVisibility = (i: number) =>
    setVisible((v) => ({ ...v, [i]: !v[i] }))

  const removeKey = (i: number) =>
    setKeys((k) => k.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your exchange API keys and system preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Exchange API Keys
              </CardTitle>
              <CardDescription className="mt-1">
                Keys are stored securely and never exposed in full. Use read + trade permissions only.
              </CardDescription>
            </div>
            <Button id="add-api-key-btn" variant="outline" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {keys.map((entry, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{entry.exchange}</span>
                  <Badge
                    variant="outline"
                    className={
                      entry.connected
                        ? "text-green-600 border-green-500/30 bg-green-500/10"
                        : "text-muted-foreground"
                    }
                  >
                    {entry.connected ? "✓ Connected" : "Disconnected"}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeKey(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">API Key</Label>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                      {visible[i] ? entry.apiKey : "●●●●●●●●●●●●"}
                    </code>
                    <Button variant="ghost" size="icon" onClick={() => toggleVisibility(i)}>
                      {visible[i] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">API Secret</Label>
                  <code className="text-sm bg-muted px-2 py-1 rounded block">●●●●●●●●●●●●</code>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
