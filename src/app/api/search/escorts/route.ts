import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/search/escorts
 * Rechercher des escorts par nom ou ville
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    const searchTerm = query.toLowerCase().trim()

    // Rechercher dans les profils d'escorts
    const escorts = await prisma.escortProfile.findMany({
      where: {
        OR: [
          {
            stageName: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            city: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            firstName: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ],
        status: 'ACTIVE', // Seulement les profils actifs
      },
      take: 20, // Limiter à 20 résultats
      select: {
        userId: true,
        stageName: true,
        firstName: true,
        profilePhoto: true,
        city: true,
        isVerifiedBadge: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Formater les résultats
    const results = escorts.map(escort => ({
      id: escort.userId,
      name: escort.stageName || escort.firstName || escort.user.name || 'Escort',
      avatar: escort.profilePhoto || escort.user.image,
      city: escort.city,
      verified: escort.isVerifiedBadge
    }))

    return NextResponse.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('[API] Error searching escorts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search escorts' },
      { status: 500 }
    )
  }
}
