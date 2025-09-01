import { NextRequest, NextResponse } from 'next/server'
import { tweetGeneratorCron } from '../../../../lib/services/tweet-generator-cron'
import { cronManager } from '../../../../lib/services/cron-manager'
import { ApiError } from '../../../../lib/errors'

// GET /api/cron/tweet-generator - Get cron job status
export async function GET() {
  try {
    const status = await tweetGeneratorCron.getStatus()
    
    return NextResponse.json({
      success: true,
      data: status,
    })
  } catch (error) {
    console.error('Error getting cron job status:', error)
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/cron/tweet-generator - Control cron job (start/stop/run)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (!action || !['start', 'stop', 'run'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be one of: start, stop, run' },
        { status: 400 }
      )
    }

    let result: any = { action }

    switch (action) {
      case 'start':
        await tweetGeneratorCron.start()
        result.message = 'Agenda job started successfully'
        break
        
      case 'stop':
        await tweetGeneratorCron.stop()
        result.message = 'Agenda job stopped successfully'
        break
        
      case 'run':
        // Run the job immediately (for testing/manual trigger)
        const stats = await tweetGeneratorCron.runNow()
        result.stats = stats
        result.message = 'Tweet generation job scheduled to run immediately via Agenda'
        break
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error controlling Agenda job:', error)
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
