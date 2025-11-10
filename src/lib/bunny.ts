/**
 * Bunny.net Stream Integration
 *
 * Documentation: https://docs.bunny.net/reference/video_createvideo
 *
 * Bunny Stream supports:
 * - HEVC/H.265 (native support)
 * - H.264
 * - Direct upload from client
 * - Automatic transcoding
 * - HLS streaming
 */

const BUNNY_STREAM_API_URL = 'https://video.bunnycdn.com'

interface BunnyStreamLibraryConfig {
  libraryId: string
  apiKey: string
}

function getBunnyConfig(): BunnyStreamLibraryConfig {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID
  const apiKey = process.env.BUNNY_STREAM_API_KEY

  if (!libraryId || !apiKey) {
    throw new Error('Variables Bunny manquantes ! Vérifiez BUNNY_STREAM_LIBRARY_ID et BUNNY_STREAM_API_KEY.')
  }

  return { libraryId, apiKey }
}

/**
 * Créer une vidéo sur Bunny Stream et obtenir l'URL de direct upload
 *
 * @returns Upload URL, Video ID et Collection ID
 */
export async function createBunnyDirectUpload(title?: string) {
  try {
    const { libraryId, apiKey } = getBunnyConfig()

    // 1. Créer la vidéo sur Bunny
    const response = await fetch(`${BUNNY_STREAM_API_URL}/library/${libraryId}/videos`, {
      method: 'POST',
      headers: {
        'AccessKey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title || `Video ${Date.now()}`,
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Bunny API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    console.log('✅ Bunny video created:', {
      videoId: data.guid,
      collectionId: data.collectionId
    })

    // 2. Retourner les infos nécessaires pour l'upload
    // L'URL d'upload direct Bunny est construite comme suit :
    // PUT https://video.bunnycdn.com/library/{libraryId}/videos/{videoId}
    const uploadUrl = `${BUNNY_STREAM_API_URL}/library/${libraryId}/videos/${data.guid}`

    return {
      uploadUrl,
      videoId: data.guid,
      collectionId: data.collectionId,
      libraryId,
    }
  } catch (error: any) {
    console.error('❌ Erreur création upload Bunny:', error.message)
    throw new Error(`Échec création upload Bunny: ${error.message}`)
  }
}

/**
 * Récupérer le statut d'une vidéo Bunny
 *
 * @param videoId - GUID de la vidéo Bunny
 * @returns Statut de la vidéo, URL de lecture, thumbnail
 */
export async function getBunnyVideoStatus(videoId: string) {
  try {
    const { libraryId, apiKey } = getBunnyConfig()

    const response = await fetch(`${BUNNY_STREAM_API_URL}/library/${libraryId}/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'AccessKey': apiKey,
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Bunny API error: ${response.status} - ${errorText}`)
    }

    const video = await response.json()

    // Bunny statuses:
    // 0 = Created
    // 1 = Uploaded
    // 2 = Processing
    // 3 = Encoding Queued
    // 4 = Encoding
    // 5 = Finished (Ready)
    // 6 = Failed

    const statusMap: Record<number, string> = {
      0: 'created',
      1: 'uploaded',
      2: 'processing',
      3: 'queued',
      4: 'encoding',
      5: 'ready',
      6: 'failed',
    }

    const status = statusMap[video.status] || 'unknown'

    // URL de lecture HLS
    const playbackUrl = video.status >= 5
      ? `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&preload=true`
      : null

    // URL directe HLS
    const hlsUrl = video.status >= 5
      ? `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}`
      : null

    // Thumbnail
    const thumbnailUrl = video.thumbnailFileName
      ? `https://vz-${video.videoLibraryId}.b-cdn.net/${videoId}/${video.thumbnailFileName}`
      : null

    return {
      status,
      rawStatus: video.status,
      playbackUrl,
      hlsUrl,
      thumbnailUrl,
      duration: video.length || 0,
      videoId: video.guid,
      title: video.title,
      availableResolutions: video.availableResolutions || [],
    }
  } catch (error: any) {
    console.error('❌ Erreur récupération vidéo Bunny:', error)
    throw error
  }
}

/**
 * Supprimer une vidéo Bunny
 *
 * @param videoId - GUID de la vidéo à supprimer
 */
export async function deleteBunnyVideo(videoId: string) {
  try {
    const { libraryId, apiKey } = getBunnyConfig()

    const response = await fetch(`${BUNNY_STREAM_API_URL}/library/${libraryId}/videos/${videoId}`, {
      method: 'DELETE',
      headers: {
        'AccessKey': apiKey,
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Bunny API error: ${response.status} - ${errorText}`)
    }

    console.log('✅ Vidéo Bunny supprimée:', videoId)
  } catch (error: any) {
    console.error('❌ Erreur suppression vidéo Bunny:', error)
    throw error
  }
}
