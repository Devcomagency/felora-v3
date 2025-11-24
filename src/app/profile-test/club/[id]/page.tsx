'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import ProfileHeader from '../../../../../packages/ui/profile-test/ProfileHeader'
import ActionsBar from '../../../../../packages/ui/profile-test/ActionsBar'
import MediaFeedWithGallery from '../../../../../packages/ui/profile-test/MediaFeedWithGallery'
import ClubEscortsSection from '../../../../../packages/ui/profile-test/ClubEscortsSection'
import { ClubProfileModal } from '@/components/ClubProfileModal'
import { useViewTracker } from '@/hooks/useViewTracker'
import ReportModal from '@/components/ReportModal'
import { addFavoriteId, removeFavoriteId, readFavoriteIds } from '@/lib/favorites'
import { toast } from 'sonner'

interface ClubProfile {
  id: string
  dbId?: string // ID de la base de données (pour les API internes)
  userId?: string // ID du propriétaire du club
  isOwner?: boolean // Si l'utilisateur connecté est le propriétaire
  name: string
  handle?: string
  avatar?: string
  city?: string
  languages: string[]
  services: string[]
  media: Array<{
    type: 'image' | 'video'
    url: string
    thumb?: string
    poster?: string
    visibility?: 'PUBLIC' | 'PRIVATE'
  }>
  verified?: boolean
  premium?: boolean
  description?: string
  establishmentType?: 'institut_massage' | 'agence_escorte' | 'salon_erotique' | 'club'
  stats?: {
    likes?: number
    followers?: number
    views?: number
    reactions?: number
  }
  location?: {
    address?: string
    coordinates?: { lat: number; lng: number }
  }
  contact?: {
    phone?: string
    website?: string
    email?: string
  }
  amenities?: string[]
  workingHours?: string
  agendaIsOpenNow?: boolean // ✅ Statut ouvert/fermé en temps réel
}

// Loading skeleton
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="h-14 bg-black/60 backdrop-blur-md border-b border-white/10" />
        
        {/* Hero skeleton */}
        <div className="h-72 bg-[#111318]" />
        
        {/* Header card skeleton */}
        <div className="relative mx-4 -mt-10 rounded-3xl border border-white/8 bg-[#14171D]/80 backdrop-blur-xl p-6">
          <div className="flex justify-center -mt-10 mb-4">
            <div className="w-24 h-24 rounded-full bg-[#23262D]" />
      </div>
          <div className="text-center">
            <div className="h-6 bg-[#23262D] rounded w-48 mx-auto mb-2" />
            <div className="h-4 bg-[#23262D] rounded w-32 mx-auto mb-4" />
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="h-8 bg-[#23262D] rounded" />
              <div className="h-8 bg-[#23262D] rounded" />
              <div className="h-8 bg-[#23262D] rounded" />
    </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-11 bg-[#23262D] rounded-xl" />
              <div className="h-11 bg-[#23262D] rounded-xl" />
              <div className="h-11 bg-[#23262D] rounded-xl" />
        </div>
      </div>
    </div>

        {/* Tabs skeleton */}
        <div className="sticky top-14 z-10 bg-[#0B0B0B] px-4 py-2 flex gap-6">
          <div className="h-8 bg-[#23262D] rounded w-16" />
          <div className="h-8 bg-[#23262D] rounded w-16" />
        </div>

        {/* Media grid skeleton */}
        <div className="px-4 py-4 grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] bg-[#23262D] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ClubProfileTestPage() {
  const t = useTranslations('clubProfile')
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<ClubProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [guestId, setGuestId] = useState<string | null>(null)
  const [linkedEscorts, setLinkedEscorts] = useState<any[]>([])
  const [escortsLoading, setEscortsLoading] = useState(true)
  const [showReportModal, setShowReportModal] = useState(false)

  const router = useRouter()

  // Resolve params
  const routeParams = useParams() as Record<string, string | string[]>
  const [resolvedId, setResolvedId] = useState<string>('')

  useEffect(() => {
    const raw = routeParams?.id as unknown
    const id = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : ''
    setResolvedId(id)
  }, [routeParams])

  // ✅ Track profile views using the dbId (ClubProfileV2 ID)
  useViewTracker({
    profileId: profile?.dbId || '',
    profileType: 'club',
    enabled: !!profile?.dbId && !loading && !error
  })

  // Générer un guestId si pas de session
  useEffect(() => {
    if (!session?.user?.id) {
      try {
        const key = 'felora-user-id'
        let u = localStorage.getItem(key)
        if (!u) {
          u = `guest_${Math.random().toString(36).slice(2)}`
          localStorage.setItem(key, u)
        }
        setGuestId(u)
      } catch {
        setGuestId(`guest_${Math.random().toString(36).slice(2)}`)
      }
    }
  }, [session?.user?.id])

  // Action handlers with localStorage persistence
  const handleFollow = useCallback(async (profileId: string) => {
    const key = `follow_${profileId}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())
    setIsFollowing(!currentState)
    await new Promise(resolve => setTimeout(resolve, 500))
  }, [])

  const handleLike = useCallback(async (profileId: string) => {
    const key = `like_${profileId}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())
    setIsLiked(!currentState)
    await new Promise(resolve => setTimeout(resolve, 300))
  }, [])

  const handleSave = useCallback(async (profileId: string) => {
    const key = `save_${profileId}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())
    setIsSaved(!currentState)
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

  // Update optimiste pour les réactions
  const [totalReactions, setTotalReactions] = useState(0)

  // Calculer les réactions totales depuis le state local
  const calculateTotalReactions = useCallback(() => {
    if (profile?.stats) {
      const total = (profile.stats.likes || 0) + (profile.stats.reactions || 0)
      setTotalReactions(total)
    }
  }, [profile?.stats])

  // Fonction pour forcer le recalcul des réactions (appelée après chaque réaction)
  const reactionChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const handleReactionChange = useCallback(async (delta: number = 0) => {
    // Update optimiste immédiat
    setTotalReactions(prev => prev + delta)
    setProfile(prev => prev ? {
      ...prev,
      stats: {
        ...prev.stats,
        reactions: (prev.stats?.reactions || 0) + delta
      }
    } : prev)

    // Annuler le timeout précédent s'il existe
    if (reactionChangeTimeoutRef.current) {
      clearTimeout(reactionChangeTimeoutRef.current)
    }

    // Sync avec serveur (debounced)
    return new Promise<void>((resolve) => {
      reactionChangeTimeoutRef.current = setTimeout(() => {
        // Le sync se fait automatiquement au prochain refetch
        reactionChangeTimeoutRef.current = null
        resolve()
      }, 500)
    })
  }, [])

  const handleContact = useCallback(() => {
    setShowContactModal(true)
  }, [])

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: profile?.name || t('club'),
        text: t('shareText', { name: profile?.name }),
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }, [profile?.name, t])

  const handleReport = useCallback((profileId: string) => {
    setShowReportModal(true)
  }, [])

  const handleShowDetails = useCallback(() => {
    setShowDetailModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false)
  }, [])

  const handleFavoriteToggle = useCallback(() => {
    if (!profile) return
    if (status === 'unauthenticated' || !session?.user?.id) {
      toast.info(t('loginToFavorite'))
      return
    }

    if (isFavorite) {
      removeFavoriteId(profile.id)
      setIsFavorite(false)
      toast.success(t('removedFromFavorites'))
    } else {
      addFavoriteId(profile.id)
      setIsFavorite(true)
      toast.success(t('addedToFavorites'))
    }
  }, [isFavorite, profile, session, status, t])

  // Load localStorage states
  useEffect(() => {
    if (!resolvedId) return

    setIsFollowing(localStorage.getItem(`follow_${resolvedId}`) === 'true')
    setIsLiked(localStorage.getItem(`like_${resolvedId}`) === 'true')
    setIsSaved(localStorage.getItem(`save_${resolvedId}`) === 'true')
  }, [resolvedId])

  // Load favorites state
  useEffect(() => {
    if (!profile) return
    setIsFavorite(readFavoriteIds().includes(profile.id))
  }, [profile?.id, profile])

  // Calculer le total des réactions au chargement du profil
  useEffect(() => {
    if (profile) {
      calculateTotalReactions()
    }
  }, [profile, calculateTotalReactions])

  // Charger les escorts liées au club
  useEffect(() => {
    console.log('[CLUB PROFILE] useEffect triggered, profile.dbId:', profile?.dbId)

    if (!profile?.dbId) {
      console.warn('[CLUB PROFILE] No dbId found, skipping escort fetch')
      return
    }

    async function fetchLinkedEscorts() {
      try {
        setEscortsLoading(true)
        console.log('[CLUB PROFILE] Fetching escorts for clubId:', profile?.dbId)
        const response = await fetch(`/api/clubs/${profile?.dbId}/escorts`)
        const data = await response.json()

        console.log('[CLUB PROFILE] Escorts response:', data)

        if (data.success && data.data) {
          setLinkedEscorts(data.data)
          console.log('[CLUB PROFILE] Linked escorts:', data.data)
        }
      } catch (error) {
        console.error('Error fetching linked escorts:', error)
      } finally {
        setEscortsLoading(false)
      }
    }

    fetchLinkedEscorts()
  }, [profile?.dbId])

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

        const response = await fetch(`/api/profile-test/club/${resolvedId}`, {
          signal: controller.signal
        })
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
        console.error('Failed to fetch club profile:', err)
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


  // Render states
  if (loading) return <ProfileSkeleton />
  if (notFound) return <div className="min-h-screen bg-black flex items-center justify-center text-white">{t('notFound')}</div>
  if (error || !profile) return <div className="min-h-screen bg-black flex items-center justify-center text-white">{t('errorLoading')}</div>

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Boutons flottants par-dessus la photo - sans fond */}
      <div className="fixed top-0 left-0 right-0 z-[100]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', pointerEvents: 'none' }}>
        <div className="flex items-center justify-between p-4" style={{ pointerEvents: 'auto' }}>
          <button
            onClick={() => {
              console.log('🔙 Bouton retour cliqué')
              router.back()
            }}
            className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full transition-colors shadow-lg relative"
            title="Retour"
            style={{ zIndex: 101 }}
          >
            <ArrowLeft size={22} className="text-white" />
          </button>

          <button
            onClick={() => {
              console.log('🔧 Menu cliqué')
              /* TODO: Menu */
            }}
            className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full transition-colors shadow-lg relative"
            title="Menu"
            style={{ zIndex: 101 }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenu principal sans padding - la photo monte jusqu'en haut */}
      <div>
        {/* Séparation des médias : media[0] = photo de profil, media[1-5] = posts feed */}
        {(() => {
          const profilePhoto = profile.media && profile.media.length > 0 ? profile.media[0] : null
          const feedMedia = profile.media
            ? profile.media.slice(1).map((item) => ({
                ...item,
                isPrivate: false, // Clubs have public media by default
                price: undefined
              }))
            : []

          // ✅ Construire le texte de disponibilité en fonction du statut réel de l'API
          const isOpen = profile.agendaIsOpenNow ?? false
          const scheduleText = isOpen ? t('openNow') : t('closed')

          const finalAvailability = {
            available: isOpen,
            schedule: scheduleText
          }

          return (
            <>
              <ProfileHeader
                name={profile.name}
                city={profile.city}
                avatar={profilePhoto?.url ? `${profilePhoto.url}?cb=${Date.now()}` : profile.avatar}
                coverPhoto={profilePhoto?.url ? `${profilePhoto.url}?cb=${Date.now()}` : profile.avatar} // Photo de couverture pour le design moderne
                verified={profile.verified}
                premium={profile.premium}
                online={false}
                age={undefined}
                languages={[]} // Vide pour les clubs (on affiche le site web à la place)
                services={profile.services}
                stats={{
                  likes: profile.stats?.likes || 0,
                  reactions: profile.stats?.reactions || 0,
                  followers: profile.stats?.followers || 0,
                  views: profile.stats?.views || 0
                }}
                availability={finalAvailability}
                description={profile.description}
                mediaCount={Array.isArray(feedMedia) ? feedMedia.length : 0}
                website={profile.contact?.website} // Afficher le site web pour les clubs
                agendaIsOpenNow={profile.agendaIsOpenNow} // ✅ Statut ouvert/fermé en temps réel depuis l'API
              />

              <ActionsBar
                profileId={profile.id}
                isFollowing={isFollowing}
                isLiked={isLiked}
                isSaved={isSaved}
                onFollow={handleFollow}
                onMessage={handleContact}
                onGift={async () => {}} // Clubs don't have gifts
                onLike={handleLike}
                onSave={handleSave}
                onShare={handleShare}
                onReport={handleReport}
                onShowDetails={handleShowDetails}
                isFavorite={isFavorite}
                onFavoriteToggle={() => handleFavoriteToggle()}
                contact={undefined}
                profileName={profile.name}
                showGift={false} // Masquer le bouton cadeau pour les clubs
                showMessage={false} // Masquer le bouton message standard pour les clubs
                website={profile.contact?.website} // Ajouter le site web pour les clubs
              />

              {/* Section des escorts liées au club */}
              <ClubEscortsSection
                escorts={linkedEscorts}
                isLoading={escortsLoading}
              />

              <MediaFeedWithGallery
                media={feedMedia}
                profileId={profile.id}
                profileName={profile.name}
                userId={session?.user?.id || guestId}
                viewerIsOwner={profile.isOwner || false}
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

                  try {
                    // Requête API - Utiliser l'API club media update
                    const response = await fetch(`/api/clubs/media/update`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({
                        url: mediaUrl,
                        visibility: updates.visibility // PUBLIC ou PRIVATE seulement
                      })
                    })

                    if (!response.ok) {
                      throw new Error(`HTTP ${response.status}`)
                    }

                    const result = await response.json()

                    if (!result.success) {
                      throw new Error(result.error || 'Erreur de mise à jour')
                    }

                    toast.success('Visibilité mise à jour')
                  } catch (error: any) {
                    // Si échec, rollback
                    setProfile(originalProfile)
                    toast.error(error.message || 'Erreur lors de la mise à jour')
                    throw error
                  }
                }}
                onDeleteMedia={async (mediaUrl: string, index: number) => {
                  // Update optimiste : suppression immédiate de l'état local
                  const originalProfile = profile

                  setProfile(prev => prev ? ({
                    ...prev,
                    media: prev.media.filter(m => m.url !== mediaUrl)
                  }) : null)

                  try {
                    // Requête API - Utiliser l'API club media delete
                    const response = await fetch(`/api/clubs/media/delete`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({
                        url: mediaUrl
                      })
                    })

                    if (!response.ok) {
                      throw new Error(`HTTP ${response.status}`)
                    }

                    const result = await response.json()

                    if (!result.success) {
                      throw new Error(result.error || 'Erreur de suppression')
                    }

                    toast.success('Média supprimé')
                  } catch (error: any) {
                    // Si échec, rollback
                    setProfile(originalProfile)
                    toast.error(error.message || 'Erreur lors de la suppression')
                    throw error
                  }
                }}
                showPremiumTab={false} // Clubs ont Public et Privé, mais pas Premium
              />
            </>
          )
        })()}
      </div>

      {/* Modal Voir Plus */}
      {showDetailModal && (
        <ClubProfileModal
          profileId={resolvedId}
          profileData={profile || undefined}
          onClose={handleCloseModal}
        />
      )}

      {/* Modal Contact */}
      {showContactModal && profile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-gray-800 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{t('contactModal.title', { name: profile.name })}</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Téléphone */}
              {profile.contact?.phone && (
                <a
                  href={`tel:${profile.contact.phone}`}
                  className="flex items-center gap-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-400">{t('contactModal.phone')}</div>
                    <div className="text-green-300 font-medium font-mono">{profile.contact.phone}</div>
                  </div>
                </a>
              )}

              {/* Email */}
              {profile.contact?.email && (
                <a
                  href={`mailto:${profile.contact.email}`}
                  className="flex items-center gap-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-400">{t('contactModal.email')}</div>
                    <div className="text-purple-300 font-medium truncate">{profile.contact.email}</div>
                  </div>
                </a>
              )}

              {/* Adresse */}
              {profile.location?.address && (
                <div className="flex items-start gap-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">{t('contactModal.address')}</div>
                    <div className="text-blue-300 font-medium">{profile.location.address}</div>
                  </div>
                </div>
              )}

              {/* Site web */}
              {profile.contact?.website && (
                <a
                  href={profile.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-400">{t('contactModal.website')}</div>
                    <div className="text-cyan-300 font-medium truncate">{profile.contact.website}</div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportType="PROFILE"
        targetType="club"
        targetId={resolvedId}
        targetName={profile.name}
      />
    </div>
  )
}