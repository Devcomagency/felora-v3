'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Star, BadgeCheck } from 'lucide-react'
import { useProfileViewTracker } from '@/hooks/useViewTracker'
import { stableMediaId } from '@/lib/reactions/stableMediaId'
import ProfileHeader from '../../../../../packages/ui/profile-test/ProfileHeader'
import ActionsBar from '../../../../../packages/ui/profile-test/ActionsBar'
import { GiftPicker } from '@/components/gifts/GiftPicker'
import { GiftToast } from '@/components/gifts/GiftToast'
import MediaFeedWithGallery from '../../../../../packages/ui/profile-test/MediaFeedWithGallery'
import { AboutSection, RatesSection, AvailabilitySection, PhysicalDetailsSection } from '../../../../../packages/ui/profile-test/Sections'
import { CommentsSection } from '../../../../components/comments/CommentsSection'
import ReportModal from '@/components/ReportModal'
import { addFavoriteId, removeFavoriteId, readFavoriteIds } from '@/lib/favorites'
import { toast } from 'sonner'

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
    availableUntil?: string // Format: "2025-01-15T14:30:00Z" ou "today" ou "tomorrow"
    nextAvailable?: string // Format: "2025-01-16T09:00:00Z"
    schedule?: string // "Disponible jusqu'à 18h" ou "De retour demain 9h"
  }
  physical?: {
    height?: number
    bodyType?: string
    hairColor?: string
    eyeColor?: string
  }
  practices?: string[]
  workingArea?: string
  // Nouvelles propriétés correspondant aux filtres
  category?: string
  serviceType?: string
  experience?: string
  style?: string
  profile?: string
  specialties?: string[]
  additionalLanguages?: string[]
}

// Loading skeleton
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 animate-pulse">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header skeleton */}
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
        
        {/* Actions skeleton */}
        <div className="glass-card p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-gray-700 rounded-lg"></div>
            <div className="flex-1 h-10 bg-gray-700 rounded-lg"></div>
            <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
            <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
          </div>
        </div>
        
        {/* Media skeleton */}
        <div className="h-96 bg-gray-700 rounded-lg mb-6"></div>
      </div>
    </div>
  )
}

// Error boundary component
function ErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)
  
  useEffect(() => {
    const handleError = () => setHasError(true)
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])
  
  if (hasError) return <>{fallback}</>
  return <>{children}</>
}

// 404 page
function NotFound() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="glass-card p-8 text-center max-w-md mx-4">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
        <p className="text-gray-400 mb-6">This escort profile doesn't exist or is no longer available.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push('/search')}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            Browse Profiles
          </button>
        </div>
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

export default function EscortProfileTestPage() {
  console.log('🔍 [PAGE] EscortProfileTestPage component rendered')
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<EscortProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()

  // Calculer si l'utilisateur connecté est le propriétaire du profil
  const isOwner = useMemo(() => {
    if (!session?.user?.id || !profile?.id) return false
    // Comparer l'ID utilisateur de la session avec l'ID du profil
    return session.user.id === profile.id
  }, [session?.user?.id, profile?.id])

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

        const response = await fetch(`/api/profile-test/escort/${resolvedId}`, { signal: controller.signal })
        const data = await response.json()

        if (isCancelled) return

        if (response.status === 404) {
          setNotFound(true)
          return
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        if (data.success && data.data) {
          setProfile(data.data)
        } else {
          throw new Error('Invalid API response')
        }
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

  // Action handlers with localStorage persistence (for testing)
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
      // Could show toast notification here
    }
  }, [profile?.name])

  const handleReport = useCallback((profileId: string) => {
    setShowReportModal(true)
  }, [])

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
  const [showReportModal, setShowReportModal] = useState(false)
  
  // Tracking des vues de profil
  try { useProfileViewTracker({ profileId: resolvedId, profileType: 'escort', enabled: true }) } catch {}
  // Permissions utilisateur (simulation)
  const [userPermissions] = useState({
    isAdmin: false, // Serait récupéré depuis l'auth en vrai
    isProfileOwner: true, // Serait vérifié selon l'ID de profil et l'utilisateur connecté
    username: 'Propriétaire' // Nom de l'utilisateur connecté
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
  
  // Force cleanup on page unload and escape key
  useEffect(() => {
    const handleBeforeUnload = () => {
      document.body.style.overflow = 'auto'
      document.body.style.paddingRight = '0px'
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDetailModal) {
        handleCloseModal()
      }
    }
    
    const forceScrollRestoration = () => {
      // Force la restauration du scroll mobile si modal fermée
      if (!showDetailModal) {
        const body = document.body
        const html = document.documentElement
        body.style.position = ''
        body.style.top = ''
        body.style.width = ''
        body.style.overflow = ''
        html.style.overflow = ''
        body.style.touchAction = ''
        body.style.userSelect = ''
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('keydown', handleKeyDown)
    // N'active l'intervalle que si la modal est ouverte
    const interval = showDetailModal ? setInterval(forceScrollRestoration, 5000) : null
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('keydown', handleKeyDown)
      if (interval) clearInterval(interval)
      // Double sécurité mobile
      const body = document.body
      const html = document.documentElement
      body.style.position = ''
      body.style.top = ''
      body.style.width = ''
      body.style.overflow = ''
      html.style.overflow = ''
      body.style.touchAction = ''
      body.style.userSelect = ''
    }
  }, [showDetailModal, handleCloseModal])


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

  // Calculer le total des réactions de tous les médias (sans auto-refresh pour éviter les doublons)
  const calculateTotalReactions = useCallback(async () => {
    if (!profile?.media || profile.media.length === 0) {
      setTotalReactions(0)
      return
    }

    try {
      const mediaIds = profile.media.map(m => stableMediaId({ rawId: m.id || null, profileId: profile.id, url: m.url }))
      const res = await fetch('/api/reactions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds })
      })
      const data = await res.json()
      if (data?.success && data?.totals) {
        // totals already excludes LIKE on the API now
        const sum = Object.values<number>(data.totals).reduce((a, b) => a + b, 0)
        setTotalReactions(sum)
      } else {
        // Fallback: 0 si erreur de format
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
    if (status === 'unauthenticated' || !session?.user?.id) {
      toast.info('Connectez-vous pour ajouter des favoris')
      return
    }
    
    if (isFavorite) {
      removeFavoriteId(profile.id)
      setIsFavorite(false)
      toast.success('Retiré des favoris')
    } else {
      addFavoriteId(profile.id)
      setIsFavorite(true)
      toast.success('⭐ Ajouté aux favoris')
    }
  }, [isFavorite, profile, session, status])

  // Gestion des médias
  const handleDeleteMedia = useCallback(async (mediaUrl: string, index: number) => {
    try {
      console.log('🗑️ [DELETE MEDIA] Suppression du média:', mediaUrl, 'Index:', index)

      // Appeler l'API pour supprimer le média
      const response = await fetch('/api/media/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      console.log('✅ [DELETE MEDIA] Média supprimé avec succès')

      // Rafraîchir les données du profil depuis l'API
      if (profile?.id) {
        const refreshResponse = await fetch(`/api/profiles/escort/${profile.id}`)
        if (refreshResponse.ok) {
          const updatedProfile = await refreshResponse.json()
          setProfile(updatedProfile)
          console.log('🔄 [DELETE MEDIA] Profil rafraîchi')
        }
      }
    } catch (error) {
      console.error('❌ [DELETE MEDIA] Erreur:', error)
      throw error // Re-throw pour que le modal affiche l'erreur
    }
  }, [profile?.id])

  const handleEditMedia = useCallback(async (mediaUrl: string, index: number) => {
    try {
      console.log('✏️ [EDIT MEDIA] Édition du média:', mediaUrl, 'Index:', index)
      
      // TODO: Ouvrir un modal d'édition ou rediriger vers une page d'édition
      alert('Fonction d\'édition à implémenter')
    } catch (error) {
      console.error('❌ [EDIT MEDIA] Erreur:', error)
      alert('Erreur lors de l\'édition du média')
    }
  }, [])

  // Generate extended profile data from the real data - AVANT les conditions de render
  const extendedProfileData = useMemo(() => {
    if (!profile) return null

    const rates = []
    if (profile.rates?.hour) rates.push({ duration: '1h', price: profile.rates.hour, description: 'Rencontre intime' })
    if (profile.rates?.twoHours) rates.push({ duration: '2h', price: profile.rates.twoHours, description: 'Moment prolongé' })
    if (profile.rates?.halfDay) rates.push({ duration: '4h', price: profile.rates.halfDay, description: 'Demi-journée' })
    if (profile.rates?.fullDay) rates.push({ duration: '8h', price: profile.rates.fullDay, description: 'Journée complète' })
    if (profile.rates?.overnight) rates.push({ duration: '24h', price: profile.rates.overnight, description: 'Week-end VIP' })

    return {
      languages: profile.languages || ['Français'],
      practices: profile.practices || profile.services || [],
      rates: rates.length > 0 ? rates : [{ duration: '1h', price: 300, description: 'Rencontre intime' }],
      physicalDetails: {
        height: profile.physical?.height ? `${profile.physical.height}cm` : 'Non spécifié',
        bodyType: profile.physical?.bodyType || 'Non spécifié',
        hairColor: profile.physical?.hairColor || 'Non spécifié',
        eyeColor: profile.physical?.eyeColor || 'Non spécifié'
      },
      contact: {
        phone: '+41791234567',
        whatsapp: '+41791234567',
        availableForCalls: true,
        availableForWhatsApp: true,
        availableForSMS: true
      },
      workingArea: profile.workingArea || profile.city || 'Suisse'
    }
  }, [profile])

  // Render states
  if (loading) return <ProfileSkeleton />
  if (notFound) return <NotFound />
  if (error || !profile) return <ErrorFallback />

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="min-h-screen bg-black text-white">
        {/* Header style TikTok */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  try { (window as any)?.umami?.track?.('nav_back', { from: 'profile_test_escort' }) } catch {}
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
          <ProfileHeader
            name={profile.name}
            city={profile.city}
            avatar={profile.avatar}
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
            description={profile.description}
            mediaCount={Array.isArray(profile.media) ? profile.media.length : 0}
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
            media={profile.media}
            profileId={profile.id}
            profileName={profile.name}
            privateEnabled
            viewerIsOwner={isOwner}
            onLike={handleMediaLike}
            onSave={handleMediaSave}
            onReactionChange={calculateTotalReactions}
            onDeleteMedia={handleDeleteMedia}
            onEditMedia={handleEditMedia}
          />

          {/* Section informations de base retirée */}
        </div>

        {/* Modal Voir plus - Design sexy 2025 */}
        {showDetailModal && extendedProfileData && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,0,40,0.95) 50%, rgba(0,0,0,0.9) 100%)',
              overflow: 'hidden',
              touchAction: 'none' // Empêche le scroll mobile sur l'overlay
            }}
            onClick={handleCloseModal}
            onTouchMove={(e) => e.preventDefault()} // Empêche le scroll sur mobile
          >
            <div
              className="relative w-full max-w-sm scrollbar-hide"
              style={{
                background: 'linear-gradient(145deg, rgba(15,15,25,0.95) 0%, rgba(25,15,35,0.98) 50%, rgba(15,15,25,0.95) 100%)',
                borderRadius: '24px',
                padding: '0',
                border: '1px solid rgba(255,107,157,0.2)',
                backdropFilter: 'blur(30px)',
                boxShadow: `
                  0 24px 48px rgba(255,107,157,0.1),
                  0 12px 24px rgba(0,0,0,0.3),
                  inset 0 1px 0 rgba(255,255,255,0.1)
                `,
                maxHeight: '85vh',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y' // Permet uniquement le scroll vertical
              }}
              onClick={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()} // Permet le scroll à l'intérieur
            >
              <div className="space-y-5" style={{ padding: '20px 16px' }}>
                {/* Header avec effet glow - Plus petit */}
                <div className="relative">
                  <button
                    onClick={handleCloseModal}
                    className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-md border border-pink-400/30 text-white hover:from-pink-500/30 hover:to-purple-600/30 transition-all duration-300"
                    style={{
                      boxShadow: '0 0 15px rgba(255,107,157,0.3)'
                    }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div className="text-center">
                    <div 
                      className="inline-block text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1"
                      style={{ backgroundSize: '200% 100%', animation: 'gradient 3s ease infinite' }}
                    >
                      {profile.name}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
                      <span>{profile.age} ans</span>
                      <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
                      <span>{profile.city}</span>
                      {profile.verified && (
                        <>
                          <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
                          <span className="text-pink-400 font-medium flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3 text-[#4FD1C7]" /> Vérifiée
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Détails physiques - Plus compact */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white">Apparence</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Taille', value: extendedProfileData.physicalDetails.height },
                      { label: 'Silhouette', value: extendedProfileData.physicalDetails.bodyType },
                      { label: 'Cheveux', value: extendedProfileData.physicalDetails.hairColor },
                      { label: 'Yeux', value: extendedProfileData.physicalDetails.eyeColor }
                    ].map((item, index) => (
                      <div key={index} className="p-2 rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10">
                        <div className="text-xs text-pink-300/80 font-medium uppercase tracking-wider">{item.label}</div>
                        <div className="text-xs font-medium text-white mt-0.5">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Langues - Plus compact */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 12.236 11.618 14z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white">Langues</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {/* Langues principales */}
                    {profile.languages.map((language, index) => (
                      <span 
                        key={`main-${index}`} 
                        className="px-2.5 py-1 rounded-full text-xs font-medium text-cyan-200 border border-cyan-400/30"
                        style={{
                          background: 'linear-gradient(135deg, rgba(34,211,238,0.1) 0%, rgba(59,130,246,0.1) 100%)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        {language}
                      </span>
                    ))}
                    {/* Langues supplémentaires si disponibles */}
                    {(profile.additionalLanguages || ['Italien', 'Espagnol']).map((language, index) => (
                      <span 
                        key={`add-${index}`} 
                        className="px-2.5 py-1 rounded-full text-xs font-medium text-blue-200 border border-blue-400/30"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(99,102,241,0.1) 100%)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Références - Plus compact */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white">Références</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {/* Catégorie */}
                    <div 
                      className="p-2 rounded-xl border border-indigo-400/30"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <div className="text-xs text-indigo-300/80 font-medium uppercase tracking-wider">Catégorie</div>
                      <div className="text-xs font-medium text-white mt-0.5">{profile.category || 'Premium'}</div>
                    </div>
                    
                    {/* Type de service */}
                    <div 
                      className="p-2 rounded-xl border border-purple-400/30"
                      style={{
                        background: 'linear-gradient(135deg, rgba(147,51,234,0.1) 0%, rgba(168,85,247,0.1) 100%)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <div className="text-xs text-purple-300/80 font-medium uppercase tracking-wider">Type de service</div>
                      <div className="text-xs font-medium text-white mt-0.5">{profile.serviceType || 'Escort Indépendante'}</div>
                    </div>
                    
                    {/* Expérience */}
                    <div 
                      className="p-2 rounded-xl border border-pink-400/30"
                      style={{
                        background: 'linear-gradient(135deg, rgba(219,39,119,0.1) 0%, rgba(236,72,153,0.1) 100%)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <div className="text-xs text-pink-300/80 font-medium uppercase tracking-wider">Expérience</div>
                      <div className="text-xs font-medium text-white mt-0.5">{profile.experience || 'Experte (5+ ans)'}</div>
                    </div>
                    
                    {/* Style */}
                    <div 
                      className="p-2 rounded-xl border border-rose-400/30"
                      style={{
                        background: 'linear-gradient(135deg, rgba(244,63,94,0.1) 0%, rgba(251,113,133,0.1) 100%)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <div className="text-xs text-rose-300/80 font-medium uppercase tracking-wider">Style</div>
                      <div className="text-xs font-medium text-white mt-0.5">{profile.style || 'Élégante & Sophistiquée'}</div>
                    </div>
                    
                    {/* Profil */}
                    <div 
                      className="p-2 rounded-xl border border-amber-400/30"
                      style={{
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(251,191,36,0.1) 100%)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <div className="text-xs text-amber-300/80 font-medium uppercase tracking-wider">Profil</div>
                      <div className="text-xs font-medium text-white mt-0.5">{profile.profile || 'Escorte de Luxe'}</div>
                    </div>
                  </div>
                </div>

                {/* Services Spécialisés - Plus compact */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white">Services Spécialisés</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(profile.specialties || ['GFE (Girlfriend Experience)', 'Massage Tantrique', 'Accompagnement VIP', 'Soirées Privées']).map((specialty, index) => (
                      <span 
                        key={index} 
                        className="px-2.5 py-1 rounded-full text-xs font-medium text-purple-200 border border-purple-400/30"
                        style={{
                          background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.15) 100%)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tarifs - très discret */}
                <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                  <div className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Tarification</div>
                  <div className="space-y-1">
                    {extendedProfileData.rates.slice(0, 3).map((rate, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">{rate.duration}</span>
                        <span className="text-gray-400 font-mono">{rate.price} CHF</span>
                      </div>
                    ))}
                    {extendedProfileData.rates.length > 3 && (
                      <div className="text-xs text-gray-600 italic">+ autres durées disponibles</div>
                    )}
                  </div>
                </div>

                {/* Zone de travail - Plus compact */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h3 className="text-xs font-semibold text-white">Zone de service</h3>
                  </div>
                  <div 
                    className="p-2 rounded-lg border border-emerald-400/30 text-emerald-200"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(20,184,166,0.1) 100%)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div className="text-xs font-medium">{extendedProfileData.workingArea}</div>
                  </div>
                </div>

                {/* Disponibilité - Plus compact - Affiche seulement si agenda activé */}
                {(() => {
                  return true
                })() && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h3 className="text-xs font-semibold text-white">Disponibilité</h3>
                    </div>
                    <div className="space-y-2">
                      <div 
                        className={`p-2 rounded-lg border text-xs font-medium ${
                          profile.availability?.available 
                            ? 'border-green-400/30 text-green-200' 
                            : 'border-red-400/30 text-red-200'
                        }`}
                        style={{
                          background: profile.availability?.available 
                            ? 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(16,185,129,0.1) 100%)'
                            : 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,127,0.1) 100%)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        {profile.availability?.available ? '🟢 Disponible maintenant' : '🔴 Non disponible'}
                      </div>
                      <div 
                        className="p-2 rounded-lg border border-white/20 text-white"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <div className="text-xs font-medium">
                          {profile.availability?.incall && profile.availability?.outcall ? 'Se déplace et reçoit' :
                           profile.availability?.incall ? 'Reçoit uniquement' :
                           profile.availability?.outcall ? 'Se déplace uniquement' : 'Non spécifié'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section Avis moderne */}
                <div className="-mx-4 -mb-4">
                  <CommentsSection
                    profileId={profile.id}
                    profileType="escort"
                    profileOwnerId={profile.id}
                    currentUser={{
                      id: userPermissions.username,
                      name: userPermissions.username,
                      verified: true
                    }}
                    allowRatings={true}
                    className="px-4 pb-4"
                  />
                </div>
              </div>
              
              {/* Animation CSS pour le titre et scrollbar */}
              <style jsx global>{`
                @keyframes gradient {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
                
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          </div>
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

        {/* Report Modal */}
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportType="PROFILE"
          targetType="escort"
          targetId={resolvedId}
          targetName={profile.name}
        />

      </div>
    </ErrorBoundary>
  )
}
