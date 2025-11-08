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

    console.log('🎬 Confirmation upload Mux - uploadId:', uploadId, 'assetId:', assetId)

    // Si on a un uploadId, récupérer l'upload pour obtenir l'assetId
    let finalAssetId = assetId

    if (!finalAssetId && uploadId) {
      console.log('📡 Récupération de l\'upload Mux:', uploadId)
      const client = (await import('@/lib/mux')).getMuxClient()
      const upload = await client.Video.Uploads.retrieve(uploadId)
      finalAssetId = upload.asset_id
      console.log('✅ Asset ID récupéré depuis upload:', finalAssetId)
    }

    if (!finalAssetId) {
      return NextResponse.json({
        error: 'assetId ou uploadId manquant',
        debug: { hasUploadId: !!uploadId, hasAssetId: !!assetId }
      }, { status: 400 })
    }

    // Récupérer le statut de l'asset Mux
    const muxAsset = await getMuxAssetStatus(finalAssetId)

    console.log('📊 Statut asset Mux:', {
      assetId,
      status: muxAsset.status,
      hasPlaybackUrl: !!muxAsset.playbackUrl,
      playbackId: muxAsset.playbackId
    })

    // Créer une URL temporaire même si l'asset n'est pas prêt
    // L'URL sera valide une fois le traitement terminé
    const playbackUrl = muxAsset.playbackUrl || (muxAsset.playbackId ? `https://stream.mux.com/${muxAsset.playbackId}.m3u8` : null)
    const thumbnailUrl = muxAsset.thumbnailUrl || (muxAsset.playbackId ? `https://image.mux.com/${muxAsset.playbackId}/thumbnail.jpg?width=640&height=360&time=1` : null)

    if (!playbackUrl) {
      return NextResponse.json({
        error: 'Asset Mux pas encore disponible - playbackId manquant',
        status: muxAsset.status,
        debug: { assetId, muxStatus: muxAsset.status }
      }, { status: 400 })
    }

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

    console.log('💾 Vidéo Mux sauvegardée:', media.id)

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
      muxStatus: muxAsset.status
    })
  } catch (error: any) {
    console.error('❌ Erreur confirmation Mux:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur confirmation'
    }, { status: 500 })
  }
}
