'use client'

import { motion } from 'framer-motion'

interface TypingIndicatorProps {
  isTyping: boolean
  userName?: string
  className?: string
}

export default function TypingIndicator({ isTyping, userName, className = '' }: TypingIndicatorProps) {
  if (!isTyping) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`flex items-center gap-2 px-3 py-2 text-sm text-gray-400 ${className}`}
    >
      <div className="flex items-center gap-1">
        <motion.div
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
        />
      </div>
      <span className="text-xs">
        {userName ? `${userName} est en train d'écrire...` : 'Quelqu\'un est en train d\'écrire...'}
      </span>
    </motion.div>
  )
}