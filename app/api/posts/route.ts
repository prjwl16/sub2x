import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { parsePagination, buildMeta } from '@/lib/pagination'
import { PostStatusFilterSchema } from '@/lib/zod-schemas'
import { posts } from '@/lib/services/posts'
import type { ApiSuccess } from '@/types/api'

// GET /api/posts - List user's posts (queue & history)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const { searchParams } = new URL(request.url)
    const pagination = parsePagination(searchParams)
    const filter = PostStatusFilterSchema.parse({
      status: searchParams.get('status'),
      from: searchParams.get('from') ? new Date(searchParams.get('from')!) : null,
      to: searchParams.get('to') ? new Date(searchParams.get('to')!) : null,
    })

    const result = await posts.list(userId, filter, pagination)

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
