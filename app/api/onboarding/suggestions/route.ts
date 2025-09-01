import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'

type SubredditRow = { subreddit: string; topic?: string; audience?: string }

function normalize(raw: string): string {
  return raw.replace(/^\/?r\//i, '').toLowerCase()
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await requireAuth()

    // Dynamically import JSON and read its default export (the array)
    const { default: rows } = await import('../subreddits.json')
    const list = rows as SubredditRow[]

    const url = new URL(req.url)
    const qRaw = url.searchParams.get('q') || ''
    const limitRaw = url.searchParams.get('limit') || ''
    const limit = Math.min(50, Math.max(1, Number.parseInt(limitRaw || '10', 10)))
    const q = normalize(qRaw)

    const base = list.map(r => ({ name: r.subreddit.replace(/^r\//, ''), topic: r.topic, audience: r.audience }))

    let results = base
    if (q) {
      // prioritize startsWith, then includes
      const starts = base.filter(r => normalize(r.name).startsWith(q))
      const contains = base.filter(r => normalize(r.name).includes(q) && !starts.some(s => s.name === r.name))
      results = [...starts, ...contains]
    }

    return NextResponse.json({ ok: true, data: results.slice(0, limit) })
  } catch (error) {
    return errorToResponse(error)
  }
}
