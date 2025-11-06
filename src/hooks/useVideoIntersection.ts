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
        // Pause, mute et reset quand pas visible
        videoElem.pause()
        videoElem.muted = true
        videoElem.currentTime = 0
        return
      }

      // IMPORTANT : Pause l'ancienne vidéo avant de jouer la nouvelle
      const previousVideo = currentVideo.videoRef?.current
      if (previousVideo && previousVideo !== videoElem) {
        previousVideo.pause()
        previousVideo.muted = true
        previousVideo.currentTime = 0
      }

      // Appliquer le mute global à la nouvelle vidéo
      videoElem.muted = isMute

      // Play et définir comme vidéo courante
      videoElem.play().catch(error => {
        console.warn('Autoplay failed:', error)
      })
      setCurrentVideo(videoRef, true)
    },
    [setCurrentVideo, currentVideo, isMute]
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