"use client"

import React, { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import styles from './search.module.css'
import ImprovedProfileCard from '@/components/ImprovedProfileCard'

// Interface pour les profils de recherche
interface SearchProfile {
  id: string;
  name: string;
  username: string;
  age?: number;
  location: string;
  media: string;
  profileImage: string;
  image: string;
  mediaType: string;
  verified: boolean;
  premium: boolean;
  online: boolean;
  description: string;
  likes: number;
  followers: number;
  following: number;
  isLiked: boolean;
  isFollowing: boolean;
  rating: number;
  reviews: number;
  price?: number;
  height?: number;
  bodyType?: string;
  breastSize?: string;
  hairColor?: string;
  eyeColor?: string;
  outcall?: boolean;
  incall?: boolean;
  acceptCards?: boolean;
  languages: string[];
  practices: string[];
  services: string[];
  gallery: string[];
  lastSeen?: string;
  stableKey?: string;
  type?: 'escort' | 'salon';
  status?: 'ACTIVE' | 'PAUSED' | 'PENDING' | 'VERIFIED';
  businessName?: string;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: any;
  capacity?: number;
  escortCount?: number;
}

// Toutes les villes de Suisse organisées par canton
const swissCities = {
  "Genève": [
    "Genève", "Carouge", "Chambésy", "Champel", "Cité-Centre", "Cologny", "Cornavin",
    "Eaux-vives", "Plainpalais", "Plan-les-Ouates", "Servette", "Thônex", "Versoix",
    "Meyrin", "Vernier", "Lancy"
  ],
  "Vaud": [
    "Aigle", "Aubonne", "Bex", "Bussigny", "Chavannes-Renens", "Clarens", "Coppet",
    "Corcelles-près-Payerne", "Crissier", "Gland", "Lausanne", "Montreux", "Morges",
    "Moudon", "Nyon", "Oron", "Payerne", "Prilly", "Renens", "Roche", "Vevey",
    "Villeneuve", "Yverdon-les-Bains", "Rolle", "Pully"
  ],
  "Valais": [
    "Aproz", "Ardon", "Brig", "Chippis", "Collombey", "Conthey", "Crans-Montana",
    "Grône", "Martigny", "Massongex", "Monthey", "Riddes", "Saillon", "Saint-Léonard",
    "Saint-Maurice", "Saxon", "Sierre", "Sion", "Turtmann", "Verbier", "Vétroz",
    "Visp", "Savièse", "Fully", "Veyras"
  ],
  "Neuchâtel": [
    "La Chaux-de-Fonds", "Le Locle", "Neuchâtel", "Boudry", "Colombier"
  ],
  "Jura": [
    "Bassecourt", "Boncourt", "Courrendlin", "Delémont", "Moutier", "Porrentruy", "Alle"
  ],
  "Fribourg": [
    "Bulle", "Châtel-Saint-Denis", "Düdingen", "Estavayer-le-Lac", "Flamatt",
    "Fribourg", "Marly", "Romont", "Morat", "Kerzers"
  ],
  "Berne": [
    "Belp", "Berne", "Biel/Bienne", "Lengnau", "Burgdorf", "Granges", "Gstaad",
    "Interlaken", "Kirchberg", "Laupen", "Oberdiessbach", "Ostermundigen", "Thun",
    "Uetendorf", "Zollikofen", "Lyss", "Münsingen", "Spiez"
  ],
  "Zurich": [
    "Bassersdorf", "Effretikon", "Opfikon", "Regensdorf", "Dietikon", "Dübendorf",
    "Pfäffikon (Zurich)", "Schlieren", "Wald Zürich", "Schwerzenbach", "Zürich",
    "Glattbrugg", "Oerlikon", "Winterthur", "Uster", "Kloten"
  ],
  "Suisse Alémanique": [
    "Altendorf", "Aarau", "Baden", "Basel", "Glaris", "Lucerne", "Buchs", "Chur",
    "Lenzburg", "Othmarsingen", "Oensingen", "Rothrist", "Safenwil", "Olten",
    "Saint-Gall", "St-Moritz", "Davos", "Derendingen", "Ebikon", "Emmenbrücke",
    "Spreitenbach", "Schindellegi", "Sevelen", "Solothurn", "Wil", "Liestal",
    "Münchenstein", "Winterthur", "Wolfwil", "Zofingen", "Zug", "Schaffhouse",
    "Frauenfeld", "Kreuzlingen", "Allschwil", "Pratteln", "Muttenz", "Emmen",
    "Kriens", "Horw", "Arosa"
  ],
  "Tessin": [
    "Lugano", "Bellinzona", "Locarno"
  ]
}

export default function SearchPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  const user = session?.user
  const [profiles, setProfiles] = useState<SearchProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedAge, setSelectedAge] = useState('')
  const [selectedPrice, setSelectedPrice] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCanton, setSelectedCanton] = useState('')
  const [radius, setRadius] = useState(10)
  const [availableNow, setAvailableNow] = useState(false)
  const [outcall, setOutcall] = useState(false)
  const [incall, setIncall] = useState(false)
  const [ageRange, setAgeRange] = useState([18, 65])
  const [heightRange, setHeightRange] = useState([150, 180])
  const [bodyType, setBodyType] = useState('')
  const [hairColor, setHairColor] = useState('')
  const [eyeColor, setEyeColor] = useState('')
  const [breastSize, setBreastSize] = useState('')
  const [services, setServices] = useState<string[]>([])
  const [verified, setVerified] = useState(false)
  const [languages, setLanguages] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null)
  const [locationEnabled, setLocationEnabled] = useState(false)

  // Mock data des salons
  const mockSalons: SearchProfile[] = [
    {
      id: 'salon1',
      name: 'Elite Genève',
      username: 'elite-geneve',
      location: 'Genève',
      media: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop',
      profileImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop',
      mediaType: 'image',
      verified: true,
      premium: true,
      online: true,
      description: 'Salon de beauté premium offrant des services d\'escort de luxe dans un cadre élégant et discret au cœur de Genève.',
      likes: 127,
      followers: 89,
      following: 12,
      isLiked: false,
      isFollowing: false,
      rating: 4.8,
      reviews: 127,
      languages: ['fr', 'en', 'de'],
      practices: [],
      services: ['Escort Premium', 'Massage Relaxant', 'Soirées VIP', 'Service Discret'],
      gallery: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
      stableKey: 'salon1-stable',
      type: 'salon',
      businessName: 'Salon Elite SA',
      address: 'Rue du Rhône 15',
      phone: '+41 22 123 45 67',
      website: 'www.elite-geneve.ch',
      capacity: 15,
      escortCount: 12
    }
  ]

  // Charger les profils depuis l'API et ajouter les salons
  useEffect(() => {
    const ctrl = new AbortController()
    const loadProfiles = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/escorts?limit=20', { signal: ctrl.signal })
        const data = await response.json()
        
        if (data.success) {
          const transformedEscorts = (data.escorts || []).map((escort: any, index: number) => ({
            ...escort,
            type: 'escort',
            stableKey: `${escort.id}-${index}`,
            lastSeen: !escort.online && Math.random() > 0.5 
              ? `il y a ${Math.floor(Math.random() * 30) + 1} minutes`
              : undefined
          }))
          
          setProfiles([...transformedEscorts, ...mockSalons])
        } else {
          setProfiles(mockSalons)
        }
      } catch (error) {
        console.error('Erreur chargement profils:', error)
        setProfiles(mockSalons)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProfiles()
    return () => ctrl.abort()
  }, [])

  // Filtrer les profils
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = searchTerm === '' || 
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(category => {
      switch(category) {
        case 'escorte':
          return profile.type === 'escort' || !profile.type
        case 'salon':
          return profile.type === 'salon'
        case 'massage':
          return profile.services.some(service => 
            service.toLowerCase().includes('massage')
          )
        case 'vip':
          return profile.services.some(service => 
            service.toLowerCase().includes('vip') ||
            service.toLowerCase().includes('premium')
          ) || (profile.price && profile.price >= 300)
        default:
          return true
      }
    })
    
    const matchesCity = selectedCity === '' || profile.location === selectedCity
    const matchesCanton = selectedCanton === '' || selectedCanton === 'ALL' || (() => {
      if (selectedCanton === 'ALL') return true
      const cantonCities = swissCities[selectedCanton as keyof typeof swissCities]
      return cantonCities && cantonCities.includes(profile.location)
    })()
    
    const matchesAvailableNow = !availableNow || profile.online
    const matchesOutcall = !outcall || profile.outcall
    const matchesIncall = !incall || profile.incall
    const matchesAgeRange = (profile.age || 25) >= ageRange[0] && (profile.age || 25) <= ageRange[1]
    const matchesHeightRange = (profile.height || 165) >= heightRange[0] && (profile.height || 165) <= heightRange[1]
    const matchesBodyType = bodyType === '' || profile.bodyType === bodyType
    const matchesHairColor = hairColor === '' || profile.hairColor === hairColor
    const matchesEyeColor = eyeColor === '' || profile.eyeColor === eyeColor
    const matchesBreastSize = breastSize === '' || profile.breastSize === breastSize
    const matchesServices = services.length === 0 || 
      services.every(service => profile.services.includes(service))
    const matchesVerified = !verified || profile.verified
    const matchesLanguages = languages.length === 0 || 
      languages.some(lang => profile.languages.includes(lang))
    
    return matchesSearch && matchesCategory && matchesCity && matchesCanton && 
           matchesAvailableNow && matchesOutcall && matchesIncall && matchesAgeRange && 
           matchesHeightRange && matchesBodyType && matchesHairColor && 
           matchesEyeColor && matchesBreastSize && matchesServices && 
           matchesVerified && matchesLanguages
  })

  // Trier les profils
  const sortedProfiles = React.useMemo(() => {
    return [...filteredProfiles].sort((a, b) => {
      const aIsPaused = a.status === 'PAUSED'
      const bIsPaused = b.status === 'PAUSED'
      
      if (aIsPaused && !bIsPaused) return 1
      if (!aIsPaused && bIsPaused) return -1
      
      switch (sortBy) {
        case 'price_low':
          return (a.price || 0) - (b.price || 0)
        case 'price_high':
          return (b.price || 0) - (a.price || 0)
        case 'rating':
          return b.rating - a.rating
        case 'name':
          return a.name.localeCompare(b.name)
        case 'recent':
        default:
          return 0
      }
    })
  }, [filteredProfiles, sortBy])

  // Profils affichés (pagination)
  const displayedProfiles = React.useMemo(() => {
    return sortedProfiles.slice(0, page * pageSize)
  }, [sortedProfiles, page, pageSize])

  const handleProfileClick = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId)
    if (profile && profile.type === 'salon') {
      router.push(`/profile-test/club/club-luxe-geneva`)
    } else {
      router.push(`/profile-test/escort/test`)
    }
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
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    setProfiles(prev => prev.map(profile => 
      profile.id === profileId 
        ? { ...profile, isFollowing: !profile.isFollowing }
        : profile
    ))
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
      {/* Bouton burger */}
      <button
        onClick={() => { try { window.dispatchEvent(new CustomEvent('felora:menu:toggle')) } catch {} }}
        className="fixed top-4 left-4 z-[1001] w-10 h-10 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-black/70 hover:border-white/20"
        aria-label="Ouvrir le menu"
        title="Menu"
      >
        <Menu size={18} />
      </button>

        {/* Header avec glassmorphism FELORA */}
        <div 
          className="sticky top-0 px-5 py-4"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 1000,
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          {/* Titre FELORA */}
          <div className="text-center mb-6">
            <h1 
              className="text-3xl font-bold mb-2"
              style={{
                background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 50%, var(--felora-quantum) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              FELORA
            </h1>
            <p 
              className="text-sm"
              style={{ color: 'var(--felora-silver)' }}
            >
              Découvrez des profils d'exception en Suisse
            </p>
          </div>
        
        {/* Barre de recherche premium */}
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Rechercher par nom ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Rechercher par nom ou ville"
              className="w-full px-6 py-4 text-white placeholder-white/40 outline-none transition-all duration-300 focus:scale-[1.02]"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-4 text-white font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: showFilters 
                ? 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)' 
                : 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: showFilters ? '0 8px 32px rgba(255, 107, 157, 0.3)' : 'none'
            }}
          >
            Filtres
          </button>
          
            <div 
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: 'var(--felora-quantum-15)',
                color: 'var(--felora-quantum)',
                border: '1px solid var(--felora-quantum-30)'
              }}
            >
              {sortedProfiles.length} profil{sortedProfiles.length > 1 ? 's' : ''}
            </div>
        </div>

        {/* Filtres avancés FELORA */}
        {showFilters && (
          <div 
            className="mt-4 p-6 transition-all duration-500"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
            }}
          >
            {/* Catégories */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#ffffff' }}>
                Catégories
              </h4>
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                {['Escorte', 'Salon', 'Massage', 'VIP', 'BDSM', 'Médias privés'].map((category) => {
                  const isSelected = selectedCategories.includes(category.toLowerCase())
                  return (
                    <button 
                      key={category}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCategories(prev => prev.filter(cat => cat !== category.toLowerCase()))
                        } else {
                          setSelectedCategories(prev => [...prev, category.toLowerCase()])
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '16px',
                        border: isSelected 
                          ? '1px solid #FF6B9D' 
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        background: isSelected 
                          ? 'rgba(255, 107, 157, 0.2)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#FF6B9D' : 'rgba(255, 255, 255, 0.8)',
                        fontSize: '14px',
                        fontWeight: isSelected ? '600' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {category}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Géolocalisation */}
            <div style={{ 
              marginBottom: '20px',
              padding: '15px',
              background: 'rgba(79, 209, 199, 0.05)',
              border: '1px solid rgba(79, 209, 199, 0.2)',
              borderRadius: '12px'
            }}>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '12px', 
                color: '#4FD1C7',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📍 Localisation
              </h4>
              
              <div className="location-filters" style={{ 
                display: 'grid',
                gap: '10px',
                alignItems: 'center'
              }}>
                <select
                  value={selectedCanton}
                  onChange={(e) => {
                    setSelectedCanton(e.target.value)
                    if (e.target.value) setSelectedCity('')
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                >
                  <option value="" style={{ backgroundColor: '#1a1a1a' }}>Canton</option>
                  <option value="ALL" style={{ backgroundColor: '#1a1a1a' }}>Tous</option>
                  {Object.keys(swissCities).map(canton => (
                    <option key={canton} value={canton} style={{ backgroundColor: '#1a1a1a' }}>
                      {canton}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value)
                    if (e.target.value) setSelectedCanton('')
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                >
                  <option value="" style={{ backgroundColor: '#1a1a1a' }}>Ville</option>
                  {Object.entries(swissCities).map(([canton, cities]) => (
                    <optgroup key={canton} label={canton} style={{ backgroundColor: '#2a2a2a' }}>
                      {cities.map(city => (
                        <option key={city} value={city} style={{ backgroundColor: '#1a1a1a' }}>
                          {city}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Tri */}
            <div style={{ 
              marginTop: '20px', 
              paddingTop: '20px', 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontSize: '14px'
                }}
              >
                <option value="recent" style={{ backgroundColor: '#1a1a1a' }}>Plus récent</option>
                <option value="price_low" style={{ backgroundColor: '#1a1a1a' }}>Prix croissant</option>
                <option value="price_high" style={{ backgroundColor: '#1a1a1a' }}>Prix décroissant</option>
                <option value="rating" style={{ backgroundColor: '#1a1a1a' }}>Mieux notées</option>
                <option value="name" style={{ backgroundColor: '#1a1a1a' }}>Nom A-Z</option>
              </select>
              
              <button
                onClick={() => setShowFilters(false)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Rechercher ({filteredProfiles.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal FELORA */}
      <div 
        className="flex-1 overflow-y-auto px-5 pb-32"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(13,13,13,0.5) 100%)'
        }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div 
              className="w-12 h-12 rounded-full animate-spin"
              style={{
                border: '3px solid var(--felora-aurora-20)',
                borderTop: '3px solid var(--felora-aurora)'
              }}
            />
            <span 
              className="ml-4 text-lg"
              style={{ color: 'var(--felora-silver-70)' }}
            >
              Chargement des profils...
            </span>
          </div>
        ) : sortedProfiles.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-96 text-center">
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
              Aucun résultat
            </h3>
            <p 
              className="text-lg max-w-md"
              style={{ color: 'var(--felora-silver-60)' }}
            >
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <div id="results" role="region" aria-label="Résultats de recherche">
            <div className="grid gap-6 mt-6 grid-cols-2 lg:grid-cols-4" role="list">
              {displayedProfiles.map((profile) => (
                <div role="listitem" key={profile.stableKey || profile.id}>
                  <ImprovedProfileCard
                    profile={{
                      ...profile,
                      services: profile.services || []
                    }}
                    onProfileClick={handleProfileClick}
                  />
                </div>
              ))}
            </div>
            {displayedProfiles.length < sortedProfiles.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-6 py-3 rounded-lg text-white font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                  aria-label="Charger plus de résultats"
                >
                  Charger plus
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bouton Map flottant FELORA */}
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
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="2.5"
          className="drop-shadow-lg"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </button>
    </div>
  )
}