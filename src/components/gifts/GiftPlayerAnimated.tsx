'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GiftPlayerAnimatedProps {
  lottieUrl: string
  className?: string
  loop?: boolean
  autoplay?: boolean
  onComplete?: () => void
}

// Configurations d'animations pour chaque cadeau
const GIFT_ANIMATIONS: Record<string, any> = {
  heart: {
    emoji: '❤️',
    color: 'from-red-500 to-pink-500',
    shadowColor: 'rgba(239, 68, 68, 0.5)',
    particles: '💕',
    animation: 'heartbeat'
  },
  diamond: {
    emoji: '💎',
    color: 'from-blue-400 to-cyan-400', 
    shadowColor: 'rgba(59, 130, 246, 0.5)',
    particles: '✨',
    animation: 'sparkle'
  },
  rose: {
    emoji: '🌹',
    color: 'from-pink-500 to-rose-500',
    shadowColor: 'rgba(236, 72, 153, 0.5)', 
    particles: '🌸',
    animation: 'bloom'
  },
  fireworks: {
    emoji: '🎆',
    color: 'from-purple-500 to-indigo-500',
    shadowColor: 'rgba(147, 51, 234, 0.5)',
    particles: '🎇',
    animation: 'explode'
  },
  crown: {
    emoji: '👑',
    color: 'from-yellow-400 to-amber-400',
    shadowColor: 'rgba(251, 191, 36, 0.5)',
    particles: '⭐',
    animation: 'royal'
  }
}

export function GiftPlayerAnimated({ 
  lottieUrl, 
  className = 'w-32 h-32', 
  loop = false, 
  autoplay = true, 
  onComplete 
}: GiftPlayerAnimatedProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [showParticles, setShowParticles] = useState(false)
  const giftCode = lottieUrl.split('/').pop()?.replace('.json', '') || 'heart'
  const config = GIFT_ANIMATIONS[giftCode] || GIFT_ANIMATIONS.heart

  const triggerAnimation = () => {
    setIsPlaying(true)
    setShowParticles(true)
    
    setTimeout(() => {
      setShowParticles(false)
      if (!loop) {
        setIsPlaying(false)
      }
      onComplete?.()
    }, 2000)
  }

  useEffect(() => {
    if (autoplay) {
      triggerAnimation()
    }
  }, [autoplay])

  return (
    <div className={`${className} relative overflow-hidden`}>
      {/* Conteneur principal avec animation */}
      <motion.div
        className={`w-full h-full flex items-center justify-center rounded-xl bg-gradient-to-br ${config.color} relative cursor-pointer`}
        style={{
          boxShadow: `0 0 20px ${config.shadowColor}`,
        }}
        onClick={triggerAnimation}
        animate={isPlaying ? {
          scale: [1, 1.1, 1],
          rotate: config.animation === 'royal' ? [0, 5, -5, 0] : [0, 0, 0],
        } : {}}
        transition={{
          duration: 2,
          repeat: loop && isPlaying ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Animation du cadeau principal */}
        <motion.div
          className="text-4xl relative z-10"
          animate={isPlaying ? getMainAnimation(config.animation) : {}}
          transition={{
            duration: 2,
            repeat: loop && isPlaying ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {config.emoji}
        </motion.div>

        {/* Effet de brillance */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ transform: 'translateX(-100%)' }}
          animate={isPlaying ? {
            x: ['-100%', '100%'],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: loop && isPlaying ? Infinity : 0,
            repeatDelay: 2
          }}
        />

        {/* Cercles d'onde */}
        <AnimatePresence>
          {isPlaying && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`wave-${i}`}
                  className="absolute inset-0 border-2 border-white/20 rounded-xl"
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ 
                    scale: [0.8, 1.5, 2], 
                    opacity: [0.8, 0.3, 0] 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: loop ? Infinity : 0,
                    repeatDelay: 1
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Particules flottantes */}
        <AnimatePresence>
          {showParticles && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute text-lg pointer-events-none"
                  style={{
                    left: `${20 + (i * 12)}%`,
                    top: `${30 + (i % 2) * 40}%`,
                  }}
                  initial={{ 
                    scale: 0, 
                    opacity: 0,
                    y: 0,
                    rotate: 0
                  }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    y: [0, -30, -60],
                    rotate: [0, 180, 360],
                    x: [0, (i % 2 ? 1 : -1) * 20]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                >
                  {config.particles}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Indicateur d'état */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
        <motion.div
          className="w-2 h-2 rounded-full bg-white/60"
          animate={isPlaying ? {
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6]
          } : {}}
          transition={{
            duration: 1,
            repeat: isPlaying ? Infinity : 0
          }}
        />
      </div>
    </div>
  )
}

// Animations spécifiques pour chaque type de cadeau
function getMainAnimation(type: string) {
  switch (type) {
    case 'heartbeat':
      return {
        scale: [1, 1.3, 1, 1.1, 1],
        filter: [
          'hue-rotate(0deg) brightness(1)',
          'hue-rotate(10deg) brightness(1.2)',
          'hue-rotate(0deg) brightness(1)'
        ]
      }
    
    case 'sparkle':
      return {
        scale: [1, 1.2, 1],
        rotate: [0, 45, 90, 135, 180],
        filter: [
          'brightness(1) contrast(1)',
          'brightness(1.3) contrast(1.2)',
          'brightness(1) contrast(1)'
        ]
      }
    
    case 'bloom':
      return {
        scale: [0.8, 1.2, 1],
        rotate: [0, 10, -5, 0],
        filter: [
          'hue-rotate(0deg) saturate(1)',
          'hue-rotate(20deg) saturate(1.5)',
          'hue-rotate(0deg) saturate(1)'
        ]
      }
    
    case 'explode':
      return {
        scale: [1, 0.8, 1.4, 1],
        y: [0, -5, 5, 0],
        filter: [
          'brightness(1) contrast(1) hue-rotate(0deg)',
          'brightness(1.5) contrast(1.3) hue-rotate(45deg)',
          'brightness(1.2) contrast(1.1) hue-rotate(90deg)',
          'brightness(1) contrast(1) hue-rotate(0deg)'
        ]
      }
    
    case 'royal':
      return {
        scale: [1, 1.15, 1],
        y: [0, -8, 0],
        filter: [
          'brightness(1) drop-shadow(0 0 0px gold)',
          'brightness(1.3) drop-shadow(0 0 10px gold)',
          'brightness(1) drop-shadow(0 0 0px gold)'
        ]
      }
    
    default:
      return {
        scale: [1, 1.1, 1],
        rotate: [0, 5, 0]
      }
  }
}