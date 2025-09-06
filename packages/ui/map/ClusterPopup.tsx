'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import type { EscortPinDTO } from '../../../core/services/geo/types'

interface ClusterPopupProps {
  escorts: EscortPinDTO[]
  onClose: () => void
  onSelectEscort: (escort: EscortPinDTO) => void
}

export default function ClusterPopup({ escorts, onClose, onSelectEscort }: ClusterPopupProps) {
  const [escortsDetails, setEscortsDetails] = useState<Record<string, any>>({})
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({})

  // Charger les détails de tous les escorts du cluster
  useEffect(() => {
    escorts.forEach(async (escort) => {
      if (escortsDetails[escort.id]) return // Déjà chargé

      setLoadingDetails(prev => ({ ...prev, [escort.id]: true }))
      
      try {
        const response = await fetch(`/api/geo/details?id=${escort.id}`)
        if (!response.ok) throw new Error('details failed')
        const details = await response.json()
        
        setEscortsDetails(prev => ({ ...prev, [escort.id]: details }))
      } catch (error) {
        // Fallback avec données de base
        setEscortsDetails(prev => ({ 
          ...prev, 
          [escort.id]: {
            id: escort.id,
            displayName: escort.name ?? 'Profil',
            handle: escort.handle ?? '@escort',
            avatar: escort.avatar,
            city: escort.city ?? '—',
            verified: escort.verified ?? false,
            media: [{ type: 'image', url: `https://picsum.photos/seed/fallback${escort.id}/400/600` }],
            services: [],
            languages: [],
            practices: [],
          }
        }))
      } finally {
        setLoadingDetails(prev => ({ ...prev, [escort.id]: false }))
      }
    })
  }, [escorts, escortsDetails])

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!escorts || escorts.length === 0) return null

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
            maxWidth: '500px',
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
            
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MapPin size={20} style={{ color: '#ec4899' }} />
                <h2 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {escorts.length} profil{escorts.length > 1 ? 's' : ''} dans cette zone
                </h2>
              </div>
              
              <button
                onClick={onClose}
                style={{
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
            </div>

            {/* Liste des escorts */}
            <div style={{
              display: 'grid',
              gap: '16px',
              maxHeight: '60vh',
              overflowY: 'auto'
            }}>
              {escorts.map((escort) => {
                const details = escortsDetails[escort.id]
                const loading = loadingDetails[escort.id]

                return (
                  <div
                    key={escort.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => onSelectEscort(escort)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {/* Photo profil */}
                    <div style={{
                      width: '70px',
                      height: '90px', // Plus haut pour format portrait
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: '#1f2937',
                      flexShrink: 0
                    }}>
                      {loading ? (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderTop: '2px solid #ec4899',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                        </div>
                      ) : details?.media?.[0] ? (
                        <img
                          src={details.media[0].url}
                          alt={escort.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '24px'
                        }}>
                          💃
                        </div>
                      )}
                    </div>

                    {/* Infos */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: 'white'
                        }}>
                          {details?.displayName || escort.name}
                        </h3>
                        {(details?.verified || escort.verified) && (
                          <div style={{
                            width: '16px',
                            height: '16px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <path d="M20 6 9 17l-5-5"></path>
                            </svg>
                          </div>
                        )}
                      </div>

                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}>
                        {details?.age ? `${details.age} ans • ` : ''}{escort.city}
                      </p>

                      {details?.rating && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Star style={{ width: '12px', height: '12px', color: '#fbbf24', fill: '#fbbf24' }} />
                          <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: '600' }}>
                            {details.rating}
                          </span>
                          {details.reviews && (
                            <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>
                              ({details.reviews})
                            </span>
                          )}
                        </div>
                      )}

                      {details?.practices && details.practices.length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px',
                          marginTop: '4px'
                        }}>
                          {details.practices.slice(0, 2).map((practice: string, idx: number) => (
                            <span
                              key={idx}
                              style={{
                                padding: '2px 6px',
                                backgroundColor: 'rgba(236, 72, 153, 0.2)',
                                border: '1px solid rgba(236, 72, 153, 0.3)',
                                borderRadius: '10px',
                                color: '#ec4899',
                                fontSize: '10px',
                                fontWeight: '500'
                              }}
                            >
                              {practice}
                            </span>
                          ))}
                          {details.practices.length > 2 && (
                            <span style={{
                              color: 'rgba(255, 255, 255, 0.5)',
                              fontSize: '10px'
                            }}>
                              +{details.practices.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
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
