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

    // ⚡ NE PAS ATTENDRE - Retour immédiat pour éviter timeout Vercel
    // Mux va traiter en background (1-5 min selon taille vidéo)

    // Récupérer l'asset immédiatement (sans attendre "ready")
    const asset = await mux.video.assets.retrieve(upload.asset_id!)

    // Générer le playbackId (disponible immédiatement)
    const playbackId = asset.playback_ids?.[0]?.id || upload.asset_id!

    console.log('✅ Upload Mux initié:', {
      assetId: asset.id,
      status: asset.status, // "preparing" au début
      playbackId
    })

    return {
      playbackId,
      playbackUrl: `https://stream.mux.com/${playbackId}.m3u8`,
      thumbnailUrl: `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&time=1`,
      assetId: asset.id,
      duration: 0, // Sera calculé par Mux plus tard
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
