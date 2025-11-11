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
    const startTime = Date.now()
    const bunnyVideo = await getBunnyVideoStatus(videoId)
    const apiLatency = Date.now() - startTime

    console.log(`🔍 [BUNNY PERF] Status vidéo ${videoId}:`, {
      status: bunnyVideo.status,
      rawStatus: bunnyVideo.rawStatus,
      hasHlsUrl: !!bunnyVideo.hlsUrl,
      hasThumbnail: !!bunnyVideo.thumbnailUrl,
      apiLatency: `${apiLatency}ms`
    })

    // Vérifier si la vidéo est prête
    if (bunnyVideo.status === 'ready' && bunnyVideo.hlsUrl) {
      console.log(`✅ [BUNNY PERF] Vidéo ${videoId} PRÊTE ! Status: ready (rawStatus: ${bunnyVideo.rawStatus})`)
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
