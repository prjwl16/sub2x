import { prisma } from '../db'
import { ApiError } from '../errors'
import type { DraftItem } from '../../types/api'
import type { PaginationMeta } from '../pagination'

export const drafts = {
  async list(
    userId: string,
    filter: { status?: string },
    pagination: { offset: number; limit: number }
  ): Promise<{ items: DraftItem[]; meta: PaginationMeta }> {
    const where: any = { userId }
    if (filter.status) {
      where.status = filter.status
    }

    const [items, total] = await Promise.all([
      prisma.draft.findMany({
        where,
        include: {
          sourceItem: {
            include: {
              subreddit: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.offset,
        take: pagination.limit,
      }),
      prisma.draft.count({ where }),
    ])

    const draftItems: DraftItem[] = items.map(draft => ({
      id: draft.id,
      text: draft.text,
      status: draft.status.toString(),
      score: draft.score,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      sourceItem: draft.sourceItem ? {
        id: draft.sourceItem.id,
        title: draft.sourceItem.title,
        url: draft.sourceItem.url,
        subreddit: draft.sourceItem.subreddit ? {
          name: draft.sourceItem.subreddit.name,
        } : null,
      } : null,
    }))

    return {
      items: draftItems,
      meta: {
        total,
        offset: pagination.offset,
        limit: pagination.limit,
      },
    }
  },

  async approve(userId: string, draftId: string): Promise<void> {
    const draft = await prisma.draft.findFirst({
      where: {
        id: draftId,
        userId,
      },
    })

    if (!draft) {
      throw new ApiError(404, 'NOT_FOUND', 'Draft not found')
    }

    if (draft.status === 'SCHEDULED' || draft.status === 'POSTED') {
      throw new ApiError(409, 'CONFLICT', 'Cannot approve draft that is already scheduled or posted')
    }

    await prisma.draft.update({
      where: { id: draftId },
      data: { status: 'APPROVED' },
    })
  },

  async reject(userId: string, draftId: string): Promise<void> {
    const draft = await prisma.draft.findFirst({
      where: {
        id: draftId,
        userId,
      },
    })

    if (!draft) {
      throw new ApiError(404, 'NOT_FOUND', 'Draft not found')
    }

    await prisma.draft.update({
      where: { id: draftId },
      data: { status: 'REJECTED' },
    })
  },
}
