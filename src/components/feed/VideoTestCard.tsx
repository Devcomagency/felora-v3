'use client'

import { useState, useRef, useCallback } from 'react'
import { Play, Pause, AlertTriangle } from 'lucide-react'

interface VideoTestCardProps {
  src: string
  thumb?: string
  className?: string
}

export default function VideoTestCard({ src, thumb, className = '' }: VideoTestCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorDetails, setErrorDetails] = useState<any>(null)

  // Validation de l'URL
  const isValidUrl = (url: string) => {
    if (!url || url.includes('undefined') || url.includes('null') || url.startsWith('media:')) {
      return false
    }
    return url.startsWith('http') || url.startsWith('/')
  }

  // Gestion des erreurs
  const handleError = useCallback((e: any) => {
    const target = e.target as HTMLVideoElement
    const error = target.error
    
    const errorInfo = {
      errorCode: error?.code,
      errorMessage: error?.message,
      src: target.src,
      networkState: target.networkState,
      readyState: target.readyState,
      timestamp: new Date().toISOString()
    }
    
    console.error('❌ ERREUR VIDÉO TEST:', errorInfo)
    setErrorDetails(errorInfo)
    setHasError(true)
    setIsLoading(false)
    setIsPlaying(false)
  }, [])

  // Gestion du chargement
  const handleLoadStart = useCallback(() => {
    console.log('🎬 Chargement vidéo test démarré:', src)
    setIsLoading(true)
    setHasError(false)
  }, [src])

  const handleCanPlay = useCallback(() => {
    console.log('✅ Vidéo test prête:', src)
    setIsLoading(false)
    setHasError(false)
  }, [src])

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().catch(error => {
        console.warn('Erreur play:', error)
      })
      setIsPlaying(true)
    }
  }, [isPlaying])

  // Validation de l'URL au montage
  if (!isValidUrl(src)) {
    return (
      <div className={`flex items-center justify-center bg-red-900 text-white p-8 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-red-300" />
          <p className="text-sm font-bold">URL INVALIDE</p>
          <p className="text-xs mt-1">{src}</p>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-red-900 text-white p-8 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-red-300" />
          <p className="text-sm font-bold">ERREUR VIDÉO</p>
          <p className="text-xs mt-1">Code: {errorDetails?.errorCode}</p>
          <p className="text-xs">Message: {errorDetails?.errorMessage}</p>
          <button 
            onClick={() => {
              setHasError(false)
              setErrorDetails(null)
              if (videoRef.current) {
                videoRef.current.load()
              }
            }}
            className="mt-2 px-3 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-black ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={thumb}
        preload="metadata"
        loop
        muted
        playsInline
        onClick={togglePlayPause}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
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
      {!isLoading && (
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

      {/* Debug info */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
        <div>URL: {src.substring(0, 30)}...</div>
        <div>Status: {isLoading ? 'Loading' : hasError ? 'Error' : isPlaying ? 'Playing' : 'Ready'}</div>
      </div>
    </div>
  )
}
