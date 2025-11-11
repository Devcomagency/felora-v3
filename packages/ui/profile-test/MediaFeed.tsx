'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface MediaItem {
  type: 'image' | 'video'
  url: string
  thumb?: string
  poster?: string
}

interface MediaFeedProps {
  media: MediaItem[]
  onLike?: (index: number) => Promise<void>
  onSave?: (index: number) => Promise<void>
  className?: string
}

interface MediaPlayerProps extends MediaItem {
  index: number
  isActive: boolean
  onLike?: () => Promise<void>
  onSave?: () => Promise<void>
}

function MediaPlayer({ type, url, thumb, poster, index, isActive, onLike, onSave }: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  // Auto-play logic for videos when in view
  useEffect(() => {
    const video = videoRef.current
    if (!video || type !== 'video') return

    if (isActive) {
      // Play when active
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setError(true))
    } else {
      // Pause when inactive
      video.pause()
      setIsPlaying(false)
    }
  }, [isActive, type])

  // Handle video play/pause click
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setError(true))
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [])

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }, [])

  // Optimistic like handler
  const handleLike = useCallback(async () => {
    if (loading || !onLike) return
    
    setLoading(true)
    const previousState = liked
    setLiked(!liked)
    
    try {
      await onLike()
    } catch (error) {
      console.warn('Like failed:', error)
      setLiked(previousState) // Rollback
    } finally {
      setLoading(false)
    }
  }, [liked, loading, onLike])

  // Optimistic save handler
  const handleSave = useCallback(async () => {
    if (loading || !onSave) return
    
    setLoading(true)
    const previousState = saved
    setSaved(!saved)
    
    try {
      await onSave()
    } catch (error) {
      console.warn('Save failed:', error)
      setSaved(previousState) // Rollback
    } finally {
      setLoading(false)
    }
  }, [saved, loading, onSave])

  if (type === 'video') {
    return (
      <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted={isMuted}
          loop
          playsInline
          poster={poster || thumb}
          onError={() => setError(true)}
          onLoadStart={() => setLoading(true)}
          onCanPlay={() => setLoading(false)}
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-white text-center">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">Video unavailable</p>
            </div>
          </div>
        )}

        {/* Play/Pause overlay */}
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {!isPlaying && !error && (
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          )}
        </button>

        {/* Controls overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              {isMuted ? (
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.777L4.146 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.146l4.237-3.777zm7.617 2.924a1 1 0 00-1.414-1.414L13 7.172l-2.586-2.586a1 1 0 00-1.414 1.414L11.586 8.586 9 11.172a1 1 0 101.414 1.414L13 10l2.586 2.586A1 1 0 0017 11.172L14.414 8.586 17 6z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.777L4.146 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.146l4.237-3.777z" clipRule="evenodd" />
              )}
            </svg>
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              disabled={loading}
              className={`
                p-2 backdrop-blur-sm rounded-full transition-all duration-200
                ${liked 
                  ? 'bg-red-500/30 text-red-400' 
                  : 'bg-black/50 text-white hover:bg-black/70'
                }
              `}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={liked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className={`
                p-2 backdrop-blur-sm rounded-full transition-all duration-200
                ${saved 
                  ? 'bg-yellow-500/30 text-yellow-400' 
                  : 'bg-black/50 text-white hover:bg-black/70'
                }
              `}
              aria-label={saved ? 'Unsave' : 'Save'}
            >
              <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={saved ? 0 : 2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Image player
  // Utiliser le thumbnail pour les vidéos, sinon l'URL directe
  const imageSrc = thumb || url

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
      <Image
        src={imageSrc}
        alt={`Media ${index + 1}`}
        fill
        className="object-cover"
        onError={() => setError(true)}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
      />

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-white text-center">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}

      {/* Action buttons for images */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`
            p-2 backdrop-blur-sm rounded-full transition-all duration-200
            ${liked 
              ? 'bg-red-500/30 text-red-400' 
              : 'bg-black/50 text-white hover:bg-black/70'
            }
          `}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={liked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className={`
            p-2 backdrop-blur-sm rounded-full transition-all duration-200
            ${saved 
              ? 'bg-yellow-500/30 text-yellow-400' 
              : 'bg-black/50 text-white hover:bg-black/70'
            }
          `}
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={saved ? 0 : 2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function MediaFeed({ media, onLike, onSave, className = '' }: MediaFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [preloadedIndexes, setPreloadedIndexes] = useState(new Set([0]))

  // Intersection Observer for auto-play
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0')
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setActiveIndex(index)
            
            // Preload next media
            const nextIndex = index + 1
            if (nextIndex < media.length) {
              setPreloadedIndexes(prev => new Set([...prev, nextIndex]))
            }
          }
        })
      },
      { threshold: 0.5, rootMargin: '-10%' }
    )

    // Observe all media items
    const items = container.querySelectorAll('[data-index]')
    items.forEach(item => observer.observe(item))

    return () => observer.disconnect()
  }, [media.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          if (activeIndex > 0) {
            const prevElement = containerRef.current.querySelector(`[data-index="${activeIndex - 1}"]`)
            prevElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          if (activeIndex < media.length - 1) {
            const nextElement = containerRef.current.querySelector(`[data-index="${activeIndex + 1}"]`)
            nextElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
          break
        case 'm':
        case 'M':
          // Toggle mute for active video
          const activeVideo = containerRef.current.querySelector(`[data-index="${activeIndex}"] video`) as HTMLVideoElement
          if (activeVideo) {
            activeVideo.muted = !activeVideo.muted
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, media.length])

  if (!media.length) {
    return (
      <div className={`glass-card p-8 text-center ${className}`}>
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-lg font-semibold text-gray-300">No Media Available</p>
          <p className="text-sm">This profile hasn't uploaded any photos or videos yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`space-y-4 ${className}`}>
      {media.map((item, index) => (
        <div
          key={`${item.url}-${index}`}
          data-index={index}
          className="w-full h-[500px] md:h-[600px]"
        >
          {(preloadedIndexes.has(index) || index === activeIndex) && (
            <MediaPlayer
              {...item}
              index={index}
              isActive={index === activeIndex}
              onLike={onLike ? () => onLike(index) : undefined}
              onSave={onSave ? () => onSave(index) : undefined}
            />
          )}
        </div>
      ))}
    </div>
  )
}