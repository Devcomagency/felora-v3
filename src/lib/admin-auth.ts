import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'

/**
 * 🔐 SÉCURITÉ : Middleware de vérification admin (nouvelle version sécurisée)
 * Vérifie que l'utilisateur est authentifié ET a le rôle ADMIN en base de données
 */
export async function requireAdmin(request?: NextRequest) {
  try {
    // 1. Vérifier la session NextAuth (source de vérité)
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.warn('[SECURITY] Admin access denied: No session')
      return {
        authorized: false,
        error: 'Non authentifié',
        status: 401
      }
    }

    // 2. Vérifier le rôle en base de données (CRITIQUE pour la sécurité)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        bannedAt: true,
        email: true
      }
    })

    if (!user) {
      console.warn(`[SECURITY] Admin access denied: User ${session.user.id} not found`)
      return {
        authorized: false,
        error: 'Utilisateur non trouvé',
        status: 404
      }
    }

    // 3. Vérifier que l'utilisateur n'est pas banni
    if (user.bannedAt) {
      console.warn(`[SECURITY] Admin access denied: User ${user.email} is banned`)
      return {
        authorized: false,
        error: 'Compte banni',
        status: 403
      }
    }

    // 4. Vérifier le rôle ADMIN
    if (user.role !== 'ADMIN') {
      console.warn(`[SECURITY] Admin access denied: User ${user.email} has role ${user.role} (expected ADMIN)`)
      return {
        authorized: false,
        error: 'Accès interdit - Rôle admin requis',
        status: 403
      }
    }

    // ✅ Tout est OK
    console.log(`[SECURITY] Admin access granted: ${user.email}`)
    return {
      authorized: true,
      user: {
        id: session.user.id,
        email: user.email,
        role: user.role
      }
    }

  } catch (error) {
    console.error('[SECURITY] Error in requireAdmin:', error)
    return {
      authorized: false,
      error: 'Erreur de vérification',
      status: 500
    }
  }
}

/**
 * 🔐 Vérifie que l'utilisateur peut modifier une ressource (propriétaire ou admin)
 */
export async function canModifyResource(userId: string, ownerId: string): Promise<boolean> {
  // Si c'est le propriétaire
  if (userId === ownerId) {
    return true
  }

  // Vérifier si c'est un admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  return user?.role === 'ADMIN'
}

/**
 * ⚠️ LEGACY - À NE PLUS UTILISER (conservé pour compatibilité)
 * Utilisez requireAdmin() à la place
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  console.warn('[DEPRECATED] isAdminAuthenticated() is deprecated. Use requireAdmin() instead.')
  const result = await requireAdmin()
  return result.authorized
}

/**
 * ⚠️ LEGACY - À NE PLUS UTILISER (conservé pour compatibilité)
 * Utilisez requireAdmin() à la place
 */
export async function requireAdminAuth() {
  console.warn('[DEPRECATED] requireAdminAuth() is deprecated. Use requireAdmin() instead.')
  const result = await requireAdmin()

  if (!result.authorized) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.status }
    )
  }

  return null
}
