"use client"

import { useSession } from "next-auth/react"
import { SignOutButton } from "./SignOutButton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function DashboardHeader() {
  const { data: session } = useSession()

  return (
    <header className="w-full border-b border-white/20 backdrop-blur-md bg-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Sub2X</span>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {session && (
              <>
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      @{session.user.handle || "your-handle"}
                    </p>
                  </div>
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={session.user.image} alt={session.user.name || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm">
                    {session.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <SignOutButton />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
