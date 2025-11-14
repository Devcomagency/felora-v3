'use client'

import React, { useState, Suspense, useRef, useEffect, useCallback } from 'react'
import '@/styles/scrollbar.css'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Search,
  SlidersHorizontal,
  MapPin
} from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import { useClubs } from '@/hooks/useClubs'
import { useThrottle } from '@/hooks/useThrottle'
import { useDebounce } from '@/hooks/useDebounce'
import EscortCard2025 from '@/components/search/EscortCard2025'
import ClubCard from '@/components/search/ClubCard'
import SearchFiltersSimple from '@/components/search/SearchFiltersSimple'

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
  const { status } = useSession()
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
    loadMore: loadMoreEscorts
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
    loadMore: loadMoreClubs
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
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      {/* Main Container avec scroll */}
      <div className="relative z-10 h-full max-w-[500px] mx-auto overflow-y-auto">
        {/* Header fixe avec logo et recherche */}
        <div className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0.8))' }}>
          {/* Logo Felora */}
          <div className="text-center py-6 px-4">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
              FELORA
            </h1>
            <p className="text-sm text-white/60 mt-1 font-light">
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
                  className="w-full pl-12 pr-4 py-4 text-white placeholder-white/40 rounded-2xl transition-all border focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50"
                  style={{
                    background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                  aria-label="Rechercher des escortes ou clubs par nom ou ville"
                />
              </div>

              <button
                onClick={() => setShowFilters(true)}
                className="px-4 py-4 rounded-2xl flex items-center justify-center transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
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
                className={`relative text-lg font-bold transition-all duration-300 ${
                  activeSection === 'escorts'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
                aria-label="Afficher les profils"
                aria-current={activeSection === 'escorts' ? 'page' : undefined}
              >
                Profils
                {activeSection === 'escorts' && (
                  <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveSection('clubs')}
                className={`relative text-lg font-bold transition-all duration-300 ${
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

          {/* Filtres par type pour Clubs & Salons */}
          {activeSection === 'clubs' && (
            <div className="px-4 pb-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {[
                  { key: '', label: 'Tous' },
                  { key: 'club', label: 'Clubs' },
                  { key: 'salon_erotique', label: 'Salons' },
                  { key: 'institut_massage', label: 'Instituts' },
                  { key: 'agence_escorte', label: 'Agences' }
                ].map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setClubsFilters({ ...clubsFilters, establishmentType: type.key })}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-all duration-300 ${
                      clubsFilters.establishmentType === type.key
                        ? 'bg-pink-500/20 text-pink-400 border-pink-500/50'
                        : 'border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    style={clubsFilters.establishmentType !== type.key ? {
                      background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                      backdropFilter: 'blur(20px)'
                    } : {}}
                  >
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="px-4 pb-24">
          {/* Section Profils - Affichée si activeSection === 'escorts' */}
          {activeSection === 'escorts' && (
            <>
              <section ref={escortsSectionRef} className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">Profils Indépendants</h2>
                  {escortsTotal > 0 && (
                    <span className="text-sm text-white/60 font-medium">{escortsTotal} profils</span>
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
                    <p className="text-white/60">Aucun profil trouvé</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {escorts.map((escort, index) => (
                        <EscortCard2025
                          key={escort.id}
                          escort={escort}
                          onLike={handleLike}
                          isLiked={likedEscorts.has(escort.id)}
                          priority={index < 4}
                        />
                      ))}
                    </div>

                    {/* Bouton charger plus pour escortes */}
                    {escortsHasMore && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={loadMoreEscorts}
                          disabled={escortsLoading}
                          className="px-6 py-3.5 text-white font-bold rounded-xl transition-all disabled:opacity-50 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 hover:border-pink-500/50 shadow-lg hover:shadow-pink-500/20"
                        >
                          {escortsLoading ? 'Chargement...' : 'Voir plus'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            </>
          )}

          {/* Section Clubs & Salons - Affichée si activeSection === 'clubs' */}
          {activeSection === 'clubs' && (
            <section ref={clubsSectionRef} className="py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">Clubs & Salons</h2>
              {clubsTotal > 0 && (
                <span className="text-sm text-white/60 font-medium">{clubsTotal} clubs & salons</span>
              )}
            </div>

              {clubsLoading && clubs.length === 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ClubCardSkeleton key={i} />
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
                <>
                  <div className="grid grid-cols-1 gap-4">
                    {clubs.map((club) => (
                      <ClubCard
                        key={club.id}
                        club={club}
                        onClick={(club) => router.push(`/profile-test/club/${club.handle}`)}
                      />
                    ))}
                  </div>

                  {/* Bouton charger plus pour clubs */}
                  {clubsHasMore && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={loadMoreClubs}
                        disabled={clubsLoading}
                        className="px-6 py-3.5 text-white font-bold rounded-xl transition-all disabled:opacity-50 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 hover:border-pink-500/50 shadow-lg hover:shadow-pink-500/20"
                      >
                        {clubsLoading ? 'Chargement...' : 'Voir plus'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </div>

        {/* Bouton flottant carte (bas droite) */}
        <button
          onClick={() => router.push('/map')}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center z-40 hover:scale-110 transition-all duration-300 border shadow-lg"
          style={{
            background: 'linear-gradient(to bottom right, rgba(255, 107, 157, 0.15), rgba(183, 148, 246, 0.1))',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(255, 107, 157, 0.3)',
            boxShadow: '0 8px 24px rgba(255, 107, 157, 0.2)'
          }}
          aria-label="Ouvrir la carte interactive"
        >
          <MapPin size={24} className="text-white" aria-hidden="true" />
        </button>

        {/* Modal de filtres simplifié */}
        <SearchFiltersSimple
          filters={activeSection === 'escorts' ? escortsFilters : clubsFilters}
          onFiltersChange={activeSection === 'escorts' ? handleEscortsFiltersChange : handleClubsFiltersChange}
          onClose={() => setShowFilters(false)}
          isOpen={showFilters}
        />
      </div>
    </div>
  )
}

// Composant de chargement
function SearchLoading() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="relative z-10 flex flex-col items-center gap-4 max-w-[500px] mx-auto">
        <div className="w-16 h-16 border-4 border-white/10 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="text-white/70 font-light">Chargement de la recherche...</p>
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