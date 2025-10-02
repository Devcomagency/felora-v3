'use client'

import { useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { Play, Settings } from 'lucide-react'
import type Player from 'video.js/dist/types/player'

interface HLSVideoPlayerProps {
  playbackId?: string
  hlsUrl?: string
  poster?: string
  title?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
}

/**
 * Lecteur vidéo HLS avec Video.js
 * Support natif HLS + qualité adaptative
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player | null>(null)

  // Construire l'URL source
  const src = playbackId
    ? `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`
    : hlsUrl

  useEffect(() => {
    if (!videoRef.current || !src) return

    // Initialiser Video.js
    const player = videojs(videoRef.current, {
      controls,
      autoplay: autoPlay,
      muted,
      loop,
      poster,
      fluid: true,
      responsive: true,
      html5: {
        vhs: {
          // Options HLS
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: true,
        }
      },
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'qualitySelector',
          'fullscreenToggle'
        ]
      }
    })

    playerRef.current = player

    // Charger la source
    player.src({
      src,
      type: 'application/x-mpegURL'
    })

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [src, autoPlay, muted, loop, poster, controls])

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
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-theme-felora"
        />
      </div>

      {/* Indicateur HLS */}
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <Settings size={12} className="inline mr-1" />
        HLS Adaptatif
      </div>

      {/* Titre */}
      {title && (
        <div className="absolute bottom-4 left-4 right-4 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <p className="text-sm font-medium truncate">{title}</p>
        </div>
      )}

      {/* Style custom pour Video.js */}
      <style jsx global>{`
        .video-js.vjs-theme-felora {
          border-radius: 16px;
          overflow: hidden;
        }

        .video-js.vjs-theme-felora .vjs-big-play-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 80px;
          height: 80px;
          line-height: 80px;
          font-size: 2em;
        }

        .video-js.vjs-theme-felora .vjs-big-play-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .video-js.vjs-theme-felora .vjs-control-bar {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
          border-radius: 0 0 16px 16px;
        }

        .video-js.vjs-theme-felora .vjs-slider {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .video-js.vjs-theme-felora .vjs-play-progress {
          background: linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%);
        }
      `}</style>
    </div>
  )
}

/**
 * Version compacte pour thumbnails
 */
export function HLSVideoThumbnail({
  playbackId,
  hlsUrl,
  poster,
  title,
  className = '',
  onClick
}: HLSVideoPlayerProps & { onClick?: () => void }) {
  return (
    <div
      className={`relative cursor-pointer group ${className}`}
      onClick={onClick}
    >
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
