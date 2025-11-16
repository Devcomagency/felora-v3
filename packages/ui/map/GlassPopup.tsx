'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface MediaItem {
  url: string
  type: 'image' | 'video'
}

interface EscortDetails {
  id: string
  name: string
  handle: string
  age?: number
  location: string
  rating?: number
  reviews?: number
  verified: boolean
  media: MediaItem[]
  practices: string[]
  description?: string
}

interface GlassPopupProps {
  escort: EscortDetails
  onClose: () => void
  onViewProfile: (id: string) => void
}

export default function GlassPopup({ escort, onClose, onViewProfile }: GlassPopupProps) {
  const t = useTranslations('map')
  const tAmenities = useTranslations('amenities')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Auto-rotation du carousel (optionnel, comme dans l'ancienne version)
  useEffect(() => {
    if (escort.media.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        prev === escort.media.length - 1 ? 0 : prev + 1
      )
    }, 4000)

    return () => clearInterval(interval)
  }, [escort.media.length])

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === escort.media.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? escort.media.length - 1 : prev - 1
    )
  }

  const showCarouselImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(13, 13, 13, 0.98) 0%, rgba(26, 26, 26, 0.98) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 107, 157, 0.3)',
          minWidth: '280px',
          maxWidth: '320px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
        }}
        className="relative"
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-8 h-8 bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors z-10"
        >
          <X size={16} />
        </button>

        {/* Carousel de photos - Style identique à l'ancienne version */}
        <div
          style={{
            position: 'relative',
            marginBottom: '16px',
            borderRadius: '16px',
            overflow: 'hidden',
            height: '200px',
          }}
        >
          {/* Images du carousel */}
          {escort.media.map((mediaItem, index) => (
            <div
              key={index}
              style={{
                position: index === 0 ? 'relative' : 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                opacity: index === currentImageIndex ? '1' : '0',
                transition: 'opacity 0.5s ease',
              }}
            >
              {mediaItem.type === 'image' ? (
                <img
                  src={mediaItem.url}
                  alt={escort.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px',
                  }}
                />
              ) : (
                <video
                  src={mediaItem.url}
                  muted
                  loop
                  autoPlay
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px',
                  }}
                />
              )}
            </div>
          ))}

          {/* Navigation du carousel - seulement si plusieurs images */}
          {escort.media.length > 1 && (
            <>
              {/* Flèches de navigation */}
              <button
                onClick={prevImage}
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
                className="hover:bg-black/80 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={nextImage}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
                className="hover:bg-black/80 transition-colors"
              >
                <ChevronRight size={16} />
              </button>

              {/* Indicateurs de pagination */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                }}
              >
                {escort.media.slice(0, 5).map((_, index) => (
                  <div
                    key={index}
                    onClick={() => showCarouselImage(index)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: index === currentImageIndex ? '#FF6B9D' : 'rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    className="hover:scale-125"
                  />
                ))}
                {escort.media.length > 5 && (
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '10px', marginLeft: '4px' }}>
                    +{escort.media.length - 5}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Infos profil - Style identique */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div
            style={{
              color: 'white',
              fontWeight: '700',
              fontSize: '18px',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {escort.name}
            {escort.verified && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4FD1C7" strokeWidth="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="9"></circle>
              </svg>
            )}
          </div>
          
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px',
              marginBottom: '8px',
            }}
          >
            {escort.age ? t('glassPopup.age', { age: escort.age }) + ' • ' : ''}{escort.location}
          </div>

          {escort.rating && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                marginBottom: '12px',
              }}
            >
              <span style={{ color: '#FFD700', fontSize: '14px' }}>★</span>
              <span style={{ color: '#FFD700', fontWeight: '600', fontSize: '14px' }}>
                {escort.rating}
              </span>
              {escort.reviews && (
                <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                  ({escort.reviews})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Catégories/Tags - Style identique */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          {escort.practices.slice(0, 3).map((practice, idx) => (
            <span
              key={idx}
              style={{
                padding: '4px 8px',
                background: 'rgba(255, 107, 157, 0.2)',
                border: '1px solid rgba(255, 107, 157, 0.3)',
                borderRadius: '12px',
                color: '#FF6B9D',
                fontSize: '11px',
                fontWeight: '500',
              }}
            >
              {tAmenities(practice) || practice}
            </span>
          ))}
        </div>

        {/* Bouton action - Style identique */}
        <button
          onClick={() => onViewProfile(escort.id)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(255, 107, 157, 0.3)',
          }}
          className="hover:transform hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,107,157,0.4)]"
        >
          {t('glassPopup.viewProfile')}
        </button>
      </div>
    </div>
  )
}