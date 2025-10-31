import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    const body = await request.json()
    const { clubId } = params

    const {
      name,
      description,
      address,
      city,
      postalCode,
      phone,
      email,
      websiteUrl,
      capacity,
      establishmentType
    } = body

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

    // Mettre à jour ou créer les détails
    if (club.details) {
      await prisma.clubDetails.update({
        where: { clubId },
        data: {
          name,
          description,
          address,
          city,
          postalCode,
          phone,
          email,
          websiteUrl,
          capacity: capacity ? parseInt(capacity) : null,
          establishmentType
        }
      })
    } else {
      await prisma.clubDetails.create({
        data: {
          clubId,
          name,
          description,
          address,
          city,
          postalCode,
          phone,
          email,
          websiteUrl,
          capacity: capacity ? parseInt(capacity) : null,
          establishmentType
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Club mis à jour avec succès'
    })
  } catch (error) {
    console.error('Error updating club:', error)
    return NextResponse.json(
      { error: 'Failed to update club' },
      { status: 500 }
    )
  }
}
