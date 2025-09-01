import { cronManager } from './services/cron-manager'

let isInitialized = false

export async function initializeApp() {
  if (isInitialized) {
    return
  }

  try {
    console.log('Initializing application...')
    
    // Initialize cron jobs
    await cronManager.initialize()
    
    isInitialized = true
    console.log('Application initialized successfully')
  } catch (error) {
    console.error('Failed to initialize application:', error)
    // Don't throw here as it would crash the app
    // Instead, log the error and continue
  }
}

// Auto-initialize when this module is imported
if (typeof window === 'undefined') { // Server-side only
  console.log('Initializing application...')
  initializeApp().catch(console.error)
}

// Handle graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...')
    try {
      await cronManager.shutdown()
    } catch (error) {
      console.error('Error during shutdown:', error)
    }
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...')
    try {
      await cronManager.shutdown()
    } catch (error) {
      console.error('Error during shutdown:', error)
    }
    process.exit(0)
  })
}
