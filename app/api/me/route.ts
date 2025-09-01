import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/guards'
import { errorToResponse } from '@/lib/errors'
import { UpdateMeSchema } from '@/lib/zod-schemas'
import { prisma } from '@/lib/db'
import type { ApiSuccess, MeResponse } from '@/types/api'

// GET /api/me - Get current user profile + connected X account + usage
export async function GET(): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        handle: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    // Get connected X account
    const account = await prisma.socialAccount.findFirst({
      where: {
        userId,
        provider: 'X',
      },
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        username: true,
        displayName: true,
        expiresAt: true,
      },
    })

    // Get current month usage
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    const usage = await prisma.monthlyUsage.findUnique({
      where: {
        userId_year_month: {
          userId,
          year,
          month,
        },
      },
      select: {
        postsAllotted: true,
        postsScheduled: true,
        postsPosted: true,
      },
    })

    const response: ApiSuccess<MeResponse> = {
      ok: true,
      data: {
        user,
        account: account ? {
          ...account,
          provider: account.provider.toString(),
        } : null,
        usage: usage || {
          postsAllotted: 100,
          postsScheduled: 0,
          postsPosted: 0,
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    return errorToResponse(error)
  }
}

// POST /api/me - Update user profile
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth()
    const body = await request.json()
    const validatedData = UpdateMeSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        handle: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const response: ApiSuccess<typeof updatedUser> = {
      ok: true,
      data: updatedUser,
    }

    return NextResponse.json(response)
  } catch (error) {
    return errorToResponse(error)
  }
}
