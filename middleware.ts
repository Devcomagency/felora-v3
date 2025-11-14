import createMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Matcher pour toutes les routes sauf API, _next, fichiers statiques
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
