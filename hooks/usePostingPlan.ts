import { useSchedule, useUpsertSchedule, useUsage } from '@/lib/api'

export function usePostingPlan() {
  const { data: schedule, isLoading: scheduleLoading, error: scheduleError } = useSchedule()
  const { data: usage, isLoading: usageLoading, error: usageError } = useUsage()
  const updateScheduleMutation = useUpsertSchedule()

  const isLoading = scheduleLoading || usageLoading
  const error = scheduleError || usageError

  const updateSchedule = async (scheduleData: any) => {
    try {
      const result = await updateScheduleMutation.mutateAsync(scheduleData)
      return result
    } catch (error) {
      throw error
    }
  }

  return {
    schedule,
    usage,
    isLoading,
    error: error?.message || null,
    updateSchedule
  }
}
