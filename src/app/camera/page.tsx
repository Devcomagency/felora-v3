'use client'

import { useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

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

interface CapturedMedia {
  file: File
  previewUrl: string
  type: 'image' | 'video'
}

function CameraPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') as 'photo' | 'video' | 'upload' | null

  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

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
      // 1. Récupérer le nombre de médias existants
      const mediaResponse = await fetch('/api/media/my')
      const mediaData = await mediaResponse.json()
      const existingMediaCount = mediaData.items?.length || 0
      const newPos = Math.max(2, existingMediaCount + 2)

      // 2. Obtenir presigned URL
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

      if (!presignedRes.ok) throw new Error('Échec presigned URL')

      const { presignedUrl, publicUrl, key } = await presignedRes.json()

      // 3. Upload vers R2
      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: data.file,
        headers: { 'Content-Type': data.file.type }
      })

      if (!uploadRes.ok) throw new Error(`Upload R2 échoué: ${uploadRes.status}`)

      // 4. Confirmer et sauvegarder métadonnées
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

      if (!confirmRes.ok) throw new Error('Échec confirmation')

      const result = await confirmRes.json()

      if (result.success) {
        const redirectUrl = result.redirectUrl || (result.userType === 'CLUB' ? '/club/profile' : '/dashboard-escort/profil')
        router.push(redirectUrl)
      } else {
        throw new Error(result.error || 'Erreur inconnue')
      }

    } catch (error) {
      console.error('❌ Erreur publication:', error)
      alert(error instanceof Error ? error.message : 'Publication échouée')
      setIsPublishing(false)
    }
  }, [router])

  // Si fichier uploadé depuis sessionStorage
  if (mode === 'upload' && !capturedMedia) {
    const fileUrl = sessionStorage.getItem('upload-file-url')
    const fileName = sessionStorage.getItem('upload-file-name')
    const fileType = sessionStorage.getItem('upload-file-type')

    if (fileUrl && fileName && fileType) {
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

          sessionStorage.removeItem('upload-file-url')
          sessionStorage.removeItem('upload-file-name')
          sessionStorage.removeItem('upload-file-type')
        })
    }
  }

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
  if (mode === 'photo' || mode === 'video') {
    return (
      <CameraCapturePro
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
