'use client'

import { useEffect, useRef, useState } from 'react'

interface GiftPlayerSimpleWorkingProps {
  lottieUrl: string
  className?: string
  loop?: boolean
  autoplay?: boolean
}

export function GiftPlayerSimpleWorking({ 
  lottieUrl, 
  className = 'w-32 h-32', 
  loop = false, 
  autoplay = true 
}: GiftPlayerSimpleWorkingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    let lottie: any = null
    
    const loadLottie = async () => {
      try {
        // Import dynamique de lottie-web pour éviter les erreurs SSR
        const lottieModule = await import('lottie-web')
        lottie = lottieModule.default

        // Nettoyer le conteneur
        containerRef.current!.innerHTML = ''

        console.log('🎬 Chargement animation:', lottieUrl)

        // Charger l'animation
        const animation = lottie.loadAnimation({
          container: containerRef.current!,
          renderer: 'svg',
          loop: loop,
          autoplay: autoplay,
          path: lottieUrl
        })

        // Événement de chargement réussi
        animation.addEventListener('DOMLoaded', () => {
          console.log('✅ Animation chargée:', lottieUrl)
          setIsLoaded(true)
          setHasError(false)
        })

        // Événement d'erreur
        animation.addEventListener('data_failed', () => {
          console.error('❌ Erreur chargement:', lottieUrl)
          setHasError(true)
          setIsLoaded(false)
        })

        // Cleanup function
        return () => {
          if (animation) {
            animation.destroy()
          }
        }
      } catch (error) {
        console.error('💥 Erreur Lottie:', error)
        setHasError(true)
        setIsLoaded(false)
      }
    }

    loadLottie()
  }, [lottieUrl, loop, autoplay])

  // État de chargement
  if (!isLoaded && !hasError) {
    return (
      <div className={`${className} flex items-center justify-center bg-felora-obsidian rounded-lg border border-white/10`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-felora-aurora border-t-transparent mx-auto mb-2"></div>
          <div className="text-xs text-felora-silver/60">Chargement...</div>
        </div>
      </div>
    )
  }

  // État d'erreur avec fallback
  if (hasError) {
    const giftName = lottieUrl.split('/').pop()?.replace('.json', '') || 'animation'
    
    return (
      <div className={`${className} flex items-center justify-center bg-felora-obsidian rounded-lg border border-red-500/30`}>
        <div className="text-center">
          <div className="text-2xl mb-1">❌</div>
          <div className="text-xs text-red-400">Erreur</div>
          <div className="text-xs text-felora-silver/40 mt-1">{giftName}</div>
        </div>
      </div>
    )
  }

  // Conteneur pour l'animation
  return (
    <div 
      ref={containerRef} 
      className={`${className} cursor-pointer`}
      style={{
        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
      }}
    />
  )
}