import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { ApiError } from './errors'

export interface AuthUser {
  userId: string
  xUserId?: string
  handle?: string
}

export async function requireAuth(): Promise<AuthUser> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required')
  }

  return {
    userId: session.user.id,
    xUserId: (session.user as any).xUserId,
    handle: (session.user as any).handle,
  }
}
