// // import { prisma } from "../db"
import { ApiError } from '../errors'
import type { PostEvent } from '../../types/api'
import type { PaginationMeta } from '../pagination'

export const events = {
  async listForPost(
    userId: string,
    postId: string,
    pagination: { offset: number; limit: number }
  ): Promise<{ items: PostEvent[]; meta: PaginationMeta }> {
    // TODO: Re-implement using backend API instead of Prisma
    // First verify the post belongs to the user
    // const post = await prisma.scheduledPost.findFirst({
    //   where: {
    //     id: postId,
    //     userId,
    //   },
    // })

    // if (!post) {
    //   throw new ApiError(404, 'NOT_FOUND', 'Post not found')
    // }

    // const [items, total] = await Promise.all([
    //   prisma.postEvent.findMany({
    //     where: { scheduledPostId: postId },
    //     orderBy: { createdAt: 'desc' },
    //     skip: pagination.offset,
    //     take: pagination.limit,
    //   }),
    //   prisma.postEvent.count({
    //     where: { scheduledPostId: postId },
    //   }),
    // ])

    // const eventItems: PostEvent[] = items.map(event => ({
    //   id: event.id,
    //   type: event.type.toString(),
    //   message: event.message,
    //   data: event.data,
    //   createdAt: event.createdAt.toISOString(),
    // }))

    // return {
    //   items: eventItems,
    //   meta: {
    //     total,
    //     offset: pagination.offset,
    //     limit: pagination.limit,
    //   },
    // }

    // Temporary mock response until backend API is implemented
    console.log(`[events] listForPost temporarily disabled - using backend API instead: ${userId}, ${postId}`)
    
    return {
      items: [],
      meta: {
        total: 0,
        offset: pagination.offset,
        limit: pagination.limit,
      },
    }
  },
}
