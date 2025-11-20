import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

// Whitelist des domaines autorisés pour les liens
const ALLOWED_LINK_DOMAINS = [
  'felora.ch',
  'www.felora.ch',
  'app.felora.ch',
  'localhost',
  '127.0.0.1'
]

/**
 * Valide qu'un lien est sûr (même domaine ou whitelisté)
 */
function validateLink(link: string | null | undefined): string | null {
  if (!link) return null

  try {
    // Accepter les liens relatifs (commençant par /)
    if (link.startsWith('/')) {
      return link
    }

    // Vérifier les liens absolus
    const url = new URL(link)
    const hostname = url.hostname

    // Vérifier si le domaine est dans la whitelist
    const isAllowed = ALLOWED_LINK_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    )

    if (!isAllowed) {
      throw new Error(`Domaine non autorisé: ${hostname}`)
    }

    return link
  } catch (error) {
    console.error('[SECURITY] Lien invalide ou non autorisé:', link, error)
    return null
  }
}

/**
 * POST /api/notifications/send
 * Envoie une notification système à un utilisateur
 * 🔒 Réservé aux administrateurs uniquement
 */
export async function POST(request: NextRequest) {
  try {
    // 🔒 Vérifier l'authentification et le rôle admin
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 })
    }

    // Vérifier que l'utilisateur est admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      // 📝 Logger la tentative non autorisée
      console.warn('[SECURITY] Tentative non autorisée d\'envoi de notification:', {
        userId: session.user.id,
        email: session.user.email,
        role: adminUser?.role,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({
        success: false,
        error: 'Accès refusé : rôle administrateur requis'
      }, { status: 403 })
    }

    const body = await request.json()
    const { userId, title, message, type, link } = body

    // Validation des champs requis
    if (!userId || !title || !message) {
      return NextResponse.json({
        success: false,
        error: 'userId, title et message sont requis'
      }, { status: 400 })
    }

    // Vérifier que l'utilisateur destinataire existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    if (!targetUser) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur destinataire introuvable'
      }, { status: 404 })
    }

    // 🔒 Valider le lien si fourni
    const validatedLink = validateLink(link)
    if (link && !validatedLink) {
      return NextResponse.json({
        success: false,
        error: 'Lien non autorisé : seuls les liens internes ou domaines whitelistés sont acceptés'
      }, { status: 400 })
    }

    // Mapper les types génériques vers les types Prisma
    const typeMap: Record<string, NotificationType> = {
      'INFO': NotificationType.SYSTEM_ALERT,
      'WARNING': NotificationType.SYSTEM_ALERT,
      'SUCCESS': NotificationType.SYSTEM_ALERT,
      'ERROR': NotificationType.SYSTEM_ALERT,
    }

    const notificationType = typeMap[type] || NotificationType.SYSTEM_ALERT

    // Créer la notification
    const notification = await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: notificationType,
        title,
        message,
        link: validatedLink,
        read: false
      }
    })

    // 📝 Logger l'action admin
    console.info('[ADMIN ACTION] Notification envoyée:', {
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      targetUserId: targetUser.id,
      targetEmail: targetUser.email,
      notificationType,
      title,
      hasLink: !!validatedLink,
      timestamp: new Date().toISOString()
    })

    // TODO: Envoyer aussi un email si configuré
    // if (targetUser.emailNotifications) {
    //   await sendEmail(targetUser.email, title, message)
    // }

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        createdAt: notification.createdAt
      }
    })
  } catch (error) {
    console.error('[ERROR] Erreur envoi notification:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'envoi de la notification'
    }, { status: 500 })
  }
}
