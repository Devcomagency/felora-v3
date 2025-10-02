'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Map, { Marker, Popup, ViewStateChangeEvent } from 'react-map-gl/maplibre'
import { MapPin } from 'lucide-react'
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

// Demo data - 8 escorts in Swiss cities
const DEMO_ESCORTS: EscortData[] = [
  {
    id: '1',
    name: 'Amélie',
    lat: 46.2044,
    lng: 6.1432,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b547?w=150',
    city: 'Genève',
    services: ['escorte', 'massage'],
    languages: ['français', 'anglais'],
    verified: true,
    isActive: true
  },
  {
    id: '2', 
    name: 'Sofia',
    lat: 46.5197,
    lng: 6.6323,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    city: 'Lausanne',
    services: ['vip', 'massage'],
    languages: ['français', 'italien'],
    verified: true,
    isActive: true
  },
  {
    id: '3',
    name: 'Emma',
    lat: 47.3769,
    lng: 8.5417,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    city: 'Zurich',
    services: ['escorte', 'bdsm'],
    languages: ['allemand', 'anglais'],
    verified: false,
    isActive: true
  },
  {
    id: '4',
    name: 'Lisa',
    lat: 46.9481,
    lng: 7.4474,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    city: 'Berne',
    services: ['massage', 'vip'],
    languages: ['allemand', 'français'],
    verified: true,
    isActive: true
  },
  {
    id: '5',
    name: 'Valentina',
    lat: 46.2044,
    lng: 6.1532,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    city: 'Genève',
    services: ['escorte', 'vip'],
    languages: ['italien', 'français'],
    verified: true,
    isActive: false
  },
  {
    id: '6',
    name: 'Marina',
    lat: 47.3669,
    lng: 8.5500,
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150',
    city: 'Zurich',
    services: ['massage'],
    languages: ['allemand'],
    verified: false,
    isActive: true
  },
  {
    id: '7',
    name: 'Camille',
    lat: 46.5297,
    lng: 6.6423,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    city: 'Lausanne',
    services: ['escorte', 'bdsm'],
    languages: ['français', 'anglais'],
    verified: true,
    isActive: true
  },
  {
    id: '8',
    name: 'Isabella',
    lat: 47.3869,
    lng: 8.5317,
    avatar: 'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=150',
    city: 'Zurich',
    services: ['vip', 'massage'],
    languages: ['italien', 'allemand'],
    verified: true,
    isActive: true
  }
]

// Fetcher for SWR
const fetcher = async (url: string) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  
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
    
    let latitude = 46.8182 // Switzerland center
    let longitude = 8.2275
    let zoom = 8
    
    if (centerParam) {
      const [lat, lng] = centerParam.split(',').map(Number)
      if (!isNaN(lat) && !isNaN(lng)) {
        latitude = lat
        longitude = lng
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

  // 🎯 ÉCOUTER LES ÉVÉNEMENTS D'ADRESSE CHANGÉE POUR SYNCHRONISER LA CARTE
  useEffect(() => {
    const handleAddressChanged = (event: any) => {
      const { coordinates } = event.detail
      if (coordinates && coordinates.lat && coordinates.lng) {
        console.log('🗺️ Mise à jour de la carte depuis le dashboard:', coordinates)
        
        // Mettre à jour la vue de la carte
        setViewState(prev => ({
          ...prev,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          zoom: Math.max(prev.zoom, 15) // Zoom plus proche pour une adresse spécifique
        }))
        
        // Mettre à jour l'URL pour refléter la nouvelle position
        const newCenter = `${coordinates.lat},${coordinates.lng}`
        const newUrl = `/map?center=${newCenter}&zoom=15`
        router.push(newUrl, { scroll: false })
      }
    }

    window.addEventListener('addressChanged', handleAddressChanged)
    
    return () => {
      window.removeEventListener('addressChanged', handleAddressChanged)
    }
  }, [router])
  const [search, setSearch] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
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
      shouldRetryOnError: false,
      keepPreviousData: true
    }
  )

  // Transform real API data to match expected format
  const allEscorts = useMemo(() => {
    if (!data || !data.items || !Array.isArray(data.items)) return []

    return data.items.map((escort: any) => ({
      id: escort.id,
      name: escort.stageName || 'Escort',
      lat: escort.latitude || 46.8182, // Default to Switzerland center
      lng: escort.longitude || 8.2275,
      avatar: escort.profilePhoto || '',
      city: escort.city || 'Suisse',
      services: escort.services || [],
      languages: escort.languages || [],
      verified: escort.isVerifiedBadge || false,
      isActive: escort.isActive || true
    }))
  }, [data])

  // Filter escorts
  const filteredEscorts = useMemo(() => {
    let result = allEscorts

    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(escort => 
        escort.name.toLowerCase().includes(query) ||
        escort.city.toLowerCase().includes(query) ||
        (escort.services || []).some(service => service.toLowerCase().includes(query))
      )
    }

    if (selectedServices.length > 0) {
      result = result.filter(escort =>
        selectedServices.some(service =>
          (escort.services || []).some(escortService =>
            escortService.toLowerCase().includes(service.toLowerCase())
          )
        )
      )
    }

    return result
  }, [allEscorts, search, selectedServices])

  // Create supercluster
  const supercluster = useMemo(() => {
    const cluster = new Supercluster({
      radius: 40,
      maxZoom: 14,
      minZoom: 0,
      minPoints: 2
    })

    const points = filteredEscorts.map(escort => ({
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
    return filteredEscorts.filter(e => (
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
        timeout: 10000,
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
      {/* Header */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 p-4"
        style={{
          background: 'rgba(13, 13, 13, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Retour
          </button>

          {/* Title */}
          <h1 
            className="text-lg font-bold"
            style={{
              background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Carte Suisse
          </h1>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-xl"
            style={{
              background: showFilters 
                ? 'rgba(255, 107, 157, 0.2)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: showFilters 
                ? '1px solid rgba(255, 107, 157, 0.4)' 
                : '1px solid rgba(255, 255, 255, 0.1)',
              color: showFilters ? '#FF6B9D' : 'white'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div 
            className="mt-4 p-4 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              />

              {/* Service filters */}
              {['escorte', 'massage', 'vip', 'bdsm'].map(service => (
                <button
                  key={service}
                  onClick={() => {
                    setSelectedServices(prev => 
                      prev.includes(service) 
                        ? prev.filter(s => s !== service)
                        : [...prev, service]
                    )
                  }}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: selectedServices.includes(service)
                      ? 'rgba(255, 107, 157, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: selectedServices.includes(service)
                      ? '1px solid rgba(255, 107, 157, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    color: selectedServices.includes(service) ? '#FF6B9D' : 'rgba(255, 255, 255, 0.8)'
                  }}
                >
                  {service}
                </button>
              ))}

              {/* Clear */}
              <button
                onClick={() => {
                  setSearch('')
                  setSelectedServices([])
                }}
                className="px-3 py-2 rounded-lg text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                Effacer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="absolute inset-0" style={{ top: showFilters ? '160px' : '80px' }}>
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
                className="p-4 rounded-xl min-w-[320px]"
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
                className="p-4 rounded-xl min-w-[320px] max-w-[400px]"
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
        className="fixed bottom-16 left-4 px-3 py-2 rounded-xl text-sm text-white"
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

      {/* Geolocation Button */}
      <button
        onClick={locateUser}
        disabled={isLocating}
        className="fixed bottom-16 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          // Bouton plus visible et coloré selon la charte
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
      {geoError && (
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
