'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Diamond, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

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
  primaryLabel,
  showGift = true,
  showMessage = true,
  isFavorite = false,
  onFavoriteToggle,
  contact,
  profileName = 'cette escort',
  website
}: ActionsBarProps) {
  const t = useTranslations('actionsBar')
  const finalPrimaryLabel = primaryLabel || t('viewMore')

  console.log('🔍 [ActionsBar] Props:', {
    showMessage,
    hasOnMessage: !!onMessage,
    hasContact: !!contact,
    contact
  })

  // Optimistic UI states
  const [followState, setFollowState] = useState(isFollowing)
  const [showContactDropdown, setShowContactDropdown] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [showGiftComingSoon, setShowGiftComingSoon] = useState(false)
  const [showPrivateMessageModal, setShowPrivateMessageModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowContactDropdown(false)
      }
    }

    if (showContactDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showContactDropdown])

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
          {finalPrimaryLabel}
        </button>

        {/* Bouton Cadeau - Style register page avec gradient rose */}
        {showGift && onGift && (
          <div className="relative flex-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowGiftComingSoon(true)}
              className="w-full py-2.5 px-4 text-white rounded-xl font-semibold text-sm transition-all duration-500 border flex items-center justify-center gap-2"
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
              <span>{t('gift')}</span>
            </motion.button>

            {/* Modal Coming Soon */}
            {showGiftComingSoon && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowGiftComingSoon(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gradient-to-br from-gray-900 to-black border border-pink-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center">
                    <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30">
                      <Diamond size={32} className="text-pink-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Fonctionnalité en développement
                    </h3>
                    <p className="text-gray-400 mb-6">
                      La fonctionnalité de cadeaux virtuels est actuellement en cours de développement et sera bientôt disponible ! 🎁
                    </p>
                    <button
                      onClick={() => setShowGiftComingSoon(false)}
                      className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
                    >
                      Compris !
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {/* Bouton Message - Toujours visible si onMessage existe */}
        {showMessage && onMessage && (
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
            <span>{t('message')}</span>
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
            <span>{t('website')}</span>
          </a>
        )}

        {/* Bouton Contact intelligent - Toujours visible */}
        {contact && contact.phone && (() => {
          const { phoneVisibility, phoneDisplayType, phone } = contact;

          // CAS 3: Messagerie privée uniquement - Bouton spécial qui ouvre un modal
          if (phoneVisibility === 'none') {
            return (
              <button
                onClick={() => setShowPrivateMessageModal(true)}
                className="py-2.5 px-4 text-white rounded-xl font-semibold text-sm transition-all duration-500 border flex items-center justify-center gap-2 flex-1 hover:scale-[1.02] active:scale-95"
                style={{
                  background: 'linear-gradient(to right, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.2))',
                  borderColor: 'rgba(139, 92, 246, 0.5)',
                  boxShadow: '0 8px 16px rgba(139, 92, 246, 0.2)',
                  minWidth: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.3))'
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)'
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(139, 92, 246, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.2))'
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(139, 92, 246, 0.2)'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{t('contact')}</span>
              </button>
            );
          }

          // CAS 1 & 2: Numéro visible ou caché - Dropdown normal
        })()}

        {contact && contact.phoneVisibility !== 'none' && contact.phone && (() => {
          const { phoneVisibility, phoneDisplayType, phone } = contact;
          const phoneNumber = phone || '';
          const cleanPhone = phoneNumber.replace(/\D/g, '');

          // Messages pré-remplis
          const whatsappMessage = t('phoneContact.whatsappMessage', { name: profileName });
          const smsMessage = t('phoneContact.smsMessage', { name: profileName });

          // Liens directs
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
          const smsUrl = /iPhone|iPad|iPod|iOS/i.test(navigator.userAgent)
            ? `sms:${cleanPhone}&body=${encodeURIComponent(smsMessage)}`
            : `sms:${cleanPhone}?body=${encodeURIComponent(smsMessage)}`;
          const callUrl = `tel:${cleanPhone}`;

          console.log('🔍 [ActionsBar DEBUG] Contact:', { phoneVisibility, phoneDisplayType, phoneNumber, hasPhone: !!phone });

          // CAS 1 & 2: Numéro visible ou caché - Dropdown avec options
          // On utilise phoneVisibility comme source de vérité pour afficher le numéro
          const isVisible = phoneVisibility === 'visible';

          return (
              <div className="relative flex-1" ref={dropdownRef}>
                <button
                  onClick={() => setShowContactDropdown(!showContactDropdown)}
                  className={`w-full py-2.5 px-4 text-white rounded-xl font-semibold text-sm transition-all duration-500 border flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 ${
                    isVisible
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-white/10 text-gray-300 border-white/20'
                  }`}
                  style={{
                    background: isVisible
                      ? 'linear-gradient(to right, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))'
                      : 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                    borderColor: isVisible ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                    boxShadow: isVisible ? '0 8px 16px rgba(34, 197, 94, 0.2)' : '0 8px 16px rgba(255, 255, 255, 0.1)',
                    minWidth: 0
                  }}
                  title={isVisible ? `Téléphone: ${phoneNumber}` : 'Contact téléphonique disponible'}
                  onMouseEnter={(e) => {
                    if (isVisible) {
                      e.currentTarget.style.background = 'linear-gradient(to right, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.2))'
                      e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.4)'
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(34, 197, 94, 0.3)'
                    } else {
                      e.currentTarget.style.background = 'linear-gradient(to right, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(255, 255, 255, 0.15)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isVisible) {
                      e.currentTarget.style.background = 'linear-gradient(to right, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))'
                      e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(34, 197, 94, 0.2)'
                    } else {
                      e.currentTarget.style.background = 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{t('contact')}</span>
                </button>

                {/* Dropdown menu */}
                {showContactDropdown && (
                  <div className="absolute top-full mt-2 right-0 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl z-50 min-w-[160px]">
                    {isVisible && (
                      <div className="px-4 py-2 border-b border-white/10">
                        <div className="text-xs text-gray-400 mb-1">{t('phoneContact.phoneNumberLabel')}</div>
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
                        {t('phoneContact.call')}
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
                        {t('phoneContact.whatsapp')}
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
                        {t('phoneContact.sms')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
          )
        })()}
      </div>

      {/* Ligne d'actions secondaires */}
      <div className="flex gap-2">
        {/* Bouton Signaler */}
        {onReport && (
          <button
            onClick={() => onReport(profileId)}
            className="flex-1 py-2 px-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-medium flex items-center justify-center gap-2"
            title="Signaler ce profil"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
            <span>{t('report')}</span>
          </button>
        )}

        {/* Bouton Partager */}
        {onShare && (
          <button
            onClick={() => onShare(profileId)}
            className="flex-1 py-2 px-3 rounded-lg bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium flex items-center justify-center gap-2"
            title={t('share')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>{t('share')}</span>
          </button>
        )}

        {/* Bouton Favoris */}
        {onFavoriteToggle && (
          <button
            onClick={() => onFavoriteToggle(profileId)}
            className={`flex-1 py-2 px-3 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 ${
              isFavorite
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
            }`}
            title={isFavorite ? t('favorites') : t('favorite')}
          >
            <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span>{isFavorite ? t('favorites') : t('favorite')}</span>
          </button>
        )}
      </div>

      {/* Modal Messagerie Privée Uniquement */}
      {showPrivateMessageModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPrivateMessageModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Contact par messagerie uniquement
              </h3>
              <p className="text-gray-400 mb-6">
                {profileName} souhaite être contactée uniquement par messagerie privée.
                Aucun numéro de téléphone n'est disponible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPrivateMessageModal(false)}
                  className="flex-1 py-3 px-6 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowPrivateMessageModal(false)
                    onMessage?.(profileId)
                  }}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Envoyer un message
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
