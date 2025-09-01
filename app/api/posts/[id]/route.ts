import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { IdParamSchema } from '@/lib/zod-schemas'
import { posts } from '@/lib/services/posts'
import type { ApiSuccess } from '@/types/api'

// GET /api/posts/[id] - Get post details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const { id } = IdParamSchema.parse(await params)

    const post = await posts.get(userId, id)

    const response: ApiSuccess<typeof post> = {
      ok: true,
      data: post,
    }

    return NextResponse.json(response)
  } catch (error) {
    return errorToResponse(error)
  }
}
