import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

type ModerationAction = 'WARNING' | 'SUSPEND_3_DAYS' | 'SUSPEND_7_DAYS' | 'SUSPEND_30_DAYS' | 'BAN' | 'DISMISS'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[MODERATE REPORT] Starting moderation request')

    // Vérifier l'authentification admin via cookie
    const authError = await requireAdminAuth()
    if (authError) {
      console.log('[MODERATE REPORT] Auth failed')
      return authError
    }

    console.log('[MODERATE REPORT] Admin authenticated')

    const body = await request.json()
    console.log('[MODERATE REPORT] Request body:', body)

    const { action, adminMessage, notifyReporter, notifyReported } = body as {
      action: ModerationAction
      adminMessage?: string
      notifyReporter: boolean
      notifyReported: boolean
    }

    const resolvedParams = await params
    const reportId = resolvedParams.id
    console.log('[MODERATE REPORT] Report ID:', reportId)

    // Récupérer le signalement
    console.log('[MODERATE REPORT] Fetching report...')
    const report = await prisma.report.findUnique({
      where: { id: reportId }
    })
    console.log('[MODERATE REPORT] Report found:', report ? 'YES' : 'NO')

    if (!report) {
      return NextResponse.json({ success: false, error: 'Signalement introuvable' }, { status: 404 })
    }
    
    // Récupérer le signaleur si reporterId existe
    console.log('[MODERATE REPORT] Fetching reporter...')
    let reporter = null
    if (report.reporterId) {
      reporter = await prisma.user.findUnique({
        where: { id: report.reporterId },
        select: { id: true, name: true, email: true }
      })
      console.log('[MODERATE REPORT] Reporter found:', reporter ? 'YES' : 'NO')
    }

    // Récupérer la cible du signalement
    console.log('[MODERATE REPORT] Fetching target user, targetType:', report.targetType, 'targetId:', report.targetId)
    let targetUser: { id: string; name: string | null; email: string | null } | null = null

    if (report.targetType === 'escort') {
      console.log('[MODERATE REPORT] Searching escort profile...')
      const profile = await prisma.escortProfile.findUnique({
        where: { id: report.targetId },
        select: {
          userId: true,
          stageName: true,
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      })
      console.log('[MODERATE REPORT] Escort profile found:', profile ? 'YES' : 'NO')
      if (profile) {
        targetUser = {
          id: profile.userId,
          name: profile.stageName || profile.user.name,
          email: profile.user.email
        }
      }
    } else if (report.targetType === 'club') {
      console.log('[MODERATE REPORT] Searching club profile...')
      const clubProfile = await prisma.clubProfileV2.findUnique({
        where: { id: report.targetId },
        select: {
          userId: true,
          companyName: true,
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      })
      console.log('[MODERATE REPORT] Club profile found:', clubProfile ? 'YES' : 'NO')
      if (clubProfile) {
        targetUser = {
          id: clubProfile.userId,
          name: clubProfile.companyName || clubProfile.user.name,
          email: clubProfile.user.email
        }
      }
    } else if (report.targetType === 'conversation') {
      console.log('[MODERATE REPORT] Searching conversation to find other participant...')
      // Pour les conversations, targetId est l'ID de la conversation
      // Il faut trouver l'autre participant (pas le signaleur)
      const conversation = await prisma.e2EEConversation.findUnique({
        where: { id: report.targetId },
        select: { participants: true }
      })
      console.log('[MODERATE REPORT] Conversation found:', conversation ? 'YES' : 'NO')

      if (conversation) {
        if (reporter) {
          // Trouver l'autre participant (celui qui n'est pas le signaleur)
          const otherParticipantId = conversation.participants.find((id: string) => id !== reporter.id)
          console.log('[MODERATE REPORT] Other participant ID (avec reporter):', otherParticipantId)

          if (otherParticipantId) {
            targetUser = await prisma.user.findUnique({
              where: { id: otherParticipantId },
              select: { id: true, name: true, email: true }
            })
            console.log('[MODERATE REPORT] Other participant found:', targetUser ? 'YES' : 'NO')
          }
        } else {
          // Si pas de reporter (signalement anonyme ou depuis comportements suspects),
          // on prend le premier participant de la conversation
          console.log('[MODERATE REPORT] No reporter - using first participant from conversation')
          const participantId = conversation.participants[0]
          console.log('[MODERATE REPORT] Participant ID (sans reporter):', participantId)

          if (participantId) {
            targetUser = await prisma.user.findUnique({
              where: { id: participantId },
              select: { id: true, name: true, email: true }
            })
            console.log('[MODERATE REPORT] Participant found:', targetUser ? 'YES' : 'NO')
          }
        }
      }
    } else if (report.targetType === 'user') {
      console.log('[MODERATE REPORT] Searching user directly...')
      targetUser = await prisma.user.findUnique({
        where: { id: report.targetId },
        select: { id: true, name: true, email: true }
      })
      console.log('[MODERATE REPORT] User found:', targetUser ? 'YES' : 'NO')
    }

    console.log('[MODERATE REPORT] Target user resolved:', targetUser?.id || 'NULL')

    // Appliquer l'action de modération
    console.log('[MODERATE REPORT] Processing action:', action)
    let newStatus: 'RESOLVED' | 'DISMISSED' = 'RESOLVED'

    let isBanned = false
    let suspendedUntil: Date | null = null

    switch (action) {
      case 'WARNING':
        console.log('[MODERATE REPORT] Action: WARNING - no suspension')
        break
      case 'SUSPEND_3_DAYS':
        suspendedUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        console.log('[MODERATE REPORT] Action: SUSPEND_3_DAYS until', suspendedUntil)
        break
      case 'SUSPEND_7_DAYS':
        suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        console.log('[MODERATE REPORT] Action: SUSPEND_7_DAYS until', suspendedUntil)
        break
      case 'SUSPEND_30_DAYS':
        suspendedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        console.log('[MODERATE REPORT] Action: SUSPEND_30_DAYS until', suspendedUntil)
        break
      case 'BAN':
        isBanned = true
        console.log('[MODERATE REPORT] Action: BAN')
        break
      case 'DISMISS':
        newStatus = 'DISMISSED'
        console.log('[MODERATE REPORT] Action: DISMISS')
        break
    }

    // Mettre à jour le compte de l'utilisateur signalé si sanction
    if (targetUser && action !== 'DISMISS') {
      console.log('[MODERATE REPORT] Updating target user sanctions...')
      const updateData: any = {}

      if (isBanned) {
        updateData.bannedAt = new Date()
        updateData.bannedReason = report.reason || 'Non-respect des règles de la plateforme'
      }

      if (suspendedUntil) {
        updateData.suspendedUntil = suspendedUntil
        updateData.suspensionReason = report.reason || 'Non-respect des règles de la plateforme'
      }

      console.log('[MODERATE REPORT] Update data:', updateData)

      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: targetUser.id },
          data: updateData
        })
        console.log('[MODERATE REPORT] User sanctions updated')

        // Supprimer toutes les sessions de l'utilisateur pour le déconnecter immédiatement
        await prisma.session.deleteMany({
          where: { userId: targetUser.id }
        })
        console.log('[MODERATE REPORT] User sessions deleted (force logout)')
      }
    }

    // Mettre à jour le statut du signalement
    console.log('[MODERATE REPORT] Updating report status...')
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        actionTaken: adminMessage || undefined
      }
    })
    console.log('[MODERATE REPORT] Report status updated')

    // Créer les notifications
    console.log('[MODERATE REPORT] Creating notifications...')
    const notifications = []

    // Notification au signaleur
    if (notifyReporter && reporter) {
      console.log('[MODERATE REPORT] Creating reporter notification')

      let reporterMessage = ''
      if (action === 'DISMISS') {
        reporterMessage = 'Votre signalement a été examiné. Aucune sanction n\'a été appliquée car il a été jugé non fondé.'
      } else {
        const actionLabels: Record<string, string> = {
          'WARNING': 'un avertissement',
          'SUSPEND_3_DAYS': 'une suspension de 3 jours',
          'SUSPEND_7_DAYS': 'une suspension de 7 jours',
          'SUSPEND_30_DAYS': 'une suspension de 30 jours',
          'BAN': 'un bannissement définitif'
        }
        reporterMessage = `Votre signalement a été traité. L'utilisateur signalé a reçu ${actionLabels[action] || 'une sanction'}. Merci pour votre contribution à la sécurité de la plateforme.`
      }

      notifications.push(
        prisma.notification.create({
          data: {
            userId: reporter.id,
            type: 'SYSTEM_ALERT',
            title: '✅ Signalement traité',
            message: reporterMessage,
            link: '/messages'
          }
        })
      )
    }

    // Notification à l'utilisateur signalé
    if (notifyReported && targetUser && action !== 'DISMISS') {
      console.log('[MODERATE REPORT] Creating reported user notification')
      let sanctionMessage = ''
      let notifTitle = ''

      switch (action) {
        case 'WARNING':
          notifTitle = '⚠️ Avertissement'
          sanctionMessage = 'Vous avez reçu un avertissement suite à un signalement.\n\n⚠️ Veuillez respecter les règles de la plateforme pour éviter des sanctions plus sévères.'
          break
        case 'SUSPEND_3_DAYS':
        case 'SUSPEND_7_DAYS':
        case 'SUSPEND_30_DAYS':
          const days = action.includes('3') ? 3 : action.includes('7') ? 7 : 30
          notifTitle = `🚫 Suspension de ${days} jours`

          if (suspendedUntil) {
            const endDate = suspendedUntil.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
            sanctionMessage = `Votre compte a été suspendu pour ${days} jours suite à un signalement.\n\n📅 Fin de suspension : ${endDate}\n\n⚠️ Vous ne pourrez pas vous reconnecter avant cette date.`
          } else {
            sanctionMessage = `Votre compte a été suspendu pour ${days} jours suite à un signalement.`
          }
          break
        case 'BAN':
          notifTitle = '🚫 Compte banni définitivement'
          sanctionMessage = 'Votre compte a été banni définitivement suite à un signalement grave.\n\n❌ Vous ne pourrez plus accéder à la plateforme.'
          break
      }

      // Ajouter la raison si fournie
      if (adminMessage) {
        sanctionMessage += `\n\n📝 Raison : ${adminMessage}`
      } else if (report.reason) {
        const reasonLabel = report.reason.replace(/_/g, ' ').toLowerCase()
        sanctionMessage += `\n\n📝 Raison : ${reasonLabel}`
      }

      notifications.push(
        prisma.notification.create({
          data: {
            userId: targetUser.id,
            type: 'ACCOUNT_BANNED',
            title: notifTitle,
            message: sanctionMessage,
            link: null // Pas de lien pour forcer l'ouverture de la modal
          }
        })
      )
    }

    // Créer toutes les notifications
    if (notifications.length > 0) {
      console.log('[MODERATE REPORT] Executing', notifications.length, 'notification(s)')
      await Promise.all(notifications)
      console.log('[MODERATE REPORT] Notifications created successfully')
    } else {
      console.log('[MODERATE REPORT] No notifications to create')
    }

    console.log('[MODERATE REPORT] Moderation completed successfully')
    return NextResponse.json({
      success: true,
      action,
      sanctioned: action !== 'DISMISS',
      message: 'Action de modération appliquée avec succès'
    })

  } catch (error) {
    console.error('[MODERATE REPORT] ERROR:', error)
    console.error('[MODERATE REPORT] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('[MODERATE REPORT] Error message:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
