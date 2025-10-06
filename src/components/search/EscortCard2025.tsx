'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Heart, Play, MapPin, Star, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EscortCard2025Props {
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
    availableNow?: boolean
    outcall?: boolean
    incall?: boolean
    hasPrivatePhotos?: boolean
    hasPrivateVideos?: boolean
    hasWebcamLive?: boolean
    rating?: number
    reviewCount?: number
    views?: number
    likes?: number
    status?: string
    updatedAt: string
  }
  onLike?: (id: string) => void
  isLiked?: boolean
  priority?: boolean
}

export default function EscortCard2025({ escort, onLike, isLiked = false, priority = false }: EscortCard2025Props) {
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
    if (escort.heroMedia?.url) return escort.heroMedia.url
    if (escort.profilePhoto) return escort.profilePhoto
    return null
  }

  const isVideo = escort.heroMedia?.type === 'VIDEO'

  return (
    <div
      onClick={handleCardClick}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer card-hover"
    >
      {/* Image principale */}
      <div className="relative w-full h-full">
        {getMediaUrl() && !imageError ? (
          <Image
            src={getMediaUrl()!}
            alt={escort.stageName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={priority}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
            <div className="text-4xl">✨</div>
          </div>
        )}
        
        {/* Overlay dégradé */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Badges en haut */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {escort.isVerifiedBadge && (
            <div className="px-2 py-1 rounded-full bg-gradient-to-r from-pink-500/90 to-purple-500/90 backdrop-blur-sm border border-white/20">
              <span className="text-xs font-medium text-white">✓ Vérifiée</span>
            </div>
          )}
          {escort.availableNow && (
            <div className="px-2 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm border border-emerald-400/30">
              <span className="text-xs font-medium text-white">Disponible</span>
            </div>
          )}
        </div>

        {/* Bouton like */}
        <button
          onClick={handleLike}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${
            isLiked 
              ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30' 
              : 'bg-black/40 hover:bg-black/60 text-white/80'
          }`}
        >
          <Heart size={16} className={isLiked ? 'fill-current' : ''} />
        </button>

        {/* Contenu en bas */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Nom et âge */}
          <div className="mb-2">
            <h3 className="text-white font-semibold text-lg leading-tight mb-1">
              {escort.stageName}
              {escort.age && <span className="text-white/70 font-normal">, {escort.age} ans</span>}
            </h3>
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <MapPin size={12} />
              <span>{escort.city || 'Suisse'}</span>
            </div>
          </div>

          {/* Stats et infos */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/70 text-xs">
              {escort.views && escort.views > 0 && (
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  <span>{escort.views}</span>
                </div>
              )}
              {escort.likes && escort.likes > 0 && (
                <div className="flex items-center gap-1">
                  <Heart size={12} />
                  <span>{escort.likes}</span>
                </div>
              )}
            </div>

            {/* Prix */}
            {escort.rate1H && (
              <div className="text-white font-medium text-sm">
                {escort.rate1H} CHF/h
              </div>
            )}
          </div>
        </div>

        {/* Effet de hover avec halo rose/violet */}
        <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  )
}
