'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Star, Heart, Eye, MapPin, Clock, Filter, Grid, List } from 'lucide-react'
import ImprovedProfileCard from '@/components/ImprovedProfileCard'

interface Profile {
  id: string
  name: string
  username: string
  age?: number
  location: string
  media: string
  profileImage: string
  image: string
  mediaType: string
  verified: boolean
  premium: boolean
  online: boolean
  description: string
  likes: number
  followers: number
  following: number
  isLiked: boolean
  isFollowing: boolean
  rating: number
  reviews: number
  price?: number
  height?: number
  bodyType?: string
  breastSize?: string
  hairColor?: string
  eyeColor?: string
  outcall?: boolean
  incall?: boolean
  acceptCards?: boolean
  languages: string[]
  practices: string[]
  services: string[]
  gallery: string[]
  lastSeen?: string
  stableKey?: string
  type?: 'escort' | 'salon'
  status?: 'ACTIVE' | 'PAUSED' | 'PENDING' | 'VERIFIED'
  businessName?: string
  address?: string
  phone?: string
  website?: string
  openingHours?: any
  capacity?: number
  escortCount?: number
}

// Mock data pour les profils
const mockProfiles: Profile[] = [
  {
    id: 'profile-1',
    name: 'Sofia Elite',
    username: '@sofia_elite',
    age: 25,
    location: 'Genève',
    media: 'https://picsum.photos/400/600?random=1',
    profileImage: 'https://picsum.photos/200/200?random=1',
    image: 'https://picsum.photos/400/600?random=1',
    mediaType: 'image',
    verified: true,
    premium: true,
    online: true,
    description: 'Escort de luxe à Genève. Expérience professionnelle et discrétion garantie.',
    likes: 1247,
    followers: 8920,
    following: 156,
    isLiked: false,
    isFollowing: false,
    rating: 4.9,
    reviews: 127,
    price: 300,
    height: 170,
    bodyType: 'Athlétique',
    breastSize: 'C',
    hairColor: 'Brun',
    eyeColor: 'Marron',
    outcall: true,
    incall: true,
    acceptCards: true,
    languages: ['Français', 'Anglais', 'Italien'],
    practices: ['GFE', 'Massage', 'VIP'],
    services: ['Escort Premium', 'Massage Relaxant', 'Soirées VIP'],
    gallery: ['https://picsum.photos/400/600?random=1', 'https://picsum.photos/400/600?random=2'],
    lastSeen: 'il y a 5 minutes',
    stableKey: 'profile-1-stable',
    type: 'escort',
    status: 'ACTIVE'
  },
  {
    id: 'profile-2',
    name: 'Emma Rose',
    username: '@emma_rose',
    age: 23,
    location: 'Lausanne',
    media: 'https://picsum.photos/400/600?random=2',
    profileImage: 'https://picsum.photos/200/200?random=2',
    image: 'https://picsum.photos/400/600?random=2',
    mediaType: 'image',
    verified: false,
    premium: false,
    online: false,
    description: 'Jeune escort indépendante à Lausanne. Douce et attentionnée.',
    likes: 456,
    followers: 2340,
    following: 89,
    isLiked: true,
    isFollowing: false,
    rating: 4.7,
    reviews: 45,
    price: 250,
    height: 165,
    bodyType: 'Mince',
    breastSize: 'B',
    hairColor: 'Blond',
    eyeColor: 'Bleu',
    outcall: true,
    incall: false,
    acceptCards: false,
    languages: ['Français', 'Anglais'],
    practices: ['GFE', 'Romantique'],
    services: ['Escort Classique', 'Dîner', 'Sorties'],
    gallery: ['https://picsum.photos/400/600?random=2', 'https://picsum.photos/400/600?random=3'],
    lastSeen: 'il y a 2 heures',
    stableKey: 'profile-2-stable',
    type: 'escort',
    status: 'ACTIVE'
  },
  {
    id: 'profile-3',
    name: 'Club Luxe Geneva',
    username: '@club_luxe_geneva',
    location: 'Genève',
    media: 'https://picsum.photos/400/600?random=3',
    profileImage: 'https://picsum.photos/200/200?random=3',
    image: 'https://picsum.photos/400/600?random=3',
    mediaType: 'image',
    verified: true,
    premium: true,
    online: true,
    description: 'Salon de luxe au cœur de Genève. Ambiance raffinée et service premium.',
    likes: 2341,
    followers: 15600,
    following: 23,
    isLiked: false,
    isFollowing: true,
    rating: 4.8,
    reviews: 89,
    price: 400,
    languages: ['Français', 'Anglais', 'Allemand'],
    practices: ['VIP', 'Luxe', 'Privé'],
    services: ['Salon Premium', 'Champagne', 'Salle Privée'],
    gallery: ['https://picsum.photos/400/600?random=3', 'https://picsum.photos/400/600?random=4'],
    lastSeen: 'En ligne',
    stableKey: 'profile-3-stable',
    type: 'salon',
    status: 'VERIFIED',
    businessName: 'Club Luxe SA',
    address: 'Rue du Rhône 15, 1204 Genève',
    phone: '+41 22 123 45 67',
    website: 'www.clubluxegeneva.ch',
    capacity: 20,
    escortCount: 15
  }
]

export default function ProfilesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'price' | 'name'>('recent')
  const [filterOnline, setFilterOnline] = useState(false)
  const [filterVerified, setFilterVerified] = useState(false)
  const [filterPremium, setFilterPremium] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Charger les profils
  useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true)
      try {
        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Utiliser les données mock pour l'instant
        setProfiles(mockProfiles)
        setHasMore(false) // Pas de pagination pour les données mock
      } catch (error) {
        console.error('Erreur chargement profils:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProfiles()
  }, [])

  // Filtrer et trier les profils
  const filteredProfiles = profiles.filter(profile => {
    if (filterOnline && !profile.online) return false
    if (filterVerified && !profile.verified) return false
    if (filterPremium && !profile.premium) return false
    return true
  })

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating
      case 'price':
        return (a.price || 0) - (b.price || 0)
      case 'name':
        return a.name.localeCompare(b.name)
      case 'recent':
      default:
        return 0
    }
  })

  const handleProfileClick = (profileId: string) => {
    router.push(`/profile/${profileId}`)
  }

  const handleLike = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setProfiles(prev => prev.map(profile => 
      profile.id === profileId 
        ? { 
            ...profile, 
            isLiked: !profile.isLiked,
            likes: profile.isLiked ? profile.likes - 1 : profile.likes + 1
          }
        : profile
    ))
  }

  const handleFollow = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!session) {
      router.push('/login')
      return
    }
    
    setProfiles(prev => prev.map(profile => 
      profile.id === profileId 
        ? { ...profile, isFollowing: !profile.isFollowing }
        : profile
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-full animate-spin mx-auto mb-4"
            style={{
              border: '4px solid var(--felora-aurora-20)',
              borderTop: '4px solid var(--felora-aurora)'
            }}
          />
          <p className="text-lg" style={{ color: 'var(--felora-silver)' }}>
            Chargement des profils...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div 
        className="sticky top-0 z-50 px-6 py-4"
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 
                className="text-3xl font-bold mb-2"
                style={{
                  background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 50%, var(--felora-quantum) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Tous les profils
              </h1>
              <p className="text-sm" style={{ color: 'var(--felora-silver-70)' }}>
                {sortedProfiles.length} profil{sortedProfiles.length > 1 ? 's' : ''} disponible{sortedProfiles.length > 1 ? 's' : ''}
              </p>
            </div>
            
            {/* Contrôles de vue */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-var(--felora-aurora) text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-var(--felora-aurora) text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Filtres et tri */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400">Filtres:</span>
            </div>
            
            <button
              onClick={() => setFilterOnline(!filterOnline)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                filterOnline 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'
              }`}
            >
              <Clock size={14} className="inline mr-1" />
              En ligne
            </button>
            
            <button
              onClick={() => setFilterVerified(!filterVerified)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                filterVerified 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'
              }`}
            >
              <Star size={14} className="inline mr-1" />
              Vérifiés
            </button>
            
            <button
              onClick={() => setFilterPremium(!filterPremium)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                filterPremium 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'
              }`}
            >
              <Heart size={14} className="inline mr-1" />
              Premium
            </button>

            <div className="ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm"
              >
                <option value="recent">Plus récents</option>
                <option value="rating">Mieux notés</option>
                <option value="price">Prix croissant</option>
                <option value="name">Nom A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {sortedProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="text-6xl mb-6">🔍</div>
            <h3 
              className="text-2xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Aucun profil trouvé
            </h3>
            <p className="text-lg max-w-md" style={{ color: 'var(--felora-silver-60)' }}>
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={
              viewMode === 'grid' 
                ? 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'space-y-4'
            }
          >
            {sortedProfiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <ImprovedProfileCard
                  profile={profile}
                  onProfileClick={handleProfileClick}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-8 py-3 rounded-lg font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              Charger plus
            </button>
          </div>
        )}
      </div>
    </div>
  )
}