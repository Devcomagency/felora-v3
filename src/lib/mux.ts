import Mux from '@mux/mux-node'

// Configuration Mux
export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

// Fonction pour créer un asset vidéo Mux
export async function createMuxAsset(videoBuffer: Buffer) {
  try {
    // Créer un upload direct
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        video_quality: 'plus', // HD quality
        encoding_tier: 'smart',
        mp4_support: 'standard',
      },
    })

    // Upload le fichier vers Mux
    await fetch(upload.url, {
      method: 'PUT',
      body: videoBuffer,
      headers: {
        'Content-Type': 'video/mp4',
      },
    })

    // Attendre que Mux traite la vidéo (max 30s)
    let asset
    let attempts = 0
    const maxAttempts = 30

    while (attempts < maxAttempts) {
      asset = await mux.video.assets.retrieve(upload.asset_id!)

      if (asset.status === 'ready') {
        break
      }

      if (asset.status === 'errored') {
        throw new Error(`Mux asset creation failed: ${asset.errors?.messages?.join(', ')}`)
      }

      // Attendre 1 seconde avant de réessayer
      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
    }

    if (!asset || asset.status !== 'ready') {
      throw new Error('Mux asset creation timeout')
    }

    // Retourner les URLs
    const playbackId = asset.playback_ids?.[0]?.id
    if (!playbackId) {
      throw new Error('No playback ID generated')
    }

    return {
      playbackId,
      playbackUrl: `https://stream.mux.com/${playbackId}.m3u8`,
      thumbnailUrl: `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&time=1`,
      assetId: asset.id,
      duration: asset.duration || 0,
    }
  } catch (error: any) {
    console.error('❌ Erreur création asset Mux:', error)
    throw new Error(`Mux upload failed: ${error.message}`)
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
