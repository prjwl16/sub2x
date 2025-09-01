import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { ReorderSourcesSchema } from '@/lib/zod-schemas'
import { sources } from '@/lib/services/sources'
import type { ApiSuccess } from '@/types/api'

// POST /api/sources/reorder - Bulk update source priorities
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const body = await request.json()
    const { items } = ReorderSourcesSchema.parse(body)

    const updatedSources = await sources.reorder(userId, items)

    const response: ApiSuccess<{ sources: typeof updatedSources }> = {
      ok: true,
      data: { sources: updatedSources },
    }

    return NextResponse.json(response)
  } catch (error) {
    return errorToResponse(error)
  }
}
