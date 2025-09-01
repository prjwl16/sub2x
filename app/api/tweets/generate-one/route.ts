import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ApiError } from '@/lib/errors'
import { redditClient } from '@/lib/services/external/reddit.client'
import { generateTweets } from '@/lib/services/gemini.client'
import type { VoiceSummary } from '@/lib/services/gemini.client'

interface GenerateTweetResponse {
  success: boolean
  data?: {
    draft: {
      id: string
      text: string
      status: string
      createdAt: string
    }
  }
  error?: string
  code?: string
}

// POST /api/tweets/generate-one - Generate a single tweet without scheduling
export async function POST(request: NextRequest): Promise<NextResponse<GenerateTweetResponse>> {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id as string

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        voiceProfile: true,
        sources: {
          where: { isEnabled: true },
          include: { subreddit: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Validation checks
    if (!user.voiceProfile) {
      return NextResponse.json(
        { success: false, error: 'Please complete your onboarding to create a voice profile.', code: 'VOICE_PROFILE_MISSING' },
        { status: 400 }
      )
    }

    if (user.sources.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please add some subreddits to generate content from.', code: 'NO_SOURCES' },
        { status: 400 }
      )
    }

    // Get random Reddit posts from user's subreddits
    const subredditNames = user.sources.map((source: any) => source.subreddit.name)
    const redditPosts = await redditClient.getRandomPosts(subredditNames, 1)

    if (redditPosts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No Reddit posts found from your selected subreddits. Please try again later.', code: 'NO_REDDIT_CONTENT' },
        { status: 400 }
      )
    }

    // Generate single tweet using Gemini
    if (!user.voiceProfile.rules) {
      return NextResponse.json(
        { success: false, error: 'Voice profile rules not found', code: 'VOICE_PROFILE_INVALID' },
        { status: 400 }
      )
    }
    
    // Type assertion with proper conversion
    const voiceProfile: VoiceSummary = user.voiceProfile.rules as unknown as VoiceSummary
    const generatedTweets = await generateTweets({
      redditPosts: redditPosts.map(post => ({
        title: post.title,
        selftext: post.selftext || '',
        subreddit: post.subreddit,
        author: post.author,
        score: post.score,
      })),
      voiceProfile,
      numberOfTweets: 1,
    })

    if (generatedTweets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate tweet. Please try again later.', code: 'TWEET_GENERATION_FAILED' },
        { status: 500 }
      )
    }

    const tweet = generatedTweets[0]

    // Create or find source item
    let sourceItem = null
    if (tweet.sourcePost) {
      sourceItem = await prisma.sourceItem.upsert({
        where: {
          provider_externalId: {
            provider: 'REDDIT',
            externalId: `${tweet.sourcePost.subreddit}_${tweet.sourcePost.title}`,
          },
        },
        update: {
          fetchedAt: new Date(),
        },
        create: {
          provider: 'REDDIT',
          externalId: `${tweet.sourcePost.subreddit}_${tweet.sourcePost.title}`,
          title: tweet.sourcePost.title,
          subreddit: {
            connect: {
              name: tweet.sourcePost.subreddit,
            },
          },
        },
      })
    }

    // Create draft with DRAFT status
    const draft = await prisma.draft.create({
      data: {
        userId: user.id,
        sourceItemId: sourceItem?.id,
        text: tweet.text,
        status: 'DRAFT',
        meta: {
          generatedAt: new Date(),
          generatedBy: 'manual_single',
          sourceSubreddit: tweet.sourcePost?.subreddit,
          sourceTitle: tweet.sourcePost?.title,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        draft: {
          id: draft.id,
          text: draft.text,
          status: draft.status,
          createdAt: draft.createdAt.toISOString(),
        },
      },
    })

  } catch (error) {
    console.error('Error generating single tweet:', error)
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.status }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}


