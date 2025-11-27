/**
 * 🔒 HELPERS D'AUTHENTIFICATION SERVEUR
 *
 * Utilitaires réutilisables pour protéger les API routes et Server Components
 * Permet d'éviter la duplication de code et les oublis de sécurité
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Vérifie que l'utilisateur est authentifié
 * @returns Session si authentifié, sinon lance une erreur ou renvoie null
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  return session
}

/**
 * Vérifie que l'utilisateur est admin
 * @returns Session si admin, sinon null
 */
export async function requireAdmin() {
  const session = await requireAuth()

  if (!session) {
    return null
  }

  // Vérifier le rôle admin
  if (session.user.role !== 'ADMIN') {
    return null
  }

  return session
}

/**
 * Wrapper pour protéger une API route avec authentification simple
 * Usage: export const GET = withAuth(async (req, session) => { ... })
 */
export function withAuth(
  handler: (request: NextRequest, session: NonNullable<Awaited<ReturnType<typeof requireAuth>>>) => Promise<Response | NextResponse>
) {
  return async (request: NextRequest) => {
    const session = await requireAuth()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    return handler(request, session)
  }
}

/**
 * Wrapper pour protéger une API route avec authentification admin
 * Usage: export const GET = withAdmin(async (req, session) => { ... })
 */
export function withAdmin(
  handler: (request: NextRequest, session: NonNullable<Awaited<ReturnType<typeof requireAdmin>>>) => Promise<Response | NextResponse>
) {
  return async (request: NextRequest) => {
    const session = await requireAdmin()

    if (!session) {
      // Vérifier si l'utilisateur est connecté mais pas admin
      const basicSession = await requireAuth()

      if (basicSession) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Admin access required' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    return handler(request, session)
  }
}

/**
 * Helper pour masquer les données sensibles dans les logs
 * @param data - Objet contenant potentiellement des données sensibles
 * @returns Objet avec données sensibles masquées
 */
export function sanitizeForLog(data: any): any {
  if (!data) return data

  const sanitized = { ...data }

  // Masquer les emails (garder seulement les 3 premiers caractères)
  if (sanitized.email && typeof sanitized.email === 'string') {
    const [local, domain] = sanitized.email.split('@')
    sanitized.email = `${local.slice(0, 3)}***@${domain}`
  }

  // Masquer les IDs (garder seulement les 8 premiers caractères)
  if (sanitized.id && typeof sanitized.id === 'string') {
    sanitized.id = `${sanitized.id.slice(0, 8)}...`
  }

  // Masquer les tokens
  if (sanitized.token) {
    sanitized.token = '[REDACTED]'
  }

  // Masquer les mots de passe
  if (sanitized.password || sanitized.passwordHash) {
    sanitized.password = '[REDACTED]'
    sanitized.passwordHash = '[REDACTED]'
  }

  return sanitized
}

/**
 * Vérifier si une origine est autorisée (pour CORS)
 * @param origin - Origine à vérifier
 * @returns true si autorisé
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false

  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    'https://felora.ch',
    'https://www.felora.ch',
    'https://felora-v3.vercel.app',
  ].filter(Boolean) as string[]

  // En dev, autoriser localhost
  if (process.env.NODE_ENV === 'development') {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return true
    }
  }

  return allowedOrigins.some(allowed => origin.startsWith(allowed))
}

/**
 * Headers CORS sécurisés
 * @param origin - Origine de la requête
 * @returns Headers CORS si origine autorisée
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  if (!isAllowedOrigin(origin)) {
    return {}
  }

  return {
    'Access-Control-Allow-Origin': origin || '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}
