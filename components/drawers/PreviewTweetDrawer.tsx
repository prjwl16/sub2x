"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Clock, Calendar, X, Share2 } from "lucide-react"

interface PreviewTweetDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tweet?: {
    id: string
    text: string
    scheduledFor: string
    source: string
    status: "SCHEDULED" | "DRAFT"
  }
}

export function PreviewTweetDrawer({
  open,
  onOpenChange,
  tweet = {
    id: "1",
    text: "Just discovered an amazing new AI tool that's revolutionizing how we approach content creation. The possibilities are endless! 🤖✨ #AI #Innovation #Tech",
    scheduledFor: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
    source: "r/technology",
    status: "SCHEDULED"
  }
}: PreviewTweetDrawerProps) {
  const formatScheduledTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  const getTimeUntilScheduled = (dateString: string) => {
    const now = new Date().getTime()
    const scheduled = new Date(dateString).getTime()
    const timeLeft = scheduled - now

    if (timeLeft <= 0) return "Due now"

    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `in ${days}d ${hours % 24}h`
    }
    
    return `in ${hours}h ${minutes}m`
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>Preview Next Tweet</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Tweet Preview */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Sub2X</p>
                    <p className="text-sm text-gray-500">@sub2x</p>
                  </div>
                </div>
                <Badge className={tweet.status === "SCHEDULED" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                  {tweet.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {tweet.text}
              </p>
            </CardContent>
          </Card>

          {/* Scheduling Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Scheduling Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Scheduled for</span>
                </div>
                <span className="font-medium text-gray-800">
                  {formatScheduledTime(tweet.scheduledFor)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Time until post</span>
                </div>
                <span className="font-medium text-gray-800">
                  {getTimeUntilScheduled(tweet.scheduledFor)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Source</span>
                <span className="font-medium text-gray-800">{tweet.source}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              className="flex-1 gradient-accent text-white hover:opacity-90"
            >
              Edit Tweet
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
