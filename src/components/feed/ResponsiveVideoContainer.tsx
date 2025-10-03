'use client'

import { useRef, useEffect, useState } from 'react'

interface ResponsiveVideoContainerProps {
  children: React.ReactNode
  className?: string
  aspectRatio?: '9:16' | '16:9' | '1:1' | '4:3'
  maxHeight?: string
  minHeight?: string
}

/**
 * Conteneur responsive qui maintient un ratio d'aspect fixe
 * Résout les problèmes de décentrage et de hauteur variable
 */
export default function ResponsiveVideoContainer({ 
  children, 
  className = '',
  aspectRatio = '9:16',
  maxHeight = '100vh',
  minHeight = '100vh'
}: ResponsiveVideoContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Calculer les dimensions basées sur le ratio d'aspect
  const getAspectRatio = () => {
    switch (aspectRatio) {
      case '9:16': return 9 / 16
      case '16:9': return 16 / 9
      case '1:1': return 1
      case '4:3': return 4 / 3
      default: return 9 / 16
    }
  }

  // Mettre à jour les dimensions lors du resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    window.addEventListener('orientationchange', updateDimensions)
    
    return () => {
      window.removeEventListener('resize', updateDimensions)
      window.removeEventListener('orientationchange', updateDimensions)
    }
  }, [])

  // Calculer la hauteur basée sur la largeur et le ratio
  const aspectRatioValue = getAspectRatio()
  const calculatedHeight = dimensions.width / aspectRatioValue

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        height: `min(${maxHeight}, max(${minHeight}, ${calculatedHeight}px))`,
        maxHeight: maxHeight,
        minHeight: minHeight,
        // Gestion des safe areas
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {children}
    </div>
  )
}

/**
 * Hook pour détecter les caractéristiques de l'écran
 */
export function useScreenCharacteristics() {
  const [characteristics, setCharacteristics] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    hasNotch: false,
    orientation: 'portrait' as 'portrait' | 'landscape',
    safeAreaInsets: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  })

  useEffect(() => {
    const updateCharacteristics = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Détection des breakpoints
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024
      
      // Détection de l'orientation
      const orientation = height > width ? 'portrait' : 'landscape'
      
      // Détection du notch (approximative)
      const hasNotch = isMobile && (
        // iPhone avec notch
        (width === 375 && height === 812) || // iPhone X, XS, 11 Pro
        (width === 414 && height === 896) || // iPhone XR, 11
        (width === 390 && height === 844) || // iPhone 12, 13 mini
        (width === 428 && height === 926) || // iPhone 12, 13 Pro Max
        // Android avec notch (approximatif)
        window.screen?.availHeight < window.screen?.height
      )

      // Récupération des safe areas (si supporté)
      const safeAreaInsets = {
        top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)') || '0')
      }

      setCharacteristics({
        isMobile,
        isTablet,
        isDesktop,
        hasNotch,
        orientation,
        safeAreaInsets
      })
    }

    updateCharacteristics()
    window.addEventListener('resize', updateCharacteristics)
    window.addEventListener('orientationchange', updateCharacteristics)
    
    return () => {
      window.removeEventListener('resize', updateCharacteristics)
      window.removeEventListener('orientationchange', updateCharacteristics)
    }
  }, [])

  return characteristics
}
