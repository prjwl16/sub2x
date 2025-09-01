import { prisma } from '../db'
import { ApiError } from '../errors'
import type { PostItem } from '../../types/api'
import type { PaginationMeta } from '../pagination'

export const posts = {
  async list(
    userId: string,
    filter: { status?: string; from?: string; to?: string },
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
        orderBy: { scheduledFor: 'desc' },
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
}
