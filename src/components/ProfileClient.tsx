'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, MoreHorizontal, MapPin, Star, Crown, Heart, 
  MessageCircle, Play, Unlock, X, Share, 
  ChevronUp, ChevronDown, Smile, Diamond, Gift, BadgeCheck
} from 'lucide-react'
import { useReactionsStore } from '../stores/reactionsStore'
import { GiftPicker } from '@/components/gifts/GiftPicker'
import { GiftToast } from '@/components/gifts/GiftToast'

interface EscortProfile {
  id: string
  userId?: string
  name: string
  stageName: string
  age: number
  location: string
  media: string
  gallery: string[]
  blurredGallery: string[]
  description: string
  services: string[]
  price: number
  rating: number
  reviews: number
  likes: number
  followers: number
  online: boolean
  lastSeen: string
  verified: boolean
  premium: boolean
  responseRate: number
  responseTime: string
  unlockPrice?: number
  paymentMethods?: string[]
  languages?: string[]
  stats?: {
    views: number
    hearts: number
    bookings: number
  }
  // Nouvelles données du profil détaillé
  physicalDetails?: {
    height?: string
    bodyType?: string
    hairColor?: string
    eyeColor?: string
    ethnicity?: string
    bustSize?: string
    tattoos?: string
    piercings?: string
  }
  rates?: {
    hour?: number
    twoHours?: number
    halfDay?: number
    fullDay?: number
    overnight?: number
  }
  workingArea?: string
  practices?: string[]
  incall?: boolean
  outcall?: boolean
  availableNow?: boolean
  weekendAvailable?: boolean
}

const EMOJI_REACTIONS = ['🔥', '💎', '😍', '🤤', '💋', '🥵', '❤️', '🌟']

// Fonction pour générer les données étendues du profil à partir des vraies données
const generateExtendedProfileData = (profile: EscortProfile) => {
  // Seulement le tarif "À partir de" - le tarif le plus bas disponible
  const rates = []

  // Récupérer tous les tarifs disponibles pour trouver le plus bas
  const availableRates = []
  if (profile.rates?.hour) availableRates.push(profile.rates.hour)
  if (profile.rates?.twoHours) availableRates.push(profile.rates.twoHours)
  if (profile.rates?.halfDay) availableRates.push(profile.rates.halfDay)
  if (profile.rates?.fullDay) availableRates.push(profile.rates.fullDay)
  if (profile.rates?.overnight) availableRates.push(profile.rates.overnight)

  // Utiliser le tarif le plus bas comme "à partir de"
  if (availableRates.length > 0) {
    const minRate = Math.min(...availableRates)
    rates.push({
      duration: 'À partir de',
      price: minRate,
      description: `${minRate} CHF`
    })
  } else if (profile.price) {
    rates.push({ duration: 'À partir de', price: profile.price, description: `${profile.price} CHF` })
  }
  
  return {
    languages: profile.languages || [],
    practices: profile.practices || profile.services || [],
    rates: rates.length > 0 ? rates : [{ duration: '1h', price: profile.price, description: 'Rencontre intime' }],
    physicalDetails: {
      height: profile.physicalDetails?.height || 'Non spécifié',
      weight: 'Non spécifié', // Pas dans le schéma actuel
      measurements: 'Non spécifié', // Pas dans le schéma actuel
      breastSize: profile.physicalDetails?.bustSize || 'Non spécifié',
      hairColor: profile.physicalDetails?.hairColor || 'Non spécifié',
      eyeColor: profile.physicalDetails?.eyeColor || 'Non spécifié',
      bodyType: profile.physicalDetails?.bodyType || 'Non spécifié',
      skinTone: profile.physicalDetails?.ethnicity || 'Non spécifié'
    },
    availability: {
      today: ['14:00', '16:00', '20:00'],
      tomorrow: ['10:00', '15:00', '18:00', '21:00'],
      thisWeek: profile.availableNow ? 'Disponible maintenant' : 'Sur rendez-vous'
    },
    location: {
      city: profile.location,
      district: profile.workingArea || 'Centre-ville',
      outcall: profile.outcall || false,
      incall: profile.incall || false,
      travel: 'Suisse romande'
    },
    contact: {
      phone: '+41 79 123 45 67', // Données de contact sensibles - à garder statiques pour la démo
      whatsapp: '+41 79 123 45 67',
      availableForCalls: true,
      availableForWhatsApp: true,
      availableForSMS: true
    }
  }
}

interface ProfileClientProps {
  profile: EscortProfile
}

export default function ProfileClient({ profile: initialProfile }: ProfileClientProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [profile, setProfile] = useState<EscortProfile>(initialProfile)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showGiftToast, setShowGiftToast] = useState(false)
  const [lastReceivedGift, setLastReceivedGift] = useState<any>(null)
  
  // Générer les données étendues du profil à partir des vraies données
  const extendedProfileData = generateExtendedProfileData(profile)

  // Charger l'état des favoris au démarrage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('felora-favorites') || '[]')
    setIsFavorite(favorites.includes(profile.id))
  }, [profile.id])

  const handleFavoriteToggle = () => {
    const favorites = JSON.parse(localStorage.getItem('felora-favorites') || '[]')
    if (isFavorite) {
      // Retirer des favoris
      const newFavorites = favorites.filter((id: string) => id !== profile.id)
      localStorage.setItem('felora-favorites', JSON.stringify(newFavorites))
      setIsFavorite(false)
    } else {
      // Ajouter aux favoris
      const newFavorites = [...favorites, profile.id]
      localStorage.setItem('felora-favorites', JSON.stringify(newFavorites))
      setIsFavorite(true)
    }
  }
  const [activeReaction, setActiveReaction] = useState<string | null>(null)
  const [lastTap, setLastTap] = useState(0)
  const [doubleTapAnimation, setDoubleTapAnimation] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  
  // Système de réactions Telegram-style avec store global
  const [showReactionDetails, setShowReactionDetails] = useState(false)
  const { 
    setProfileReaction, 
    removeProfileReaction, 
    getProfileReactions, 
    getUserReaction, 
    getTotalReactions,
    toggleMediaLike,
    getMediaLikes,
    isMediaLiked
  } = useReactionsStore()
  
  // Obtenir les réactions et la réaction utilisateur depuis le store
  const reactions = getProfileReactions(profile.id)
  const userReaction = getUserReaction(profile.id)
  const [isMuted, setIsMuted] = useState(true)
  const [isGalleryUnlocked, setIsGalleryUnlocked] = useState(false)
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const [selectedRate, setSelectedRate] = useState(0)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showContactDropdown, setShowContactDropdown] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [unlockedContent, setUnlockedContent] = useState<string[]>([])

  // Umami profile view tracking
  useEffect(() => {
    try { (window as any)?.umami?.track?.('profile_view', { profileId: initialProfile.id }) } catch {}
  }, [initialProfile.id])
  
  // États pour le système de plein écran (groupés ensemble)
  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null)
  const [fullscreenIndex, setFullscreenIndex] = useState(0)
  const [mediaReactions, setMediaReactions] = useState<{[key: string]: string}>({})
  const [explosionEmojis, setExplosionEmojis] = useState<{emoji: string, id: number}[]>([])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)


  const handleMediaTap = (e: React.MouseEvent) => {
    const now = Date.now()
    
    if (now - lastTap < 300) {
      e.preventDefault()
      handleDoubleTapLike()
    }
    
    setLastTap(now)
  }

  const handleDoubleTapLike = () => {
    // Si pas encore de réaction, on met un cœur
    if (!userReaction) {
      handleTelegramReaction('❤️')
      setDoubleTapAnimation(true)
      setTimeout(() => setDoubleTapAnimation(false), 1000)
    }
  }

  // Gestion des réactions Telegram-style avec store global
  const handleTelegramReaction = (emoji: string) => {
    setProfileReaction(profile.id, emoji)
    setShowReactions(false)
    
    // Animation d'explosion
    if (emoji !== userReaction) { // Seulement si on ajoute une réaction
      addExplosionEmojis()
    }
    
    // Synchroniser l'état liked
    setIsLiked(!!getUserReaction(profile.id))
  }

  // Fonction pour l'explosion d'émojis
  const addExplosionEmojis = () => {
    const newEmojis = Array.from({ length: 6 }, (_, i) => ({
      emoji: userReaction || '❤️',
      id: Date.now() + i
    }))
    
    setExplosionEmojis(prev => [...prev, ...newEmojis])
    
    setTimeout(() => {
      setExplosionEmojis(prev => prev.filter(emoji => !newEmojis.includes(emoji)))
    }, 2000)
  }

  const handleReaction = (emoji: string) => {
    setActiveReaction(emoji)
    setShowReactions(false)
    
    setTimeout(() => setActiveReaction(null), 2000)
  }

  const handleToggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  const handleUnlockGallery = () => {
    setIsGalleryUnlocked(true)
  }

  const handleUnlockContent = (contentId: string) => {
    setUnlockedContent(prev => [...prev, contentId])
  }

  // === FONCTIONS PLEIN ÉCRAN (stables et isolées) ===
  const openFullscreen = useCallback((mediaUrl: string, index: number) => {
    // Empêcher les ouvertures multiples
    if (fullscreenMedia) return
    
    setFullscreenMedia(mediaUrl)
    setFullscreenIndex(index)
    document.body.style.overflow = 'hidden'
    
    // Scroll vers la bonne position après ouverture
    setTimeout(() => {
      const carousel = document.querySelector('.fullscreen-carousel')
      if (carousel) {
        carousel.scrollLeft = index * carousel.clientWidth
      }
    }, 100)
  }, [fullscreenMedia])

  const closeFullscreen = useCallback(() => {
    setFullscreenMedia(null)
    setShowReactions(false) // Fermer les réactions aussi
    document.body.style.overflow = 'auto'
  }, [])

  // Calcul de allMedia ici pour éviter les problèmes de dépendances
  const allMedia = [profile.media, ...(isGalleryUnlocked ? profile.gallery : profile.blurredGallery)]

  // Navigation sécurisée avec vérifications
  const navigateFullscreen = useCallback((direction: 'up' | 'down') => {
    if (!fullscreenMedia) return
    
    const currentIndex = fullscreenIndex
    let newIndex = currentIndex
    
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1
    } else if (direction === 'down' && currentIndex < allMedia.length - 1) {
      newIndex = currentIndex + 1
    }
    
    // Seulement changer si l'index est différent
    if (newIndex !== currentIndex && allMedia[newIndex]) {
      setFullscreenIndex(newIndex)
      setFullscreenMedia(allMedia[newIndex])
    }
  }, [fullscreenMedia, fullscreenIndex, allMedia])

  // === FONCTIONS D'INTERACTION MÉDIAS ===
  const handleMediaReaction = useCallback((mediaUrl: string) => {
    // Créer un ID unique basé sur l'URL du media
    const mediaId = `photo-${profile.id}-${mediaUrl.split('/').pop()?.split('?')[0] || 'main'}`
    // Réaction cœur unique
    setProfileReaction(mediaId, '❤️')
  }, [setProfileReaction, profile.id])

  const handleEmojiExplosion = useCallback((mediaUrl: string, reaction: string) => {
    setMediaReactions(prev => ({
      ...prev,
      [mediaUrl]: reaction
    }))
    // Auto-fermer les réactions après sélection
    setTimeout(() => setShowReactions(false), 100)
    
    // 🎉 EXPLOSION D'ÉMOJIS !
    const newExplosions = Array.from({ length: 8 }, (_, i) => ({
      emoji: reaction,
      id: Date.now() + i
    }))
    setExplosionEmojis(newExplosions)
    
    // Nettoyer l'explosion après 2 secondes
    setTimeout(() => {
      setExplosionEmojis([])
    }, 2000)
    
    // Auto-hide réaction après 3 secondes
    setTimeout(() => {
      setMediaReactions(prev => {
        const newReactions = { ...prev }
        delete newReactions[mediaUrl]
        return newReactions
      })
    }, 3000)
  }, [])

  const handleShare = useCallback((mediaUrl: string) => {
    if (navigator.share) {
      navigator.share({
        title: `Photo de ${profile.stageName}`,
        url: mediaUrl
      }).catch(() => {
        // Fallback si le partage échoue
        navigator.clipboard?.writeText(mediaUrl)
      })
    } else {
      // Fallback pour les navigateurs sans support
      navigator.clipboard?.writeText(mediaUrl)
    }
  }, [profile.stageName])

  // Cleanup au démontage du composant
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  // Navigation fullscreen - EXACTEMENT comme l'accueil
  const handleFullscreenScroll = useCallback((direction: 'up' | 'down') => {
    if (direction === 'down') {
      if (fullscreenIndex < allMedia.length - 1) {
        const newIndex = fullscreenIndex + 1
        setFullscreenIndex(newIndex)
        setFullscreenMedia(allMedia[newIndex])
      } else {
        setFullscreenIndex(0) // Retour au début
        setFullscreenMedia(allMedia[0])
      }
    } else {
      if (fullscreenIndex > 0) {
        const newIndex = fullscreenIndex - 1
        setFullscreenIndex(newIndex)
        setFullscreenMedia(allMedia[newIndex])
      } else {
        const lastIndex = allMedia.length - 1
        setFullscreenIndex(lastIndex) // Aller à la fin
        setFullscreenMedia(allMedia[lastIndex])
      }
    }
  }, [fullscreenIndex, allMedia])

  // Handle wheel scroll - COPIE DE L'ACCUEIL
  useEffect(() => {
    if (!fullscreenMedia) return
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.deltaY > 0) {
        handleFullscreenScroll('down')
      } else {
        handleFullscreenScroll('up')
      }
    }

    const container = fullscreenRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [fullscreenMedia, handleFullscreenScroll])

  // Handle keyboard navigation - COPIE DE L'ACCUEIL
  useEffect(() => {
    if (!fullscreenMedia) return
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        handleFullscreenScroll('down')
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleFullscreenScroll('up')
      } else if (e.key === 'Escape') {
        closeFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [fullscreenMedia, handleFullscreenScroll, closeFullscreen])
  // Générer mixedContent depuis les vraies données du profil
  const mixedContent = useMemo(() => {
    console.log('🎯 Génération mixedContent depuis profile.gallery:', profile.gallery)
    
    if (!profile.gallery || profile.gallery.length === 0) {
      console.log('⚠️ Aucune gallery trouvée, utilisation données vides')
      return []
    }
    
    const result = profile.gallery.map((media, index) => {
      // 🔧 NOUVELLE DÉTECTION : Utiliser le paramètre ?type= dans l'URL
      const isVideo = media.includes('?type=video') || media.includes('.mp4') || media.includes('.mov')
      const type = isVideo ? 'video' : 'photo'
      
      // Nettoyer l'URL pour l'affichage (enlever le paramètre type)
      const cleanUrl = media.split('?type=')[0]
      
      console.log(`🎥 Média ${index}: ${media} -> Type: ${type} (URL nettoyée: ${cleanUrl})`)
      
      return {
        type,
        url: cleanUrl,
        isPrivate: false, // Tous les médias sont publics par défaut
        likes: Math.floor(Math.random() * 300) + 50,
        comments: Math.floor(Math.random() * 50) + 5
      }
    })
    
    const videoCount = result.filter(m => m.type === 'video').length
    console.log(`📊 Total médias: ${result.length}, dont ${videoCount} vidéos`)
    
    return result
  }, [profile.gallery])

  console.log('🎯 mixedContent généré:', mixedContent)
  
  const currentMedia = allMedia[currentMediaIndex]
  const isCurrentVideo = currentMedia?.includes('.mp4') || currentMedia?.includes('.mov')

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header style TikTok */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => {
              try { (window as any)?.umami?.track?.('nav_back', { from: 'profile' }) } catch {}
              router.back()
            }}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
            title="Retour à la recherche"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>

          <div className="text-center">
            <h1 className="text-lg font-bold">{profile.stageName}</h1>
          </div>

          <button
            onClick={handleFavoriteToggle}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Star 
              size={24} 
              className={`transition-colors ${isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-white'}`}
            />
          </button>
        </div>
      </div>

      <div>
        {/* Header profil style TikTok */}
        {/* Clear space for fixed header (72px) + safe area (iOS notch) */}
        <div className="px-4 pb-6" style={{ paddingTop: 'calc(72px + env(safe-area-inset-top, 0px))' }}>
          <div className="flex items-start gap-4 mb-4">
            {/* Photo de profil ronde */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 p-0.5">
                <img
                  src={profile.media}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover border-2 border-black"
                  onClick={handleMediaTap}
                />
              </div>
              {profile.online && (
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
              )}
            </div>

            {/* Stats et actions */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-6">
                  <div 
                    className="text-center cursor-pointer"
                    onClick={() => setShowReactionDetails(true)}
                  >
                    <div className="text-lg font-bold">{getTotalReactions(profile.id)}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      {Object.keys(reactions).slice(0, 3).map(emoji => (
                        <span key={emoji}>{emoji}</span>
                      ))}
                      <span>Réactions</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{profile.reviews}</div>
                    <div className="text-xs text-gray-400">Avis</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setShowDetailModal(true)}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg font-medium text-sm transition-all hover:from-slate-700 hover:to-slate-800 active:scale-95 shadow-sm border border-slate-500/20"
                >
                  Voir plus
                </button>
                
                {/* Bouton Cadeau */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowGiftModal(true)}
                  className="px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium text-sm transition-all hover:from-pink-600 hover:to-purple-600 active:scale-95 shadow-md flex items-center gap-1"
                >
                  <Diamond size={14} />
                </motion.button>
                
                <button 
                  onClick={async () => {
                    console.log('Bouton Message cliqué - ouverture messagerie ciblée')
                    try {
                      let to = (profile as any).userId as string | undefined
                      if (!to) {
                        try {
                          const r = await fetch(`/api/escort/profile/${encodeURIComponent(profile.id)}`, { cache: 'no-store' })
                          if (r.ok) {
                            const data = await r.json()
                            to = data?.userId || (data?.user && data.user.id) || undefined
                          }
                        } catch {}
                      }
                      if (to) {
                        router.push(`/messages?to=${encodeURIComponent(to)}`)
                      } else {
                        router.push('/messages')
                      }
                    } catch {
                      router.push('/messages')
                    }
                  }}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium text-sm transition-all hover:from-blue-600 hover:to-cyan-600 active:scale-95 shadow-md"
                >
                  Message
                </button>
                {/* Bouton Contact avec dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowContactDropdown(!showContactDropdown)}
                    className="p-2 rounded-lg bg-white/10 text-gray-300 border border-white/20 transition-all hover:bg-white/15 active:scale-95 flex items-center gap-1"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${showContactDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown menu */}
                  {showContactDropdown && (
                    <div className="absolute top-full mt-2 right-0 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl z-50 min-w-[160px]">
                      <div className="py-2">
                        {extendedProfileData.contact.availableForCalls && (
                          <button
                            onClick={() => {
                              if (navigator.vibrate) {
                                navigator.vibrate([30]);
                              }
                              window.open(`tel:${extendedProfileData.contact.phone}`);
                              setShowContactDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                            </svg>
                            Appeler
                          </button>
                        )}
                        
                        {extendedProfileData.contact.availableForWhatsApp && (
                          <button
                            onClick={() => {
                              if (navigator.vibrate) {
                                navigator.vibrate([30]);
                              }
                              const whatsappNumber = extendedProfileData.contact.whatsapp.replace(/\+|\s/g, '');
                              const message = `Salut ${profile.stageName} ! Je souhaite vous contacter via FELORA.`;
                              window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`);
                              setShowContactDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.891 3.426"/>
                            </svg>
                            WhatsApp
                          </button>
                        )}
                        
                        {extendedProfileData.contact.availableForSMS && (
                          <button
                            onClick={() => {
                              if (navigator.vibrate) {
                                navigator.vibrate([30]);
                              }
                              const smsMessage = `Bonjour ${profile.stageName}, je vous contacte depuis FELORA.`;
                              const smsUrl = /iPhone|iPad|iPod|iOS/i.test(navigator.userAgent) 
                                ? `sms:${extendedProfileData.contact.phone}&body=${encodeURIComponent(smsMessage)}`
                                : `sms:${extendedProfileData.contact.phone}?body=${encodeURIComponent(smsMessage)}`;
                              window.open(smsUrl);
                              setShowContactDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            SMS
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Infos complètes */}
          <div className="space-y-3">
            <div>
              <h2 className="font-semibold text-lg mb-1 flex items-center gap-2">
                {profile.name}
                {profile.verified && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center bg-[#111827] border border-white/20 text-[#4FD1C7]"
                    title="Profil vérifié"
                  >
                    <BadgeCheck className="w-3.5 h-3.5" />
                  </div>
                )}
                {profile.premium && (
                  <div className="w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Crown size={12} className="text-white" />
                  </div>
                )}
              </h2>
              {/* Description avec système expandable */}
              <div className="mb-2">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {showFullDescription 
                    ? profile.description 
                    : profile.description.length > 200 
                      ? `${profile.description.substring(0, 200)}...`
                      : profile.description
                  }
                </p>
                {profile.description.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-pink-400 text-xs font-medium mt-1 hover:text-pink-300 transition-colors"
                  >
                    {showFullDescription ? 'Voir moins' : 'Voir plus'}
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{profile.location}</span>
                </div>
                <span>•</span>
                <span>{profile.age || 'N/A'} ans</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>{profile.rating} ({profile.reviews})</span>
                </div>
                {profile.online && (
                  <>
                    <span>•</span>
                    <span className="text-green-400">En ligne</span>
                  </>
                )}
              </div>
            </div>


            {/* Disponibilité aujourd'hui */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${profile.online ? 'bg-green-500' : 'bg-red-500'}`} />
                <h4 className="font-semibold text-sm">
                  {profile.online ? 'Disponible maintenant' : 'Indisponible'} - {extendedProfileData.location.city}
                </h4>
              </div>
              
              {profile.online && (
                <div className="flex gap-2 flex-wrap mb-2 items-center">
                  <div className="px-3 py-1.5 bg-green-500/20 rounded-lg text-xs font-medium border border-green-500/40 text-green-300">
                    10h-21h
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-400">
                {extendedProfileData.location.district} • 
                {extendedProfileData.location.incall && extendedProfileData.location.outcall 
                  ? 'Se déplace et reçoit' 
                  : extendedProfileData.location.incall 
                    ? 'Reçoit uniquement'
                    : extendedProfileData.location.outcall
                      ? 'Se déplace uniquement'
                      : 'Modalités à définir'
                }
              </div>
            </div>

            {/* Tags services */}
            <div className="flex flex-wrap gap-1.5">
              {profile.services.slice(0, 6).map((service, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/10 rounded-lg text-xs border border-white/10"
                >
                  {service}
                </span>
              ))}
            </div>

          </div>
        </div>

        {/* Onglets style TikTok */}
        <div className="border-t border-white/10">
          <div className="flex px-4">
            {[
              { id: 'posts', label: 'Posts', count: mixedContent.length },
              { id: 'private', label: 'Privé', count: mixedContent.filter(c => c.isPrivate).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-center transition-all ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-white text-white' 
                    : 'text-gray-400'
                }`}
              >
                <span className="text-sm font-medium">{tab.label}</span>
                <span className="ml-1 text-xs">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Galerie redesignée avec bordures */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-2 mt-2 p-2">
            {mixedContent.map((content, index) => {
              const contentId = `content-${index}`
              const isUnlocked = !content.isPrivate || unlockedContent.includes(contentId)
              
              return (
                <div 
                  key={index}
                  className="aspect-square relative bg-gray-900 cursor-pointer rounded-xl overflow-hidden border border-gray-600/30 hover:border-pink-400/50 transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => {
                    if (content.isPrivate && !isUnlocked) {
                      handleUnlockContent(contentId)
                    } else {
                      // Trouver l'index exact dans allMedia
                      const mediaIndexInAll = allMedia.findIndex(url => url === content.url)
                      openFullscreen(content.url, mediaIndexInAll)
                    }
                  }}
                >
                  {content.type === 'video' ? (
                    <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
                      {/* Thumbnail généré depuis la vidéo */}
                      <video
                        src={content.url}
                        className={`w-full h-full object-cover transition-all duration-300 ${
                          !isUnlocked ? 'blur-xl brightness-30' : 'hover:brightness-110'
                        }`}
                        muted
                        playsInline
                        preload="metadata"
                      />
                      {/* Overlay Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/20">
                          <Play size={24} className="text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={content.url}
                      alt={`${content.type} ${index + 1}`}
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        !isUnlocked ? 'blur-xl brightness-30' : 'hover:brightness-110'
                      }`}
                    />
                  )}
                  
                  {/* Indicateur type avec nouveau design */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {content.type === 'video' && isUnlocked && (
                      <div className="w-7 h-7 bg-black/70 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <Play size={14} className="text-white ml-0.5" />
                      </div>
                    )}
                  </div>

                  {/* Badge VIP pour contenu privé débloqué */}
                  {content.isPrivate && isUnlocked && (
                    <div className="absolute top-2 left-2">
                      <div className="px-2 py-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-md text-[10px] font-bold text-white shadow-md">
                        VIP
                      </div>
                    </div>
                  )}

                  {/* Overlay contenu privé discret */}
                  {content.isPrivate && !isUnlocked && (
                    <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/40 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                        <Crown size={16} className="text-gray-800" />
                      </div>
                    </div>
                  )}

                  {/* Réactions avec cœur unique */}
                  {isUnlocked && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Bouton Réactions séparé */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              const mediaIndexInAll = allMedia.findIndex(url => url === content.url)
                              openFullscreen(content.url, mediaIndexInAll)
                            }}
                            className="flex items-center gap-1.5 hover:scale-110 transition-transform"
                          >
                            <Smile 
                              size={14} 
                              className="text-yellow-400"
                            />
                            <span className="text-xs text-white font-semibold">
                              {(() => {
                                const mediaId = `photo-${profile.id}-${content.url.split('/').pop()?.split('?')[0] || index}`
                                const reactions = getProfileReactions(mediaId)
                                const totalReactions = Object.values(reactions).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0)
                                return totalReactions
                              })()}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'private' && (
          <div className="p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/20 p-6 relative"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Crown size={24} className="text-pink-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Contenu Premium</h3>
                <p className="text-white/70 text-sm">
                  {mixedContent.filter(c => c.isPrivate).length} médias exclusifs vous attendent
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-white/80 text-sm">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                  Contenu exclusif haute qualité
                </div>
                <div className="flex items-center gap-3 text-white/80 text-sm">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                  Accès illimité 24h/24
                </div>
                <div className="flex items-center gap-3 text-white/80 text-sm">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                  Résiliation à tout moment
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/subscription?plan=premium')}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-white font-semibold transition-all duration-200"
              >
                Débloquer pour 29 CHF/mois
              </motion.button>
              
              <div className="mt-3 text-center text-white/60 text-xs">
                Paiement sécurisé • Facturation mensuelle
              </div>
            </motion.div>
          </div>
        )}

      </div>


      {/* Animations */}
      <AnimatePresence>
        {doubleTapAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="text-6xl">❤️</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeReaction && (
          <motion.div
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -100, opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl pointer-events-none z-50"
          >
            {activeReaction}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 z-50"
          >
            <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <div className="flex justify-center gap-4">
                {['❤️', '😍', '🔥', '👍', '😊', '😮', '🥵', '💋'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleTelegramReaction(emoji)}
                    className={`text-3xl hover:scale-110 transition-transform active:scale-95 ${
                      userReaction === emoji ? 'bg-white/20 rounded-lg p-1' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal détail des réactions - Style Telegram */}
      <AnimatePresence>
        {showReactionDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReactionDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Réactions</h3>
                <button
                  onClick={() => setShowReactionDetails(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                {Object.entries(reactions)
                  .sort(([,a], [,b]) => b - a) // Trier par nombre décroissant
                  .map(([emoji, count]) => (
                    <div key={emoji} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                      {userReaction === emoji && (
                        <span className="text-xs text-blue-400 bg-blue-400/20 px-2 py-1 rounded-full">
                          Vous
                        </span>
                      )}
                    </div>
                  ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-center text-sm text-white/60">
                  {getTotalReactions(profile.id)} réaction{getTotalReactions(profile.id) > 1 ? 's' : ''} au total
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Voir plus - Design moderne 2025 */}
      {showDetailModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'rgba(13, 13, 13, 0.95)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '42rem',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.6)'
          }}>
            {/* Header épuré */}
            <div style={{
              background: 'transparent',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '24px 28px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '3px',
                  height: '20px',
                  background: 'linear-gradient(135deg, #FF6B9D 0%, #4FD1C7 100%)',
                  borderRadius: '2px'
                }}></div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.5px'
                }}>
                  Profil détaillé
                </h2>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)'
                  e.currentTarget.style.color = '#ffffff'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Contenu moderne avec meilleur spacing */}
            <div style={{
              padding: '0 28px 28px',
              overflowY: 'auto',
              flex: 1
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Section Informations - Design moderne */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '2px',
                    height: '14px',
                    background: '#FF6B9D',
                    borderRadius: '1px'
                  }}></div>
                  Informations
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nom</span>
                    <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: '600' }}>{profile.name}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Âge</span>
                    <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: '600' }}>{profile.age || 'N/A'} ans</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Localisation</span>
                    <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: '600' }}>{extendedProfileData.location.city}, {extendedProfileData.location.district}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statut</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: profile.verified ? '#10B981' : 'rgba(255, 255, 255, 0.3)'
                      }}></div>
                      <span style={{ 
                        fontSize: '14px', 
                        color: profile.verified ? '#10B981' : 'rgba(255, 255, 255, 0.7)', 
                        fontWeight: '600' 
                      }}>
                        {profile.verified ? 'Vérifié' : 'Non vérifié'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Caractéristiques physiques */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 border-b border-white/10 pb-2">Apparence</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Taille :</span>
                    <span className="text-white ml-2 font-medium">{extendedProfileData.physicalDetails.height}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Poids :</span>
                    <span className="text-white ml-2 font-medium">{extendedProfileData.physicalDetails.weight}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Mensurations :</span>
                    <span className="text-white ml-2 font-medium">{extendedProfileData.physicalDetails.measurements}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Poitrine :</span>
                    <span className="text-white ml-2 font-medium">{extendedProfileData.physicalDetails.breastSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Silhouette :</span>
                    <span className="text-white ml-2 font-medium">{extendedProfileData.physicalDetails.bodyType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Teint :</span>
                    <span className="text-white ml-2 font-medium">{extendedProfileData.physicalDetails.skinTone}</span>
                  </div>
                </div>
              </div>

              {/* Langues */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 border-b border-white/10 pb-2">Langues</h3>
                <div className="flex flex-wrap gap-2">
                  {extendedProfileData.languages.map((lang, index) => {
                    // Niveau aléatoire entre 1 et 5 étoiles pour la démo
                    const level = Math.floor(Math.random() * 5) + 1
                    return (
                      <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center gap-2">
                        {lang}
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={`text-xs ${i < level ? 'text-yellow-400' : 'text-gray-500'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </span>
                    )
                  })}
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 border-b border-white/10 pb-2">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {extendedProfileData.practices.map((practice, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                      {practice}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tarifs - discret */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2 border-b border-white/5 pb-1">Tarifs</h3>
                <div className="space-y-2">
                  {extendedProfileData.rates.map((rate, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white/3 rounded-md">
                      <div>
                        <div className="text-sm font-medium text-gray-200">{rate.duration}</div>
                        <div className="text-xs text-gray-500">{rate.description}</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-300">{rate.price} CHF</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Moyens de paiement */}
              {profile.paymentMethods && profile.paymentMethods.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 border-b border-white/10 pb-2">Moyens de paiement</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.paymentMethods.map((method, index) => (
                      <span key={index} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Disponibilité */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 border-b border-white/10 pb-2">Disponibilité</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Cette semaine :</span>
                    <span className="text-white ml-2">{extendedProfileData.availability.thisWeek}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${profile.online ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-white">
                      {profile.online ? 'Disponible maintenant' : 'Indisponible actuellement'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Modalités :</span>
                    <span className="text-white ml-2">
                      {extendedProfileData.location.incall && extendedProfileData.location.outcall 
                        ? 'Se déplace et reçoit' 
                        : extendedProfileData.location.incall 
                          ? 'Reçoit uniquement'
                          : 'Se déplace uniquement'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 border-b border-white/10 pb-2">Statistiques</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Note :</span>
                    <span className="text-yellow-400 ml-2 font-medium">{profile.rating}/5</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Avis :</span>
                    <span className="text-white ml-2 font-medium">{profile.reviews} avis</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Taux de réponse :</span>
                    <span className="text-green-400 ml-2 font-medium">{profile.responseRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Temps de réponse :</span>
                    <span className="text-white ml-2 font-medium">{profile.responseTime}</span>
                  </div>
                </div>
              </div>

              
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL PLEIN ÉCRAN RESPONSIVE === */}
      <AnimatePresence>
        {fullscreenMedia && (
          <motion.div
            ref={fullscreenRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
            style={{ touchAction: 'manipulation' }}
          >
            {/* Interface overlay responsive */}
            <div className="absolute inset-0 z-10">
              {/* Header avec bouton retour et actions */}
              <div className="absolute top-0 left-0 right-0 p-3 sm:p-6 bg-gradient-to-b from-black/80 to-transparent safe-area-inset-top">
                <div className="flex items-center justify-between">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={closeFullscreen}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                  >
                    <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
                  </motion.button>
                  
                  {/* Indicateur position */}
                  <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium">
                    {fullscreenIndex + 1} / {allMedia.length}
                  </div>
                  
                  {/* Partage */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleShare(fullscreenMedia)}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                  >
                    <Share size={20} className="sm:w-6 sm:h-6" />
                  </motion.button>
                </div>
              </div>


              {/* Actions sociales - Style TikTok */}
              <div className="absolute right-3 sm:right-6 bottom-20 sm:bottom-32 flex flex-col gap-4 safe-area-inset-bottom">
                {/* Réactions uniquement */}
                <motion.div className="flex flex-col items-center">
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setShowReactions(!showReactions)}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                  >
                    <Smile size={24} className="sm:w-7 sm:h-7" />
                  </motion.button>
                  <span className="text-white text-xs sm:text-sm mt-1 font-medium">
                    {(() => {
                      const mediaId = `photo-${profile.id}-${fullscreenMedia?.split('/').pop()?.split('?')[0] || 'main'}`
                      const reactions = getProfileReactions(mediaId)
                      // Compter TOUTES les réactions (comme les likes)
                      const totalReactions = Object.values(reactions).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0)
                      return totalReactions
                    })()}
                  </span>
                </motion.div>
                <div className="relative">
                  {/* Overlay pour fermer en cliquant à l'extérieur */}
                  <AnimatePresence>
                    {showReactions && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowReactions(false)}
                        className="fixed inset-0 z-40"
                      />
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {showReactions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="absolute bottom-full right-0 mb-3 bg-black/20 backdrop-blur-lg rounded-full px-2 sm:px-3 py-1.5 sm:py-2 border border-white/5 z-50"
                      >
                        <div className="flex gap-1.5 sm:gap-2">
                          {['❤️', '😍', '🔥', '🥵', '😈', '💋', '🤤', '😘', '🫦', '🔞'].map((emoji) => (
                            <motion.button
                              key={emoji}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                const mediaId = `photo-${profile.id}-${fullscreenMedia?.split('/').pop()?.split('?')[0] || 'main'}`
                                setProfileReaction(mediaId, emoji)
                                handleEmojiExplosion(fullscreenMedia, emoji)
                                setShowReactions(false)
                              }}
                              className="text-lg sm:text-2xl hover:bg-white/10 rounded-full p-1 sm:p-2 transition-colors"
                            >
                              {emoji}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* Média actuel - EXACTEMENT comme l'accueil */}
            <div 
              ref={carouselRef}
              className="fullscreen-carousel w-full h-full bg-black relative"
              style={{ 
                maxWidth: '450px',
                maxHeight: '800px',
                borderRadius: 'clamp(0px, 2vw, 20px)',
                boxShadow: 'clamp(0px, 1vw, 20px) clamp(0px, 2vw, 30px) clamp(0px, 4vw, 60px) rgba(0, 0, 0, 0.8)'
              }}
            >
              {fullscreenMedia?.includes('.mp4') || fullscreenMedia?.includes('.mov') ? (
                <video
                  src={fullscreenMedia}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={fullscreenMedia}
                  alt={`Media ${fullscreenIndex + 1}`}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />
              )}
            </div>

            {/* Réaction principale avec animation stylée */}
            <AnimatePresence>
              {mediaReactions[fullscreenMedia] && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 50 }}
                  animate={{ 
                    scale: [0, 1.5, 1],
                    opacity: [0, 1, 0.8],
                    y: [50, -20, 0]
                  }}
                  exit={{ 
                    scale: 0, 
                    opacity: 0,
                    y: -100,
                    transition: { duration: 0.5 }
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                      filter: [
                        'drop-shadow(0 0 20px rgba(255, 107, 157, 0.8))',
                        'drop-shadow(0 0 40px rgba(255, 107, 157, 1))',
                        'drop-shadow(0 0 20px rgba(255, 107, 157, 0.8))'
                      ]
                    }}
                    transition={{ 
                      duration: 0.6, 
                      repeat: Infinity, 
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                    className="text-8xl sm:text-9xl"
                    style={{
                      textShadow: '0 0 30px rgba(255, 107, 157, 0.8), 0 0 60px rgba(255, 107, 157, 0.6)',
                    }}
                  >
                    {mediaReactions[fullscreenMedia]}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 🎉 EXPLOSION D'ÉMOJIS */}
            <AnimatePresence>
              {explosionEmojis.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ 
                    scale: 0,
                    opacity: 1,
                    x: 0,
                    y: 0,
                    rotate: 0
                  }}
                  animate={{ 
                    scale: [0, 1.5, 0.8],
                    opacity: [1, 0.8, 0],
                    x: [0, (Math.random() - 0.5) * 400],
                    y: [0, (Math.random() - 0.5) * 400],
                    rotate: [0, (Math.random() - 0.5) * 720]
                  }}
                  exit={{ 
                    scale: 0,
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 2,
                    ease: "easeOut",
                    delay: index * 0.1
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-4xl sm:text-5xl"
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))',
                    zIndex: 40 + index
                  }}
                >
                  {item.emoji}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Indicateurs de position pour mobile */}
            <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 safe-area-inset-bottom">
              {allMedia.map((_, index) => (
                <motion.div
                  key={index}
                  animate={{
                    scale: index === fullscreenIndex ? 1.2 : 1,
                    opacity: index === fullscreenIndex ? 1 : 0.5
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === fullscreenIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cadeaux: Picker + Toast */}
      <GiftPicker
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        fromUserId={(session as any)?.user?.id || ''}
        toUserId={profile.id}
        onGiftSent={(gift) => {
          setLastReceivedGift({ ...gift, senderName: 'Vous' })
          setShowGiftToast(true)
        }}
      />
      {lastReceivedGift && (
        <GiftToast
          gift={lastReceivedGift}
          isVisible={showGiftToast}
          onComplete={() => setShowGiftToast(false)}
        />
      )}
    </div>
  )
}
