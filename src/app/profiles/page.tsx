'use client'

import { useState, useEffect } from 'react'
import { ProfileCard } from '../../../packages/ui'
import { EscortProfileDTO, ClubProfileDTO } from '../../../packages/core/services/ProfileService'

// Mock data - replace with real API calls
const mockEscorts: EscortProfileDTO[] = [
  {
    id: '1',
    handle: '@sofia_elite',
    displayName: 'Sofia Elite',
    bio: 'Escort de luxe à Genève',
    languages: ['Français', 'Anglais'],
    services: ['Accompagnement', 'Soirée'],
    ratePerHour: 500,
    avatarUrl: 'https://picsum.photos/400/400?random=1'
  },
  {
    id: '2', 
    handle: '@bella_dreams',
    displayName: 'Bella Dreams',
    bio: 'Expérience premium',
    languages: ['Français', 'Italien'],
    services: ['VIP', 'Événements'],
    ratePerHour: 600,
    avatarUrl: 'https://picsum.photos/400/400?random=2'
  }
]

const mockClubs: ClubProfileDTO[] = [
  {
    id: '1',
    handle: '@club_diamond',
    name: 'Diamond Club',
    description: 'Club premium au cœur de Genève',
    address: 'Rue du Rhône, Genève',
    openingHours: '20h - 4h',
    avatarUrl: 'https://picsum.photos/400/400?random=10',
    coverUrl: 'https://picsum.photos/800/400?random=11'
  }
]

export default function ProfilesPage() {
  const [activeTab, setActiveTab] = useState<'escorts' | 'clubs'>('escorts')
  const [escorts, setEscorts] = useState<EscortProfileDTO[]>([])
  const [clubs, setClubs] = useState<ClubProfileDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setEscorts(mockEscorts)
      setClubs(mockClubs)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-felora-void via-felora-obsidian to-felora-charcoal p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-felora-pearl mb-2">
            💫 Profils FELORA
          </h1>
          <p className="text-felora-silver/70">
            Découvrez nos escorts et clubs premium en Suisse
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('escorts')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'escorts'
                ? 'bg-gradient-to-r from-felora-aurora to-felora-plasma text-felora-pearl'
                : 'bg-felora-steel/20 text-felora-silver hover:bg-felora-steel/40'
            }`}
          >
            👤 Escorts ({escorts.length})
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'clubs'
                ? 'bg-gradient-to-r from-felora-neural to-felora-quantum text-felora-pearl'
                : 'bg-felora-steel/20 text-felora-silver hover:bg-felora-steel/40'
            }`}
          >
            🏢 Clubs ({clubs.length})
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-felora-aurora/30 border-t-felora-aurora rounded-full animate-spin mx-auto mb-4" />
              <p className="text-felora-silver/70">Chargement des profils...</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Escorts */}
            {activeTab === 'escorts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {escorts.map((escort) => (
                  <ProfileCard
                    key={escort.id}
                    profile={escort}
                    type="escort"
                    className="h-full"
                  />
                ))}
                
                {/* Empty state */}
                {escorts.length === 0 && (
                  <div className="col-span-full text-center py-20">
                    <div className="w-16 h-16 bg-felora-aurora/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">👤</span>
                    </div>
                    <h3 className="text-xl font-semibold text-felora-pearl mb-2">
                      Aucune escort disponible
                    </h3>
                    <p className="text-felora-silver/70">
                      Les profils d'escorts seront bientôt disponibles
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Clubs */}
            {activeTab === 'clubs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubs.map((club) => (
                  <ProfileCard
                    key={club.id}
                    profile={club}
                    type="club"
                    className="h-full"
                  />
                ))}
                
                {/* Empty state */}
                {clubs.length === 0 && (
                  <div className="col-span-full text-center py-20">
                    <div className="w-16 h-16 bg-felora-neural/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🏢</span>
                    </div>
                    <h3 className="text-xl font-semibold text-felora-pearl mb-2">
                      Aucun club disponible
                    </h3>
                    <p className="text-felora-silver/70">
                      Les profils de clubs seront bientôt disponibles
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}