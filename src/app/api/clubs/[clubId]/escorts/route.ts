import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/clubs/[clubId]/escorts
 * Récupère la liste des escorts liées à un club
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params

    console.log('[API CLUB ESCORTS] Received clubId:', clubId)

    if (!clubId) {
      return NextResponse.json(
        { success: false, error: 'Club ID is required' },
        { status: 400 }
      )
    }

    // Récupérer toutes les liaisons actives pour ce club
    const links = await prisma.clubEscortLink.findMany({
      where: { clubId },
      orderBy: { position: 'asc' }
    })

    console.log('[API CLUB ESCORTS] Found links:', links.length)
    console.log('[API CLUB ESCORTS] Links data:', JSON.stringify(links, null, 2))

    if (links.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Récupérer les informations des escorts
    const escortIds = links.map(link => link.escortId)

    console.log('[API CLUB ESCORTS] Fetching escort profiles with IDs:', escortIds)

    const escorts = await prisma.escortProfile.findMany({
      where: {
        id: { in: escortIds }
      },
      select: {
        id: true,
        userId: true,
        stageName: true,
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

    console.log('[API CLUB ESCORTS] Found escorts:', escorts.length)
    console.log('[API CLUB ESCORTS] Escorts data:', JSON.stringify(escorts, null, 2))

    // Formater les données pour le frontend avec linkId
    const escortsData = escorts.map(escort => {
      const link = links.find(l => l.escortId === escort.id)
      return {
        id: escort.id, // ✅ ID du profil escort (pour la redirection vers /profile-test/escort/[id])
        userId: escort.userId, // ID utilisateur (si besoin)
        linkId: link?.id, // ID du lien pour la suppression
        name: escort.stageName || escort.user.name || 'Escort',
        avatar: escort.profilePhoto || escort.user.image,
        city: escort.city,
        verified: escort.isVerifiedBadge,
        premium: false, // TODO: Ajouter la logique premium si nécessaire
        joinedAt: link?.joinedAt
      }
    })

    return NextResponse.json({
      success: true,
      data: escortsData
    })
  } catch (error) {
    console.error('[API] Error fetching club escorts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch club escorts' },
      { status: 500 }
    )
  }
}
