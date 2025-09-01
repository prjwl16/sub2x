import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'

// POST /api/tweets/generate-one - stub
export async function POST(_req: NextRequest): Promise<NextResponse> {
  try {
    await requireAuth()
    return NextResponse.json({ ok: true, data: { message: 'generation stubbed; will use VoiceProfile later' } })
  } catch (error) {
    return errorToResponse(error)
  }
}


