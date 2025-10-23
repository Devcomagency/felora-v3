import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/clubs/profile/me
 * Récupérer le profil du club connecté
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

    console.log('[API CLUB ME] User ID:', session.user.id)

    // Récupérer le profil club V2 de l'utilisateur avec détails
    const clubProfileV2 = await prisma.clubProfileV2.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true
          }
        },
        details: true
      }
    })

    console.log('[API CLUB ME] Found clubProfileV2:', clubProfileV2?.id, clubProfileV2?.handle)

    if (!clubProfileV2) {
      // Fallback sur l'ancienne table
      const clubProfile = await prisma.clubProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              role: true
            }
          }
        }
      })

      if (!clubProfile) {
        return NextResponse.json(
          { success: false, error: 'Club profile not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        club: clubProfile
      })
    }

    return NextResponse.json({
      success: true,
      club: {
        id: clubProfileV2.id,
        userId: clubProfileV2.userId,
        handle: clubProfileV2.handle,
        name: clubProfileV2.details?.name || clubProfileV2.companyName,
        description: clubProfileV2.details?.description,
        avatarUrl: clubProfileV2.details?.avatarUrl,
        coverUrl: clubProfileV2.details?.coverUrl,
        user: clubProfileV2.user
      }
    })
  } catch (error) {
    console.error('[API] Error fetching club profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch club profile' },
      { status: 500 }
    )
  }
}
