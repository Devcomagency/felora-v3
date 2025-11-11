'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { X, Loader2, CheckCircle, AlertCircle, ArrowUp } from 'lucide-react'

interface FloatingUploadCardProps {
  videoId: string
  thumbnailUrl: string | null
  fileName: string
  onComplete: (mediaId: string) => void
  onError: (error: string) => void
  pendingData: {
    description?: string
    visibility: string
    price?: number
    location?: string
  }
}

export default function FloatingUploadCard({
  videoId,
  thumbnailUrl,
  fileName,
  onComplete,
  onError,
  pendingData
}: FloatingUploadCardProps) {
  const [status, setStatus] = useState<'processing' | 'ready' | 'error'>('processing')
  const [bunnyStatus, setBunnyStatus] = useState<string>('queued')
  const [progress, setProgress] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const y = useMotionValue(0)
  const opacity = useTransform(y, [-100, 0], [0, 1])

  // Polling pour vérifier le statut de la vidéo (polling exponentiel optimisé)
  useEffect(() => {
    let pollTimeout: NodeJS.Timeout
    let progressInterval: NodeJS.Timeout
    let timeoutId: NodeJS.Timeout
    let pollAttempts = 0

    const checkVideoStatus = async () => {
      try {
        console.log(`🔍 Polling vidéo (attempt ${pollAttempts + 1}):`, videoId)
        const response = await fetch(`/api/media/bunny-hls-url?videoId=${videoId}`)
        const data = await response.json()

        console.log('📡 Réponse polling:', {
          success: data.success,
          status: data.status,
          hasHlsUrl: !!data.hlsUrl,
          httpStatus: response.status
        })

        // Mettre à jour le statut Bunny pour l'affichage
        if (data.status) {
          setBunnyStatus(data.status)
        }

        if (data.success && data.hlsUrl) {
          // Vidéo prête ! Finaliser la sauvegarde
          console.log('✅ Vidéo prête ! Finalisation...')
          clearTimeout(pollTimeout)
          clearInterval(progressInterval)
          setProgress(100)
          setStatus('ready')

          // Appeler l'endpoint de finalisation
          const finalizeResponse = await fetch('/api/media/bunny-finalize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              videoId,
              ...pendingData
            })
          })

          const finalizeData = await finalizeResponse.json()

          if (finalizeData.success) {
            console.log('💾 Vidéo sauvegardée en DB:', finalizeData.media.id)
            onComplete(finalizeData.media.id)

            // Auto-dismiss après 1 seconde (plus rapide)
            setTimeout(() => {
              setIsDismissed(true)
            }, 1000)
          } else {
            throw new Error(finalizeData.error || 'Erreur finalisation')
          }
        } else {
          // Vidéo pas encore prête, continuer le polling avec backoff exponentiel
          console.log(`⏳ Vidéo en traitement (status: ${data.status})`)
          pollAttempts++

          // Polling exponentiel: 500ms → 1s → 2s → 3s max
          const nextDelay = Math.min(500 * Math.pow(1.5, pollAttempts), 3000)
          pollTimeout = setTimeout(checkVideoStatus, nextDelay)
        }
      } catch (error: any) {
        console.error('❌ Erreur polling vidéo:', error)
        clearTimeout(pollTimeout)
        clearInterval(progressInterval)
        setStatus('error')
        onError(error.message || 'Erreur inconnue')
      }
    }

    // Progression plus rapide et réaliste
    let currentProgress = 0
    progressInterval = setInterval(() => {
      if (currentProgress < 90) {
        currentProgress += Math.random() * 5 // Plus rapide
        setProgress(Math.min(currentProgress, 90))
      }
    }, 800) // Toutes les 800ms (plus rapide)

    // Check immédiatement (pas d'attente initiale)
    checkVideoStatus()

    // Timeout après 5 minutes (optimisé, Bunny est rapide)
    timeoutId = setTimeout(() => {
      clearTimeout(pollTimeout)
      clearInterval(progressInterval)
      setStatus('error')
      onError('Timeout: La vidéo prend trop de temps à traiter (>5min)')
    }, 5 * 60 * 1000)

    return () => {
      clearTimeout(pollTimeout)
      clearInterval(progressInterval)
      clearTimeout(timeoutId)
    }
  }, [videoId, pendingData, onComplete, onError])

  // Gestion du swipe vers le haut pour minimiser
  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.y < -50) {
      setIsMinimized(true)
    } else if (info.offset.y > 50 && isMinimized) {
      setIsMinimized(false)
    }
  }

  if (isDismissed) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-4 left-4 right-4 z-50 pointer-events-auto"
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: isMinimized ? -60 : 0,
          opacity: isMinimized ? 0.8 : 1
        }}
        exit={{ y: -100, opacity: 0 }}
        drag="y"
        dragConstraints={{ top: -100, bottom: 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y, opacity }}
      >
        <div className="relative bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Header avec close button */}
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center gap-3">
              {status === 'processing' && (
                <Loader2 className="w-5 h-5 text-[#FF6B9D] animate-spin" />
              )}
              {status === 'ready' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}

              <div>
                <h3 className="text-sm font-semibold text-white">
                  {status === 'processing' && (
                    bunnyStatus === 'queued' ? 'En attente...' :
                    bunnyStatus === 'encoding' ? 'Encodage vidéo...' :
                    'Traitement en cours...'
                  )}
                  {status === 'ready' && 'Vidéo publiée ! ✨'}
                  {status === 'error' && 'Erreur d\'upload'}
                </h3>
                <p className="text-xs text-white/60 truncate max-w-[200px]">
                  {status === 'processing' && (
                    bunnyStatus === 'encoding' ? 'Conversion en cours, cela peut prendre quelques minutes...' :
                    fileName
                  )}
                  {status === 'ready' && fileName}
                  {status === 'error' && fileName}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Preview + Progress */}
          <div className="flex items-center gap-4 px-4 pb-4">
            {/* Thumbnail preview */}
            {thumbnailUrl && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={thumbnailUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {status === 'processing' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
            )}

            {/* Progress bar */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/80">
                  {status === 'processing' && `${Math.round(progress)}%`}
                  {status === 'ready' && 'Terminé'}
                  {status === 'error' && 'Échec'}
                </span>
                {status === 'processing' && (
                  <span className="text-xs text-white/50">
                    ~{Math.max(1, Math.round((100 - progress) / 15))} min
                  </span>
                )}
              </div>

              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    status === 'ready'
                      ? 'bg-green-500'
                      : status === 'error'
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-[#FF6B9D] to-[#B794F6]'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Swipe indicator */}
          {!isMinimized && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex flex-col items-center gap-0.5"
              >
                <ArrowUp className="w-3 h-3 text-white/30" />
                <span className="text-[10px] text-white/30">Swipe up</span>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
