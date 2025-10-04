'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Eye, 
  MessageSquare, 
  Heart, 
  Play,
  Plus,
  Home,
  Search,
  User,
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Flame,
  Smile
} from 'lucide-react'

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
  const [profile, setProfile] = useState<ClubProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public')
  const [totalReactions, setTotalReactions] = useState(0)
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: string; index: number } | null>(null)
  const [showModal, setShowModal] = useState<'en-savoir-plus' | 'agenda' | 'contact' | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [mediaReactions, setMediaReactions] = useState<{[key: string]: {total: number, userReactions: string[]}}>({})
  const [showFullDescription, setShowFullDescription] = useState(false)
  
  // Fonction pour déterminer si le texte dépasse 4 lignes
  const shouldShowToggle = useCallback((text: string) => {
    // Estimation : environ 50 caractères par ligne pour cette taille de police et largeur
    // Avec une largeur max-w-xs (max-width: 20rem = 320px), on peut estimer ~60 caractères par ligne
    // 4 lignes = ~240 caractères
    return text && text.length > 240
  }, [])
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

  // Fonction pour ouvrir un média
  const handleMediaClick = (media: any, index: number) => {
    setSelectedMedia({
      url: media.url,
      type: media.type,
      index
    })
  }

  // Fonctions pour les modals
  const handleEnSavoirPlus = () => {
    setShowModal('en-savoir-plus')
  }

  const handleAgenda = () => {
    setShowModal('agenda')
  }

  const handleContact = () => {
    setShowModal('contact')
  }

  const closeModal = () => {
    setShowModal(null)
  }

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      // Recharger les données du profil
      const response = await fetch(`/api/profile-test/club/${resolvedId}?cache_bust=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        if (data?.data) {
          setProfile(data.data)
        }
      }
    } catch (error) {
      console.error('Erreur lors du refresh:', error)
    } finally {
      setRefreshing(false)
    }
  }, [resolvedId])

  // Fonction pour gérer les réactions sur les médias
  const handleMediaReaction = useCallback(async (mediaUrl: string, reactionType: string) => {
    try {
      const response = await fetch('/api/reactions/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl,
          reactionType,
          ownerType: 'CLUB',
          ownerId: profile?.id
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Mettre à jour l'état local des réactions
        setMediaReactions(prev => ({
          ...prev,
          [mediaUrl]: {
            total: data.total || 0,
            userReactions: data.userReactions || []
          }
        }))
      }
    } catch (error) {
      console.error('Erreur lors de la réaction:', error)
    }
  }, [profile?.id])

  // Fonction pour obtenir les réactions d'un média
  const getMediaReactions = useCallback((mediaUrl: string) => {
    return mediaReactions[mediaUrl] || { total: 0, userReactions: [] }
  }, [mediaReactions])

  // Render states
  if (loading) return <ProfileSkeleton />
  if (notFound) return <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-white">Club Not Found</div>
  if (error || !profile) return <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-white">Error Loading Profile</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111318] to-[#0B0B0B] relative overflow-hidden">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJub2lzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIwLjkiIG51bU9jdGF2ZXM9IjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+')] pointer-events-none" />
      
      {/* 1) BARRE SUPÉRIEURE */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center justify-between p-4 h-14">
              <button
            onClick={() => router.back()}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
            aria-label="Retour"
              >
            <ArrowLeft size={24} className="text-[#A1A5B0]" />
              </button>

            <div className="text-center">
            <h1 className="text-[14px] leading-5 text-[#A1A5B0] font-medium">
              {profile?.name || 'Club'}
            </h1>
            </div>

          <button className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
            <MoreHorizontal size={22} className="text-[#EAECEF] opacity-80" />
          </button>
          </div>
        </div>

      {/* 2) CARTE HEADER PROFIL - Design moderne 2025 */}
      <div className="relative mx-4 mt-24 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] shadow-lg">
        {/* Badge type discret en haut à droite */}
        <div className="absolute top-4 right-4">
          <div className="px-2 py-1 rounded-full bg-[#4FD1C7]/10 border border-[#4FD1C7]/20 text-[#4FD1C7] text-[11px] font-medium">
            {profile.establishmentType === 'institut_massage' ? 'INSTITUT' :
             profile.establishmentType === 'agence_escorte' ? 'AGENCE' :
             profile.establishmentType === 'salon_erotique' ? 'SALON' :
             'CLUB'}
          </div>
        </div>
        
        {/* Avatar moderne et net */}
        <div className="flex justify-center -mt-6 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#404040] bg-[#2A2A2A]">
              <Image
                src={profile.avatar || profile.media?.[0]?.url || '/icons/verified.svg'}
                alt={profile.name}
                width={76}
                height={76}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-4 pt-1 text-center">
          {/* Nom avec typo premium */}
          <h1 className="text-[20px] leading-5 text-white/90 font-semibold font-inter">{profile.name}</h1>
          
          {/* Bio avec typo moderne */}
          <div className="mt-2 text-[13px] leading-4 text-[#CCCCCC] max-w-xs mx-auto">
            {profile.description ? (
              <div>
                <p 
                  className={`transition-all duration-300 ${showFullDescription ? '' : 'line-clamp-4'}`}
                >
                  {profile.description}
                </p>
                {shouldShowToggle(profile.description) && (
                <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-1 text-[#4FD1C7] text-[12px] font-medium hover:text-[#4FD1C7]/80 transition-colors duration-200 flex items-center gap-1 mx-auto"
                  >
                    {showFullDescription ? (
                      <>
                        <span>Voir moins</span>
                        <ArrowLeft className="w-3 h-3 rotate-90" />
                      </>
                    ) : (
                      <>
                        <span>Voir plus</span>
                        <ArrowLeft className="w-3 h-3 -rotate-90" />
                      </>
                    )}
                </button>
                )}
              </div>
            ) : (
              <p>Club premium</p>
            )}
            </div>
          
          {/* Stats avec design moderne */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-[16px] text-white font-semibold">
                {profile.stats?.views || 0}
              </div>
              <div className="text-[11px] text-[#999999]">Vues</div>
            </div>
            <div className="space-y-1">
              <div className="text-[16px] text-white font-semibold">
                {profile.stats?.likes || 0}
              </div>
              <div className="text-[11px] text-[#999999]">Likes</div>
            </div>
            <div className="space-y-1">
              <div className="text-[16px] text-white font-semibold">
                {profile.media?.length || 0}
              </div>
              <div className="text-[11px] text-[#999999]">Publications</div>
            </div>
          </div>

          {/* Séparateur moderne */}
          <div className="mt-3 w-full h-[1px] bg-[#404040]"></div>
          
          {/* Site web sous le trait turquoise */}
                  {profile.contact?.website && (
            <div className="mt-4 text-center">
                    <a
                href={profile.contact.website.startsWith('http') ? profile.contact.website : `https://${profile.contact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                className="text-[#4FD1C7] text-[13px] font-inter hover:text-[#4FD1C7]/80 transition-colors duration-200"
              >
                {profile.contact.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          {/* 3) BOUTONS ACTIONS - Design moderne */}
          <div className="mt-5 flex flex-col gap-3">
            {/* Bouton CTA principal avec glow externe */}
                <button
              onClick={handleEnSavoirPlus}
              className="h-10 rounded-lg text-[#0B0B0B] font-bold shadow-[0_0_25px_rgba(255,107,157,0.6)] [background:linear-gradient(135deg,#FF6B9D,#B794F6)] hover:shadow-[0_0_35px_rgba(255,107,157,0.8)] hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
                >
              <span className="relative z-10">En savoir plus</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </button>
            
            {/* Boutons secondaires modernes */}
            <div className="grid grid-cols-2 gap-3">
                <button
                onClick={handleAgenda}
                className="h-9 rounded-lg border border-[#404040] bg-[#2A2A2A] text-[#CCCCCC] hover:bg-[#333333] hover:border-[#555555] hover:text-white transition-all duration-200 text-[13px]"
                >
                  Agenda
                </button>
                <button
                onClick={handleContact}
                className="h-9 rounded-lg border border-[#404040] bg-[#2A2A2A] text-[#CCCCCC] hover:bg-[#333333] hover:border-[#555555] hover:text-white transition-all duration-200 text-[13px]"
                >
                  Contact
                </button>
                </div>
                    </div>
                    </div>
                    </div>

      {/* 4) TABS (Public / Privé) - Design moderne */}
      <nav className="sticky top-14 z-10 bg-[#1A1A1A] px-4 py-4 flex gap-8 mt-6 border-b border-[#404040]">
        <button 
          onClick={() => setActiveTab('public')}
          className={`px-4 py-3 text-[14px] leading-5 relative transition-all duration-300 font-inter ${
            activeTab === 'public' 
              ? 'text-white font-medium' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          Public
          {activeTab === 'public' && (
            <span className="absolute left-1/2 -bottom-2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-white" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('private')}
          className={`px-4 py-3 text-[14px] leading-5 relative transition-all duration-300 font-inter ${
            activeTab === 'private' 
              ? 'text-white font-medium' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          Privé
          {activeTab === 'private' && (
            <span className="absolute left-1/2 -bottom-2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-white" />
          )}
        </button>
      </nav>

      {/* 5) GRID MÉDIAS (2 colonnes) */}
      <div className="px-4 py-4 pb-24">
        {profile.media && profile.media.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {profile.media.map((media, index) => (
              <article key={index} className="relative aspect-[9/16] overflow-hidden rounded-lg group cursor-pointer hover:scale-[1.01] transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-4 border border-[#404040] hover:border-[#666666] hover:shadow-lg" style={{ animationDelay: `${index * 100}ms` }} onClick={() => handleMediaClick(media, index)}>
                {media.type === 'video' ? (
                  <video 
                    src={media.url} 
                    poster={media.poster}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                            <Image 
                    src={media.url}
                    alt={`Media ${index + 1}`}
                              fill 
                              className="object-cover" 
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                )}
                
                {/* Overlay top */}
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/55 to-transparent" />
                
                {/* Views counter */}
                <div className="absolute right-2 top-2 flex items-center gap-1 text-white/90 text-[12px]">
                  <Eye className="h-4 w-4" />
                  <span>{Math.floor(Math.random() * 500) + 50}</span>
          </div>

                {/* Play button for videos - Design luxueux */}
                {media.type === 'video' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMediaClick(media, index)
                    }}
                    className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-sm p-[3px] bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] shadow-[0_0_25px_rgba(255,107,157,0.6)] flex items-center justify-center hover:scale-110 hover:shadow-[0_0_35px_rgba(255,107,157,0.8)] transition-all duration-300"
                  >
                    <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="h-5 w-5 text-white ml-0.5 drop-shadow-lg" />
                  </div>
                  </button>
                )}
                
                {/* Overlay bottom */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
                
                {/* Metrics row */}
                <div className="absolute left-2 bottom-2 flex items-center gap-3 text-white/90 text-[12px]">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: Implémenter le système de réactions
                      console.log('React media:', media.url)
                    }}
                    className="flex items-center gap-1 hover:scale-110 transition-transform duration-200"
                  >
                    <Heart className="h-4 w-4 hover:text-[#FF6B9D] transition-colors duration-200" />
                    {Math.floor(Math.random() * 200) + 20}
                  </button>
                </div>
                
                {/* Visibility badge - Design premium */}
                <span className="absolute right-2 bottom-2 rounded-full bg-[#FF6B9D]/20 backdrop-blur-sm border border-[#FF6B9D]/30 px-2 py-0.5 text-[11px] text-white font-medium shadow-[0_0_8px_rgba(255,107,157,0.3)]">
                  Public
                </span>
              </article>
                      ))}
                    </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-[#A1A5B0] text-lg mb-2">Aucun média disponible</div>
            <div className="text-[#A1A5B0] text-sm">Ce club n'a pas encore publié de contenu</div>
                  </div>
                )}
                </div>

      {/* 6) BOTTOM-NAV - Design luxueux */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-18 bg-[#111318]/95 backdrop-blur-xl border-t border-white/[0.05] flex items-center justify-around px-4"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <button 
          onClick={() => router.push('/')}
          className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-xl transition-all duration-300"
        >
          <Home size={24} className="text-[#FF6B9D] hover:scale-110 transition-all duration-300" />
          <span className="text-xs text-[#A1A5B0]/60 font-inter">Accueil</span>
        </button>
        
        <button 
          onClick={() => router.push('/search')}
          className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-xl transition-all duration-300"
        >
          <Search size={24} className="text-white/70 hover:text-white hover:scale-110 transition-all duration-300" />
          <span className="text-xs text-[#A1A5B0]/60 font-inter">Recherche</span>
        </button>
        
        {/* FAB "+" central luxueux */}
        <button 
          onClick={() => router.push('/test-media-simple')}
          className="relative w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] shadow-[0_0_30px_rgba(255,107,157,0.6)] flex items-center justify-center hover:shadow-[0_0_40px_rgba(255,107,157,0.8)] hover:scale-110 transition-all duration-300 group"
        >
          {/* Anneau de focus turquoise */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4FD1C7]/20 to-[#4FD1C7]/20 blur-lg scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus size={28} className="text-white relative z-10 drop-shadow-lg" />
        </button>
        
        <button 
          onClick={() => router.push('/messages')}
          className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-xl transition-all duration-300"
        >
          <MessageSquare size={24} className="text-white/70 hover:text-white hover:scale-110 transition-all duration-300" />
          <span className="text-xs text-[#A1A5B0]/60 font-inter">Messages</span>
        </button>
        
        <button 
          onClick={() => router.push('/profile')}
          className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-xl transition-all duration-300"
        >
          <User size={24} className="text-white/70 hover:text-white hover:scale-110 transition-all duration-300" />
          <span className="text-xs text-[#A1A5B0]/60 font-inter">Profil</span>
        </button>
            </div>

      {/* Modal pour afficher le média en plein écran */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center" onClick={() => {
          setSelectedMedia(null)
          setShowReactions(false)
        }}>
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
            <button 
              onClick={() => {
                setSelectedMedia(null)
                setShowReactions(false)
              }}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors duration-200"
            >
              <X size={24} />
            </button>
            
            {selectedMedia.type === 'video' ? (
              <video 
                src={selectedMedia.url}
                controls
                autoPlay
                className="w-full h-full max-h-[90vh] object-contain rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
                          <Image 
                src={selectedMedia.url}
                alt={`Media ${selectedMedia.index + 1}`}
                width={800}
                height={1200}
                className="w-full h-full max-h-[90vh] object-contain rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              )}

            {/* Barre de réactions en bas */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowReactions(!showReactions)
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition backdrop-blur-sm bg-white/10 text-white/90 border-white/15 hover:bg-white/15"
                >
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-medium">{getMediaReactions(selectedMedia.url).total}</span>
                </button>
                
                {showReactions && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 -top-12 flex gap-1.5 p-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 shadow-xl">
                    {[
                      { emoji: '💖', type: 'LOVE' },
                      { emoji: '🔥', type: 'FIRE' },
                      { emoji: '😮', type: 'WOW' },
                      { emoji: '🙂', type: 'SMILE' },
                    ].map((reaction) => (
                      <button
                        key={reaction.type}
                        onClick={async (e) => {
                          e.stopPropagation()
                          await handleMediaReaction(selectedMedia.url, reaction.type)
                          setShowReactions(false)
                        }}
                        className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 text-base hover:scale-110 transition-transform"
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>
      )}

      {/* Modals pour les boutons d'action */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center" onClick={closeModal}>
          <div className="relative max-w-md w-full mx-4 bg-[#14171D]/95 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)]" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors duration-200"
            >
              <X size={20} />
            </button>

            {showModal === 'en-savoir-plus' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] flex items-center justify-center">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">À propos de {profile?.name}</h3>
                  <p className="text-[#A1A5B0]/70 text-sm leading-relaxed">
                    {profile?.description || 'Club premium offrant une expérience luxueuse et raffinée. Découvrez nos services d\'exception dans un cadre élégant et intimiste.'}
                  </p>
            </div>

                {profile?.amenities && profile.amenities.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Équipements & Services</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {profile.amenities.slice(0, 8).map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-[#A1A5B0]/70 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#4FD1C7]"></div>
                          {amenity}
              </div>
                  ))}
                </div>
              </div>
            )}

                <button className="w-full h-12 rounded-xl text-[#0B0B0B] font-bold shadow-[0_0_25px_rgba(255,107,157,0.6)] [background:linear-gradient(135deg,#FF6B9D,#B794F6)] hover:shadow-[0_0_35px_rgba(255,107,157,0.8)] transition-all duration-300">
                  Réserver maintenant
                </button>
              </div>
            )}

            {showModal === 'agenda' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#4FD1C7] to-[#4FD1C7] flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-white" />
            </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Horaires d'ouverture</h3>
    </div>

                <div className="space-y-3">
                  {profile?.workingHours && typeof profile.workingHours === 'string' && (() => {
                    try {
                      const hours = JSON.parse(profile.workingHours);
                      return Object.entries(hours).map(([day, schedule]: [string, any]) => (
                        <div key={day} className="flex justify-between items-center py-2 border-b border-white/[0.05]">
                          <span className="text-white capitalize">{day}</span>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#4FD1C7]" />
                            <span className="text-[#A1A5B0]/70 text-sm">
                              {schedule.closed ? 'Fermé' : `${schedule.open} - ${schedule.close}`}
                    </span>
                </div>
              </div>
                      ));
                    } catch {
                      return (
                        <div className="text-center text-[#A1A5B0]/70 text-sm">
                          Horaires non disponibles
          </div>
                      );
                    }
                  })()}
              </div>

                <button 
                  onClick={() => {
                    // TODO: Implémenter la page de réservation
                    console.log('Voir disponibilités pour:', profile.name)
                    alert('Fonctionnalité de réservation à venir !')
                  }}
                  className="w-full h-12 rounded-xl border border-[#4FD1C7]/30 bg-[#4FD1C7]/10 backdrop-blur-sm text-[#4FD1C7] font-medium hover:bg-[#4FD1C7]/20 transition-all duration-300"
                >
                  Voir disponibilités
                </button>
        </div>
      )}

            {showModal === 'contact' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#B794F6] to-[#B794F6] flex items-center justify-center">
                    <Phone className="w-8 h-8 text-white" />
          </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Contact</h3>
            </div>

                <div className="space-y-4">
                  {profile?.location?.address && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/[0.05]">
                      <MapPin className="w-5 h-5 text-[#FF6B9D] mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">Adresse</div>
                        <div className="text-[#A1A5B0]/70 text-sm">{profile.location.address}</div>
                </div>
              </div>
            )}

                  {profile?.contact?.phone && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/[0.05]">
                      <Phone className="w-5 h-5 text-[#4FD1C7] mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">Téléphone</div>
                        <div className="text-[#A1A5B0]/70 text-sm">{profile.contact.phone}</div>
                </div>
              </div>
            )}

                  {profile?.contact?.email && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/[0.05]">
                      <Mail className="w-5 h-5 text-[#B794F6] mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">Email</div>
                        <div className="text-[#A1A5B0]/70 text-sm">{profile.contact.email}</div>
          </div>
        </div>
      )}
            </div>

                <div className="grid grid-cols-2 gap-3">
                  {profile?.contact?.phone && (
                <button
                      onClick={() => window.open(`tel:${profile.contact?.phone}`, '_self')}
                      className="h-10 rounded-xl border border-[#4FD1C7]/30 bg-[#4FD1C7]/10 backdrop-blur-sm text-[#4FD1C7] font-medium hover:bg-[#4FD1C7]/20 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Appeler
                </button>
              )}
                  <button 
                    onClick={() => router.push('/messages')}
                    className="h-10 rounded-xl border border-[#B794F6]/30 bg-[#B794F6]/10 backdrop-blur-sm text-[#B794F6] font-medium hover:bg-[#B794F6]/20 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  )
}