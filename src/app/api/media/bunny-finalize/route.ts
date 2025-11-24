import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getBunnyVideoStatus } from '@/lib/bunny'

/**
 * API pour finaliser la sauvegarde d'une vidéo Bunny une fois prête
 *
 * Appelée par le frontend après polling quand la vidéo est ready
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { videoId, description, visibility, price, location } = body

    if (!videoId) {
      return NextResponse.json({
        error: 'videoId manquant'
      }, { status: 400 })
    }

    console.log('🎬 Finalisation vidéo Bunny:', {
      videoId,
      userId: session.user.id
    })

    // Vérifier le statut de la vidéo
    const bunnyVideo = await getBunnyVideoStatus(videoId)

    if (bunnyVideo.status !== 'ready' || !bunnyVideo.hlsUrl) {
      return NextResponse.json({
        error: 'Vidéo pas encore prête',
        status: bunnyVideo.status
      }, { status: 400 })
    }

    // Déterminer le type de profil
    let ownerType = 'ESCORT'
    let ownerId = session.user.id

    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id }
    })

    const clubProfile = await prisma.clubProfileV2.findUnique({
      where: { userId: session.user.id }
    })

    if (clubProfile) {
      ownerType = 'CLUB'
      ownerId = clubProfile.id
    } else if (escortProfile) {
      ownerType = 'ESCORT'
      ownerId = escortProfile.id
    }

    // Mapper la visibilité
    let visibilityEnum: 'PUBLIC' | 'PREMIUM' | 'PRIVATE' = 'PUBLIC'
    if (visibility === 'premium') visibilityEnum = 'PREMIUM'
    else if (visibility === 'private') visibilityEnum = 'PRIVATE'

    // Utiliser la position 1 pour les nouvelles publications (feed)
    // pos 0 = avatar dashboard (SEUL protégé), pos 1 = feed (tous les médias)
    // Tri par createdAt DESC dans pos 1 → les plus récents apparaissent en premier
    const newPos = 1

    console.log('📍 Position utilisée pour vidéo finalisée:', {
      newPos,
      ownerType,
      ownerId,
      note: 'Position 1 pour feed, tri par createdAt DESC'
    })

    // Vérifier si cette vidéo existe déjà (éviter doublons)
    const existingMedia = await prisma.media.findFirst({
      where: {
        externalId: videoId,
        ownerType: ownerType as any,
        ownerId: ownerId
      }
    })

    if (existingMedia) {
      console.log('⚠️ Vidéo déjà sauvegardée, retour média existant:', existingMedia.id)
      return NextResponse.json({
        success: true,
        media: {
          id: existingMedia.id,
          url: existingMedia.url,
          thumbUrl: existingMedia.thumbUrl,
          type: existingMedia.type,
        },
        alreadyExists: true
      })
    }

    // Sauvegarder en base
    const media = await prisma.media.create({
      data: {
        ownerType: ownerType as any,
        ownerId: ownerId,
        type: 'VIDEO',
        url: bunnyVideo.hlsUrl,
        thumbUrl: bunnyVideo.thumbnailUrl,
        description: description || null,
        visibility: visibilityEnum,
        price: visibility === 'premium' && price ? parseInt(price) : null,
        pos: newPos,
        createdAt: new Date(),
        externalId: videoId,
      }
    })

    console.log('💾 Vidéo Bunny finalisée:', {
      mediaId: media.id,
      videoId,
      ownerType,
      ownerId
    })

    return NextResponse.json({
      success: true,
      media: {
        id: media.id,
        url: media.url,
        thumbUrl: media.thumbUrl,
        type: media.type,
      }
    })

  } catch (error: any) {
    console.error('❌ Erreur finalisation Bunny:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur finalisation'
    }, { status: 500 })
  }
}
