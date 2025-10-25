'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause, VolumeX, Volume2, AlertTriangle } from 'lucide-react'

interface OptimizedVideoPlayerProps {
  src: string
  poster?: string
  className?: string
  onError?: (error: any) => void
  onLoadStart?: () => void
  onCanPlay?: () => void
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
}

export default function OptimizedVideoPlayer({
  src,
  poster,
  className = '',
  onError,
  onLoadStart,
  onCanPlay,
  autoPlay = false,
  loop = true,
  muted = true,
  playsInline = true
}: OptimizedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Validation de l'URL
  const isValidUrl = useCallback((url: string) => {
    if (!url || url.includes('undefined') || url.includes('null') || url.startsWith('media:')) {
      return false
    }
    return url.startsWith('http') || url.startsWith('/')
  }, [])

  // Gestion des erreurs avec retry
  const handleError = useCallback((error: any) => {
    console.error('❌ Erreur vidéo:', {
      errorCode: error?.code,
      errorMessage: error?.message,
      src: videoRef.current?.src,
      networkState: videoRef.current?.networkState,
      readyState: videoRef.current?.readyState,
      retryCount
    })

    setHasError(true)
    setIsLoading(false)
    setIsPlaying(false)

    // Retry automatique (max 3 tentatives)
    if (retryCount < 3 && isValidUrl(src)) {
      console.log(`🔄 Tentative de reconnexion ${retryCount + 1}/3...`)
      setTimeout(() => {
        setRetryCount(prev => prev + 1)
        setHasError(false)
        if (videoRef.current) {
          videoRef.current.load()
        }
      }, 1000 * (retryCount + 1)) // Délai progressif
    } else {
      onError?.(error)
    }
  }, [src, retryCount, isValidUrl, onError])

  // Gestion du chargement
  const handleLoadStart = useCallback(() => {
    setIsLoading(true)
    setHasError(false)
    onLoadStart?.()
  }, [onLoadStart])

  const handleCanPlay = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onCanPlay?.()
  }, [onCanPlay])

  // Gestion de la lecture
  const handlePlay = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(error => {
        console.warn('Autoplay failed:', error)
      })
    }
  }, [isPlaying])

  // Gestion des contrôles
  const handleMouseEnter = useCallback(() => {
    setShowControls(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setShowControls(false)
  }, [])

  // Reset du retry count quand l'URL change
  useEffect(() => {
    setRetryCount(0)
    setHasError(false)
  }, [src])

  // Validation de l'URL au montage
  useEffect(() => {
    if (!isValidUrl(src)) {
      console.warn('⚠️ URL vidéo invalide:', src)
      setHasError(true)
    }
  }, [src, isValidUrl])

  if (!isValidUrl(src)) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 text-white ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-red-500" />
          <p className="text-sm">URL vidéo invalide</p>
        </div>
      </div>
    )
  }

  if (hasError && retryCount >= 3) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 text-white ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-red-500" />
          <p className="text-sm">Vidéo non disponible</p>
          <button 
            onClick={() => {
              setRetryCount(0)
              setHasError(false)
              if (videoRef.current) {
                videoRef.current.load()
              }
            }}
            className="mt-2 px-3 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={poster}
        preload="none"
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        onClick={togglePlayPause}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        style={{
          minWidth: '100%',
          minHeight: '100%',
          maxWidth: 'none',
          maxHeight: 'none'
        }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Play/Pause button */}
      {showControls && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlayPause}
            className="bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      )}

      {/* Retry indicator */}
      {retryCount > 0 && retryCount < 3 && (
        <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded">
          Reconnexion {retryCount}/3...
        </div>
      )}
    </div>
  )
}
