'use client'

import { useEffect, useRef, useState } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface GiftPlayerLottieProps {
  lottieUrl: string
  className?: string
  loop?: boolean
  autoplay?: boolean
  onComplete?: () => void
}

export function GiftPlayerLottie({ 
  lottieUrl, 
  className = 'w-32 h-32', 
  loop = false, 
  autoplay = true, 
  onComplete 
}: GiftPlayerLottieProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Nettoyer l'animation précédente
    if (animationRef.current) {
      animationRef.current.destroy()
      animationRef.current = null
    }

    // Vider le conteneur
    containerRef.current.innerHTML = ''
    setIsLoaded(false)
    setHasError(false)

    try {
      console.log('Loading Lottie animation:', lottieUrl)
      
      // Charger l'animation Lottie avec la méthode loadAnimation directe
      animationRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: loop,
        autoplay: autoplay,
        path: lottieUrl, // Utiliser path pour charger depuis l'URL
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet',
          clearCanvas: false,
          progressiveLoad: true, // Chargement progressif
          hideOnTransparent: true
        }
      })

      // Événements de l'animation
      animationRef.current.addEventListener('DOMLoaded', () => {
        console.log('✅ Animation Lottie chargée:', lottieUrl)
        setIsLoaded(true)
      })

      animationRef.current.addEventListener('complete', () => {
        console.log('🎬 Animation terminée:', lottieUrl)
        onComplete?.()
      })

      animationRef.current.addEventListener('data_failed', (error) => {
        console.error('❌ Erreur chargement Lottie:', lottieUrl, error)
        setHasError(true)
      })

      // Timeout de sécurité
      const timeout = setTimeout(() => {
        if (!isLoaded) {
          console.warn('⏰ Timeout chargement Lottie:', lottieUrl)
          setHasError(true)
        }
      }, 8000)

      return () => {
        clearTimeout(timeout)
        if (animationRef.current) {
          animationRef.current.destroy()
          animationRef.current = null
        }
      }
    } catch (error) {
      console.error('💥 Erreur critique Lottie:', error)
      setHasError(true)
    }
  }, [lottieUrl, loop, autoplay])

  const handleClick = () => {
    if (animationRef.current && isLoaded) {
      animationRef.current.goToAndPlay(0, true)
    }
  }

  // Affichage pendant le chargement
  if (!isLoaded && !hasError) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-gradient-to-br from-felora-aurora/20 to-felora-plasma/20 border border-felora-aurora/30 rounded-xl`}
        style={{ cursor: 'pointer' }}
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-felora-aurora mb-2"></div>
          <div className="text-xs text-felora-silver/70">Chargement...</div>
        </div>
      </div>
    )
  }

  // Affichage en cas d'erreur avec fallback
  if (hasError) {
    const giftCode = lottieUrl.split('/').pop()?.replace('.json', '') || 'heart'
    const giftEmojis = {
      'heart': '❤️',
      'diamond': '💎', 
      'rose': '🌹',
      'fireworks': '🎆',
      'crown': '👑'
    }
    
    return (
      <div 
        className={`${className} flex items-center justify-center bg-gradient-to-br from-felora-aurora/20 to-felora-plasma/20 border border-felora-aurora/30 rounded-xl hover:scale-105 transition-all duration-300`}
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
      >
        <div className="text-center">
          <div className="text-3xl mb-1 animate-pulse">{giftEmojis[giftCode as keyof typeof giftEmojis] || '🎁'}</div>
          <div className="text-xs text-felora-silver/50">Erreur chargement</div>
        </div>
      </div>
    )
  }

  // Affichage normal avec animation Lottie
  return (
    <div 
      ref={containerRef} 
      className={`${className} cursor-pointer transition-all duration-300 hover:scale-105`}
      onClick={handleClick}
      style={{
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
      }}
    />
  )
}