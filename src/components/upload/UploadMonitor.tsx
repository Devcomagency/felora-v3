'use client'

import { useEffect } from 'react'
import { useUploadStore } from '@/stores/uploadStore'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

/**
 * Composant global qui monitore les uploads vidéo et gère le polling Bunny
 * Progression fluide 95% → 100% pendant l'encodage
 */
export default function UploadMonitor() {
  const { videoId, pendingData, isUploading, clearUpload } = useUploadStore()
  const router = useRouter()

  useEffect(() => {
    if (!isUploading || !videoId || !pendingData) return

    let pollTimeout: NodeJS.Timeout
    let progressInterval: NodeJS.Timeout
    let currentProgress = 95

    // Progression fluide de 95% à 99% pendant l'encodage
    progressInterval = setInterval(() => {
      if (currentProgress < 99) {
        currentProgress += 0.5
        useUploadStore.setState({
          progress: Math.min(currentProgress, 99),
          message: 'Encodage...'
        })
      }
    }, 2000) // +0.5% toutes les 2 secondes

    const checkVideoStatus = async () => {
      try {
        const response = await fetch(`/api/media/bunny-hls-url?videoId=${videoId}`)
        const data = await response.json()

        if (data.success && data.hlsUrl) {
          // Vidéo prête ! Finaliser
          clearInterval(progressInterval)
          useUploadStore.setState({ progress: 100, message: 'Finalisation...' })

          const finalizeResponse = await fetch('/api/media/bunny-finalize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ videoId, ...pendingData })
          })

          const finalizeData = await finalizeResponse.json()

          if (finalizeData.success) {
            useUploadStore.setState({
              progress: 100,
              message: '✓ Publié !',
              status: 'success'
            })
            toast.success('✓ Vidéo publiée !', { duration: 2000 })

            setTimeout(() => {
              clearUpload()
              router.refresh()
            }, 2000)
          } else {
            throw new Error(finalizeData.error)
          }
        } else {
          // Continuer le polling avec backoff exponentiel
          const nextDelay = Math.min(500 * 1.5, 3000)
          pollTimeout = setTimeout(checkVideoStatus, nextDelay)
        }
      } catch (error: any) {
        clearInterval(progressInterval)
        clearTimeout(pollTimeout)
        useUploadStore.setState({
          status: 'error',
          message: `✗ Erreur: ${error.message}`
        })
        toast.error(`✗ Erreur: ${error.message}`, { duration: 5000 })
        setTimeout(() => clearUpload(), 5000)
      }
    }

    // Démarrer le polling
    checkVideoStatus()

    return () => {
      clearTimeout(pollTimeout)
      clearInterval(progressInterval)
    }
  }, [videoId, pendingData, isUploading, clearUpload, router])

  return null // Pas de UI, tout passe par GlobalUploadProgress
}
