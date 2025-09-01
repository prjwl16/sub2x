import { NextResponse } from 'next/server'
import { cronManager } from '../../../../lib/services/cron-manager'

// This endpoint can be used to initialize or check system status
export async function GET() {
  try {
    // Initialize cron manager if not already done
    await cronManager.initialize()
    
    const status = cronManager.getStatus()
    
    return NextResponse.json({
      success: true,
      message: 'System initialized successfully',
      data: status,
    })
  } catch (error) {
    console.error('System initialization error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize system',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Initialize the system when this module is loaded (server-side)
cronManager.initialize().catch(console.error)
