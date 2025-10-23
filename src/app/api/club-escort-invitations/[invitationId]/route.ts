import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/club-escort-invitations/[invitationId]
 * Accepter, refuser ou annuler une invitation
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { invitationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { invitationId } = params
    const { action } = await req.json() // 'accept' | 'decline' | 'cancel'

    if (!['accept', 'decline', 'cancel'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Récupérer l'invitation
    const invitation = await prisma.clubEscortInvitation.findUnique({
      where: { id: invitationId }
    })

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Vérifier que l'invitation n'est pas déjà traitée ou expirée
    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Invitation already processed' },
        { status: 400 }
      )
    }

    if (new Date() > invitation.expiresAt) {
      // Marquer comme expirée
      await prisma.clubEscortInvitation.update({
        where: { id: invitationId },
        data: { status: 'EXPIRED' }
      })
      return NextResponse.json(
        { success: false, error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Vérifier les permissions selon l'action
    if (action === 'cancel') {
      // Seul le club peut annuler
      const clubProfile = await prisma.clubProfileV2.findUnique({
        where: { userId: session.user.id }
      })

      if (!clubProfile || clubProfile.id !== invitation.clubId) {
        return NextResponse.json(
          { success: false, error: 'Only the club can cancel this invitation' },
          { status: 403 }
        )
      }

      // Annuler l'invitation
      const updated = await prisma.clubEscortInvitation.update({
        where: { id: invitationId },
        data: {
          status: 'CANCELLED',
          respondedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        data: updated
      })
    }

    if (action === 'accept' || action === 'decline') {
      // Seule l'escort peut accepter/refuser
      // Récupérer le profil escort de l'utilisateur connecté
      const escortProfile = await prisma.escortProfile.findUnique({
        where: { userId: session.user.id }
      })

      console.log('[API INVITATION] User ID:', session.user.id)
      console.log('[API INVITATION] Escort profile found:', escortProfile?.id)
      console.log('[API INVITATION] Invitation escortId:', invitation.escortId)
      console.log('[API INVITATION] Match:', escortProfile?.id === invitation.escortId)

      if (!escortProfile || escortProfile.id !== invitation.escortId) {
        return NextResponse.json(
          { success: false, error: 'Only the escort can respond to this invitation' },
          { status: 403 }
        )
      }

      if (action === 'accept') {
        // Accepter l'invitation = créer une liaison avec l'escort ID actuel
        const link = await prisma.clubEscortLink.create({
          data: {
            clubId: invitation.clubId,
            escortId: escortProfile.id  // Utiliser l'ID du profil escort actuel
          }
        })

        // Mettre à jour le statut de l'invitation
        const updated = await prisma.clubEscortInvitation.update({
          where: { id: invitationId },
          data: {
            status: 'ACCEPTED',
            respondedAt: new Date()
          }
        })

        // TODO: Envoyer une notification au club

        return NextResponse.json({
          success: true,
          data: {
            invitation: updated,
            link: link
          }
        })
      }

      if (action === 'decline') {
        // Refuser l'invitation
        const updated = await prisma.clubEscortInvitation.update({
          where: { id: invitationId },
          data: {
            status: 'DECLINED',
            respondedAt: new Date()
          }
        })

        // TODO: Envoyer une notification au club

        return NextResponse.json({
          success: true,
          data: updated
        })
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[API] Error processing invitation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process invitation' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/club-escort-invitations/[invitationId]
 * Supprimer une invitation (seulement si PENDING et par le club)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { invitationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { invitationId } = params

    // Récupérer l'invitation
    const invitation = await prisma.clubEscortInvitation.findUnique({
      where: { id: invitationId }
    })

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est le club qui a envoyé l'invitation
    const clubProfile = await prisma.clubProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!clubProfile || clubProfile.id !== invitation.clubId) {
      return NextResponse.json(
        { success: false, error: 'Only the club can delete this invitation' },
        { status: 403 }
      )
    }

    // Supprimer l'invitation
    await prisma.clubEscortInvitation.delete({
      where: { id: invitationId }
    })

    return NextResponse.json({
      success: true,
      message: 'Invitation deleted'
    })
  } catch (error) {
    console.error('[API] Error deleting invitation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete invitation' },
      { status: 500 }
    )
  }
}
