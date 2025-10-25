import { useState, useCallback, useEffect, useRef } from 'react'

interface VideoLoadingOptions {
  maxConcurrentVideos?: number
  preloadDistance?: number
  retryAttempts?: number
  retryDelay?: number
}

interface VideoState {
  id: string
  src: string
  isLoaded: boolean
  isLoading: boolean
  hasError: boolean
  retryCount: number
  priority: number
}

export function useOptimizedVideoLoading(options: VideoLoadingOptions = {}) {
  const {
    maxConcurrentVideos = 2,
    preloadDistance = 2,
    retryAttempts = 3,
    retryDelay = 1000
  } = options

  const [videos, setVideos] = useState<Map<string, VideoState>>(new Map())
  const [loadingQueue, setLoadingQueue] = useState<string[]>([])
  const [currentlyLoading, setCurrentlyLoading] = useState<Set<string>>(new Set())
  const videoRefs = useRef<Map<string, React.RefObject<HTMLVideoElement>>>(new Map())

  // Ajouter une vidéo à la queue de chargement
  const addVideo = useCallback((id: string, src: string, priority: number = 0) => {
    setVideos(prev => new Map(prev).set(id, {
      id,
      src,
      isLoaded: false,
      isLoading: false,
      hasError: false,
      retryCount: 0,
      priority
    }))

    setLoadingQueue(prev => {
      const newQueue = [...prev, id]
      // Trier par priorité (plus haute priorité = chargement plus rapide)
      return newQueue.sort((a, b) => {
        const videoA = videos.get(a)
        const videoB = videos.get(b)
        return (videoB?.priority || 0) - (videoA?.priority || 0)
      })
    })
  }, [videos])

  // Retirer une vidéo de la queue
  const removeVideo = useCallback((id: string) => {
    setVideos(prev => {
      const newVideos = new Map(prev)
      newVideos.delete(id)
      return newVideos
    })

    setLoadingQueue(prev => prev.filter(videoId => videoId !== id))
    setCurrentlyLoading(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }, [])

  // Marquer une vidéo comme chargée
  const markAsLoaded = useCallback((id: string) => {
    setVideos(prev => {
      const newVideos = new Map(prev)
      const video = newVideos.get(id)
      if (video) {
        newVideos.set(id, {
          ...video,
          isLoaded: true,
          isLoading: false,
          hasError: false
        })
      }
      return newVideos
    })

    setCurrentlyLoading(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }, [])

  // Marquer une vidéo comme ayant une erreur
  const markAsError = useCallback((id: string) => {
    setVideos(prev => {
      const newVideos = new Map(prev)
      const video = newVideos.get(id)
      if (video) {
        const newRetryCount = video.retryCount + 1
        newVideos.set(id, {
          ...video,
          isLoading: false,
          hasError: newRetryCount >= retryAttempts,
          retryCount: newRetryCount
        })
      }
      return newVideos
    })

    setCurrentlyLoading(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }, [retryAttempts])

  // Démarrer le chargement d'une vidéo
  const startLoading = useCallback((id: string) => {
    const video = videos.get(id)
    if (!video || video.isLoaded || video.isLoading || currentlyLoading.has(id)) {
      return
    }

    if (currentlyLoading.size >= maxConcurrentVideos) {
      return // Attendre qu'une vidéo se libère
    }

    setVideos(prev => {
      const newVideos = new Map(prev)
      const video = newVideos.get(id)
      if (video) {
        newVideos.set(id, { ...video, isLoading: true })
      }
      return newVideos
    })

    setCurrentlyLoading(prev => new Set([...prev, id]))

    // Simuler le chargement (en réalité, c'est géré par le composant vidéo)
    console.log(`🎬 Démarrage du chargement de la vidéo ${id}`)
  }, [videos, currentlyLoading, maxConcurrentVideos])

  // Gérer la queue de chargement
  useEffect(() => {
    if (loadingQueue.length === 0) return

    const nextVideoId = loadingQueue[0]
    const video = videos.get(nextVideoId)

    if (video && !video.isLoaded && !video.isLoading && !currentlyLoading.has(nextVideoId)) {
      startLoading(nextVideoId)
      setLoadingQueue(prev => prev.slice(1))
    }
  }, [loadingQueue, videos, currentlyLoading, startLoading])

  // Retry automatique pour les vidéos en erreur
  useEffect(() => {
    const retryVideos = Array.from(videos.values()).filter(
      video => video.hasError && video.retryCount < retryAttempts
    )

    retryVideos.forEach(video => {
      const delay = retryDelay * Math.pow(2, video.retryCount) // Backoff exponentiel
      setTimeout(() => {
        setVideos(prev => {
          const newVideos = new Map(prev)
          const currentVideo = newVideos.get(video.id)
          if (currentVideo) {
            newVideos.set(video.id, {
              ...currentVideo,
              hasError: false,
              isLoading: false
            })
          }
          return newVideos
        })
        setLoadingQueue(prev => [...prev, video.id])
      }, delay)
    })
  }, [videos, retryAttempts, retryDelay])

  // Obtenir l'état d'une vidéo
  const getVideoState = useCallback((id: string) => {
    return videos.get(id)
  }, [videos])

  // Vérifier si une vidéo peut être chargée
  const canLoadVideo = useCallback((id: string) => {
    const video = videos.get(id)
    return video && !video.isLoaded && !video.isLoading && !video.hasError
  }, [videos])

  // Statistiques
  const stats = {
    totalVideos: videos.size,
    loadedVideos: Array.from(videos.values()).filter(v => v.isLoaded).length,
    loadingVideos: currentlyLoading.size,
    errorVideos: Array.from(videos.values()).filter(v => v.hasError).length,
    queueLength: loadingQueue.length
  }

  return {
    addVideo,
    removeVideo,
    markAsLoaded,
    markAsError,
    getVideoState,
    canLoadVideo,
    stats
  }
}
