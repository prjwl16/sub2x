import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/db'
import { redditClient } from '../../../../lib/services/external/reddit.client'
import { generateTweets, VoiceSummary } from '../../../../lib/services/gemini.client'
import { ApiError } from '../../../../lib/errors'

interface GenerateTweetResponse {
  success: boolean
  data?: {
    tweetsGenerated: number
    tweets: Array<{
      id: string
      text: string
      scheduledFor: string
      sourcePost?: {
        title: string
        subreddit: string
      }
    }>
  }
  error?: string
  code?: string
}

// POST /api/tweets/generate - Generate tweets manually for the current user
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
        schedule: true,
        voiceProfile: true,
        sources: {
          where: { isEnabled: true },
          include: { subreddit: true },
        },
        accounts: {
          where: { provider: 'X' },
        },
        queue: {
          where: {
            scheduledFor: {
              gte: getTodayStart(),
              lt: getTomorrowStart(),
            },
            status: {
              in: ['SCHEDULED', 'POSTED'],
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Sanity checks
    const validationResult = validateUserForTweetGeneration(user)
    if (!validationResult.isValid) {
      return NextResponse.json(
        { success: false, error: validationResult.error, code: validationResult.code },
        { status: 400 }
      )
    }

    // Generate 1 tweet (no daily limit for manual generation)
    const result = await generateTweetsForUser(user, 1)

    return NextResponse.json({
      success: true,
      data: {
        tweetsGenerated: result.tweets.length,
        tweets: result.tweets,
      },
    })

  } catch (error) {
    console.error('Error generating tweets:', error)
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

// Helper functions
function getTodayStart(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function getTomorrowStart(): Date {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow
}

function validateUserForTweetGeneration(user: any): { isValid: boolean; error?: string; code?: string } {
  // Check if user has an active schedule policy
  if (!user.schedule || !user.schedule.isActive) {
    return {
      isValid: false,
      error: 'Tweet generation is not enabled. Please set up your posting schedule first.',
      code: 'SCHEDULE_NOT_ACTIVE',
    }
  }

  // Check if user has a voice profile
  if (!user.voiceProfile) {
    return {
      isValid: false,
      error: 'Voice profile not found. Please complete your onboarding to create a voice profile.',
      code: 'VOICE_PROFILE_MISSING',
    }
  }

  // Check if user has enabled subreddit sources
  if (!user.sources || user.sources.length === 0) {
    return {
      isValid: false,
      error: 'No subreddit sources configured. Please add some subreddits to generate content from.',
      code: 'NO_SOURCES',
    }
  }

  // Check if user has connected X account
  if (!user.accounts || user.accounts.length === 0) {
    return {
      isValid: false,
      error: 'No X (Twitter) account connected. Please connect your X account first.',
      code: 'NO_X_ACCOUNT',
    }
  }

  return { isValid: true }
}

async function generateTweetsForUser(user: any, tweetsNeeded: number) {
  try {
    console.log(`Generating ${tweetsNeeded} tweet(s) for user ${user.id}`)

    // Get random Reddit posts from user's subreddits
    const subredditNames = user.sources.map((source: any) => source.subreddit.name)
    const redditPosts = await redditClient.getRandomPosts(subredditNames, 3)

    if (redditPosts.length === 0) {
      throw new ApiError(400, 'NO_REDDIT_CONTENT', 'No Reddit posts found from your selected subreddits. Please try again later.')
    }

    // Generate tweets using Gemini
    const voiceProfile: VoiceSummary = user.voiceProfile.rules
    const generatedTweets = await generateTweets({
      redditPosts: redditPosts.map(post => ({
        title: post.title,
        selftext: post.selftext || '',
        subreddit: post.subreddit,
        author: post.author,
        score: post.score,
      })),
      voiceProfile,
      numberOfTweets: tweetsNeeded,
    })

    if (generatedTweets.length === 0) {
      throw new ApiError(500, 'TWEET_GENERATION_FAILED', 'Failed to generate tweets. Please try again later.')
    }

    // Create drafts and schedule posts
    const createdTweets = await createScheduledPosts(user, generatedTweets, redditPosts)

    console.log(`Successfully generated ${generatedTweets.length} tweet(s) for user ${user.id}`)

    return { tweets: createdTweets }

  } catch (error) {
    console.error(`Error generating tweets for user ${user.id}:`, error)
    throw error
  }
}

async function createScheduledPosts(user: any, generatedTweets: any[], redditPosts: any[]) {
  const socialAccount = user.accounts[0] // Use first X account
  const { preferredTimes, timeZone } = user.schedule
  const createdTweets = []

  for (let i = 0; i < generatedTweets.length; i++) {
    const tweet = generatedTweets[i]
    
    // Find matching Reddit post for source item
    const sourcePost = redditPosts.find(post => 
      tweet.sourcePost?.title === post.title && 
      tweet.sourcePost?.subreddit === post.subreddit
    )

    // Create or find source item
    let sourceItem = null
    if (sourcePost) {
      sourceItem = await prisma.sourceItem.upsert({
        where: {
          provider_externalId: {
            provider: 'REDDIT',
            externalId: sourcePost.id,
          },
        },
        update: {
          score: sourcePost.score,
          commentsCount: sourcePost.numComments,
        },
        create: {
          provider: 'REDDIT',
          externalId: sourcePost.id,
          url: sourcePost.url,
          title: sourcePost.title,
          author: sourcePost.author,
          summary: sourcePost.selftext?.slice(0, 500),
          content: {
            selftext: sourcePost.selftext,
            title: sourcePost.title,
            subreddit: sourcePost.subreddit,
          },
          score: sourcePost.score,
          commentsCount: sourcePost.numComments,
          subreddit: {
            connectOrCreate: {
              where: { name: sourcePost.subreddit },
              create: { 
                name: sourcePost.subreddit,
                title: `r/${sourcePost.subreddit}`,
              },
            },
          },
        },
      })
    }

    // Create draft
    const draft = await prisma.draft.create({
      data: {
        userId: user.id,
        sourceItemId: sourceItem?.id,
        text: tweet.text,
        status: 'DRAFT', // Create as draft for user review
        meta: {
          generatedAt: new Date(),
          generatedBy: 'manual',
          sourceSubreddit: tweet.sourcePost?.subreddit,
          sourceTitle: tweet.sourcePost?.title,
        },
      },
    })

    // Calculate scheduled time
    const scheduledTime = calculateScheduledTime(preferredTimes, timeZone, i)

    // Create scheduled post
    const scheduledPost = await prisma.scheduledPost.create({
      data: {
        userId: user.id,
        socialAccountId: socialAccount.id,
        draftId: draft.id,
        status: 'SCHEDULED',
        scheduledFor: scheduledTime,
      },
    })

    createdTweets.push({
      id: scheduledPost.id,
      text: tweet.text,
      scheduledFor: scheduledTime.toISOString(),
      sourcePost: tweet.sourcePost,
    })
  }

  return createdTweets
}

function calculateScheduledTime(preferredTimes: string[], timeZone: string, index: number): Date {
  const now = new Date()
  const today = new Date(now)
  
  // If preferred times are specified, use them
  if (preferredTimes.length > 0) {
    const timeString = preferredTimes[index % preferredTimes.length]
    const [hours, minutes] = timeString.split(':').map(Number)
    
    const scheduledDate = new Date(today)
    scheduledDate.setHours(hours, minutes, 0, 0)
    
    // If the time has already passed today, schedule for tomorrow
    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1)
    }
    
    return scheduledDate
  }
  
  // Default: schedule for next available hour + index
  const scheduledDate = new Date(now)
  scheduledDate.setHours(now.getHours() + 1 + index, 0, 0, 0)
  
  return scheduledDate
}
