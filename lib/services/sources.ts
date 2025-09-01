import { prisma } from '../db'
import { ApiError } from '../errors'
import type { SourceItem } from '../../types/api'
import type { PaginationMeta } from '../pagination'

export const sources = {
  async listForUser(
    userId: string,
    pagination: { offset: number; limit: number }
  ): Promise<{ items: SourceItem[]; meta: PaginationMeta }> {
    const [items, total] = await Promise.all([
      prisma.userSubreddit.findMany({
        where: { userId },
        include: {
          subreddit: true,
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: pagination.offset,
        take: pagination.limit,
      }),
      prisma.userSubreddit.count({
        where: { userId },
      }),
    ])

    const sourceItems: SourceItem[] = items.map(item => ({
      id: item.id,
      name: item.subreddit.name,
      title: item.subreddit.title,
      nsfw: item.subreddit.nsfw,
      isEnabled: item.isEnabled,
      priority: item.priority,
      lastUsedAt: item.lastUsedAt,
      createdAt: item.createdAt,
    }))

    return {
      items: sourceItems,
      meta: {
        total,
        offset: pagination.offset,
        limit: pagination.limit,
      },
    }
  },

  async add(userId: string, name: string, priority: number = 0): Promise<SourceItem> {
    // First, ensure the subreddit exists
    const subreddit = await prisma.subreddit.upsert({
      where: { name },
      update: {},
      create: {
        name,
        title: null,
        nsfw: false,
      },
    })

    // Then create or update the user's relationship with the subreddit
    const userSubreddit = await prisma.userSubreddit.upsert({
      where: {
        userId_subredditId: {
          userId,
          subredditId: subreddit.id,
        },
      },
      update: {
        isEnabled: true,
        priority,
      },
      create: {
        userId,
        subredditId: subreddit.id,
        isEnabled: true,
        priority,
      },
      include: {
        subreddit: true,
      },
    })

    return {
      id: userSubreddit.id,
      name: userSubreddit.subreddit.name,
      title: userSubreddit.subreddit.title,
      nsfw: userSubreddit.subreddit.nsfw,
      isEnabled: userSubreddit.isEnabled,
      priority: userSubreddit.priority,
      lastUsedAt: userSubreddit.lastUsedAt,
      createdAt: userSubreddit.createdAt,
    }
  },

  async remove(userId: string, id: string): Promise<void> {
    const userSubreddit = await prisma.userSubreddit.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!userSubreddit) {
      throw new ApiError(404, 'NOT_FOUND', 'Source not found')
    }

    await prisma.userSubreddit.delete({
      where: { id },
    })
  },
}
