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

    const userId = session.user.id

    // Récupérer les médias les plus populaires
    const topMedia = await prisma.media.findMany({
      where: {
        ownerType: 'escort',
        ownerId: userId
      },
      orderBy: [
        { likeCount: 'desc' },
        { reactCount: 'desc' }
      ],
      take: 5,
      select: {
        id: true,
        type: true,
        url: true,
        thumbUrl: true,
        likeCount: true,
        reactCount: true,
        price: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      topMedia
    })

  } catch (error) {
    console.error('Erreur récupération top media:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}