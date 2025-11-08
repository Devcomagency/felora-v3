import Mux from '@mux/mux-node'

// Initialisation lazy du client Mux pour éviter les erreurs au build
let muxClient: Mux | null = null

export function getMuxClient(): Mux {
  if (!muxClient) {
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      throw new Error('❌ Variables Mux manquantes ! MUX_TOKEN_ID ou MUX_TOKEN_SECRET non défini.')
    }

    console.log('✅ Initialisation client Mux...')
    muxClient = new Mux({
      tokenId: process.env.MUX_TOKEN_ID,
      tokenSecret: process.env.MUX_TOKEN_SECRET,
    })
  }
  return muxClient
}

// Export direct du client (sera initialisé à la première utilisation)
export const mux = {
  get video() {
    return getMuxClient().video
  }
}

// Fonction pour créer une URL d'upload direct Mux (client → Mux)
export async function createMuxDirectUpload() {
  try {
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        video_quality: 'plus',
        encoding_tier: 'smart',
        mp4_support: 'standard',
      },
      cors_origin: '*', // Permet upload depuis le browser
    })

    console.log('✅ URL upload Mux créée:', upload.id)

    return {
      uploadUrl: upload.url,
      uploadId: upload.id,
      assetId: upload.asset_id,
    }
  } catch (error: any) {
    console.error('❌ Erreur création upload Mux:', error)
    throw new Error(`Mux upload creation failed: ${error.message}`)
  }
}

// Fonction pour vérifier le statut d'un asset Mux
export async function getMuxAssetStatus(assetId: string) {
  try {
    const asset = await mux.video.assets.retrieve(assetId)

    const playbackId = asset.playback_ids?.[0]?.id

    return {
      status: asset.status,
      playbackId,
      playbackUrl: playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null,
      thumbnailUrl: playbackId ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&time=1` : null,
      duration: asset.duration || 0,
    }
  } catch (error: any) {
    console.error('❌ Erreur récupération asset Mux:', error)
    throw error
  }
}

// Fonction pour supprimer un asset Mux
export async function deleteMuxAsset(assetId: string) {
  try {
    await mux.video.assets.delete(assetId)
    console.log('✅ Asset Mux supprimé:', assetId)
  } catch (error: any) {
    console.error('❌ Erreur suppression asset Mux:', error)
    throw error
  }
}
