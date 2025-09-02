// // import { prisma } from "../db"
import type { UsageSummary } from '../../types/api'

export const usage = {
  async getOrCreateCurrent(userId: string): Promise<UsageSummary> {
    // TODO: Re-implement using backend API instead of Prisma
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // const monthlyUsage = await prisma.monthlyUsage.upsert({
    //   where: {
    //     userId_year_month: {
    //       userId,
    //       year,
    //       month,
    //     },
    //   },
    //   update: {},
    //   create: {
    //     userId,
    //     year,
    //     month,
    //     postsAllotted: 100, // Default limit
    //     postsScheduled: 0,
    //     postsPosted: 0,
    //   },
    // })

    // return {
    //   postsAllotted: monthlyUsage.postsAllotted,
    //   postsScheduled: monthlyUsage.postsScheduled,
    //   postsPosted: monthlyUsage.postsPosted,
    // }

    // Temporary mock response until backend API is implemented
    console.log(`[usage] getOrCreateCurrent temporarily disabled - using backend API instead: ${userId}`)
    
    return {
      postsAllotted: 100, // Default limit
      postsScheduled: 0,
      postsPosted: 0,
    }
  },
}
