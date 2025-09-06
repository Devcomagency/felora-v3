'use client'

import { useState } from 'react'

interface GifGiftPlayerProps {
  giftType: 'heart' | 'diamond' | 'rose' | 'fireworks' | 'crown'
  className?: string
  autoplay?: boolean
  loop?: boolean
}

export function GifGiftPlayer({ 
  giftType, 
  className = 'w-32 h-32',
  autoplay = true,
  loop = true
}: GifGiftPlayerProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // URLs de GIFs temporaires depuis des CDNs publics pour le test
  const gifSources = {
    heart: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjRqanN3dGhqNW5rY2g3ZmZpb2I1dHgxMWR0MnMwZW10YXBmdmRrbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/y8betlB3u7aKI/giphy.gif',
    diamond: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzE4bWhqYzN1ZDg1bmFoY2NjbWl1czJ6YjhvaDZtY2dzd3ByeG80OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btPCcdNniyf0ArS/giphy.gif',
    rose: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTlycnRndmw5ZGNpanozM3Jza2l2dHhvdWZ3ZXUybXUwbTZiNWNjYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYLh6z3GzCJFbSE/giphy.gif',
    fireworks: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2U4Ym1nbDBycjh5a2liYWxiZHliMmMxNWt0MWJxeWM5NjVhZGd0NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tknCqiJrBQG6bxC/giphy.gif',
    crown: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnpqMnBrZG9iZ3J3dnY3M2Z0bHJiYmdlZWNtNGF3N3lvd2hyZGdweiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7bu6UGwBpTVlEZfq/giphy.gif'
  }

  const fallbackColors = {
    heart: '#FF6B9D',
    diamond: '#4FD1C7',
    rose: '#EC4899',
    fireworks: '#9333EA',
    crown: '#F59E0B'
  }

  const fallbackEmojis = {
    heart: '❤️',
    diamond: '💎',
    rose: '🌹',
    fireworks: '🎆',
    crown: '👑'
  }

  // Si erreur ou pas encore chargé, montrer fallback
  if (imageError || !imageLoaded) {
    return (
      <div 
        className={`${className} flex items-center justify-center rounded-xl relative overflow-hidden`}
        style={{ 
          backgroundColor: fallbackColors[giftType] + '20',
          border: `2px solid ${fallbackColors[giftType]}40`
        }}
      >
        {/* Effet de glow en arrière-plan */}
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            background: `radial-gradient(circle at center, ${fallbackColors[giftType]}20 0%, transparent 70%)`
          }}
        />
        
        {/* Emoji principal */}
        <span 
          className="text-4xl animate-bounce relative z-10"
          style={{ 
            color: fallbackColors[giftType],
            textShadow: `0 0 20px ${fallbackColors[giftType]}50`
          }}
        >
          {fallbackEmojis[giftType]}
        </span>
        
        {/* Image cachée pour test de chargement */}
        {!imageError && (
          <img
            src={gifSources[giftType]}
            alt={`${giftType} animation`}
            className="absolute inset-0 w-full h-full object-cover opacity-0"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
      </div>
    )
  }

  // Image chargée avec succès
  return (
    <div className={`${className} relative overflow-hidden rounded-xl bg-felora-obsidian/50`}>
      <img
        src={gifSources[giftType]}
        alt={`${giftType} animation`}
        className="w-full h-full object-cover"
        style={{
          filter: 'brightness(1.1) contrast(1.1) saturate(1.2)'
        }}
      />
      
      {/* Overlay coloré */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent 40%, ${fallbackColors[giftType]}10 100%)`
        }}
      />
    </div>
  )
}