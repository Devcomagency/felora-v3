import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { clubId: string; escortId: string } }
) {
  try {
    const { clubId, escortId } = params

    // Supprimer le lien
    await prisma.clubEscortLink.delete({
      where: {
        clubId_escortId: {
          clubId,
          escortId
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Escort retirée du club avec succès'
    })
  } catch (error) {
    console.error('Error removing escort from club:', error)
    return NextResponse.json(
      { error: 'Failed to remove escort' },
      { status: 500 }
    )
  }
}
