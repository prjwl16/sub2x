import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { IdParamSchema } from '@/lib/zod-schemas'
import { sources } from '@/lib/services/sources'

// DELETE /api/sources/[id] - Remove a subreddit source
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const { id } = IdParamSchema.parse(await params)

    await sources.remove(userId, id)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return errorToResponse(error)
  }
}
