import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

export default withAuth(
  function middleware(req: NextRequest) {
    const url = req.nextUrl
    const pathname = url.pathname

    // Allow public and onboarding routes
    if (pathname.startsWith('/onboarding') || pathname.startsWith('/api/onboarding/complete')) {
      return NextResponse.next()
    }

    // Only gate authenticated areas
    const token = (req as any).nextauth?.token
    if (!token) return NextResponse.next()

    // If cookie says onboarding completed, allow
    const cookie = req.cookies.get('onboarding_complete')
    if (cookie?.value === '1') {
      return NextResponse.next()
    }

    // Gate /dashboard and root path
    if (pathname === '/' || pathname.startsWith('/dashboard')) {
      // We cannot query DB here easily; rely on API to set cookie once user selects >=5.
      // Redirect to onboarding if cookie not set.
      const dest = new URL('/onboarding', req.url)
      return NextResponse.redirect(dest)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if ((req as any).nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/", "/dashboard/:path*", "/onboarding", "/api/onboarding/complete"],
}
