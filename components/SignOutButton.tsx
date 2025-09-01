"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/" })}
      variant="outline"
      size="sm"
      className="border-gray-300 hover:bg-gray-50"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign out
    </Button>
  )
}
