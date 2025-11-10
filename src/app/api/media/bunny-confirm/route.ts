import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getBunnyVideoStatus, deleteBunnyVideo } from '@/lib/bunny'

/**
 * API pour confirmer l'upload Bunny et sauvegarder en DB
 *
 * Appelée après que le client a uploadé la vidéo vers Bunny
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

    console.log('🎬 Confirmation upload Bunny:', {
      videoId,
      userId: session.user.id
    })

    // Récupérer le statut de la vidéo Bunny avec retry
    let bunnyVideo
    let hlsUrl: string | null = null

    // Retry jusqu'à 5 fois (10 secondes max) pour obtenir la vidéo
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        bunnyVideo = await getBunnyVideoStatus(videoId)

        // Vérifier si la vidéo a échoué
        if (bunnyVideo.status === 'failed') {
          console.error(`❌ Bunny vidéo en erreur: ${videoId}`)

          // Supprimer la vidéo défaillante
          try {
            await deleteBunnyVideo(videoId)
            console.log(`🗑️ Vidéo Bunny défaillante supprimée: ${videoId}`)
          } catch (deleteError) {
            console.error('⚠️ Erreur suppression vidéo Bunny:', deleteError)
          }

          return NextResponse.json({
            error: 'Une erreur est survenue lors du traitement de la vidéo. Veuillez réessayer.',
            errorCode: 'BUNNY_ENCODING_ERROR'
          }, { status: 400 })
        }

        hlsUrl = bunnyVideo.hlsUrl

        if (hlsUrl) {
          console.log(`✅ HLS URL obtenue: ${hlsUrl}`)
          break
        }

        console.log(`⏳ Tentative ${attempt + 1}/5: vidéo en cours de traitement (status: ${bunnyVideo.status})`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.log(`⚠️ Tentative ${attempt + 1}/5: vidéo pas encore prête`)
        if (attempt < 4) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }

    // Créer les URLs (même si pas encore prêtes)
    // Si pas de HLS URL, on utilise une URL de placeholder qui sera mise à jour
    const playbackUrl = hlsUrl || `https://vz-538306.b-cdn.net/${videoId}/playlist.m3u8`
    const thumbnailUrl = bunnyVideo?.thumbnailUrl || null
    const videoStatus = bunnyVideo?.status || 'processing'

    console.log('📊 Statut vidéo Bunny:', {
      videoId,
      status: videoStatus,
      hasHlsUrl: !!hlsUrl,
      hasThumbnail: !!thumbnailUrl
    })

    // Déterminer le type de profil (escort ou club)
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

    // Sauvegarder en base
    const media = await prisma.media.create({
      data: {
        ownerType: ownerType as any,
        ownerId: ownerId,
        type: 'VIDEO',
        url: playbackUrl,
        thumbUrl: thumbnailUrl,
        description: description || null,
        visibility: visibilityEnum,
        price: visibility === 'premium' && price ? parseInt(price) : null,
        pos: 0,
        createdAt: new Date(),
        // Stocker le videoId Bunny pour référence
        externalId: videoId,
      }
    })

    console.log('💾 Vidéo Bunny sauvegardée en DB:', {
      mediaId: media.id,
      videoId,
      ownerType,
      ownerId
    })

    // Déterminer l'URL de redirection
    let redirectUrl = `/profile/${session.user.id}`
    if (clubProfile) {
      redirectUrl = `/profile-test/club/${clubProfile.handle}`
    } else if (escortProfile) {
      redirectUrl = `/profile/${escortProfile.id}`
    }

    // Si vidéo pas encore prête, retourner statut 202 pour que le frontend sache
    if (!hlsUrl) {
      return NextResponse.json({
        success: true,
        processing: true,
        message: 'Vidéo enregistrée, transcoding en cours...',
        media: {
          id: media.id,
          url: media.url,
          thumbUrl: media.thumbUrl,
          type: media.type,
        },
        redirectUrl,
        bunnyStatus: videoStatus
      }, { status: 202 }) // 202 Accepted
    }

    return NextResponse.json({
      success: true,
      media: {
        id: media.id,
        url: media.url,
        thumbUrl: media.thumbUrl,
        type: media.type,
      },
      redirectUrl,
      bunnyStatus: videoStatus
    })
  } catch (error: any) {
    console.error('❌ Erreur confirmation Bunny:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur confirmation'
    }, { status: 500 })
  }
}
