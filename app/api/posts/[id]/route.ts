import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ApiError } from '@/lib/errors'
import { posts } from '@/lib/services/posts'

interface PostActionRequest {
  action: 'post_now' | 'approve' | 'reject'
}

interface PostActionResponse {
  success: boolean
  data?: {
    id: string
    status: string
    updatedAt: string
  }
  error?: string
  code?: string
}

// POST /api/posts/[id] - Perform actions on a post or draft
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id as string
    const { id } = await params
    const body: PostActionRequest = await request.json()

    if (!body.action) {
      return NextResponse.json(
        { success: false, error: 'Action is required', code: 'ACTION_REQUIRED' },
        { status: 400 }
      )
    }

    const result = await posts.postToX(userId, id)

    // Find the post or draft

    return NextResponse.json({
      success: true,
      data: {
        success: true,
      },
    })

  } catch (error) {
    console.error('Error performing post action:', error)
    
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
