import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    const { schedule, isOpen24_7 } = await request.json()
    const { clubId } = params

    // Vérifier que le club existe
    const club = await prisma.clubProfileV2.findUnique({
      where: { id: clubId },
      include: { services: true }
    })

    if (!club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      )
    }

    // Mettre à jour ou créer les services
    if (club.services) {
      await prisma.clubServices.update({
        where: { clubId },
        data: {
          openingHours: schedule,
          isOpen24_7
        }
      })
    } else {
      await prisma.clubServices.create({
        data: {
          clubId,
          openingHours: schedule,
          isOpen24_7
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Horaires mis à jour avec succès'
    })
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}
