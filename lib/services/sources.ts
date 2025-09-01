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

  async addBatch(userId: string, names: string[]): Promise<SourceItem[]> {
    const results = await prisma.$transaction(async (tx) => {
      const added = []
      for (const nameRaw of names) {
        const name = nameRaw.replace(/^r\//, '').trim().toLowerCase()
        if (!name) continue
        
        // Check if user already has this subreddit
        const existing = await tx.userSubreddit.findFirst({
          where: {
            userId,
            subreddit: { name }
          }
        })
        
        if (existing) continue // Skip if already exists
        
        const subreddit = await tx.subreddit.upsert({
          where: { name },
          update: {},
          create: { name },
        })
        
        const userSubreddit = await tx.userSubreddit.create({
          data: {
            userId,
            subredditId: subreddit.id,
            isEnabled: true,
            priority: 0
          },
          include: {
            subreddit: true
          }
        })
        
        added.push({
          id: userSubreddit.id,
          name: userSubreddit.subreddit.name,
          title: userSubreddit.subreddit.title,
          nsfw: userSubreddit.subreddit.nsfw,
          isEnabled: userSubreddit.isEnabled,
          priority: userSubreddit.priority,
          lastUsedAt: userSubreddit.lastUsedAt,
          createdAt: userSubreddit.createdAt,
        })
      }
      return added
    })

    return results
  },

  async reorder(
    userId: string,
    items: Array<{ id: string; priority: number }>
  ): Promise<Array<{ id: string; subreddit: { name: string; title: string | null }; priority: number }>> {
    // First, verify all items belong to the user
    const userSubredditIds = items.map(item => item.id)
    const existingItems = await prisma.userSubreddit.findMany({
      where: {
        id: { in: userSubredditIds },
        userId,
      },
      select: { id: true },
    })

    if (existingItems.length !== userSubredditIds.length) {
      throw new ApiError(403, 'FORBIDDEN', 'One or more sources do not belong to the authenticated user')
    }

    // Update priorities in a transaction
    const updatedItems = await prisma.$transaction(async (tx) => {
      const updates = items.map(item =>
        tx.userSubreddit.update({
          where: { id: item.id },
          data: { priority: item.priority },
          include: {
            subreddit: {
              select: {
                name: true,
                title: true,
              },
            },
          },
        })
      )

      return Promise.all(updates)
    })

    // Return ordered by priority ASC, updatedAt DESC
    return updatedItems
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      })
      .map(item => ({
        id: item.id,
        subreddit: {
          name: item.subreddit.name,
          title: item.subreddit.title,
        },
        priority: item.priority,
      }))
  },
}
