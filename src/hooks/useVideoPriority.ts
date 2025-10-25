import { useState, useEffect, useCallback } from 'react'

interface VideoPriorityOptions {
  maxConcurrentVideos?: number
  priorityDelay?: number
}

/**
 * Hook pour gérer la priorité de chargement des vidéos
 * Évite de charger toutes les vidéos en même temps
 */
export function useVideoPriority(options: VideoPriorityOptions = {}) {
  const { maxConcurrentVideos = 2, priorityDelay = 100 } = options
  
  const [loadingVideos, setLoadingVideos] = useState<Set<string>>(new Set())
  const [videoQueue, setVideoQueue] = useState<string[]>([])
  
  const requestVideoLoad = useCallback((videoId: string) => {
    setVideoQueue(prev => [...prev, videoId])
  }, [])
  
  const releaseVideo = useCallback((videoId: string) => {
    setLoadingVideos(prev => {
      const newSet = new Set(prev)
      newSet.delete(videoId)
      return newSet
    })
  }, [])
  
  // Gérer la file d'attente des vidéos
  useEffect(() => {
    if (videoQueue.length === 0) return
    
    const canLoadMore = loadingVideos.size < maxConcurrentVideos
    if (!canLoadMore) return
    
    const nextVideoId = videoQueue[0]
    setVideoQueue(prev => prev.slice(1))
    setLoadingVideos(prev => new Set([...prev, nextVideoId]))
    
    // Libérer la vidéo après un délai
    const timer = setTimeout(() => {
      releaseVideo(nextVideoId)
    }, priorityDelay)
    
    return () => clearTimeout(timer)
  }, [videoQueue, loadingVideos, maxConcurrentVideos, priorityDelay, releaseVideo])
  
  const canLoadVideo = useCallback((videoId: string) => {
    return loadingVideos.has(videoId) || loadingVideos.size < maxConcurrentVideos
  }, [loadingVideos, maxConcurrentVideos])
  
  return {
    requestVideoLoad,
    releaseVideo,
    canLoadVideo,
    loadingCount: loadingVideos.size,
    queueLength: videoQueue.length
  }
}
