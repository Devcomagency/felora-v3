import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer le profil club
    const club = await prisma.club.findUnique({
      where: { ownerId: session.user.id },
      include: {
        owner: {
          select: {
            email: true,
            phone: true,
            name: true
          }
        }
      }
    })

    if (!club) {
      return NextResponse.json(
        { success: false, error: 'Profil club non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      club: club
    })

  } catch (error) {
    console.error('Erreur récupération profil club:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}