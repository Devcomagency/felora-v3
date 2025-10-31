import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userIds, data } = body

    if (!action || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Action et userIds sont requis'
      }, { status: 400 })
    }

    let result: any = {}

    switch (action) {
      case 'BAN':
        const banReason = data?.reason || 'Banni par un administrateur'
        result = await prisma.user.updateMany({
          where: {
            id: { in: userIds },
            role: { not: 'ADMIN' } // Empêcher le bannissement d'admins
          },
          data: {
            bannedAt: new Date(),
            bannedReason: banReason
          }
        })
        break

      case 'UNBAN':
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: {
            bannedAt: null,
            bannedReason: null
          }
        })
        break

      case 'DELETE':
        result = await prisma.user.deleteMany({
          where: {
            id: { in: userIds },
            role: { not: 'ADMIN' } // Empêcher la suppression d'admins
          }
        })
        break

      case 'SEND_NOTIFICATION':
        const { title, message, type, link } = data || {}
        if (!title || !message) {
          return NextResponse.json({
            success: false,
            error: 'Title et message sont requis pour les notifications'
          }, { status: 400 })
        }

        // Mapper les types génériques vers les types Prisma
        const typeMap: Record<string, string> = {
          'INFO': 'SYSTEM_ALERT',
          'WARNING': 'SYSTEM_ALERT',
          'SUCCESS': 'SYSTEM_ALERT',
          'ERROR': 'SYSTEM_ALERT',
        }
        const notificationType = typeMap[type] || 'SYSTEM_ALERT'

        // Créer des notifications pour chaque utilisateur
        const notifications = userIds.map(userId => ({
          userId,
          type: notificationType,
          title,
          message,
          link: link || null,
          read: false
        }))

        result = await prisma.notification.createMany({
          data: notifications
        })
        break

      case 'SEND_EMAIL':
        // TODO: Implémenter l'envoi d'emails en masse via Resend
        // Pour l'instant, retourner succès
        result = { count: userIds.length }
        break

      default:
        return NextResponse.json({
          success: false,
          error: `Action inconnue: ${action}`
        }, { status: 400 })
    }

    // Log de l'action admin (à implémenter)
    // TODO: Créer logs admin pour traçabilité

    return NextResponse.json({
      success: true,
      action,
      count: result.count || userIds.length,
      message: `Action ${action} effectuée avec succès sur ${result.count || userIds.length} utilisateur(s)`
    })
  } catch (error) {
    console.error('Erreur action en masse:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'action en masse',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
