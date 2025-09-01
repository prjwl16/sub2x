import { prisma } from '../db'

export interface XTweet {
  id: string
  text: string
  createdAt: string
  publicMetrics?: { likeCount?: number; replyCount?: number; retweetCount?: number; bookmarkCount?: number }
}

function stripUrlsAndMentions(text: string): string {
  const noUrls = text.replace(/https?:\/\/\S+/g, '')
  const noMentions = noUrls.replace(/[@#][\w_]+/g, '')
  return noMentions.replace(/\s+/g, ' ').trim()
}

/** Fetch last N original tweets (no RTs/replies). Must use OAuth2 tokens from SocialAccount. */
export async function fetchTweetsLastN(params: { userId: string; n: number }): Promise<XTweet[]> {

  //TODO: remove this once u buy the twitter apis
  if (1===1) {
    return [
      {
        "id": "1951688737798447354",
        "text": "In another life, you would have loved to travel the world with a camera in one hand and a notebook in the other capturing absurdly underrated places, weaving stories out of silent moments, maybe even running a cozy hilltop café that secretly doubles as a tech startup headquarters https://t.co/qH4aLp2eP1",
        "createdAt": "2025-08-02T16:57:10.000Z",
        "publicMetrics": {
          "likeCount": 5,
          "replyCount": 1,
          "retweetCount": 0,
          "bookmarkCount": 0
        }
      },
      {
        "id": "1942328323700580563",
        "text": "Working on an AI project that goes beyond prompts... something that learns you.\nLooking for a collaborator with real AI depth (not just API calls).\n2–3 hrs/day. Not paid, but high conviction.\nDMs are open if you think you can pull it off.",
        "createdAt": "2025-07-07T21:02:13.000Z",
        "publicMetrics": {
          "likeCount": 2,
          "replyCount": 0,
          "retweetCount": 0,
          "bookmarkCount": 0
        }
      },
      {
        "id": "1940466392723321127",
        "text": "#Bolt was free, so I built this in an hour.\nSpent 5–6 hrs styling it ✨\nThen Bolt wiped everything — no backup, no load 😭\nRewrote it from scratch (on a better tool lol).\nHere it is → a private AI-powered journaling app:\n👉 https://t.co/yFIirwe5uI",
        "createdAt": "2025-07-02T17:43:34.000Z",
        "publicMetrics": {
          "likeCount": 1,
          "replyCount": 1,
          "retweetCount": 0,
          "bookmarkCount": 0
        }
      },
      {
        "id": "1938806269265211467",
        "text": "Watched #TheTraitors  till 6am\nfigured it’d be fun to play with friends online\ncoded a basic version in under 2 hrs, deployed in 10 mins\ntry it out: https://t.co/S8tTinhaYE\nlet me know if something’s broken or can be better 🙂",
        "createdAt": "2025-06-28T03:46:50.000Z",
        "publicMetrics": {
          "likeCount": 1,
          "replyCount": 0,
          "retweetCount": 0,
          "bookmarkCount": 1
        }
      },
      {
        "id": "1918424787019547010",
        "text": "It’s 3 AM, I’m coding with snacks by my side, lo-fi on low volume, and cold air sneaking in through the window.\nCan’t explain it… but this hits different.\n\n#NightOwl #CodingLife #3AMVibes #DevMood #LoFiCoding #LateNightThoughts #BuiltDifferent #PeacefulGrind",
        "createdAt": "2025-05-02T21:58:06.000Z",
        "publicMetrics": {
          "likeCount": 0,
          "replyCount": 0,
          "retweetCount": 0,
          "bookmarkCount": 0
        }
      },
      {
        "id": "1917148932880449991",
        "text": "Saved 5+ hours using Cursor to set up my project:\n\nStack: Node.js + Supabase + Twilio\n\nBuilt webhook routes, S3 uploaders, and service structure without touching boilerplate.\n\nCursor didn’t just autocomplete — it architected.\n\n#DevTools #Cursor #BuildFast",
        "createdAt": "2025-04-29T09:28:19.000Z",
        "publicMetrics": {
          "likeCount": 2,
          "replyCount": 0,
          "retweetCount": 0,
          "bookmarkCount": 0
        }
      },
      {
        "id": "1916843313686253715",
        "text": "Been working on backend rules and handlers lately.\nIt's like raising kids — set the rules first, handle the chaos later.\n\n#TechLife #BackendDevelopment",
        "createdAt": "2025-04-28T13:13:53.000Z",
        "publicMetrics": {
          "likeCount": 3,
          "replyCount": 0,
          "retweetCount": 0,
          "bookmarkCount": 0
        }
      },
      {
        "id": "1916584962264076465",
        "text": "Philosophy is just running experiments where the results don’t fit in Excel sheets.\n\n...\n#Philosophy #DeepThoughts #LifeExperiments #ThinkingOutLoud #Existential #BeyondData #MindfulLiving",
        "createdAt": "2025-04-27T20:07:18.000Z",
        "publicMetrics": {
          "likeCount": 1,
          "replyCount": 0,
          "retweetCount": 0,
          "bookmarkCount": 0
        }
      },
      {
        "id": "1913297583554048386",
        "text": "Every IPL season reminds me:\nNo matter how good you are,\nsomeone with more context might still get picked over you.\n\nTech or cricket — same game.\n\n#IPL2025",
        "createdAt": "2025-04-18T18:24:25.000Z",
        "publicMetrics": {
          "likeCount": 0,
          "replyCount": 0,
          "retweetCount": 0,
          "bookmarkCount": 0
        }
      },
      {
        "id": "1912872447122284674",
        "text": "There’s a weird pressure to impress my LLM… like I’m scared it’ll realize I’m not as good as it thinks I am. 🫣",
        "createdAt": "2025-04-17T14:15:05.000Z",
        "publicMetrics": {
          "likeCount": 2,
          "replyCount": 1,
          "retweetCount": 1,
          "bookmarkCount": 0
        }
      },
      {
        "id": "1806273283421098418",
        "text": "I just published a blog post about serving a React app through a CDN. Check it out here: https://t.co/fYBCEJdbTz \n\n#ReactJS #CDN #WebDevelopment #JavaScript #TechBlog",
        "createdAt": "2024-06-27T10:28:04.000Z",
        "publicMetrics": {
          "likeCount": 3,
          "replyCount": 0,
          "retweetCount": 0,
          "bookmarkCount": 0
        }
      },
      {
        "id": "1804452373298827554",
        "text": "@shadcn are you building something like this at @v0 ?",
        "createdAt": "2024-06-22T09:52:25.000Z",
        "publicMetrics": {
          "likeCount": 0,
          "replyCount": 0,
          "retweetCount": 0,
          "bookmarkCount": 0
        }
      },
      {
        "id": "1804451347745378613",
        "text": "Are there any UI tools or frameworks that can dynamically generate a UI based on an API response? \n\n#webdev #ai",
        "createdAt": "2024-06-22T09:48:21.000Z",
        "publicMetrics": {
          "likeCount": 0,
          "replyCount": 1,
          "retweetCount": 0,
          "bookmarkCount": 0
        }
      },
      {
        "id": "1711808589923504274",
        "text": "Just got my ticket for @Nextjs Conf — claim yours!\n\nhttps://t.co/7jST2wTKGv",
        "createdAt": "2023-10-10T18:19:06.000Z",
        "publicMetrics": {
          "likeCount": 4,
          "replyCount": 0,
          "retweetCount": 0,
          "bookmarkCount": 0
        }
      }
    ]
  }


  const { userId, n } = params

  // Find user's X OAuth tokens
  const account = await prisma.socialAccount.findFirst({
    where: { userId, provider: 'X' },
    select: { accessToken: true, refreshToken: true, scope: true, tokenType: true, expiresAt: true, providerAccountId: true },
  })

  if (!account?.accessToken) {
    console.warn('[x.client] No X access token for user', userId)
    return []
  }

  // Expiry handling (stub refresh)
  if (account.expiresAt && account.expiresAt.getTime() < Date.now()) {
    // Implement OAuth2 refresh using `refresh_token`
    // Endpoint: POST `https://api.twitter.com/2/oauth2/token`
    // Scopes needed downstream: users.read tweet.read offline.access
    try {
      if (!account.refreshToken) {
        console.warn('[x.client] No refresh token available for user', userId)
        return []
      }

      const clientId = process.env.TWITTER_CLIENT_ID
      const clientSecret = process.env.TWITTER_CLIENT_SECRET

      if (!clientId) {
        console.warn('[x.client] Missing TWITTER_CLIENT_ID env; cannot refresh token')
        return []
      }

      const params = new URLSearchParams()
      params.set('grant_type', 'refresh_token')
      params.set('refresh_token', account.refreshToken)
      params.set('client_id', clientId)

      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
      }

      // If a client secret is configured, send HTTP Basic auth for confidential clients
      if (clientSecret) {
        const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
        headers['Authorization'] = `Basic ${basic}`
      }

      const resp = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers,
        body: params.toString(),
      })

      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        console.error('[x.client] Failed to refresh X token:', resp.status, text)
        return []
      }

      const data = (await resp.json()) as any
      const newAccessToken: string | undefined = data.access_token
      const newRefreshToken: string | undefined = data.refresh_token || account.refreshToken
      const expiresIn: number | undefined = data.expires_in
      const tokenType: string | undefined = data.token_type
      const scope: string | undefined = data.scope

      if (!newAccessToken) {
        console.error('[x.client] Refresh response missing access_token')
        return []
      }

      const newExpiresAt = expiresIn ? new Date(Date.now() + Math.max(0, expiresIn - 60) * 1000) : null

      // Persist refreshed credentials
      await prisma.socialAccount.update({
        where: { provider_providerAccountId: { provider: 'X', providerAccountId: account.providerAccountId! } },
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          tokenType: tokenType ?? account.tokenType ?? undefined,
          scope: scope ?? account.scope ?? undefined,
          expiresAt: newExpiresAt,
        },
      })

      // Update local reference to proceed if needed
      account.accessToken = newAccessToken
      account.refreshToken = newRefreshToken ?? null
      account.tokenType = tokenType ?? account.tokenType
      account.scope = scope ?? account.scope
      account.expiresAt = newExpiresAt ?? null
    } catch (err) {
      console.error('[x.client] Error refreshing X token', err)
      return []
    }
  }

  // DEV fallback: if no token or we are in dev without proper scopes, safely return []
  // if (process.env.NODE_ENV !== 'production' && !process.env.ENABLE_X_API_DEV) {
  //   return []
  // }

  // Implement real fetch using Twitter API v2
  // Endpoint: GET `https://api.twitter.com/2/users/:id/tweets`
  // Exclude RTs/replies via `exclude=retweets,replies`, request `tweet.fields=created_at,public_metrics`
  // Use OAuth2 Bearer token from user's SocialAccount accessToken. Paginate until N or no next_token.
  try {
    const bearer = account.accessToken
    const xUserId = account.providerAccountId
    if (!xUserId) return []

    const out: XTweet[] = []
    let nextToken: string | undefined

    // Tight timeout to avoid hanging
    const doFetch = async (url: string) => {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 10_000)
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: { Authorization: `Bearer ${bearer}` },
          signal: controller.signal,
        })
        return res
      } finally {
        clearTimeout(t)
      }
    }

    // Fetch pages until we have at least N or run out
    while (out.length < n) {
      const u = new URL(`https://api.twitter.com/2/users/${encodeURIComponent(xUserId)}/tweets`)
      u.searchParams.set('exclude', 'retweets,replies')
      u.searchParams.set('max_results', String(Math.min(100, Math.max(5, n - out.length))))
      u.searchParams.set('tweet.fields', 'created_at,public_metrics')
      if (nextToken) u.searchParams.set('pagination_token', nextToken)

      const resp = await doFetch(u.toString())
      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        console.warn('[x.client] X API fetch failed', resp.status, text)
        // Stop on 4xx/5xx to avoid loops
        break
      }

      type TwitterTweet = {
        id: string
        text: string
        created_at?: string
        public_metrics?: {
          like_count?: number
          reply_count?: number
          retweet_count?: number
          bookmark_count?: number
        }
      }
      type TwitterResp = { data?: TwitterTweet[]; meta?: { next_token?: string } }

      const data = (await resp.json()) as TwitterResp
      const tweets = data.data ?? []

      // Map to local shape, guard for any missing fields
      for (const t of tweets) {
        // Double-check filtering (defensive; API exclude should handle it)
        if (t.text?.startsWith('RT ')) continue
        const mapped: XTweet = {
          id: t.id,
          text: t.text ?? '',
          createdAt: t.created_at ?? new Date().toISOString(),
          publicMetrics: {
            likeCount: t.public_metrics?.like_count,
            replyCount: t.public_metrics?.reply_count,
            retweetCount: t.public_metrics?.retweet_count,
            bookmarkCount: t.public_metrics?.bookmark_count,
          },
        }
        out.push(mapped)
        if (out.length >= n) break
      }

      if (out.length >= n) break

      nextToken = data.meta?.next_token
      if (!nextToken) break
    }

    return out.slice(0, n)
  } catch (err) {
    console.error('[x.client] Error fetching X tweets', err)
    return []
  }
}
