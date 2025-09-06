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
import MediaFeedWithGallery from '../../../../packages/ui/profile-test/MediaFeedWithGallery'
import { AboutSection, RatesSection, AvailabilitySection, PhysicalDetailsSection } from '../../../../packages/ui/profile-test/Sections'
import { CommentsSection } from '@/components/comments/CommentsSection'

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
    availableUntil?: string
    nextAvailable?: string
    schedule?: string
  }
  physical?: {
    height?: number
    bodyType?: string
    hairColor?: string
    eyeColor?: string
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

export default function EscortProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<EscortProfile | null>(null)
  const [agendaInfo, setAgendaInfo] = useState<{ enabled: boolean; label: string; isOpenNow: boolean } | null>(null)
  const [agendaWeekly, setAgendaWeekly] = useState<Array<{ weekday: number; enabled: boolean; start?: string; end?: string }>>([])
  const [agendaActiveAbsence, setAgendaActiveAbsence] = useState<{ start: string; end: string } | null>(null)
  const [showAgendaModal, setShowAgendaModal] = useState(false)
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

  // Fetch profile data using direct server-side fetch (like our working page.tsx)
  useEffect(() => {
    if (!resolvedId) return

    let isCancelled = false

    async function fetchProfile() {
      try {
        setLoading(true)
        setError(false)
        setNotFound(false)

        // Use the same approach as our working profile page - fetch from server directly
        const response = await fetch(`/api/profile/${resolvedId}`)
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
          // Transform the data to match our EscortProfile interface
          let escortData = data.data

          // Ensure we have timeSlots; if missing, fetch from escort profile API
          if (!escortData.timeSlots) {
            try {
              const r2 = await fetch(`/api/escort/profile/${resolvedId}`, { headers: { 'Content-Type': 'application/json' }, cache: 'no-store' })
              if (r2.ok) {
                const d2 = await r2.json()
                if (d2?.timeSlots) escortData.timeSlots = d2.timeSlots
              }
            } catch {}
          }
          
          // Build media list with graceful fallback if gallery is empty
          const parsedGallery: Array<{ url: string; type?: string; isPrivate?: boolean }> = escortData.galleryPhotos ? (() => { try { return JSON.parse(escortData.galleryPhotos) } catch { return [] } })() : []
          const mediaFromDb = parsedGallery.map((m: any, index: number) => ({
            type: (m.type || 'image') as 'image' | 'video',
            url: m.url,
            thumb: m.url,
            poster: m.type === 'video' ? m.url : undefined,
            isPrivate: m.isPrivate || false // Utilise la valeur isPrivate du média, pas l'index
          }))
          const fallbackImages = [
            escortData.profilePhoto,
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&auto=format&q=80',
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&auto=format&q=80',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&auto=format&q=80'
          ].filter(Boolean).map((url: any) => ({ type: 'image' as const, url, thumb: url }))
          const finalMedia = mediaFromDb.length > 0 ? mediaFromDb : fallbackImages

          // Derive agenda from timeSlots if present
          const parseAgenda = (timeSlots: any) => {
            try {
              const sched = typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots
              if (!sched || !Array.isArray(sched.weekly)) return null
              const now = new Date()
              const dayIndex = (now.getDay() + 6) % 7 // JS: 0=Sunday; our 0=Lundi
              const today = sched.weekly.find((it: any) => Number(it.weekday) === dayIndex)
              const anyEnabled = sched.weekly.some((it: any) => !!it.enabled)
              if (!anyEnabled) return null

              // Check exceptional absences for today (inclusive range)
              let hasActiveAbsence = false
              let activeAbsence: { start: string; end: string } | null = null
              if (Array.isArray(sched.absences)) {
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
                const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1
                for (const a of sched.absences) {
                  if (!a?.start || !a?.end) continue
                  const s = new Date(a.start + 'T00:00:00').getTime()
                  const e = new Date(a.end + 'T23:59:59').getTime()
                  if (s <= endOfDay && e >= startOfDay) {
                    hasActiveAbsence = true
                    activeAbsence = { start: String(a.start), end: String(a.end) }
                    break
                  }
                }
              }
              const start = (today && today.start) ? today.start : '—'
              const end = (today && today.end) ? today.end : '—'
              const label = hasActiveAbsence ? `Aujourd'hui : absence exceptionnelle` : `Aujourd'hui: ${start} — ${end}`
              const [sh, sm] = String(start).split(':').map((x: any) => parseInt(x, 10))
              const [eh, em] = String(end).split(':').map((x: any) => parseInt(x, 10))
              const nowMin = now.getHours() * 60 + now.getMinutes()
              const startMin = (Number.isFinite(sh) ? sh : 0) * 60 + (Number.isFinite(sm) ? sm : 0)
              const endMin = (Number.isFinite(eh) ? eh : 0) * 60 + (Number.isFinite(em) ? em : 0)
              let isOpenNow = false
              if (!hasActiveAbsence && today?.enabled && Number.isFinite(startMin) && Number.isFinite(endMin)) {
                if (endMin > startMin) {
                  isOpenNow = nowMin >= startMin && nowMin <= endMin
                } else {
                  // Overnight case: e.g., 22:00 — 02:00
                  isOpenNow = (nowMin >= startMin) || (nowMin <= endMin)
                }
              }
              return { enabled: true, label, isOpenNow, activeAbsence }
            } catch { return null }
          }

          const profileData: EscortProfile = {
            id: escortData.id,
            name: escortData.stageName || escortData.firstName || 'Escort',
            stageName: escortData.stageName || escortData.firstName,
            avatar: escortData.profilePhoto || '/placeholder-avatar.jpg',
            city: escortData.city || 'Non spécifié',
            age: escortData.dateOfBirth ? 
              new Date().getFullYear() - new Date(escortData.dateOfBirth).getFullYear() : undefined,
            languages: escortData.languages ? JSON.parse(escortData.languages) : ['Français'],
            services: escortData.services ? JSON.parse(escortData.services) : ['Accompagnement'],
            media: finalMedia,
            verified: escortData.isVerifiedBadge || false,
            premium: true,
            online: escortData.status === 'ACTIVE',
            description: escortData.description || 'Aucune description disponible',
            stats: {
              likes: 0,
              followers: 289,
              views: escortData.views || 0
            },
            rates: {
              hour: escortData.rate1H || undefined,
              twoHours: escortData.rate2H || undefined,
              halfDay: escortData.rateHalfDay || undefined,
              fullDay: escortData.rateFullDay || undefined,
              overnight: escortData.rateOvernight || undefined,
            },
            availability: {
              incall: escortData.incall || false,
              outcall: escortData.outcall || false,
              available: escortData.availableNow || false,
              schedule: escortData.availableNow ? 'Disponible maintenant' : undefined
            },
            physical: {
              height: escortData.height || undefined,
              bodyType: escortData.bodyType || undefined,
              hairColor: escortData.hairColor || undefined,
              eyeColor: escortData.eyeColor || undefined,
            },
            practices: escortData.practices ? JSON.parse(escortData.practices) : undefined,
            workingArea: escortData.workingArea || escortData.city,
            specialties: escortData.services ? JSON.parse(escortData.services) : []
          }

          const ag = parseAgenda(escortData.timeSlots)
          if (ag) {
            profileData.availability = {
              ...(profileData.availability||{}),
              available: ag.isOpenNow,
              schedule: ag.label
            }
            setAgendaInfo({ enabled: ag.enabled, label: ag.label, isOpenNow: ag.isOpenNow })
            setAgendaActiveAbsence(ag.activeAbsence || null)
            try {
              const sched = typeof escortData.timeSlots === 'string' ? JSON.parse(escortData.timeSlots) : escortData.timeSlots
              if (sched?.weekly && Array.isArray(sched.weekly)) {
                setAgendaWeekly(sched.weekly.map((w: any) => ({ weekday: Number(w.weekday)||0, enabled: !!w.enabled, start: w.start, end: w.end })))
              }
            } catch {}
          } else {
            setAgendaInfo(null)
            setAgendaWeekly([])
            setAgendaActiveAbsence(null)
          }
          setProfile(profileData)
        } else {
          throw new Error('Invalid API response')
        }
      } catch (err) {
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
    }
  }, [resolvedId])

  // Action handlers with localStorage persistence (for testing)
  const handleFollow = useCallback(async (profileId: string) => {
    const key = `follow_${profileId}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())
    
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
  const { stats: viewStats } = useProfileViewTracker(resolvedId, true)
  
  const [userPermissions] = useState({
    isAdmin: false,
    isProfileOwner: true,
    username: 'Propriétaire'
  })

  const handleShowDetails = useCallback(() => {
    setShowDetailModal(true)
  }, [])
  
  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false)
  }, [])

  useEffect(() => {
    if (!resolvedId) return
    
    setIsFollowing(localStorage.getItem(`follow_${resolvedId}`) === 'true')
    setIsLiked(localStorage.getItem(`like_${resolvedId}`) === 'true')
    setIsSaved(localStorage.getItem(`save_${resolvedId}`) === 'true')
  }, [resolvedId])

  useEffect(() => {
    if (!profile) return
    const favorites = JSON.parse(localStorage.getItem('felora-favorites') || '[]')
    setIsFavorite(favorites.includes(profile.id))
  }, [profile?.id])

  const calculateTotalReactions = useCallback(async (forceRefresh = false) => {
    if (!profile?.media || profile.media.length === 0) {
      setTotalReactions(0)
      return
    }

    const mediaIds = profile.media.map(m => stableMediaId({ rawId: null, profileId: profile.id, url: m.url }))
    const cacheKey = `bulk_${profile.id}_${mediaIds.length}`
    
    // Vider le cache si demandé (quand une réaction change)
    if (forceRefresh) {
      sessionStorage.removeItem(cacheKey)
    }
    
    // Vérifier si on a déjà calculé récemment (cache de 15 secondes)
    const cached = sessionStorage.getItem(cacheKey)
    if (cached && !forceRefresh) {
      try {
        const { total, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < 15000) { // 15 secondes
          setTotalReactions(total)
          return
        }
      } catch {
        // Cache corrompu, on continue vers l'API
      }
    }

    try {
      const res = await fetch('/api/reactions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaIds })
      })
      const data = await res.json()
      if (data?.success && data?.totals) {
        const sum = Object.values<number>(data.totals).reduce((a, b) => a + b, 0)
        setTotalReactions(sum)
        
        // Sauver dans le cache
        sessionStorage.setItem(cacheKey, JSON.stringify({ total: sum, timestamp: Date.now() }))
      } else {
        setTotalReactions(0)
      }
    } catch (error) {
      console.error('Error fetching reactions bulk:', error)
      setTotalReactions(0)
    }
  }, [profile?.media, profile?.id])

  useEffect(() => {
    calculateTotalReactions()
  }, [calculateTotalReactions])

  // Mettre à jour les stats du profil quand totalReactions change
  useEffect(() => {
    if (profile && totalReactions >= 0) {
      setProfile(prevProfile => {
        if (!prevProfile) return prevProfile
        // Éviter de mettre à jour si la valeur est déjà la même
        if (prevProfile.stats?.likes === totalReactions) return prevProfile
        return {
          ...prevProfile,
          stats: {
            ...prevProfile.stats,
            likes: totalReactions
          }
        }
      })
    }
  }, [totalReactions])

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

  // Generate extended profile data
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
                  try { (window as any)?.umami?.track?.('nav_back', { from: 'profile_escort' }) } catch {}
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

            <div className="w-10 h-10" />
          </div>
        </div>

        {/* Contenu principal avec padding-top pour compenser le header fixe */}
        <div className="pt-20" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
          {/* Profile Header */}
          <ProfileHeader
            name={profile.name}
            handle={profile.handle}
            city={profile.city}
            age={profile.age}
            avatar={profile.avatar}
            verified={profile.verified}
            premium={profile.premium}
            online={profile.online}
            languages={profile.languages}
            services={profile.services}
            stats={profile.stats}
            mediaCount={profile.media.length}
            availability={profile.availability}
            description={profile.description}
            showAgendaPill={!!agendaInfo?.enabled}
            onAgendaClick={() => setShowAgendaModal(true)}
            agendaIsOpenNow={agendaInfo?.isOpenNow}
          />

          {/* Actions Bar */}
          <ActionsBar
            profileId={profile.id}
            onMessage={() => handleMessage(profile.id)}
            onFollow={() => handleFollow(profile.id)}
            onLike={() => handleLike(profile.id)}
            onSave={() => handleSave(profile.id)}
            onFavoriteToggle={handleFavoriteToggle}
            onGift={() => setShowGiftPicker(true)}
            onShare={handleShare}
            onReport={() => handleReport(profile.id)}
            isFollowing={isFollowing}
            isLiked={isLiked}
            isSaved={isSaved}
            isFavorite={isFavorite}
            onShowDetails={handleShowDetails}
          />

          {/* Media Feed with Gallery */}
          <MediaFeedWithGallery
            media={profile.media}
            profileId={profile.id}
            profileName={profile.name}
            userId={session?.user?.id}
            onLike={handleMediaLike}
            onSave={handleMediaSave}
            onReactionChange={() => calculateTotalReactions(true)}
            privateEnabled={true}
            viewerIsOwner={userPermissions.isProfileOwner}
          />

          {/* Agenda modal */}
          {showAgendaModal && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowAgendaModal(false)} />
              <div className="relative w-[min(92vw,28rem)] rounded-2xl border border-white/10 bg-gray-900/95 backdrop-blur p-5 text-white shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Horaires</h3>
                  <button onClick={() => setShowAgendaModal(false)} className="text-white/70 hover:text-white">✕</button>
                </div>
                {agendaActiveAbsence && (
                  <div className="mb-3 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-sm">
                    <div className="font-medium mb-0.5">Absence exceptionnelle</div>
                    <div>
                      {(() => {
                        try {
                          const s = new Date(agendaActiveAbsence.start)
                          const e = new Date(agendaActiveAbsence.end)
                          const fmt = (d: Date) => d.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          return `Du ${fmt(s)} au ${fmt(e)}`
                        } catch {
                          return `Du ${agendaActiveAbsence.start} au ${agendaActiveAbsence.end}`
                        }
                      })()}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {(() => {
                    const days = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']
                    const list = agendaWeekly.length ? agendaWeekly : days.map((_,i)=>({ weekday:i, enabled:false }))
                    return list.map((w:any) => {
                      const label = days[w.weekday] || days[0]
                      const enabled = !!w.enabled
                      const start = w.start || '—'
                      const end = w.end || '—'
                      return (
                        <div key={w.weekday} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-red-500/70'}`} />
                            <span className="text-sm">{label}</span>
                          </div>
                          <div className="text-sm text-white/80">{start} — {end}</div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </div>
          )}

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

                {/* Disponibilité - Plus compact */}
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

        {/* Gift Picker Modal */}
        {showGiftPicker && (
          <GiftPicker
            isOpen={showGiftPicker}
            fromUserId={session?.user?.id || 'guest'}
            toUserId={profile.id}
            onClose={() => setShowGiftPicker(false)}
            onGiftSent={(gift) => {
              setLastReceivedGift(gift)
              setShowGiftToast(true)
              setShowGiftPicker(false)
            }}
          />
        )}

        {/* Gift Toast */}
        {showGiftToast && lastReceivedGift && (
          <GiftToast
            gift={{
              ...lastReceivedGift,
              senderName: 'Vous'
            }}
            isVisible={showGiftToast}
            onComplete={() => {
              setShowGiftToast(false)
              setLastReceivedGift(null)
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}
