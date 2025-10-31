import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, message, type, link } = body

    // Validation
    if (!userId || !title || !message) {
      return NextResponse.json({
        success: false,
        error: 'userId, title et message sont requis'
      }, { status: 400 })
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur introuvable'
      }, { status: 404 })
    }

    // Mapper les types génériques vers les types Prisma
    const typeMap: Record<string, string> = {
      'INFO': 'SYSTEM_ALERT',
      'WARNING': 'SYSTEM_ALERT',
      'SUCCESS': 'SYSTEM_ALERT',
      'ERROR': 'SYSTEM_ALERT',
    }

    const notificationType = typeMap[type] || 'SYSTEM_ALERT'

    // Créer la notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: notificationType,
        title,
        message,
        link: link || null,
        read: false
      }
    })

    // TODO: Envoyer aussi un email si configuré
    // await sendEmail(user.email, title, message)

    // Log de l'action admin (à implémenter)
    // TODO: Créer log admin

    return NextResponse.json({
      success: true,
      notification
    })
  } catch (error) {
    console.error('Erreur envoi notification:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'envoi de la notification',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
