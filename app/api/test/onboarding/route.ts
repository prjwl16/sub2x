import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { processUserFirstLogin } from '@/lib/onboarding'

// POST /api/test/onboarding - Test processUserFirstLogin without blocking
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}))
    const Schema = z.object({ userId: z.string().min(1) })
    const { userId } = Schema.parse(body)

    // Fire-and-forget: don't await, return immediately
    processUserFirstLogin(userId).catch((err) => {
      console.error('[test/onboarding] Error:', err)
    })

    return NextResponse.json({ ok: true, message: 'onboarding process triggered' })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Invalid userId in request body' },
      { status: 400 }
    )
  }
}
