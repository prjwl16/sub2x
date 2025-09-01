import { prisma } from '../db'
import type { SchedulePolicy } from '../../types/api'

export const schedule = {
  async get(userId: string): Promise<SchedulePolicy | null> {
    const policy = await prisma.schedulePolicy.findUnique({
      where: { userId },
    })

    if (!policy) {
      return null
    }

    return {
      id: policy.id,
      timeZone: policy.timeZone,
      postsPerDay: policy.postsPerDay,
      preferredTimes: policy.preferredTimes,
      daysOfWeek: policy.daysOfWeek.map(day => day.toString()),
      windowStart: policy.windowStart,
      windowEnd: policy.windowEnd,
      nextRunAt: policy.nextRunAt,
      isActive: policy.isActive,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
    }
  },

  async upsert(userId: string, payload: {
    timeZone: string
    postsPerDay: number
    preferredTimes: string[]
    daysOfWeek?: string[]
    windowStart?: number | null
    windowEnd?: number | null
    isActive?: boolean
  }): Promise<SchedulePolicy> {
    const policy = await prisma.schedulePolicy.upsert({
      where: { userId },
      update: {
        timeZone: payload.timeZone,
        postsPerDay: payload.postsPerDay,
        preferredTimes: payload.preferredTimes,
        daysOfWeek: payload.daysOfWeek?.map(day => day as any) || [],
        windowStart: payload.windowStart,
        windowEnd: payload.windowEnd,
        isActive: payload.isActive ?? true,
        // TODO: Compute nextRunAt based on schedule logic
        nextRunAt: null,
      },
      create: {
        userId,
        timeZone: payload.timeZone,
        postsPerDay: payload.postsPerDay,
        preferredTimes: payload.preferredTimes,
        daysOfWeek: payload.daysOfWeek?.map(day => day as any) || [],
        windowStart: payload.windowStart,
        windowEnd: payload.windowEnd,
        isActive: payload.isActive ?? true,
        // TODO: Compute nextRunAt based on schedule logic
        nextRunAt: null,
      },
    })

    return {
      id: policy.id,
      timeZone: policy.timeZone,
      postsPerDay: policy.postsPerDay,
      preferredTimes: policy.preferredTimes,
      daysOfWeek: policy.daysOfWeek.map(day => day.toString()),
      windowStart: policy.windowStart,
      windowEnd: policy.windowEnd,
      nextRunAt: policy.nextRunAt,
      isActive: policy.isActive,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
    }
  },
}
