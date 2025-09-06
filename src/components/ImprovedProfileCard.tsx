'use client'

import { MapPin, Crown, Diamond, BadgeCheck } from 'lucide-react'
import { useState } from 'react'

interface ImprovedProfileCardProps {
  profile: {
    id: string
    name: string
    media: string
    location: string
    rating: number
    reviews: number
    description: string
    verified?: boolean
    premium?: boolean
    status?: 'ACTIVE' | 'PAUSED' | 'PENDING' | 'VERIFIED'
    type?: 'escort' | 'salon'
    likes: number
    isLiked?: boolean
    isFollowing?: boolean
    age?: number
    services?: string[]
    escortCount?: number
    capacity?: number
  }
  onLike?: (profileId: string, event: React.MouseEvent) => void
  onFollow?: (profileId: string, event: React.MouseEvent) => void
  onProfileClick?: (profileId: string) => void
  onMessage?: (profileId: string, event: React.MouseEvent) => void
}

export default function ImprovedProfileCard({ 
  profile, 
  onProfileClick
}: ImprovedProfileCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const isPaused = profile.status === 'PAUSED' || profile.status === 'PENDING' || !profile.status

  const handleCardClick = () => {
    onProfileClick?.(profile.id)
  }

  return (
    <div 
      className="relative overflow-hidden cursor-pointer transition-all duration-500 group"
      onClick={handleCardClick}
      style={{ 
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
      }}
    >
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(183, 148, 246, 0.08) 50%, rgba(79, 209, 199, 0.06) 100%)'
        }}
      />

      {/* Image Container */}
      <div className="relative h-44 sm:h-56 md:h-64 overflow-hidden rounded-t-[20px]">
        <div 
          className="w-full h-full bg-cover bg-center transition-all duration-700 group-hover:scale-110"
          style={{ 
            backgroundImage: `url(${profile.media})`,
            backgroundColor: '#0D0D0D',
            opacity: imageLoading ? 0 : (isPaused ? 0.5 : 1),
            filter: isPaused ? 'grayscale(100%) blur(1px)' : 'none'
          }}
        />
        
        <img 
          src={profile.media} 
          alt={profile.name}
          className="hidden"
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />
        
        {/* Neural Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.8) 100%)'
          }}
        />
        
        {/* Loading Indicator */}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0D0D0D' }}>
            <div 
              className="w-8 h-8 rounded-full animate-spin"
              style={{
                border: '3px solid rgba(255, 107, 157, 0.2)',
                borderTop: '3px solid #FF6B9D'
              }}
            />
          </div>
        )}

        {/* Premium Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            {profile.type === 'salon' && (
              <div 
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-white backdrop-blur-md"
                style={{
                  background: 'rgba(79, 209, 199, 0.9)',
                  boxShadow: '0 4px 16px rgba(79, 209, 199, 0.3)'
                }}
              >
                SALON
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            {profile.premium && (
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md"
                style={{
                  background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
                  boxShadow: '0 3px 14px rgba(255, 107, 157, 0.35)'
                }}
              >
                <Crown className="w-4 h-4 text-white" />
              </div>
            )}
            {profile.verified && (
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md"
                style={{
                  background: 'rgba(17, 24, 39, 0.9)',
                  boxShadow: '0 3px 14px rgba(79, 209, 199, 0.35)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
                title="Profil vérifié"
              >
                <BadgeCheck className="w-4 h-4" style={{ color: '#4FD1C7' }} />
              </div>
            )}
          </div>
        </div>

        {/* Paused State */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md">
            <div 
              className="px-8 py-6 rounded-2xl border text-center"
              style={{
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="text-3xl mb-3">💤</div>
              <div className="text-white font-bold text-base mb-1">{profile.name}</div>
              <div 
                className="font-medium text-sm"
                style={{ color: '#4FD1C7' }}
              >
                Bientôt de retour
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Information */}
      <div 
        className="p-3 md:p-4 relative"
        style={{
          background: 'linear-gradient(135deg, rgba(13, 13, 13, 0.95) 0%, rgba(26, 26, 26, 0.9) 100%)'
        }}
      >
        {/* Name Section */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <h3 
              className="font-bold text-white text-base truncate"
              style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              {profile.name}
              {profile.age && (
                <span 
                  className="ml-2 text-sm font-normal"
                  style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                >
                  {profile.age}ans
                </span>
              )}
            </h3>
            {/* Petit cercle bleu retiré (badge redondant) */}
          </div>
        </div>

        {/* Location & Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
            <MapPin 
              className="w-3.5 h-3.5 flex-shrink-0" 
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            />
            <span 
              className="min-w-0 md:truncate md:whitespace-nowrap"
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                display: '-webkit-box',
                WebkitLineClamp: 2 as any,
                WebkitBoxOrient: 'vertical' as any,
                overflow: 'hidden'
              }}
            >
              {profile.location}
            </span>
          </div>
          
          {profile.type === 'salon' && (
            <div 
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(79, 209, 199, 0.15)',
                color: '#4FD1C7',
                border: '1px solid rgba(79, 209, 199, 0.3)'
              }}
            >
              Salon
            </div>
          )}
        </div>

        {/* Salon Info */}
        {profile.type === 'salon' && profile.escortCount && (
          <div 
            className="mt-1 hidden sm:block text-[11px]"
            style={{ color: '#4FD1C7' }}
          >
            {profile.escortCount} escortes • Cap. {profile.capacity || 0}
          </div>
        )}
      </div>

      {/* Hover Effect */}
      <div 
        className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(183, 148, 246, 0.08) 50%, rgba(79, 209, 199, 0.1) 100%)',
          border: '2px solid rgba(255, 107, 157, 0.3)',
          boxShadow: '0 20px 60px rgba(255, 107, 157, 0.2)'
        }}
      />
    </div>
  )
}
