'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useProfileViewTracker } from '@/hooks/useViewTracker'
// Media gallery enrichie
import { AboutSection, ClubLocationSection, AmenitiesSection, AvailabilitySection } from '../../../../../packages/ui/profile-test/Sections'
import MediaFeedWithGallery from '../../../../../packages/ui/profile-test/MediaFeedWithGallery'
// Club page: pas de cadeau / message
import ProfileHeader from '../../../../../packages/ui/profile-test/ProfileHeader'
import ActionsBar from '../../../../../packages/ui/profile-test/ActionsBar'
import { ArrowLeft, Star, BadgeCheck } from 'lucide-react'

// (Map retirée selon nouvelle direction design)

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
  stats?: {
    likes?: number
    followers?: number
    views?: number
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

// Loading skeleton (reused from escort page)
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header skeleton */}
        <div className="glass-card p-6 mb-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.18), rgba(255,107,157,0.18))' }} />
            <div className="flex-1">
              <div className="h-6 rounded w-48 mb-2" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))' }} />
              <div className="h-4 rounded w-32 mb-3" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))' }} />
              <div className="flex gap-2">
                <div className="h-6 rounded w-16" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))' }} />
                <div className="h-6 rounded w-16" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="glass-card p-4 mb-6 animate-pulse">
          <div className="flex gap-3">
            <div className="flex-1 h-10 rounded-lg" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))' }} />
            <div className="flex-1 h-10 rounded-lg" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))' }} />
            <div className="h-10 w-10 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))' }} />
            <div className="h-10 w-10 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))' }} />
          </div>
        </div>

        {/* Media area skeleton */}
        <div className="h-96 rounded-lg mb-6 animate-pulse" style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.18), rgba(255,107,157,0.18))' }} />
      </div>
    </div>
  )
}

// Error boundary
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
        <div className="text-6xl mb-4">🏢</div>
        <h1 className="text-2xl font-bold text-white mb-2">Club Not Found</h1>
        <p className="text-gray-400 mb-6">This club profile doesn't exist or is no longer available.</p>
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
            Browse Clubs
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
        <p className="text-gray-400 mb-6">We're having trouble loading this club profile. Please try again.</p>
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

export default function ClubProfileTestPage() {
  const [profile, setProfile] = useState<ClubProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [clubEscorts, setClubEscorts] = useState<Array<{ id: string; name: string; city?: string; avatar?: string }>>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [totalReactions, setTotalReactions] = useState(0)
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

        const response = await fetch(`/api/profile-test/club/${resolvedId}`, { signal: controller.signal })
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

  // Vue en temps réel (même système que page escorte)
  const { stats: viewStats } = useProfileViewTracker(resolvedId, true)

  // Fetch escorts linked to this club (demo endpoint). Optional section.
  useEffect(() => {
    if (!resolvedId) return
    let cancelled = false
    const ctrl = new AbortController()
    ;(async () => {
      try {
        const res = await fetch(`/api/profile-test/club/${resolvedId}/escorts`, { cache: 'no-store', signal: ctrl.signal })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && Array.isArray(data.escorts)) {
          setClubEscorts(data.escorts)
        }
      } catch {}
    })()
    return () => { cancelled = true; ctrl.abort() }
  }, [resolvedId])

  // Action handlers with localStorage persistence
  const handleFollow = useCallback(async (profileId: string) => {
    const key = `follow_club_${profileId}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())
    
    await new Promise(resolve => setTimeout(resolve, 500))
  }, [])

  const handleLike = useCallback(async (profileId: string) => {
    const key = `like_club_${profileId}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())
    
    await new Promise(resolve => setTimeout(resolve, 300))
  }, [])

  const handleSave = useCallback(async (profileId: string) => {
    const key = `save_club_${profileId}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())
    
    await new Promise(resolve => setTimeout(resolve, 300))
  }, [])

  // Calcule le total des réactions (tous médias du club)
  const calculateTotalReactions = useCallback(async () => {
    if (!profile?.media || profile.media.length === 0) {
      setTotalReactions(0)
      return
    }

    try {
      const { stableMediaId } = await import('@/lib/reactions/stableMediaId')
      const mediaIds = profile.media.map(m => stableMediaId({ rawId: null, profileId: profile.id, url: m.url }))
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
      console.error('Error fetching reactions bulk (club):', error)
      setTotalReactions(0)
    }
  }, [profile?.media, profile?.id])

  // Calcul au chargement/MAJ du profil
  useEffect(() => {
    calculateTotalReactions()
  }, [calculateTotalReactions])

  // Favorite toggle (local)
  useEffect(() => {
    if (!profile) return
    const favs = JSON.parse(localStorage.getItem('felora-favorites') || '[]')
    setIsFavorite(favs.includes(profile.id))
  }, [profile?.id])

  const handleFavoriteToggle = useCallback(() => {
    if (!profile) return
    const favs = JSON.parse(localStorage.getItem('felora-favorites') || '[]')
    if (favs.includes(profile.id)) {
      const next = favs.filter((x: string) => x !== profile.id)
      localStorage.setItem('felora-favorites', JSON.stringify(next))
      setIsFavorite(false)
    } else {
      const next = [...favs, profile.id]
      localStorage.setItem('felora-favorites', JSON.stringify(next))
      setIsFavorite(true)
    }
  }, [profile])

  const handleMediaSave = useCallback(async (index: number) => {
    const key = `media_save_club_${resolvedId}_${index}`
    const currentState = localStorage.getItem(key) === 'true'
    localStorage.setItem(key, (!currentState).toString())
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }, [resolvedId])

  // Pas de messagerie directe sur la page club

  const handleShare = useCallback((profileId: string) => {
    if (navigator.share) {
      navigator.share({
        title: profile?.name || 'Club Profile',
        text: `Check out ${profile?.name} on Felora`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }, [profile?.name])

  const handleReport = useCallback((profileId: string) => {
    router.push(`/report?type=club&id=${profileId}`)
  }, [router])

  // Get localStorage states (basic)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  // Availability (open/closed) computed from workingHours like "Thu-Sat: 22:00-04:00"
  const clubAvailability = React.useMemo(() => {
    if (!profile?.workingHours) return undefined

    const daysMap: Record<string, number> = {
      SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
      DIM: 0, LUN: 1, MAR: 2, MER: 3, JEU: 4, VEN: 5, SAM: 6
    }

    const now = new Date()
    const curDay = now.getDay() // 0 (Sun) - 6 (Sat)
    const curMin = now.getHours() * 60 + now.getMinutes()

    const str = profile.workingHours.trim()
    const m = str.match(/([A-Za-zÀ-ÿ]{3})\s*-\s*([A-Za-zÀ-ÿ]{3})\s*:\s*(\d{1,2})\s*:\s*(\d{2})\s*-\s*(\d{1,2})\s*:\s*(\d{2})/)
    let days: Set<number> | null = null
    let startMin = 0
    let endMin = 0

    if (m) {
      const d1 = daysMap[m[1].toUpperCase()] ?? null
      const d2 = daysMap[m[2].toUpperCase()] ?? null
      const h1 = parseInt(m[3], 10); const mm1 = parseInt(m[4], 10)
      const h2 = parseInt(m[5], 10); const mm2 = parseInt(m[6], 10)
      startMin = h1 * 60 + mm1
      endMin = h2 * 60 + mm2
      if (d1 !== null && d2 !== null) {
        days = new Set<number>()
        let i = d1
        while (true) {
          days.add(i)
          if (i === d2) break
          i = (i + 1) % 7
        }
      }
    } else {
      const m2 = str.match(/(\d{1,2})\s*:\s*(\d{2})\s*-\s*(\d{1,2})\s*:\s*(\d{2})/)
      if (m2) {
        const h1 = parseInt(m2[1], 10); const mm1 = parseInt(m2[2], 10)
        const h2 = parseInt(m2[3], 10); const mm2 = parseInt(m2[4], 10)
        startMin = h1 * 60 + mm1
        endMin = h2 * 60 + mm2
        days = new Set<number>([0,1,2,3,4,5,6])
      }
    }

    if (!days) return undefined

    const crossesMidnight = endMin <= startMin
    const prevDay = (curDay + 6) % 7

    let isOpen = false
    if (crossesMidnight) {
      isOpen = (days.has(curDay) && curMin >= startMin) || (days.has(prevDay) && curMin < endMin)
    } else {
      isOpen = days.has(curDay) && curMin >= startMin && curMin < endMin
    }

    const pad = (n: number) => n.toString().padStart(2, '0')
    function nextOpenString(): string {
      if (days!.has(curDay) && (!isOpen)) {
        if (!crossesMidnight && curMin < startMin) {
          return `Ouvre à ${pad(Math.floor(startMin/60))}:${pad(startMin%60)}`
        }
        if (crossesMidnight && curMin < startMin) {
          return `Ouvre à ${pad(Math.floor(startMin/60))}:${pad(startMin%60)}`
        }
      }
      for (let offset = 1; offset <= 7; offset++) {
        const d = (curDay + offset) % 7
        if (days!.has(d)) {
          return `Ouvre à ${pad(Math.floor(startMin/60))}:${pad(startMin%60)}`
        }
      }
      return 'Fermé'
    }

    return {
      available: isOpen,
      schedule: isOpen ? 'Ouvert' : nextOpenString()
    }
  }, [profile?.workingHours])

  useEffect(() => {
    if (!resolvedId) return
    
    setIsFollowing(localStorage.getItem(`follow_club_${resolvedId}`) === 'true')
    setIsLiked(localStorage.getItem(`like_club_${resolvedId}`) === 'true')
    setIsSaved(localStorage.getItem(`save_club_${resolvedId}`) === 'true')
  }, [resolvedId])

  // Render states
  if (loading) return <ProfileSkeleton />
  if (notFound) return <NotFound />
  if (error || !profile) return <ErrorFallback />

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Full-width hero (subtle colors) */}
        {/* Header style TikTok */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  try { (window as any)?.umami?.track?.('nav_back', { from: 'profile_test_club' }) } catch {}
                  router.back()
                }}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                title="Retour à la recherche"
              >
                <ArrowLeft size={24} className="text-white" />
              </button>
            </div>

            <div className="text-center">
              <h1 className="text-lg font-bold">{profile?.name || 'Club'}</h1>
            </div>

            {/* Placeholder to keep the title centered (align with left controls) */}
            <div className="w-10 h-10" />
          </div>
        </div>

        {/* Contenu principal avec padding-top pour header fixe + safe-area (~72px) */}
        <div className="relative w-full" style={{ paddingTop: 'calc(72px + env(safe-area-inset-top, 0px))' }}>
          <div className="relative w-full h-56 md:h-72 lg:h-80">
            <Image
              src={profile.avatar || profile.media?.[0]?.thumb || profile.media?.[0]?.url || '/icons/verified.svg'}
              alt={profile.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            {profile.premium && (
              <span className="px-2 py-1 text-xs font-semibold rounded-md text-white/95 border border-white/25"
                style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,107,157,0.25))' }}>
                👑 Premium
              </span>
            )}
          </div>

          {/* Avatar chevauchant le hero (moitié) */}
          <div className="absolute left-4 bottom-0 translate-y-1/2 z-10">
            <div
              className="w-24 h-24 md:w-28 md:h-28 rounded-full p-[3px]"
              style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.9), rgba(255,107,157,0.9))' }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={profile.avatar || profile.media?.[0]?.thumb || profile.media?.[0]?.url || '/icons/verified.svg'}
                  alt={profile.name}
                  fill
                  className="rounded-full object-cover"
                  sizes="(max-width: 768px) 6rem, 7rem"
                />
                <div className="absolute inset-0 rounded-full border-2 border-black/60 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Decorative separator */}
          <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, rgba(183,148,246,0.35), rgba(255,107,157,0.35), rgba(79,209,199,0.25))' }} />

          {/* Escort-style header section */}
          {/* Décaler (léger) pour que le titre ne soit plus masqué */}
          <section className="px-4 mt-[36px] md:mt-[48px]">
            {/* Tracker de vues en temps réel */}
            {/* Utilise le même système que la page escort */}
            <ProfileHeader
              name={profile.name}
              avatar={profile.avatar}
              verified={profile.verified}
              premium={profile.premium}
              online={true}
              languages={[]}
              services={profile.services}
              stats={{
                likes: totalReactions || 0,
                followers: profile.stats?.followers || 0,
                views: viewStats?.profileViews || profile.stats?.views || 0
              }}
              description={profile.description}
              availability={clubAvailability}
              mediaCount={Array.isArray(profile.media) ? profile.media.length : 0}
              showAvatar={false}
            />
            <ActionsBar
              profileId={profile.id}
              isFollowing={false}
              isLiked={false}
              isSaved={false}
              onShowDetails={() => setShowContact(true)}
              showGift={false}
              showMessage={false}
              primaryLabel="Contacter le club"
            />
          </section>

          {/* Les filles du club (horizontal, glass, scroll) */}
          {clubEscorts.length > 0 && (
            <section className="px-4 mt-4">
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-semibold text-base">Les filles du club</h2>
                  <span className="text-xs text-white/60">{clubEscorts.length}</span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1.5 [-ms-overflow-style:none] [scrollbar-width:none]" style={{ scrollbarWidth: 'none' }}>
                  {/* hide webkit scrollbar */}
                  <style jsx>{`
                    div::-webkit-scrollbar { display: none; }
                  `}</style>
                  {clubEscorts.map((e) => (
                    <a
                      key={e.id}
                      href={`/profile-test/escort/${e.id}`}
                      className="group w-28 sm:w-28 flex-shrink-0 text-center"
                      aria-label={`Voir le profil de ${e.name}`}
                    >
                      <div 
                        className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px]"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(168,85,247,0.95), rgba(255,107,157,0.9))',
                          boxShadow: '0 0 18px rgba(168,85,247,0.35), 0 0 10px rgba(255,107,157,0.25)'
                        }}
                      >
                        <span 
                          className="pointer-events-none absolute -inset-2 rounded-full blur-2xl opacity-50"
                          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.45), rgba(255,107,157,0.0) 60%)' }}
                        />
                        <div className="relative w-full h-full rounded-full overflow-hidden bg-black/50">
                          <Image 
                            src={e.avatar || '/icons/verified.svg'} 
                            alt={e.name} 
                            fill 
                            className="object-cover" 
                            sizes="(max-width: 768px) 30vw, 15vw" 
                          />
                        </div>
                      </div>
                      <div className="mt-1">
                        <div className="text-white text-xs sm:text-sm font-semibold truncate">{e.name}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Description déplacée dans le header (sous l'âge, au-dessus des langues) */}

          {/* Galerie enrichie (inspirée escort), sans privé */}
          <section className="px-4 mt-2">
            <MediaFeedWithGallery
              media={profile.media}
              profileId={profile.id}
              profileName={profile.name}
              userId={null}
              privateEnabled={false}
              onLike={() => Promise.resolve()}
              onSave={() => Promise.resolve()}
              onReactionChange={calculateTotalReactions}
              hideTabsHeader
            />
          </section>

          {/* Section verticale retirée (remplacée par carrousel horizontal) */}
          {/* Mobile layout (legacy) */}
          <div className="hidden">
            <div className="p-4 space-y-6">
              {/* Avatar rond + nom sous le hero */}
              <div className="-mt-10 flex flex-col items-center z-10">
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-full p-[3px]"
                    style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.8), rgba(255,107,157,0.8))' }}
                  >
                    <img
                      src={profile.avatar || profile.media?.[0]?.thumb || profile.media?.[0]?.url || '/icons/verified.svg'}
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover border-2 border-black/60"
                    />
                  </div>
                  {profile.verified && (
                    <span
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center bg-[#111827] border border-white/20 text-[#4FD1C7]"
                      title="Profil vérifié"
                    >
                      <BadgeCheck className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div className="mt-2 text-white font-semibold text-lg text-center">{profile.name}</div>
                {profile.city && (
                  <div className="text-xs text-white/70">{profile.city}</div>
                )}
              </div>
              {/* En-tête club (nom + services + contact condensé), sans langues ni cadeau/message */}
              <div className="glass-card rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white/85 mb-3" style={{
                  background: 'var(--grad-1)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'
                }}>Présentation</h2>
                {Array.isArray(profile.services) && profile.services.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {profile.services.slice(0, 8).map((s, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-xs bg-white/8 border border-white/12 text-gray-200">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Actions rapides (couleurs charte, glam discret) */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.contact?.phone && (
                    <a
                      href={`tel:${profile.contact.phone}`}
                      className="h-9 px-3 rounded-lg text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.22), rgba(255,107,157,0.22))', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      Appeler
                    </a>
                  )}
                  {profile.contact?.website && (
                    <a
                      href={profile.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-3 rounded-lg text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.22), rgba(255,107,157,0.22))', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      Site
                    </a>
                  )}
                  {profile.contact?.email && (
                    <a
                      href={`mailto:${profile.contact.email}`}
                      className="h-9 px-3 rounded-lg text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.22), rgba(255,107,157,0.22))', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      Email
                    </a>
                  )}
                  {profile.location?.coordinates && Number.isFinite(profile.location.coordinates.lat) && Number.isFinite(profile.location.coordinates.lng) && (
                    <a
                      href={`https://www.google.com/maps?q=${profile.location.coordinates.lat},${profile.location.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-3 rounded-lg text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.22), rgba(255,107,157,0.22))', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      Itinéraire
                    </a>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-300">
                  {profile.location?.address && (
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                      <span>{profile.location.address}</span>
                    </div>
                  )}
                  {profile.contact?.phone && (
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      <a href={`tel:${profile.contact.phone}`} className="hover:underline">{profile.contact.phone}</a>
                    </div>
                  )}
                  {profile.contact?.website && (
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/></svg>
                      <a href={profile.contact.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{profile.contact.website.replace(/^https?:\/\//, '')}</a>
                    </div>
                  )}
                  {profile.contact?.email && (
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>
                      <a href={`mailto:${profile.contact.email}`} className="hover:underline">{profile.contact.email}</a>
                    </div>
                  )}
                  {profile.workingHours && (
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      <span>{profile.workingHours}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* About au-dessus des photos */}
              <AboutSection description={profile.description} />

              <MediaFeedWithGallery
                media={profile.media}
                profileId={profile.id}
                profileName={profile.name}
                userId={null}
                privateEnabled={false}
                onLike={() => Promise.resolve()}
                onSave={handleMediaSave}
                onReactionChange={calculateTotalReactions}
                hideTabsHeader
              />

              {/* Section Les filles (escortes associées) */}
              {clubEscorts.length > 0 && (
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-base">Les filles du club</h3>
                    <span className="text-xs text-white/60">{clubEscorts.length}</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                    {clubEscorts.map((e) => (
                      <a key={e.id} href={`/profile-test/escort/${e.id}`} className="group block text-center">
                        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px]"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(168,85,247,0.95), rgba(255,107,157,0.9))',
                            boxShadow: '0 0 22px rgba(168,85,247,0.35), 0 0 12px rgba(255,107,157,0.25)'
                          }}
                        >
                          {/* Glow d’arrière-plan */}
                          <span 
                            className="pointer-events-none absolute -inset-2 rounded-full blur-2xl opacity-50"
                            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.45), rgba(255,107,157,0.0) 60%)' }}
                          />
                          <div className="relative w-full h-full rounded-full overflow-hidden bg-black/50">
                            <Image 
                              src={e.avatar || '/icons/verified.svg'} 
                              alt={e.name} 
                              fill 
                              className="object-cover" 
                              sizes="(max-width: 768px) 30vw, 15vw" 
                            />
                          </div>
                        </div>
                        <div className="mt-1">
                          <div className="text-white text-sm sm:text-base font-semibold truncate">{e.name}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop layout (legacy) */}
          <div className="hidden">
            {/* Left column - header + about + infos */}
            <div className="w-1/2 p-6 space-y-6 overflow-y-auto">
              {/* Avatar rond + nom sous le hero (desktop) */}
              <div className="-mt-14 flex flex-col items-center z-10">
                <div className="relative">
                  <div
                    className="w-28 h-28 rounded-full p-[3px]"
                    style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.8), rgba(255,107,157,0.8))' }}
                  >
                    <img
                      src={profile.avatar || profile.media?.[0]?.thumb || profile.media?.[0]?.url || '/icons/verified.svg'}
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover border-2 border-black/60"
                    />
                  </div>
                  {profile.verified && (
                    <span
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center bg-[#111827] border border-white/20 text-[#4FD1C7]"
                      title="Profil vérifié"
                    >
                      <BadgeCheck className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div className="mt-2 text-white font-semibold text-lg text-center">{profile.name}</div>
                {profile.city && (
                  <div className="text-xs text-white/70">{profile.city}</div>
                )}
              </div>
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-white/85 mb-3" style={{
                  background: 'var(--grad-1)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'
                }}>Présentation</h2>
                {Array.isArray(profile.services) && profile.services.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {profile.services.slice(0, 12).map((s, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-xs bg-white/8 border border-white/12 text-gray-200">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Actions rapides (couleurs charte, glam discret) */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.contact?.phone && (
                    <a
                      href={`tel:${profile.contact.phone}`}
                      className="h-9 px-3 rounded-lg text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.22), rgba(255,107,157,0.22))', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      Appeler
                    </a>
                  )}
                  {profile.contact?.website && (
                    <a
                      href={profile.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-3 rounded-lg text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.22), rgba(255,107,157,0.22))', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      Site
                    </a>
                  )}
                  {profile.contact?.email && (
                    <a
                      href={`mailto:${profile.contact.email}`}
                      className="h-9 px-3 rounded-lg text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.22), rgba(255,107,157,0.22))', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      Email
                    </a>
                  )}
                  {profile.location?.coordinates && Number.isFinite(profile.location.coordinates.lat) && Number.isFinite(profile.location.coordinates.lng) && (
                    <a
                      href={`https://www.google.com/maps?q=${profile.location.coordinates.lat},${profile.location.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-3 rounded-lg text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, rgba(183,148,246,0.22), rgba(255,107,157,0.22))', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      Itinéraire
                    </a>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-300">
                  {profile.location?.address && (
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                      <span>{profile.location.address}</span>
                    </div>
                  )}
                  {profile.contact?.phone && (
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      <a href={`tel:${profile.contact.phone}`} className="hover:underline">{profile.contact.phone}</a>
                    </div>
                  )}
                  {profile.contact?.website && (
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/></svg>
                      <a href={profile.contact.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{profile.contact.website.replace(/^https?:\/\//, '')}</a>
                    </div>
                  )}
                  {profile.contact?.email && (
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>
                      <a href={`mailto:${profile.contact.email}`} className="hover:underline">{profile.contact.email}</a>
                    </div>
                  )}
                  {profile.workingHours && (
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      <span>{profile.workingHours}</span>
                    </div>
                  )}
                </div>
              </div>

              <AboutSection description={profile.description} />

              {/* Details déjà couverts par l'InfoGrid en haut */}
            </div>

            {/* Right column - Media feed */}
            <div className="w-1/2 p-6">
              <div className="sticky top-6 h-[calc(100vh-3rem)] overflow-hidden">
              <MediaFeedWithGallery
                  media={profile.media}
                  profileId={profile.id}
                  profileName={profile.name}
                  userId={null}
                  privateEnabled={false}
                  onLike={() => Promise.resolve()}
                  onSave={handleMediaSave}
                  onReactionChange={calculateTotalReactions}
                  className="h-full overflow-y-auto"
                  hideTabsHeader
                />
                {/* Section Les filles (escortes associées) - desktop */}
                {clubEscorts.length > 0 && (
                  <div className="mt-6 glass-card rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold text-base">Les filles du club</h3>
                      <span className="text-xs text-white/60">{clubEscorts.length}</span>
                    </div>
                <div className="grid grid-cols-4 gap-1">
                  {clubEscorts.map((e) => (
                    <a key={e.id} href={`/profile-test/escort/${e.id}`} className="group block text-center" aria-label={`Voir le profil de ${e.name}`}>
                      <div 
                        className="relative mx-auto w-20 h-20 md:w-24 md:h-24 rounded-full p-[3px]"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(168,85,247,0.95), rgba(255,107,157,0.9))',
                          boxShadow: '0 0 22px rgba(168,85,247,0.35), 0 0 12px rgba(255,107,157,0.25)'
                        }}
                      >
                        {/* Glow d’arrière-plan */}
                        <span 
                          className="pointer-events-none absolute -inset-2 rounded-full blur-2xl opacity-50"
                          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.45), rgba(255,107,157,0.0) 60%)' }}
                        />
                        <div className="relative w-full h-full rounded-full overflow-hidden bg-black/50">
                          <Image 
                            src={e.avatar || '/icons/verified.svg'} 
                            alt={e.name} 
                            fill 
                            className="object-cover" 
                            sizes="(max-width: 1280px) 20vw, 10vw" 
                          />
                        </div>
                      </div>
                      <div className="mt-1">
                        <div className="text-white text-sm md:text-base font-semibold truncate">{e.name}</div>
                      </div>
                    </a>
                  ))}
                </div>
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>
    </div>

      {/* Contact Sheet (bottom) */}
      {showContact && profile && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setShowContact(false) }} className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-base">Contact</h3>
              <button onClick={() => setShowContact(false)} className="w-8 h-8 rounded-lg bg-white/10 text-white">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              {/* Adresse complète cliquable (ouvre la carte du téléphone) */}
              {profile.location?.address && (
                <button
                  onClick={() => {
                    const addr = profile.location!.address!
                    const lat = profile.location?.coordinates?.lat
                    const lng = profile.location?.coordinates?.lng
                    const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent)
                    const url = isApple
                      ? lat && lng
                        ? `http://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(addr)}`
                        : `http://maps.apple.com/?q=${encodeURIComponent(addr)}`
                      : lat && lng
                        ? `https://maps.google.com/?q=${lat},${lng}`
                        : `https://maps.google.com/?q=${encodeURIComponent(addr)}`
                    window.open(url, '_blank')
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-left"
                >
                  <span>📍 {profile.location.address}</span>
                  <span className="text-white/60">Ouvrir la carte</span>
                </button>
              )}
              {profile.contact?.phone && (
                <a href={`tel:${profile.contact.phone}`} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white">
                  <span>📞 {profile.contact.phone}</span>
                  <span className="text-white/60">Appeler</span>
                </a>
              )}
              {profile.contact?.email && (
                <a href={`mailto:${profile.contact.email}`} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white">
                  <span>✉️ {profile.contact.email}</span>
                  <span className="text-white/60">Écrire</span>
                </a>
              )}
              {profile.contact?.website && (
                <a href={profile.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white">
                  <span>🌐 {profile.contact.website.replace(/^https?:\/\//, '')}</span>
                  <span className="text-white/60">Ouvrir</span>
                </a>
              )}
              {profile.workingHours && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white">
                  <span>🕐 {profile.workingHours}</span>
                  <span className="text-white/60">Horaires</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  )
}
