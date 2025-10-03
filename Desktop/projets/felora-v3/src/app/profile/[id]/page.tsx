'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Heart, User, Eye } from 'lucide-react'
import Image from 'next/image'

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
    description?: string
    visibility?: string
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
  const [activeTab, setActiveTab] = useState<'public' | 'premium' | 'private'>('public')
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

        const response = await fetch(`/api/profile/unified/${resolvedId}`, { signal: controller.signal })

        if (isCancelled) return

        if (response.status === 404) {
          setNotFound(true)
          return
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        // L'API unified retourne { success, mode, profile }
        const profileData = data.profile || data

        // Transform API data to match EscortProfile interface
        const transformedProfile: EscortProfile = {
          id: profileData.id,
          name: profileData.stageName || 'Escort',
          stageName: profileData.stageName,
          avatar: profileData.medias?.[0]?.url || profileData.profilePhoto,
          city: profileData.city,
          age: profileData.age,
          languages: profileData.languages || [],
          services: profileData.services || [],
          media: profileData.medias || [],
          verified: profileData.isVerifiedBadge,
          premium: false,
          online: false,
          description: profileData.description,
          stats: { likes: 0, views: 0, followers: 0 },
          rates: {
            hour: profileData.rates?.oneHour,
            twoHours: profileData.rates?.twoHours,
            overnight: profileData.rates?.overnight
          },
          availability: {
            available: true,
            incall: true,
            outcall: true
          }
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

  // Action handlers
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

  // Render states
  if (loading) return <ProfileSkeleton />
  if (notFound) return <ErrorFallback />
  if (error || !profile) return <ErrorFallback />

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* TikTok Style Profile */}
      <div className="max-w-2xl mx-auto p-4">

        {/* Header avec Avatar + Infos */}
        <header className="w-full">
          <div className="flex w-full items-start justify-between">
            <div className="flex flex-1 items-center">

              {/* Avatar */}
              <div className="h-16 w-16 xs:h-20 xs:w-20 sm:h-28 sm:w-28 rounded-full overflow-hidden bg-gray-200">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              <div className="ml-2 xs:ml-4">
                {/* Nom */}
                <h2 className="text-base font-extrabold leading-4 xs:text-xl xs:leading-5 sm:text-2xl sm:leading-6">
                  {profile.name}
                </h2>

                {/* Username */}
                <p className="text-sm text-gray-600 dark:text-gray-200 xs:text-base sm:text-lg">
                  @{profile.name?.toLowerCase().replace(/\s+/g, '')}
                </p>

                {/* Bouton Message */}
                <button
                  onClick={() => handleMessage(profile.id)}
                  className="mt-1 xs:mt-2 sm:mt-3 w-28 xs:w-40 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm xs:text-base font-semibold rounded-md transition-colors"
                >
                  Message
                </button>
              </div>
            </div>

            {/* Bouton Share */}
            <button
              onClick={handleShare}
              className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Partager le profil"
            >
              ✨
            </button>
          </div>

          {/* Stats TikTok Style */}
          <div className="mt-5 flex flex-wrap gap-4 xs:gap-x-6 text-sm text-gray-600 dark:text-gray-300">
            <p>
              <span className="mr-1 text-base font-bold text-black dark:text-white">
                {profile.stats?.followers || 0}
              </span>
              Followers
            </p>
            <p>
              <span className="mr-1 text-base font-bold text-black dark:text-white">
                {profile.stats?.views || 0}
              </span>
              Views
            </p>
            <p>
              <span className="mr-1 text-base font-bold text-black dark:text-white">
                {profile.stats?.likes || 0}
              </span>
              Likes
            </p>
          </div>

          {/* Bio */}
          <div className="mt-3 border-l-[3px] border-l-pink-500 p-2 text-sm text-gray-700 dark:text-gray-300">
            {profile.description || 'Pas de bio pour le moment.'}
            {profile.city && (
              <div className="mt-1 text-xs text-gray-500">
                📍 {profile.city}
              </div>
            )}
          </div>
        </header>

        {/* Onglets */}
        <div className="mt-6">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('public')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'public'
                  ? 'border-b-2 border-pink-500 text-pink-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setActiveTab('premium')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'premium'
                  ? 'border-b-2 border-pink-500 text-pink-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Premium 👑
            </button>
            {session?.user?.id === resolvedId && (
              <button
                onClick={() => setActiveTab('private')}
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === 'private'
                    ? 'border-b-2 border-pink-500 text-pink-500'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Privé 🔒
              </button>
            )}
          </div>

          {/* Grille des médias filtrés */}
          <div className="mt-4 grid place-items-center gap-x-3 gap-y-5 pb-4 xs:grid-cols-auto-fill-180 xs:place-items-stretch">
            {profile.media && profile.media.filter(item => {
              // Filtrer selon l'onglet actif et la visibilité
              const visibility = item.visibility || 'PUBLIC'
              if (activeTab === 'public') return visibility === 'PUBLIC'
              if (activeTab === 'premium') return visibility === 'PREMIUM'
              if (activeTab === 'private') return visibility === 'PRIVATE'
              return false
            }).length > 0 ? (
              profile.media.filter(item => {
                const visibility = item.visibility || 'PUBLIC'
                if (activeTab === 'public') return visibility === 'PUBLIC'
                if (activeTab === 'premium') return visibility === 'PREMIUM'
                if (activeTab === 'private') return visibility === 'PRIVATE'
                return false
              }).map((item, index) => {
                const isPremium = (item.visibility || 'PUBLIC') === 'PREMIUM'
                const isOwner = session?.user?.id === resolvedId

                return (
                  <div key={index} className="flex w-52 flex-col items-center xs:w-auto">
                    <div className="relative flex h-[290px] w-52 items-center justify-center overflow-hidden rounded-md bg-black xs:h-[250px] xs:w-auto">
                      {item.type === 'video' ? (
                        <video
                          src={item.url}
                          className={`w-full h-full object-cover ${isPremium && !isOwner ? 'blur-xl' : ''}`}
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt="Media"
                          className={`w-full h-full object-cover ${isPremium && !isOwner ? 'blur-xl' : ''}`}
                        />
                      )}

                      {/* Badge Premium avec prix */}
                      {isPremium && !isOwner && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                          <div className="text-white text-center">
                            <div className="text-4xl mb-2">👑</div>
                            <div className="text-lg font-bold">{item.price ? `${item.price} CHF` : 'Premium'}</div>
                            <div className="text-sm opacity-80 mt-1">Contenu Premium</div>
                            <button className="mt-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-sm font-semibold hover:scale-105 transition-transform">
                              Déverrouiller
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 flex w-full items-center p-2 py-3 text-sm text-white bg-black bg-opacity-50">
                        <Heart size={18} className="mr-1" fill="white" />
                        {Math.floor(Math.random() * 1000)}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                {activeTab === 'public' && 'Aucun média public'}
                {activeTab === 'premium' && 'Aucun média premium'}
                {activeTab === 'private' && 'Aucun média privé'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}