"use client"

import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { useRouter } from "next/navigation"

export function DashboardButton() {
  const router = useRouter()

  return (
    <Button
      onClick={() => router.push("/dashboard")}
      variant="outline"
      size="sm"
      className="border-gray-300 hover:bg-gray-50"
    >
      <Home className="w-4 h-4 mr-2" />
      Dashboard
    </Button>
  )
}
