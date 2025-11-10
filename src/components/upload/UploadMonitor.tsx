'use client'

import { useUploadStore } from '@/stores/uploadStore'
import FloatingUploadCard from './FloatingUploadCard'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

/**
 * Composant global qui monitore les uploads en cours
 * À placer dans le layout principal
 */
export default function UploadMonitor() {
  const { videoId, thumbnailUrl, fileName, pendingData, isUploading, clearUpload } = useUploadStore()
  const router = useRouter()

  if (!isUploading || !videoId || !pendingData) {
    return null
  }

  const handleComplete = (mediaId: string) => {
    toast.success('✅ Vidéo publiée avec succès !', { duration: 4000 })
    clearUpload()

    // Refresh le feed pour afficher la nouvelle vidéo
    router.refresh()
  }

  const handleError = (error: string) => {
    toast.error(`❌ Échec de l'upload : ${error}`, { duration: 6000 })
    // Ne pas clear pour permettre de retry si nécessaire
  }

  return (
    <FloatingUploadCard
      videoId={videoId}
      thumbnailUrl={thumbnailUrl}
      fileName={fileName}
      pendingData={pendingData}
      onComplete={handleComplete}
      onError={handleError}
    />
  )
}
