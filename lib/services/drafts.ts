// // import { prisma } from "../db"
import { ApiError } from '../errors'
import type { DraftItem } from '../../types/api'
import type { PaginationMeta } from '../pagination'

export const drafts = {
  async list(
    userId: string,
    filter: { status?: string | null },
    pagination: { offset: number; limit: number }
  ): Promise<{ items: DraftItem[]; meta: PaginationMeta }> {
    // TODO: Re-implement using backend API instead of Prisma
    try {
      // const where: any = { userId }
      // if (filter.status && filter.status !== null) {
      //   where.status = filter.status
      // }

      // const [items, total] = await Promise.all([
      //   prisma.draft.findMany({
      //     where,
      //     include: {
      //       sourceItem: {
      //         include: {
      //           subreddit: true,
      //         },
      //       },
      //     },
      //     orderBy: { createdAt: 'desc' },
      //     skip: pagination.offset,
      //     take: pagination.limit,
      //   }),
      //   prisma.draft.count({ where }),
      // ])

      // const draftItems: DraftItem[] = items.map(draft => ({
      //   id: draft.id,
      //   text: draft.text,
      //   status: draft.status,
      //   score: draft.score,
      //   createdAt: draft.createdAt.toISOString(),
      //   updatedAt: draft.updatedAt.toISOString(),
      //   sourceItem: draft.sourceItem ? {
      //     id: draft.sourceItem.id,
      //     title: draft.sourceItem.title,
      //     url: draft.sourceItem.url,
      //     subreddit: draft.sourceItem.subreddit ? {
      //       name: draft.sourceItem.subreddit.name,
      //     } : null,
      //   } : null,
      // }))

      // return {
      //   items: draftItems,
      //   meta: {
      //     total,
      //     offset: pagination.offset,
      //     limit: pagination.limit,
      //   },
      // }

      // Temporary mock response until backend API is implemented
      return {
        items: [],
        meta: {
          total: 0,
          offset: pagination.offset,
          limit: pagination.limit,
        },
      }
    } catch (error) {
      console.error('Error in drafts.list:', error)
      throw error
    }
  },

  async approve(userId: string, draftId: string): Promise<void> {
    // TODO: Re-implement using backend API instead of Prisma
    // const draft = await prisma.draft.findFirst({
    //   where: {
    //     id: draftId,
    //     userId,
    //   },
    // })

    // if (!draft) {
    //   throw new ApiError(404, 'NOT_FOUND', 'Draft not found')
    // }

    // if (draft.status === 'SCHEDULED' || draft.status === 'POSTED') {
    //   throw new ApiError(409, 'CONFLICT', 'Cannot approve draft that is already scheduled or posted')
    // }

    // await prisma.draft.update({
    //   where: { draftId },
    //   data: { status: 'APPROVED' },
    // })

    console.log(`[drafts] approve temporarily disabled - using backend API instead: ${userId}, ${draftId}`)
  },

  async reject(userId: string, draftId: string): Promise<void> {
    // TODO: Re-implement using backend API instead of Prisma
    // const draft = await prisma.draft.findFirst({
    //   where: {
    //     id: draftId,
    //     userId,
    //   },
    // })

    // if (!draft) {
    //   throw new ApiError(404, 'NOT_FOUND', 'Draft not found')
    // }

    // await prisma.draft.update({
    //   where: { draftId },
    //   data: { status: 'REJECTED' },
    // })

    console.log(`[drafts] reject temporarily disabled - using backend API instead: ${userId}, ${draftId}`)
  },
}
