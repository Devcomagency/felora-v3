'use client'

import { useEffect, useRef, useState } from 'react'

interface GiftPlayerSimpleProps {
  lottieUrl: string
  className?: string
  loop?: boolean
  autoplay?: boolean
  onComplete?: () => void
}

// Mapping des codes de cadeaux vers des emojis
const GIFT_EMOJIS: Record<string, string> = {
  'heart': '❤️',
  'diamond': '💎', 
  'rose': '🌹',
  'fireworks': '🎆',
  'crown': '👑'
}

export function GiftPlayerSimple({ 
  lottieUrl, 
  className = 'w-32 h-32', 
  loop = false, 
  autoplay = true, 
  onComplete 
}: GiftPlayerSimpleProps) {
  const [showFallback, setShowFallback] = useState(false)

  // Extraire le code du cadeau depuis l'URL
  const giftCode = lottieUrl.split('/').pop()?.replace('.json', '') || ''
  const emoji = GIFT_EMOJIS[giftCode] || '🎁'

  useEffect(() => {
    // Pour l'instant, affichons directement le fallback pour tester
    const timer = setTimeout(() => {
      setShowFallback(true)
    }, 1000) // 1 seconde pour voir le chargement puis fallback

    return () => clearTimeout(timer)
  }, [])

  if (!showFallback) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-white/5 border border-white/10 rounded-xl`}
        style={{ cursor: 'pointer' }}
      >
        <div className="animate-spin w-6 h-6 border-2 border-felora-aurora border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div 
      className={`${className} flex items-center justify-center bg-gradient-to-br from-felora-aurora/20 to-felora-plasma/20 border border-felora-aurora/30 rounded-xl hover:scale-105 transition-all duration-300`}
      style={{ cursor: 'pointer' }}
      onClick={() => {
        // Animation simple au clic
        const element = document.activeElement as HTMLElement
        if (element) {
          element.style.transform = 'scale(1.1)'
          setTimeout(() => {
            element.style.transform = 'scale(1)'
          }, 150)
        }
      }}
    >
      <div className="text-center">
        <div 
          className="text-4xl mb-1 animate-pulse" 
          style={{
            filter: 'drop-shadow(0 0 8px rgba(255, 107, 157, 0.5))'
          }}
        >
          {emoji}
        </div>
        <div className="text-xs text-felora-silver/70">
          {giftCode}
        </div>
      </div>
    </div>
  )
}