'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Star, BadgeCheck } from 'lucide-react'
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

interface EscortProfile {
  id: string
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
}

// Loading skeleton
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 animate-pulse">
      <div className="max-w-4xl mx-auto p-4">
        <div className="glass-card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-700 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-32 mb-3"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-gray-700 rounded-lg"></div>
            <div className="flex-1 h-10 bg-gray-700 rounded-lg"></div>
            <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
            <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
          </div>
        </div>

        <div className="h-96 bg-gray-700 rounded-lg mb-6"></div>
      </div>
    </div>
  )
}

// Error fallback
function ErrorFallback() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="glass-card p-8 text-center max-w-md mx-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-400 mb-6">We're having trouble loading this profile. Please try again.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EscortProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<EscortProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()

  // Resolve params
  const routeParams = useParams() as Record<string, string | string[]>
  const [resolvedId, setResolvedId] = useState<string>('')

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

        // Debug: Vérifier les données reçues de l'API
        console.log('[DEBUG API] Données reçues de l\'API:', data)
        console.log('[DEBUG API] realTimeAvailability dans data:', data.realTimeAvailability)
        console.log('[DEBUG API] scheduleData dans data:', data.scheduleData)

        const normalizedMedia = Array.isArray(data.media)
          ? data.media.map((item: any) => ({
              ...item,
              isPrivate: Boolean(item?.isPrivate || (typeof item?.visibility === 'string' && item.visibility.toUpperCase() === 'PRIVATE')),
              price: typeof item?.price === 'number'
                ? item.price
                : typeof item?.price === 'string' && item.price.trim() !== ''
                  ? Number(item.price)
                  : undefined
            }))
          : []

        // Transform API data to match EscortProfile interface
        const transformedProfile: EscortProfile = {
          id: data.id,
          name: data.stageName || 'Escort',
          stageName: data.stageName,
          avatar: normalizedMedia?.[0]?.url,
          city: data.city,
          age: data.age || undefined,
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
          scheduleData: data.scheduleData
        }
        setProfile(transformedProfile)
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return
        if (isCancelled) return
        console.error('Failed to fetch escort profile:', err)
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
  }, [resolvedId])

  // Action handlers with localStorage persistence
  const handleFollow = useCallback(async (profileId: string) => {
    const key = `follow_${profileId}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
  }, [])

  const handleLike = useCallback(async (profileId: string) => {
    const key = `like_${profileId}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())

    await new Promise(resolve => setTimeout(resolve, 300))
  }, [])

  const handleSave = useCallback(async (profileId: string) => {
    const key = `save_${profileId}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())

    await new Promise(resolve => setTimeout(resolve, 300))
  }, [])

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
        title: profile?.name || 'Profile',
        text: `Check out ${profile?.name}'s profile on Felora`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }, [profile?.name])

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

  const handleShowDetails = useCallback(() => {
    setShowDetailModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false)
    // Double sécurité pour restaurer le scroll mobile
    setTimeout(() => {
      const body = document.body
      const html = document.documentElement
      const scrollY = body.getAttribute('data-scroll-y')

      body.style.position = ''
      body.style.top = ''
      body.style.width = ''
      body.style.overflow = ''
      html.style.overflow = ''
      body.style.touchAction = ''
      body.style.userSelect = ''

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY))
        body.removeAttribute('data-scroll-y')
      }
    }, 100)
  }, [])

  // Gérer le scroll du body quand la modal est ouverte (spécial mobile)
  useEffect(() => {
    const body = document.body
    const html = document.documentElement

    if (showDetailModal) {
      // Spécial mobile : empêcher tout scroll
      const scrollY = window.scrollY
      body.style.position = 'fixed'
      body.style.top = `-${scrollY}px`
      body.style.width = '100%'
      body.style.overflow = 'hidden'
      html.style.overflow = 'hidden'

      // Pour iOS Safari
      body.style.touchAction = 'none'
      body.style.userSelect = 'none'

      // Stocker la position pour la restaurer
      body.setAttribute('data-scroll-y', scrollY.toString())
    } else {
      // Restaurer le scroll mobile
      const scrollY = body.getAttribute('data-scroll-y')

      body.style.position = ''
      body.style.top = ''
      body.style.width = ''
      body.style.overflow = ''
      html.style.overflow = ''
      body.style.touchAction = ''
      body.style.userSelect = ''

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY))
        body.removeAttribute('data-scroll-y')
      }
    }

    // Nettoyage au démontage
    return () => {
      body.style.position = ''
      body.style.top = ''
      body.style.width = ''
      body.style.overflow = ''
      html.style.overflow = ''
      body.style.touchAction = ''
      body.style.userSelect = ''
      body.removeAttribute('data-scroll-y')
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
    const favorites = JSON.parse(localStorage.getItem('felora-favorites') || '[]')
    setIsFavorite(favorites.includes(profile.id))
  }, [profile?.id])

  // Calculer le total des réactions des médias du feed uniquement (pas la photo de profil)
  const calculateTotalReactions = useCallback(async () => {
    if (!profile?.media || profile.media.length <= 1) {
      setTotalReactions(0)
      return
    }

    try {
      // Exclure le premier média (photo de profil) des réactions
      const feedMedia = profile.media.slice(1)
      const mediaIds = feedMedia.map(m => stableMediaId({ rawId: null, profileId: profile.id, url: m.url }))
      const res = await fetch('/api/reactions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds })
      })
      const data = await res.json()
      if (data?.success && data?.totals) {
        const sum = Object.values<number>(data.totals).reduce((a, b) => a + b, 0)
        setTotalReactions(sum)
      } else {
        setTotalReactions(0)
      }
    } catch (error) {
      console.error('Error fetching reactions bulk:', error)
      setTotalReactions(0)
    }
  }, [profile?.media, profile?.id])

  // Calculer le total au chargement du profil uniquement
  useEffect(() => {
    calculateTotalReactions()
  }, [calculateTotalReactions])

  // Umami tracking pour la vue profil
  useEffect(() => {
    if (!resolvedId) return
    try { (window as any)?.umami?.track?.('profile_view', { profileId: resolvedId }) } catch {}
  }, [resolvedId])

  const handleFavoriteToggle = useCallback(() => {
    if (!profile) return

    const favorites = JSON.parse(localStorage.getItem('felora-favorites') || '[]')
    if (isFavorite) {
      const newFavorites = favorites.filter((id: string) => id !== profile.id)
      localStorage.setItem('felora-favorites', JSON.stringify(newFavorites))
      setIsFavorite(false)
    } else {
      const newFavorites = [...favorites, profile.id]
      localStorage.setItem('felora-favorites', JSON.stringify(newFavorites))
      setIsFavorite(true)
    }
  }, [isFavorite, profile])

  // Generate extended profile data from the real data
  const extendedProfileData = useMemo(() => {
    if (!profile) return null

    // Debug: Vérifier si realTimeAvailability existe
    console.log('[DEBUG REAL-TIME] profile.realTimeAvailability:', profile.realTimeAvailability)
    console.log('[DEBUG REAL-TIME] profile.scheduleData:', profile.scheduleData)

    const rates = []
    if (profile.rates?.rate1H) rates.push({ duration: '1h', price: profile.rates.rate1H, description: 'Rencontre intime' })
    if (profile.rates?.rate2H) rates.push({ duration: '2h', price: profile.rates.rate2H, description: 'Moment prolongé' })
    if (profile.rates?.rateHalfDay) rates.push({ duration: '4h', price: profile.rates.rateHalfDay, description: 'Demi-journée' })
    if (profile.rates?.rateFullDay) rates.push({ duration: '8h', price: profile.rates.rateFullDay, description: 'Journée complète' })
    if (profile.rates?.overnight) rates.push({ duration: '24h', price: profile.rates.overnight, description: 'Week-end VIP' })

    // DEBUG: Logs pour vérifier les données
    console.log('[DEBUG MODAL] Profile data:', {
      languages: profile.languages,
      services: profile.services,
      rates: profile.rates,
      availability: profile.availability,
      physical: profile.physical,
      practices: profile.practices,
      clientele: profile.clientele
    })

    return {
      languages: (profile.languages || []).filter(lang => lang.trim() !== ''),
      services: (profile.services || []).filter(service => service !== 'escorte'),
      practices: profile.practices || [],
      paymentMethods: ['Espèces', 'Virement', 'PayPal', 'Cartes de crédit'], // Méthodes de paiement standard pour la Suisse
      rates: {
        rate1H: profile.rates?.rate1H,
        rate2H: profile.rates?.rate2H,
        rateHalfDay: profile.rates?.rateHalfDay,
        rateFullDay: profile.rates?.rateFullDay,
        overnight: profile.rates?.overnight,
        currency: profile.rates?.currency || 'CHF'
      },
      physicalDetails: {
        height: profile.physical?.height ? `${profile.physical.height}cm` : 'Non spécifié',
        bodyType: profile.physical?.bodyType || 'Non spécifié',
        hairColor: profile.physical?.hairColor || 'Non spécifié',
        eyeColor: profile.physical?.eyeColor || 'Non spécifié',
        ethnicity: profile.physical?.ethnicity || 'Non spécifié',
        bustSize: profile.physical?.bustSize || 'Non spécifié',
        breastType: profile.physical?.breastType || 'Non spécifié',
        tattoos: profile.physical?.tattoos === true ? 'Oui' : undefined,
        piercings: profile.physical?.piercings === true ? 'Oui' : undefined,
        pubicHair: profile.physical?.pubicHair || 'Non spécifié',
        smoker: undefined
      },
      clientele: profile.clientele || {},
      availability: profile.availability || {},
      workingArea: profile.workingArea || profile.city || 'Suisse'
    }
  }, [profile])

  // Render states
  if (loading) return <ProfileSkeleton />
  if (notFound) return <ErrorFallback />
  if (error || !profile) return <ErrorFallback />

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
              title="Retour à la recherche"
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

      {/* Contenu principal avec padding-top pour header fixe + safe-area (~72px) */}
      <div className="pt-0" style={{ paddingTop: 'calc(72px + env(safe-area-inset-top, 0px))' }}>
        {/* Séparation des médias : media[0] = photo de profil, media[1-5] = posts feed */}
        {(() => {
          const profilePhoto = profile.media && profile.media.length > 0 ? profile.media[0] : null
          const feedMedia = profile.media
            ? profile.media.slice(1).map((item) => ({
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
                avatar={profilePhoto?.url || profile.avatar}
                verified={profile.verified}
                premium={profile.premium}
                online={profile.online}
                age={profile.age}
                languages={[]}
                services={profile.services}
                stats={{
                  likes: totalReactions || 0,
                  followers: profile.stats?.followers || 0,
                  views: profile.stats?.views || 0
                }}
                availability={profile.availability}
                realTimeAvailability={profile.realTimeAvailability}
                scheduleData={profile.scheduleData}
                description={profile.description}
                mediaCount={Array.isArray(feedMedia) ? feedMedia.length : 0}
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
              />

              <MediaFeedWithGallery
                media={(() => {
                  console.log('[PROFILE DEBUG] Media passed to feed:', feedMedia)
                  feedMedia.forEach((media, i) => {
                    console.log(`[PROFILE DEBUG] Media ${i}:`, { type: media.type, url: media.url })
                  })
                  return feedMedia
                })()}
                profileId={profile.id}
                profileName={profile.name}
                privateEnabled
                onLike={handleMediaLike}
                onSave={handleMediaSave}
                onReactionChange={calculateTotalReactions}
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
