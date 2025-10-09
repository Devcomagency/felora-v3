'use client'

import React, { useState, Suspense, useRef, useEffect, useCallback, useMemo } from 'react'
import '@/styles/scrollbar.css'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Plus,
  Home,
  MessageSquare,
  User,
  Heart,
  Star,
  Clock
} from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import { useClubs } from '@/hooks/useClubs'
import { useThrottle } from '@/hooks/useThrottle'
import { useDebounce } from '@/hooks/useDebounce'
import EscortCard2025 from '@/components/search/EscortCard2025'
import ClubCard from '@/components/search/ClubCard'
import SearchFiltersSimple from '@/components/search/SearchFiltersSimple'

// Interface pour les escortes
interface Escort {
  id: string
  stageName: string
  age?: number
  city?: string
  canton?: string
  isVerifiedBadge?: boolean
  isActive?: boolean
  profilePhoto?: string
  heroMedia?: { type: 'IMAGE'|'VIDEO'; url: string; thumb?: string }
  languages?: string[]
  services?: string[]
  rate1H?: number
  rate2H?: number
  rateOvernight?: number
  availableNow?: boolean
  outcall?: boolean
  incall?: boolean
  hasPrivatePhotos?: boolean
  hasPrivateVideos?: boolean
  hasWebcamLive?: boolean
  rating?: number
  reviewCount?: number
  views?: number
  likes?: number
  status?: string
  updatedAt: string
}

// Skeleton components
function EscortCardSkeleton() {
  return (
    <div className="aspect-[3/4] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl animate-pulse">
      <div className="w-full h-full bg-gray-700/50" />
    </div>
  )
}

function ClubCardSkeleton() {
  return (
    <div className="aspect-[16/9] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl animate-pulse">
      <div className="w-full h-full bg-gray-700/50" />
    </div>
  )
}

// Composant principal de recherche
function SearchContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  // États pour les escortes
  const {
    escorts,
    isLoading: escortsLoading,
    error: escortsError,
    hasMore: escortsHasMore,
    total: escortsTotal,
    filters: escortsFilters,
    setFilters: setEscortsFilters,
    loadMore: loadMoreEscorts,
    refresh: refreshEscorts
  } = useSearch()

  // États pour les clubs
  const {
    clubs,
    isLoading: clubsLoading,
    error: clubsError,
    hasMore: clubsHasMore,
    total: clubsTotal,
    filters: clubsFilters,
    setFilters: setClubsFilters,
    loadMore: loadMoreClubs,
    refresh: refreshClubs
  } = useClubs()

  // États locaux
  const [showFilters, setShowFilters] = useState(false)
  const [likedEscorts, setLikedEscorts] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState<'escorts' | 'clubs'>('escorts')

  // Debounce de la recherche
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Refs pour le scroll
  const escortsSectionRef = useRef<HTMLDivElement>(null)
  const clubsSectionRef = useRef<HTMLDivElement>(null)

  // Gestion des likes (memoized)
  const handleLike = useCallback((escortId: string) => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setLikedEscorts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(escortId)) {
        newSet.delete(escortId)
      } else {
        newSet.add(escortId)
      }
      return newSet
    })
  }, [isAuthenticated, router])

  // Appliquer la recherche debouncée aux filtres
  useEffect(() => {
    if (debouncedSearchQuery !== escortsFilters.q) {
      setEscortsFilters({ ...escortsFilters, q: debouncedSearchQuery })
      setClubsFilters({ ...clubsFilters, q: debouncedSearchQuery })
    }
  }, [debouncedSearchQuery])

  // Gestion des filtres pour les escortes (memoized)
  const handleEscortsFiltersChange = useCallback((newFilters: any) => {
    setEscortsFilters(newFilters)
  }, [setEscortsFilters])

  // Gestion des filtres pour les clubs (memoized)
  const handleClubsFiltersChange = useCallback((newFilters: any) => {
    setClubsFilters(newFilters)
  }, [setClubsFilters])

  // Navigation entre sections (memoized)
  const scrollToSection = useCallback((section: 'escorts' | 'clubs') => {
    if (section === 'escorts' && escortsSectionRef.current) {
      escortsSectionRef.current.scrollIntoView({ behavior: 'smooth' })
    } else if (section === 'clubs' && clubsSectionRef.current) {
      clubsSectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    setActiveSection(section)
  }, [])

  // Infinite scroll pour les escortes (avec throttle pour performance)
  const handleScroll = useThrottle(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    // Se déclencher quand on arrive à 300px de la fin
    if (scrollTop + windowHeight >= documentHeight - 300) {
      console.log('[Scroll] Near bottom detected', { scrollTop, windowHeight, documentHeight, activeSection, escortsHasMore, clubsHasMore })
      if (activeSection === 'escorts' && escortsHasMore && !escortsLoading) {
        console.log('[Scroll] Loading more escorts...')
        loadMoreEscorts()
      } else if (activeSection === 'clubs' && clubsHasMore && !clubsLoading) {
        console.log('[Scroll] Loading more clubs...')
        loadMoreClubs()
      }
    }
  }, 200)

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div className="min-h-screen bg-black text-white max-w-[500px] mx-auto overflow-y-auto">
      {/* Header fixe avec logo et recherche */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5">
        {/* Logo Felora */}
        <div className="text-center py-6 px-4">
          <h1 className="text-3xl font-bold gradient-text">
            FELORA
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Découvrez des profils d'exception en Suisse
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="px-4 pb-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" aria-hidden="true" />
              <input
                type="text"
                placeholder="Rechercher par nom, ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-white placeholder-white/40 glass input-focus rounded-2xl"
                aria-label="Rechercher des escortes ou clubs par nom ou ville"
              />
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className="px-4 py-4 glass btn-glow rounded-2xl flex items-center justify-center"
              aria-label="Ouvrir les filtres de recherche"
            >
              <SlidersHorizontal size={20} className="text-white/80" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Navigation entre sections */}
        <div className="px-4 pb-4">
          <div className="flex gap-6">
            <button
              onClick={() => scrollToSection('escorts')}
              className={`relative text-lg font-medium transition-all duration-300 ${
                activeSection === 'escorts'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
              aria-label="Afficher les escortes"
              aria-current={activeSection === 'escorts' ? 'page' : undefined}
            >
              Escortes
              {activeSection === 'escorts' && (
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] rounded-full" />
              )}
            </button>
            <button
              onClick={() => scrollToSection('clubs')}
              className={`relative text-lg font-medium transition-all duration-300 ${
                activeSection === 'clubs'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
              aria-label="Afficher les clubs et salons"
              aria-current={activeSection === 'clubs' ? 'page' : undefined}
            >
              Clubs & Salons
              {activeSection === 'clubs' && (
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-4 pb-24">
        {/* Section Escortes */}
        <section ref={escortsSectionRef} className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Escortes Indépendantes</h2>
            {escortsTotal > 0 && (
              <span className="text-sm text-white/60">{escortsTotal} profils</span>
            )}
          </div>

          {escortsLoading && escorts.length === 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <EscortCardSkeleton key={i} />
              ))}
            </div>
          ) : escortsError ? (
            <div className="text-center py-12">
              <p className="text-white/60">{escortsError}</p>
            </div>
          ) : escorts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60">Aucune escorte trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {escorts.slice(0, 4).map((escort, index) => (
                <EscortCard2025
                  key={escort.id}
                  escort={escort}
                  onLike={handleLike}
                  isLiked={likedEscorts.has(escort.id)}
                  priority={true} // Priorité pour les 4 premières images
                />
              ))}
            </div>
          )}

        </section>

        {/* Section Clubs & Salons */}
        <section ref={clubsSectionRef} className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Clubs & Salons</h2>
            {clubsTotal > 0 && (
              <span className="text-sm text-white/60">{clubsTotal} établissements</span>
            )}
          </div>

          {clubsLoading && clubs.length === 0 ? (
            <div className="flex gap-3 overflow-x-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64">
                  <ClubCardSkeleton />
                </div>
              ))}
            </div>
          ) : clubsError ? (
            <div className="text-center py-12">
              <p className="text-white/60">{clubsError}</p>
            </div>
          ) : clubs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60">Aucun club trouvé</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide carousel-container">
              {clubs.map((club) => (
                <div key={club.id} className="flex-shrink-0 w-64 carousel-item">
                  <ClubCard
                    club={club}
                    onClick={(club) => router.push(`/profile-test/club/${club.handle}`)}
                  />
                </div>
              ))}
              
              {/* Bouton "Voir tous les clubs" */}
              <div className="flex-shrink-0 w-64 flex items-center justify-center">
                <button
                  onClick={() => router.push('/clubs')}
                  className="w-full h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center text-white/80"
                >
                  <Plus size={32} className="mb-2" />
                  <span className="text-sm font-medium">Voir tous les clubs</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Section Escortes - Suite (si plus de 4 escortes) */}
        {escorts.length > 4 && (
          <section className="py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Plus d'escortes</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {escorts.slice(4).map((escort, index) => (
                <EscortCard2025
                  key={escort.id}
                  escort={escort}
                  onLike={handleLike}
                  isLiked={likedEscorts.has(escort.id)}
                  priority={false} // Pas de priorité pour les suivantes
                />
              ))}
            </div>

            {/* Bouton charger plus pour escortes */}
            {escortsHasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={loadMoreEscorts}
                  disabled={escortsLoading}
                  className="px-6 py-3 gradient-pink-purple text-white font-medium rounded-xl btn-glow disabled:opacity-50"
                  aria-label={escortsLoading ? 'Chargement en cours' : 'Charger plus d\'escortes'}
                >
                  {escortsLoading ? 'Chargement...' : 'Voir plus'}
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Bouton flottant carte (bas droite) */}
      <button
        onClick={() => router.push('/map')}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] shadow-lg shadow-pink-500/25 flex items-center justify-center btn-glow z-40 hover:scale-110 transition-transform duration-300"
        aria-label="Ouvrir la carte interactive"
      >
        <MapPin size={24} className="text-white" aria-hidden="true" />
      </button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-black/90 backdrop-blur-xl border-t border-white/5 z-50">
        <div className="flex items-center justify-around px-4 py-3">
          <button
            onClick={() => router.push('/')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-xl transition-all duration-300"
            aria-label="Retour à l'accueil"
          >
            <Home size={24} className="text-white/70" aria-hidden="true" />
            <span className="text-xs text-white/60">Accueil</span>
          </button>

          <button
            onClick={() => router.push('/search')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-xl transition-all duration-300"
            aria-label="Page de recherche actuelle"
            aria-current="page"
          >
            <Search size={24} className="text-pink-500" aria-hidden="true" />
            <span className="text-xs text-pink-500">Recherche</span>
          </button>

          <button
            onClick={() => router.push('/test-media-simple')}
            className="relative w-14 h-14 rounded-2xl gradient-pink-purple shadow-lg shadow-pink-500/25 flex items-center justify-center btn-glow"
            aria-label="Ajouter du contenu"
          >
            <Plus size={28} className="text-white" aria-hidden="true" />
          </button>

          <button
            onClick={() => router.push('/messages')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-xl transition-all duration-300"
            aria-label="Accéder aux messages"
          >
            <MessageSquare size={24} className="text-white/70" aria-hidden="true" />
            <span className="text-xs text-white/60">Messages</span>
          </button>

          <button
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-xl transition-all duration-300"
            aria-label="Voir mon profil"
          >
            <User size={24} className="text-white/70" aria-hidden="true" />
            <span className="text-xs text-white/60">Profil</span>
          </button>
        </div>
      </div>

      {/* Modal de filtres simplifié */}
      <SearchFiltersSimple
        filters={activeSection === 'escorts' ? escortsFilters : clubsFilters}
        onFiltersChange={activeSection === 'escorts' ? handleEscortsFiltersChange : handleClubsFiltersChange}
        onClose={() => setShowFilters(false)}
        isOpen={showFilters}
      />
    </div>
  )
}

// Composant de chargement
function SearchLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center max-w-[500px] mx-auto">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="text-white/70">Chargement de la recherche...</p>
      </div>
    </div>
  )
}

// Composant principal avec Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  )
} 