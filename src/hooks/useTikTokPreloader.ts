import { useEffect, useRef, useState } from 'react'

interface PreloadOptions {
  maxPreload?: number
  preloadDistance?: number
}

export function useTikTokPreloader(options: PreloadOptions = {}) {
  const { maxPreload = 3, preloadDistance = 200 } = options
  const [preloadedVideos, setPreloadedVideos] = useState<Set<string>>(new Set())
  const preloadQueue = useRef<string[]>([])
  const videoElements = useRef<Map<string, HTMLVideoElement>>(new Map())

  // Précharger une vidéo
  const preloadVideo = (videoId: string, videoUrl: string) => {
    if (preloadedVideos.has(videoId)) return

    console.log(`🚀 Préchargement vidéo TikTok: ${videoId}`)
    
    const video = document.createElement('video')
    video.src = videoUrl
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    video.style.display = 'none'
    
    video.oncanplaythrough = () => {
      console.log(`✅ Vidéo préchargée: ${videoId}`)
      setPreloadedVideos(prev => new Set([...prev, videoId]))
    }
    
    video.onerror = (e) => {
      console.warn(`⚠️ Erreur préchargement: ${videoId}`, e)
    }
    
    document.body.appendChild(video)
    videoElements.current.set(videoId, video)
  }

  // Nettoyer les vidéos préchargées
  const cleanupVideo = (videoId: string) => {
    const video = videoElements.current.get(videoId)
    if (video) {
      video.remove()
      videoElements.current.delete(videoId)
    }
    setPreloadedVideos(prev => {
      const newSet = new Set(prev)
      newSet.delete(videoId)
      return newSet
    })
  }

  // Ajouter une vidéo à la queue de préchargement
  const addToPreloadQueue = (videoId: string, videoUrl: string, priority: number = 0) => {
    const queueItem = { videoId, videoUrl, priority, timestamp: Date.now() }
    
    preloadQueue.current.push(queueItem)
    preloadQueue.current.sort((a, b) => b.priority - a.priority)
    
    // Précharger immédiatement si on a de la place
    if (preloadedVideos.size < maxPreload) {
      const nextItem = preloadQueue.current.shift()
      if (nextItem) {
        preloadVideo(nextItem.videoId, nextItem.videoUrl)
      }
    }
  }

  // Nettoyer les vidéos anciennes
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now()
      const maxAge = 30000 // 30 secondes
      
      preloadQueue.current = preloadQueue.current.filter(item => {
        if (now - item.timestamp > maxAge) {
          cleanupVideo(item.videoId)
          return false
        }
        return true
      })
    }
    
    const interval = setInterval(cleanup, 10000) // Nettoyer toutes les 10 secondes
    return () => clearInterval(interval)
  }, [])

  // Nettoyer au démontage
  useEffect(() => {
    return () => {
      videoElements.current.forEach((video, videoId) => {
        video.remove()
      })
      videoElements.current.clear()
    }
  }, [])

  return {
    preloadVideo,
    addToPreloadQueue,
    cleanupVideo,
    isPreloaded: (videoId: string) => preloadedVideos.has(videoId),
    preloadedCount: preloadedVideos.size,
    queueLength: preloadQueue.current.length
  }
}
