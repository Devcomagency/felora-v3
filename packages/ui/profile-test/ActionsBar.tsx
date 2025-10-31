'use client'

import React, { useState, useCallback } from 'react'
import { Diamond, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface ActionsBarProps {
  profileId: string
  isFollowing?: boolean
  isLiked?: boolean
  isSaved?: boolean
  onFollow?: (id: string) => Promise<void>
  onMessage?: (id: string) => void
  onGift?: (id: string) => void
  onLike?: (id: string) => Promise<void>
  onSave?: (id: string) => Promise<void>
  onShare?: (id: string) => void
  onReport?: (id: string) => void
  onShowDetails?: () => void
  primaryLabel?: string
  showGift?: boolean
  showMessage?: boolean
  // Favorite
  isFavorite?: boolean
  onFavoriteToggle?: (id?: string) => void
  // Contact intelligent
  contact?: {
    phoneVisibility: string // 'visible', 'hidden', 'private'
    phoneDisplayType: string
    phone?: string
  }
  profileName?: string
  website?: string
}

export default function ActionsBar({
  profileId,
  isFollowing = false,
  isLiked = false,
  isSaved = false,
  onFollow,
  onMessage,
  onLike,
  onGift,
  onSave,
  onShare,
  onReport,
  onShowDetails,
  primaryLabel = 'Voir plus',
  showGift = true,
  showMessage = true,
  isFavorite = false,
  onFavoriteToggle,
  contact,
  profileName = 'cette escort',
  website
}: ActionsBarProps) {
  // Optimistic UI states
  const [followState, setFollowState] = useState(isFollowing)
  const [showContactDropdown, setShowContactDropdown] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  // Optimistic follow with rollback
  const handleFollow = useCallback(async () => {
    if (!onFollow || loading === 'follow') return
    
    setLoading('follow')
    const previousState = followState
    setFollowState(!followState)
    
    try {
      await onFollow(profileId)
    } catch (error) {
      console.warn('Follow action failed:', error)
      setFollowState(previousState)
    } finally {
      setLoading(null)
    }
  }, [followState, onFollow, profileId, loading])

  const handleMessage = useCallback(() => {
    console.log('[ACTIONSBAR DEBUG] Message button clicked:', { profileId, onMessage: !!onMessage })
    onMessage?.(profileId)
  }, [onMessage, profileId])

  const handleShowDetails = useCallback(() => {
    onShowDetails?.()
  }, [onShowDetails])

  return (
    <div className="px-4 mb-6">
      <div className="flex gap-2 mb-3">
        {/* Bouton Voir plus - Style register page avec gradient */}
        <button
          onClick={handleShowDetails}
          className="py-2.5 px-4 text-white rounded-xl font-semibold text-sm transition-all duration-500 border hover:scale-[1.02] active:scale-95 flex-1"
          style={{
            background: 'linear-gradient(to right, #8B5CF630, #8B5CF620)',
            borderColor: '#8B5CF650',
            boxShadow: '0 8px 16px #8B5CF620',
            minWidth: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, #8B5CF640, #8B5CF630)'
            e.currentTarget.style.borderColor = '#8B5CF660'
            e.currentTarget.style.boxShadow = '0 12px 24px #8B5CF630'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, #8B5CF630, #8B5CF620)'
            e.currentTarget.style.borderColor = '#8B5CF650'
            e.currentTarget.style.boxShadow = '0 8px 16px #8B5CF620'
          }}
        >
          {primaryLabel}
        </button>

        {/* Bouton Cadeau - Style register page avec gradient rose */}
        {showGift && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onGift?.(profileId)}
            className="py-2.5 px-4 text-white rounded-xl font-semibold text-sm transition-all duration-500 border flex items-center justify-center gap-2 flex-1"
            style={{
              background: 'linear-gradient(to right, #EC489930, #EC489920)',
              borderColor: '#EC489950',
              boxShadow: '0 8px 16px #EC489920',
              minWidth: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #EC489940, #EC489930)'
              e.currentTarget.style.borderColor = '#EC489960'
              e.currentTarget.style.boxShadow = '0 12px 24px #EC489930'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #EC489930, #EC489920)'
              e.currentTarget.style.borderColor = '#EC489950'
              e.currentTarget.style.boxShadow = '0 8px 16px #EC489920'
            }}
          >
            <Diamond size={16} />
            <span>Cadeau</span>
          </motion.button>
        )}

        {/* Message ou Contact - Style register page avec gradient bleu */}
        {onMessage && !showMessage && (
          <button
            onClick={handleMessage}
            className="py-2.5 px-4 text-white rounded-xl font-semibold text-sm transition-all duration-500 border flex items-center justify-center gap-2 flex-1"
            style={{
              background: 'linear-gradient(to right, #06B6D430, #06B6D420)',
              borderColor: '#06B6D450',
              boxShadow: '0 8px 16px #06B6D420',
              minWidth: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #06B6D440, #06B6D430)'
              e.currentTarget.style.borderColor = '#06B6D460'
              e.currentTarget.style.boxShadow = '0 12px 24px #06B6D430'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #06B6D430, #06B6D420)'
              e.currentTarget.style.borderColor = '#06B6D450'
              e.currentTarget.style.boxShadow = '0 8px 16px #06B6D420'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Contact</span>
          </button>
        )}

        {showMessage && (
          <button
            onClick={handleMessage}
            className="py-2.5 px-4 text-white rounded-xl font-semibold text-sm transition-all duration-500 border flex items-center justify-center gap-2 flex-1"
            style={{
              background: 'linear-gradient(to right, #06B6D430, #06B6D420)',
              borderColor: '#06B6D450',
              boxShadow: '0 8px 16px #06B6D420',
              minWidth: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #06B6D440, #06B6D430)'
              e.currentTarget.style.borderColor = '#06B6D460'
              e.currentTarget.style.boxShadow = '0 12px 24px #06B6D430'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #06B6D430, #06B6D420)'
              e.currentTarget.style.borderColor = '#06B6D450'
              e.currentTarget.style.boxShadow = '0 8px 16px #06B6D420'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Message</span>
          </button>
        )}

        {/* Site Web pour clubs - Style register page avec gradient violet */}
        {website && !website.includes('@') && (
          <a
            href={website.startsWith('http') ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 text-white rounded-xl font-semibold text-sm transition-all duration-500 border flex items-center justify-center gap-2 flex-1"
            title="Visiter le site web"
            style={{
              background: 'linear-gradient(to right, #8B5CF630, #8B5CF620)',
              borderColor: '#8B5CF650',
              boxShadow: '0 8px 16px #8B5CF620',
              minWidth: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #8B5CF640, #8B5CF630)'
              e.currentTarget.style.borderColor = '#8B5CF660'
              e.currentTarget.style.boxShadow = '0 12px 24px #8B5CF630'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #8B5CF630, #8B5CF620)'
              e.currentTarget.style.borderColor = '#8B5CF650'
              e.currentTarget.style.boxShadow = '0 8px 16px #8B5CF620'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>Site</span>
          </a>
        )}

        {/* Bouton Contact intelligent avec gestion des 3 cas */}
        {contact && (() => {
          const { phoneVisibility, phone } = contact;
          const phoneNumber = phone || '';
          const cleanPhone = phoneNumber.replace(/\D/g, '');

          // Messages pré-remplis
          const whatsappMessage = `Bonjour ${profileName}, je vous écris depuis Felora.`;
          const smsMessage = `Bonjour ${profileName}, je vous écris depuis Felora.`;

          // Liens directs
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
          const smsUrl = /iPhone|iPad|iPod|iOS/i.test(navigator.userAgent)
            ? `sms:${cleanPhone}&body=${encodeURIComponent(smsMessage)}`
            : `sms:${cleanPhone}?body=${encodeURIComponent(smsMessage)}`;
          const callUrl = `tel:${cleanPhone}`;

          if (phoneVisibility === 'none') {
            // CAS 3: Messagerie privée uniquement - Bouton spécial
            return (
              <button
                onClick={() => {
                  onMessage?.(profileId);
                  if (navigator.vibrate) navigator.vibrate([30]);
                }}
                className="p-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all hover:bg-purple-500/30 active:scale-95 flex items-center gap-1"
                title="Contact par messagerie privée uniquement"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <ChevronDown size={12} />
              </button>
            );
          } else if ((phoneVisibility === 'visible' || phoneVisibility === 'hidden') && phoneNumber) {
            // CAS 1 & 2: Numéro visible ou caché - Dropdown avec options
            return (
              <div className="relative">
                <button
                  onClick={() => setShowContactDropdown(!showContactDropdown)}
                  className={`p-2 rounded-lg border transition-all hover:bg-white/15 active:scale-95 flex items-center gap-1 ${
                    phoneVisibility === 'visible'
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-white/10 text-gray-300 border-white/20'
                  }`}
                  title={phoneVisibility === 'visible' ? `Téléphone: ${phoneNumber}` : 'Contact téléphonique disponible'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${showContactDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {showContactDropdown && (
                  <div className="absolute top-full mt-2 right-0 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl z-50 min-w-[160px]">
                    {phoneVisibility === 'visible' && (
                      <div className="px-4 py-2 border-b border-white/10">
                        <div className="text-xs text-gray-400 mb-1">Numéro</div>
                        <div className="text-sm font-mono text-green-300">{phoneNumber}</div>
                      </div>
                    )}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          if (navigator.vibrate) navigator.vibrate([30])
                          window.open(callUrl)
                          setShowContactDropdown(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        Appeler
                      </button>

                      <button
                        onClick={() => {
                          if (navigator.vibrate) navigator.vibrate([30])
                          window.open(whatsappUrl)
                          setShowContactDropdown(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.891 3.426"/>
                        </svg>
                        WhatsApp
                      </button>

                      <button
                        onClick={() => {
                          if (navigator.vibrate) navigator.vibrate([30])
                          window.open(smsUrl)
                          setShowContactDropdown(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        SMS
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return null; // Pas de contact disponible
        })()}
      </div>
    </div>
  )
}
