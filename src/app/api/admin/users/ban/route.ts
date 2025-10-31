import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, action, reason } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({
        success: false,
        error: 'Paramètres manquants'
      }, { status: 400 })
    }

    if (action === 'ban') {
      // Bannir l'utilisateur
      await prisma.user.update({
        where: { id: userId },
        data: {
          bannedAt: new Date(),
          bannedReason: reason || 'Banni par un administrateur'
        }
      })

      // Envoyer une notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'ACCOUNT_BANNED',
          title: '🚫 Compte banni',
          message: `Votre compte a été banni. Raison: ${reason || 'Non spécifiée'}`,
          read: false
        }
      })

      return NextResponse.json({ success: true, message: 'Utilisateur banni' })
    } else if (action === 'unban') {
      // Débannir l'utilisateur
      await prisma.user.update({
        where: { id: userId },
        data: {
          bannedAt: null,
          bannedReason: null
        }
      })

      // Envoyer une notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'SYSTEM_ALERT',
          title: '✅ Compte rétabli',
          message: 'Votre compte a été rétabli. Vous pouvez à nouveau accéder à la plateforme.',
          read: false
        }
      })

      return NextResponse.json({ success: true, message: 'Utilisateur débanni' })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Action non reconnue'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Erreur ban/unban utilisateur:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'opération'
    }, { status: 500 })
  }
}
