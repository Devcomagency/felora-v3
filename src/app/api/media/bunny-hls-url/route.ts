import { NextRequest, NextResponse } from 'next/server'

/**
 * API pour extraire l'URL HLS réelle depuis l'iframe Bunny
 *
 * Bunny Stream utilise des URLs CDN signées qui ne sont pas accessibles directement.
 * Cette API fetch l'iframe embed et extrait l'URL HLS du player.
 *
 * Query params:
 * - videoId: ID de la vidéo Bunny
 * - libraryId: ID de la librairie (défaut: 538306)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')
    const libraryId = searchParams.get('libraryId') || '538306'

    if (!videoId) {
      return NextResponse.json({ error: 'videoId manquant' }, { status: 400 })
    }

    // Fetch l'iframe embed
    const iframeUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`
    const iframeResponse = await fetch(iframeUrl)

    if (!iframeResponse.ok) {
      return NextResponse.json({
        error: 'Impossible de charger la vidéo Bunny'
      }, { status: 404 })
    }

    const iframeHtml = await iframeResponse.text()

    // Extraire l'URL HLS du HTML
    // Format: https://vz-xxxxx.b-cdn.net/{videoId}/playlist.m3u8
    const hlsMatch = iframeHtml.match(/https:\/\/vz-[^"']+\/[^"']+\/playlist\.m3u8[^"']*/i)

    if (!hlsMatch) {
      return NextResponse.json({
        error: 'URL HLS introuvable dans l\'iframe'
      }, { status: 404 })
    }

    const hlsUrl = hlsMatch[0].replace(/['";]$/, '') // Nettoyer les quotes

    // Extraire aussi l'URL du thumbnail si disponible
    const thumbMatch = iframeHtml.match(/https:\/\/vz-[^"']+\/[^"']+\/thumbnail\.(jpg|png)[^"']*/i)
    const thumbnailUrl = thumbMatch ? thumbMatch[0].replace(/['";]$/, '') : null

    return NextResponse.json({
      success: true,
      videoId,
      hlsUrl,
      thumbnailUrl,
      iframeUrl
    })

  } catch (error: any) {
    console.error('❌ Erreur extraction URL HLS Bunny:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur extraction URL'
    }, { status: 500 })
  }
}
