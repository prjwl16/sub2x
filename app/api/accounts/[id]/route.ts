import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { IdParamSchema } from '@/lib/zod-schemas'
import { accounts } from '@/lib/services/accounts'

// DELETE /api/accounts/[id] - Disconnect social account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const { id } = IdParamSchema.parse(await params)

    await accounts.deleteForUser(userId, id)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return errorToResponse(error)
  }
}
