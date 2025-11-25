import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * POST /api/notifications/mark-conversation-read
 * Marque toutes les notifications MESSAGE_RECEIVED d'une conversation comme lues
 * Optimisé avec requête JSON directe sans charger les notifications en mémoire
 */
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

    // 🚀 Charger les notifications MESSAGE_RECEIVED, puis filtrer par conversationId
    const allNotifs = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        type: 'MESSAGE_RECEIVED',
        read: false
      }
    })

    // Filtrer en mémoire par conversationId dans metadata
    const notifIdsToMark = allNotifs
      .filter((n: any) => n.metadata && (n.metadata as any).conversationId === conversationId)
      .map((n: any) => n.id)

    let result = { count: 0 }
    if (notifIdsToMark.length > 0) {
      result = await prisma.notification.updateMany({
        where: {
          id: { in: notifIdsToMark }
        },
        data: {
          read: true
        }
      })
    }

    // 🆕 Mettre à jour E2EEConversationRead.lastReadAt en parallèle
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

    console.log('[MARK NOTIF READ] ✅ Conversation:', conversationId, 'Notifications marquées:', result.count, 'User:', session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Notifications marquées comme lues',
      count: result.count
    })
  } catch (error) {
    console.error('[ERROR] Error marking conversation notifications as read:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour des notifications'
    }, { status: 500 })
  }
}
