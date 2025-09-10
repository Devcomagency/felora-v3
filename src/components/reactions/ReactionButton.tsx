'use client'

import { useState } from 'react'
import { Heart, Flame, Star, Smile, Zap } from 'lucide-react'
import { useReactions, ReactionType } from '@/hooks/useReactions'

interface ReactionButtonProps {
  mediaId: string
  userId?: string
  className?: string
}

const reactionIcons = {
  LIKE: Heart,
  LOVE: Heart,
  FIRE: Flame,
  WOW: Star,
  SMILE: Smile
}

const reactionColors = {
  LIKE: 'text-red-500',
  LOVE: 'text-pink-500',
  FIRE: 'text-orange-500',
  WOW: 'text-yellow-500',
  SMILE: 'text-blue-500'
}

export function ReactionButton({ mediaId, userId, className = '' }: ReactionButtonProps) {
  const { stats, userReactions, loading, addReaction } = useReactions({ mediaId, userId })
  const [showAll, setShowAll] = useState(false)

  const reactions: ReactionType[] = ['LIKE', 'LOVE', 'FIRE', 'WOW', 'SMILE']

  const handleReaction = async (type: ReactionType) => {
    await addReaction(type)
  }

  const totalReactions = stats.total

  if (totalReactions === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex gap-1">
          {reactions.slice(0, 3).map((type) => {
            const Icon = reactionIcons[type]
            return (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                disabled={loading}
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                  userReactions.includes(type) ? reactionColors[type] : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            )
          })}
        </div>
        <span className="text-sm text-gray-500">Soyez le premier à réagir</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex gap-1">
        {reactions.slice(0, showAll ? 5 : 3).map((type) => {
          const Icon = reactionIcons[type]
          const count = stats.reactions[type] || 0
          const isActive = userReactions.includes(type)

          return (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              disabled={loading}
              className={`flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors ${
                isActive ? reactionColors[type] : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              {count > 0 && (
                <span className="text-sm font-medium">{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {!showAll && reactions.length > 3 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          +{reactions.length - 3}
        </button>
      )}

      {showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Moins
        </button>
      )}
    </div>
  )
}
