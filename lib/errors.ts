import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function errorToResponse(e: unknown): NextResponse {
  console.error('API Error:', e)

  if (e instanceof ApiError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: e.code,
          message: e.message,
          details: e.details,
        },
      },
      { status: e.status }
    )
  }

  // Handle Prisma errors
  if (e && typeof e === 'object' && 'code' in e) {
    const prismaError = e as any
    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'CONFLICT',
              message: 'Resource already exists',
              details: prismaError.meta,
            },
          },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Resource not found',
            },
          },
          { status: 404 }
        )
    }
  }

  // Generic error
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  )
}
