import createMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'
import { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  // 🚨 FIX: Ne PAS appliquer next-intl aux routes API
  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.')
  ) {
    // Laisser passer les routes API et fichiers statiques sans redirection
    return
  }

  // Appliquer next-intl seulement aux pages
  return intlMiddleware(request)
}

export const config = {
  // Matcher pour toutes les routes
  matcher: ['/((?!_next|_vercel).*)']
}
