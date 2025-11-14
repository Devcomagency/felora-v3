'use client'

import { useState, useCallback, memo } from 'react'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { Plus, ChevronLeft, Home, Search, User } from 'lucide-react'

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

  const [showCamera, setShowCamera] = useState(false)
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

      // 2. Préparer le FormData
      const formData = new FormData()
      formData.append('media', data.file)
      formData.append('type', data.file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE')
      formData.append('pos', newPos.toString())
      formData.append('description', data.description || '')
      formData.append('visibility', data.visibility)

      if (data.location) {
        formData.append('location', data.location)
      }

      if (data.visibility === 'premium' && data.price) {
        formData.append('price', data.price.toString())
      }

      console.log('📤 Envoi vers /api/media/upload')

      // 3. Upload
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erreur upload:', errorText)
        throw new Error(`Échec de l'upload: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Résultat upload:', result)

      if (result.success) {
        setMessage(`${data.file.type.startsWith('video/') ? 'Vidéo' : 'Photo'} publiée avec succès !`)

        // Rediriger vers le profil après 2 secondes
        setTimeout(() => {
          const redirectUrl = result.redirectUrl || (result.userType === 'CLUB' ? '/profile-test/club' : '/profile')
          window.location.href = redirectUrl
        }, 2000)
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

      {/* Page principale */}
      {!showCamera && !showPublishEditor && (
        <div className="pt-14 flex flex-col items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <div
              className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] flex items-center justify-center shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer"
              onClick={() => setShowCamera(true)}
            >
              <Plus className="w-16 h-16 text-white" />
            </div>

            <p className="text-white/80 text-lg font-medium">Créer du contenu</p>
            <p className="text-white/60 text-sm mt-2">Appuyez pour commencer</p>
          </div>
        </div>
      )}

      {/* Bouton flottant */}
      {isEscortOrClub && !showCamera && !showPublishEditor && (
        <button
          onClick={() => setShowCamera(true)}
          className="fixed bottom-24 left-4 w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] flex items-center justify-center shadow-2xl hover:scale-105 transition-all duration-200 z-50"
        >
          <Plus className="w-10 h-10 text-white" />
        </button>
      )}

      {/* Footer navigation */}
      {isEscortOrClub && !showCamera && !showPublishEditor && (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-md border-t border-white/10 z-40">
          <div className="flex items-center justify-center h-full px-4 gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="flex flex-col items-center justify-center min-w-16 h-16 p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Home className="w-6 h-6 text-white/70" />
              <span className="text-xs text-white/70 mt-1">Accueil</span>
            </button>

            <button
              onClick={() => window.location.href = '/search'}
              className="flex flex-col items-center justify-center min-w-16 h-16 p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Search className="w-6 h-6 text-white/70" />
              <span className="text-xs text-white/70 mt-1">Recherche</span>
            </button>

            <button
              onClick={() => {
                const profileUrl = (session?.user as any)?.clubProfile || session?.user?.email?.includes('club')
                  ? '/club/profile'
                  : '/profile'
                window.location.href = profileUrl
              }}
              className="flex flex-col items-center justify-center min-w-16 h-16 p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <User className="w-6 h-6 text-white/70" />
              <span className="text-xs text-white/70 mt-1">Profil</span>
            </button>
          </div>
        </div>
      )}

      {/* Écran caméra */}
      {showCamera && (
        <CameraCapturePro
          mode="video"
          onClose={() => setShowCamera(false)}
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
