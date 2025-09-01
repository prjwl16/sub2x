import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { ScheduleUpsertSchema } from '@/lib/zod-schemas'
import { schedule } from '@/lib/services/schedule'
import type { ApiSuccess, SchedulePolicy } from '@/types/api'

// GET /api/schedule - Get user's schedule policy
export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()

    const policy = await schedule.get(userId)

    // Return defaults if no policy exists
    const defaultPolicy: SchedulePolicy = {
      id: '',
      timeZone: 'UTC',
      postsPerDay: 1,
      preferredTimes: [],
      daysOfWeek: [],
      windowStart: null,
      windowEnd: null,
      nextRunAt: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const response: ApiSuccess<SchedulePolicy> = {
      ok: true,
      data: policy || defaultPolicy,
    }

    return NextResponse.json(response)
  } catch (error) {
    return errorToResponse(error)
  }
}

// POST /api/schedule - Update user's schedule policy
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const body = await request.json()
    const validatedData = ScheduleUpsertSchema.parse(body)

    const policy = await schedule.upsert(userId, validatedData)

    const response: ApiSuccess<SchedulePolicy> = {
      ok: true,
      data: policy,
    }

    return NextResponse.json(response)
  } catch (error) {
    return errorToResponse(error)
  }
}
