"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { usePostingPlan } from "@/hooks/usePostingPlan"
import type { SchedulePolicy } from "@/types/api"

interface EditPlanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (data: Partial<SchedulePolicy>) => void
}

interface EditPlanData {
  postsPerDay: number
  time: string
  timezone: string
  isActive: boolean
  monthlyLimit: number
}

export function EditPlanModal({
  open,
  onOpenChange,
  onSave
}: EditPlanModalProps) {
  const { schedule, updateSchedule } = usePostingPlan()
  const [formData, setFormData] = useState<EditPlanData>({
    postsPerDay: 1,
    time: "09:00",
    timezone: "UTC",
    isActive: true,
    monthlyLimit: 100
  })
  const [isSaving, setIsSaving] = useState(false)

  // Update form data when schedule data is loaded
  useEffect(() => {
    if (schedule) {
      setFormData({
        postsPerDay: schedule.postsPerDay,
        time: schedule.preferredTimes[0] || "09:00",
        timezone: schedule.timeZone,
        isActive: schedule.isActive,
        monthlyLimit: 100 // This might need to come from usage API
      })
    }
  }, [schedule])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const scheduleData: Partial<SchedulePolicy> = {
        postsPerDay: formData.postsPerDay,
        preferredTimes: [formData.time],
        timeZone: formData.timezone,
        isActive: formData.isActive
      }
      
      await updateSchedule(scheduleData)
      onSave?.(scheduleData)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save schedule:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Posting Plan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="postsPerDay" className="text-right">
              Posts/Day
            </Label>
            <Select
              value={formData.postsPerDay.toString()}
              onValueChange={(value) => setFormData({ ...formData, postsPerDay: parseInt(value) })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Time
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timezone" className="text-right">
              Timezone
            </Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => setFormData({ ...formData, timezone: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IST">IST (UTC+5:30)</SelectItem>
                <SelectItem value="EST">EST (UTC-5)</SelectItem>
                <SelectItem value="PST">PST (UTC-8)</SelectItem>
                <SelectItem value="GMT">GMT (UTC+0)</SelectItem>
                <SelectItem value="CET">CET (UTC+1)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="monthlyLimit" className="text-right">
              Monthly Limit
            </Label>
            <Input
              id="monthlyLimit"
              type="number"
              value={formData.monthlyLimit}
              onChange={(e) => setFormData({ ...formData, monthlyLimit: parseInt(e.target.value) })}
              className="col-span-3"
              min="1"
              max="1000"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Active
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive" className="text-sm text-gray-600">
                {formData.isActive ? "Plan is active" : "Plan is paused"}
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gradient-accent text-white hover:opacity-90"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
