'use client'

import { motion } from 'framer-motion'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

const EMOJI_CATEGORIES = {
  'Smileys': ['😊', '😍', '🥰', '😘', '🤗', '🙂', '😉', '😏', '🤤', '😈'],
  'Hearts': ['❤️', '💕', '💖', '💘', '💝', '💗', '💓', '💋', '💜', '🧡'],
  'Gestures': ['👍', '👎', '👌', '🤞', '✌️', '🤟', '🤘', '👊', '✊', '🙏'],
  'Objects': ['💎', '🔥', '⭐', '✨', '💫', '🎁', '🏆', '👑', '💰', '📱'],
  'Special': ['💯', '🔞', '💦', '🍑', '🍆', '🥵', '😩', '🤯', '💸', '🎉']
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl p-4 w-80 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Emojis</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
          <div key={category}>
            <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              {category}
            </h4>
            <div className="grid grid-cols-8 gap-2">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onSelect(emoji)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-xl transition-colors hover:scale-110 transform"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent/Popular section could be added here */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
          Populaires
        </h4>
        <div className="flex flex-wrap gap-2">
          {['😘', '💕', '🔥', '💎', '😍', '💋', '😈', '🥰'].map(emoji => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="p-2 hover:bg-gray-700 rounded-lg text-xl transition-colors hover:scale-110 transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}