'use client'

import { Player } from '@livepeer/react'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react'
import { useState } from 'react'

interface HLSVideoPlayerProps {
  playbackId?: string // Livepeer playback ID
  hlsUrl?: string // URL HLS directe
  poster?: string // Thumbnail
  title?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean // Afficher les contrôles natifs ou custom
}

/**
 * Lecteur vidéo HLS avec qualité adaptative
 * Supporte Livepeer playback ID ou URL HLS directe
 */
export default function HLSVideoPlayer({
  playbackId,
  hlsUrl,
  poster,
  title,
  className = '',
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true
}: HLSVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(muted)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)

  // Priorité: playbackId > hlsUrl
  const src = playbackId
    ? `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`
    : hlsUrl

  if (!src) {
    return (
      <div className={`bg-gray-900 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center text-white/60 p-8">
          <Play size={48} className="mx-auto mb-4 opacity-30" />
          <p>Aucune source vidéo disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Lecteur Livepeer avec support HLS adaptatif */}
      <Player
        src={src}
        poster={poster}
        title={title}
        autoPlay={autoPlay}
        muted={isMuted}
        loop={loop}
        controls={controls}
        objectFit="contain"
        theme={{
          colors: {
            accent: '#FF6B9D', // Rose Felora
            containerBorderColor: 'rgba(255, 255, 255, 0.1)',
          },
          fonts: {
            display: 'Inter, sans-serif',
          },
          space: {
            controlsBottomMarginX: '10px',
            controlsBottomMarginY: '10px',
          },
          radii: {
            containerBorderRadius: '16px',
          }
        }}
        className="w-full h-full rounded-xl overflow-hidden"
      >
        {/* Overlay custom si nécessaire */}
        {!controls && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {!isPlaying && (
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                <Play size={32} className="text-white ml-1" />
              </div>
            )}
          </div>
        )}
      </Player>

      {/* Indicateur de qualité */}
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        <Settings size={12} className="inline mr-1" />
        HLS Adaptatif
      </div>

      {/* Titre en overlay */}
      {title && (
        <div className="absolute bottom-4 left-4 right-4 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-sm font-medium truncate">{title}</p>
        </div>
      )}
    </div>
  )
}

/**
 * Version compacte pour les thumbnails
 */
export function HLSVideoThumbnail({
  playbackId,
  hlsUrl,
  poster,
  title,
  className = '',
  onClick
}: HLSVideoPlayerProps & { onClick?: () => void }) {
  const src = playbackId
    ? `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`
    : hlsUrl

  return (
    <div
      className={`relative cursor-pointer group ${className}`}
      onClick={onClick}
    >
      {/* Poster image */}
      {poster ? (
        <img
          src={poster}
          alt={title || 'Vidéo'}
          className="w-full h-full object-cover rounded-xl"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl flex items-center justify-center">
          <Play size={48} className="text-white/60" />
        </div>
      )}

      {/* Overlay hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
          <Play size={24} className="text-white ml-1" />
        </div>
      </div>

      {/* Badge HLS */}
      <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
        HLS
      </div>

      {/* Titre */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
          <p className="text-white text-sm font-medium truncate">{title}</p>
        </div>
      )}
    </div>
  )
}
