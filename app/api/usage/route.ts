import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { usage } from '@/lib/services/usage'
import type { ApiSuccess, UsageSummary } from '@/types/api'

// GET /api/usage - Get current month usage
export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()

    const usageData = await usage.getOrCreateCurrent(userId)

    const response: ApiSuccess<UsageSummary> = {
      ok: true,
      data: usageData,
    }

    return NextResponse.json(response)
  } catch (error) {
    return errorToResponse(error)
  }
}
