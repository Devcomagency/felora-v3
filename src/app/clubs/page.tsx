'use client'

import React, { useState, Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  SlidersHorizontal, 
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Users,
  Filter
} from 'lucide-react'
import { useClubs } from '@/hooks/useClubs'
import ClubCard from '@/components/search/ClubCard'
import '@/styles/scrollbar.css'

// Skeleton component
function ClubCardSkeleton() {
  return (
    <div className="aspect-[16/9] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl animate-pulse">
      <div className="w-full h-full bg-gray-700/50" />
    </div>
  )
}

// Composant principal des clubs
function ClubsContent() {
  const router = useRouter()
  const {
    clubs,
    isLoading,
    error,
    hasMore,
    total,
    filters,
    setFilters,
    loadMore,
    refresh
  } = useClubs()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')

  // Gestion de la recherche
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    const timeoutId = setTimeout(() => {
      setFilters({ ...filters, q: value })
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  // Gestion du filtre par type
  const handleTypeFilter = (type: string) => {
    const newType = type === selectedType ? '' : type
    setSelectedType(newType)
    setFilters({ ...filters, establishmentType: newType })
  }

  // Types d'établissements
  const establishmentTypes = [
    { key: 'club', label: 'Clubs' },
    { key: 'salon_erotique', label: 'Salons' },
    { key: 'institut_massage', label: 'Instituts' },
    { key: 'agence_escorte', label: 'Agences' }
  ]

  return (
    <div className="min-h-screen bg-black text-white max-w-[500px] mx-auto">
      {/* Header fixe */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5">
        {/* Navigation */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          
          <h1 className="text-xl font-bold gradient-text">
            Clubs & Salons
          </h1>
          
          <div className="w-10 h-10" />
        </div>

        {/* Barre de recherche */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher un club, salon..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-white placeholder-white/40 glass input-focus rounded-2xl"
            />
          </div>
        </div>

        {/* Filtres par type */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {establishmentTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => handleTypeFilter(type.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-all duration-300 ${
                  selectedType === type.key
                    ? 'bg-pink-500/20 text-pink-400 border-pink-500/50'
                    : 'glass border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Compteur de résultats */}
        {total > 0 && (
          <div className="px-4 pb-4">
            <span className="text-sm text-white/60">
              {total} établissement{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="px-4 pb-24">
        {isLoading && clubs.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ClubCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-white/60 mb-4">{error}</p>
            <button
              onClick={refresh}
              className="px-6 py-3 gradient-pink-purple text-white font-medium rounded-xl btn-glow"
            >
              Réessayer
            </button>
          </div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold text-white mb-2">Aucun club trouvé</h3>
            <p className="text-white/60 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedType('')
                setFilters({})
              }}
              className="px-6 py-3 gradient-pink-purple text-white font-medium rounded-xl btn-glow"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-6">
            {clubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onClick={(club) => router.push(`/profile-test/club/${club.handle}`)}
              />
            ))}
          </div>
        )}

        {/* Bouton charger plus */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-8 py-4 gradient-pink-purple text-white font-medium rounded-xl btn-glow disabled:opacity-50"
            >
              {isLoading ? 'Chargement...' : 'Voir plus de clubs'}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-black/90 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around px-4 py-3">
          <button 
            onClick={() => router.push('/')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-xl transition-all duration-300"
          >
            <div className="w-6 h-6 bg-white/70 rounded" />
            <span className="text-xs text-white/60">Accueil</span>
          </button>
          
          <button 
            onClick={() => router.push('/search')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-xl transition-all duration-300"
          >
            <Search size={24} className="text-pink-500" />
            <span className="text-xs text-pink-500">Recherche</span>
          </button>
          
          <button 
            onClick={() => router.push('/test-media-simple')}
            className="relative w-14 h-14 rounded-2xl gradient-pink-purple shadow-lg shadow-pink-500/25 flex items-center justify-center btn-glow"
          >
            <div className="w-6 h-6 bg-white rounded" />
          </button>
          
          <button 
            onClick={() => router.push('/messages')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-xl transition-all duration-300"
          >
            <div className="w-6 h-6 bg-white/70 rounded" />
            <span className="text-xs text-white/60">Messages</span>
          </button>
          
          <button 
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center gap-1 p-2 hover:bg-white/5 rounded-xl transition-all duration-300"
          >
            <div className="w-6 h-6 bg-white/70 rounded" />
            <span className="text-xs text-white/60">Profil</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant de chargement
function ClubsLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center max-w-[500px] mx-auto">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="text-white/70">Chargement des clubs...</p>
      </div>
    </div>
  )
}

// Composant principal avec Suspense
export default function ClubsPage() {
  return (
    <Suspense fallback={<ClubsLoading />}>
      <ClubsContent />
    </Suspense>
  )
}
