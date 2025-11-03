import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 })
    }

    const { conversationId } = await request.json()

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'conversationId requis'
      }, { status: 400 })
    }

    // Récupérer toutes les notifications MESSAGE_RECEIVED non lues de l'utilisateur
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        type: 'MESSAGE_RECEIVED',
        read: false
      }
    })

    // Filtrer celles qui concernent cette conversation (via metadata JSON)
    const notificationIds = notifications
      .filter(notif => {
        try {
          if (!notif.metadata) return false
          const metadata = JSON.parse(notif.metadata)
          return metadata.conversationId === conversationId
        } catch {
          return false
        }
      })
      .map(n => n.id)

    console.log('[MARK NOTIF READ] Conversation:', conversationId, 'Notifications trouvées:', notificationIds.length)

    // Marquer les notifications comme lues
    if (notificationIds.length > 0) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds }
        },
        data: { read: true }
      })
    }

    // 🆕 Mettre à jour E2EEConversationRead.lastReadAt pour faire disparaître le badge
    await prisma.e2EEConversationRead.upsert({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id
        }
      },
      create: {
        conversationId,
        userId: session.user.id,
        lastReadAt: new Date()
      },
      update: {
        lastReadAt: new Date()
      }
    })

    console.log('[MARK NOTIF READ] ✅ lastReadAt mis à jour pour:', session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Notifications marquées comme lues',
      count: notificationIds.length
    })
  } catch (error) {
    console.error('Error marking conversation notifications as read:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour des notifications'
    }, { status: 500 })
  }
}
