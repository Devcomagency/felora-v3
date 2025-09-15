"use client"

import React, { useState, Suspense } from 'react'
import { Search, Filter, MapPin, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSearch } from '@/hooks/useSearch'
import SearchFilters from '@/components/search/SearchFilters'
import EscortCard from '@/components/search/EscortCard'
import StaticNavBar from '@/components/layout/StaticNavBar'

// Interface pour les escortes (basée sur le contrat API)
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
  latitude?: number
  longitude?: number
  updatedAt: string
}

// Skeleton component for loading states
function EscortCardSkeleton() {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 animate-pulse">
      <div className="aspect-[4/5] bg-white/10" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-white/10 rounded-full w-16" />
          <div className="h-6 bg-white/10 rounded-full w-20" />
        </div>
      </div>
    </div>
  )
}

// Component that uses useSearchParams (needs to be wrapped with Suspense)
function SearchContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  // Use the search hook
  const {
    escorts,
    isLoading,
    error,
    hasMore,
    total,
    filters,
    setFilters,
    loadMore,
    refresh
  } = useSearch()

  const [showFilters, setShowFilters] = useState(false)
  const [likedEscorts, setLikedEscorts] = useState<Set<string>>(new Set())

  // Handle like action
  const handleLike = (escortId: string) => {
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
  }

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, q: value })
  }

  // Get active filters count for display
  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.city) count++
    if (filters.canton) count++
    if (filters.services.length > 0) count++
    if (filters.languages.length > 0) count++
    if (filters.status) count++
    return count
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: '#000000',
        color: '#ffffff',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* Navigation avec menu burger de droite */}
      <StaticNavBar />

      {/* Header */}
      <div 
        className="sticky top-0 px-5 py-4 z-50"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Title */}
        <div className="text-center mb-6">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            FELORA
          </h1>
          <p className="text-sm text-white/60">
            Découvrez des profils d'exception en Suisse
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher par nom ou ville..."
              value={filters.q}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-white placeholder-white/40 outline-none transition-all duration-300 focus:scale-[1.02] rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '16px'
              }}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(true)}
            className="px-6 py-4 text-white font-semibold transition-all duration-300 hover:scale-105 rounded-2xl relative"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Filter size={18} className="inline mr-2" />
            Filtres
            {getActiveFiltersCount() > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-felora-aurora text-white text-xs rounded-full flex items-center justify-center">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
          
          <button
            onClick={refresh}
            disabled={isLoading}
            className="px-4 py-4 text-white transition-all duration-300 hover:scale-105 rounded-2xl disabled:opacity-50"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Results Count */}
        <div className="text-center">
          <span className="text-sm text-white/60">
            {total > 0 ? `${total} profil${total > 1 ? 's' : ''} trouvé${total > 1 ? 's' : ''}` : 'Aucun résultat'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 overflow-y-auto px-5 pb-32"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(13,13,13,0.5) 100%)'
        }}
      >
        {isLoading && escorts.length === 0 ? (
          <div className="grid gap-6 mt-6 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <EscortCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-96 text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              Erreur de chargement
            </h3>
            <p className="text-lg max-w-md text-white/60 mb-6">
              {error}
            </p>
            <button
              onClick={refresh}
              className="px-6 py-3 rounded-lg text-white font-semibold"
              style={{
                background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              Réessayer
            </button>
          </div>
        ) : escorts.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-96 text-center">
            <div className="text-6xl mb-6">🔍</div>
            <h3 
              className="text-2xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Aucun résultat
            </h3>
            <p className="text-lg max-w-md text-white/60">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <div id="results" role="region" aria-label="Résultats de recherche">
            <div className="grid gap-6 mt-6 grid-cols-2 lg:grid-cols-4" role="list">
              {escorts.map((escort) => (
                <div role="listitem" key={escort.id}>
                  <EscortCard
                    escort={escort}
                    onLike={handleLike}
                    isLiked={likedEscorts.has(escort.id)}
                  />
                </div>
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-8 py-4 rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  {isLoading ? 'Chargement...' : 'Charger plus'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Button */}
      <button
        onClick={() => router.push('/map')}
        className="fixed bottom-28 right-6 w-16 h-16 rounded-full border-0 flex items-center justify-center cursor-pointer transition-all duration-500 z-50 group"
        style={{
          background: 'linear-gradient(135deg, rgba(79, 209, 199, 0.9) 0%, rgba(0, 245, 255, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(79, 209, 199, 0.4)'
        }}
      >
        <MapPin size={28} className="text-white drop-shadow-lg" />
      </button>

      {/* Filters Modal */}
      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setShowFilters(false)}
        isOpen={showFilters}
      />
    </div>
  )
}

// Loading fallback component
function SearchLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: '#000000',
        color: '#ffffff'
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="text-white/70">Chargement de la recherche...</p>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  )
}