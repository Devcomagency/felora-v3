import { useState } from 'react'
import { useProfileStore } from '../stores/profileStore'
import { useRouter } from 'next/navigation'

// Hook pour les interactions de profil (follow, like, favorite)
export function useProfileInteractions(profileId: string) {
  const [loading, setLoading] = useState(false)
  const { 
    following, 
    favorites, 
    likedProfiles,
    toggleFollow, 
    addFavorite, 
    removeFavorite, 
    toggleProfileLike,
    updateProfileLikes
  } = useProfileStore()

  const isFollowing = following.includes(profileId)
  const isFavorite = favorites.includes(profileId)
  const isLiked = likedProfiles.includes(profileId)

  const handleFollow = async () => {
    setLoading(true)
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500))
      toggleFollow(profileId)
    } catch (error) {
      console.error('Erreur follow:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = () => {
    if (isFavorite) {
      removeFavorite(profileId)
    } else {
      addFavorite(profileId)
    }
  }

  const handleLike = () => {
    toggleProfileLike(profileId)
    updateProfileLikes(profileId, !isLiked)
    
    // Simuler vibration si supportée
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  return {
    isFollowing,
    isFavorite,
    isLiked,
    loading,
    handleFollow,
    handleFavorite,
    handleLike
  }
}

// Hook pour les réactions (émojis)
export function useProfileReactions(profileId: string) {
  const [showReactions, setShowReactions] = useState(false)
  const [explosionEmojis, setExplosionEmojis] = useState<{emoji: string, id: number}[]>([])
  
  const {
    setProfileReaction,
    removeProfileReaction,
    getProfileReactions,
    getTotalReactions,
    getUserReaction
  } = useProfileStore()

  const reactions = getProfileReactions(profileId)
  const userReaction = getUserReaction(profileId)
  const totalReactions = getTotalReactions(profileId)

  const handleReaction = (emoji: string) => {
    setProfileReaction(profileId, emoji)
    setShowReactions(false)
    
    // Animation d'explosion
    if (emoji !== userReaction) {
      addExplosionEmojis(emoji)
    }
    
    // Simuler vibration
    if (navigator.vibrate) {
      navigator.vibrate([30, 50, 30])
    }
  }

  const addExplosionEmojis = (emoji: string) => {
    const newEmojis = Array.from({ length: 6 }, (_, i) => ({
      emoji: emoji,
      id: Date.now() + i
    }))
    
    setExplosionEmojis(prev => [...prev, ...newEmojis])
    
    // Nettoyer après animation
    setTimeout(() => {
      setExplosionEmojis(prev => prev.filter(e => !newEmojis.includes(e)))
    }, 2000)
  }

  const handleDoubleTapLike = () => {
    if (!userReaction) {
      handleReaction('❤️')
    }
  }

  return {
    reactions,
    userReaction,
    totalReactions,
    showReactions,
    setShowReactions,
    explosionEmojis,
    handleReaction,
    handleDoubleTapLike,
    removeReaction: () => removeProfileReaction(profileId)
  }
}

// Hook pour les actions de partage et contact
export function useProfileActions(profileName: string) {
  const router = useRouter()
  const [showContactDropdown, setShowContactDropdown] = useState(false)

  const handleMessage = (profileId?: string) => {
    console.log('Bouton Message cliqué - redirection vers /messages')
    if (profileId) {
      router.push(`/messages?to=${encodeURIComponent(profileId)}`)
    } else {
      router.push('/messages')
    }
  }

  const handleCall = (phoneNumber: string) => {
    if (navigator.vibrate) {
      navigator.vibrate([30])
    }
    window.open(`tel:${phoneNumber}`)
    setShowContactDropdown(false)
  }

  const handleWhatsApp = (phoneNumber: string) => {
    if (navigator.vibrate) {
      navigator.vibrate([30])
    }
    const cleanNumber = phoneNumber.replace(/\+|\s/g, '')
    const message = `Salut ${profileName} ! Je souhaite vous contacter via FELORA.`
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`)
    setShowContactDropdown(false)
  }

  const handleSMS = (phoneNumber: string) => {
    if (navigator.vibrate) {
      navigator.vibrate([30])
    }
    const smsMessage = `Bonjour ${profileName}, je vous contacte depuis FELORA.`
    const smsUrl = /iPhone|iPad|iPod|iOS/i.test(navigator.userAgent) 
      ? `sms:${phoneNumber}&body=${encodeURIComponent(smsMessage)}`
      : `sms:${phoneNumber}?body=${encodeURIComponent(smsMessage)}`
    window.open(smsUrl)
    setShowContactDropdown(false)
  }

  const handleShare = (mediaUrl?: string) => {
    const url = mediaUrl || window.location.href
    const title = `Profil de ${profileName} sur FELORA`
    
    if (navigator.share) {
      navigator.share({
        title,
        url
      }).catch(() => {
        // Fallback: copier dans le presse-papier
        navigator.clipboard?.writeText(url)
      })
    } else {
      // Fallback pour navigateurs sans support
      navigator.clipboard?.writeText(url)
    }
  }

  return {
    showContactDropdown,
    setShowContactDropdown,
    handleMessage,
    handleCall,
    handleWhatsApp,
    handleSMS,
    handleShare
  }
}

// Hook pour la gestion des médias
export function useMediaInteractions() {
  const {
    toggleMediaLike,
    isMediaLiked,
    getMediaLikes,
    isGalleryUnlocked,
    unlockedContent,
    setGalleryUnlocked,
    addUnlockedContent
  } = useProfileStore()

  const handleMediaLike = (mediaId: string, baseCount: number) => {
    toggleMediaLike(mediaId, baseCount)
    
    // Animation et vibration
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const handleUnlockContent = (contentId: string) => {
    addUnlockedContent(contentId)
  }

  const handleUnlockGallery = () => {
    setGalleryUnlocked(true)
  }

  const isContentUnlocked = (contentId: string) => {
    return unlockedContent.includes(contentId)
  }

  return {
    isGalleryUnlocked,
    handleMediaLike,
    handleUnlockContent,
    handleUnlockGallery,
    isContentUnlocked,
    isMediaLiked,
    getMediaLikes
  }
}