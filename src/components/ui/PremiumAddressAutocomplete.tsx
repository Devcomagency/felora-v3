'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X, Navigation, Clock, TrendingUp } from 'lucide-react'

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

interface PremiumAddressAutocompleteProps {
  value: string
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void
  onCoordinatesChange?: (coordinates: { lat: number; lng: number } | null) => void
  placeholder?: string
  className?: string
  onAddressSelect?: (address: SwissAddress) => void
  cantonCode?: string
  cantonName?: string
  city?: string
}

export default function PremiumAddressAutocomplete({
  value,
  onChange,
  onCoordinatesChange,
  placeholder = "Rue, numéro, ville (ex: Rue de la Paix 15, Lausanne)",
  className = "",
  onAddressSelect,
  cantonCode,
  cantonName,
  city
}: PremiumAddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SwissAddress[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLocating, setIsLocating] = useState(false)
  const [history, setHistory] = useState<SwissAddress[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Charger l'historique au montage - UNIQUEMENT si pas d'adresse existante
  useEffect(() => {
    if (!value || value === '') {
      const savedHistory = localStorage.getItem('felora_address_history')
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory)
          setHistory(parsed.slice(0, 2)) // Limiter à 2 derniers
        } catch (e) {
          console.error('Erreur chargement historique:', e)
        }
      }
    } else {
      // Si une adresse existe déjà, ne pas charger l'historique
      setHistory([])
    }
  }, [value])
  
  const searchAddresses = async (query: string): Promise<SwissAddress[]> => {
    if (query.length < 2) return []
    
    try {
      const params = new URLSearchParams()
      params.set('q', query)
      params.set('limit', '8')
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

  const mockResults = (query: string): SwissAddress[] => {
    const mockData: SwissAddress[] = [
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
          // Ne PAS ouvrir automatiquement - uniquement au focus de l'input
          setIsOpen(false)
          setSelectedIndex(-1)
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
    const coordinates = { 
      lat: address.latitude || 0, 
      lng: address.longitude || 0 
    }
    
    if (coordinates.lat === 0 && coordinates.lng === 0) {
      const cityCoords = getCityCoordinatesFromAddress(address.address)
      if (cityCoords) {
        coordinates.lat = cityCoords.lat
        coordinates.lng = cityCoords.lng
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
    
    // Synchroniser avec le profil
    const eventData = {
      address: address.address,
      coordinates: coordinates,
      city: address.address.split(', ')[1] || '',
      canton: extractCantonFromAddress(address.address),
      timestamp: Date.now()
    }
    
    const mapUpdateEvent = new CustomEvent('addressChanged', { detail: eventData })
    window.dispatchEvent(mapUpdateEvent)
    localStorage.setItem('felora_address_update', JSON.stringify(eventData))
  }

  const handleHistorySelect = (address: SwissAddress) => {
    onChange(address.address, { lat: address.latitude, lng: address.longitude })
    onCoordinatesChange?.({ lat: address.latitude, lng: address.longitude })
    setIsOpen(false)
    inputRef.current?.blur()
    
    saveToHistory(address.address, { lat: address.latitude, lng: address.longitude })
  }

  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch('/api/geocode/reverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.coordinates && data.coordinates.lat && data.coordinates.lng) {
          onCoordinatesChange?.(data.coordinates)
          
          const eventData = {
            address: address,
            coordinates: data.coordinates,
            city: data.city || '',
            canton: data.canton || '',
            timestamp: Date.now()
          }
          
          const mapUpdateEvent = new CustomEvent('addressChanged', { detail: eventData })
          window.dispatchEvent(mapUpdateEvent)
          localStorage.setItem('felora_address_update', JSON.stringify(eventData))
          
          return data.coordinates
        }
      }
    } catch (error) {
      console.error('Erreur géocodage:', error)
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
      let historyArray = existing ? JSON.parse(existing) : []
      
      const existingIndex = historyArray.findIndex((item: any) => item.address === address)
      
      if (existingIndex >= 0) {
        historyArray[existingIndex].usedCount = (historyArray[existingIndex].usedCount || 0) + 1
        historyArray[existingIndex].timestamp = Date.now()
      } else {
        historyArray.unshift({
          id: Date.now().toString(),
          address,
          latitude: coordinates?.lat || 0,
          longitude: coordinates?.lng || 0,
          timestamp: Date.now(),
          usedCount: 1
        })
      }
      
      historyArray.sort((a: any, b: any) => {
        if (a.usedCount !== b.usedCount) return b.usedCount - a.usedCount
        return b.timestamp - a.timestamp
      })
      
      localStorage.setItem(storageKey, JSON.stringify(historyArray.slice(0, 10)))
      setHistory(historyArray.slice(0, 2))
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
            
            // Extraire le nom de la ville
            let cityName = ''
            const addressParts = data.address.split(', ')
            if (addressParts.length >= 2) {
              const cityPart = addressParts[addressParts.length - 1]
              cityName = cityPart.replace(/^\d+\s+/, '').replace(/\s*\([^)]*\)/, '')
              if (cityName) {
                const event = new CustomEvent('addressCityDetected', { 
                  detail: { city: cityName, canton: extractCantonFromAddress(data.address) }
                })
                window.dispatchEvent(event)
              }
            }
            
            const mapUpdateEvent = new CustomEvent('addressChanged', {
              detail: {
                address: data.address,
                coordinates: { lat: latitude, lng: longitude },
                city: cityName || '',
                canton: extractCantonFromAddress(data.address)
              }
            })
            window.dispatchEvent(mapUpdateEvent)
          } else {
            alert('Impossible de récupérer l\'adresse depuis votre position')
          }
        } catch (error) {
          console.error('Erreur reverse geocoding:', error)
          alert('Erreur lors de la récupération de votre adresse')
        }
        
        setIsLocating(false)
      },
      (error) => {
        let errorMessage = 'Impossible de récupérer votre position'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Accès à la géolocalisation refusé. Activez-la dans les paramètres.'
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
        timeout: 15000,
        maximumAge: 0
      }
    )
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* DESIGN PREMIUM MOBILE-FIRST */}
      
      {/* Section Historique - Compact Mobile */}
      {history.length > 0 && !value && (
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
            <Clock size={14} />
            <span>Adresses récentes</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((item) => (
              <button
                key={item.identifier || item.address}
                onClick={() => {
                  onChange(item.address, { lat: item.latitude, lng: item.longitude })
                  onCoordinatesChange?.({ lat: item.latitude, lng: item.longitude })
                }}
                className="px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs text-white hover:bg-gray-800/70 transition-colors flex items-center gap-2"
              >
                <MapPin size={12} />
                <span className="truncate max-w-[200px]">{item.address}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Barre de recherche principale */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
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
              } else if (newAddress.length > 10 && newAddress.length < 200) {
                setTimeout(() => geocodeAddress(newAddress), 1000)
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setIsOpen(true)
              }
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
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
        
        {/* Bouton géolocalisation */}
        <button
          onClick={handleAutoLocation}
          disabled={isLocating}
          className="px-4 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLocating ? (
            <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          ) : (
            <Navigation size={18} />
          )}
        </button>
      </div>

      {/* Suggestions - DESIGN PREMIUM */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.identifier || `suggestion-${index}`}
                onClick={() => handleSelectAddress(suggestion)}
                className={`w-full px-3 py-3 text-left hover:bg-gray-800/50 transition-colors rounded-xl ${
                  selectedIndex === index ? 'bg-purple-500/20 border-l-2 border-l-purple-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <MapPin size={16} className="text-purple-400" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm leading-relaxed">
                      {suggestion.address}
                    </div>
                    
                    {suggestion.score > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <TrendingUp size={12} className="text-green-400" />
                          <span className="text-xs text-gray-400">
                            {suggestion.score}% de correspondance
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="px-2 py-1 bg-gray-700/50 rounded-lg">
                      <span className="text-xs text-gray-300 font-medium">
                        {suggestion.countryCode}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
