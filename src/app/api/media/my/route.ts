import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMediaService } from '../../../../../packages/core/services/media/index'
import type { MediaVisibility } from '../../../../../packages/core/services/media/MediaService'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ items: [] })
    
    const url = new URL(req.url)
    const visibility = (url.searchParams.get('visibility') || undefined) as MediaVisibility | undefined
    
    // Vérifier si l'utilisateur est un club ou escort
    const clubProfile = await prisma.clubProfileV2.findUnique({
      where: { userId }
    })

    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId }
    })

    let ownerType: 'CLUB' | 'ESCORT' = 'ESCORT'
    let ownerId = userId

    if (clubProfile) {
      ownerType = 'CLUB'
      ownerId = clubProfile.id
    } else if (escortProfile) {
      ownerType = 'ESCORT'
      ownerId = escortProfile.id
    }

    console.log(`🔍 Recherche médias: ownerType=${ownerType}, ownerId=${ownerId}`)

    // Récupérer les médias depuis la table Media (nouveau système)
    const mediaFromTable = await prisma.media.findMany({
      where: {
        ownerType: ownerType,
        ownerId: ownerId,
        ...(visibility && { visibility: visibility })
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Formater les médias pour correspondre au format attendu
    const items = mediaFromTable.map(media => ({
      id: media.id,
      url: media.url,
      type: media.type.toLowerCase(),
      visibility: media.visibility,
      pos: media.pos,
      createdAt: media.createdAt
    }))
    
    console.log(`📱 Médias récupérés pour utilisateur ${userId}:`, items.length, 'items')
    
    return NextResponse.json({ items })
  } catch (e: any) {
    console.error('Erreur récupération médias:', e)
    return NextResponse.json({ items: [], error: e?.message || 'server_error' }, { status: 200 })
  }
}

