'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X } from 'lucide-react'

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
    const coordinates = { lat: address.latitude, lng: address.longitude }
    onChange(address.address, coordinates)
    onCoordinatesChange?.(coordinates)
    onAddressSelect?.(address)
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const clearValue = () => {
    onChange('', undefined)
    onCoordinatesChange?.(null)
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search size={18} className="text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value, undefined)
            if (e.target.value === '') onCoordinatesChange?.(null)
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          {suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.identifier}
                  onClick={() => handleSelectAddress(suggestion)}
                  className={`w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-800/50 transition-colors ${
                    selectedIndex === index ? 'bg-purple-500/20 border-l-2 border-l-purple-500' : ''
                  }`}
                >
                  <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {suggestion.address}
                    </div>
                    {((suggestion?.score || 0) > 0) && (
                      <div className="text-xs text-gray-400 mt-1">Score: {suggestion.score}%</div>
                    )}
                  </div>
                  <div className="text-xs text-purple-400 font-medium">
                    {suggestion.countryCode}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-6 px-4 text-center text-gray-400">
              {loading ? 'Recherche en cours...' : 'Aucune adresse trouvée'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
