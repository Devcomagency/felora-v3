'use client'

import { useRef, useEffect, useState } from 'react'

interface VideoGiftPlayerProps {
  giftType: 'heart' | 'diamond' | 'rose' | 'fireworks' | 'crown'
  className?: string
  autoplay?: boolean
  loop?: boolean
}

export function VideoGiftPlayer({ 
  giftType, 
  className = 'w-32 h-32',
  autoplay = true,
  loop = true
}: VideoGiftPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  const videoSources = {
    heart: '/animations/heart.mp4',
    diamond: '/animations/diamond.mp4',
    rose: '/animations/rose.mp4',
    fireworks: '/animations/fireworks.mp4',
    crown: '/animations/crown.mp4'
  }

  const fallbackColors = {
    heart: '#FF6B9D',
    diamond: '#4FD1C7',
    rose: '#EC4899',
    fireworks: '#9333EA',
    crown: '#F59E0B'
  }

  const fallbackEmojis = {
    heart: '❤️',
    diamond: '💎',
    rose: '🌹',
    fireworks: '🎆',
    crown: '👑'
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoad = () => {
      setIsLoaded(true)
      setError(false)
    }

    const handleError = () => {
      setError(true)
      setIsLoaded(false)
    }

    video.addEventListener('loadeddata', handleLoad)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadeddata', handleLoad)
      video.removeEventListener('error', handleError)
    }
  }, [giftType])

  if (error) {
    return (
      <div 
        className={`${className} flex items-center justify-center rounded-xl`}
        style={{ backgroundColor: fallbackColors[giftType] + '20' }}
      >
        <span 
          className="text-4xl"
          style={{ color: fallbackColors[giftType] }}
        >
          {fallbackEmojis[giftType]}
        </span>
      </div>
    )
  }

  return (
    <div className={`${className} relative overflow-hidden rounded-xl bg-felora-obsidian/50`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: fallbackColors[giftType] }}
          />
        </div>
      )}
      
      <video
        ref={videoRef}
        src={videoSources[giftType]}
        autoPlay={autoplay}
        loop={loop}
        muted
        playsInline
        className={`w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        style={{
          filter: 'brightness(1.1) contrast(1.1) saturate(1.2)'
        }}
      />
      
      {isLoaded && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, transparent 40%, ${fallbackColors[giftType]}10 100%)`
          }}
        />
      )}
    </div>
  )
}