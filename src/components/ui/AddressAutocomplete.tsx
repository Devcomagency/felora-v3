'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X, Navigation } from 'lucide-react'
import AddressHistory from './AddressHistory'

// Étendre l'interface Window pour le timeout de géocodage
declare global {
  interface Window {
    geocodeTimeout?: NodeJS.Timeout
  }
}

interface SwissAddress {
  score: number
  identifier: string
  countryCode: string
  addressId: string
  buildingId: string
  address: string
  latitude: number
  longitude: number
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void
  onCoordinatesChange?: (coordinates: { lat: number; lng: number } | null) => void
  placeholder?: string
  className?: string
  onAddressSelect?: (address: SwissAddress) => void
  // Filtrage/biais facultatif
  cantonCode?: string
  cantonName?: string
  city?: string
}

export default function AddressAutocomplete({
  value,
  onChange,
  onCoordinatesChange,
  placeholder = "Rue, numéro, ville (ex: Rue de la Paix 15, Lausanne)",
  className = "",
  onAddressSelect,
  cantonCode,
  cantonName,
  city
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SwissAddress[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLocating, setIsLocating] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const searchAddresses = async (query: string): Promise<SwissAddress[]> => {
    if (query.length < 2) return []
    
    try {
      const params = new URLSearchParams()
      params.set('q', query)
      params.set('limit', '10')
      if (cantonName) params.set('region', cantonName)
      if (city) params.set('city', city)
      const url = `/api/geocode/search?${params.toString()}`
      const response = await fetch(url)
      if (!response.ok) return mockResults(query)
      const data = await response.json()
      const hits = Array.isArray(data.hits) ? data.hits : []
      let mapped = hits.map((hit: any) => ({
        score: Number(hit.score) || 0,
        identifier: String(hit.identifier || hit.id || ''),
        countryCode: String(hit.countryCode || 'CH'),
        addressId: String(hit.addressId || ''),
        buildingId: String(hit.buildingId || ''),
        address: String(hit.address || ''),
        latitude: Number(hit.latitude) || 0,
        longitude: Number(hit.longitude) || 0
      }))
      // Filtrage côté client si ville précisée
      if (city) {
        const c = city.toLowerCase()
        mapped = mapped.filter((m: any) => m.address.toLowerCase().includes(c))
      }
      return mapped
    } catch (error) {
      console.warn('Erreur API geocode, utilisation des résultats mock:', error)
      return mockResults(query)
    }
  }

  // Résultats mock pour le développement
  const mockResults = (query: string): SwissAddress[] => {
    const mockData = [
      {
        score: 95,
        identifier: 'mock-1',
        countryCode: 'CH',
        addressId: '101731502',
        buildingId: '302048818',
        address: 'Limmatstrasse 264, 8005 Zürich',
        latitude: 47.383714644865,
        longitude: 8.5333052733667
      },
      {
        score: 90,
        identifier: 'mock-2', 
        countryCode: 'CH',
        addressId: '101731503',
        buildingId: '302048819',
        address: 'Bahnhofstrasse 1, 8001 Zürich',
        latitude: 47.376888,
        longitude: 8.540192
      },
      {
        score: 85,
        identifier: 'mock-3',
        countryCode: 'CH', 
        addressId: '101731504',
        buildingId: '302048820',
        address: 'Rue du Rhône 100, 1204 Genève',
        latitude: 46.204391,
        longitude: 6.143158
      }
    ]
    
    return mockData.filter(item => 
      item.address.toLowerCase().includes(query.toLowerCase())
    )
  }

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (value.length >= 2) {
        setLoading(true)
        try {
          const results = await searchAddresses(value)
          setSuggestions(results)
          setIsOpen(results.length > 0)
          setSelectedIndex(results.length > 0 ? 0 : -1)
        } finally {
          setLoading(false)
        }
      } else {
        setSuggestions([])
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        e.preventDefault()
        const idx = selectedIndex >= 0 ? selectedIndex : (suggestions.length > 0 ? 0 : -1)
        if (idx >= 0 && suggestions[idx]) handleSelectAddress(suggestions[idx])
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelectAddress = (address: SwissAddress) => {
    // 🎯 S'assurer qu'on a toujours des coordonnées valides
    const coordinates = { 
      lat: address.latitude || 0, 
      lng: address.longitude || 0 
    }
    
    // Si les coordonnées sont invalides, essayer de géocoder l'adresse
    if (coordinates.lat === 0 && coordinates.lng === 0) {
      console.warn('⚠️ Coordonnées manquantes pour:', address.address)
      // Fallback: utiliser les coordonnées de la ville si disponible
      const cityCoords = getCityCoordinatesFromAddress(address.address)
      if (cityCoords) {
        coordinates.lat = cityCoords.lat
        coordinates.lng = cityCoords.lng
        console.log('📍 Utilisation coordonnées de ville:', cityCoords)
      }
    }
    
    onChange(address.address, coordinates)
    onCoordinatesChange?.(coordinates)
    onAddressSelect?.(address)
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
    
    // Sauvegarder dans l'historique
    saveToHistory(address.address, coordinates)
    
    // 🎯 ÉMISSION D'ÉVÉNEMENT POUR SYNCHRONISER LA CARTE
    const eventData = {
      address: address.address,
      coordinates: coordinates,
      city: address.address.split(', ')[1] || '',
      canton: extractCantonFromAddress(address.address),
      timestamp: Date.now()
    }
    
    // Événement local
    const mapUpdateEvent = new CustomEvent('addressChanged', { detail: eventData })
    console.log('📤 [DASHBOARD] Émission événement addressChanged:', eventData)
    window.dispatchEvent(mapUpdateEvent)
    
    // Communication entre onglets via localStorage
    localStorage.setItem('felora_address_update', JSON.stringify(eventData))
    // Ne pas supprimer immédiatement, laisser la carte traiter l'événement
  }

  const handleHistorySelect = (address: string, coordinates?: { lat: number; lng: number }) => {
    onChange(address, coordinates)
    onCoordinatesChange?.(coordinates)
    setIsOpen(false)
    inputRef.current?.blur()
    
    // Sauvegarder dans l'historique (mise à jour du compteur)
    saveToHistory(address, coordinates)
  }

  // 🎯 FONCTION POUR GÉOCODER UNE ADRESSE TAPÉE
  const geocodeAddress = async (address: string) => {
    try {
      console.log('🔍 [DASHBOARD] Géocodage de l\'adresse tapée:', address)
      const response = await fetch('/api/geocode/reverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.coordinates && data.coordinates.lat && data.coordinates.lng) {
          console.log('✅ [DASHBOARD] Géocodage réussi:', data.coordinates)
          
          // 🎯 METTRE À JOUR LES COORDONNÉES DANS LE PROFIL
          onCoordinatesChange?.(data.coordinates)
          
          // Émettre l'événement avec les coordonnées trouvées
          const eventData = {
            address: address,
            coordinates: data.coordinates,
            city: data.city || '',
            canton: data.canton || '',
            timestamp: Date.now()
          }
          
          // Événement local
          const mapUpdateEvent = new CustomEvent('addressChanged', { detail: eventData })
          console.log('📤 [DASHBOARD] Émission événement addressChanged (géocodage):', eventData)
          window.dispatchEvent(mapUpdateEvent)
          
          // Communication entre onglets via localStorage
          localStorage.setItem('felora_address_update', JSON.stringify(eventData))
          // Ne pas supprimer immédiatement, laisser la carte traiter l'événement
          
          return data.coordinates
        }
      }
    } catch (error) {
      console.log('❌ [DASHBOARD] Erreur géocodage:', error)
    }
    return null
  }

  const extractCantonFromAddress = (address: string): string | null => {
    const cantonMap: Record<string, string> = {
      'genève': 'GE', 'geneva': 'GE',
      'vaud': 'VD', 'lausanne': 'VD',
      'zurich': 'ZH', 'zürich': 'ZH',
      'berne': 'BE', 'bern': 'BE',
      'bâle': 'BS', 'basel': 'BS',
      'lucerne': 'LU', 'luzern': 'LU',
      'tessin': 'TI', 'ticino': 'TI',
      'saint-gall': 'SG', 'st. gallen': 'SG',
      'valais': 'VS', 'wallis': 'VS',
      'fribourg': 'FR', 'freiburg': 'FR',
      'neuchâtel': 'NE', 'neuenburg': 'NE'
    }
    
    const addressLower = address.toLowerCase()
    for (const [key, code] of Object.entries(cantonMap)) {
      if (addressLower.includes(key)) {
        return code
      }
    }
    
    // Essayer d'extraire le code canton des parenthèses
    const match = address.match(/\(([A-Z]{2})\)/)
    if (match) {
      return match[1]
    }
    
    return null
  }

  const getCityCoordinatesFromAddress = (address: string): { lat: number; lng: number } | null => {
    const cityCoords: Record<string, { lat: number; lng: number }> = {
      'onex': { lat: 46.1854, lng: 6.0995 },
      'genève': { lat: 46.2044, lng: 6.1432 },
      'geneva': { lat: 46.2044, lng: 6.1432 },
      'lausanne': { lat: 46.5197, lng: 6.6323 },
      'zurich': { lat: 47.3769, lng: 8.5417 },
      'zürich': { lat: 47.3769, lng: 8.5417 },
      'berne': { lat: 46.9481, lng: 7.4474 },
      'bern': { lat: 46.9481, lng: 7.4474 },
      'bâle': { lat: 47.5596, lng: 7.5886 },
      'basel': { lat: 47.5596, lng: 7.5886 },
      'lucerne': { lat: 47.0502, lng: 8.3093 },
      'luzern': { lat: 47.0502, lng: 8.3093 },
      'lugano': { lat: 46.0037, lng: 8.9511 },
      'sion': { lat: 46.2294, lng: 7.3594 },
      'fribourg': { lat: 46.8061, lng: 7.1612 },
      'neuchâtel': { lat: 46.9924, lng: 6.9319 }
    }
    
    const addressLower = address.toLowerCase()
    for (const [city, coords] of Object.entries(cityCoords)) {
      if (addressLower.includes(city)) {
        return coords
      }
    }
    
    return null
  }

  const saveToHistory = (address: string, coordinates?: { lat: number; lng: number }) => {
    try {
      const storageKey = 'felora_address_history'
      const existing = localStorage.getItem(storageKey)
      let history = existing ? JSON.parse(existing) : []
      
      const existingIndex = history.findIndex((item: any) => item.address === address)
      
      if (existingIndex >= 0) {
        history[existingIndex].usedCount = (history[existingIndex].usedCount || 0) + 1
        history[existingIndex].timestamp = Date.now()
      } else {
        history.unshift({
          id: Date.now().toString(),
          address,
          coordinates,
          timestamp: Date.now(),
          usedCount: 1
        })
      }
      
      // Trier par fréquence et garder seulement les 10 derniers
      history.sort((a: any, b: any) => {
        if (a.usedCount !== b.usedCount) return b.usedCount - a.usedCount
        return b.timestamp - a.timestamp
      })
      
      localStorage.setItem(storageKey, JSON.stringify(history.slice(0, 10)))
    } catch (error) {
      console.error('Erreur sauvegarde historique:', error)
    }
  }

  const clearValue = () => {
    onChange('', undefined)
    onCoordinatesChange?.(null)
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleAutoLocation = async () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par ce navigateur')
      return
    }

    setIsLocating(true)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // Reverse geocoding pour obtenir l'adresse
          const response = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`)
          const data = await response.json()
          
          if (data.address) {
            onChange(data.address, { lat: latitude, lng: longitude })
            onCoordinatesChange?.({ lat: latitude, lng: longitude })
            
            // Extraire la ville de l'adresse pour mise à jour automatique
            const addressParts = data.address.split(', ')
            if (addressParts.length >= 2) {
              const cityPart = addressParts[addressParts.length - 1]
              const cityName = cityPart.replace(/^\d+\s+/, '').replace(/\s*\([^)]*\)/, '')
              if (cityName) {
                // Déclencher un événement personnalisé pour mettre à jour la ville
                const event = new CustomEvent('addressCityDetected', { 
                  detail: { city: cityName, canton: extractCantonFromAddress(data.address) }
                })
                window.dispatchEvent(event)
              }
            }
            
            // 🎯 ÉMISSION D'ÉVÉNEMENT POUR SYNCHRONISER LA CARTE (GÉOLOCALISATION)
            const mapUpdateEvent = new CustomEvent('addressChanged', {
              detail: {
                address: data.address,
                coordinates: { lat: latitude, lng: longitude },
                city: cityName || '',
                canton: extractCantonFromAddress(data.address)
              }
            })
            console.log('📤 [DASHBOARD] Émission événement addressChanged (géolocalisation):', mapUpdateEvent.detail)
            window.dispatchEvent(mapUpdateEvent)
          } else {
            // Fallback si pas d'adresse trouvée
            onChange(`Position GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, { lat: latitude, lng: longitude })
            onCoordinatesChange?.({ lat: latitude, lng: longitude })
          }
        } catch (error) {
          console.error('Erreur reverse geocoding:', error)
          // Utiliser les coordonnées même si on n'a pas l'adresse
          onChange(`Position GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, { lat: latitude, lng: longitude })
          onCoordinatesChange?.({ lat: latitude, lng: longitude })
        }
        
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
        alert(errorMessage)
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Bouton de géolocalisation */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={handleAutoLocation}
          disabled={isLocating}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLocating ? (
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          ) : (
            <Navigation size={14} />
          )}
          <span>{isLocating ? 'Détection...' : 'Détecter ma position'}</span>
        </button>
        
              {/* 🧪 BOUTON DE TEST POUR FORCER LE GÉOCODAGE */}
              <button
                onClick={() => {
                  console.log('🧪 [TEST] Forçage géocodage test...')
                  geocodeAddress('Rue De-MONTHOUX 1 1201 Genève')
                }}
                className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors text-sm"
              >
                <span>🧪 Test Géocodage</span>
              </button>
              
              {/* 🧪 BOUTON DE TEST POUR LA COMMUNICATION ENTRE ONGLETS */}
              <button
                onClick={() => {
                  console.log('🧪 [TEST] Test communication entre onglets...')
                  const testData = {
                    address: 'Rue du Rhône 1 1204 Genève',
                    coordinates: { lat: 46.2044, lng: 6.1432 },
                    city: 'Genève',
                    canton: 'GE',
                    timestamp: Date.now()
                  }
                  
                  // Événement local
                  const mapUpdateEvent = new CustomEvent('addressChanged', { detail: testData })
                  window.dispatchEvent(mapUpdateEvent)
                  
                  // Communication entre onglets via localStorage
                  localStorage.setItem('felora_address_update', JSON.stringify(testData))
                  console.log('📤 [TEST] Événement test envoyé:', testData)
                }}
                className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors text-sm"
              >
                <span>🧪 Test Sync</span>
              </button>
      </div>

      {/* Historique des adresses */}
      <AddressHistory
        onSelect={handleHistorySelect}
        className="mb-3"
      />
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search size={18} className="text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            const newAddress = e.target.value
            onChange(newAddress, undefined)
            if (newAddress === '') {
              onCoordinatesChange?.(null)
            } else {
              // 🎯 ÉMISSION D'ÉVÉNEMENT POUR SAISIE DIRECTE
              console.log('📤 [DASHBOARD] Saisie directe d\'adresse:', newAddress)
              
              // Si l'adresse contient des coordonnées GPS, les extraire
              const gpsMatch = newAddress.match(/(\d+\.?\d*),\s*(\d+\.?\d*)/)
              if (gpsMatch) {
                const coordinates = {
                  lat: parseFloat(gpsMatch[1]),
                  lng: parseFloat(gpsMatch[2])
                }
                const mapUpdateEvent = new CustomEvent('addressChanged', {
                  detail: {
                    address: newAddress,
                    coordinates: coordinates,
                    city: '',
                    canton: ''
                  }
                })
                console.log('📤 [DASHBOARD] Émission événement addressChanged (saisie directe GPS):', mapUpdateEvent.detail)
                window.dispatchEvent(mapUpdateEvent)
              } else {
        // Géocoder l'adresse avec un délai pour éviter trop d'appels API
        clearTimeout(window.geocodeTimeout)
        window.geocodeTimeout = setTimeout(() => {
          if (newAddress.length > 10 && newAddress.length < 200) { // Seulement pour les adresses suffisamment longues mais pas trop
            console.log('⏰ [DASHBOARD] Déclenchement géocodage automatique pour:', newAddress)
            geocodeAddress(newAddress)
          } else {
            console.log('⚠️ [DASHBOARD] Adresse trop courte ou trop longue pour géocodage:', newAddress.length, 'caractères')
          }
        }, 1000) // Délai de 1 seconde
              }
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true)
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
        />

        {value && (
          <button
            onClick={clearValue}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.identifier}
                  onClick={() => handleSelectAddress(suggestion)}
                  className={`w-full px-3 sm:px-4 py-3 sm:py-4 text-left hover:bg-gray-800/50 transition-colors ${
                    selectedIndex === index ? 'bg-purple-500/20 border-l-2 border-l-purple-500' : ''
                  }`}
                >
                  {/* 🎯 DESIGN MOBILE-FIRST PREMIUM */}
                  <div className="flex items-start gap-3">
                    {/* Icône */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <MapPin size={14} className="text-purple-400" />
                      </div>
                    </div>
                    
                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                      {/* Adresse complète - MOBILE-FIRST */}
                      <div className="text-white font-medium text-sm sm:text-base leading-relaxed break-words">
                        {suggestion.address}
                      </div>
                      
                      {/* Informations supplémentaires */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2">
                        {/* Score de qualité */}
                        {((suggestion?.score || 0) > 0) && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-xs text-gray-400">
                              Qualité: {suggestion.score}%
                            </span>
                          </div>
                        )}
                        
                        {/* Type d'adresse */}
                        {suggestion.type && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-xs text-gray-400 capitalize">
                              {suggestion.type === 'street' ? 'Rue' : 
                               suggestion.type === 'building' ? 'Bâtiment' :
                               suggestion.type === 'city' ? 'Ville' : 'Lieu'}
                            </span>
                          </div>
                        )}
                        
                        {/* Source */}
                        {suggestion.origin && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span className="text-xs text-gray-400">
                              {suggestion.origin === 'smart_db' ? 'Base premium' :
                               suggestion.origin === 'swiss_api' ? 'API suisse' :
                               suggestion.origin === 'nominatim' ? 'OpenStreetMap' : 'Source'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Badge pays */}
                    <div className="flex-shrink-0">
                      <div className="px-2 py-1 bg-gray-700/50 rounded-full">
                        <span className="text-xs text-gray-300 font-medium">
                          {suggestion.countryCode}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 px-4 text-center">
              <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-gray-400" />
              </div>
              <div className="text-gray-400 text-sm">
                {loading ? 'Recherche en cours...' : 'Aucune adresse trouvée'}
              </div>
              {!loading && (
                <div className="text-xs text-gray-500 mt-2">
                  Essayez avec une adresse plus spécifique
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
