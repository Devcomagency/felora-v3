'use client'

import { useState } from 'react'
import { Heart, MapPin, Star, Play, Image as ImageIcon, Verified } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
    latitude?: number
    longitude?: number
    updatedAt: string
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

  const formatPrice = (price?: number) => {
    if (!price) return null
    return `${price} CHF/h`
  }

  const getTimeAgo = (updatedAt: string) => {
    const now = new Date()
    const updated = new Date(updatedAt)
    const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'À l\'instant'
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`
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
          {escort.isActive && (
            <div className="px-2 py-1 rounded-full bg-green-500/90 backdrop-blur-sm">
              <span className="text-xs font-medium text-white">En ligne</span>
            </div>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
        >
          <Heart 
            size={18} 
            className={`transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} 
          />
        </button>

        {/* Price Badge */}
        {escort.rate1H && (
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm">
            <span className="text-sm font-semibold text-white">
              {formatPrice(escort.rate1H)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name and Age */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white truncate">
            {escort.stageName}
          </h3>
          {escort.age && (
            <span className="text-sm text-white/60 ml-2">
              {escort.age} ans
            </span>
          )}
        </div>

        {/* Location */}
        {(escort.city || escort.canton) && (
          <div className="flex items-center gap-1 mb-3">
            <MapPin size={14} className="text-white/60" />
            <span className="text-sm text-white/60">
              {[escort.city, escort.canton].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {/* Services Tags */}
        {escort.services && escort.services.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {escort.services.slice(0, 3).map((service, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/80"
              >
                {service}
              </span>
            ))}
            {escort.services.length > 3 && (
              <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/60">
                +{escort.services.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Languages */}
        {escort.languages && escort.languages.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {escort.languages.slice(0, 2).map((language, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-felora-aurora/20 text-felora-aurora"
              >
                {language}
              </span>
            ))}
            {escort.languages.length > 2 && (
              <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/60">
                +{escort.languages.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Updated Time */}
        <div className="text-xs text-white/40">
          {getTimeAgo(escort.updatedAt)}
        </div>
      </div>
    </div>
  )
}
