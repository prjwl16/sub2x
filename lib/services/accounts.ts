import { prisma } from '../db'
import { ApiError } from '../errors'
import type { SocialAccountSummary } from '../../types/api'

export const accounts = {
  async listForUser(userId: string): Promise<SocialAccountSummary[]> {
    const accounts = await prisma.socialAccount.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        username: true,
        displayName: true,
        expiresAt: true,
      },
    })

    return accounts.map(account => ({
      ...account,
      provider: account.provider.toString(),
      expiresAt: account.expiresAt?.toISOString() || null,
    }))
  },

  async deleteForUser(userId: string, accountId: string): Promise<void> {
    const account = await prisma.socialAccount.findFirst({
      where: {
        id: accountId,
        userId,
      },
    })

    if (!account) {
      throw new ApiError(404, 'NOT_FOUND', 'Account not found')
    }

    await prisma.socialAccount.delete({
      where: { id: accountId },
    })
  },
}
