import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * POST /api/admin/users/delete
 * Supprimer définitivement un compte utilisateur
 */
export async function POST(request: NextRequest) {
  // 🔐 SÉCURITÉ : Vérifier que l'utilisateur est admin
  const auth = await requireAdmin(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { userId, email, reason } = body

    console.log('[ADMIN DELETE USER] Demande de suppression:', { userId, email, reason })

    // Trouver l'utilisateur
    let user
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          escortProfile: true,
          escortProfileV2: true,
          clubProfile: true,
          clubProfileV2: true
        }
      })
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          escortProfile: true,
          escortProfileV2: true,
          clubProfile: true,
          clubProfileV2: true
        }
      })
    }

    if (!user) {
      console.log('[ADMIN DELETE USER] Utilisateur non trouvé')
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    console.log('[ADMIN DELETE USER] Utilisateur trouvé:', user.email)

    // Supprimer toutes les données associées
    const deleteOperations = []

    // 1. Supprimer les profils
    if (user.escortProfile) {
      deleteOperations.push(
        prisma.escortProfile.delete({ where: { id: user.escortProfile.id } })
      )
    }
    if (user.escortProfileV2) {
      deleteOperations.push(
        prisma.escortProfileV2.delete({ where: { id: user.escortProfileV2.id } })
      )
    }
    if (user.clubProfile) {
      deleteOperations.push(
        prisma.clubProfile.delete({ where: { id: user.clubProfile.id } })
      )
    }
    if (user.clubProfileV2) {
      deleteOperations.push(
        prisma.clubProfileV2.delete({ where: { id: user.clubProfileV2.id } })
      )
    }

    // 2. Supprimer les messages
    deleteOperations.push(
      prisma.message.deleteMany({ where: { OR: [{ senderId: user.id }, { receiverId: user.id }] } })
    )

    // 3. Supprimer les notifications
    deleteOperations.push(
      prisma.notification.deleteMany({ where: { userId: user.id } })
    )

    // 4. Supprimer les sessions
    deleteOperations.push(
      prisma.session.deleteMany({ where: { userId: user.id } })
    )

    // 5. Supprimer les accounts (OAuth)
    deleteOperations.push(
      prisma.account.deleteMany({ where: { userId: user.id } })
    )

    // 6. Supprimer les médias
    deleteOperations.push(
      prisma.media.deleteMany({ where: { ownerId: user.id } })
    )

    // 7. Supprimer les réactions
    deleteOperations.push(
      prisma.reaction.deleteMany({ where: { userId: user.id } })
    )

    // 8. Supprimer les signalements
    deleteOperations.push(
      prisma.report.deleteMany({ where: { reporterId: user.id } })
    )

    // Exécuter toutes les suppressions
    await Promise.all(deleteOperations)

    // 9. Supprimer l'utilisateur lui-même
    await prisma.user.delete({ where: { id: user.id } })

    console.log('[ADMIN DELETE USER] Compte supprimé avec succès:', user.email)

    // Logger l'action dans un système d'audit (optionnel)
    // await prisma.auditLog.create({
    //   data: {
    //     action: 'DELETE_USER',
    //     performedBy: session?.user?.id || 'unknown',
    //     targetUserId: user.id,
    //     reason: reason || 'No reason provided',
    //     timestamp: new Date()
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: `Compte ${user.email} supprimé définitivement`
    })
  } catch (error) {
    console.error('[ADMIN DELETE USER] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
