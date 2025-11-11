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
 * - Token Authentication (signed URLs)
 */

import crypto from 'crypto'

const BUNNY_STREAM_API_URL = 'https://video.bunnycdn.com'

interface BunnyStreamLibraryConfig {
  libraryId: string
  apiKey: string
  tokenAuthKey?: string
}

function getBunnyConfig(): BunnyStreamLibraryConfig {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID
  const apiKey = process.env.BUNNY_STREAM_API_KEY
  const tokenAuthKey = process.env.BUNNY_STREAM_TOKEN_AUTH_KEY

  if (!libraryId || !apiKey) {
    throw new Error('Variables Bunny manquantes ! Vérifiez BUNNY_STREAM_LIBRARY_ID et BUNNY_STREAM_API_KEY.')
  }

  return { libraryId, apiKey, tokenAuthKey }
}

/**
 * Signer une URL Bunny avec Token Authentication
 *
 * Documentation: https://docs.bunny.net/docs/stream-security
 *
 * @param url - URL à signer (sans token)
 * @param expirationTimeInSeconds - Durée de validité du token (défaut: 1 heure)
 * @returns URL signée avec token
 */
export function signBunnyUrl(url: string, expirationTimeInSeconds: number = 3600): string {
  const { tokenAuthKey } = getBunnyConfig()

  if (!tokenAuthKey) {
    // Pas de token auth configuré, retourner l'URL telle quelle
    return url
  }

  // Expiration timestamp (epoch)
  const expires = Math.floor(Date.now() / 1000) + expirationTimeInSeconds

  // Extraire le path de l'URL
  // Ex: https://vz-538306.b-cdn.net/video-id/playlist.m3u8 -> /video-id/playlist.m3u8
  const urlObj = new URL(url)
  const path = urlObj.pathname

  // Créer la signature selon la formule Bunny:
  // Base64(SHA256_RAW(token_key + path + expires))
  const hashString = tokenAuthKey + path + expires
  const hash = crypto
    .createHash('sha256')
    .update(hashString)
    .digest('base64') // Base64 du hash RAW (pas hex)
    .replace(/\n/g, '') // Supprimer les newlines
    .replace(/\+/g, '-') // URL-safe Base64
    .replace(/\//g, '_')
    .replace(/=/g, '')

  // Ajouter les paramètres token et expires à l'URL
  urlObj.searchParams.set('token', hash)
  urlObj.searchParams.set('expires', expires.toString())

  return urlObj.toString()
}

/**
 * Créer une vidéo sur Bunny Stream et obtenir l'URL de direct upload
 *
 * @returns Upload URL, Video ID et Collection ID
 */
export async function createBunnyDirectUpload(title?: string) {
  try {
    const { libraryId, apiKey } = getBunnyConfig()

    // 1. Créer la vidéo sur Bunny en mode public dès le départ
    const response = await fetch(`${BUNNY_STREAM_API_URL}/library/${libraryId}/videos`, {
      method: 'POST',
      headers: {
        'AccessKey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title || `Video ${Date.now()}`,
        collectionId: '',
        thumbnailTime: 0,
        isPublic: true  // ✅ Créer directement en public
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Bunny API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const videoId = data.guid

    console.log('✅ Bunny video created (public):', {
      videoId: videoId,
      collectionId: data.collectionId,
      isPublic: data.isPublic
    })

    // 2. Retourner les infos nécessaires pour l'upload
    // L'URL d'upload direct Bunny est construite comme suit :
    // PUT https://video.bunnycdn.com/library/{libraryId}/videos/{videoId}
    const uploadUrl = `${BUNNY_STREAM_API_URL}/library/${libraryId}/videos/${videoId}`

    return {
      uploadUrl,
      videoId: videoId,
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

    // Bunny statuses (documentation officielle):
    // 0 = Created
    // 1 = Uploaded
    // 2 = Processing
    // 3 = Encoding Queued
    // 4 = Ready (vidéo prête à diffuser) ✅
    // 5 = Transcoded (optimisations supplémentaires)
    // 6 = Failed

    const statusMap: Record<number, string> = {
      0: 'created',
      1: 'uploaded',
      2: 'processing',
      3: 'queued',
      4: 'ready',      // ✅ Status 4 = Ready (pas 5 !)
      5: 'transcoded',
      6: 'failed',
    }

    const status = statusMap[video.status] || 'unknown'

    // URL directe HLS playlist (compatible avec <video> + HLS.js)
    // Utilise la Pull Zone CDN Stream: vz-cf0fe97d-915.b-cdn.net
    // Disponible dès que status >= 4 (Ready)
    const hlsUrl = video.status >= 4
      ? `https://vz-cf0fe97d-915.b-cdn.net/${videoId}/playlist.m3u8`
      : null

    // URL iframe embed (pour <iframe> seulement)
    const playbackUrl = video.status >= 4
      ? `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&preload=true`
      : null

    // Thumbnail (utilise aussi la Pull Zone Stream)
    // Bunny génère toujours un thumbnail.jpg par défaut
    const thumbnailUrl = video.thumbnailFileName
      ? `https://vz-cf0fe97d-915.b-cdn.net/${videoId}/${video.thumbnailFileName}`
      : `https://vz-cf0fe97d-915.b-cdn.net/${videoId}/thumbnail.jpg` // Fallback sur thumbnail.jpg par défaut

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
