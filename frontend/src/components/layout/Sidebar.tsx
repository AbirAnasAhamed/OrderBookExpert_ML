"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, BarChart2, Settings, ShieldCheck, Database, LogOut, FlaskConical } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = [
  { name: "Overview",        href: "/dashboard",           icon: Activity      },
  { name: "Order Book",      href: "/dashboard/orderbook",  icon: BarChart2    },
  { name: "Data Scraper",    href: "/dashboard/scraper",    icon: Database     },
  { name: "Risk Management", href: "/dashboard/risk",       icon: ShieldCheck  },
  { name: "Backtesting",     href: "/dashboard/backtest",   icon: FlaskConical },
  { name: "Settings",        href: "/dashboard/settings",   icon: Settings     },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card/50 backdrop-blur-sm">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-bold tracking-tight text-primary">OrderBookExpert</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4 space-y-3">
        <div className="rounded-lg bg-primary/10 p-3">
          <p className="text-sm font-medium text-primary">ML Engine Status</p>
          <p className="text-xs text-muted-foreground mt-0.5">Initializing...</p>
        </div>
        <Button
          id="sidebar-logout-btn"
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </div>
    </aside>
  )
}
