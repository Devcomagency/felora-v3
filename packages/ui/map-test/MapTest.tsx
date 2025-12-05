'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Map, { Marker, Popup, ViewStateChangeEvent } from 'react-map-gl/maplibre'
import { MapPin, SlidersHorizontal, BadgeCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import useSWR from 'swr'
import Supercluster from 'supercluster'
import 'maplibre-gl/dist/maplibre-gl.css'
import track from '@/lib/analytics/tracking'

// Types
type EscortData = {
  id: string
  name: string
  lat: number
  lng: number
  avatar?: string
  city: string
  services?: string[]
  languages?: string[]
  category?: string
  establishmentType?: string // Type d'établissement pour les clubs
  verified: boolean
  isActive: boolean
  type?: 'escort' | 'club' // Type pour différencier escorts et clubs
  isCurrentUser?: boolean
}

type ClusterFeature = {
  type: 'Feature'
  properties: {
    cluster: boolean
    cluster_id?: number
    point_count?: number
    escorts?: EscortData[]
  }
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}


// Fetcher for SWR
const fetcher = async (url: string) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)
  
  try {
    const res = await fetch(url, { 
      cache: 'no-store',
      signal: controller.signal 
    })
    clearTimeout(timeoutId)
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

export default function MapTest() {
  const t = useTranslations('map')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Parse URL parameters for initial view
  const initialViewState = useMemo(() => {
    const centerParam = searchParams.get('center')
    const zoomParam = searchParams.get('zoom')
    
    // Vue large par défaut sur la Suisse (Genève, Lausanne, Zurich)
    let latitude = 46.8182 // Switzerland center
    let longitude = 8.2275
    let zoom = 7 // Vue large de la Suisse
    
    // Si un centre est spécifié dans l'URL (pour les mises à jour depuis le dashboard)
    if (centerParam) {
      const [lat, lng] = centerParam.split(',').map(Number)
      if (!isNaN(lat) && !isNaN(lng)) {
        latitude = lat
        longitude = lng
        zoom = 15 // Zoom proche pour une adresse spécifique
      }
    }
    
    if (zoomParam) {
      const z = Number(zoomParam)
      if (!isNaN(z)) {
        zoom = Math.max(1, Math.min(20, z))
      }
    }
    
    return { latitude, longitude, zoom }
  }, [searchParams])

  // State
  const [viewState, setViewState] = useState(initialViewState)
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEscort, setSelectedEscort] = useState<EscortData | null>(null)

  // 📊 Track map opened on mount
  useEffect(() => {
    track.mapOpened('default')
  }, [])
  const [clusterPopup, setClusterPopup] = useState<{
    latitude: number
    longitude: number
    escorts: EscortData[]
  } | null>(null)
  
  // 🎯 ÉTAT POUR LE PROFIL ESCORT CONNECTÉ
  const [currentUserProfile, setCurrentUserProfile] = useState<EscortData | null>(null)
  const [showVisibleProfiles, setShowVisibleProfiles] = useState(false)
  const [isPanelOpening, setIsPanelOpening] = useState(false)

  // Fonction pour décaler les coordonnées selon le mode de confidentialité
  const applyPrivacyOffset = (lat: number, lng: number, addressPrivacy: string | null | undefined) => {
    if (!lat || !lng || addressPrivacy !== 'approximate') {
      return { lat, lng }
    }

    const maxOffset = 0.00135 // ≈150m
    const coordsStr = `${lat},${lng}`
    let hash = 0
    for (let i = 0; i < coordsStr.length; i++) {
      const char = coordsStr.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    const normalizedHash1 = ((hash & 0x7FFFFFFF) % 1000) / 1000 * 2 - 1
    const normalizedHash2 = ((((hash >> 8) & 0x7FFFFFFF) % 1000) / 1000 * 2 - 1)
    
    const offsetLat = normalizedHash1 * maxOffset
    const offsetLng = normalizedHash2 * maxOffset
    
    return {
      lat: lat + offsetLat,
      lng: lng + offsetLng
    }
  }

  // 🎯 RÉCUPÉRER LE PROFIL ESCORT CONNECTÉ
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      try {
        const response = await fetch('/api/me/escort-profile')

        if (response.ok) {
          const profile = await response.json()

          if (profile && profile.latitude && profile.longitude) {
            // Appliquer le décalage selon le mode de confidentialité
            const coords = applyPrivacyOffset(profile.latitude, profile.longitude, profile.addressPrivacy)
            
            const escortData: EscortData = {
              id: profile.escortId || 'FIXED_ID',
              name: profile.stageName || 'Mon Profil',
              lat: coords.lat,
              lng: coords.lng,
              city: profile.city || '',
              services: profile.services || [],
              languages: profile.languages || {},
              verified: profile.isVerifiedBadge || false,
              isActive: profile.status === 'ACTIVE'
            }
            setCurrentUserProfile(escortData)
          }
        }
      } catch (error) {
        // L'utilisateur n'est pas un escort - comportement normal
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur lors du chargement du profil escort:', error)
        }
      }
    }

    fetchCurrentUserProfile()
  }, [])

  // 🎯 ÉCOUTER LES ÉVÉNEMENTS D'ADRESSE CHANGÉE POUR SYNCHRONISER LA CARTE
  useEffect(() => {
    const handleAddressChanged = (event: any) => {
      const { coordinates, addressPrivacy } = event.detail

      if (coordinates && coordinates.lat && coordinates.lng) {
        // Appliquer le décalage selon le mode de confidentialité
        const displayCoords = applyPrivacyOffset(coordinates.lat, coordinates.lng, addressPrivacy)
        
        // Mettre à jour la vue de la carte avec les coordonnées décalées
        setViewState(prev => ({
          ...prev,
          latitude: displayCoords.lat,
          longitude: displayCoords.lng,
          zoom: Math.max(prev.zoom, 15)
        }))

        // 🎯 METTRE À JOUR LE PROFIL ESCORT CONNECTÉ avec les coordonnées décalées
        if (currentUserProfile) {
          setCurrentUserProfile(prev => prev ? {
            ...prev,
            lat: displayCoords.lat,
            lng: displayCoords.lng
          } : null)
        }

        // Mettre à jour l'URL pour refléter la nouvelle position
        const newCenter = `${coordinates.lat},${coordinates.lng}`
        router.push(`/map?center=${newCenter}&zoom=15`, { scroll: false })
      }
    }

    // 🎯 ÉCOUTER LES ÉVÉNEMENTS STORAGE POUR COMMUNICATION ENTRE ONGLETS
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'felora_address_update' && event.newValue) {
        try {
          const eventData = JSON.parse(event.newValue)
          handleAddressChanged({ detail: eventData })
          localStorage.removeItem('felora_address_update')
        } catch (error) {
          localStorage.removeItem('felora_address_update')
        }
      }
    }

    window.addEventListener('addressChanged', handleAddressChanged)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('addressChanged', handleAddressChanged)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [router, currentUserProfile])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  // Refs
  const mapRef = useRef<any>(null)
  const throttleTimer = useRef<number | null>(null)

  // Create stable SWR key based on bounds - use real escorts API
  const swrKey = useMemo(() => {
    return '/api/escorts' // Use real escorts API instead of geo search
  }, [])

  // Fetch escorts data with SWR
  const { data, error, isLoading } = useSWR(
    swrKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
      keepPreviousData: true
    }
  )

  // Fetch clubs data with SWR
  const { data: clubsData, error: clubsError, isLoading: clubsLoading } = useSWR(
    '/api/clubs',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
      keepPreviousData: true
    }
  )

  // Transform real API data to match expected format + include current user profile + clubs
  const allEscorts = useMemo(() => {
    const apiEscorts = (data?.items || []).map((escort: any) => {
      let avatar = escort.profilePhoto || escort.avatar || escort.photo || ''

      // 🔧 CORRECTION: Fix les URLs qui commencent par "undefined/"
      if (avatar && avatar.includes('undefined/')) {
        avatar = avatar.replace(/^undefined\//, 'https://media.felora.ch/')
      }

      return {
        id: escort.id,
        name: escort.stageName || 'Escort',
        lat: escort.latitude || 46.8182, // Default to Switzerland center
        lng: escort.longitude || 8.2275,
        avatar,
        city: escort.city || 'Suisse',
        services: escort.services || [],
        languages: escort.languages || [],
        category: escort.category || null,
        verified: escort.isVerifiedBadge || false,
        isActive: escort.isActive || true,
        type: 'escort' as const,
        isCurrentUser: false // Marquer comme profil d'un autre utilisateur
      }
    })

    // Add clubs data - L'API clubs retourne 'data' au lieu de 'items'
    const apiClubs = (clubsData?.data || [])
      .filter((club: any) => club.latitude && club.longitude) // Ne garder que les clubs avec coordonnées
      .map((club: any) => {
        let avatar = club.avatar || club.cover || ''

        // Fix undefined/ URLs for clubs too
        if (avatar && avatar.includes('undefined/')) {
          avatar = avatar.replace(/^undefined\//, 'https://media.felora.ch/')
        }

        return {
          id: club.id,
          name: club.name || 'Club',
          lat: club.latitude,
          lng: club.longitude,
          avatar,
          city: club.city || 'Suisse',
          services: club.services?.services || [],
          languages: club.services?.languages || [],
          category: 'club',
          establishmentType: club.establishmentType || 'Club',
          verified: club.verified || false,
          isActive: club.isActive || false,
          type: 'club' as const,
          isCurrentUser: false
        }
      })

    // Combiner escorts et clubs
    const combined = [...apiEscorts, ...apiClubs]

    // 🎯 GÉRER LE PROFIL ESCORT CONNECTÉ
    if (currentUserProfile) {
      const existingIndex = combined.findIndex((escort: any) => escort.id === currentUserProfile.id)

      if (existingIndex >= 0) {
        combined[existingIndex] = {
          ...currentUserProfile,
          isCurrentUser: true
        }
      } else {
        combined.unshift({
          ...currentUserProfile,
          isCurrentUser: true
        })
      }
    }

    return combined
  }, [data, clubsData, currentUserProfile])

  // Filter escorts
  const filteredEscorts = useMemo(() => {
    let result = allEscorts

    // Filtre par catégories avec mapping DB → UI
    if (selectedCategories.length > 0) {
      result = result.filter((escort: EscortData) => {
        if (escort.type === 'club') {
          return selectedCategories.includes('club')
        }

        if (!escort.category) return false

        const categoryMap: Record<string, string> = {
          'ESCORT': 'escort',
          'MASSEUSE': 'masseuse_erotique',
          'DOMINATRICE': 'dominatrice_bdsm',
          'TRANSSEXUELLE': 'transsexuel'
        }

        const normalizedCategory = categoryMap[escort.category.toUpperCase()] || escort.category.toLowerCase()
        return selectedCategories.includes(normalizedCategory)
      })
    }

    return result
  }, [allEscorts, selectedCategories])

  // Create supercluster
  const supercluster = useMemo(() => {
    const cluster = new Supercluster({
      radius: 40,
      maxZoom: 14,
      minZoom: 0,
      minPoints: 2
    })

    const points = filteredEscorts.map((escort: EscortData) => ({
      type: 'Feature' as const,
      properties: {
        cluster: false,
        escortId: escort.id,
        escort: escort
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [escort.lng, escort.lat] as [number, number]
      }
    }))

    cluster.load(points)
    return cluster
  }, [filteredEscorts])

  // Get clusters/points for current view
  const clusters = useMemo(() => {
    if (!bounds || !supercluster) return []
    
    const [west, south, east, north] = bounds
    return supercluster.getClusters(
      [west, south, east, north],
      Math.floor(viewState.zoom)
    )
  }, [bounds, supercluster, viewState.zoom])

  // Visible escorts count based on current bounds (for status bar)
  const visibleCount = useMemo(() => {
    if (!bounds) return filteredEscorts.length
    const [west, south, east, north] = bounds
    return filteredEscorts.filter((e: EscortData) => (
      e.lng >= west && e.lng <= east && e.lat >= south && e.lat <= north
    )).length
  }, [bounds, filteredEscorts])

  // Visible escorts list (only those in current map bounds)
  const visibleEscorts = useMemo(() => {
    if (!bounds) return filteredEscorts.slice(0, 30)
    const [west, south, east, north] = bounds
    return filteredEscorts.filter((e: EscortData) => (
      e.lng >= west && e.lng <= east && e.lat >= south && e.lat <= north
    )).slice(0, 30)
  }, [bounds, filteredEscorts])

  // Handle view state changes with throttling
  const onViewStateChange = useCallback((evt: ViewStateChangeEvent) => {
    const { latitude, longitude, zoom } = evt.viewState
    setViewState({ latitude, longitude, zoom })

    // Close popups on zoom change
    if (Math.abs(viewState.zoom - zoom) > 0.1) {
      setSelectedEscort(null)
      setClusterPopup(null)
    }

    // Throttle bounds calculation
    if (throttleTimer.current) {
      clearTimeout(throttleTimer.current)
    }

    throttleTimer.current = window.setTimeout(() => {
      if (mapRef.current) {
        const map = mapRef.current.getMap()
        const mapBounds = map.getBounds()
        
        setBounds([
          mapBounds.getWest(),
          mapBounds.getSouth(),
          mapBounds.getEast(),
          mapBounds.getNorth()
        ])
      }
    }, 300)
  }, [viewState.zoom])

  // Handle cluster click
  const onClusterClick = useCallback((cluster: any) => {
    const clusterId = cluster.properties.cluster_id
    const zoom = supercluster.getClusterExpansionZoom(clusterId)

    if (zoom > viewState.zoom && zoom <= 14) {
      // 📊 Track map zoom
      track.mapZoom(Math.min(zoom + 1, 16))

      // Zoom to expand cluster
      setViewState({
        latitude: cluster.geometry.coordinates[1],
        longitude: cluster.geometry.coordinates[0],
        zoom: Math.min(zoom + 1, 16)
      })
    } else {
      // Show cluster popup
      const clusterEscorts = supercluster
        .getLeaves(clusterId, Infinity)
        .map((point: any) => point.properties.escort)
        
      setClusterPopup({
        latitude: cluster.geometry.coordinates[1],
        longitude: cluster.geometry.coordinates[0],
        escorts: clusterEscorts
      })
    }
  }, [supercluster, viewState.zoom])

  // Geolocation function
  const locateUser = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoError(t('geolocation.notSupported'))
      return
    }

    // 🔒 Vérifier les permissions avant de demander la géolocalisation
    if (typeof navigator.permissions !== 'undefined') {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' })
        if (result.state === 'denied') {
          setGeoError(t('geolocation.permissionDenied'))
          return
        }
      } catch (err) {
        // Silent fail - navigateur ne supporte pas permissions API
      }
    }

    setIsLocating(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ latitude, longitude })
        setViewState({
          latitude,
          longitude,
          zoom: Math.max(viewState.zoom, 14)
        })
        setIsLocating(false)
      },
      (error) => {
        let errorMessage = t('geolocation.errorDefault')
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('geolocation.permissionDenied')
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('geolocation.unavailable')
            break
          case error.TIMEOUT:
            errorMessage = t('geolocation.timeout')
            break
        }
        setGeoError(errorMessage)
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 60000
      }
    )
  }, [viewState.zoom, t])

  // Initialize bounds on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        const map = mapRef.current.getMap()
        const mapBounds = map.getBounds()
        
        setBounds([
          mapBounds.getWest(),
          mapBounds.getSouth(),
          mapBounds.getEast(),
          mapBounds.getNorth()
        ])
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* CSS Styles pour les popups */}
      <style jsx global>{`
        /* Masquer le cadre blanc des popups MapLibre */
        .felora-popup .maplibregl-popup-content {
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .felora-popup .maplibregl-popup-tip {
          border-top-color: rgba(13, 13, 13, 0.95) !important;
          border-bottom-color: rgba(13, 13, 13, 0.95) !important;
        }

        .felora-popup .maplibregl-popup-close-button {
          color: rgba(255, 255, 255, 0.7) !important;
          font-size: 18px !important;
          right: 8px !important;
          top: 8px !important;
          width: 24px !important;
          height: 24px !important;
          border-radius: 50% !important;
          background: rgba(0, 0, 0, 0.5) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .felora-popup .maplibregl-popup-close-button:hover {
          background: rgba(255, 107, 157, 0.2) !important;
          border-color: rgba(255, 107, 157, 0.4) !important;
          color: #FF6B9D !important;
        }

        /* Masquer les carrés de chargement des tuiles */
        .maplibregl-canvas-container canvas {
          background: #1A1A1A !important;
        }

        /* Transition fluide pour les tuiles */
        .maplibregl-canvas {
          image-rendering: auto !important;
          image-rendering: crisp-edges !important;
          image-rendering: -webkit-optimize-contrast !important;
        }
      `}</style>
      
      <div className="relative w-full h-screen bg-felora-void overflow-hidden">
      {/* Back Button - Top Left */}
      <button
        onClick={() => router.back()}
        className={`fixed top-4 left-4 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          showVisibleProfiles || isPanelOpening ? 'opacity-0 pointer-events-none' : ''
        }`}
        style={{
          background: 'rgba(13, 13, 13, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'white',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}
        aria-label={t('backButton.ariaLabel')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      {/* Map Container */}
      <div className="absolute inset-0" style={{ backgroundColor: '#1A1A1A' }}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={onViewStateChange}
          onClick={() => {
            // Fermer les popups quand on clique dans le vide
            setSelectedEscort(null)
            setClusterPopup(null)
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={{
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: [
                  'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                ],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
              }
            },
            layers: [
              {
                id: 'osm-tiles',
                type: 'raster',
                source: 'osm-tiles'
              }
            ]
          }}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker latitude={userLocation.latitude} longitude={userLocation.longitude}>
              <div
                aria-label={t('userLocation.ariaLabel')}
                title={t('userLocation.title')}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 0 4px rgba(16,185,129,0.25), 0 0 0 1px rgba(255,255,255,0.9)'
                }}
              />
            </Marker>
          )}

          {/* Render clusters and individual markers */}
          {clusters.map((cluster, index) => {
            const [longitude, latitude] = cluster.geometry.coordinates
            const { cluster: isCluster, point_count } = cluster.properties

            if (isCluster) {
              // Cluster marker
              return (
                <Marker
                  key={`cluster-${index}`}
                  latitude={latitude}
                  longitude={longitude}
                  onClick={(e) => {
                    e.originalEvent.stopPropagation()
                    onClusterClick(cluster)
                  }}
                >
                  <div 
                    className="flex items-center justify-center w-12 h-12 rounded-full cursor-pointer transform hover:scale-110 transition-transform"
                    style={{
                      background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 4px 20px rgba(255, 107, 157, 0.4)',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'white'
                    }}
                    role="button"
                    aria-label={t('cluster.ariaLabel', { count: point_count })}
                  >
                    {point_count}
                  </div>
                </Marker>
              )
            } else {
              // Individual escort marker
              const escort = cluster.properties.escort
              return (
                <Marker
                  key={escort.id}
                  latitude={latitude}
                  longitude={longitude}
                  onClick={(e) => {
                    e.originalEvent.stopPropagation()
                    setSelectedEscort(escort)
                  }}
                >
                  <div
                    className="w-10 h-10 cursor-pointer transform hover:scale-110 transition-transform relative"
                    style={{
                      background: escort.type === 'club'
                        ? 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)' // Orange-doré pour les clubs
                        : escort.isActive
                          ? 'linear-gradient(135deg, #4FD1C7 0%, #00D4AA 100%)' // Turquoise pour les escorts
                          : 'rgba(255, 255, 255, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: escort.type === 'club'
                        ? '0 4px 20px rgba(255, 165, 0, 0.4)'
                        : '0 4px 20px rgba(79, 209, 199, 0.4)',
                      borderRadius: escort.type === 'club' ? '0' : '50%',
                      clipPath: escort.type === 'club'
                        ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                        : 'none'
                    }}
                  >
                    {escort.avatar ? (
                      <img
                        src={escort.avatar}
                        alt={escort.name}
                        loading="eager"
                        className="w-full h-full object-cover"
                        style={{
                          borderRadius: escort.type === 'club' ? '0' : '50%',
                          clipPath: escort.type === 'club'
                            ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                            : 'none'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = '/logo-principal.png'
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-500/20"
                        style={{
                          clipPath: escort.type === 'club'
                            ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                            : 'none'
                        }}
                      >
                        <span className="text-white font-bold text-lg">
                          {escort.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    {escort.verified && (
                      <div className="absolute -top-1 -right-1">
                        <BadgeCheck className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                      </div>
                    )}
                  </div>
                </Marker>
              )
            }
          })}

          {/* Escort Popup */}
          {selectedEscort && (
            <Popup
              latitude={selectedEscort.lat}
              longitude={selectedEscort.lng}
              onClose={() => setSelectedEscort(null)}
              closeOnClick={false}
              className="felora-popup"
            >
              <div
                className="p-4 rounded-xl w-[90vw] sm:min-w-[320px] max-w-[400px]"
                style={{
                  background: 'rgba(13, 13, 13, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
                }}
              >
                {/* Portrait compact, UX-friendly */}
                <div className="w-full rounded-lg overflow-hidden mb-3 relative" style={{ height: 200 }}>
                  <img
                    src={selectedEscort.avatar || '/default-avatar.svg'}
                    alt={selectedEscort.name}
                    loading="eager"
                    onError={(e) => {
                      e.currentTarget.src = '/default-avatar.svg'
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                  />
                  {selectedEscort.verified && (
                    <div className="absolute top-2 left-2">
                      <BadgeCheck className="w-7 h-7" style={{ color: '#4FD1C7' }} />
                    </div>
                  )}
                </div>
                {/* Title area */}
                <div className="mb-2 flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base leading-tight truncate">{selectedEscort.name}</h3>
                    <p className="text-white/70 text-sm truncate">{selectedEscort.city}</p>
                  </div>
                </div>

                {selectedEscort.services && selectedEscort.services.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {selectedEscort.services.slice(0, 3).map(service => (
                        <span 
                          key={service}
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            background: 'rgba(255, 107, 157, 0.2)',
                            color: '#FF6B9D'
                          }}
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    router.push(`/profile/${selectedEscort.id}`)
                  }}
                  className="w-full py-2 rounded-lg font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
                    color: 'white'
                  }}
                >
                  {t('popup.viewProfile')}
                </button>
              </div>
            </Popup>
          )}

          {/* Cluster Popup */}
          {clusterPopup && (
            <Popup
              latitude={clusterPopup.latitude}
              longitude={clusterPopup.longitude}
              onClose={() => setClusterPopup(null)}
              closeOnClick={false}
              className="felora-popup"
            >
              <div
                className="p-4 rounded-xl w-[90vw] sm:min-w-[320px] max-w-[400px]"
                style={{
                  background: 'rgba(13, 13, 13, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
                }}
              >
                <h3 className="text-white font-semibold mb-3">
                  {t('clusterPopup.title', { count: clusterPopup.escorts.length })}
                </h3>
                
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {clusterPopup.escorts.map(escort => (
                    <div 
                      key={escort.id}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => {
                        setClusterPopup(null)
                        setSelectedEscort(escort)
                      }}
                    >
                      {escort.avatar ? (
                        <img
                          src={escort.avatar}
                          alt={escort.name}
                          loading="eager"
                          onError={(e) => {
                            e.currentTarget.src = '/logo-principal.png'
                          }}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                          <span className="text-white font-bold text-xs">
                            {escort.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{escort.name}</p>
                        <p className="text-white/60 text-xs">{escort.city}</p>
                      </div>
                      {escort.verified && (
                        <BadgeCheck className="w-5 h-5" style={{ color: '#4FD1C7' }} />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    // Zoom to show all escorts in cluster
                    setViewState({
                      latitude: clusterPopup.latitude,
                      longitude: clusterPopup.longitude,
                      zoom: Math.min(viewState.zoom + 2, 16)
                    })
                    setClusterPopup(null)
                  }}
                  className="w-full mt-3 py-2 rounded-lg font-medium"
                  style={{
                    background: 'rgba(255, 107, 157, 0.2)',
                    border: '1px solid rgba(255, 107, 157, 0.4)',
                    color: '#FF6B9D'
                  }}
                >
                  {t('clusterPopup.zoomIn')}
                </button>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Status Bar - Clickable */}
      <div
        onClick={() => {
          if (!showVisibleProfiles) {
            setIsPanelOpening(true)
            setTimeout(() => setShowVisibleProfiles(true), 50)
            setTimeout(() => setIsPanelOpening(false), 400)
          } else {
            setShowVisibleProfiles(false)
          }
        }}
        className="fixed bottom-20 left-4 px-3 py-2 rounded-xl text-sm text-white font-medium cursor-pointer transition-all hover:scale-105"
        style={{
          background: showVisibleProfiles 
            ? 'linear-gradient(135deg, #4FD1C7 0%, #00D4AA 100%)'
            : 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 10px 26px rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.05)'
        }}
        role="button"
        aria-label={t('statusBar.ariaLabel')}
      >
        {t('statusBar.profilesVisible', { count: visibleCount })}
        {isLoading && ' • ' + t('statusBar.loading')}
        {error && ' • ' + t('statusBar.error')}
      </div>

      {/* Backdrop pour fermer le modal */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Filters Panel - Juste au-dessus du bouton filtre */}
      {showFilters && (
        <div
          className="fixed right-4 p-4 rounded-xl w-[90vw] max-w-[400px] animate-in slide-in-from-bottom duration-300 z-50"
          onClick={(e) => e.stopPropagation()}
          style={{
            bottom: 'calc(8rem + 68px)', // 8rem = bottom-32 + 68px de marge pour plus d'espace
            background: 'rgba(13, 13, 13, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
          }}
        >
          <div className="flex flex-col gap-3">
            {/* Category filters */}
            <div className="flex flex-col gap-2">
              {[
                { value: 'escort', label: t('filters.categories.escort') },
                { value: 'masseuse_erotique', label: t('filters.categories.masseuse') },
                { value: 'dominatrice_bdsm', label: t('filters.categories.dominatrice') },
                { value: 'transsexuel', label: t('filters.categories.trans') },
                { value: 'club', label: t('filters.categories.club') }
              ].map(category => (
                <button
                  key={category.value}
                  onClick={() => {
                    setSelectedCategories(prev =>
                      prev.includes(category.value)
                        ? prev.filter(c => c !== category.value)
                        : [...prev, category.value]
                    )
                  }}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: selectedCategories.includes(category.value)
                      ? 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: selectedCategories.includes(category.value)
                      ? '1px solid rgba(255, 107, 157, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    color: selectedCategories.includes(category.value) ? 'white' : 'rgba(255, 255, 255, 0.8)'
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Clear button */}
            {selectedCategories.length > 0 && (
              <button
                onClick={() => {
                  setSelectedCategories([])
                }}
                className="w-full py-2 rounded-lg text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                {t('filters.clearFilters')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bouton Filtres - Au-dessus du bouton localisation */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        aria-label={t('filters.ariaLabel')}
        aria-expanded={showFilters}
        aria-pressed={showFilters}
        className="fixed right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
        style={{
          bottom: '138px',
          background: showFilters
            ? 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)'
            : 'rgba(13, 13, 13, 0.7)',
          backdropFilter: 'blur(20px)',
          border: showFilters
            ? '1px solid rgba(255, 107, 157, 0.4)'
            : '1px solid rgba(255, 255, 255, 0.15)',
          color: 'white',
          boxShadow: showFilters
            ? '0 14px 34px rgba(255, 107, 157, 0.4)'
            : '0 8px 24px rgba(0, 0, 0, 0.3)',
          width: 52,
          height: 52
        }}
      >
        {showFilters ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <SlidersHorizontal size={20} />
        )}
      </button>

      {/* Geolocation Button */}
      <button
        onClick={locateUser}
        disabled={isLocating}
        aria-label={t('geolocation.ariaLabel')}
        aria-pressed={userLocation !== null}
        aria-busy={isLocating}
        className="fixed bottom-20 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
        style={{
          background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          color: '#FFFFFF',
          boxShadow: '0 14px 34px rgba(0,0,0,0.35), 0 0 0 3px rgba(255,107,157,0.25)',
          width: 52,
          height: 52
        }}
        title={t('geolocation.title')}
      >
        {isLocating ? (
          <div
            className="w-5 h-5 rounded-full animate-spin"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, transparent 70%, white 70%)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
          />
        ) : (
          <MapPin width={20} height={20} />
        )}
      </button>

      {/* Overlay avec effet de blur */}
      {(showVisibleProfiles || isPanelOpening) && (
        <div 
          className="fixed inset-0 z-30 transition-opacity duration-300"
          style={{
            background: isPanelOpening ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => {
            setShowVisibleProfiles(false)
            setIsPanelOpening(false)
          }}
        />
      )}

      {/* Sidebar Premium - Profils visibles */}
      {(showVisibleProfiles || isPanelOpening) && (
        <div 
          className="fixed top-0 left-0 h-full w-[95vw] sm:w-[420px] max-w-[450px] z-40 transition-transform duration-300 ease-out"
          style={{
            background: 'linear-gradient(to right, rgba(13, 13, 13, 0.98) 0%, rgba(13, 13, 13, 0.95) 100%)',
            backdropFilter: 'blur(40px)',
            boxShadow: '20px 0 80px rgba(0, 0, 0, 0.8), inset -1px 0 0 rgba(255, 255, 255, 0.1)',
            transform: showVisibleProfiles ? 'translateX(0)' : 'translateX(-100%)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10">
                 <div>
                   <h3 className="text-white font-semibold text-base sm:text-lg">{t('sidebar.title')}</h3>
                   <p className="text-white/60 text-xs sm:text-sm">{t('sidebar.subtitle', { count: visibleEscorts.length })}</p>
                 </div>
            <button
              onClick={() => setShowVisibleProfiles(false)}
              className="text-white/60 hover:text-white transition-colors text-xl sm:text-2xl p-1"
            >
              ✕
            </button>
          </div>

               {/* Liste des profils */}
               <div className="overflow-y-auto p-3 sm:p-4 pb-20 sm:pb-8" style={{ height: 'calc(100vh - 70px)' }}>
                 {visibleEscorts.length === 0 ? (
                   <div className="text-center py-8 text-white/40">
                     {t('sidebar.noProfiles')}
                   </div>
                 ) : (
                   <div className="space-y-3">
                     {visibleEscorts.map(escort => (
                       <div 
                         key={escort.id}
                         className="group relative w-full rounded-xl border transition-all duration-500 cursor-pointer border-white/10 hover:border-pink-500/30 hover:shadow-2xl"
                         style={{
                           background: 'rgba(255,255,255,0.03)'
                         }}
                         onClick={() => {
                           setSelectedEscort(escort)
                           setShowVisibleProfiles(false)
                           // Centrer sur l'escort
                           setViewState(prev => ({
                             ...prev,
                             latitude: escort.lat,
                             longitude: escort.lng,
                             zoom: Math.max(prev.zoom, 16)
                           }))
                         }}
                       >
                         {/* Gradient overlay on hover */}
                         <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent" />
                         
                         <div className="relative p-3 flex items-center gap-3">
                           {/* Avatar */}
                           <div className="shrink-0">
                             <div
                               className="w-20 h-20 rounded-xl border shadow-lg transition-transform group-hover:scale-110 duration-500 overflow-hidden"
                               style={{
                                 background: 'linear-gradient(to bottom right, #EC489920, #EC489915)',
                                 borderColor: '#EC489930',
                                 boxShadow: '0 4px 12px #EC489910'
                               }}
                             >
                             {escort.avatar ? (
                               <img
                                 src={escort.avatar}
                                 alt={escort.name}
                                 loading="eager"
                                 onError={(e) => {
                                   e.currentTarget.src = '/logo-principal.png'
                                 }}
                                 className="w-full h-full object-cover"
                               />
                               ) : (
                                 <div 
                                   className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
                                   style={{
                                     background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)'
                                   }}
                                 >
                                   {escort.name.charAt(0)}
                                 </div>
                               )}
                               {escort.verified && (
                                 <div className="absolute -top-1 -right-1">
                                   <BadgeCheck className="w-5 h-5" style={{ color: '#4FD1C7' }} />
                                 </div>
                               )}
                             </div>
                           </div>
                           
                           {/* Content */}
                           <div className="flex-1 min-w-0 max-w-[140px]">
                             <h3 className="text-white font-bold text-xs mb-1 group-hover:text-white transition-colors truncate">
                               {escort.name}
                             </h3>
                             {(escort.category || escort.establishmentType || (escort.services && escort.services.length > 0)) && (
                               <div className="flex items-center gap-1.5 flex-wrap">
                                 <div 
                                   className="w-1 h-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                                 />
                                 <div 
                                   className="text-[9px] px-1.5 py-0.5 rounded font-medium truncate max-w-[100px]"
                                   style={{
                                     background: 'rgba(255, 107, 157, 0.2)',
                                     color: '#FF6B9D',
                                     border: '1px solid rgba(255, 107, 157, 0.3)'
                                   }}
                                 >
                                   {escort.type === 'club'
                                    ? (escort.establishmentType || t('sidebar.category.club'))
                                    : escort.category === 'ESCORT' ? t('sidebar.category.escort')
                                    : escort.category === 'MASSEUSE' ? t('sidebar.category.masseuse')
                                    : escort.category === 'DOMINATRICE' ? t('sidebar.category.dominatrice')
                                    : escort.category === 'TRANSSEXUELLE' ? t('sidebar.category.trans')
                                    : (escort.category || escort.services?.[0] || t('sidebar.category.escort'))
                                  }
                                 </div>
                               </div>
                             )}
                           </div>
                           
                           {/* Arrow */}
                           <div className="shrink-0">
                             <svg 
                               className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform"
                               fill="none" 
                               stroke="currentColor" 
                               viewBox="0 0 24 24"
                             >
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                             </svg>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

          {visibleEscorts.length >= 30 && filteredEscorts.length > visibleEscorts.length && (
            <div className="p-3 border-t border-white/10 text-center text-xs text-white/40">
              {t('sidebar.moreProfiles', { count: filteredEscorts.length - visibleEscorts.length })}
            </div>
          )}
        </div>
      )}

      {/* Geolocation Error */}
      {geoError && !showFilters && (
        <div
          className="fixed bottom-32 right-4 px-3 py-2 rounded-xl text-sm max-w-[250px]"
          style={{
            background: 'rgba(239, 68, 68, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'white'
          }}
        >
          {geoError}
          <button
            onClick={() => setGeoError(null)}
            className="ml-2 text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && !data && (
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{
            background: 'rgba(13, 13, 13, 0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999
          }}
        >
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 animate-spin"
              style={{
                background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%)',
                mask: 'radial-gradient(circle at center, transparent 4px, black 6px)'
              }}
            />
            <p className="text-white">{t('loading')}</p>
          </div>
        </div>
      )}
      </div>
    </>
  )
}
