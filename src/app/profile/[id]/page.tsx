'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Star, BadgeCheck, CheckCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useProfileViewTracker } from '@/hooks/useViewTracker'
import { stableMediaId } from '@/lib/reactions/stableMediaId'
import ProfileHeader from '../../../../packages/ui/profile-test/ProfileHeader'
import ActionsBar from '../../../../packages/ui/profile-test/ActionsBar'
import { GiftPicker } from '@/components/gifts/GiftPicker'
import { GiftToast } from '@/components/gifts/GiftToast'
import { ProfileClientUnified } from '@/components/ProfileClientUnified'
import MediaFeedWithGallery from '../../../../packages/ui/profile-test/MediaFeedWithGallery'
import { AboutSection, RatesSection, AvailabilitySection, PhysicalDetailsSection } from '../../../../packages/ui/profile-test/Sections'
import { CommentsSection } from '../../../components/comments/CommentsSection'
import { AvailabilityStatus as AvailabilityStatusType, ScheduleData } from '@/lib/availability-calculator'
import { updateMediaWithErrorHandling, deleteMediaWithErrorHandling } from '@/lib/mediaManagement'
import { validateMediaUrl } from '@/lib/media/enhanced-cdn'
import { addFavoriteId, removeFavoriteId, readFavoriteIds } from '@/lib/favorites'

interface EscortProfile {
  id: string
  userId?: string // AJOUT: userId du propriétaire du profil (pour isOwner check)
  name: string
  handle?: string
  stageName?: string
  avatar?: string
  city?: string
  age?: number
  languages: string[]
  services: string[]
  media: Array<{
    type: 'image' | 'video'
    url: string
    thumb?: string
    poster?: string
    isPrivate?: boolean
    price?: number
    pos?: number
  }>
  verified?: boolean
  premium?: boolean
  online?: boolean
  description?: string
  stats?: {
    likes?: number
    reactions?: number
    followers?: number
    views?: number
  }
  rates?: {
    hour?: number
    twoHours?: number
    halfDay?: number
    fullDay?: number
    overnight?: number
  }
  availability?: {
    incall?: boolean
    outcall?: boolean
    available?: boolean
    availableUntil?: string
    nextAvailable?: string
    schedule?: string
  }
  physical?: {
    height?: number
    bodyType?: string
    hairColor?: string
    eyeColor?: string
    ethnicity?: string
    bustSize?: string
    tattoos?: boolean | string
    piercings?: boolean | string
  }
  practices?: string[]
  workingArea?: string
  category?: string
  serviceType?: string
  experience?: string
  style?: string
  profile?: string
  specialties?: string[]
  additionalLanguages?: string[]
  realTimeAvailability?: AvailabilityStatusType
  scheduleData?: ScheduleData | null
  clientele?: {
    acceptsCouples?: boolean
    acceptsWomen?: boolean
    acceptsSeniors?: boolean
    acceptsHandicapped?: boolean
  }
  // Contact intelligent
  contact?: {
    phoneVisibility: string
    phoneDisplayType: string
    phone?: string
  }
}

// Loading skeleton - Amélioré avec grille de médias
const ProfileSkeleton = React.memo(function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 animate-pulse">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header skeleton */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-48 h-48 bg-gray-700 rounded-3xl"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-700 rounded w-48 mb-3"></div>
              <div className="h-4 bg-gray-700 rounded w-32 mb-4"></div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="h-6 bg-gray-700 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 bg-gray-700 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 bg-gray-700 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions bar skeleton */}
        <div className="glass-card p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-gray-700 rounded-lg"></div>
            <div className="flex-1 h-10 bg-gray-700 rounded-lg"></div>
            <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
            <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
          </div>
        </div>

        {/* Media grid skeleton */}
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  )
})

// Error fallback
const ErrorFallback = React.memo(function ErrorFallback({ onRetry }: { onRetry?: () => void }) {
  const router = useRouter()
  const t = useTranslations('profile')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="glass-card p-8 text-center max-w-md mx-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('error.title')}</h1>
        <p className="text-gray-400 mb-6">{t('error.description')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onRetry ? onRetry() : router.back()}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {t('error.retry')}
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            {t('error.goHome')}
          </button>
        </div>
      </div>
    </div>
  )
})

export default function EscortProfilePage() {
  const t = useTranslations('profile')
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<EscortProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  const [showKycSuccess, setShowKycSuccess] = useState(false)
  const router = useRouter()

  // Resolve params
  const routeParams = useParams() as Record<string, string | string[]>
  const [resolvedId, setResolvedId] = useState<string>('')

  // Détecter le paramètre kycSuccess dans l'URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('kycSuccess') === '1') {
        setShowKycSuccess(true)
        // Nettoyer l'URL après 500ms
        setTimeout(() => {
          const url = new URL(window.location.href)
          url.searchParams.delete('kycSuccess')
          window.history.replaceState({}, '', url)
        }, 500)
      }
    }
  }, [])

  // Fonction pour refetch manuellement
  const handleRetry = useCallback(() => {
    setRefetchTrigger(prev => prev + 1)
  }, [])

  useEffect(() => {
    const raw = routeParams?.id as unknown
    const id = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : ''
    setResolvedId(id)
  }, [routeParams])

  // Fetch profile data
  useEffect(() => {
    if (!resolvedId) return

    let isCancelled = false
    const controller = new AbortController()

    async function fetchProfile() {
      try {
        setLoading(true)
        setError(false)
        setNotFound(false)

        const response = await fetch(`/api/public/profile/${resolvedId}`, { signal: controller.signal })

        if (isCancelled) return

        if (response.status === 404) {
          setNotFound(true)
          return
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        console.log('🔍 [Profile Page] Raw API data.media:', data.media?.slice(0, 3))

        const normalizedMedia = Array.isArray(data.media)
          ? data.media.map((item: any, idx: number) => {
              const normalized = {
                ...item,
                visibility: typeof item?.visibility === 'string' ? item.visibility.toUpperCase() : 'PUBLIC',
                isPrivate: Boolean(item?.isPrivate || (typeof item?.visibility === 'string' && item.visibility.toUpperCase() === 'PRIVATE')),
                price: typeof item?.price === 'number'
                  ? item.price
                  : typeof item?.price === 'string' && item.price.trim() !== ''
                    ? Number(item.price)
                    : undefined
              }

              if (idx < 3) {
                console.log(`🔍 [Profile Page] Normalized media ${idx}:`, {
                  type: normalized.type,
                  hasThumb: !!normalized.thumb,
                  thumb: normalized.thumb?.substring(0, 80),
                  url: normalized.url?.substring(0, 80),
                  pos: normalized.pos
                })
              }

              return normalized
            })
          : []

        console.log('🔍 [Profile Page] Total normalized media:', normalizedMedia.length)

        // Déterminer l'avatar : priorité à profilePhoto, sinon premier média
        const avatar = data.profilePhoto 
          ? validateMediaUrl(data.profilePhoto, 'avatar')
          : (normalizedMedia?.[0]?.url ? validateMediaUrl(normalizedMedia[0].url, 'avatar') : undefined)

        // Transform API data to match EscortProfile interface
        // Fetch contact data from session if available
        let contactData = undefined
        try {
          const contactResponse = await fetch(`/api/profile/unified/${resolvedId}`, {
            signal: controller.signal,
            credentials: 'include'
          })

          if (contactResponse.ok) {
            const contactResponseData = await contactResponse.json()
            if (contactResponseData.success && contactResponseData.profile?.contact) {
              const contact = contactResponseData.profile.contact
              // Transform 'none' to 'hidden' for compatibility
              if (contact.phoneVisibility === 'none') {
                contact.phoneVisibility = 'hidden'
              }
              contactData = contact
            }
          }
        } catch (contactErr) {
          // Non-blocking error - continue without contact functionality
        }

        const transformedProfile: EscortProfile = {
          id: data.id,
          userId: data.userId, // AJOUT: userId pour isOwner check
          name: data.stageName || 'Escort',
          stageName: data.stageName,
          avatar: avatar,
          city: data.city,
          age: data.age || undefined,
          category: data.category,
          languages: data.languages || [],
          services: data.services || [],
          media: normalizedMedia,
          verified: data.isVerifiedBadge,
          premium: false,
          online: false,
          description: data.bio,
          stats: data.stats || { likes: 0, views: 0, followers: 0 },
          rates: {
            hour: data.rates?.rate1H,
            twoHours: data.rates?.rate2H,
            halfDay: data.rates?.rateHalfDay,
            fullDay: data.rates?.rateFullDay,
            overnight: data.rates?.overnight
          },
          availability: {
            available: true,
            incall: true,
            outcall: true
          },
          // Nouvelles données physiques de l'API
          physical: data.physical || undefined,
          // Disponibilité temps réel de l'API
          realTimeAvailability: data.realTimeAvailability,
          scheduleData: data.scheduleData,
          // Contact intelligent - fetch immédiat
          contact: contactData
        }
        setProfile(transformedProfile)

      } catch (err) {
        if ((err as any)?.name === 'AbortError') return
        if (isCancelled) return
        setError(true)
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      isCancelled = true
      controller.abort()
    }
  }, [resolvedId, refetchTrigger])

  // Action handlers with localStorage persistence
  const handleFollow = useCallback(async (profileId: string) => {
    const key = `follow_${profileId}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())

    toast.success(currentState ? t('actions.unfollowed') : t('actions.followed'))

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
  }, [t])

  const handleLike = useCallback(async (profileId: string) => {
    const key = `like_${profileId}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())

    if (!currentState) {
      toast.success(t('actions.addedToFavorites'))
    }

    await new Promise(resolve => setTimeout(resolve, 300))
  }, [t])

  const handleSave = useCallback(async (profileId: string) => {
    const key = `save_${profileId}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())

    toast.success(currentState ? t('actions.removedFromSaved') : t('actions.saved'))

    await new Promise(resolve => setTimeout(resolve, 300))
  }, [t])

  const handleMediaLike = useCallback(async (index: number) => {
    const key = `media_like_${resolvedId}_${index}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())

    await new Promise(resolve => setTimeout(resolve, 200))
  }, [resolvedId])

  const handleMediaSave = useCallback(async (index: number) => {
    const key = `media_save_${resolvedId}_${index}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())

    await new Promise(resolve => setTimeout(resolve, 200))
  }, [resolvedId])

  const handleMessage = useCallback((profileId: string) => {
    try {
      router.push(`/messages?to=${encodeURIComponent(profileId)}`)
    } catch {
      router.push('/messages')
    }
  }, [router])

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: profile?.name || t('common.profile'),
        text: t('actions.shareText', { name: profile?.name }),
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success(t('actions.linkCopied'))
    }
  }, [profile?.name, t])

  const handleReport = useCallback((profileId: string) => {
    router.push(`/report?type=profile&id=${profileId}`)
  }, [router])

  // Get localStorage states
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [totalReactions, setTotalReactions] = useState(0)
  const [showGiftPicker, setShowGiftPicker] = useState(false)
  const [showGiftToast, setShowGiftToast] = useState(false)
  const [lastReceivedGift, setLastReceivedGift] = useState<any>(null)

  // Tracking des vues de profil
  try { useProfileViewTracker({ profileId: resolvedId, profileType: 'escort', enabled: true }) } catch {}

  // Permissions utilisateur
  const [userPermissions] = useState({
    isAdmin: false,
    isProfileOwner: false,
    username: 'Client'
  })

  // Vérifier si l'utilisateur connecté est le propriétaire du profil
  const isOwner = useMemo(() => {
    if (!session?.user?.id || !profile?.id) return false

    // Comparer avec profile.id et aussi avec profile.userId si disponible
    const matchesProfileId = session.user.id === profile.id
    const matchesUserId = session.user.id === (profile as any)?.userId

    return matchesProfileId || matchesUserId
  }, [session?.user?.id, profile?.id, (profile as any)?.userId])

  const handleShowDetails = useCallback(() => {
    setShowDetailModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false)
  }, [])

  // Gérer le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (showDetailModal) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }

    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [showDetailModal])

  useEffect(() => {
    if (!resolvedId) return

    setIsFollowing(localStorage.getItem(`follow_${resolvedId}`) === 'true')
    setIsLiked(localStorage.getItem(`like_${resolvedId}`) === 'true')
    setIsSaved(localStorage.getItem(`save_${resolvedId}`) === 'true')
  }, [resolvedId])

  // Charger l'état des favoris au démarrage
  useEffect(() => {
    if (!profile) return
    setIsFavorite(readFavoriteIds().includes(profile.id))
  }, [profile?.id, profile])

  // Calculer le total des réactions des médias du feed uniquement (pas la photo de profil)
  const calculateTotalReactions = useCallback(async () => {
    if (!profile?.media || profile.media.length <= 1) {
      setTotalReactions(0)
      return
    }

    try {
      // Utiliser l'API profil pour obtenir le total correct (inclut ancien + nouveau système)
      const res = await fetch(`/api/public/profile/${profile.id}`)
      const data = await res.json()
      if (data?.stats) {
        const total = (data.stats.likes || 0) + (data.stats.reactions || 0)
        setTotalReactions(total)
      } else {
        setTotalReactions(0)
      }
    } catch (error) {
      setTotalReactions(0)
    }
  }, [profile?.media, profile?.id])

  // Calculer le total au chargement du profil uniquement
  useEffect(() => {
    calculateTotalReactions()
  }, [calculateTotalReactions])

  // Fonction pour forcer le recalcul des réactions (appelée après chaque réaction)
  const reactionChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const handleReactionChange = useCallback(async () => {
    // Annuler le timeout précédent s'il existe
    if (reactionChangeTimeoutRef.current) {
      clearTimeout(reactionChangeTimeoutRef.current)
    }
    
    // Programmer le recalcul avec un délai pour éviter les appels multiples
    reactionChangeTimeoutRef.current = setTimeout(async () => {
      await calculateTotalReactions()
      reactionChangeTimeoutRef.current = null
    }, 500) // Délai de 500ms pour éviter les appels multiples
  }, [calculateTotalReactions])

  // Umami tracking pour la vue profil
  useEffect(() => {
    if (!resolvedId) return
    try { (window as any)?.umami?.track?.('profile_view', { profileId: resolvedId }) } catch {}
  }, [resolvedId])

  const handleFavoriteToggle = useCallback(() => {
    if (!profile) return
    if (status === 'unauthenticated' || !session?.user?.id) {
      console.log('🔒 [FAVORITES] Utilisateur non connecté, affichage toast', { status, hasSession: !!session })
      toast.info(t('actions.loginToAddFavorites'), {
        duration: 4000,
      })
      return
    }

    if (isFavorite) {
      removeFavoriteId(profile.id)
      setIsFavorite(false)
      toast.success(t('actions.removedFromFavorites'))
    } else {
      addFavoriteId(profile.id)
      setIsFavorite(true)
      toast.success(t('actions.addedToFavorites'))
    }
  }, [isFavorite, profile, session, status, t])

  // Generate extended profile data from the real data
  const extendedProfileData = useMemo(() => {
    if (!profile) return null

    const rates = []
    if (profile.rates?.hour) rates.push({ duration: '1h', price: profile.rates.hour, description: 'Rencontre intime' })
    if (profile.rates?.twoHours) rates.push({ duration: '2h', price: profile.rates.twoHours, description: 'Moment prolongé' })
    if (profile.rates?.halfDay) rates.push({ duration: '4h', price: profile.rates.halfDay, description: 'Demi-journée' })
    if (profile.rates?.fullDay) rates.push({ duration: '8h', price: profile.rates.fullDay, description: 'Journée complète' })
    if (profile.rates?.overnight) rates.push({ duration: '24h', price: profile.rates.overnight, description: 'Week-end VIP' })

    return {
      languages: profile.languages || {},
      services: (profile.services || []).filter(service => service !== 'escorte'),
      practices: profile.practices || [],
      paymentMethods: ['Espèces', 'Virement', 'PayPal', 'Cartes de crédit'], // Méthodes de paiement standard pour la Suisse
      rates: {
        rate1H: profile.rates?.hour,
        rate2H: profile.rates?.twoHours,
        rateHalfDay: profile.rates?.halfDay,
        rateFullDay: profile.rates?.fullDay,
        overnight: profile.rates?.overnight,
        currency: 'CHF'
      },
      physicalDetails: {
        height: profile.physical?.height ? `${profile.physical.height}cm` : 'Non spécifié',
        bodyType: profile.physical?.bodyType || 'Non spécifié',
        hairColor: profile.physical?.hairColor || 'Non spécifié',
        eyeColor: profile.physical?.eyeColor || 'Non spécifié',
        ethnicity: profile.physical?.ethnicity || 'Non spécifié',
        bustSize: profile.physical?.bustSize || 'Non spécifié',
        tattoos: profile.physical?.tattoos === true ? 'Oui' : undefined,
        piercings: profile.physical?.piercings === true ? 'Oui' : undefined,
        smoker: undefined
      },
      clientele: profile.clientele || {},
      availability: profile.availability || {},
      workingArea: profile.workingArea || profile.city || 'Suisse'
    }
  }, [profile])

  // Render states
  if (loading) return <ProfileSkeleton />
  if (notFound) return <ErrorFallback onRetry={handleRetry} />
  if (error || !profile) return <ErrorFallback onRetry={handleRetry} />

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header style TikTok */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                try { (window as any)?.umami?.track?.('nav_back', { from: 'profile_real' }) } catch {}
                router.back()
              }}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
              title={t('header.back')}
              aria-label={t('header.backAriaLabel')}
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-lg font-bold">{profile.name}</h1>
          </div>

          {/* Placeholder to keep the title centered (align with left controls) */}
          <div className="w-10 h-10" />
        </div>
      </div>

      {/* Message de félicitations KYC */}
      {showKycSuccess && (
        <div className="fixed top-20 left-0 right-0 z-40 px-4 animate-in slide-in-from-top duration-500">
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-green-400" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-green-400 text-base sm:text-lg font-bold mb-1 sm:mb-2">{t('kyc.title')}</h3>
                  <p className="text-green-300 text-xs sm:text-sm mb-2">
                    {t('kyc.description')}
                  </p>
                  <div className="bg-green-500/10 rounded-lg p-2 sm:p-3">
                    <p className="text-green-200 text-xs font-medium mb-1 sm:mb-2">{t('kyc.nextStepsTitle')}</p>
                    <ul className="space-y-1 text-green-200 text-xs">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></span>
                        <span>{t('kyc.step1')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></span>
                        <span>{t('kyc.step2')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></span>
                        <span>{t('kyc.step3')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowKycSuccess(false)}
                className="text-green-400 hover:text-green-300 transition-colors p-1 flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal avec padding-top pour header fixe + safe-area (~72px) */}
      <div className="pt-0" style={{ paddingTop: 'calc(72px + env(safe-area-inset-top, 0px))' }}>
        {/* Séparation des médias : pos=0 = avatar, pos>=1 = galerie (triés par date DESC) */}
        {(() => {
          // Trouver l'avatar (média avec pos=0)
          const profilePhoto = profile.media?.find((m: any) => m.pos === 0) || null
          // Pour les vidéos, utiliser le thumbnail au lieu de l'URL de la vidéo
          const finalAvatar = profilePhoto?.type === 'video'
            ? (profilePhoto?.thumb || profilePhoto?.url || profile.avatar)
            : (profilePhoto?.url || profile.avatar)

          // Galerie = tous les médias SAUF l'avatar (pos !== 0)
          const feedMedia = profile.media
            ? profile.media.filter((m: any) => m.pos !== 0).map((item) => ({
                ...item,
                isPrivate: Boolean(item?.isPrivate || (typeof (item as any)?.visibility === 'string' && (item as any).visibility.toUpperCase() === 'PRIVATE')),
                price: typeof item?.price === 'number'
                  ? item.price
                  : typeof (item as any)?.price === 'string' && (item as any).price.trim() !== ''
                    ? Number((item as any).price)
                    : undefined
              }))
            : []

          return (
            <>
              <ProfileHeader
                name={profile.name}
                city={profile.city}
                avatar={finalAvatar}
                verified={profile.verified}
                premium={profile.premium}
                online={profile.online}
                age={profile.age}
                category={profile.category}
                languages={[]}
                services={profile.services}
                stats={{
                  likes: profile.stats?.likes || 0,
                  reactions: profile.stats?.reactions || 0,
                  followers: profile.stats?.followers || 0,
                  views: profile.stats?.views || 0
                }}
                availability={profile.availability}
                realTimeAvailability={profile.realTimeAvailability}
                scheduleData={profile.scheduleData}
                description={profile.description}
                mediaCount={Array.isArray(feedMedia) ? feedMedia.length : 0}
                showAvatar={true}
              />

              <ActionsBar
                profileId={profile.id}
                isFollowing={isFollowing}
                isLiked={isLiked}
                isSaved={isSaved}
                onFollow={handleFollow}
                onMessage={handleMessage}
                onGift={() => setShowGiftPicker(true)}
                onLike={handleLike}
                onSave={handleSave}
                onShare={handleShare}
                onReport={handleReport}
                onShowDetails={handleShowDetails}
                isFavorite={isFavorite}
                onFavoriteToggle={() => handleFavoriteToggle()}
                contact={profile.contact}
                profileName={profile.name}
              />

              <MediaFeedWithGallery
                media={feedMedia}
                profileId={profile.id}
                profileName={profile.name}
                viewerIsOwner={isOwner}
                onLike={handleMediaLike}
                onSave={handleMediaSave}
                onReactionChange={handleReactionChange}
                onUpdateMedia={async (mediaUrl: string, updates: any) => {
                  // Update optimiste : mise à jour immédiate de l'état local
                  const originalProfile = profile

                  setProfile(prev => prev ? ({
                    ...prev,
                    media: prev.media.map(m =>
                      m.url === mediaUrl ? { ...m, ...updates } : m
                    )
                  }) : null)

                  // Requête API
                  const result = await updateMediaWithErrorHandling(mediaUrl, updates)

                  // Si échec, rollback
                  if (!result.success) {
                    setProfile(originalProfile)
                    throw new Error(result.error)
                  }

                  // Recalculer les stats si nécessaire
                  await calculateTotalReactions()
                }}
                onDeleteMedia={async (mediaUrl: string, index: number) => {
                  // Update optimiste : suppression immédiate de l'état local
                  const originalProfile = profile

                  setProfile(prev => prev ? ({
                    ...prev,
                    media: prev.media.filter(m => m.url !== mediaUrl)
                  }) : null)

                  // Requête API
                  const result = await deleteMediaWithErrorHandling(mediaUrl, index)

                  // Si échec, rollback
                  if (!result.success) {
                    setProfile(originalProfile)
                    throw new Error(result.error)
                  }

                  // Recalculer les stats si nécessaire
                  await calculateTotalReactions()
                }}
              />
            </>
          )
        })()}
      </div>

      {/* Modal Premium Unifié */}
      {showDetailModal && (
        <ProfileClientUnified
          profileId={resolvedId}
          onClose={handleCloseModal}
        />
      )}

      {/* Gift Picker + Toast */}
      <GiftPicker
        isOpen={showGiftPicker}
        onClose={() => setShowGiftPicker(false)}
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
