import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { parsePagination, buildMeta } from '@/lib/pagination'
import { AddSourceSchema } from '@/lib/zod-schemas'
import { sources } from '@/lib/services/sources'
import type { ApiSuccess } from '@/types/api'

// GET /api/sources - List user's subreddit sources
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const { searchParams } = new URL(request.url)
    const pagination = parsePagination(searchParams)

    const result = await sources.listForUser(userId, pagination)

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

// POST /api/sources - Add a new subreddit source
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const body = await request.json()
    const { name, priority } = AddSourceSchema.parse(body)

    const source = await sources.add(userId, name, priority)

    const response: ApiSuccess<typeof source> = {
      ok: true,
      data: source,
    }

    return NextResponse.json(response)
  } catch (error) {
    return errorToResponse(error)
  }
}
