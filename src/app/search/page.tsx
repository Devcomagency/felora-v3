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
  stableKey?: string; // Clé stable pour éviter les re-renders
  type?: 'escort' | 'salon'; // Type de profil
  status?: 'ACTIVE' | 'PAUSED' | 'PENDING' | 'VERIFIED'; // Statut du profil
  // Champs spécifiques aux salons
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
  // Filtres de base
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedAge, setSelectedAge] = useState('')
  const [selectedPrice, setSelectedPrice] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [showFilters, setShowFilters] = useState(false)
  // Pagination (client)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  // Géolocalisation
  const [selectedCanton, setSelectedCanton] = useState('')
  const [radius, setRadius] = useState(10)
  const [availableNow, setAvailableNow] = useState(false)
  const [outcall, setOutcall] = useState(false)
  const [incall, setIncall] = useState(false)
  
  // Profil & Physique
  const [ageRange, setAgeRange] = useState([18, 65])
  const [heightRange, setHeightRange] = useState([150, 180])
  const [bodyType, setBodyType] = useState('')
  const [hairColor, setHairColor] = useState('')
  const [eyeColor, setEyeColor] = useState('')
  const [ethnicity, setEthnicity] = useState('')
  const [breastSize, setBreastSize] = useState('')
  const [hasTattoos, setHasTattoos] = useState('')
  
  // Services & Types
  const [services, setServices] = useState<string[]>([])
  const [serviceTypes, setServiceTypes] = useState<string[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  
  // Identité & Orientation (retiré)
  
  // Expériences & Rôles
  const [experienceTypes, setExperienceTypes] = useState<string[]>([])
  const [roleTypes, setRoleTypes] = useState<string[]>([])
  
  // Tarifs (budget supprimé du filtre et de l'UI)
  const [budgetRange, setBudgetRange] = useState([0, 2000])
  const [minDuration, setMinDuration] = useState('')
  const [acceptsCards, setAcceptsCards] = useState(false)
  
  // Disponibilité
  const [availability, setAvailability] = useState<string[]>([])
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [weekendAvailable, setWeekendAvailable] = useState(false)
  
  // Qualité
  const [verified, setVerified] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [minReviews, setMinReviews] = useState(0)
  
  // Communication
  const [languages, setLanguages] = useState<string[]>([])
  
  // Premium
  const [premiumContent, setPremiumContent] = useState(false)
  const [liveCam, setLiveCam] = useState(false)
  const [premiumMessaging, setPremiumMessaging] = useState(false)
  const [privatePhotos, setPrivatePhotos] = useState(false)
  const [exclusiveVideos, setExclusiveVideos] = useState(false)
  

  // États géolocalisation
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null)
  const [locationEnabled, setLocationEnabled] = useState(false)

  // Replier certains blocs par défaut sur mobile (petites améliorations UX)
  const [openExperienceFilters, setOpenExperienceFilters] = useState(false)
  const [openProfileFilters, setOpenProfileFilters] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDesktop = window.innerWidth >= 768
      setOpenExperienceFilters(isDesktop)
      setOpenProfileFilters(isDesktop)
    }
  }, [])

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
    },
    {
      id: 'salon2',
      name: 'Luxe Lausanne',
      username: 'luxe-lausanne',
      location: 'Lausanne',
      media: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop',
      profileImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop',
      mediaType: 'image',
      verified: true,
      premium: true,
      online: false,
      description: 'Services d\'accompagnement haut de gamme dans la région lausannoise. Discrétion et élégance garanties.',
      likes: 89,
      followers: 45,
      following: 8,
      isLiked: false,
      isFollowing: false,
      rating: 4.6,
      reviews: 89,
      languages: ['fr', 'en'],
      practices: [],
      services: ['Escort Internationale', 'Accompagnement', 'Événements Privés'],
      gallery: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
      stableKey: 'salon2-stable',
      type: 'salon',
      businessName: 'Luxe Services SARL',
      address: 'Avenue de la Gare 8',
      phone: '+41 21 987 65 43',
      website: 'www.luxe-lausanne.ch',
      capacity: 8,
      escortCount: 6
    },
    {
      id: 'salon3',
      name: 'Prestige Zurich',
      username: 'prestige-zurich',
      location: 'Zurich',
      media: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop',
      profileImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop',
      mediaType: 'image',
      verified: true,
      premium: true,
      online: true,
      description: 'Le salon le plus prestigieux de Zurich, proposant des services d\'escort exclusifs pour une clientèle exigeante.',
      likes: 156,
      followers: 112,
      following: 15,
      isLiked: false,
      isFollowing: false,
      rating: 4.9,
      reviews: 156,
      languages: ['de', 'en', 'fr'],
      practices: [],
      services: ['Escort VIP', 'Concierge Services', 'Travel Companion'],
      gallery: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
      stableKey: 'salon3-stable',
      type: 'salon',
      businessName: 'Prestige Zurich AG',
      address: 'Bahnhofstrasse 42',
      phone: '+41 44 555 77 88',
      capacity: 20,
      escortCount: 18
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
            // Clé stable pour éviter les problèmes de re-render
            stableKey: `${escort.id}-${index}`,
            lastSeen: !escort.online && Math.random() > 0.5 
              ? `il y a ${Math.floor(Math.random() * 30) + 1} minutes`
              : undefined
          }))
          
          // Combiner escortes et salons
          setProfiles([...transformedEscorts, ...mockSalons])
        } else {
          // Si pas d'escortes, afficher seulement les salons
          setProfiles(mockSalons)
        }
      } catch (error) {
        console.error('Erreur chargement profils:', error)
        // En cas d'erreur, afficher seulement les salons
        setProfiles(mockSalons)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProfiles()
    return () => ctrl.abort()
  }, [])

  // Filtrer les profils avec tous les critères
  const filteredProfiles = profiles.filter(profile => {
    // Recherche de base
    const matchesSearch = searchTerm === '' || 
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtre de catégories (sélection multiple)
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(category => {
      switch(category) {
        case 'escorte':
          return profile.type === 'escort' || !profile.type || (
            profile.services.some(service => 
              service.toLowerCase().includes('accompagnement') ||
              service.toLowerCase().includes('gfe') ||
              service.toLowerCase().includes('déjeuner') ||
              service.toLowerCase().includes('dîner')
            )
          )
        case 'salon':
          return profile.type === 'salon' || (
            profile.businessName && (
              profile.services.some(service => 
                service.toLowerCase().includes('salon') ||
                service.toLowerCase().includes('établissement') ||
                service.toLowerCase().includes('spa')
              )
            )
          )
        case 'massage':
          return profile.services.some(service => 
            service.toLowerCase().includes('massage') ||
            service.toLowerCase().includes('érotique') ||
            service.toLowerCase().includes('relaxant')
          )
        case 'vip':
          return profile.services.some(service => 
            service.toLowerCase().includes('vip') ||
            service.toLowerCase().includes('premium') ||
            service.toLowerCase().includes('luxe')
          ) || (profile.price && profile.price >= 300)
        case 'bdsm':
          return profile.services.some(service => 
            service.toLowerCase().includes('domination') ||
            service.toLowerCase().includes('soumise') ||
            service.toLowerCase().includes('fétiche') ||
            service.toLowerCase().includes('fessée') ||
            service.toLowerCase().includes('bdsm')
          )
        case 'médias privés':
          return profile.gallery && profile.gallery.length > 3 && profile.premium
        default:
          return true
      }
    })
    
    // Filtre ville et canton
    const matchesCity = selectedCity === '' || profile.location === selectedCity
    const matchesCanton = selectedCanton === '' || selectedCanton === 'ALL' || (() => {
      // Si "Tous les cantons" est sélectionné, afficher tous les profils
      if (selectedCanton === 'ALL') return true
      // Vérifier si la ville du profil appartient au canton sélectionné
      const cantonCities = swissCities[selectedCanton as keyof typeof swissCities]
      return cantonCities && cantonCities.includes(profile.location)
    })()
    
    // Géolocalisation et disponibilité
    const matchesAvailableNow = !availableNow || profile.online
    const matchesOutcall = !outcall || profile.outcall
    const matchesIncall = !incall || profile.incall
    
    // Âge et physique
    const matchesAgeRange = (profile.age || 25) >= ageRange[0] && (profile.age || 25) <= ageRange[1]
    const matchesHeightRange = (profile.height || 165) >= heightRange[0] && (profile.height || 165) <= heightRange[1]
    const matchesBodyType = bodyType === '' || profile.bodyType === bodyType
    const matchesHairColor = hairColor === '' || profile.hairColor === hairColor
    const matchesEyeColor = eyeColor === '' || profile.eyeColor === eyeColor
    const matchesBreastSize = breastSize === '' || profile.breastSize === breastSize
    
    // Services
    const matchesServices = services.length === 0 || 
      services.every(service => profile.services.includes(service))
    
    // Budget
    // Budget retiré
    const matchesBudget = true
    const matchesAcceptsCards = !acceptsCards || profile.acceptCards
    
    // Qualité
    const matchesVerified = !verified || profile.verified
    // Note minimale retirée
    const matchesRating = true
    const matchesReviews = profile.reviews >= minReviews
    
    // Langues
    const matchesLanguages = languages.length === 0 || 
      languages.some(lang => profile.languages.includes(lang))
    
    // Premium
    const matchesPremium = !premiumContent || profile.premium
    
    return matchesSearch && matchesCategory && matchesCity && matchesCanton && matchesAvailableNow && 
           matchesOutcall && matchesIncall && matchesAgeRange && 
           matchesHeightRange && matchesBodyType && matchesHairColor && 
           matchesEyeColor && matchesBreastSize && matchesServices && 
           matchesBudget && matchesAcceptsCards && matchesVerified && 
           matchesRating && matchesReviews && matchesLanguages && matchesPremium
  })

  // Trier les profils avec memo pour éviter les recalculs
  const sortedProfiles = React.useMemo(() => {
    return [...filteredProfiles].sort((a, b) => {
      // Les profils en pause vont automatiquement à la fin
      const aIsPaused = a.status === 'PAUSED'
      const bIsPaused = b.status === 'PAUSED'
      
      if (aIsPaused && !bIsPaused) return 1
      if (!aIsPaused && bIsPaused) return -1
      
      // Si même statut (actif/actif ou pause/pause), trier normalement
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

  // Adapter pageSize selon la largeur
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onResize = () => setPageSize(window.innerWidth >= 1024 ? 16 : 12)
      onResize()
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }
  }, [])

  // Profils affichés (pagination)
  const displayedProfiles = React.useMemo(() => {
    return sortedProfiles.slice(0, page * pageSize)
  }, [sortedProfiles, page, pageSize])

  // Fonctions utilitaires pour les filtres multi-sélection
  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  const handleProfileClick = (profileId: string) => {
    // Trouver le profil pour déterminer le type
    const profile = profiles.find(p => p.id === profileId)
    if (profile && profile.type === 'salon') {
      router.push(`/profile-test/club/club-luxe-geneva`)
      return
    }
    // Route publique réelle pour escortes (DB)
    router.push(`/profile/${encodeURIComponent(profileId)}`)
  }

  // Données pour les dropdowns
  const bodyTypes = ["Mince", "Normale", "Pulpeuse", "Athlétique", "Courbes", "Grande"]
  const hairColors = ["Blonde", "Brune", "Châtain", "Rousse", "Noir", "Gris", "Autre"]
  const eyeColors = ["Bleus", "Verts", "Marrons", "Noisette", "Gris", "Autre"]
  const ethnicities = ["Européenne", "Africaine", "Asiatique", "Latine", "Arabe", "Métisse", "Autre"]
  const breastSizes = ["A", "B", "C", "D", "E", "F", "G+"]
  
  // Liste complète des services/pratiques
  const servicesList = [
    // Services de base
    "69", "Anulingus (donne)", "Anulingus (reçois)", "Branlette seins", "Café Pipe",
    "Champagne doré", "Couple", "Cunnilingus", "Doigté anal", "Doigté vaginal",
    
    // Services avancés
    "Domination soft", "Double pénétration", "Duo", "Déjeuner/dîner", "Ejac Facial",
    "Ejac corps", "Ejac en bouche", "Ejac multiple OK", "Facesitting", "Fellation nature",
    
    // Services spécialisés
    "Fellation protégée", "Fellation royale", "Femme fontaine", "Fessées acceptées",
    "Fisting (donne)", "Fisting (reçois)", "French kiss", "Fétichisme", "GFE",
    "Gorge profonde", "Groupe orgie", "Jeux de rôles", "Lingerie", "Massage érotique",
    
    // Services premium
    "Masturbation", "Rapport sexuel", "Service VIP", "Sex toys", "Sodomie (donne)",
    "Sodomie (reçois)", "Soumise", "Striptease"
  ]
  
  const languagesList = ["Français", "Allemand", "Italien", "Anglais", "Espagnol", "Russe", "Ukrainien", "Arabe"]
  const timeSlotsList = ["Matin", "Après-midi", "Soir", "Nuit"]
  const availabilityList = ["Maintenant", "Aujourd'hui", "Cette semaine"]

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

  // Notifications visuelles retirées selon demande

  const handleFollow = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    // Si connecté, permettre l'ajout aux favoris
    setProfiles(prev => prev.map(profile => 
      profile.id === profileId 
        ? { ...profile, isFollowing: !profile.isFollowing }
        : profile
    ))
  }

  // Fonction pour calculer la distance entre deux points (formule de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distance en km
  }

  // Fonction pour obtenir la géolocalisation
  const requestLocation = () => {
    if (!navigator.geolocation) {
      // Notification retirée
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lon: longitude })
        setLocationEnabled(true)
        
        // Notification retirée
      },
      (error) => {
        console.log('Erreur géolocalisation:', error.message)
        let message = 'Impossible d\'obtenir votre position.'
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Accès à la géolocalisation refusé. Activez la localisation dans vos paramètres.'
        }
        // Notification retirée
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache pendant 5 minutes
      }
    )
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
      {/* Bouton burger (ouvre le menu global) */}
      <button
        onClick={() => { try { window.dispatchEvent(new CustomEvent('felora:menu:toggle')) } catch {} }}
        className="fixed top-4 left-4 z-[1001] w-10 h-10 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-black/70 hover:border-white/20"
        aria-label="Ouvrir le menu"
        title="Menu"
      >
        <Menu size={18} />
      </button>
      {/* Notifications visuelles retirées */}
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
              background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            FELORA
          </h1>
          <p 
            className="text-sm"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
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
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255, 107, 157, 0.5)'
                e.target.style.boxShadow = '0 0 30px rgba(255, 107, 157, 0.2)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                e.target.style.boxShadow = 'none'
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
              background: 'rgba(79, 209, 199, 0.15)',
              color: '#4FD1C7',
              border: '1px solid rgba(79, 209, 199, 0.3)'
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
            
            {/* Catégories déplacées ici */}
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
                        console.log('Catégories sélectionnées:', selectedCategories)
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
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                        }
                      }}
                    >
                      {category}
                    </button>
                  )
                })}
                
                {/* Bouton "Effacer" si des catégories sont sélectionnées */}
                {selectedCategories.length > 0 && (
                  <button 
                    onClick={() => {
                      setSelectedCategories([])
                      console.log('Toutes les catégories effacées')
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    Effacer tout
                  </button>
                )}
              </div>
            </div>

            {/* Géolocalisation compacte */}
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Localisation
              </h4>
              
              <div className="location-filters" style={{ 
                display: 'grid',
                gap: '10px',
                alignItems: 'center'
              }}>
                {/* Bouton Autour de moi compact */}
                <button
                  onClick={requestLocation}
                  aria-label="Activer la recherche à proximité"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: locationEnabled ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(79, 209, 199, 0.3)',
                    backgroundColor: locationEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(79, 209, 199, 0.1)',
                    color: locationEnabled ? '#10B981' : '#4FD1C7',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {locationEnabled ? '📍 Activé' : '📍 Près de moi'}
                </button>

                <select
                  value={selectedCanton}
                  onChange={(e) => {
                    setSelectedCanton(e.target.value)
                    if (e.target.value) setSelectedCity('')
                  }}
                  aria-label="Sélectionner un canton"
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
                  aria-label="Sélectionner une ville"
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

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  minWidth: '120px'
                }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {radius}km
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    aria-label="Rayon de recherche"
                    style={{ flex: 1, height: '4px' }}
                  />
                </div>
              </div>
              
              {/* Options de service compactes */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px', 
                marginTop: '12px' 
              }}>
                {[
                  { key: 'availableNow', label: 'Dispo maintenant', value: availableNow, setter: setAvailableNow },
                  { key: 'outcall', label: 'Se déplace', value: outcall, setter: setOutcall },
                  { key: 'incall', label: 'Reçoit', value: incall, setter: setIncall }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => filter.setter(!filter.value)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: filter.value ? 'rgba(79, 209, 199, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: filter.value ? '#4FD1C7' : 'rgba(255, 255, 255, 0.8)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '25px'
            }}>
              
              {/* Types de Service */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#ffffff' }}>
                  Types de Service
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    'Escorte indépendante', 'Escorte d\'agence', 'Escorte VIP', 
                    'Compagnon/Accompagnement', 'Rendez-vous dîner', 'Compagnon voyage',
                    'Service discret', 'Massage sensuel', 'Webcam / Appel vidéo'
                  ].map(serviceType => (
                    <button
                      key={serviceType}
                      onClick={() => toggleArrayItem(serviceTypes, serviceType, setServiceTypes)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: serviceTypes.includes(serviceType) ? 'rgba(255, 107, 157, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: serviceTypes.includes(serviceType) ? '#FF6B9D' : 'rgba(255, 255, 255, 0.8)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {serviceType}
                    </button>
                  ))}
                </div>
              </div>

              {/* Identité & Orientation retirés */}

              {/* Expériences & Styles */}
              <div>
                <button
                  onClick={() => setOpenExperienceFilters(v => !v)}
                  aria-expanded={openExperienceFilters}
                  style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#ffffff', background:'transparent', border:'none', padding:0, cursor:'pointer' }}
                >
                  Expériences & Styles {openExperienceFilters ? '▲' : '▼'}
                </button>
                {openExperienceFilters && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    'GFE (Girlfriend Experience)', 'PSE (Porn Star Experience)', 
                    'Dominant(e)', 'Soumis(e)', 'Switch', 'BDSM friendly',
                    'Jeu de rôle', 'Sensuel/Doux', 'Business/Social'
                  ].map(experience => (
                    <button
                      key={experience}
                      onClick={() => toggleArrayItem(experienceTypes, experience, setExperienceTypes)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: experienceTypes.includes(experience) ? 'rgba(183, 148, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: experienceTypes.includes(experience) ? '#B794F6' : 'rgba(255, 255, 255, 0.8)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {experience}
                    </button>
                  ))}
                </div>
                )}
              </div>

              {/* Profil & Physique */}
              <div>
                <button
                  onClick={() => setOpenProfileFilters(v => !v)}
                  aria-expanded={openProfileFilters}
                  style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#ffffff', background:'transparent', border:'none', padding:0, cursor:'pointer' }}
                >
                  Profil & Physique {openProfileFilters ? '▲' : '▼'}
                </button>
                {openProfileFilters && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                      Âge: {ageRange[0]} - {ageRange[1]} ans
                    </span>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                      <input
                        type="range"
                        min="18"
                        max="65"
                        value={ageRange[0]}
                        onChange={(e) => {
                          const min = Number(e.target.value)
                          setAgeRange([Math.min(min, ageRange[1]), ageRange[1]])
                        }}
                        style={{ flex: 1 }}
                      />
                      <input
                        type="range"
                        min="18"
                        max="65"
                        value={ageRange[1]}
                        onChange={(e) => {
                          const max = Number(e.target.value)
                          setAgeRange([ageRange[0], Math.max(max, ageRange[0])])
                        }}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                      Taille: {heightRange[0]} - {heightRange[1]} cm
                    </span>
                    <input
                      type="range"
                      min="150"
                      max="190"
                      value={heightRange[1]}
                      onChange={(e) => setHeightRange([heightRange[0], Number(e.target.value)])}
                      style={{ width: '100%', marginTop: '5px' }}
                    />
                  </div>
                  
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#1a1a1a' }}>Toutes corpulences</option>
                    {bodyTypes.map(type => (
                      <option key={type} value={type} style={{ backgroundColor: '#1a1a1a' }}>
                        {type}
                      </option>
                    ))}
                  </select>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={hairColor}
                      onChange={(e) => setHairColor(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#1a1a1a' }}>Cheveux</option>
                      {hairColors.map(color => (
                        <option key={color} value={color} style={{ backgroundColor: '#1a1a1a' }}>
                          {color}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={eyeColor}
                      onChange={(e) => setEyeColor(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#1a1a1a' }}>Yeux</option>
                      {eyeColors.map(color => (
                        <option key={color} value={color} style={{ backgroundColor: '#1a1a1a' }}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <select
                    value={breastSize}
                    onChange={(e) => setBreastSize(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#1a1a1a' }}>Taille poitrine</option>
                    {breastSizes.map(size => (
                      <option key={size} value={size} style={{ backgroundColor: '#1a1a1a' }}>
                        Bonnet {size}
                      </option>
                    ))}
                  </select>
                </div>
                )}
              </div>

              {/* Services */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#ffffff' }}>
                  Services & Spécialités
                </h4>
                <div style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  padding: '5px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '5px' }}>
                    {servicesList.map(service => (
                      <button
                        key={service}
                        onClick={() => toggleArrayItem(services, service, setServices)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: services.includes(service) ? 'rgba(255, 107, 157, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          color: services.includes(service) ? '#FF6B9D' : 'rgba(255, 255, 255, 0.8)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>
                {services.length > 0 && (
                  <div style={{ 
                    marginTop: '8px', 
                    fontSize: '12px', 
                    color: 'rgba(255, 255, 255, 0.6)' 
                  }}>
                    {services.length} service{services.length > 1 ? 's' : ''} sélectionné{services.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Tarifs & Budget retirés */}

              {/* Qualité (Note retirée) */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#ffffff' }}>
                  Qualité & Vérification
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { key: 'verified', label: 'Profil vérifié', value: verified, setter: setVerified }
                    ].map(filter => (
                      <button
                        key={filter.key}
                        onClick={() => filter.setter(!filter.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: filter.value ? 'rgba(255, 107, 157, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          color: filter.value ? '#FF6B9D' : 'rgba(255, 255, 255, 0.8)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Langues */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#ffffff' }}>
                  Communication
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {languagesList.map(language => (
                    <button
                      key={language}
                      onClick={() => toggleArrayItem(languages, language, setLanguages)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: languages.includes(language) ? 'rgba(255, 107, 157, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: languages.includes(language) ? '#FF6B9D' : 'rgba(255, 255, 255, 0.8)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>

            </div>
            
            {/* Tri et actions */}
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
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    // Appliquer les filtres et fermer le panneau (sans notification)
                    setShowFilters(false)
                  }}
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 157, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Rechercher ({filteredProfiles.length})
                </button>
                
                <button
                  onClick={() => {
                    // Reset tous les filtres
                    setSelectedCity('')
                    setSelectedCanton('')
                    setRadius(10)
                    setAvailableNow(false)
                    setOutcall(false)
                    setIncall(false)
                    setAgeRange([18, 65])
                    setHeightRange([150, 180])
                    setBodyType('')
                    setHairColor('')
                    setEyeColor('')
                    setBreastSize('')
                    setServices([])
                    setAcceptsCards(false)
                    setVerified(false)
                    // minRating retiré
                    setLanguages([])
                    setLocationEnabled(false)
                    setUserLocation(null)
                    // Nouveaux filtres
                    setServiceTypes([])
                    setGender('')
                    setSexualOrientation([])
                    setExperienceTypes([])
                    setSelectedCategories([])
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Réinitialiser
                </button>
              </div>
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
                border: '3px solid rgba(255, 107, 157, 0.2)',
                borderTop: '3px solid #FF6B9D'
              }}
            />
            <span 
              className="ml-4 text-lg"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
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
                background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {profiles.length === 0 ? 'Aucun profil disponible' : 'Aucun résultat'}
            </h3>
            <p 
              className="text-lg max-w-md"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            >
              {profiles.length === 0 ? 
                'Revenez plus tard pour découvrir nos profils d\'exception' : 
                'Essayez de modifier vos critères de recherche'
              }
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
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)'
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(79, 209, 199, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(79, 209, 199, 0.4)'
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
