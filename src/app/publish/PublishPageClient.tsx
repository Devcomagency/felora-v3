'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Camera, Video, Image, ArrowLeft } from 'lucide-react'
import { compressImageIfNeeded } from '@/utils/imageCompression'
import { uploadWithProgress, fetchWithRetry } from '@/utils/uploadWithProgress'
import { useToast } from '@/components/ui/Toast'
import { useBackgroundUpload } from '@/hooks/useBackgroundUpload'

const PublishMediaEditor = dynamic(() => import('@/components/media/PublishMediaEditor'), {
  ssr: false
})

interface CapturedMedia {
  file: File
  previewUrl: string
  type: 'image' | 'video'
}

interface PublishPageClientProps {
  userRole?: string
}

export default function PublishPageClient({ userRole }: PublishPageClientProps) {
  const router = useRouter()
  const toast = useToast()
  const { startVideoUpload } = useBackgroundUpload()

  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Handler pour capturer un fichier depuis input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    console.log('🎬 [PUBLISH] handleFileSelect appelé, type:', type)
    console.log('🎬 [PUBLISH] e.target.files:', e.target.files)

    const file = e.target.files?.[0]
    if (!file) {
      console.log('❌ [PUBLISH] Aucun fichier trouvé')
      return
    }

    console.log('✅ [PUBLISH] Fichier sélectionné:', file.name, file.type, file.size)

    const previewUrl = URL.createObjectURL(file)
    console.log('✅ [PUBLISH] Preview URL créée:', previewUrl)

    setCapturedMedia({
      file,
      previewUrl,
      type
    })

    console.log('✅ [PUBLISH] setCapturedMedia appelé, passage à PublishMediaEditor dans 100ms...')
  }

  // Handler pour publier avec retry automatique
  const handlePublish = useCallback(async (data: {
    file: File
    description: string
    location: string
    visibility: 'public' | 'private' | 'premium'
    price?: number
  }) => {
    setIsUploading(true)
    setUploadProgress(0)
    console.log('📤 Publication en cours:', data)

    const isVideo = data.file.type.startsWith('video/')

    try {
      // 🎬 VIDÉO → Upload en arrière-plan + redirection immédiate
      if (isVideo) {
        // Redirection immédiate vers accueil
        router.push('/')

        // Upload en arrière-plan (non bloquant)
        startVideoUpload({
          file: data.file,
          description: data.description,
          visibility: data.visibility,
          price: data.price,
          location: data.location
        })

        return // Sortie immédiate
      }

      // 📷 IMAGE → Upload vers R2
      // 1. Calculer la position pour le feed (toujours position 1 = en tête)
      const newPos = 1

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

      // 3. Compression d'image - DÉSACTIVÉE TEMPORAIREMENT POUR TEST MOBILE
      let fileToUpload = data.file
      alert('DEBUG: Fichier prêt pour upload - ' + data.file.name)

      // COMPRESSION DÉSACTIVÉE - TEST
      // const compressionResult = await compressImageIfNeeded(data.file, {
      //   maxWidth: 1920,
      //   maxHeight: 1920,
      //   quality: 0.85
      // })
      // fileToUpload = compressionResult.file

      // 4. Upload vers R2 avec progress
      await uploadWithProgress({
        url: presignedUrl,
        file: fileToUpload,
        method: 'PUT',
        headers: { 'Content-Type': fileToUpload.type },
        onProgress: (progress) => {
          setUploadProgress(progress)
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
          pos: newPos,
          description: data.description || undefined,
          price: data.visibility === 'premium' && data.price ? data.price : undefined
        })
      })

      if (!confirmRes.ok) {
        throw new Error('Échec de l\'enregistrement')
      }

      const result = await confirmRes.json()

      if (result.success) {
        toast.success('Publié !', 1500)
        // Redirection immédiate vers le feed
        router.push('/')
      } else {
        throw new Error(result.error || 'Erreur inconnue')
      }

    } catch (error) {
      console.error('❌ Erreur publication:', error)
      const errorMessage = error instanceof Error ? error.message : 'Publication échouée'
      toast.error(errorMessage, 5000)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [router, startVideoUpload, toast])

  // Si média capturé, afficher l'éditeur
  if (capturedMedia) {
    console.log('✅ [PUBLISH] Affichage de PublishMediaEditor avec:', {
      fileName: capturedMedia.file.name,
      type: capturedMedia.type,
      url: capturedMedia.previewUrl
    })

    return (
      <PublishMediaEditor
        mediaFile={capturedMedia.file}
        mediaUrl={capturedMedia.previewUrl}
        mediaType={capturedMedia.type}
        userRole={userRole}
        onClose={() => {
          console.log('🔙 [PUBLISH] Fermeture de PublishMediaEditor')
          URL.revokeObjectURL(capturedMedia.previewUrl)
          setCapturedMedia(null)
        }}
        onPublish={handlePublish}
      />
    )
  }

  console.log('📋 [PUBLISH] Affichage du sélecteur (capturedMedia:', capturedMedia, ')')

  // Sinon afficher le sélecteur
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Publier</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] bg-clip-text text-transparent">
            Nouveau média
          </h2>
          <p className="text-white/60">
            Choisissez une option pour commencer
          </p>
        </div>

        {/* Options */}
        <div className="grid gap-4">
          {/* Photo */}
          <label className="block cursor-pointer group">
            <input
              type="file"
              accept="image/*,image/heic,image/heif"
              capture="environment"
              onChange={(e) => handleFileSelect(e, 'image')}
              className="hidden"
            />
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all group-hover:border-pink-500/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold mb-1">Prendre une photo</h3>
                  <p className="text-sm text-white/60">Ouvrir la caméra</p>
                </div>
              </div>
            </div>
          </label>

          {/* Vidéo */}
          <label className="block cursor-pointer group">
            <input
              type="file"
              accept="video/*"
              capture="environment"
              onChange={(e) => handleFileSelect(e, 'video')}
              className="hidden"
            />
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all group-hover:border-pink-500/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-center">
                  <Video className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold mb-1">Filmer une vidéo</h3>
                  <p className="text-sm text-white/60">Enregistrer une vidéo</p>
                </div>
              </div>
            </div>
          </label>

          {/* Galerie */}
          <label className="block cursor-pointer group">
            <input
              type="file"
              accept="image/*,image/heic,image/heif,video/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const type = file.type.startsWith('video/') ? 'video' : 'image'
                  handleFileSelect(e, type)
                }
              }}
              className="hidden"
            />
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all group-hover:border-pink-500/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Image className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold mb-1">Depuis la galerie</h3>
                  <p className="text-sm text-white/60">Choisir une photo ou vidéo</p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}
