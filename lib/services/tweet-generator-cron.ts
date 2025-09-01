import Agenda from 'agenda'
import { prisma } from '../db'
import { redditClient } from './external/reddit.client'
import { generateTweets, VoiceSummary } from './gemini.client'
import { ApiError } from '../errors'

export interface TweetGenerationStats {
  usersProcessed: number
  tweetsGenerated: number
  errors: string[]
  startTime: Date
  endTime?: Date
}

export class TweetGeneratorCron {
  private agenda: Agenda | null = null
  private isRunning: boolean = false
  private lastRunStats: TweetGenerationStats | null = null

  constructor() {
    this.setupAgenda()
  }

  private async setupAgenda() {
    try {
      // Get MongoDB connection string from environment
      const mongoUrl = process.env.MONGODB_URL
      
      if (!mongoUrl) {
        console.error('MongoDB connection string not found. Please set MONGODB_URL or MONGO_URL environment variable.')
        console.log('Falling back to in-memory job storage (not recommended for production)')
        
        // Create agenda without MongoDB (in-memory storage)
        this.agenda = new Agenda()
      } else {
        // Create agenda with MongoDB
        this.agenda = new Agenda({
          db: { address: mongoUrl, collection: 'agendaJobs' },
          processEvery: '1 minute', // Process jobs every minute //TODO: Change to 1 hour
          maxConcurrency: 1, // Only run one job at a time
        })
      }

      // Define the tweet generation job
      this.agenda.define('generate tweets', async (job: any) => {
        console.log('Starting tweet generation job via Agenda...')
        await this.runTweetGeneration()
      })

      // Handle agenda events
      this.agenda.on('ready', () => {
        console.log('Agenda ready to process jobs')
      })

      this.agenda.on('error', (error) => {
        console.error('Agenda error:', error)
      })

      this.agenda.on('start', (job) => {
        console.log(`Job ${job.attrs.name} starting`)
      })

      this.agenda.on('complete', (job) => {
        console.log(`Job ${job.attrs.name} completed`)
      })

      this.agenda.on('fail', (error, job) => {
        console.error(`Job ${job.attrs.name} failed:`, error)
      })

      // Start agenda
      await this.agenda.start()
      console.log('Agenda started successfully')

    } catch (error) {
      console.error('Failed to setup Agenda:', error)
      throw error
    }
  }

  public async start() {
    if (!this.agenda) {
      throw new Error('Agenda not initialized')
    }

    try {
      // Cancel any existing jobs first
      await this.agenda.cancel({ name: 'generate tweets' })
      
      // Schedule the job to run every hour
      await this.agenda.every('1 hour', 'generate tweets', {}, {
        timezone: 'UTC',
        skipImmediate: true // Don't run immediately on start
      })
      
      console.log('Tweet generation job scheduled to run every hour')
    } catch (error) {
      console.error('Failed to start tweet generation job:', error)
      throw error
    }
  }

  public async stop() {
    if (!this.agenda) {
      return
    }

    try {
      // Cancel all scheduled jobs
      await this.agenda.cancel({ name: 'generate tweets' })
      console.log('Tweet generation jobs cancelled')
    } catch (error) {
      console.error('Failed to stop tweet generation jobs:', error)
      throw error
    }
  }

  public async shutdown() {
    if (this.agenda) {
      await this.agenda.stop()
      console.log('Agenda stopped')
    }
  }

  public async runTweetGeneration(): Promise<TweetGenerationStats> {
    if (this.isRunning) {
      throw new ApiError(409, 'CONFLICT', 'Tweet generation job is already running')
    }

    this.isRunning = true
    const stats: TweetGenerationStats = {
      usersProcessed: 0,
      tweetsGenerated: 0,
      errors: [],
      startTime: new Date()
    }

    try {
      // Get users who need tweets generated
      const usersNeedingTweets = await this.getUsersNeedingTweets()
      console.log(`Found ${usersNeedingTweets.length} users needing tweets`)

      for (const user of usersNeedingTweets) {
        try {
          await this.generateTweetsForUser(user)
          stats.usersProcessed++
        } catch (error) {
          const errorMessage = `Error processing user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          console.error(errorMessage)
          stats.errors.push(errorMessage)
        }
      }

      // Update stats
      const totalTweets = await this.getTotalTweetsGeneratedToday()
      stats.tweetsGenerated = totalTweets

    } catch (error) {
      const errorMessage = `Critical error in tweet generation: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error(errorMessage)
      stats.errors.push(errorMessage)
    } finally {
      this.isRunning = false
      stats.endTime = new Date()
      this.lastRunStats = stats
      
      console.log(`Tweet generation completed: ${stats.usersProcessed} users processed, ${stats.tweetsGenerated} tweets generated, ${stats.errors.length} errors`)
    }

    return stats
  }

  private async getUsersNeedingTweets() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get users who:
    // 1. Have an active schedule policy
    // 2. Have subreddits configured
    // 3. Have a voice profile
    // 4. Haven't reached their daily tweet limit
    return await prisma.user.findMany({
      where: {
        schedule: {
          isActive: true,
        },
        sources: {
          some: {
            isEnabled: true,
          },
        },
        voiceProfile: {
          isNot: null,
        },
      },
      include: {
        schedule: true,
        voiceProfile: true,
        sources: {
          where: {
            isEnabled: true,
          },
          include: {
            subreddit: true,
          },
        },
        queue: {
          where: {
            scheduledFor: {
              gte: today,
              lt: tomorrow,
            },
            status: {
              in: ['SCHEDULED', 'POSTED'],
            },
          },
        },
        accounts: {
          where: {
            provider: 'X',
          },
        },
      },
    })
  }

  private async generateTweetsForUser(user: any) {
    if (!user.schedule || !user.voiceProfile || !user.sources.length || !user.accounts.length) {
      console.log(`Skipping user ${user.id}: missing required data`)
      return
    }

    const { postsPerDay } = user.schedule
    const currentTweetCount = user.queue.length
    const tweetsNeeded = postsPerDay - currentTweetCount

    if (tweetsNeeded <= 0) {
      console.log(`User ${user.id} already has enough tweets scheduled for today`)
      return
    }

    console.log(`Generating ${tweetsNeeded} tweet(s) for user ${user.id}`)

    try {
      // Get random Reddit posts from user's subreddits
      const subredditNames = user.sources.map((source: any) => source.subreddit.name)
      const redditPosts = await redditClient.getRandomPosts(subredditNames, 3)

      if (redditPosts.length === 0) {
        console.warn(`No Reddit posts found for user ${user.id}`)
        return
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
        console.warn(`No tweets generated for user ${user.id}`)
        return
      }

      // Create drafts and schedule posts
      await this.createScheduledPosts(user, generatedTweets, redditPosts)

      console.log(`Successfully generated ${generatedTweets.length} tweet(s) for user ${user.id}`)

    } catch (error) {
      console.error(`Error generating tweets for user ${user.id}:`, error)
      throw error
    }
  }

  private async createScheduledPosts(user: any, generatedTweets: any[], redditPosts: any[]) {
    const socialAccount = user.accounts[0] // Use first X account
    const { preferredTimes, timeZone } = user.schedule

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
          status: 'APPROVED', // Auto-approve generated tweets
          meta: {
            generatedAt: new Date(),
            sourceSubreddit: tweet.sourcePost?.subreddit,
            sourceTitle: tweet.sourcePost?.title,
          },
        },
      })

      // Calculate scheduled time
      const scheduledTime = this.calculateScheduledTime(preferredTimes, timeZone, i)

      // Create scheduled post
      await prisma.scheduledPost.create({
        data: {
          userId: user.id,
          socialAccountId: socialAccount.id,
          draftId: draft.id,
          status: 'SCHEDULED',
          scheduledFor: scheduledTime,
        },
      })
    }
  }

  private calculateScheduledTime(preferredTimes: string[], timeZone: string, index: number): Date {
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

  private async getTotalTweetsGeneratedToday(): Promise<number> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return await prisma.scheduledPost.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })
  }

  public async runNow(): Promise<TweetGenerationStats> {
    if (!this.agenda) {
      throw new Error('Agenda not initialized')
    }

    try {
      // Schedule a job to run immediately
      const job = await this.agenda.now('generate tweets', {})
      console.log('Tweet generation job scheduled to run immediately')
      
      // Wait a bit for the job to potentially complete
      // In a real scenario, you might want to implement a more sophisticated waiting mechanism
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return this.lastRunStats || {
        usersProcessed: 0,
        tweetsGenerated: 0,
        errors: ['Job scheduled but stats not yet available'],
        startTime: new Date(),
      }
    } catch (error) {
      console.error('Failed to run tweet generation job immediately:', error)
      throw error
    }
  }

  public async getJobStats() {
    if (!this.agenda) {
      return null
    }

    try {
      // Get job statistics from Agenda
      const jobs = await this.agenda.jobs({ name: 'generate tweets' })
      const runningJobs = jobs.filter(job => job.attrs.lockedAt && !job.attrs.lastFinishedAt)
      const scheduledJobs = jobs.filter(job => job.attrs.nextRunAt && !job.attrs.lockedAt)

      return {
        totalJobs: jobs.length,
        runningJobs: runningJobs.length,
        scheduledJobs: scheduledJobs.length,
        nextRun: scheduledJobs.length > 0 ? scheduledJobs[0].attrs.nextRunAt : null,
      }
    } catch (error) {
      console.error('Failed to get job stats:', error)
      return null
    }
  }

  public getLastRunStats(): TweetGenerationStats | null {
    return this.lastRunStats
  }

  public isJobRunning(): boolean {
    return this.isRunning
  }

  public async getStatus(): Promise<{
    isRunning: boolean
    isScheduled: boolean
    lastRun: TweetGenerationStats | null
    agendaStats?: any
  }> {
    const agendaStats = await this.getJobStats()
    
    return {
      isRunning: this.isRunning,
      isScheduled: agendaStats ? agendaStats.scheduledJobs > 0 : false,
      lastRun: this.lastRunStats,
      agendaStats,
    }
  }
}

// Singleton instance
export const tweetGeneratorCron = new TweetGeneratorCron()
