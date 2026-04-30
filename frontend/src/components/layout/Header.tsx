"use client"

import { Moon, Sun, Bell } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card/50 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle can go here if needed */}
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Avatar className="h-8 w-8">
          <AvatarImage src="https://github.com/shadcn.png" alt="@admin" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
