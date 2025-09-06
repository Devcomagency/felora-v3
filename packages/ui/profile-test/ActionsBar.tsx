'use client'

import React, { useState, useCallback } from 'react'
import { Diamond, ChevronDown, Star } from 'lucide-react'
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
  onFavoriteToggle
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
    onMessage?.(profileId)
  }, [onMessage, profileId])

  const handleShowDetails = useCallback(() => {
    onShowDetails?.()
  }, [onShowDetails])

  return (
    <div className="px-4 mb-6">
      <div className="flex gap-2 mb-3">
        {/* Bouton principal configurable */}
        <button
          onClick={handleShowDetails}
          className="flex-1 py-2 px-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg font-medium text-sm transition-all hover:from-slate-700 hover:to-slate-800 active:scale-95 shadow-sm border border-slate-500/20"
        >
          {primaryLabel}
        </button>
        
        {/* Bouton Cadeau - optionnel */}
        {showGift && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onGift?.(profileId)}
            className="px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium text-sm transition-all hover:from-pink-600 hover:to-purple-600 active:scale-95 shadow-md flex items-center gap-1"
          >
            <Diamond size={14} />
          </motion.button>
        )}
        
        {/* Message - optionnel */}
        {showMessage && (
          <button 
            onClick={handleMessage}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium text-sm transition-all hover:from-blue-600 hover:to-cyan-600 active:scale-95 shadow-md"
          >
            Message
          </button>
        )}

        {/* Favorite */}
        <button
          aria-label="Favori"
          onClick={() => onFavoriteToggle?.(profileId)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/15 active:scale-95 transition-colors"
          title="Ajouter aux favoris"
        >
          <Star size={18} className={isFavorite ? 'text-yellow-500 fill-yellow-500' : ''} />
        </button>

        {/* Bouton Contact avec dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowContactDropdown(!showContactDropdown)}
            className="p-2 rounded-lg bg-white/10 text-gray-300 border border-white/20 transition-all hover:bg-white/15 active:scale-95 flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <ChevronDown size={12} className={`transition-transform duration-200 ${showContactDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown menu */}
          {showContactDropdown && (
            <div className="absolute top-full mt-2 right-0 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl z-50 min-w-[160px]">
              <div className="py-2">
                <button
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate([30])
                    window.open(`tel:+41791234567`)
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
                    const whatsappNumber = '41791234567'
                    const message = `Salut ! Je souhaite vous contacter via FELORA.`
                    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`)
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
                    const smsMessage = `Bonjour, je vous contacte depuis FELORA.`
                    const smsUrl = /iPhone|iPad|iPod|iOS/i.test(navigator.userAgent) 
                      ? `sms:+41791234567&body=${encodeURIComponent(smsMessage)}`
                      : `sms:+41791234567?body=${encodeURIComponent(smsMessage)}`
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
      </div>
    </div>
  )
}
