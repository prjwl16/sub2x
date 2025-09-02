"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export function SignOutButton() {
  const { logout } = useAuth()
  const router = useRouter()

  const handleSignOut = () => {
    logout()
    router.push('/')
  }

  return (
    <Button
      onClick={handleSignOut}
      variant="outline"
      size="sm"
      className="border-gray-300 hover:bg-gray-50"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign out
    </Button>
  )
}
