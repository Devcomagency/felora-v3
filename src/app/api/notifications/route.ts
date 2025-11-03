import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer les notifications de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 })
    }

    // ✅ Exclure MESSAGE_RECEIVED de la cloche (uniquement sur le badge Messages)
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        type: { not: 'MESSAGE_RECEIVED' } // Exclure les notifs de messages
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limiter à 50 notifications max
    })

    // Compter les non-lues (sans MESSAGE_RECEIVED)
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
        type: { not: 'MESSAGE_RECEIVED' } // Exclure les notifs de messages
      }
    })

    return NextResponse.json({
      success: true,
      notifications: notifications.map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString()
      })),
      unreadCount
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des notifications'
    }, { status: 500 })
  }
}

// PATCH - Marquer une notification comme lue
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 })
    }

    const { notificationId, markAllAsRead } = await request.json()

    if (markAllAsRead) {
      // Marquer toutes les notifications comme lues
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false
        },
        data: { read: true }
      })

      return NextResponse.json({
        success: true,
        message: 'Toutes les notifications ont été marquées comme lues'
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
    console.error('Error updating notification:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la mise à jour de la notification'
    }, { status: 500 })
  }
}
