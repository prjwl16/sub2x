"use client"

import { SignOutButton } from "./SignOutButton"
import { Button } from "@/components/ui/button"
import { Home, MessageSquare } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export function DashboardHeader() {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()

  return (
    <header className="w-full border-b border-white/20 backdrop-blur-md bg-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Sub2X</span>
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <SignOutButton />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
