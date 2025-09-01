"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Settings, Pause, Play, Loader2 } from "lucide-react"
import { useState } from "react"
import { usePostingPlan } from "@/hooks/usePostingPlan"

interface PostingPlanCardProps {
  onEditPlan?: () => void
}

export function PostingPlanCard({ onEditPlan }: PostingPlanCardProps) {
  const { schedule, usage, isLoading, error, updateSchedule } = usePostingPlan()
  const [isUpdating, setIsUpdating] = useState(false)

  // Calculate derived values
  const monthlyLimit = usage?.postsAllotted || 100
  const postsThisMonth = usage?.postsPosted || 0
  const progress = Math.round((postsThisMonth / monthlyLimit) * 100)
  const isActive = schedule?.isActive ?? true
  const status = isActive ? "Active" : "Paused"
  const statusColor = isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"

  // Format schedule display
  const formatSchedule = () => {
    if (!schedule) return "1/day at 9:00 AM"
    const postsPerDay = schedule.postsPerDay
    const timeZone = schedule.timeZone
    const preferredTime = schedule.preferredTimes[0] || "9:00 AM"
    return `${postsPerDay}/day at ${preferredTime}, ${timeZone}`
  }

  const handleToggleActive = async () => {
    setIsUpdating(true)
    try {
      await updateSchedule({ isActive: !isActive })
    } catch (error) {
      console.error('Failed to toggle active status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="glass-card hover:translate-y-[-2px] transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Posting Plan
            </CardTitle>
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Monthly Limit</span>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Schedule</span>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">This Month</span>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded animate-pulse" />
          <div className="flex space-x-2">
            <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass-card hover:translate-y-[-2px] transition-all duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Posting Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 text-sm">Failed to load posting plan</p>
            <p className="text-gray-500 text-xs mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
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
            <span className="font-semibold text-gray-800">{formatSchedule()}</span>
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
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
