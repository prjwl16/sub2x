import { tweetGeneratorCron } from './tweet-generator-cron'

export class CronManager {
  private static instance: CronManager
  private isInitialized = false

  private constructor() {}

  public static getInstance(): CronManager {
    if (!CronManager.instance) {
      CronManager.instance = new CronManager()
    }
    return CronManager.instance
  }

  public async initialize() {
    if (this.isInitialized) {
      console.log('Cron manager already initialized')
      return
    }

    try {
      console.log('Initializing Agenda-based cron jobs...')
      
      // Wait for Agenda to be ready and start the tweet generator cron job
      await tweetGeneratorCron.start()
      
      this.isInitialized = true
      console.log('Agenda cron jobs initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Agenda cron jobs:', error)
      // Don't throw here to prevent app crash, just log the error
      console.log('Continuing without cron jobs - they can be started manually via API')
    }
  }

  public async shutdown() {
    if (!this.isInitialized) {
      return
    }

    try {
      console.log('Shutting down Agenda cron jobs...')
      
      // Stop the tweet generator cron job and shutdown Agenda
      await tweetGeneratorCron.stop()
      await tweetGeneratorCron.shutdown()
      
      this.isInitialized = false
      console.log('Agenda cron jobs shut down successfully')
    } catch (error) {
      console.error('Failed to shut down Agenda cron jobs:', error)
      throw error
    }
  }

  public async getStatus() {
    return {
      isInitialized: this.isInitialized,
      tweetGenerator: await tweetGeneratorCron.getStatus(),
    }
  }

  public async startJobs() {
    try {
      await tweetGeneratorCron.start()
      console.log('Agenda jobs started manually')
    } catch (error) {
      console.error('Failed to start Agenda jobs:', error)
      throw error
    }
  }

  public async stopJobs() {
    try {
      await tweetGeneratorCron.stop()
      console.log('Agenda jobs stopped manually')
    } catch (error) {
      console.error('Failed to stop Agenda jobs:', error)
      throw error
    }
  }

  public async runJobNow() {
    try {
      return await tweetGeneratorCron.runNow()
    } catch (error) {
      console.error('Failed to run job immediately:', error)
      throw error
    }
  }
}

export const cronManager = CronManager.getInstance()
