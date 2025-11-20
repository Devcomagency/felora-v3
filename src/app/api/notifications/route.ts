import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/notifications
 * Récupère les notifications de l'utilisateur connecté avec pagination cursor-based
 *
 * Query params:
 * - cursor: ID de la dernière notification (pour pagination)
 * - limit: Nombre de notifications à récupérer (défaut: 50, max: 100)
 * - channel: Filtrer par type (optionnel, ex: "system" exclut MESSAGE_RECEIVED)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 })
    }

    // Récupérer les paramètres de pagination
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limitParam = searchParams.get('limit')
    const channel = searchParams.get('channel') // "system" | "messages" | null (all)

    // Valider et limiter le nombre de résultats
    const limit = Math.min(
      parseInt(limitParam || '50', 10),
      100 // Maximum 100 notifications par requête
    )

    // Construire les filtres
    const where: any = {
      userId: session.user.id
    }

    // Filtrer par channel
    if (channel === 'system') {
      // Exclure MESSAGE_RECEIVED de la cloche (uniquement sur le badge Messages)
      where.type = { not: 'MESSAGE_RECEIVED' }
    } else if (channel === 'messages') {
      // Uniquement les messages
      where.type = 'MESSAGE_RECEIVED'
    }
    // Si channel === null, on récupère tout

    // Cursor pagination
    if (cursor) {
      where.id = { lt: cursor } // Notifications plus anciennes que le cursor
    }

    // Récupérer les notifications avec pagination
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1 // +1 pour savoir s'il y a une page suivante
    })

    // Vérifier s'il y a une page suivante
    const hasNextPage = notifications.length > limit
    const items = hasNextPage ? notifications.slice(0, limit) : notifications
    const nextCursor = hasNextPage ? items[items.length - 1].id : null

    // Compter les non-lues (appliquer le même filtre channel)
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
        ...(channel === 'system' && { type: { not: 'MESSAGE_RECEIVED' } }),
        ...(channel === 'messages' && { type: 'MESSAGE_RECEIVED' })
      }
    })

    return NextResponse.json({
      success: true,
      notifications: items.map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString()
      })),
      unreadCount,
      pagination: {
        nextCursor,
        hasNextPage,
        limit
      }
    })
  } catch (error) {
    console.error('[ERROR] Error fetching notifications:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des notifications'
    }, { status: 500 })
  }
}

/**
 * PATCH /api/notifications
 * Marque une ou toutes les notifications comme lues
 *
 * Body:
 * - notificationId: ID de la notification à marquer (optionnel si markAllAsRead)
 * - markAllAsRead: boolean pour marquer toutes les notifications (optionnel)
 * - channel: "system" | "messages" (défaut: "system" pour markAllAsRead)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 })
    }

    const { notificationId, markAllAsRead, channel } = await request.json()

    if (markAllAsRead) {
      // 🔥 IMPORTANT : Par défaut, markAllAsRead ne touche QUE les notifications "system"
      // pour éviter de marquer les MESSAGE_RECEIVED qui sont gérés séparément
      const channelFilter = channel || 'system'

      const where: any = {
        userId: session.user.id,
        read: false
      }

      // Appliquer le filtre channel
      if (channelFilter === 'system') {
        where.type = { not: 'MESSAGE_RECEIVED' }
      } else if (channelFilter === 'messages') {
        where.type = 'MESSAGE_RECEIVED'
      }

      const result = await prisma.notification.updateMany({
        where,
        data: { read: true }
      })

      console.log('[NOTIFICATIONS] ✅ Mark all as read:', {
        userId: session.user.id,
        channel: channelFilter,
        count: result.count
      })

      return NextResponse.json({
        success: true,
        message: 'Toutes les notifications ont été marquées comme lues',
        count: result.count
      })
    }

    if (!notificationId) {
      return NextResponse.json({
        success: false,
        error: 'ID de notification requis'
      }, { status: 400 })
    }

    // Marquer une notification spécifique comme lue
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: session.user.id // Sécurité : vérifier que c'est bien la notification de l'utilisateur
      },
      data: { read: true }
    })

    if (notification.count === 0) {
      return NextResponse.json({
        success: false,
        error: 'Notification non trouvée'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marquée comme lue'
    })
  } catch (error) {
    console.error('[ERROR] Error updating notification:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour de la notification'
    }, { status: 500 })
  }
}
