import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { sources } from '@/lib/services/sources'
import { z } from 'zod'

// GET /api/sources - get user's subreddit sources
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()

    const result = await sources.listForUser(userId, { offset: 0, limit: 100 })

    const communities = result.items.map(item => ({
      id: item.id,
      name: `r/${item.name}`,
      url: `https://reddit.com/r/${item.name}`,
      isActive: item.isEnabled,
      priority: item.priority,
      title: item.title,
      nsfw: item.nsfw,
      lastUsedAt: item.lastUsedAt
    }))

    return NextResponse.json({ ok: true, data: communities })
  } catch (error) {
    return errorToResponse(error)
  }
}

// POST /api/sources - add new subreddit sources
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const body = await req.json().catch(() => ({}))
    
    const Schema = z.object({
      subreddits: z.array(z.string().min(1)).min(1).max(20),
    })
    
    const { subreddits } = Schema.parse(body)

    const results = await sources.addBatch(userId, subreddits)

    const communities = results.map(item => ({
      id: item.id,
      name: `r/${item.name}`,
      url: `https://reddit.com/r/${item.name}`,
      isActive: item.isEnabled,
      priority: item.priority,
      title: item.title,
      nsfw: item.nsfw,
      lastUsedAt: item.lastUsedAt
    }))

    return NextResponse.json({ ok: true, data: communities })
  } catch (error) {
    return errorToResponse(error)
  }
}