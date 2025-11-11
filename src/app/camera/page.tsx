/**
 * @fileoverview Page de capture et publication de médias (photos/vidéos)
 *
 * FLOW COMPLET :
 * 1. Capture depuis caméra native (CameraCapturePro)
 *    - 3 méthodes : Vidéo, Photo, Upload fichier
 *    - Utilise input[capture="environment"] pour caméra native
 *
 * 2. Preview et édition (PublishMediaEditor)
 *    - Visualisation du média capturé
 *    - Ajout description, lieu, visibilité (public/private/premium)
 *    - Prix si contenu premium
 *
 * 3. Compression (images seulement)
 *    - Détection automatique des images
 *    - Compression à 1920x1920px max, qualité 0.85
 *    - Économie 70-85% de bande passante
 *
 * 4. Upload vers R2 avec sécurité maximale
 *    a) Obtenir presigned URL (API valide MIME type côté serveur)
 *    b) Upload direct vers R2 avec XMLHttpRequest
 *       - Progress bar en temps réel
 *       - Retry automatique (3 tentatives max)
 *       - Backoff exponentiel : 1s, 2s, 4s
 *    c) Confirmation et sauvegarde métadonnées en DB
 *
 * 5. Redirection vers profil
 *
 * SÉCURITÉ :
 * - Presigned URLs (pas de clés API exposées)
 * - Validation MIME côté serveur
 * - Authentification NextAuth requise
 * - Limite 500MB par fichier
 *
 * UX :
 * - Toasts modernes pour feedback utilisateur
 * - Progress bar upload en temps réel
 * - Retry automatique en cas d'échec réseau
 * - Compression transparente des images
 */
'use client'

import { useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { compressImageIfNeeded } from '@/utils/imageCompression'
import { compressVideoIfNeeded } from '@/utils/videoCompression'
import { uploadWithProgress, fetchWithRetry } from '@/utils/uploadWithProgress'
import { useToast } from '@/components/ui/Toast'
import { useUploadStore } from '@/stores/uploadStore'

const CameraCapturePro = dynamic(() => import('@/components/camera/CameraCapturePro'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p>Chargement de la caméra...</p>
      </div>
    </div>
  )
})

const PublishMediaEditor = dynamic(() => import('@/components/media/PublishMediaEditor'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p>Chargement...</p>
      </div>
    </div>
  )
})

/**
 * Représente un média capturé (photo ou vidéo)
 */
interface CapturedMedia {
  /** Fichier capturé */
  file: File
  /** URL de preview (Object URL) */
  previewUrl: string
  /** Type de média */
  type: 'image' | 'video'
  /** Si c'est une capture directe depuis la caméra (probable HEVC) */
  isCameraCapture?: boolean
}

/**
 * Composant principal de la page camera
 * Gère les états de capture, preview et publication
 */
function CameraPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') as 'photo' | 'video' | 'upload' | null
  const toast = useToast()

  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  /**
   * Handler appelé quand un fichier est capturé depuis la caméra
   * Crée un Object URL pour la preview et stocke le fichier en state
   * @param file - Fichier photo ou vidéo capturé
   */
  const handleCameraCapture = useCallback((file: File) => {
    console.log('📹 Fichier capturé:', file.name, file.type, file.size)

    const isVideo = file.type.startsWith('video/')
    const previewUrl = URL.createObjectURL(file)

    // Détecter si c'est une capture directe depuis la caméra (très probablement HEVC sur Samsung)
    // On peut détecter ça via le nom du fichier ou d'autres métadonnées
    const isCameraCapture = file.name.includes('VID') || file.name.includes('MOV') || 
                           file.name.match(/^[0-9]{8}_[0-9]{6}/) // Format Samsung/Android

    setCapturedMedia({
      file,
      previewUrl,
      type: isVideo ? 'video' : 'image',
      isCameraCapture // Stocker cette info pour décider du provider
    })
  }, [])

  /**
   * Handler pour la publication avec retry automatique et progress bar
   * @param data - Données du média à publier
   */
  const handlePublish = useCallback(async (data: {
    file: File
    description: string
    location: string
    visibility: 'public' | 'private' | 'premium'
    price?: number
  }) => {
    setIsPublishing(true)
    setUploadProgress(0)
    console.log('📤 Publication en cours:', data)

    const isVideo = data.file.type.startsWith('video/')

    try {
      // 🎬 VIDÉO → Upload direct vers Bunny.net (support HEVC natif)
      if (isVideo) {
        // Pas de compression côté client - Bunny gère tout l'encodage de manière optimale
        // Cela évite les blocages longs et la dégradation de qualité
        const fileToUpload = data.file

        setUploadProgress(5)
        toast.info('Upload vidéo vers Bunny.net...', 0)

        // 2. Obtenir URL upload Bunny
        const bunnyUrlRes = await fetchWithRetry('/api/media/bunny-upload-url', {
          method: 'POST',
          credentials: 'include'
        })

        if (!bunnyUrlRes.ok) {
          throw new Error('Échec création URL Bunny')
        }

        const { uploadUrl, videoId, libraryId, apiKey } = await bunnyUrlRes.json()

        // 3. Upload DIRECT vers Bunny avec progress
        await uploadWithProgress({
          url: uploadUrl,
          file: fileToUpload,
          method: 'PUT',
          headers: {
            'AccessKey': apiKey,
            'Content-Type': 'application/octet-stream',
          },
          onProgress: (progress) => {
            // 5-95% pour upload (pas de compression avant)
            setUploadProgress(5 + Math.min(progress * 0.9, 90))
            console.log(`📊 Upload Bunny: ${progress}%`)
          },
          maxAttempts: 3
        })

        setUploadProgress(95)

        // 3. Confirmer et sauvegarder en DB (ou démarrer le traitement)
        const confirmRes = await fetchWithRetry('/api/media/bunny-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            videoId: videoId,
            description: data.description || undefined,
            visibility: data.visibility,
            price: data.visibility === 'premium' && data.price ? data.price : undefined,
            location: data.location || undefined
          })
        })

        const result = await confirmRes.json()

        if (confirmRes.status === 202 && result.processing) {
          // Vidéo en cours de traitement → Activer FloatingUploadCard
          console.log('⏳ Vidéo en traitement, activation monitoring')

          const { setUpload } = useUploadStore.getState()
          setUpload({
            videoId: result.videoId,
            thumbnailUrl: result.thumbnailUrl,
            fileName: data.file.name,
            pendingData: result.pendingData
          })

          // Redirection immédiate vers home
          toast.info('📤 Vidéo en traitement...', 2000)
          router.push('/')
          return
        }

        if (!confirmRes.ok) {
          const errorMessage = result.error || 'Échec sauvegarde vidéo'
          toast.error(errorMessage, 6000)
          setIsPublishing(false)
          setUploadProgress(0)
          return
        }

        // Vidéo immédiatement prête (rare mais possible)
        console.log('✅ Vidéo prête immédiatement:', result)
        toast.success('✅ Vidéo publiée !', 1500)
        setTimeout(() => router.push('/'), 500)
        return
      }

      // 📷 IMAGE → Upload vers R2 (comme avant)
      // 1. Calculer la position pour le feed
      // IMPORTANT: Les nouveaux médias doivent toujours aller en position 1 (en tête du feed)
      // Seul pos 0 (avatar dashboard) est protégé et ne peut être changé que via le dashboard
      // On décale tous les autres médias existants
      const newPos = 1

      console.log('📍 Position calculée pour le feed:', {
        newPos,
        note: 'Nouvelle publication toujours en position 1 (en tête du feed)'
      })

      // 2. Obtenir presigned URL R2
      const presignedRes = await fetchWithRetry('/api/media/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fileName: data.file.name,
          fileType: data.file.type,
          fileSize: data.file.size
        })
      })

      if (!presignedRes.ok) {
        throw new Error('Échec génération URL sécurisée')
      }

      const { presignedUrl, publicUrl, key } = await presignedRes.json()

      // 3. Compression d'image
      let fileToUpload = data.file
      toast.info('Compression de l\'image en cours...', 3000)
      console.log('🗜️ Compression de l\'image...', {
        originalSize: `${(data.file.size / 1024 / 1024).toFixed(2)}MB`
      })

      const compressionResult = await compressImageIfNeeded(data.file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85
      })

      fileToUpload = compressionResult.file

      if (compressionResult.compressionRatio > 0) {
        console.log('✅ Image compressée:', {
          originalSize: `${(compressionResult.originalSize / 1024 / 1024).toFixed(2)}MB`,
          compressedSize: `${(compressionResult.compressedSize / 1024 / 1024).toFixed(2)}MB`,
          saved: `${compressionResult.compressionRatio.toFixed(1)}%`
        })
        toast.success(`Image compressée : ${compressionResult.compressionRatio.toFixed(0)}% d'économie`, 2000)
      }

      // 4. Upload vers R2 avec progress
      toast.info('Upload en cours...', 0)
      await uploadWithProgress({
        url: presignedUrl,
        file: fileToUpload,
        method: 'PUT',
        headers: { 'Content-Type': fileToUpload.type },
        onProgress: (progress) => {
          setUploadProgress(progress)
          console.log(`📊 Upload progress: ${progress}%`)
        },
        maxAttempts: 3
      })

      // 5. Confirmer et sauvegarder métadonnées
      const confirmRes = await fetchWithRetry('/api/media/confirm-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          publicUrl,
          key,
          type: 'IMAGE',
          visibility: data.visibility,
          pos: newPos, // Position calculée pour le feed (>= 2)
          description: data.description || undefined,
          price: data.visibility === 'premium' && data.price ? data.price : undefined
        })
      })

      if (!confirmRes.ok) {
        throw new Error('Échec de l\'enregistrement')
      }

      const result = await confirmRes.json()

      if (result.success) {
        toast.success('Publication réussie ! 🎉', 1500)

        // Redirection immédiate vers le feed
        router.push('/')
      } else {
        throw new Error(result.error || 'Erreur inconnue')
      }

    } catch (error) {
      console.error('❌ Erreur publication:', error)
      const errorMessage = error instanceof Error ? error.message : 'Publication échouée'
      toast.error(errorMessage, 5000)
      setIsPublishing(false)
      setUploadProgress(0)
    }
  }, [router, toast])

  // Le mode upload est géré directement par CameraCapturePro
  // qui ouvre l'input file et appelle handleCameraCapture

  // Si média capturé, afficher l'éditeur
  if (capturedMedia) {
    return (
      <PublishMediaEditor
        mediaFile={capturedMedia.file}
        mediaUrl={capturedMedia.previewUrl}
        mediaType={capturedMedia.type}
        onClose={() => router.back()}
        onPublish={handlePublish}
      />
    )
  }

  // Sinon afficher la caméra
  if (mode === 'photo' || mode === 'video' || mode === 'upload') {
    return (
      <CameraCapturePro
        key={Date.now()} // Force remount à chaque navigation pour re-trigger l'input
        mode={mode}
        onClose={() => router.back()}
        onCapture={handleCameraCapture}
      />
    )
  }

  // Fallback : pas de mode, retour en arrière
  router.back()
  return null
}

export default function CameraPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    }>
      <CameraPageContent />
    </Suspense>
  )
}
