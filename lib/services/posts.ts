import { prisma } from '../db'
import { ApiError } from '../errors'
import type { PostItem } from '../../types/api'
import type { PaginationMeta } from '../pagination'
import { xClient } from './external/x.client'

export const posts = {
  async list(
    userId: string,
    filter: { status?: string; from?: Date | null; to?: Date | null },
    pagination: { offset: number; limit: number }
  ): Promise<{ items: PostItem[]; meta: PaginationMeta }> {
    const where: any = { userId }
    
    if (filter.status) {
      where.status = filter.status
    }
    
    if (filter.from || filter.to) {
      where.scheduledFor = {}
      if (filter.from) {
        where.scheduledFor.gte = new Date(filter.from)
      }
      if (filter.to) {
        where.scheduledFor.lte = new Date(filter.to)
      }
    }

    // Determine ordering based on status
    let orderBy: any = { scheduledFor: 'desc' }
    if (filter.status === 'SCHEDULED') {
      orderBy = { scheduledFor: 'asc' } // Soonest first
    } else if (filter.status === 'POSTED') {
      orderBy = { postedAt: 'desc' } // Latest first
    }

    const [items, total] = await Promise.all([
      prisma.scheduledPost.findMany({
        where,
        include: {
          draft: {
            select: {
              id: true,
              text: true,
            },
          },
          socialAccount: {
            select: {
              id: true,
              provider: true,
              username: true,
            },
          },
        },
        orderBy,
        skip: pagination.offset,
        take: pagination.limit,
      }),
      prisma.scheduledPost.count({ where }),
    ])

    const postItems: PostItem[] = items.map(post => ({
      id: post.id,
      status: post.status.toString(),
      scheduledFor: post.scheduledFor,
      postedAt: post.postedAt,
      externalPostId: post.externalPostId,
      error: post.error,
      attemptCount: post.attemptCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      draft: post.draft,
      socialAccount: {
        ...post.socialAccount,
        provider: post.socialAccount.provider.toString(),
      },
    }))

    return {
      items: postItems,
      meta: {
        total,
        offset: pagination.offset,
        limit: pagination.limit,
      },
    }
  },

  async get(userId: string, id: string): Promise<PostItem> {
    const post = await prisma.scheduledPost.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        draft: {
          select: {
            id: true,
            text: true,
          },
        },
        socialAccount: {
          select: {
            id: true,
            provider: true,
            username: true,
          },
        },
      },
    })

    if (!post) {
      throw new ApiError(404, 'NOT_FOUND', 'Post not found')
    }

    return {
      id: post.id,
      status: post.status.toString(),
      scheduledFor: post.scheduledFor,
      postedAt: post.postedAt,
      externalPostId: post.externalPostId,
      error: post.error,
      attemptCount: post.attemptCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      draft: post.draft,
      socialAccount: {
        ...post.socialAccount,
        provider: post.socialAccount.provider.toString(),
      },
    }
  },

  async cancel(userId: string, id: string, reason?: string): Promise<void> {
    const post = await prisma.scheduledPost.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!post) {
      throw new ApiError(404, 'NOT_FOUND', 'Post not found')
    }

    if (post.status === 'CANCELED') {
      throw new ApiError(409, 'CONFLICT', 'Post is already canceled')
    }

    if (post.status === 'POSTED') {
      throw new ApiError(409, 'CONFLICT', 'Cannot cancel a post that has already been posted')
    }

    await prisma.$transaction(async (tx) => {
      // Update post status
      await tx.scheduledPost.update({
        where: { id },
        data: { status: 'CANCELED' },
      })

      // Add cancel event
      await tx.postEvent.create({
        data: {
          scheduledPostId: id,
          type: 'CANCEL',
          message: reason || 'Post canceled by user',
        },
      })
    })
  },

  async postToX(userId: string, postId: string): Promise<void> {
    const post = await prisma.scheduledPost.findFirst({
      where: {
        id: postId,
        userId,
      },
      include: {
        draft: true,
        socialAccount: true,
      },
    })

    if (!post) {
      throw new ApiError(404, 'NOT_FOUND', 'Post not found')
    }

    if (post.status !== 'SCHEDULED') {
      throw new ApiError(409, 'CONFLICT', 'Post is not in scheduled status')
    }

    if (!post.draft) {
      throw new ApiError(400, 'BAD_REQUEST', 'Post has no associated draft')
    }

    try {
      // Lock the post to prevent concurrent posting
      await prisma.scheduledPost.update({
        where: { id: postId },
        data: { 
          status: 'POSTED',
          lockedAt: new Date(),
          attemptCount: { increment: 1 },
        },
      })

      // Add attempt event
      await prisma.postEvent.create({
        data: {
          scheduledPostId: postId,
          type: 'ATTEMPT',
          message: 'Attempting to post to X',
        },
      })

      // TODO: Uncomment when X API is implemented
      // const tweetResponse = await xClient.postTweet(userId, {
      //   text: post.draft.text,
      // })

      // Update post with external ID and success
      await prisma.scheduledPost.update({
        where: { id: postId },
        data: {
          status: 'POSTED',
          postedAt: new Date(),
          // externalPostId: tweetResponse.id,
        },
      })

      // Add success event
      await prisma.postEvent.create({
        data: {
          scheduledPostId: postId,
          type: 'SUCCESS',
          message: 'Successfully posted to X',
          // data: { externalId: tweetResponse.id },
        },
      })

    } catch (error) {
      // Update post with error
      await prisma.scheduledPost.update({
        where: { id: postId },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      // Add failure event
      await prisma.postEvent.create({
        data: {
          scheduledPostId: postId,
          type: 'FAILURE',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      throw error
    }
  },
}
