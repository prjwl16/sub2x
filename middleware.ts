import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Disable NextAuth enforcement to avoid redirecting to /api/auth/signin.
// The app now uses backend OAuth and client-side guards.
export default function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/:path*",
  ],
}
