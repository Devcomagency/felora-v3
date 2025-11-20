import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * POST /api/e2ee/conversations/mark-opened
 * 🚀 Endpoint transactionnel unifié qui remplace 3 fetch séquentiels :
 * 1. Marque les messages comme lus (mark-read)
 * 2. Met à jour E2EEConversationRead.lastReadAt (conversation read)
 * 3. Marque les notifications MESSAGE_RECEIVED comme lues (mark-conversation-read)
 *
 * Avantages :
 * - 1 requête au lieu de 3
 * - Transaction atomique
 * - Performances améliorées
 * - Moins de risques de race conditions
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

    // 🚀 Exécuter toutes les opérations en une seule transaction Prisma
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date()

      // 1. Marquer les messages comme lus (E2EEMessage)
      const messagesUpdated = await tx.e2EEMessage.updateMany({
        where: {
          conversationId,
          senderId: { not: session.user.id }, // Seulement les messages reçus
          readAt: null // Non encore lus
        },
        data: {
          readAt: now
        }
      })

      // 2. Mettre à jour E2EEConversationRead.lastReadAt
      const conversationRead = await tx.e2EEConversationRead.upsert({
        where: {
          conversationId_userId: {
            conversationId,
            userId: session.user.id
          }
        },
        create: {
          conversationId,
          userId: session.user.id,
          lastReadAt: now
        },
        update: {
          lastReadAt: now
        }
      })

      // 3. Marquer les notifications MESSAGE_RECEIVED comme lues (filtre JSON direct)
      const notificationsUpdated = await tx.notification.updateMany({
        where: {
          userId: session.user.id,
          type: 'MESSAGE_RECEIVED',
          read: false,
          metadata: {
            path: ['conversationId'],
            equals: conversationId
          } as Prisma.JsonFilter
        },
        data: {
          read: true
        }
      })

      return {
        messagesMarkedRead: messagesUpdated.count,
        notificationsMarkedRead: notificationsUpdated.count,
        conversationRead: conversationRead.lastReadAt
      }
    })

    console.log('[MARK OPENED] ✅ Transaction réussie:', {
      conversationId,
      userId: session.user.id,
      ...result
    })

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('[ERROR] Erreur transaction mark-opened:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour'
    }, { status: 500 })
  }
}
