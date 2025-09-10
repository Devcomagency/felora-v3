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

    // Récupérer les services du club
    const club = await prisma.clubProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        languages: true,
        paymentMethods: true,
        services: true
      }
    })

    if (!club) {
      return NextResponse.json(
        { success: false, error: 'Club non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      services: {
        languages: Array.isArray(club.languages) ? club.languages : [],
        paymentMethods: Array.isArray(club.paymentMethods) ? club.paymentMethods : [],
        services: Array.isArray(club.services) ? club.services : []
      }
    })

  } catch (error) {
    console.error('Erreur récupération services club:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}