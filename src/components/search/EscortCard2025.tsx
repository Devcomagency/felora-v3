'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Play, MapPin, Star, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { buildCdnUrl } from '@/lib/media/cdn'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('search')
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleCardClick = () => {
    router.push(`/profile/${escort.id}`)
  }

  const getMediaUrl = () => {
    // Pour les vidéos, utiliser le thumbnail au lieu de l'URL playlist
    const rawUrl = escort.heroMedia?.type === 'VIDEO'
      ? (escort.heroMedia?.thumb || escort.heroMedia?.url || escort.profilePhoto)
      : (escort.heroMedia?.url || escort.profilePhoto)

    if (!rawUrl) return null

    // buildCdnUrl gère déjà le nettoyage des préfixes "undefined/" et "null/"
    return buildCdnUrl(rawUrl)
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
              <span className="text-xs font-medium text-white">✓ {t('verified')}</span>
            </div>
          )}
          {escort.availableNow && (
            <div className="px-2 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm border border-emerald-400/30">
              <span className="text-xs font-medium text-white">{t('available')}</span>
            </div>
          )}
        </div>

        {/* Contenu en bas */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Nom */}
          <div className="mb-2">
            <h3 className="text-white font-bold text-lg leading-tight mb-1">
              {escort.stageName}
            </h3>
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <MapPin size={12} />
              <span>{escort.city || 'Suisse'}</span>
            </div>
          </div>

          {/* Badge médias privés */}
          {(escort.hasPrivatePhotos || escort.hasPrivateVideos) && (
            <div className="inline-flex px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30">
              <span className="text-xs font-medium text-white">🔒 {t('privateMedia')}</span>
            </div>
          )}
        </div>

        {/* Effet de hover avec halo rose/violet */}
        <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  )
}
