'use client'

import { useEffect, useRef, useState } from 'react'

interface LottiePlayerFixedProps {
  src: string
  className?: string
  loop?: boolean
  autoplay?: boolean
}

export function LottiePlayerFixed({ 
  src, 
  className = 'w-32 h-32',
  loop = true,
  autoplay = true
}: LottiePlayerFixedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    let animation: any = null

    const loadAnimation = async () => {
      if (!containerRef.current) return

      try {
        setStatus('loading')
        
        // Import dynamique de lottie-web
        const lottie = (await import('lottie-web')).default
        
        // Clear le conteneur
        containerRef.current.innerHTML = ''

        console.log('🎬 Loading:', src)

        // Créer l'animation
        animation = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: loop,
          autoplay: autoplay,
          path: src
        })

        // Event listeners
        animation.addEventListener('DOMLoaded', () => {
          console.log('✅ Loaded:', src)
          setStatus('loaded')
        })

        animation.addEventListener('data_failed', () => {
          console.error('❌ Failed:', src)
          setStatus('error')
        })

        // Timeout de sécurité
        setTimeout(() => {
          if (status === 'loading') {
            console.warn('⏰ Timeout:', src)
            setStatus('error')
          }
        }, 5000)

      } catch (error) {
        console.error('💥 Error loading lottie:', error)
        setStatus('error')
      }
    }

    loadAnimation()

    return () => {
      if (animation) {
        animation.destroy()
      }
    }
  }, [src, loop, autoplay])

  if (status === 'loading') {
    return (
      <div className={`${className} flex items-center justify-center bg-felora-obsidian/50 rounded-lg`}>
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-felora-aurora border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs text-felora-silver/60 mt-1">Loading...</div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    const filename = src.split('/').pop()?.replace('.json', '') || 'animation'
    return (
      <div className={`${className} flex items-center justify-center bg-red-900/20 rounded-lg border border-red-500/30`}>
        <div className="text-center">
          <div className="text-red-500 text-xl">❌</div>
          <div className="text-xs text-red-400">Error</div>
          <div className="text-xs text-felora-silver/40">{filename}</div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ 
        background: 'transparent',
        overflow: 'hidden'
      }}
    />
  )
}