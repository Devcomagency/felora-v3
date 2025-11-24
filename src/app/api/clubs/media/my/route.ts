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
    const club = await prisma.clubProfileV2.findUnique({
      where: { userId: session.user.id }
    })

    if (!club) {
      return NextResponse.json(
        { success: false, error: 'Profil club non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les médias du club depuis la table Media
    const media = await prisma.media.findMany({
      where: {
        ownerType: 'CLUB',
        ownerId: club.id
      },
      orderBy: [
        { pos: 'asc' },
        { createdAt: 'desc' } // Plus récent en premier pour chaque position
      ]
    })

    // Formater les médias pour correspondre au format attendu par le frontend
    const formattedMedia = media.map(item => ({
      id: item.id,
      pos: item.pos,
      type: item.type,
      url: item.url,
      thumbUrl: item.thumbUrl,
      visibility: item.visibility
    }))

    return NextResponse.json({
      success: true,
      items: formattedMedia,
      total: media.length
    })

  } catch (error) {
    console.error('Erreur récupération médias club:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}