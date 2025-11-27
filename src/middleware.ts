import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 🔒 MIDDLEWARE GLOBAL DE SÉCURITÉ
 *
 * Gère :
 * - Protection par mot de passe temporaire (SITE_PASSWORD)
 * - Mode maintenance (MAINTENANCE_MODE)
 * - Blocage d'IPs bannies (BANNED_IPS)
 * - Protection des routes debug/test en production
 */

// IPs bannies (peut être dans une DB en production)
const getBannedIPs = (): string[] => {
  const bannedIpsEnv = process.env.BANNED_IPS || ''
  return bannedIpsEnv.split(',').filter(Boolean)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1️⃣ VÉRIFIER LE MODE MAINTENANCE
  if (process.env.MAINTENANCE_MODE === 'true') {
    // Autoriser seulement /maintenance et /api/health
    if (!pathname.startsWith('/maintenance') && pathname !== '/api/health') {
      const url = request.nextUrl.clone()
      url.pathname = '/maintenance'
      return NextResponse.redirect(url)
    }
  }

  // 2️⃣ VÉRIFIER LES IPs BANNIES
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                    request.headers.get('x-real-ip') ||
                    'unknown'

  const bannedIPs = getBannedIPs()
  if (bannedIPs.includes(clientIp)) {
    console.warn(`[SECURITY] 🚫 Blocked banned IP: ${clientIp}`)
    return new NextResponse('Access Denied', { status: 403 })
  }

  // 3️⃣ BLOQUER LES ROUTES DEBUG/TEST EN PRODUCTION
  if (process.env.NODE_ENV === 'production') {
    const debugPaths = ['/debug-db', '/test-', '/dev-']

    if (debugPaths.some(path => pathname.includes(path))) {
      console.warn(`[SECURITY] 🚫 Blocked access to debug route: ${pathname} from IP: ${clientIp}`)
      return new NextResponse('Not Found', { status: 404 })
    }
  }

  // 4️⃣ PROTECTION PAR MOT DE PASSE TEMPORAIRE
  const SITE_PASSWORD = process.env.SITE_PASSWORD

  // Si pas de mot de passe défini, on laisse passer
  if (!SITE_PASSWORD) {
    return NextResponse.next()
  }

  // Vérifier si l'utilisateur a déjà entré le bon mot de passe
  const authCookie = request.cookies.get('site-auth')?.value

  // Si le cookie existe et correspond au mot de passe, laisser passer
  if (authCookie === SITE_PASSWORD) {
    return NextResponse.next()
  }

  // Si on est sur la page de login, laisser passer
  if (pathname === '/auth-check') {
    return NextResponse.next()
  }

  // Sinon, rediriger vers la page de mot de passe
  const url = request.nextUrl.clone()
  url.pathname = '/auth-check'
  url.searchParams.set('redirect', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/((?!api|_next|_next/static|_next/image|_next/webpack-hmr|favicon.ico|auth-check|camera).*)',
  ],
}