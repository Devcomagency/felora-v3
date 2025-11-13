import { useUploadStore } from '@/stores/uploadStore'
import { uploadWithProgress, fetchWithRetry } from '@/utils/uploadWithProgress'

interface UploadVideoParams {
  file: File
  description?: string
  visibility: 'public' | 'private' | 'premium'
  price?: number
  location?: string
}

/**
 * Hook pour gérer l'upload vidéo en arrière-plan
 * Permet de rediriger l'utilisateur immédiatement pendant que l'upload continue
 */
export function useBackgroundUpload() {
  const startVideoUpload = async (params: UploadVideoParams) => {
    const { setProgress, setStatus, setUpload, clearUpload } = useUploadStore.getState()

    try {
      setProgress(5, 'Upload en cours...')

      // 1. Obtenir URL upload Bunny
      const bunnyUrlRes = await fetchWithRetry('/api/media/bunny-upload-url', {
        method: 'POST',
        credentials: 'include'
      })

      if (!bunnyUrlRes.ok) {
        throw new Error('Échec création URL Bunny')
      }

      const { uploadUrl, videoId, apiKey } = await bunnyUrlRes.json()

      // 2. Upload vers Bunny
      await uploadWithProgress({
        url: uploadUrl,
        file: params.file,
        method: 'PUT',
        headers: {
          'AccessKey': apiKey,
          'Content-Type': 'application/octet-stream',
        },
        onProgress: (progress) => {
          const globalProgress = 5 + Math.min(progress * 0.85, 85)
          setProgress(globalProgress, `Upload ${progress}%`)
        },
        maxAttempts: 3
      })

      setProgress(90, 'Traitement...')

      // 3. Confirmer l'upload
      const confirmRes = await fetchWithRetry('/api/media/bunny-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          videoId,
          description: params.description,
          visibility: params.visibility,
          price: params.price,
          location: params.location
        })
      })

      const result = await confirmRes.json()

      if (confirmRes.status === 202 && result.processing) {
        // Vidéo en traitement → Activer polling
        setUpload({
          videoId: result.videoId,
          thumbnailUrl: result.thumbnailUrl,
          fileName: params.file.name,
          pendingData: result.pendingData
        })
        setProgress(95, 'Encodage...')
        return { success: true, processing: true }
      }

      if (!confirmRes.ok) {
        throw new Error(result.error || 'Échec sauvegarde vidéo')
      }

      // Succès immédiat
      setProgress(100, '✓ Publié')
      setStatus('success', '✓ Publié avec succès')
      setTimeout(() => clearUpload(), 3000)

      return { success: true, processing: false }

    } catch (error: any) {
      console.error('❌ Erreur upload:', error)
      setStatus('error', `✗ Erreur: ${error.message}`)
      setTimeout(() => clearUpload(), 5000)
      return { success: false, error: error.message }
    }
  }

  return { startVideoUpload }
}
