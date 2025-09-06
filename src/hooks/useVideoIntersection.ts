'use client'

import { useCallback, useEffect } from 'react'
import { useFeedStore } from '../stores/feedStore'
import type { TIntersectingVideo } from '../stores/feedStore'

export function useVideoIntersection() {
  const {
    currentVideo,
    setCurrentVideo,
    isMute,
  } = useFeedStore()

  // Gestion de l'intersection observer pour les vidéos
  const handleIntersectingChange = useCallback(
    (video: TIntersectingVideo) => {
      const { inView, videoRef } = video
      const videoElem = videoRef.current

      if (!videoElem) return

      if (!inView) {
        // Pause et reset quand pas visible
        videoElem.pause()
        videoElem.currentTime = 0
        return
      }

      // Play et définir comme vidéo courante quand visible
      videoElem.play().catch(error => {
        console.warn('Autoplay failed:', error)
      })
      setCurrentVideo(videoRef, true)
    },
    [setCurrentVideo]
  )

  // Appliquer le mute/unmute à la vidéo courante
  useEffect(() => {
    const video = currentVideo.videoRef?.current
    if (!video) return

    video.muted = isMute
  }, [isMute, currentVideo])

  // Fonction pour toggle play/pause manuellement
  const togglePlayPause = useCallback(() => {
    const video = currentVideo.videoRef?.current
    if (!video) return

    if (currentVideo.isPlaying) {
      video.pause()
      setCurrentVideo(currentVideo.videoRef, false)
    } else {
      video.play().catch(error => {
        console.warn('Play failed:', error)
      })
      setCurrentVideo(currentVideo.videoRef, true)
    }
  }, [currentVideo, setCurrentVideo])

  return {
    handleIntersectingChange,
    togglePlayPause,
    currentVideo,
    isMute,
  }
}