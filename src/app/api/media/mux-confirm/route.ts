import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMuxAssetStatus } from '@/lib/mux'

/**
 * API pour confirmer l'upload Mux et sauvegarder en DB
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { uploadId, assetId, description, visibility, price, location } = body

    // Si on a un uploadId, récupérer l'upload pour obtenir l'assetId
    let finalAssetId = assetId

    if (!finalAssetId && uploadId) {
      const client = (await import('@/lib/mux')).getMuxClient()

      // Retry jusqu'à 3 fois avec délai car l'asset peut ne pas être créé immédiatement
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const upload = await client.Video.Uploads.get(uploadId)
          finalAssetId = upload.asset_id

          if (finalAssetId) break

          await new Promise(resolve => setTimeout(resolve, 2000))
        } catch (error: any) {
          if (attempt === 2) throw error
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }

    if (!finalAssetId) {
      return NextResponse.json({
        error: 'Asset Mux pas encore créé - réessayez dans quelques secondes'
      }, { status: 400 })
    }

    // Récupérer l'asset Mux et attendre qu'il soit prêt avec retry
    let muxAsset
    let playbackId: string | null = null

    // Retry jusqu'à 5 fois (10 secondes max) pour obtenir le playback ID
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        muxAsset = await getMuxAssetStatus(finalAssetId)

        // 🚨 Vérifier si Mux a retourné une erreur
        if (muxAsset.status === 'errored') {
          console.error(`❌ Mux asset en erreur: ${finalAssetId}`)

          // Supprimer l'asset Mux défaillant
          try {
            const client = (await import('@/lib/mux')).getMuxClient()
            await client.video.assets.delete(finalAssetId)
            console.log(`🗑️ Asset Mux défaillant supprimé: ${finalAssetId}`)
          } catch (deleteError) {
            console.error('⚠️ Erreur suppression asset Mux:', deleteError)
          }

          return NextResponse.json({
            error: '🎬 Format vidéo incompatible avec votre téléphone. Veuillez ré-enregistrer la vidéo ou essayer une autre vidéo de votre galerie.',
            errorCode: 'MUX_ENCODING_ERROR',
            tip: 'Les vidéos plus anciennes dans votre galerie fonctionnent souvent mieux'
          }, { status: 400 })
        }

        playbackId = muxAsset.playbackId || null

        if (playbackId) {
          console.log(`✅ Playback ID obtenu: ${playbackId}`)
          break
        }

        console.log(`⏳ Tentative ${attempt + 1}/5: playback ID pas encore disponible...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.log(`⚠️ Tentative ${attempt + 1}/5: asset pas encore prêt`)
        if (attempt < 4) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }

    if (!playbackId) {
      return NextResponse.json({
        error: 'Vidéo en cours de traitement par Mux. Réessayez dans 30 secondes.',
        assetId: finalAssetId
      }, { status: 202 }) // 202 Accepted
    }

    // Créer les URLs avec le vrai playback ID
    const playbackUrl = `https://stream.mux.com/${playbackId}.m3u8`
    const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&time=1`

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
        createdAt: new Date()
      }
    })


    // Déterminer l'URL de redirection
    let redirectUrl = `/profile/${session.user.id}`
    if (clubProfile) {
      redirectUrl = `/profile-test/club/${clubProfile.handle}`
    } else if (escortProfile) {
      redirectUrl = `/profile/${escortProfile.id}`
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
      muxStatus: muxAsset?.status || 'preparing'
    })
  } catch (error: any) {
    console.error('❌ Erreur confirmation Mux:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur confirmation'
    }, { status: 500 })
  }
}
