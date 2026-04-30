"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, BarChart2, Settings, ShieldCheck, Database, LogOut, FlaskConical, ChevronLeft, ChevronRight } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = [
  { name: "Overview",        href: "/dashboard",           icon: Activity      },
  { name: "Machine Learning Bot",      href: "/dashboard/orderbook",  icon: BarChart2    },
  { name: "Data Scraper",    href: "/dashboard/scraper",    icon: Database     },
  { name: "Risk Management", href: "/dashboard/risk",       icon: ShieldCheck  },
  { name: "Backtesting",     href: "/dashboard/backtest",   icon: FlaskConical },
  { name: "Settings",        href: "/dashboard/settings",   icon: Settings     },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={cn(
      "hidden md:flex flex-col border-r bg-card/50 backdrop-blur-sm transition-all duration-300 relative z-20",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <span className="text-lg font-bold tracking-tight text-primary truncate mr-2">OrderBookExpert</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 shrink-0", isCollapsed && "mx-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-hidden">
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
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed && "justify-center px-0"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4 space-y-3 overflow-hidden">
        {!isCollapsed && (
          <div className="rounded-lg bg-primary/10 p-3 whitespace-nowrap">
            <p className="text-sm font-medium text-primary">ML Engine Status</p>
            <p className="text-xs text-muted-foreground mt-0.5">Initializing...</p>
          </div>
        )}
        <Button
          id="sidebar-logout-btn"
          variant="ghost"
          className={cn(
            "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            isCollapsed ? "justify-center px-0" : "justify-start gap-2"
          )}
          onClick={() => signOut({ callbackUrl: "/" })}
          title={isCollapsed ? "Log Out" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Log Out</span>}
        </Button>
      </div>
    </aside>
  )
}
