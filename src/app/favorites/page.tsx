'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Heart, ArrowLeft } from 'lucide-react'
import ImprovedProfileCard from '@/components/ImprovedProfileCard'
import { FAVORITES_EVENT, readFavoriteIds } from '@/lib/favorites'

interface FavoriteSummary {
  id: string
  name: string
  media: string
  location: string
  rating: number
  reviews: number
  likes: number
  verified?: boolean
  premium?: boolean
  age?: number
  type?: 'escort' | 'salon'
}

const PLACEHOLDER_MEDIA = '/placeholder-avatar.jpg'

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [profiles, setProfiles] = useState<FavoriteSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const syncFavorites = useCallback(() => {
    setFavoriteIds(readFavoriteIds())
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    syncFavorites()

    const handleStorage = () => syncFavorites()
    window.addEventListener('storage', handleStorage)
    window.addEventListener(FAVORITES_EVENT, handleStorage as EventListener)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(FAVORITES_EVENT, handleStorage as EventListener)
    }
  }, [syncFavorites])

  useEffect(() => {
    if (!session?.user?.id) return
    if (favoriteIds.length === 0) {
      setProfiles([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    const fetchProfiles = async () => {
      setLoading(true)
      setError(null)
      try {
        const results = await Promise.all(
          favoriteIds.map(async (id) => {
            try {
              const res = await fetch(`/api/public/profile/${id}`)
              if (!res.ok) throw new Error('profile_not_found')
              const data = await res.json()
              return mapProfileSummary(data)
            } catch (err) {
              console.warn('Impossible de charger le favori', id, err)
              return null
            }
          })
        )
        if (!cancelled) {
          setProfiles(results.filter(Boolean) as FavoriteSummary[])
        }
      } catch (err) {
        if (!cancelled) {
          setError('Impossible de charger vos favoris pour le moment.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchProfiles()
    return () => {
      cancelled = true
    }
  }, [favoriteIds, session])

  const emptyState = useMemo(() => favoriteIds.length === 0 && !loading, [favoriteIds.length, loading])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/80" />
      </div>
    )
  }

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-[#050505] text-white px-4 py-12">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-white/5 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Mes favoris</h1>
          <p className="text-white/70 text-sm">
            Connectez-vous pour enregistrer vos profils préférés et les retrouver facilement.
          </p>
          <button
            onClick={() => router.push('/login?callbackUrl=/favorites')}
            className="mt-2 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050505] to-[#050505] text-white pb-16">
      <header className="sticky top-0 z-20 bg-black/70 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Retour</span>
          </button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-semibold">Mes favoris</h1>
            <p className="text-xs text-white/50">
              {favoriteIds.length} profil{favoriteIds.length > 1 ? 's' : ''} enregistré{favoriteIds.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 text-white/60 text-sm mb-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement de vos favoris...
          </div>
        )}

        {emptyState ? (
          <div className="mt-16 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white/70" />
            </div>
            <h2 className="text-xl font-semibold">Aucun favori pour l’instant</h2>
            <p className="text-white/60 text-sm max-w-sm mx-auto">
              Ajoutez des escorts ou clubs à vos favoris depuis leur profil pour les retrouver rapidement ici.
            </p>
            <button
              onClick={() => router.push('/search')}
              className="mt-2 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Découvrir des profils
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {profiles.map((profile) => (
              <ImprovedProfileCard
                key={profile.id}
                profile={profile}
                onProfileClick={(id) => router.push(`/profile/${id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function mapProfileSummary(data: any): FavoriteSummary {
  const profile = data?.profile || data
  const mediaList = Array.isArray(profile?.media) ? profile.media : []
  const firstMedia = mediaList.find((m: any) => m?.type !== 'video')?.url || mediaList[0]?.url
  const galleryItem = Array.isArray(profile?.galleryPhotos) ? profile.galleryPhotos[0]?.url : null
  const avatar = profile?.profilePhoto || profile?.avatar || profile?.cover || profile?.avatarUrl

  return {
    id: profile?.id,
    name: profile?.stageName || profile?.name || 'Profil Felora',
    media: firstMedia || galleryItem || avatar || PLACEHOLDER_MEDIA,
    location: profile?.city || profile?.canton || profile?.location || 'Localisation privée',
    rating: profile?.rating || profile?.stats?.rating || 4.8,
    reviews: profile?.reviewCount || profile?.stats?.views || 0,
    likes: profile?.stats?.likes || profile?.likes || 0,
    verified: profile?.isVerifiedBadge || profile?.verified,
    premium: profile?.premium || profile?.isPremium,
    age: profile?.age,
    type: profile?.ownerType === 'CLUB' ? 'salon' : 'escort'
  }
}

