import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les clubs avec leurs détails
    const clubs = await prisma.clubProfileV2.findMany({
      include: {
        user: {
          select: {
            email: true,
            lastLoginAt: true,
            bannedAt: true,
          }
        },
        details: true,
        services: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Compter le nombre d'escorts affiliés à chaque club
    const clubsWithEscortCount = await Promise.all(
      clubs.map(async (club) => {
        const escortCount = await prisma.clubEscortLink.count({
          where: { clubId: club.id }
        })
        return {
          ...club,
          escortCount
        }
      })
    )

    // Calculer les statistiques
    const stats = {
      totalClubs: clubs.length,
      activeClubs: clubs.filter(c => c.details?.isActive).length,
      verifiedClubs: clubs.filter(c => c.verified).length,
      totalEscorts: await prisma.clubEscortLink.count(),
      totalViews: clubs.reduce((sum, c) => sum + (c.details?.views || 0), 0),
    }

    return NextResponse.json({
      clubs: clubsWithEscortCount,
      stats
    })
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    )
  }
}
