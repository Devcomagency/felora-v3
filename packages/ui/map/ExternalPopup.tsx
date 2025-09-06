'use client'

import { useState, useEffect } from 'react'
import { X, Star } from 'lucide-react'
import Link from 'next/link'
import type { EscortPinDTO } from '../../../core/services/geo/types'

interface ExternalPopupProps {
  escort: EscortPinDTO | null
  onClose: () => void
}

export default function ExternalPopup({ escort, onClose }: ExternalPopupProps) {
  const [escortDetails, setEscortDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Charger les détails quand un escort est sélectionné
  useEffect(() => {
    if (!escort) {
      setEscortDetails(null)
      return
    }

    setLoadingDetails(true)
    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/geo/details?id=${escort.id}`)
        if (!response.ok) throw new Error('details failed')
        const details = await response.json()
        setEscortDetails(details)
      } catch (error) {
        // Erreur silencieuse, on utilise le fallback
        // Fallback avec données de base
        setEscortDetails({
          id: escort.id,
          displayName: escort.name ?? 'Profil',
          handle: escort.handle ?? '@escort',
          avatar: escort.avatar,
          city: escort.city ?? '—',
          verified: escort.verified ?? false,
          media: [{ type: 'image', url: 'https://picsum.photos/seed/fallback/800/600' }],
          services: [],
          languages: [],
          practices: [],
        })
      } finally {
        setLoadingDetails(false)
      }
    }

    fetchDetails()
  }, [escort])

  // Auto-rotation du carousel
  useEffect(() => {
    if (!escortDetails?.media || escortDetails.media.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        prev === escortDetails.media.length - 1 ? 0 : prev + 1
      )
    }, 4000)

    return () => clearInterval(interval)
  }, [escortDetails?.media])

  const nextImage = () => {
    if (!escortDetails?.media) return
    setCurrentImageIndex((prev) => 
      prev === escortDetails.media.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    if (!escortDetails?.media) return
    setCurrentImageIndex((prev) => 
      prev === 0 ? escortDetails.media.length - 1 : prev - 1
    )
  }

  const showCarouselImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (escort) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [escort, onClose])

  if (!escort) {
    return null
  }
  
  return (
    <>
      {/* Overlay sombre */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
        onClick={onClose}
      >
        {/* Popup */}
        <div 
          style={{
            position: 'relative',
            maxWidth: '384px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.2)',
            color: 'white',
            padding: '24px'
          }}>
            
            {/* Bouton fermer */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 10,
                width: '32px',
                height: '32px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.8)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
              }}
            >
              <X size={16} />
            </button>

            {loadingDetails ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  borderTop: '3px solid #ec4899',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }} />
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                  Chargement...
                </p>
              </div>
            ) : escortDetails ? (
              <>
                {/* Carousel photos */}
                {escortDetails.media && escortDetails.media.length > 0 && (
                  <div style={{
                    position: 'relative',
                    marginBottom: '24px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    height: '280px', // Plus haut pour format portrait
                    backgroundColor: '#1f2937'
                  }}>
                    {escortDetails.media.map((mediaItem: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: index === currentImageIndex ? 1 : 0,
                          transition: 'opacity 0.5s ease'
                        }}
                      >
                        <img
                          src={mediaItem.url}
                          alt={escortDetails.displayName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    ))}

                    {/* Navigation carousel */}
                    {escortDetails.media.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          style={{
                            position: 'absolute',
                            left: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '32px',
                            height: '32px',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '18px',
                            border: 'none',
                            cursor: 'pointer',
                            backdropFilter: 'blur(4px)'
                          }}
                        >
                          ‹
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
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '18px',
                            border: 'none',
                            cursor: 'pointer',
                            backdropFilter: 'blur(4px)'
                          }}
                        >
                          ›
                        </button>

                        {/* Indicateurs */}
                        <div style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          gap: '4px',
                          alignItems: 'center'
                        }}>
                          {escortDetails.media.slice(0, 5).map((_: any, index: number) => (
                            <button
                              key={index}
                              onClick={() => showCarouselImage(index)}
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: index === currentImageIndex ? '#ec4899' : 'rgba(255, 255, 255, 0.4)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                              }}
                            />
                          ))}
                          {escortDetails.media.length > 5 && (
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '10px', marginLeft: '4px' }}>
                              +{escortDetails.media.length - 5}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Infos profil */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      margin: 0
                    }}>
                      {escortDetails.displayName}
                    </h3>
                    {escortDetails.verified && (
                      <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M20 6 9 17l-5-5"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    margin: '0 0 8px 0'
                  }}>
                    {escortDetails.age ? `${escortDetails.age} ans • ` : ''}{escortDetails.city}
                  </p>

                  {escortDetails.rating && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      marginBottom: '16px'
                    }}>
                      <Star style={{ width: '16px', height: '16px', color: '#fbbf24', fill: '#fbbf24' }} />
                      <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '14px' }}>
                        {escortDetails.rating}
                      </span>
                      {escortDetails.reviews && (
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                          ({escortDetails.reviews})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {escortDetails.practices && escortDetails.practices.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    justifyContent: 'center',
                    marginBottom: '24px'
                  }}>
                    {escortDetails.practices.slice(0, 3).map((practice: string, idx: number) => (
                      <span
                        key={idx}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: 'rgba(236, 72, 153, 0.2)',
                          border: '1px solid rgba(236, 72, 153, 0.3)',
                          borderRadius: '20px',
                          color: '#ec4899',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {practice}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bouton d'action */}
                <Link
                  href={`/profile/${escort.id}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    color: 'white',
                    fontWeight: '600',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                  }}
                  onClick={onClose}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(236, 72, 153, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.3)'
                  }}
                >
                  Voir le profil complet
                </Link>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  marginBottom: '8px'
                }}>
                  {escort.name}
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  {escort.city}
                </p>
                <Link
                  href={`/profile/${escort.id}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    color: 'white',
                    fontWeight: '600',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    textDecoration: 'none'
                  }}
                  onClick={onClose}
                >
                  Voir le profil
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
