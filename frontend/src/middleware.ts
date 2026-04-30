/**
 * @file middleware.ts
 * @description Route protection middleware for Next.js 16.
 * Manually checks for the NextAuth session cookie and redirects
 * unauthenticated users away from /dashboard/* routes.
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionToken =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token")

  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard")

  if (isDashboard && !sessionToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
