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
  { params }: { params: { id: string } }
): Promise<NextResponse<PostActionResponse>> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id as string
    const { id } = params
    const body: PostActionRequest = await request.json()

    if (!body.action) {
      return NextResponse.json(
        { success: false, error: 'Action is required', code: 'ACTION_REQUIRED' },
        { status: 400 }
      )
    }

    // Find the post or draft
    let result: any

    if (body.action === 'post_now') {
      // Find the scheduled post
      const post = await prisma.scheduledPost.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          draft: true,
          socialAccount: true,
        },
      })

      if (!post) {
        return NextResponse.json(
          { success: false, error: 'Post not found', code: 'POST_NOT_FOUND' },
          { status: 404 }
        )
      }

      if (post.status !== 'SCHEDULED') {
        return NextResponse.json(
          { success: false, error: 'Post is not in scheduled status', code: 'INVALID_STATUS' },
          { status: 409 }
        )
      }

      //post to x
      await posts.postToX(userId, id)

      // Update post to POSTED status
      result = await prisma.scheduledPost.update({
        where: { id },
        data: {
          status: 'POSTED',
          postedAt: new Date(),
        },
      })

      // Update draft status if it exists
      if (post.draft) {
        await prisma.draft.update({
          where: { id: post.draft.id },
          data: { status: 'POSTED' },
        })
      }

      // TODO: Actually post to X when X API is implemented
      // const tweetResponse = await xClient.postTweet(userId, {
      //   text: post.draft.text,
      // })
      
    } else if (body.action === 'approve' || body.action === 'reject') {
      // Find the draft
      const draft = await prisma.draft.findFirst({
        where: {
          id,
          userId,
        },
      })

      if (!draft) {
        return NextResponse.json(
          { success: false, error: 'Draft not found', code: 'DRAFT_NOT_FOUND' },
          { status: 404 }
        )
      }

      const newStatus = body.action === 'approve' ? 'POSTED' : 'REJECTED'
      
      result = await prisma.draft.update({
        where: { id },
        data: { status: newStatus },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        status: result.status,
        updatedAt: result.updatedAt.toISOString(),
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
