import { useSchedule, useUpsertSchedule, useUsage } from '@/lib/api'

export function usePostingPlan() {
  const updateScheduleMutation = useUpsertSchedule()

  

  const updateSchedule = async (scheduleData: any) => {
    try {
      const result = await updateScheduleMutation.mutateAsync(scheduleData)
      return result
    } catch (error) {
      throw error
    }
  }

  return {
    updateSchedule
  }
}
