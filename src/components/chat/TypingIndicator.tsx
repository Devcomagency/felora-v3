'use client'

import { motion } from 'framer-motion'
import type { TypingIndicator as TypingUser } from '../../types/chat'

interface TypingIndicatorProps {
  users: TypingUser[]
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].userName} est en train d'écrire...`
    } else if (users.length === 2) {
      return `${users[0].userName} et ${users[1].userName} sont en train d'écrire...`
    } else {
      return `${users.length} personnes sont en train d'écrire...`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center space-x-3"
    >
      {/* Avatar */}
      <div className="w-6 h-6 bg-gray-600 rounded-full flex-shrink-0" />
      
      {/* Typing bubble */}
      <div className="bg-gray-700 px-4 py-2 rounded-2xl">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-300">{getTypingText()}</span>
          
          {/* Animated dots */}
          <div className="flex space-x-1 ml-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-gray-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}