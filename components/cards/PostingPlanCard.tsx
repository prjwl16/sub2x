"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Settings, Pause, Play } from "lucide-react"
import { useState } from "react"

interface PostingPlanCardProps {
  monthlyLimit?: number
  postsThisMonth?: number
  schedule?: string
  timezone?: string
  isActive?: boolean
  onEditPlan?: () => void
  onToggleActive?: (active: boolean) => void
}

export function PostingPlanCard({
  monthlyLimit = 100,
  postsThisMonth = 23,
  schedule = "1/day at 9:00 AM",
  timezone = "IST",
  isActive = true,
  onEditPlan,
  onToggleActive
}: PostingPlanCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const progress = Math.round((postsThisMonth / monthlyLimit) * 100)
  const status = isActive ? "Active" : "Paused"
  const statusColor = isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"

  const handleToggleActive = async () => {
    setIsUpdating(true)
    try {
      // TODO: Call API to update status
      await new Promise(resolve => setTimeout(resolve, 1000))
      onToggleActive?.(!isActive)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="glass-card hover:translate-y-[-2px] transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Posting Plan
          </CardTitle>
          <Badge className={statusColor}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Monthly Limit</span>
            <span className="font-semibold text-gray-800">{monthlyLimit} tweets</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Schedule</span>
            <span className="font-semibold text-gray-800">{schedule}, {timezone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">This Month</span>
            <span className="font-semibold text-gray-800">{postsThisMonth}/{monthlyLimit}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-800">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={onEditPlan}
            variant="outline"
            size="sm"
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Plan
          </Button>
          <Button
            onClick={handleToggleActive}
            disabled={isUpdating}
            variant="outline"
            size="sm"
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            {isUpdating ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
            ) : isActive ? (
              <Pause className="w-4 h-4 mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isUpdating ? 'Updating...' : isActive ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
