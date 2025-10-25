'use client'

import { useState } from 'react'
import { Heart, Play, Image as ImageIcon, Verified } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { buildCdnUrl } from '@/lib/media/cdn'

interface EscortCardProps {
  escort: {
    id: string
    stageName: string
    age?: number
    city?: string
    canton?: string
    isVerifiedBadge?: boolean
    isActive?: boolean
    profilePhoto?: string
    heroMedia?: { type: 'IMAGE'|'VIDEO'; url: string; thumb?: string }
    languages?: string[]
    services?: string[]
    rate1H?: number
    rate2H?: number
    rateOvernight?: number
    latitude?: number
    longitude?: number
    updatedAt: string
    // Nouveaux champs V2
    height?: number
    bodyType?: string
    hairColor?: string
    eyeColor?: string
    ethnicity?: string
    bustSize?: string
    tattoos?: string
    piercings?: string
    availableNow?: boolean
    outcall?: boolean
    incall?: boolean
    weekendAvailable?: boolean
    hasPrivatePhotos?: boolean
    hasPrivateVideos?: boolean
    hasWebcamLive?: boolean
    messagingPreference?: string
    minimumDuration?: string
    acceptsCards?: boolean
    rating?: number
    reviewCount?: number
    views?: number
    likes?: number
    status?: string
  }
  onLike?: (id: string) => void
  isLiked?: boolean
}

export default function EscortCard({ escort, onLike, isLiked = false }: EscortCardProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleCardClick = () => {
    router.push(`/profile/${escort.id}`)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    onLike?.(escort.id)
  }


  const getMediaUrl = () => {
    const rawUrl = escort.heroMedia?.url || escort.profilePhoto
    if (!rawUrl) return null

    // buildCdnUrl gère déjà le nettoyage des préfixes "undefined/" et "null/"
    return buildCdnUrl(rawUrl)
  }

  const isVideo = escort.heroMedia?.type === 'VIDEO'

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-black/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-2xl"
    >
      {/* Media Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {getMediaUrl() && !imageError ? (
          <div className="relative w-full h-full">
            {isVideo ? (
              <video
                src={escort.heroMedia.url}
                poster={escort.heroMedia.thumb}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                onMouseEnter={() => setIsPlaying(true)}
                onMouseLeave={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <img
                src={getMediaUrl()!}
                alt={escort.stageName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            )}
            
            {/* Play Button for Video */}
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play size={20} className="text-white ml-1" fill="currentColor" />
                </div>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-felora-aurora/20 to-felora-plasma/20 flex items-center justify-center">
            <ImageIcon size={48} className="text-white/40" />
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {escort.isVerifiedBadge && (
            <div className="px-2 py-1 rounded-full bg-felora-aurora/90 backdrop-blur-sm flex items-center gap-1">
              <Verified size={12} className="text-white" />
              <span className="text-xs font-medium text-white">Vérifié</span>
            </div>
          )}
          {escort.availableNow && (
            <div className="px-2 py-1 rounded-full bg-green-500/90 backdrop-blur-sm">
              <span className="text-xs font-medium text-white">Dispo maintenant</span>
            </div>
          )}
          {escort.hasWebcamLive && (
            <div className="px-2 py-1 rounded-full bg-purple-500/90 backdrop-blur-sm">
              <span className="text-xs font-medium text-white">Live</span>
            </div>
          )}
        </div>

        {/* Favori Button */}
        <button
          onClick={handleLike}
          className={`absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-sm transition-colors ${
            isLiked 
              ? 'bg-red-500/20 border border-red-500/50' 
              : 'bg-black/40 hover:bg-black/60'
          }`}
        >
          <span className={`text-xs font-medium ${isLiked ? 'text-red-400' : 'text-white/80'}`}>
            Favori
          </span>
        </button>

      </div>

      {/* Simple Content */}
      <div className="p-3">
        <h3 className="text-lg font-bold text-white truncate mb-1">
          {escort.stageName}
        </h3>
        <span className="text-sm text-white/60">
          Escorte
        </span>
      </div>

    </div>
  )
}
