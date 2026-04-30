"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Settings, KeyRound, ArrowRight, FlaskConical, ShieldCheck } from "lucide-react"

const QUICK_LINKS = [
  {
    icon: KeyRound,
    title: "API Keys & Trading Mode",
    description: "Add your Binance API Key, toggle between Paper Trading and Live Trading.",
    href: "/dashboard/risk",
    label: "Go to Risk Management",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Risk Parameters",
    description: "Configure Take Profit, Stop Loss, Max Position Size and daily drawdown limits.",
    href: "/dashboard/risk",
    label: "Go to Risk Management",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: FlaskConical,
    title: "Backtesting Engine",
    description: "Simulate your ML strategy on historical order book data to evaluate performance.",
    href: "/dashboard/backtest",
    label: "Go to Backtesting",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your system configuration. API Keys and risk parameters are managed in their dedicated pages.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Quick Navigation
          </CardTitle>
          <CardDescription>
            All configuration settings are organized into dedicated pages for clarity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {QUICK_LINKS.map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </div>
              <Link
                href={item.href}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0 px-3 py-1.5 rounded-md hover:bg-muted"
              >
                {item.label}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
