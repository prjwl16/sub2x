import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { parsePagination, buildMeta } from '@/lib/pagination'
import { IdParamSchema } from '@/lib/zod-schemas'
import { events } from '@/lib/services/events'
import type { ApiSuccess } from '@/types/api'

// GET /api/posts/[id]/events - List events for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const { id } = IdParamSchema.parse(await params)
    const { searchParams } = new URL(request.url)
    const pagination = parsePagination(searchParams)

    const result = await events.listForPost(userId, id, pagination)

    const response: ApiSuccess<typeof result.items> = {
      ok: true,
      data: result.items,
      meta: buildMeta(result.meta.total, result.meta.offset, result.meta.limit),
    }

    return NextResponse.json(response)
  } catch (error) {
    return errorToResponse(error)
  }
}
