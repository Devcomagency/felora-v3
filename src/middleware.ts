import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 🔒 PROTECTION PAR MOT DE PASSE TEMPORAIRE
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
  if (request.nextUrl.pathname === '/auth-check') {
    return NextResponse.next()
  }

  // Sinon, rediriger vers la page de mot de passe
  const url = request.nextUrl.clone()
  url.pathname = '/auth-check'
  url.searchParams.set('redirect', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/((?!api|_next|_next/static|_next/image|_next/webpack-hmr|favicon.ico|auth-check).*)',
  ],
}