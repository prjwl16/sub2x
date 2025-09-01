"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, RefreshCw } from "lucide-react"
import { useState } from "react"

interface ConnectedAccountCardProps {
  handle?: string
  isConnected?: boolean
  expiresAt?: string
}

export function ConnectedAccountCard({ 
  handle = "your-handle", 
  isConnected = true, 
  expiresAt 
}: ConnectedAccountCardProps) {
  const [isReconnecting, setIsReconnecting] = useState(false)

  const handleReconnect = async () => {
    setIsReconnecting(true)
    // TODO: Implement reconnect logic
    setTimeout(() => setIsReconnecting(false), 2000)
  }

  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false
  const status = isConnected && !isExpired ? "Connected" : "Expired"
  const statusColor = isConnected && !isExpired ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"

  return (
    <Card className="glass-card hover:translate-y-[-2px] transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Connected Account
          </CardTitle>
          <Badge className={statusColor}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-800">@{handle}</p>
            <p className="text-sm text-gray-600">Twitter/X Account</p>
          </div>
        </div>
        
        {expiresAt && (
          <div className="text-sm text-gray-600">
            Expires: {new Date(expiresAt).toLocaleDateString()}
          </div>
        )}

        <Button
          onClick={handleReconnect}
          disabled={isReconnecting}
          variant="outline"
          size="sm"
          className="w-full border-gray-300 hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isReconnecting ? 'animate-spin' : ''}`} />
          {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
        </Button>
      </CardContent>
    </Card>
  )
}
