// // // import { prisma } from "../db"
// import { ApiError } from '../errors'
// import type { SocialAccountSummary } from '../../types/api'

// This service is temporarily disabled as we're not using Prisma in the frontend
// TODO: Re-implement using backend API calls

export const accounts = {
  async listForUser(userId: string): Promise<any[]> {
    // TODO: Implement using backend API
    return []
  },

  async deleteForUser(userId: string, accountId: string): Promise<void> {
    // TODO: Implement using backend API
  },
}
