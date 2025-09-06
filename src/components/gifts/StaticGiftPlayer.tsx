'use client'

interface StaticGiftPlayerProps {
  giftType: 'heart' | 'rose' | 'bouquet' | 'diamond' | 'star' | 'flame' | 'confetti' | 'champagne' | 'cocktail' | 'wine' | 'fireworks' | 'crown'
  className?: string
}

export function StaticGiftPlayer({ 
  giftType, 
  className = 'w-32 h-32'
}: StaticGiftPlayerProps) {
  
  const giftConfig = {
    heart: {
      emoji: '❤️',
      color: '#FF6B9D',
      gradient: 'from-pink-500 to-rose-500',
      shadow: 'drop-shadow-lg drop-shadow-pink-500/50'
    },
    rose: {
      emoji: '🌹',
      color: '#EC4899',
      gradient: 'from-pink-600 to-purple-500',
      shadow: 'drop-shadow-lg drop-shadow-pink-600/50'
    },
    bouquet: {
      emoji: '💐',
      color: '#FF69B4',
      gradient: 'from-pink-500 to-purple-400',
      shadow: 'drop-shadow-lg drop-shadow-pink-500/50'
    },
    diamond: {
      emoji: '💎',
      color: '#4FD1C7',
      gradient: 'from-cyan-400 to-teal-500',
      shadow: 'drop-shadow-lg drop-shadow-cyan-500/50'
    },
    star: {
      emoji: '🌟',
      color: '#FFD700',
      gradient: 'from-yellow-300 to-yellow-600',
      shadow: 'drop-shadow-lg drop-shadow-yellow-500/50'
    },
    flame: {
      emoji: '🔥',
      color: '#FF4500',
      gradient: 'from-orange-500 to-red-600',
      shadow: 'drop-shadow-lg drop-shadow-orange-500/50'
    },
    confetti: {
      emoji: '🎉',
      color: '#FF69B4',
      gradient: 'from-pink-400 to-purple-500',
      shadow: 'drop-shadow-lg drop-shadow-pink-500/50'
    },
    champagne: {
      emoji: '🥂',
      color: '#FFD700',
      gradient: 'from-yellow-300 to-amber-500',
      shadow: 'drop-shadow-lg drop-shadow-yellow-500/50'
    },
    cocktail: {
      emoji: '🍹',
      color: '#FF69B4',
      gradient: 'from-pink-400 to-orange-500',
      shadow: 'drop-shadow-lg drop-shadow-pink-500/50'
    },
    wine: {
      emoji: '🍷',
      color: '#DC143C',
      gradient: 'from-red-500 to-purple-600',
      shadow: 'drop-shadow-lg drop-shadow-red-500/50'
    },
    fireworks: {
      emoji: '🎆',
      color: '#A78BFA',
      gradient: 'from-purple-500 to-indigo-500',
      shadow: 'drop-shadow-lg drop-shadow-purple-500/50'
    },
    crown: {
      emoji: '👑',
      color: '#F59E0B',
      gradient: 'from-yellow-400 to-amber-500',
      shadow: 'drop-shadow-lg drop-shadow-amber-400/50'
    }
  }

  const config = giftConfig[giftType]
  // Fallback de sécurité si type inattendu
  const safeConfig = config || giftConfig.heart

  // Animations spécifiques pour chaque cadeau
  const getAnimationClass = (type: string) => {
    const animations = {
      heart: 'animate-pulse hover:animate-bounce',
      rose: 'hover:animate-spin',
      bouquet: 'animate-pulse hover:animate-bounce',
      diamond: 'animate-pulse hover:animate-spin',
      star: 'animate-pulse hover:animate-ping',
      flame: 'hover:animate-bounce animate-pulse',
      confetti: 'hover:animate-bounce',
      champagne: 'hover:animate-bounce',
      cocktail: 'hover:animate-pulse',
      wine: 'hover:animate-pulse'
    }
    return animations[type as keyof typeof animations] || 'hover:animate-pulse'
  }

  return (
    <div className={`${className} relative flex items-center justify-center group`}>
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-xl"
        style={{
          background: `radial-gradient(circle, ${safeConfig.color} 0%, transparent 70%)`
        }}
      />
      
      {/* Main container */}
      <div className={`
        relative w-full h-full rounded-xl 
        bg-gradient-to-br ${safeConfig.gradient} 
        flex items-center justify-center 
        ${safeConfig.shadow}
        group-hover:scale-105 transition-transform duration-200
        border border-white/20
      `}>
        {/* Emoji animé */}
        <span className={`text-6xl filter drop-shadow-md ${getAnimationClass(giftType)}`}>
          {safeConfig.emoji}
        </span>
        
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60" />
      </div>
    </div>
  )
}
