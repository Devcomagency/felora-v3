'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumb?: string
}

interface MediaGalleryProps {
  media: MediaItem[]
  className?: string
}

export default function MediaGallery({ media, className = '' }: MediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const currentMedia = media[currentIndex]

  // Auto-play video on hover/focus
  useEffect(() => {
    if (currentMedia?.type === 'video') {
      const video = videoRefs.current[currentIndex]
      if (video) {
        if (isPlaying) {
          video.play().catch(console.error)
        } else {
          video.pause()
        }
      }
    }
  }, [currentIndex, isPlaying, currentMedia])

  // Mute/unmute all videos
  useEffect(() => {
    videoRefs.current.forEach(video => {
      if (video) {
        video.muted = isMuted
      }
    })
  }, [isMuted])

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length)
    setIsPlaying(false)
  }

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length)
    setIsPlaying(false)
  }

  const handleImageError = (mediaId: string) => {
    setImageErrors(prev => new Set(prev).add(mediaId))
  }

  const handleVideoPlay = () => {
    setIsPlaying(true)
  }

  const handleVideoPause = () => {
    setIsPlaying(false)
  }

  if (!media || media.length === 0) {
    return (
      <div className={`aspect-[4/5] bg-gradient-to-br from-felora-aurora/20 to-felora-plasma/20 flex items-center justify-center rounded-2xl ${className}`}>
        <div className="text-center">
          <ImageIcon size={48} className="text-white/40 mx-auto mb-4" />
          <p className="text-white/60">Aucun média disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Main Media Display */}
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm border border-white/10">
        {currentMedia ? (
          <div className="relative w-full h-full">
            {currentMedia.type === 'video' ? (
              <video
                ref={(el) => (videoRefs.current[currentIndex] = el)}
                src={currentMedia.url}
                poster={currentMedia.thumb}
                className="w-full h-full object-cover"
                controls
                muted={isMuted}
                loop
                playsInline
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onError={() => handleImageError(currentMedia.id)}
              />
            ) : (
              <img
                src={currentMedia.url}
                alt={`Media ${currentIndex + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(currentMedia.id)}
              />
            )}

            {/* Error Fallback */}
            {imageErrors.has(currentMedia.id) && (
              <div className="absolute inset-0 bg-gradient-to-br from-felora-aurora/20 to-felora-plasma/20 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon size={48} className="text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">Média indisponible</p>
                </div>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Play/Pause Button for Videos */}
            {currentMedia.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? (
                    <Pause size={24} className="text-white" />
                  ) : (
                    <Play size={24} className="text-white ml-1" fill="currentColor" />
                  )}
                </button>
              </div>
            )}

            {/* Media Counter */}
            {media.length > 1 && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                <span className="text-sm font-medium text-white">
                  {currentIndex + 1} / {media.length}
                </span>
              </div>
            )}

            {/* Navigation Arrows */}
            {media.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={20} className="text-white" />
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={20} className="text-white" />
                </button>
              </>
            )}

            {/* Mute Button for Videos */}
            {currentMedia.type === 'video' && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                {isMuted ? (
                  <VolumeX size={18} className="text-white" />
                ) : (
                  <Volume2 size={18} className="text-white" />
                )}
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Thumbnail Strip */}
      {media.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-felora-aurora scale-105'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  poster={item.thumb}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={item.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(item.id)}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
