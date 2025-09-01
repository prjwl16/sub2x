import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { z } from 'zod'
import { prisma } from '@/lib/db'

// POST /api/onboarding/complete - fake completion: sets cookie to bypass gate
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const body = await req.json().catch(() => ({}))
    const Schema = z.object({
      subreddits: z.array(z.string().min(1)).min(5).max(50),
    })
    const { subreddits } = Schema.parse(body)

    // Persist selections: ensure each subreddit exists, then upsert UserSubreddit with isEnabled=true
    await prisma.$transaction(async (tx) => {
      for (const nameRaw of subreddits.slice(0, 50)) {
        const name = nameRaw.replace(/^r\//, '').trim().toLowerCase()
        if (!name) continue
        const subreddit = await tx.subreddit.upsert({
          where: { name },
          update: {},
          create: { name },
        })
        await tx.userSubreddit.upsert({
          where: { userId_subredditId: { userId, subredditId: subreddit.id } },
          update: { isEnabled: true },
          create: { userId, subredditId: subreddit.id, isEnabled: true },
        })
      }
    })

    const res = NextResponse.json({ ok: true, data: { message: 'onboarding completed' } })
    res.cookies.set('onboarding_complete', '1', { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    return res
  } catch (error) {
    return errorToResponse(error)
  }
}


