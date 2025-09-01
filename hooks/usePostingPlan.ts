import { useState, useEffect } from 'react'
import type { SchedulePolicy, UsageSummary } from '@/types/api'

interface PostingPlanData {
  schedule: SchedulePolicy | null
  usage: UsageSummary | null
  isLoading: boolean
  error: string | null
}

export function usePostingPlan() {
  const [data, setData] = useState<PostingPlanData>({
    schedule: null,
    usage: null,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }))

        // Fetch schedule and usage data in parallel
        const [scheduleResponse, usageResponse] = await Promise.all([
          fetch('/api/schedule'),
          fetch('/api/usage')
        ])

        if (!scheduleResponse.ok) {
          throw new Error('Failed to fetch schedule data')
        }

        if (!usageResponse.ok) {
          throw new Error('Failed to fetch usage data')
        }

        const scheduleData = await scheduleResponse.json()
        const usageData = await usageResponse.json()

        setData({
          schedule: scheduleData.data,
          usage: usageData.data,
          isLoading: false,
          error: null
        })
      } catch (error) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch data'
        }))
      }
    }

    fetchData()
  }, [])

  const updateSchedule = async (scheduleData: Partial<SchedulePolicy>) => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      })

      if (!response.ok) {
        throw new Error('Failed to update schedule')
      }

      const result = await response.json()
      
      setData(prev => ({
        ...prev,
        schedule: result.data
      }))

      return result.data
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update schedule'
      }))
      throw error
    }
  }

  return {
    ...data,
    updateSchedule
  }
}
