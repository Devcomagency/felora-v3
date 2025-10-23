import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/club-escort-invitations
 * Envoyer une invitation d'un club à une escort
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { escortId, message } = await req.json()

    if (!escortId) {
      return NextResponse.json(
        { success: false, error: 'Escort ID is required' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur est bien un club
    const clubProfile = await prisma.clubProfileV2.findUnique({
      where: { userId: session.user.id }
    })

    if (!clubProfile) {
      return NextResponse.json(
        { success: false, error: 'Only clubs can send invitations' },
        { status: 403 }
      )
    }

    // Vérifier que l'escort existe et récupérer son profil
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: escortId }
    })

    if (!escortProfile) {
      return NextResponse.json(
        { success: false, error: 'Escort not found' },
        { status: 404 }
      )
    }

    console.log('[API CREATE INVITATION] escortId (userId):', escortId)
    console.log('[API CREATE INVITATION] escortProfile.id:', escortProfile.id)

    // Vérifier qu'il n'y a pas déjà une invitation en cours
    const existingInvitation = await prisma.clubEscortInvitation.findUnique({
      where: {
        clubId_escortId: {
          clubId: clubProfile.id,
          escortId: escortProfile.id  // Utiliser l'ID du profil escort
        }
      }
    })

    if (existingInvitation) {
      if (existingInvitation.status === 'PENDING') {
        return NextResponse.json(
          { success: false, error: 'An invitation is already pending' },
          { status: 400 }
        )
      }

      // Si l'invitation existe mais n'est pas PENDING, la supprimer pour en créer une nouvelle
      if (existingInvitation.status !== 'PENDING') {
        await prisma.clubEscortInvitation.delete({
          where: { id: existingInvitation.id }
        })
      }
    }

    // Vérifier qu'il n'y a pas déjà une liaison active
    const existingLink = await prisma.clubEscortLink.findUnique({
      where: {
        clubId_escortId: {
          clubId: clubProfile.id,
          escortId: escortProfile.id  // Utiliser l'ID du profil escort
        }
      }
    })

    if (existingLink) {
      return NextResponse.json(
        { success: false, error: 'This escort is already linked to your club' },
        { status: 400 }
      )
    }

    // Créer l'invitation (expire dans 7 jours)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await prisma.clubEscortInvitation.create({
      data: {
        clubId: clubProfile.id,
        escortId: escortProfile.id,  // Utiliser l'ID du profil escort, pas le userId
        message: message || null,
        expiresAt: expiresAt
      }
    })

    // TODO: Envoyer une notification à l'escort

    return NextResponse.json({
      success: true,
      data: invitation
    })
  } catch (error) {
    console.error('[API] Error creating invitation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/club-escort-invitations
 * Récupérer les invitations (pour club ou escort selon le rôle)
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

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'sent' | 'received'

    // Vérifier si l'utilisateur est un club (V2 en priorité)
    const clubProfileV2 = await prisma.clubProfileV2.findUnique({
      where: { userId: session.user.id }
    })

    // Fallback sur l'ancienne table
    const clubProfile = !clubProfileV2 ? await prisma.clubProfile.findUnique({
      where: { userId: session.user.id }
    }) : null

    // Vérifier si l'utilisateur est une escort
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id }
    })

    let invitations: any[] = []

    const finalClubProfile = clubProfileV2 || clubProfile

    if (finalClubProfile && type === 'sent') {
      // Invitations envoyées par le club
      invitations = await prisma.clubEscortInvitation.findMany({
        where: { clubId: finalClubProfile.id },
        orderBy: { sentAt: 'desc' }
      })

      console.log('[CLUB INVITATIONS] Found invitations:', invitations.length)

      // Récupérer les infos des escorts
      const escortIds = invitations.map(inv => inv.escortId)
      console.log('[CLUB INVITATIONS] Escort IDs from invitations:', escortIds)

      const escorts = await prisma.escortProfile.findMany({
        where: { id: { in: escortIds } },
        select: {
          id: true,
          userId: true,
          stageName: true,
          profilePhoto: true,
          city: true,
          user: {
            select: {
              name: true,
              image: true
            }
          }
        }
      })

      console.log('[CLUB INVITATIONS] Escorts found:', escorts.length)
      console.log('[CLUB INVITATIONS] Escorts:', escorts.map(e => ({ id: e.id, stageName: e.stageName })))

      const escortsMap = new Map(escorts.map(e => [e.id, e]))

      invitations = invitations.map(inv => {
        const escort = escortsMap.get(inv.escortId)
        console.log('[CLUB INVITATIONS] Mapping invitation', inv.id, 'escortId:', inv.escortId, 'found:', !!escort)
        return {
          ...inv,
          escort: escort ? {
            id: escort.userId,
            name: escort.stageName || escort.user.name || 'Escort',
            avatar: escort.profilePhoto || escort.user.image,
            city: escort.city
          } : null
        }
      })

    } else if (escortProfile && type === 'received') {
      // Invitations reçues par l'escort - utiliser l'ID du profil escort
      invitations = await prisma.clubEscortInvitation.findMany({
        where: { escortId: escortProfile.id },  // Utiliser l'ID du profil escort
        orderBy: { sentAt: 'desc' }
      })

      console.log('[ESCORT INVITATIONS] Found invitations:', invitations.length)

      // Récupérer les infos des clubs (V2 en priorité)
      const clubIds = invitations.map(inv => inv.clubId)
      const clubsV2 = await prisma.clubProfileV2.findMany({
        where: { id: { in: clubIds } },
        select: {
          id: true,
          handle: true,
          companyName: true,
          details: {
            select: {
              name: true,
              avatarUrl: true
            }
          },
          user: {
            select: {
              name: true,
              image: true
            }
          }
        }
      })

      const clubsMap = new Map(clubsV2.map(c => [c.id, c]))

      invitations = invitations.map(inv => {
        const club = clubsMap.get(inv.clubId)
        console.log('[ESCORT INVITATIONS] Club found for', inv.clubId, ':', club)
        return {
          ...inv,
          club: club ? {
            id: club.id,
            name: club.details?.name || club.companyName || club.user.name || 'Mon Club',
            avatar: club.details?.avatarUrl || club.user.image,
            handle: club.handle || club.companyName
          } : null
        }
      })
      console.log('[ESCORT INVITATIONS] Final data:', invitations)
    }

    return NextResponse.json({
      success: true,
      data: invitations
    })
  } catch (error) {
    console.error('[API] Error fetching invitations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}
