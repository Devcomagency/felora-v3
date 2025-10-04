'use client'

import { useState, useCallback, memo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { Plus, ChevronLeft, Home, Search, User, Camera, Video } from 'lucide-react'

// Lazy loading des composants
const CameraCapturePro = dynamic(() => import('@/components/camera/CameraCapturePro'), {
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
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p>Chargement...</p>
      </div>
    </div>
  )
})

interface CapturedMedia {
  file: File
  previewUrl: string
  type: 'image' | 'video'
}

export default function TestMediaSimplePage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') as 'photo' | 'video' | 'upload' | null

  const [showModeSelector, setShowModeSelector] = useState(true) // Sélecteur photo/vidéo
  const [showCamera, setShowCamera] = useState(false)
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('video')
  const [showPublishEditor, setShowPublishEditor] = useState(false)
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isEscortOrClub = session?.user && (
    (session.user as any)?.escortProfile ||
    (session.user as any)?.clubProfile ||
    session.user.email?.includes('club') ||
    session.user.email?.includes('escort')
  )

  // Gérer l'ouverture automatique selon le mode URL
  useEffect(() => {
    if (mode === 'photo' || mode === 'video') {
      setCameraMode(mode)
      setShowModeSelector(false)
      setShowCamera(true)
    } else if (mode === 'upload') {
      // Récupérer le fichier depuis sessionStorage
      const fileUrl = sessionStorage.getItem('upload-file-url')
      const fileName = sessionStorage.getItem('upload-file-name')
      const fileType = sessionStorage.getItem('upload-file-type')

      if (fileUrl && fileName && fileType) {
        // Créer un fichier à partir de l'URL
        fetch(fileUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], fileName, { type: fileType })
            const isVideo = fileType.startsWith('video/')
            setCapturedMedia({
              file,
              previewUrl: fileUrl,
              type: isVideo ? 'video' : 'image'
            })
            setShowModeSelector(false)
            setShowPublishEditor(true)

            // Nettoyer le sessionStorage
            sessionStorage.removeItem('upload-file-url')
            sessionStorage.removeItem('upload-file-name')
            sessionStorage.removeItem('upload-file-type')
          })
      }
    }
  }, [mode])

  // Handler pour la capture depuis la caméra
  const handleCameraCapture = useCallback((file: File) => {
    console.log('📹 Fichier capturé:', file.name, file.type, file.size)

    const isVideo = file.type.startsWith('video/')
    const previewUrl = URL.createObjectURL(file)

    setCapturedMedia({
      file,
      previewUrl,
      type: isVideo ? 'video' : 'image'
    })

    setShowCamera(false)
    setShowModeSelector(false)
    setShowPublishEditor(true)
  }, [])

  // Handler pour la publication
  const handlePublish = useCallback(async (data: {
    file: File
    description: string
    location: string
    visibility: 'public' | 'private' | 'premium'
    price?: number
  }) => {
    setIsPublishing(true)
    console.log('📤 Publication en cours:', data)

    try {
      // 1. Récupérer le nombre de médias existants pour calculer la position
      const mediaResponse = await fetch('/api/media/my')
      const mediaData = await mediaResponse.json()
      const existingMediaCount = mediaData.items?.length || 0
      const newPos = Math.max(2, existingMediaCount + 2)

      // 2. ÉTAPE 1: Obtenir presigned URL
      console.log('🚀 Étape 1/3: Demande presigned URL...')
      const presignedRes = await fetch('/api/media/presigned-url', {
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
        const error = await presignedRes.json()
        console.error('❌ Échec presigned URL:', error)
        throw new Error(error.error || 'Échec presigned URL')
      }

      const { presignedUrl, publicUrl, key } = await presignedRes.json()
      console.log('✅ Presigned URL obtenue:', key)

      // 3. ÉTAPE 2: Upload direct vers R2
      console.log('🚀 Étape 2/3: Upload direct vers R2...')
      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: data.file,
        headers: { 'Content-Type': data.file.type }
      })

      if (!uploadRes.ok) {
        console.error('❌ Upload R2 échoué:', uploadRes.status)
        throw new Error(`Upload R2 échoué: ${uploadRes.status}`)
      }

      console.log('✅ Upload R2 réussi')

      // 4. ÉTAPE 3: Confirmer et sauvegarder métadonnées
      console.log('🚀 Étape 3/3: Confirmation et métadonnées...')
      const confirmRes = await fetch('/api/media/confirm-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          publicUrl,
          key,
          type: data.file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
          visibility: data.visibility,
          pos: newPos,
          description: data.description || undefined,
          price: data.visibility === 'premium' && data.price ? data.price : undefined
        })
      })

      if (!confirmRes.ok) {
        const error = await confirmRes.json()
        console.error('❌ Échec confirmation:', error)
        throw new Error(error.error || 'Échec confirmation')
      }

      const result = await confirmRes.json()
      console.log('✅ Upload complet:', result.mediaId)

      if (result.success) {
        setMessage(`${data.file.type.startsWith('video/') ? 'Vidéo' : 'Photo'} publiée avec succès !`)

        // Rediriger directement vers le profil
        const redirectUrl = result.redirectUrl || (result.userType === 'CLUB' ? '/profile-test/club' : '/profile')
        window.location.href = redirectUrl
      } else {
        throw new Error(result.error || 'Erreur inconnue')
      }

    } catch (error) {
      console.error('❌ Erreur publication:', error)
      setError(error instanceof Error ? error.message : 'Publication échouée')
      setIsPublishing(false)
      setTimeout(() => setError(null), 5000)
    }
  }, [])

  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundColor: '#0B0B0B',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-full">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Retour"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Studio médias</h1>
          <div style={{ width: '44px' }} />
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Sélecteur de mode photo/vidéo */}
      {showModeSelector && !showCamera && !showPublishEditor && (
        <div className="pt-14 flex flex-col items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-8">Que souhaitez-vous créer ?</h2>

            <div className="space-y-4">
              {/* Bouton Vidéo */}
              <button
                onClick={() => {
                  setCameraMode('video')
                  setShowModeSelector(false)
                  setShowCamera(true)
                }}
                className="w-full p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Video className="text-white" size={32} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-white mb-1">Vidéo</h3>
                    <p className="text-sm text-gray-400">Capturer une vidéo</p>
                  </div>
                </div>
              </button>

              {/* Bouton Photo */}
              <button
                onClick={() => {
                  setCameraMode('photo')
                  setShowModeSelector(false)
                  setShowCamera(true)
                }}
                className="w-full p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Camera className="text-white" size={32} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-white mb-1">Photo</h3>
                    <p className="text-sm text-gray-400">Prendre une photo</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Écran caméra */}
      {showCamera && (
        <CameraCapturePro
          mode={cameraMode}
          onClose={() => {
            setShowCamera(false)
            setShowModeSelector(true)
          }}
          onCapture={handleCameraCapture}
        />
      )}

      {/* Éditeur de publication */}
      {showPublishEditor && capturedMedia && (
        <PublishMediaEditor
          mediaFile={capturedMedia.file}
          mediaUrl={capturedMedia.previewUrl}
          mediaType={capturedMedia.type}
          onClose={() => {
            setShowPublishEditor(false)
            setCapturedMedia(null)
          }}
          onPublish={handlePublish}
        />
      )}
    </div>
  )
}
