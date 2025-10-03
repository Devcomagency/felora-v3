import { useState } from 'react'

interface UploadProgress {
  file: File
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
  publicUrl?: string
}

interface UseDirectUploadOptions {
  visibility?: 'public' | 'premium' | 'private'
  price?: number
  pos?: number
  description?: string
  onSuccess?: (publicUrl: string) => void
  onError?: (error: string) => void
}

/**
 * Hook pour upload direct vers R2 sans passer par le serveur Next.js
 * Évite la limite de 4.5MB de Vercel
 */
export function useDirectUpload(options: UseDirectUploadOptions = {}) {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map())

  const uploadFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`

    // Initialiser le statut
    setUploads(prev => new Map(prev).set(fileId, {
      file,
      progress: 0,
      status: 'uploading'
    }))

    try {
      // 1. Obtenir l'URL pré-signée
      console.log('🔐 Demande presigned URL pour:', file.name)

      const presignedResponse = await fetch('/api/media/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        })
      })

      if (!presignedResponse.ok) {
        const error = await presignedResponse.json()
        throw new Error(error.error || 'Erreur lors de la génération de l\'URL')
      }

      const { presignedUrl, publicUrl } = await presignedResponse.json()

      console.log('✅ Presigned URL obtenue, upload vers R2...')

      // 2. Upload direct vers R2 avec suivi de progression
      const xhr = new XMLHttpRequest()

      // Promesse pour gérer le XHR
      await new Promise<void>((resolve, reject) => {
        // Suivi de la progression
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            setUploads(prev => {
              const updated = new Map(prev)
              const upload = updated.get(fileId)
              if (upload) {
                upload.progress = progress
                updated.set(fileId, upload)
              }
              return updated
            })
          }
        })

        // Succès
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload échoué: ${xhr.status}`))
          }
        })

        // Erreur
        xhr.addEventListener('error', () => {
          reject(new Error('Erreur réseau lors de l\'upload'))
        })

        // Abort
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload annulé'))
        })

        // Lancer la requête PUT
        xhr.open('PUT', presignedUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      console.log('✅ Upload R2 réussi, sauvegarde métadonnées...')

      // 3. Confirmer l'upload et sauvegarder les métadonnées
      const confirmResponse = await fetch('/api/media/confirm-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicUrl,
          type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
          visibility: options.visibility || 'public',
          price: options.price,
          pos: options.pos || 0,
          description: options.description
        })
      })

      if (!confirmResponse.ok) {
        const error = await confirmResponse.json()
        throw new Error(error.error || 'Erreur lors de la sauvegarde')
      }

      const result = await confirmResponse.json()

      console.log('✅ Upload complet:', result)

      // Marquer comme succès
      setUploads(prev => {
        const updated = new Map(prev)
        const upload = updated.get(fileId)
        if (upload) {
          upload.status = 'success'
          upload.progress = 100
          upload.publicUrl = publicUrl
          updated.set(fileId, upload)
        }
        return updated
      })

      // Callback succès
      if (options.onSuccess) {
        options.onSuccess(publicUrl)
      }

      return result

    } catch (error: any) {
      console.error('❌ Erreur upload:', error)

      // Marquer comme erreur
      setUploads(prev => {
        const updated = new Map(prev)
        const upload = updated.get(fileId)
        if (upload) {
          upload.status = 'error'
          upload.error = error.message
          updated.set(fileId, upload)
        }
        return updated
      })

      // Callback erreur
      if (options.onError) {
        options.onError(error.message)
      }

      throw error
    }
  }

  const clearUpload = (fileId: string) => {
    setUploads(prev => {
      const updated = new Map(prev)
      updated.delete(fileId)
      return updated
    })
  }

  const clearAll = () => {
    setUploads(new Map())
  }

  return {
    uploadFile,
    uploads,
    clearUpload,
    clearAll
  }
}
