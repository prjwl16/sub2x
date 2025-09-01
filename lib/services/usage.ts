import { prisma } from '../db'
import type { UsageSummary } from '../../types/api'

export const usage = {
  async getOrCreateCurrent(userId: string): Promise<UsageSummary> {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    const monthlyUsage = await prisma.monthlyUsage.upsert({
      where: {
        userId_year_month: {
          userId,
          year,
          month,
        },
      },
      update: {},
      create: {
        userId,
        year,
        month,
        postsAllotted: 100, // Default limit
        postsScheduled: 0,
        postsPosted: 0,
      },
    })

    return {
      postsAllotted: monthlyUsage.postsAllotted,
      postsScheduled: monthlyUsage.postsScheduled,
      postsPosted: monthlyUsage.postsPosted,
    }
  },
}
