'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Star, BadgeCheck } from 'lucide-react'
import ProfileHeader from '../../../../../packages/ui/profile-test/ProfileHeader'
import ActionsBar from '../../../../../packages/ui/profile-test/ActionsBar'
import MediaFeedWithGallery from '../../../../../packages/ui/profile-test/MediaFeedWithGallery'
import { ProfileClientUnified } from '@/components/ProfileClientUnified'

interface ClubProfile {
  id: string
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
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ClubProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public')
  const [totalReactions, setTotalReactions] = useState(0)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [guestId, setGuestId] = useState<string | null>(null)
  
  const router = useRouter()

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

  // Resolve params
  const routeParams = useParams() as Record<string, string | string[]>
  const [resolvedId, setResolvedId] = useState<string>('')

  useEffect(() => {
    const raw = routeParams?.id as unknown
    const id = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : ''
    setResolvedId(id)
  }, [routeParams])

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

  // Fonction pour recalculer les réactions totales
  const calculateTotalReactions = useCallback(async () => {
    try {
      const response = await fetch(`/api/profile-test/club/${resolvedId}?cache_bust=${Date.now()}`)
      const data = await response.json()
      if (data.success && data.data?.stats) {
        const total = (data.data.stats.likes || 0) + (data.data.stats.reactions || 0)
        setTotalReactions(total)
        // Mettre à jour le profil avec les nouvelles stats
        setProfile(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            likes: data.data.stats.likes || 0,
            reactions: data.data.stats.reactions || 0
          }
        } : prev)
        console.log('[CLUB PROFILE] Total réactions calculé:', total)
      }
    } catch (error) {
      console.error('Error fetching club stats:', error)
    }
  }, [resolvedId])

  // Fonction pour forcer le recalcul des réactions (appelée après chaque réaction)
  const reactionChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const handleReactionChange = useCallback(async () => {
    console.log('[CLUB PROFILE] Reaction changed, scheduling recalculation...')
    
    // Annuler le timeout précédent s'il existe
    if (reactionChangeTimeoutRef.current) {
      clearTimeout(reactionChangeTimeoutRef.current)
    }
    
    // Programmer le recalcul avec un délai pour éviter les appels multiples
    reactionChangeTimeoutRef.current = setTimeout(async () => {
      console.log('[CLUB PROFILE] Recalculating total reactions...')
      try {
        const response = await fetch(`/api/profile-test/club/${resolvedId}?cache_bust=${Date.now()}`)
        const data = await response.json()
        if (data.success && data.data?.stats) {
          const total = (data.data.stats.likes || 0) + (data.data.stats.reactions || 0)
          setTotalReactions(total)
          // Mettre à jour le profil avec les nouvelles stats
          setProfile(prev => prev ? {
            ...prev,
            stats: {
              ...prev.stats,
              likes: data.data.stats.likes || 0,
              reactions: data.data.stats.reactions || 0
            }
          } : prev)
          console.log('[CLUB PROFILE] Total réactions calculé:', total)
        }
      } catch (error) {
        console.error('Error fetching club stats:', error)
      }
      reactionChangeTimeoutRef.current = null
    }, 500) // Délai de 500ms pour éviter les appels multiples
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
        title: profile?.name || 'Club',
        text: `Check out ${profile?.name}'s club on Felora`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }, [profile?.name])

  const handleReport = useCallback((profileId: string) => {
    router.push(`/report?type=club&id=${profileId}`)
  }, [router])

  const handleShowDetails = useCallback(() => {
    setShowDetailModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false)
  }, [])

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
    const favorites = JSON.parse(localStorage.getItem('felora-favorites') || '[]')
    setIsFavorite(favorites.includes(profile.id))
  }, [profile?.id])

  // Calculer le total des réactions au chargement du profil
  useEffect(() => {
    if (profile) {
      calculateTotalReactions()
    }
  }, [profile, calculateTotalReactions])

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

        const response = await fetch(`/api/profile-test/club/${resolvedId}?cache_bust=1`, { 
          signal: controller.signal,
          headers: { 'cache-control': 'no-cache' }
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
  if (notFound) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Club Not Found</div>
  if (error || !profile) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Error Loading Profile</div>

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header style TikTok */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
              title="Retour à la recherche"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-lg font-bold">{profile.name}</h1>
          </div>

          {/* Placeholder to keep the title centered */}
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
                isPrivate: false, // Clubs have public media by default
                price: undefined
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
                online={false}
                age={undefined}
                languages={profile.languages || []}
                services={profile.services}
                stats={{
                  likes: profile.stats?.likes || 0,
                  reactions: profile.stats?.reactions || 0,
                  followers: profile.stats?.followers || 0,
                  views: profile.stats?.views || 0
                }}
                availability={{
                  available: true
                }}
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
              />

              <MediaFeedWithGallery
                media={feedMedia}
                profileId={profile.id}
                profileName={profile.name}
                userId={session?.user?.id || guestId}
                viewerIsOwner={false} // For now, no club ownership
                onLike={handleMediaLike}
                onSave={handleMediaSave}
                onReactionChange={handleReactionChange}
                onUpdateMedia={async () => {}} // TODO: Implement for clubs
                onDeleteMedia={async () => {}} // TODO: Implement for clubs
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
    </div>
  )
}