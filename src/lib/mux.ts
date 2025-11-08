import Mux from '@mux/mux-node'

// Type pour le client Mux
type MuxClient = InstanceType<typeof Mux>

// Initialisation lazy du client Mux pour éviter les erreurs au build
let muxClient: MuxClient | null = null

export function getMuxClient(): MuxClient {
  if (!muxClient) {
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      throw new Error('❌ Variables Mux manquantes ! MUX_TOKEN_ID ou MUX_TOKEN_SECRET non défini.')
    }

    console.log('✅ Initialisation client Mux...')
    console.log('🔑 MUX_TOKEN_ID length:', process.env.MUX_TOKEN_ID.length)
    console.log('🔑 MUX_TOKEN_SECRET length:', process.env.MUX_TOKEN_SECRET.length)

    // Utiliser new Mux() selon la documentation
    muxClient = new Mux(
      process.env.MUX_TOKEN_ID,
      process.env.MUX_TOKEN_SECRET
    )

    console.log('✅ Client Mux créé, Video API:', !!muxClient.Video)
  }
  return muxClient
}

// Export direct du client (sera initialisé à la première utilisation)
export const mux = {
  get Video() {
    return getMuxClient().Video
  }
}

// Fonction pour créer une URL d'upload direct Mux (client → Mux)
export async function createMuxDirectUpload() {
  try {
    console.log('🔧 [createMuxDirectUpload] Initialisation client Mux...')
    const client = getMuxClient()
    console.log('✅ [createMuxDirectUpload] Client Mux initialisé, Video:', !!client.Video)

    console.log('📡 [createMuxDirectUpload] Appel API Mux uploads.create...')

    const uploadParams = {
      new_asset_settings: {
        playback_policy: ['public'],
      },
      cors_origin: '*',
    }

    console.log('📋 Paramètres upload:', JSON.stringify(uploadParams))

    const upload = await client.Video.Uploads.create(uploadParams)

    console.log('✅ URL upload Mux créée:', upload.id)

    return {
      uploadUrl: upload.url,
      uploadId: upload.id,
      assetId: upload.asset_id,
    }
  } catch (error: any) {
    console.error('❌ Erreur création upload Mux - FULL ERROR:', {
      error,
      message: error.message,
      type: error.type,
      messages: error.messages,
      stack: error.stack
    })
    throw new Error(`Mux upload creation failed: ${error.message || error.type || JSON.stringify(error)}`)
  }
}

// Fonction pour vérifier le statut d'un asset Mux
export async function getMuxAssetStatus(assetId: string) {
  try {
    const client = getMuxClient()
    const asset = await client.Video.Assets.get(assetId)

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
    const client = getMuxClient()
    await client.Video.Assets.delete(assetId)
    console.log('✅ Asset Mux supprimé:', assetId)
  } catch (error: any) {
    console.error('❌ Erreur suppression asset Mux:', error)
    throw error
  }
}
