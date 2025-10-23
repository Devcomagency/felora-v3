import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/escort/my-clubs
 * Récupérer la liste des clubs auxquels l'escort est liée
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Récupérer le profil escort de l'utilisateur
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!escortProfile) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    console.log('[API MY-CLUBS] Escort profile ID:', escortProfile.id)

    // Récupérer toutes les liaisons actives pour cette escort
    const links = await prisma.clubEscortLink.findMany({
      where: { escortId: escortProfile.id },
      orderBy: { joinedAt: 'desc' }
    })

    console.log('[API MY-CLUBS] Found links:', links.length)
    console.log('[API MY-CLUBS] Links details:', JSON.stringify(links, null, 2))

    // DEBUG: Chercher tous les liens pour voir
    const allLinks = await prisma.clubEscortLink.findMany()
    console.log('[API MY-CLUBS] ALL LINKS IN DB:', JSON.stringify(allLinks, null, 2))

    if (links.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Récupérer les informations des clubs depuis clubProfileV2
    const clubIds = links.map(link => link.clubId)

    const clubsV2 = await prisma.clubProfileV2.findMany({
      where: {
        id: { in: clubIds }
      },
      select: {
        id: true,
        handle: true,
        companyName: true,
        details: {
          select: {
            name: true,
            avatarUrl: true
          }
        }
      }
    })

    console.log('[API MY-CLUBS] Found clubs:', clubsV2.length)

    // Formater les données avec linkId
    const clubsData = clubsV2.map(club => {
      const link = links.find(l => l.clubId === club.id)
      return {
        id: club.id,
        linkId: link?.id, // ID du lien pour la suppression
        handle: club.handle || club.companyName || 'club',
        name: club.details?.name || club.companyName || 'Club',
        avatar: club.details?.avatarUrl,
        joinedAt: link?.joinedAt
      }
    })

    return NextResponse.json({
      success: true,
      data: clubsData
    })
  } catch (error) {
    console.error('[API] Error fetching escort clubs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch escort clubs' },
      { status: 500 }
    )
  }
}
