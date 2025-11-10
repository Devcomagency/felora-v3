import { NextRequest, NextResponse } from 'next/server'
import { getBunnyVideoStatus } from '@/lib/bunny'

/**
 * API pour récupérer l'URL HLS d'une vidéo Bunny
 * Utilisé par le polling de FloatingUploadCard
 *
 * Query params:
 * - videoId: ID de la vidéo Bunny
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json({
        success: false,
        error: 'videoId manquant'
      }, { status: 400 })
    }

    // Récupérer le statut de la vidéo Bunny
    const bunnyVideo = await getBunnyVideoStatus(videoId)

    console.log(`🔍 Status vidéo ${videoId}:`, {
      status: bunnyVideo.status,
      hasHlsUrl: !!bunnyVideo.hlsUrl,
      hasThumbnail: !!bunnyVideo.thumbnailUrl
    })

    // Vérifier si la vidéo est prête
    if (bunnyVideo.status === 'ready' && bunnyVideo.hlsUrl) {
      return NextResponse.json({
        success: true,
        hlsUrl: bunnyVideo.hlsUrl,
        thumbnailUrl: bunnyVideo.thumbnailUrl,
        status: bunnyVideo.status
      })
    }

    // Vidéo encore en traitement
    return NextResponse.json({
      success: false,
      status: bunnyVideo.status,
      message: 'Vidéo en cours de traitement'
    }, { status: 202 })
  } catch (error: any) {
    console.error('❌ Erreur récupération HLS URL:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur serveur'
    }, { status: 500 })
  }
}
