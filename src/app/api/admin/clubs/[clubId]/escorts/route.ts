import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    const { clubId } = params

    // Récupérer les liens club-escort
    const links = await prisma.clubEscortLink.findMany({
      where: { clubId },
      include: {
        // On va récupérer les infos de l'escort via le userId
      }
    })

    // Récupérer les profils escorts
    const escorts = await Promise.all(
      links.map(async (link) => {
        const escort = await prisma.escortProfile.findUnique({
          where: { id: link.escortId },
          select: {
            id: true,
            stageName: true,
            profilePhoto: true,
            city: true,
            category: true,
            isVerifiedBadge: true,
            views: true,
            rating: true,
          }
        })

        if (!escort) return null

        return {
          ...escort,
          joinedAt: link.joinedAt.toISOString(),
        }
      })
    )

    // Filtrer les nulls (escorts supprimés)
    const validEscorts = escorts.filter(e => e !== null)

    return NextResponse.json({ escorts: validEscorts })
  } catch (error) {
    console.error('Error fetching club escorts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch escorts' },
      { status: 500 }
    )
  }
}
