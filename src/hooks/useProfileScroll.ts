import { RefObject, useEffect } from 'react'
import { useProfileStore } from '../stores/profileStore'

// Hook pour restaurer le scroll précédent (inspiré de TikTok)
export function useRestoreProfileScroll(ref: RefObject<HTMLElement | null>) {
  const { isRestore, prevScroll, setPrevScroll, setIsRestore } = useProfileStore()

  useEffect(() => {
    if (!isRestore) return

    const elem = ref?.current
    if (!elem) return

    // Restaurer la position de scroll avec un petit délai pour le rendu
    setTimeout(() => {
      elem.scrollTop = prevScroll
      
      // Reset scroll state après restauration
      setPrevScroll(0)
      setIsRestore(false)
    }, 100)
  }, [isRestore, prevScroll, ref, setIsRestore, setPrevScroll])
}

// Hook pour garder le scroll avant navigation
export function useSetProfileScroll(ref: RefObject<HTMLElement>) {
  const { setPrevScroll, setIsRestore } = useProfileStore()

  function keepScrollBeforeNavigate() {
    const scrollHeight = ref?.current?.scrollTop || 0
    setPrevScroll(scrollHeight)
    setIsRestore(false) // Ne pas restaurer immédiatement
  }

  function prepareScrollRestore() {
    setIsRestore(true)
  }

  return { 
    keepScrollBeforeNavigate, 
    prepareScrollRestore 
  }
}

// Hook pour la gestion du scroll dans la galerie plein écran
export function useFullscreenNavigation(mediaArray: string[]) {
  const { fullscreenIndex, setFullscreenIndex } = useProfileStore()

  const navigateFullscreen = (direction: 'up' | 'down') => {
    if (!mediaArray.length) return

    let newIndex = fullscreenIndex

    if (direction === 'down') {
      newIndex = fullscreenIndex < mediaArray.length - 1 
        ? fullscreenIndex + 1 
        : 0 // Retour au début
    } else {
      newIndex = fullscreenIndex > 0 
        ? fullscreenIndex - 1 
        : mediaArray.length - 1 // Aller à la fin
    }

    setFullscreenIndex(newIndex)
    return newIndex
  }

  return {
    fullscreenIndex,
    navigateFullscreen,
    setFullscreenIndex
  }
}