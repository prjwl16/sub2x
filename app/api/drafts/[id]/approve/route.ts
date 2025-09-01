import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { IdParamSchema } from '@/lib/zod-schemas'
import { drafts } from '@/lib/services/drafts'

// POST /api/drafts/[id]/approve - Approve a draft
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const { id } = IdParamSchema.parse(await params)

    await drafts.approve(userId, id)

    return NextResponse.json({ ok: true, data: { success: true } })
  } catch (error) {
    return errorToResponse(error)
  }
}
