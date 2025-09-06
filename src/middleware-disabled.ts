import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Get the pathname of the request (e.g. /, /protected)
    const { pathname } = req.nextUrl

    // Escort-only routes
    if (pathname.startsWith('/escort/dashboard')) {
      if (!req.nextauth.token || req.nextauth.token.role !== 'ESCORT') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Admin-only routes
    if (pathname.startsWith('/admin')) {
      if (!req.nextauth.token || req.nextauth.token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true // We handle authorization in the middleware function above
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next (ALL Next.js assets: css/js/hmr/images)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/webpack-hmr (dev HMR)
     * - favicon.ico (favicon file)
     * - auth (auth pages)
     * - legal (legal pages)
     * - search, map, messages, settings (now public)
     * - dashboard-test (test pages without auth)
     */
    // Exclude ALL API routes from middleware to avoid HTML redirects on JSON API calls
    // This prevents issues like "Unexpected token '<'" when APIs are called from the client.
    '/((?!api|_next|_next/static|_next/image|_next/webpack-hmr|favicon.ico|auth|legal|search|map|messages|settings|dashboard-test).*)',
  ],
}