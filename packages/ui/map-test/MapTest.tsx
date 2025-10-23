'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Map, { Marker, Popup, ViewStateChangeEvent } from 'react-map-gl/maplibre'
import { MapPin, SlidersHorizontal } from 'lucide-react'
import useSWR from 'swr'
import Supercluster from 'supercluster'
import 'maplibre-gl/dist/maplibre-gl.css'

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
  verified: boolean
  isActive: boolean
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
  const [clusterPopup, setClusterPopup] = useState<{
    latitude: number
    longitude: number
    escorts: EscortData[]
  } | null>(null)
  
  // 🎯 ÉTAT POUR LE PROFIL ESCORT CONNECTÉ
  const [currentUserProfile, setCurrentUserProfile] = useState<EscortData | null>(null)

  // 🎯 RÉCUPÉRER LE PROFIL ESCORT CONNECTÉ
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      try {
        const response = await fetch('/api/me/escort-profile')

        if (response.ok) {
          const profile = await response.json()

          if (profile && profile.latitude && profile.longitude) {
            const escortData: EscortData = {
              id: profile.escortId || 'FIXED_ID',
              name: profile.stageName || 'Mon Profil',
              lat: profile.latitude,
              lng: profile.longitude,
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
        // Silent fail - l'utilisateur n'est peut-être pas escort
      }
    }

    fetchCurrentUserProfile()
  }, [])

  // 🎯 ÉCOUTER LES ÉVÉNEMENTS D'ADRESSE CHANGÉE POUR SYNCHRONISER LA CARTE
  useEffect(() => {
    const handleAddressChanged = (event: any) => {
      const { coordinates } = event.detail

      if (coordinates && coordinates.lat && coordinates.lng) {
        // Mettre à jour la vue de la carte
        setViewState(prev => ({
          ...prev,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          zoom: Math.max(prev.zoom, 15)
        }))

        // 🎯 METTRE À JOUR LE PROFIL ESCORT CONNECTÉ
        if (currentUserProfile) {
          setCurrentUserProfile(prev => prev ? {
            ...prev,
            lat: coordinates.lat,
            lng: coordinates.lng
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
  const [search, setSearch] = useState('')
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

  // Fetch data with SWR
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

  // Transform real API data to match expected format + include current user profile
  const allEscorts = useMemo(() => {
    const apiEscorts = (data?.items || []).map((escort: any) => ({
      id: escort.id,
      name: escort.stageName || 'Escort',
      lat: escort.latitude || 46.8182, // Default to Switzerland center
      lng: escort.longitude || 8.2275,
      avatar: escort.profilePhoto || '',
      city: escort.city || 'Suisse',
      services: escort.services || [],
      languages: escort.languages || [],
      category: escort.category || null,
      verified: escort.isVerifiedBadge || false,
      isActive: escort.isActive || true,
      isCurrentUser: false // Marquer comme profil d'un autre utilisateur
    }))

    // 🎯 GÉRER LE PROFIL ESCORT CONNECTÉ
    if (currentUserProfile) {
      const existingIndex = apiEscorts.findIndex((escort: any) => escort.id === currentUserProfile.id)

      if (existingIndex >= 0) {
        apiEscorts[existingIndex] = {
          ...currentUserProfile,
          isCurrentUser: true
        }
      } else {
        apiEscorts.unshift({
          ...currentUserProfile,
          isCurrentUser: true
        })
      }
    }

    return apiEscorts
  }, [data, currentUserProfile])

  // Filter escorts
  const filteredEscorts = useMemo(() => {
    let result = allEscorts

    // Filtre par recherche textuelle
    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter((escort: EscortData) =>
        escort.name.toLowerCase().includes(query) ||
        escort.city.toLowerCase().includes(query) ||
        (escort.services || []).some((service: string) => service.toLowerCase().includes(query))
      )
    }

    // Filtre par catégories - Utiliser le champ category de l'API
    if (selectedCategories.length > 0) {
      result = result.filter((escort: EscortData) => {
        // Si le profil a un champ category défini, l'utiliser directement
        if (escort.category) {
          return selectedCategories.includes(escort.category)
        }

        // Sinon, fallback sur l'analyse des services (pour compatibilité)
        const escortServices = (escort.services || []).map((s: string) => s.toLowerCase())

        return selectedCategories.some((category: string) => {
          // Mapping des catégories vers les services de l'API
          switch(category) {
            case 'escort':
              return escortServices.some((s: string) =>
                s.includes('escort') || s.includes('gfe') || s.includes('accompagnement')
              )
            case 'masseuse_erotique':
              return escortServices.some((s: string) =>
                s.includes('massage') || s.includes('body to body') || s.includes('relaxation')
              )
            case 'dominatrice_bdsm':
              return escortServices.some((s: string) =>
                s.includes('bdsm') || s.includes('domination') || s.includes('fétichisme') || s.includes('soumission')
              )
            case 'transsexuel':
              return escortServices.some((s: string) =>
                s.includes('trans') || s.includes('shemale') || s.includes('transsexuel')
              )
            default:
              return false
          }
        })
      })
    }

    return result
  }, [allEscorts, search, selectedCategories])

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
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas supportée par ce navigateur")
      return
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
        let errorMessage = 'Impossible de récupérer votre position'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Accès à la géolocalisation refusé'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position non disponible'
            break
          case error.TIMEOUT:
            errorMessage = 'Délai de géolocalisation dépassé'
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
  }, [viewState.zoom])

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
      `}</style>
      
      <div className="relative w-full h-screen bg-felora-void overflow-hidden">
      {/* Back Button - Top Left */}
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: 'rgba(13, 13, 13, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'white',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}
        aria-label="Retour"
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
                aria-label="Votre position"
                title="Votre position"
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
                    aria-label={`${point_count} profils dans cette zone`}
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
                    className="w-10 h-10 rounded-full cursor-pointer transform hover:scale-110 transition-transform relative"
                    style={{
                      background: escort.isActive 
                        ? 'linear-gradient(135deg, #4FD1C7 0%, #00D4AA 100%)'
                        : 'rgba(255, 255, 255, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 4px 20px rgba(79, 209, 199, 0.4)'
                    }}
                  >
                    {escort.avatar && (
                      <img 
                        src={escort.avatar} 
                        alt={escort.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    )}
                    {escort.verified && (
                      <div 
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #4FD1C7 0%, #00D4AA 100%)',
                          fontSize: '8px',
                          color: 'white'
                        }}
                      >
                        ✓
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
                    src={selectedEscort.avatar || 'https://picsum.photos/seed/portrait/600/800'}
                    alt={selectedEscort.name}
                    loading="lazy"
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                  />
                  {selectedEscort.verified && (
                    <div
                      className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium"
                      style={{ background: 'rgba(79, 209, 199, 0.85)', color: 'white' }}
                    >
                      Vérifié
                    </div>
                  )}
                </div>
                {/* Title area */}
                <div className="mb-2 flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base leading-tight truncate">{selectedEscort.name}</h3>
                    <p className="text-white/70 text-sm truncate">{selectedEscort.city}</p>
                  </div>
                  {selectedEscort.verified && (
                    <div 
                      className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                      style={{ background: 'rgba(79, 209, 199, 0.2)', color: '#4FD1C7' }}
                    >
                      Vérifié
                    </div>
                  )}
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
                    window.location.href = `/profile/${selectedEscort.id}`
                  }}
                  className="w-full py-2 rounded-lg font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
                    color: 'white'
                  }}
                >
                  Voir le profil
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
                  {clusterPopup.escorts.length} profils dans cette zone
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
                      {escort.avatar && (
                        <img
                          src={escort.avatar}
                          alt={escort.name}
                          loading="lazy"
                          decoding="async"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{escort.name}</p>
                        <p className="text-white/60 text-xs">{escort.city}</p>
                      </div>
                      {escort.verified && (
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center text-xs"
                          style={{
                            background: 'linear-gradient(135deg, #4FD1C7 0%, #00D4AA 100%)',
                            color: 'white'
                          }}
                        >
                          ✓
                        </div>
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
                  Zoomer sur cette zone
                </button>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Status Bar */}
      <div
        className="fixed bottom-20 left-4 px-3 py-2 rounded-xl text-sm text-white"
        style={{
          // Même couleurs que le bouton "Autour de moi"
          background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 10px 26px rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.05)'
        }}
        role="status"
        aria-live="polite"
      >
        {visibleCount} escort{visibleCount !== 1 ? 's' : ''} visible{visibleCount !== 1 ? 's' : ''}
        {isLoading && ' • Chargement...'}
        {error && ' • Erreur'}
      </div>

      {/* Filters Panel - Juste au-dessus du bouton filtre */}
      {showFilters && (
        <div
          className="fixed right-4 p-4 rounded-xl w-[90vw] max-w-[400px] animate-in slide-in-from-bottom duration-300 z-50"
          style={{
            bottom: 'calc(8rem + 68px)', // 8rem = bottom-32 + 68px de marge pour plus d'espace
            background: 'rgba(13, 13, 13, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
          }}
        >
          <div className="flex flex-col gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            />

            {/* Category filters */}
            <div className="flex flex-col gap-2">
              {[
                { value: 'escort', label: 'Escorte' },
                { value: 'masseuse_erotique', label: 'Masseuse Érotique' },
                { value: 'dominatrice_bdsm', label: 'Dominatrice BDSM' },
                { value: 'transsexuel', label: 'Transsexuel' }
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
            {(search || selectedCategories.length > 0) && (
              <button
                onClick={() => {
                  setSearch('')
                  setSelectedCategories([])
                }}
                className="w-full py-2 rounded-lg text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                Effacer les filtres
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bouton Filtres - Au-dessus du bouton localisation */}
      <button
        onClick={() => setShowFilters(!showFilters)}
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
        aria-label="Filtres"
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
        title="Voir autour de moi"
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
            <p className="text-white">Chargement de la carte...</p>
          </div>
        </div>
      )}
      </div>
    </>
  )
}
