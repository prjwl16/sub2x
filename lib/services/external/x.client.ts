// External X (Twitter) API client - STUB IMPLEMENTATION
// TODO: Integrate with actual X API v2

// // import { prisma } from "../db"

export interface TweetPayload {
  text: string
  replyTo?: string
  mediaIds?: string[]
}

export interface TweetResponse {
  id: string
  text: string
  createdAt: string
}

export class XClient {
  async getAccessTokenForUser(userId: string): Promise<string | null> {
    // TODO: Re-implement using backend API instead of Prisma
    // const account = await prisma.socialAccount.findFirst({
    //   where: {
    //     userId,
    //     provider: 'X',
    //   },
    //   select: {
    //     accessToken: true,
    //     expiresAt: true,
    //   },
    // })

    // if (!account?.accessToken) {
    //   return null
    // }

    // // Check if token is expired
    // if (account.expiresAt && account.expiresAt < new Date()) {
    //   // TODO: Implement token refresh logic
    //   console.warn('Access token expired for user:', userId)
    //   return null
    // }

    // return account.accessToken

    // Temporary mock response until backend API is implemented
    console.log(`[XClient] getAccessTokenForUser temporarily disabled - using backend API instead: ${userId}`)
    return null
  }

  async postTweet(userId: string, payload: TweetPayload): Promise<TweetResponse> {
    const accessToken = await this.getAccessTokenForUser(userId)
    
    if (!accessToken) {
      throw new Error('No valid access token found for user')
    }

    // Implement actual X API integration
    // POST https://api.twitter.com/2/tweets with OAuth2 user access token
    const body: Record<string, any> = { text: payload.text }
    if (payload.replyTo) {
      body.reply = { in_reply_to_tweet_id: payload.replyTo }
    }
    if (payload.mediaIds && payload.mediaIds.length > 0) {
      body.media = { media_ids: payload.mediaIds }
    }

    // Use a short timeout to avoid hanging
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12_000)
    try {
      const resp = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!resp.ok) {
        // Best-effort parse of Twitter error shape
        let detail = ''
        try {
          const err = await resp.json()
          // Twitter errors sometimes under `errors` or `detail`
          if (err?.detail) detail = err.detail
          else if (Array.isArray(err?.errors) && err.errors.length) {
            const e = err.errors[0]
            detail = e?.detail || e?.message || JSON.stringify(e)
          } else {
            detail = JSON.stringify(err)
          }
        } catch {
          detail = await resp.text().catch(() => '')
        }

        if (resp.status === 429) {
          throw new Error(`Rate limited by X API (429). ${detail || 'Please retry later.'}`)
        }
        if (resp.status === 401 || resp.status === 403) {
          throw new Error(`Unauthorized to post tweet. ${detail || 'Check OAuth scopes/valid token.'}`)
        }
        throw new Error(`Failed to post tweet: HTTP ${resp.status}. ${detail}`)
      }

      type PostTweetResp = { data?: { id: string; text: string; created_at?: string } }
      const data = (await resp.json()) as PostTweetResp
      const tweet = data.data
      if (!tweet?.id) {
        throw new Error('X API returned no tweet id')
      }

      return {
        id: tweet.id,
        text: tweet.text || payload.text,
        createdAt: tweet.created_at || new Date().toISOString(),
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  async getUserInfo(userId: string): Promise<{
    id: string
    username: string
    name: string
  }> {
    const accessToken = await this.getAccessTokenForUser(userId)
    
    if (!accessToken) {
      throw new Error('No valid access token found for user')
    }

    // TODO: Implement user info fetching
    // This should call https://api.twitter.com/2/users/me
    
    throw new Error('X API integration not implemented yet')
  }

  async validateToken(userId: string): Promise<boolean> {
    const accessToken = await this.getAccessTokenForUser(userId)
    
    if (!accessToken) {
      return false
    }

    // TODO: Implement token validation
    // This should call https://api.twitter.com/2/users/me to verify the token
    
    throw new Error('X API integration not implemented yet')
  }
}

export const xClient = new XClient()
