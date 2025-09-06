'use client'

import { useEffect, useRef, useState } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface GiftPlayerProps {
  lottieUrl: string
  className?: string
  loop?: boolean
  autoplay?: boolean
  onComplete?: () => void
}

export function GiftPlayer({ 
  lottieUrl, 
  className = 'w-32 h-32', 
  loop = false, 
  autoplay = true, 
  onComplete 
}: GiftPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !lottieUrl) return

    setIsLoading(true)
    setHasError(false)

    // Nettoyer l'animation précédente
    if (animationRef.current) {
      animationRef.current.destroy()
      animationRef.current = null
    }

    // Vérifier que le conteneur est vide
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    // Timeout de sécurité pour éviter les spinners infinis
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setHasError(true)
        setIsLoading(false)
        console.error('Lottie loading timeout for:', lottieUrl)
      }
    }, 5000)

    const loadAnimation = async () => {
      try {
        // D'abord, vérifier si le fichier existe
        const response = await fetch(lottieUrl)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const animationData = await response.json()
        
        // Charger l'animation avec les données
        animationRef.current = lottie.loadAnimation({
          container: containerRef.current!,
          renderer: 'svg',
          loop,
          autoplay,
          animationData: animationData, // Utiliser les données plutôt que le path
          rendererSettings: {
            progressiveLoad: false,
            preserveAspectRatio: 'xMidYMid meet'
          }
        })

        // L'animation est chargée immédiatement avec les données
        clearTimeout(timeoutId)
        setIsLoading(false)
        console.log('Lottie animation loaded successfully:', lottieUrl)

        // Écouter l'événement de fin d'animation
        if (onComplete) {
          animationRef.current.addEventListener('complete', onComplete)
        }

      } catch (error) {
        console.error('Error loading Lottie animation:', lottieUrl, error)
        clearTimeout(timeoutId)
        setHasError(true)
        setIsLoading(false)
      }
    }

    loadAnimation()

    return () => {
      clearTimeout(timeoutId)
      if (animationRef.current) {
        animationRef.current.destroy()
        animationRef.current = null
      }
    }
  }, [lottieUrl, loop, autoplay, onComplete])

  const playAnimation = () => {
    if (animationRef.current) {
      animationRef.current.goToAndPlay(0)
    }
  }

  // Affichage de fallback pendant le chargement ou en cas d'erreur
  if (isLoading) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-white/5 border border-white/10 rounded-xl`}
        style={{ cursor: 'pointer' }}
      >
        <div className="animate-spin w-6 h-6 border-2 border-felora-aurora border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-white/5 border border-white/10 rounded-xl`}
        style={{ cursor: 'pointer' }}
        onClick={() => window.location.reload()}
      >
        <div className="text-center">
          <div className="text-2xl mb-1">🎁</div>
          <div className="text-xs text-felora-silver/50">Clic pour recharger</div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className={className}
      onClick={playAnimation}
      style={{ cursor: 'pointer' }}
    />
  )
}