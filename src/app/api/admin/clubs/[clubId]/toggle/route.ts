import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    const { isActive } = await request.json()
    const { clubId } = params

    // Vérifier que le club existe
    const club = await prisma.clubProfileV2.findUnique({
      where: { id: clubId },
      include: { details: true }
    })

    if (!club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      )
    }

    // Mettre à jour le statut dans ClubDetails
    if (club.details) {
      await prisma.clubDetails.update({
        where: { clubId: clubId },
        data: { isActive }
      })
    } else {
      // Si pas de détails, les créer
      await prisma.clubDetails.create({
        data: {
          clubId: clubId,
          isActive
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Club ${isActive ? 'activé' : 'désactivé'} avec succès`
    })
  } catch (error) {
    console.error('Error toggling club status:', error)
    return NextResponse.json(
      { error: 'Failed to update club status' },
      { status: 500 }
    )
  }
}
