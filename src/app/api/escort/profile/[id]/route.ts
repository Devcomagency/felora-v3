import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Récupérer le profil escort par ID
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    })

    if (!escortProfile) {
      return NextResponse.json(
        { success: false, error: 'Profil escorte non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(escortProfile)

  } catch (error) {
    console.error('Erreur récupération profil par ID:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}