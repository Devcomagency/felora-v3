'use client'

import { useState } from 'react'

interface AnimatedGiftPlayerProps {
  giftType: 'heart' | 'rose' | 'bouquet' | 'diamond' | 'star' | 'flame' | 'confetti' | 'champagne' | 'cocktail' | 'wine'
  className?: string
}

export function AnimatedGiftPlayer({ 
  giftType, 
  className = 'w-32 h-32'
}: AnimatedGiftPlayerProps) {
  const [isHovered, setIsHovered] = useState(false)

  const giftConfig = {
    heart: {
      emoji: '❤️',
      color: '#FF6B9D',
      gradient: 'from-pink-500 to-rose-500',
      animation: 'heartbeat',
      particles: ['💕', '💖', '💗']
    },
    rose: {
      emoji: '🌹',
      color: '#EC4899',
      gradient: 'from-pink-600 to-purple-500',
      animation: 'float',
      particles: ['🌸', '🌺', '💐']
    },
    bouquet: {
      emoji: '💐',
      color: '#FF69B4',
      gradient: 'from-pink-500 to-purple-400',
      animation: 'sway',
      particles: ['🌸', '🌺', '🌻']
    },
    diamond: {
      emoji: '💎',
      color: '#4FD1C7',
      gradient: 'from-cyan-400 to-teal-500',
      animation: 'sparkle',
      particles: ['✨', '💫', '⭐']
    },
    star: {
      emoji: '🌟',
      color: '#FFD700',
      gradient: 'from-yellow-300 to-yellow-600',
      animation: 'twinkle',
      particles: ['✨', '💫', '⭐']
    },
    flame: {
      emoji: '🔥',
      color: '#FF4500',
      gradient: 'from-orange-500 to-red-600',
      animation: 'flicker',
      particles: ['🔥', '💥', '✨']
    },
    confetti: {
      emoji: '🎉',
      color: '#FF69B4',
      gradient: 'from-pink-400 to-purple-500',
      animation: 'party',
      particles: ['🎊', '🎈', '🎁']
    },
    champagne: {
      emoji: '🥂',
      color: '#FFD700',
      gradient: 'from-yellow-300 to-amber-500',
      animation: 'cheers',
      particles: ['✨', '🍾', '🥂']
    },
    cocktail: {
      emoji: '🍹',
      color: '#FF69B4',
      gradient: 'from-pink-400 to-orange-500',
      animation: 'shake',
      particles: ['🍸', '🍹', '🥃']
    },
    wine: {
      emoji: '🍷',
      color: '#DC143C',
      gradient: 'from-red-500 to-purple-600',
      animation: 'swirl',
      particles: ['🍇', '🍷', '❤️']
    }
  }

  const config = giftConfig[giftType]

  const getAnimationStyles = () => {
    if (isHovered) {
      const hoverStyles = {
        heartbeat: 'animate-bounce scale-110',
        float: 'animate-spin scale-110',
        sway: 'animate-bounce scale-110',
        sparkle: 'animate-ping scale-125',
        twinkle: 'animate-ping scale-125',
        flicker: 'animate-bounce scale-110',
        party: 'animate-bounce scale-110',
        cheers: 'animate-bounce scale-110',
        shake: 'animate-pulse scale-110',
        swirl: 'animate-pulse scale-110'
      }
      return hoverStyles[config.animation as keyof typeof hoverStyles] || 'animate-bounce scale-110'
    }
    
    // Animation de base (subtile)
    const baseStyles = {
      heartbeat: 'animate-pulse',
      float: 'animate-pulse',
      sway: 'animate-pulse',
      sparkle: 'animate-pulse',
      twinkle: 'animate-pulse',
      flicker: 'animate-pulse',
      party: 'animate-pulse',
      cheers: '',
      shake: '',
      swirl: ''
    }
    return baseStyles[config.animation as keyof typeof baseStyles] || ''
  }

  return (
    <div 
      className={`${className} relative flex items-center justify-center group cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect animé */}
      <div 
        className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${
          isHovered ? 'opacity-60 scale-110' : 'opacity-20'
        }`}
        style={{
          background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`
        }}
      />
      
      {/* Particles qui volent autour */}
      {isHovered && config.particles.map((particle, i) => (
        <div
          key={i}
          className="absolute text-lg pointer-events-none animate-bounce z-10"
          style={{
            left: `${-10 + (i * 50)}%`,
            top: `${-20 + (i * 40)}%`,
            animationDelay: `${i * 300}ms`,
            animationDuration: '1s'
          }}
        >
          {particle}
        </div>
      ))}

      {/* Container principal */}
      <div className={`
        relative w-full h-full rounded-xl 
        bg-gradient-to-br ${config.gradient} 
        flex items-center justify-center 
        drop-shadow-lg
        border border-white/20
        transition-all duration-300
        ${isHovered ? 'scale-110 shadow-2xl' : 'scale-100'}
        ${isHovered ? `shadow-${config.color}` : ''}
      `}>
        {/* Emoji principal animé */}
        <span className={`text-6xl filter drop-shadow-md transition-transform duration-300 ${getAnimationStyles()}`}>
          {config.emoji}
        </span>
        
        {/* Effet de brillance */}
        <div 
          className={`absolute inset-0 rounded-xl bg-gradient-to-tr from-white/30 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-80' : 'opacity-40'
          }`} 
        />
        
        {/* Cercles animés sur hover */}
        {isHovered && (
          <>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full animate-ping opacity-60" style={{animationDelay: '500ms'}}></div>
            <div className="absolute top-1 -left-2 w-2 h-2 bg-white rounded-full animate-ping opacity-50" style={{animationDelay: '1000ms'}}></div>
          </>
        )}
      </div>

      {/* Texte magique au hover */}
      {isHovered && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          ✨ Magique !
        </div>
      )}
    </div>
  )
}