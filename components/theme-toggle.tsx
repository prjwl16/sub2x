"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="sm">
            <Sun className="h-4 w-4" />
            <span className="sr-only">Toggle theme</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton 
          size="sm" 
          onClick={toggleTheme}
          className="transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <Sun 
              className={`h-4 w-4 transition-all duration-500 ${
                isDark 
                  ? "rotate-180 scale-0 opacity-0" 
                  : "rotate-0 scale-100 opacity-100"
              }`}
            />
            <Moon 
              className={`h-4 w-4 absolute top-0 left-0 transition-all duration-500 ${
                isDark 
                  ? "rotate-0 scale-100 opacity-100" 
                  : "-rotate-180 scale-0 opacity-0"
              }`}
            />
          </div>
          <span className="sr-only">Toggle theme</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
