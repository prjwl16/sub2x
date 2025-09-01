import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { IdParamSchema, CancelPostSchema } from '@/lib/zod-schemas'
import { posts } from '@/lib/services/posts'

// POST /api/posts/[id]/cancel - Cancel a scheduled post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const { id } = IdParamSchema.parse(await params)
    const body = await request.json()
    const { reason } = CancelPostSchema.parse(body)

    await posts.cancel(userId, id, reason)

    return NextResponse.json({ ok: true, data: { success: true } })
  } catch (error) {
    return errorToResponse(error)
  }
}
