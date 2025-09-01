import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

// GET /api/auth/test - Test authentication status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'No session found'
      })
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        user: {
          id: (session.user as any)?.id,
          name: session.user?.name,
          handle: (session.user as any)?.handle,
          image: session.user?.image,
        }
      }
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
