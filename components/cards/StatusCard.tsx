"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Activity, Eye } from "lucide-react"
import { useState, useEffect } from "react"

interface StatusCardProps {
  nextPostTime?: string
  lastPost?: {
    time: string
    text: string
  }
  postsThisMonth?: number
  onPreviewNext?: () => void
}

export function StatusCard({
  nextPostTime = new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(), // 14 hours from now
  lastPost = {
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    text: "Just discovered an amazing new AI tool that's revolutionizing how we approach content creation. The possibilities are endless! 🤖✨ #AI #Innovation #Tech"
  },
  postsThisMonth = 23,
  onPreviewNext
}: StatusCardProps) {
  const [countdown, setCountdown] = useState("")
  const [timeUntilNext, setTimeUntilNext] = useState(0)

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime()
      const nextPost = new Date(nextPostTime).getTime()
      const timeLeft = nextPost - now

      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60))
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
        setCountdown(`${hours}h ${minutes}m`)
        setTimeUntilNext(timeLeft)
      } else {
        setCountdown("Due now")
        setTimeUntilNext(0)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [nextPostTime])

  const formatRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  const truncateText = (text: string, maxLength: number = 120) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <Card className="glass-card hover:translate-y-[-2px] transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Status
          </CardTitle>
          <Activity className="w-5 h-5 text-gray-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Next Post</span>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-800">
                {timeUntilNext > 0 ? `in ${countdown}` : countdown}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Last Post</span>
            <span className="font-semibold text-gray-800">
              {formatRelativeTime(lastPost.time)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">This Month</span>
            <span className="font-semibold text-gray-800">{postsThisMonth} tweets</span>
          </div>
        </div>

        {lastPost && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 leading-relaxed">
              {truncateText(lastPost.text)}
            </p>
          </div>
        )}

        <Button
          onClick={onPreviewNext}
          variant="outline"
          className="w-full border-gray-300 hover:bg-gray-50"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview Next Tweet
        </Button>
      </CardContent>
    </Card>
  )
}
