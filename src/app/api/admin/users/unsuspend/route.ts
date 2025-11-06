import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    console.log('[UNSUSPEND] Starting unsuspend request')

    // Vérifier l'authentification admin
    const authError = await requireAdminAuth()
    if (authError) {
      console.log('[UNSUSPEND] Auth failed')
      return authError
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId requis' },
        { status: 400 }
      )
    }

    console.log('[UNSUSPEND] Removing suspension for user:', userId)

    // Supprimer la suspension et le bannissement
    await prisma.user.update({
      where: { id: userId },
      data: {
        suspendedUntil: null,
        suspensionReason: null,
        bannedAt: null,
        bannedReason: null
      }
    })

    console.log('[UNSUSPEND] Suspension removed successfully')

    // Créer une notification pour informer l'utilisateur
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'SYSTEM_ALERT',
        title: '✅ Suspension levée',
        message: 'Votre suspension a été levée par un administrateur.\n\n🔄 Veuillez vous déconnecter puis vous reconnecter pour accéder à votre compte.',
        link: null // Pas de lien pour ouvrir en modal
      }
    })

    console.log('[UNSUSPEND] Notification created')

    return NextResponse.json({
      success: true,
      message: 'Suspension levée avec succès'
    })

  } catch (error) {
    console.error('[UNSUSPEND] ERROR:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
