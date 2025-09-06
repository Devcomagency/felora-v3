'use client'

import { useCallback } from 'react'
import { useFeedStore } from '../stores/feedStore'
import type { MediaItem } from '../../packages/core/services/media/MediaService'

export function useFeedActions() {
  const {
    toggleLike,
    toggleFollow,
    isItemLiked,
    isUserFollowed,
    setLikeLoading,
    setFollowLoading,
    isLikeLoading,
    isFollowLoading,
  } = useFeedStore()

  // Action pour liker/unliker un item
  const handleLike = useCallback(async (item: MediaItem) => {
    if (isLikeLoading(item.id)) return

    setLikeLoading(item.id, true)

    try {
      // Optimistic update - change immédiatement l'état
      toggleLike(item.id)

      // TODO: Appel API réel
      // await mediaService.toggleLike(item.id)
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      // Revert en cas d'erreur
      toggleLike(item.id)
      console.error('Erreur lors du like:', error)
    } finally {
      setLikeLoading(item.id, false)
    }
  }, [toggleLike, setLikeLoading, isLikeLoading])

  // Action pour follow/unfollow un utilisateur
  const handleFollow = useCallback(async (userId: string, handle: string) => {
    if (isFollowLoading(userId)) return

    setFollowLoading(userId, true)

    try {
      // Optimistic update
      toggleFollow(userId)

      // TODO: Appel API réel
      // await profileService.toggleFollow(userId)
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 800))
      
      console.log(`${isUserFollowed(userId) ? 'Unfollowed' : 'Followed'} ${handle}`)
      
    } catch (error) {
      // Revert en cas d'erreur
      toggleFollow(userId)
      console.error('Erreur lors du follow:', error)
    } finally {
      setFollowLoading(userId, false)
    }
  }, [toggleFollow, setFollowLoading, isFollowLoading, isUserFollowed])

  // Action pour ouvrir une conversation
  const handleMessage = useCallback(async (item: MediaItem) => {
    try {
      // TODO: Implémenter l'ouverture de la messagerie
      console.log(`Ouvrir conversation avec ${item.author.handle}`)
      
      // Pour l'instant, juste un log
      // Plus tard: router.push(`/messages/${item.author.id}`)
      
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du message:', error)
    }
  }, [])

  // Action pour partager un item
  const handleShare = useCallback(async (item: MediaItem) => {
    try {
      const shareData = {
        title: `${item.author.name} - FELORA`,
        text: `Découvrez le contenu de ${item.author.handle} sur FELORA`,
        url: `${window.location.origin}/feed/${item.id}`,
      }

      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback vers le clipboard
        const shareText = `${shareData.text} - ${shareData.url}`
        await navigator.clipboard.writeText(shareText)
        
        // TODO: Afficher une notification de succès
        console.log('Lien copié dans le presse-papiers!')
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error)
    }
  }, [])

  return {
    handleLike,
    handleFollow, 
    handleMessage,
    handleShare,
    isItemLiked,
    isUserFollowed,
    isLikeLoading,
    isFollowLoading,
  }
}
