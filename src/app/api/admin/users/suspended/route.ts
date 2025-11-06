import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('[SUSPENDED USERS] Fetching suspended users')

    // Vérifier l'authentification admin
    const authError = await requireAdminAuth()
    if (authError) {
      console.log('[SUSPENDED USERS] Auth failed')
      return authError
    }

    const now = new Date()

    // Récupérer tous les utilisateurs suspendus ou bannis
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            suspendedUntil: {
              gt: now // Suspendu et la suspension n'a pas expiré
            }
          },
          {
            bannedAt: {
              not: null // Banni
            }
          }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        suspendedUntil: true,
        suspensionReason: true,
        bannedAt: true,
        bannedReason: true
      },
      orderBy: [
        { bannedAt: 'desc' }, // Bannis en premier
        { suspendedUntil: 'desc' } // Puis suspendus par date décroissante
      ]
    })

    console.log('[SUSPENDED USERS] Found', users.length, 'suspended/banned users')

    return NextResponse.json({
      success: true,
      users
    })

  } catch (error) {
    console.error('[SUSPENDED USERS] ERROR:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
