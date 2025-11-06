'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface VideoItem {
  id: string
  url: string
  type: 'IMAGE' | 'VIDEO'
}

interface UseVideoPreloaderOptions {
  items: VideoItem[]
  currentIndex: number
  preloadCount?: number // Nombre de vidéos à précharger (default: 2)
  unloadDistance?: number // Distance avant de décharger (default: 3)
  enableCache?: boolean // Cache avec IndexedDB (default: true)
}

interface PreloadedVideo {
  url: string
  video: HTMLVideoElement
  loaded: boolean
  error: boolean
}

/**
 * Hook pour précharger intelligemment les vidéos du feed
 * Stratégie TikTok :
 * - Preload les 2 vidéos suivantes
 * - Garde en cache la vidéo actuelle + 1 avant
 * - Unload les vidéos trop éloignées
 */
export function useVideoPreloader({
  items,
  currentIndex,
  preloadCount = 2,
  unloadDistance = 3,
}: UseVideoPreloaderOptions) {
  const preloadedVideosRef = useRef<Map<string, PreloadedVideo>>(new Map())
  const [loadingStatus, setLoadingStatus] = useState<Record<string, boolean>>({})

  /**
   * Précharge une vidéo en arrière-plan
   */
  const preloadVideo = useCallback((item: VideoItem): Promise<HTMLVideoElement> => {
    return new Promise((resolve, reject) => {
      // Vérifier si déjà en cache
      const cached = preloadedVideosRef.current.get(item.url)
      if (cached?.loaded) {
        console.log('📺 [PRELOADER] Vidéo déjà en cache:', item.id)
        resolve(cached.video)
        return
      }

      console.log('⏳ [PRELOADER] Début preload:', item.id)
      setLoadingStatus(prev => ({ ...prev, [item.id]: true }))

      const video = document.createElement('video')
      video.src = item.url
      video.preload = 'auto'
      video.muted = true
      video.playsInline = true
      video.crossOrigin = 'anonymous'

      // Optimisations pour éviter la perte de qualité
      video.setAttribute('playsinline', 'true')
      video.setAttribute('webkit-playsinline', 'true')

      // Buffer suffisant pour éviter les coupures
      const handleCanPlayThrough = () => {
        console.log('✅ [PRELOADER] Vidéo prête:', item.id)
        preloadedVideosRef.current.set(item.url, {
          url: item.url,
          video,
          loaded: true,
          error: false
        })
        setLoadingStatus(prev => ({ ...prev, [item.id]: false }))
        resolve(video)
      }

      const handleError = (e: Event) => {
        console.error('❌ [PRELOADER] Erreur preload:', item.id, e)
        preloadedVideosRef.current.set(item.url, {
          url: item.url,
          video,
          loaded: false,
          error: true
        })
        setLoadingStatus(prev => ({ ...prev, [item.id]: false }))
        reject(e)
      }

      video.addEventListener('canplaythrough', handleCanPlayThrough, { once: true })
      video.addEventListener('error', handleError, { once: true })

      // Timeout si trop long (30s)
      setTimeout(() => {
        if (!preloadedVideosRef.current.get(item.url)?.loaded) {
          console.warn('⏰ [PRELOADER] Timeout preload:', item.id)
          video.removeEventListener('canplaythrough', handleCanPlayThrough)
          video.removeEventListener('error', handleError)
          reject(new Error('Preload timeout'))
        }
      }, 30000)

      // Commencer le chargement
      video.load()
    })
  }, [])

  /**
   * Décharge une vidéo de la mémoire
   */
  const unloadVideo = useCallback((url: string) => {
    const cached = preloadedVideosRef.current.get(url)
    if (cached) {
      console.log('🗑️ [PRELOADER] Unload vidéo:', url.slice(-20))
      cached.video.pause()
      cached.video.src = ''
      cached.video.load()
      preloadedVideosRef.current.delete(url)
    }
  }, [])

  /**
   * Récupère une vidéo préchargée
   */
  const getPreloadedVideo = useCallback((url: string): HTMLVideoElement | null => {
    const cached = preloadedVideosRef.current.get(url)
    return cached?.loaded ? cached.video : null
  }, [])

  /**
   * Gestion intelligente du preload/unload
   */
  useEffect(() => {
    const videoItems = items.filter(item => item.type === 'VIDEO')
    if (videoItems.length === 0) return

    console.log('🎬 [PRELOADER] Current index:', currentIndex, '/', videoItems.length)

    // 1. Précharger les vidéos suivantes
    const startPreloadIndex = currentIndex
    const endPreloadIndex = Math.min(currentIndex + preloadCount, videoItems.length - 1)

    for (let i = startPreloadIndex; i <= endPreloadIndex; i++) {
      const item = videoItems[i]
      if (item && !preloadedVideosRef.current.get(item.url)?.loaded) {
        preloadVideo(item).catch(err => {
          console.error('❌ [PRELOADER] Erreur preload item', i, err)
        })
      }
    }

    // 2. Décharger les vidéos trop éloignées
    const keepStartIndex = Math.max(0, currentIndex - 1) // Garde 1 vidéo avant
    const keepEndIndex = Math.min(videoItems.length - 1, currentIndex + preloadCount + 1)

    videoItems.forEach((item, index) => {
      if (item.type === 'VIDEO') {
        const distance = Math.abs(index - currentIndex)
        if (distance > unloadDistance && (index < keepStartIndex || index > keepEndIndex)) {
          unloadVideo(item.url)
        }
      }
    })

    // Log status
    console.log('📊 [PRELOADER] Cache size:', preloadedVideosRef.current.size)
    console.log('📊 [PRELOADER] Keep range:', keepStartIndex, '->', keepEndIndex)

  }, [currentIndex, items, preloadCount, unloadDistance, preloadVideo, unloadVideo])

  /**
   * Cleanup au démontage
   */
  useEffect(() => {
    return () => {
      console.log('🧹 [PRELOADER] Cleanup all videos')
      preloadedVideosRef.current.forEach((cached) => {
        cached.video.pause()
        cached.video.src = ''
        cached.video.load()
      })
      preloadedVideosRef.current.clear()
    }
  }, [])

  return {
    getPreloadedVideo,
    preloadVideo,
    unloadVideo,
    loadingStatus,
    cacheSize: preloadedVideosRef.current.size
  }
}

/**
 * Hook pour tracker l'index actuel du feed
 */
export function useCurrentVideoIndex(containerRef: React.RefObject<HTMLElement | HTMLDivElement | null>) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const itemHeight = container.clientHeight
      const index = Math.round(scrollTop / itemHeight)

      if (index !== currentIndex) {
        console.log('📍 [INDEX] Changed from', currentIndex, 'to', index)
        setCurrentIndex(index)
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [containerRef, currentIndex])

  return currentIndex
}
