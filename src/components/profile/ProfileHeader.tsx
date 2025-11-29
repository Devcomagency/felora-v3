'use client'

import { useState } from 'react'
import { Heart, Share2, Flag, Verified, MapPin, Clock, Star } from 'lucide-react'
import track from '@/lib/analytics/tracking'

interface ProfileHeaderProps {
  escort: {
    id: string
    stageName: string
    bio?: string
    city?: string
    canton?: string
    isVerifiedBadge?: boolean
    stats?: { likes?: number; views?: number; rating?: number }
    updatedAt: string
  }
  onLike?: (id: string) => void
  isLiked?: boolean
}

export default function ProfileHeader({ escort, onLike, isLiked = false }: ProfileHeaderProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)

  const handleLike = () => {
    // 📊 Track like/unlike
    if (isLiked) {
      track.profileUnlike(escort.id, 'escort')
    } else {
      track.profileLike(escort.id, 'escort')
    }
    onLike?.(escort.id)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: escort.stageName,
          text: escort.bio,
          url: window.location.href
        })
        // 📊 Track share with native share
        track.profileShare(escort.id, 'native')
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      setShowShareMenu(true)
      setTimeout(() => setShowShareMenu(false), 2000)
      // 📊 Track share with clipboard
      track.profileShare(escort.id, 'clipboard')
    }
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

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      {/* Header Actions */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          {/* Name and Verification */}
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">
              {escort.stageName}
            </h1>
            {escort.isVerifiedBadge && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-felora-aurora/20 border border-felora-aurora/30">
                <Verified size={16} className="text-felora-aurora" />
                <span className="text-sm font-medium text-felora-aurora">Vérifié</span>
              </div>
            )}
          </div>

          {/* Location */}
          {(escort.city || escort.canton) && (
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-white/60" />
              <span className="text-white/80">
                {[escort.city, escort.canton].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {/* Stats */}
          {escort.stats && (
            <div className="flex items-center gap-6 mb-4">
              {escort.stats.rating && (
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white/80 font-medium">
                    {escort.stats.rating.toFixed(1)}
                  </span>
                </div>
              )}
              {escort.stats.views && (
                <div className="text-white/60">
                  {escort.stats.views} vues
                </div>
              )}
              {escort.stats.likes && (
                <div className="text-white/60">
                  {escort.stats.likes} likes
                </div>
              )}
            </div>
          )}

          {/* Last Updated */}
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Clock size={14} />
            <span>Mis à jour {getTimeAgo(escort.updatedAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleLike}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Heart 
              size={20} 
              className={`transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} 
            />
          </button>
          
          <button
            onClick={handleShare}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors relative"
          >
            <Share2 size={20} className="text-white" />
            {showShareMenu && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/80 text-white text-sm rounded-lg">
                Lien copié !
              </div>
            )}
          </button>
          
          <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <Flag size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Bio */}
      {escort.bio && (
        <div className="border-t border-white/10 pt-6">
          <h3 className="text-lg font-semibold text-white mb-3">À propos</h3>
          <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
            {escort.bio}
          </p>
        </div>
      )}
    </div>
  )
}