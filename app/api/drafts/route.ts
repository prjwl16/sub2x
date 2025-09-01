import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { parsePagination, buildMeta } from '@/lib/pagination'
import { DraftStatusFilterSchema } from '@/lib/zod-schemas'
import { drafts } from '@/lib/services/drafts'
import type { ApiSuccess } from '@/types/api'

// GET /api/drafts - List user's drafts
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const { searchParams } = new URL(request.url)
    const pagination = parsePagination(searchParams)
    const filter = DraftStatusFilterSchema.parse({
      status: searchParams.get('status'),
    })

    const result = await drafts.list(userId, filter, pagination)

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
