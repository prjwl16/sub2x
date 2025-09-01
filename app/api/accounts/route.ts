import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { accounts } from '@/lib/services/accounts'
import type { ApiSuccess } from '@/types/api'

// GET /api/accounts - List social accounts for current user
export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()

    const accountList = await accounts.listForUser(userId)

    const response: ApiSuccess<typeof accountList> = {
      ok: true,
      data: accountList,
    }

    return NextResponse.json(response)
  } catch (error) {
    return errorToResponse(error)
  }
}
