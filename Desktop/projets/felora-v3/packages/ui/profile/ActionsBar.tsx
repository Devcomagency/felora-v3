'use client'

import React, { useState, useCallback } from 'react'
import { Diamond, Star } from 'lucide-react'

interface ActionsBarProps {
  profileId: string
  isFollowing?: boolean
  isLiked?: boolean
  isSaved?: boolean
  onFollow?: (id: string) => Promise<void> | void
  onMessage?: (id: string) => void
  onGift?: (id: string) => void
  onLike?: (id: string) => Promise<void> | void
  onSave?: (id: string) => Promise<void> | void
  onShare?: (id: string) => void
  onReport?: (id: string) => void
  onShowDetails?: () => void
  primaryLabel?: string
  showGift?: boolean
  showMessage?: boolean
  isFavorite?: boolean
  onFavoriteToggle?: (id?: string) => void
}

export default function ActionsBar({
  profileId,
  isFollowing = false,
  onFollow,
  onMessage,
  onGift,
  onShowDetails,
  primaryLabel = 'Voir plus',
  showGift = true,
  showMessage = true,
  isFavorite = false,
  onFavoriteToggle
}: ActionsBarProps) {
  const [followState, setFollowState] = useState(isFollowing)
  const [loading, setLoading] = useState<string | null>(null)

  const handleFollow = useCallback(async () => {
    if (!onFollow || loading === 'follow') return
    setLoading('follow')
    const prev = followState
    setFollowState(!prev)
    try { await onFollow(profileId) } catch { setFollowState(prev) } finally { setLoading(null) }
  }, [followState, onFollow, profileId, loading])

  return (
    <div className="px-4 mb-6">
      <div className="flex gap-2">
        <button
          onClick={onShowDetails}
          className="flex-1 py-2 px-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg font-medium text-sm transition-all hover:from-slate-700 hover:to-slate-800 active:scale-95 shadow-sm border border-slate-500/20"
        >
          {primaryLabel}
        </button>

        {showGift && (
          <button 
            onClick={() => onGift?.(profileId)}
            className="px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium text-sm transition-all hover:from-pink-600 hover:to-purple-600 active:scale-95 shadow-md flex items-center gap-1"
            aria-label="Offrir un cadeau"
          >
            <Diamond size={14} />
          </button>
        )}

        {showMessage && (
          <button 
            onClick={() => onMessage?.(profileId)}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium text-sm transition-all hover:from-blue-600 hover:to-cyan-600 active:scale-95 shadow-md"
          >
            Message
          </button>
        )}

        <button
          aria-label="Favori"
          onClick={() => onFavoriteToggle?.(profileId)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/15 active:scale-95 transition-colors"
          title="Ajouter aux favoris"
        >
          <Star size={18} className={isFavorite ? 'text-yellow-500 fill-yellow-500' : ''} />
        </button>
      </div>
      <div className="mt-2">
        <button
          onClick={handleFollow}
          className="px-3 py-1.5 rounded-md text-xs border border-white/20 text-white/80 hover:bg-white/10 disabled:opacity-60"
          disabled={loading === 'follow'}
        >
          {followState ? 'Suivi' : 'Suivre'}
        </button>
      </div>
    </div>
  )
}

