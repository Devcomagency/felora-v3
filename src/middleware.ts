// TEMPORARILY DISABLED FOR VERCEL TESTING
// The NextAuth middleware was causing 404 errors on all pages
// This is likely because NEXTAUTH_SECRET and other auth env vars are missing on Vercel

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Temporarily allow all requests to pass through
  // TODO: Re-enable auth middleware once environment variables are configured
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next|_next/static|_next/image|_next/webpack-hmr|favicon.ico).*)',
  ],
}