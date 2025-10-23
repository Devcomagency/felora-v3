import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/club-escort-links/[linkId]
 * Retirer une liaison (par le club ou par l'escort)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { linkId } = params

    // Récupérer la liaison
    const link = await prisma.clubEscortLink.findUnique({
      where: { id: linkId }
    })

    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est soit le club, soit l'escort
    // Vérifier dans clubProfileV2
    const clubProfileV2 = await prisma.clubProfileV2.findUnique({
      where: { userId: session.user.id }
    })

    // Fallback sur l'ancienne table
    const clubProfile = !clubProfileV2 ? await prisma.clubProfile.findUnique({
      where: { userId: session.user.id }
    }) : null

    // Vérifier si l'utilisateur est le club
    const isClub = (clubProfileV2 && clubProfileV2.id === link.clubId) ||
                   (clubProfile && clubProfile.id === link.clubId)

    // Vérifier si l'utilisateur est l'escort (en cherchant le profil escort)
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id }
    })
    const isEscort = escortProfile && escortProfile.id === link.escortId

    console.log('[API DELETE LINK] User:', session.user.id)
    console.log('[API DELETE LINK] ClubV2:', clubProfileV2?.id, 'Link clubId:', link.clubId, 'isClub:', isClub)
    console.log('[API DELETE LINK] Escort:', escortProfile?.id, 'Link escortId:', link.escortId, 'isEscort:', isEscort)

    if (!isClub && !isEscort) {
      return NextResponse.json(
        { success: false, error: 'Only the club or the escort can remove this link' },
        { status: 403 }
      )
    }

    // Supprimer la liaison
    await prisma.clubEscortLink.delete({
      where: { id: linkId }
    })

    // TODO: Envoyer une notification à l'autre partie

    return NextResponse.json({
      success: true,
      message: 'Link removed successfully'
    })
  } catch (error) {
    console.error('[API] Error deleting link:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete link' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/club-escort-links/[linkId]
 * Mettre à jour la position d'une escort dans la liste (seulement par le club)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { linkId } = params
    const { position } = await req.json()

    if (typeof position !== 'number' || position < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid position' },
        { status: 400 }
      )
    }

    // Récupérer la liaison
    const link = await prisma.clubEscortLink.findUnique({
      where: { id: linkId }
    })

    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est le club
    const clubProfile = await prisma.clubProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!clubProfile || clubProfile.id !== link.clubId) {
      return NextResponse.json(
        { success: false, error: 'Only the club can update positions' },
        { status: 403 }
      )
    }

    // Mettre à jour la position
    const updated = await prisma.clubEscortLink.update({
      where: { id: linkId },
      data: { position }
    })

    return NextResponse.json({
      success: true,
      data: updated
    })
  } catch (error) {
    console.error('[API] Error updating link:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update link' },
      { status: 500 }
    )
  }
}
