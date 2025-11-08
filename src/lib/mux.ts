import Mux from '@mux/mux-node'

// Type pour le client Mux
type MuxClient = InstanceType<typeof Mux>

// Initialisation lazy du client Mux pour éviter les erreurs au build
let muxClient: MuxClient | null = null

export function getMuxClient(): MuxClient {
  if (!muxClient) {
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      throw new Error('Variables Mux manquantes ! Vérifiez MUX_TOKEN_ID et MUX_TOKEN_SECRET.')
    }

    muxClient = new Mux(
      process.env.MUX_TOKEN_ID,
      process.env.MUX_TOKEN_SECRET
    )
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
    const client = getMuxClient()

    const upload = await client.Video.Uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        // 🎬 Mux va automatiquement convertir les formats incompatibles
        // HEVC/H.265 sera converti en H.264
        mp4_support: 'standard', // Génère aussi MP4 pour fallback
      },
      cors_origin: '*',
    })

    return {
      uploadUrl: upload.url,
      uploadId: upload.id,
      assetId: upload.asset_id,
    }
  } catch (error: any) {
    console.error('❌ Erreur création upload Mux:', error.message || error.type)
    throw new Error(`Échec création upload Mux: ${error.message || error.type}`)
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
