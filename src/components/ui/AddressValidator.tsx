'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

interface AddressValidation {
  quality: 'excellent' | 'good' | 'warning' | 'error'
  score: number
  message: string
  suggestions?: string[]
  details?: {
    hasStreetNumber: boolean
    hasStreetName: boolean
    hasPostalCode: boolean
    hasCity: boolean
    isInSwitzerland: boolean
    coordinatesAccuracy: number
  }
}

interface AddressValidatorProps {
  address: string
  coordinates?: { lat: number; lng: number }
  className?: string
}

export default function AddressValidator({ address, coordinates, className = '' }: AddressValidatorProps) {
  const [validation, setValidation] = useState<AddressValidation | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (address && address.length > 5) {
      validateAddress(address, coordinates)
    } else {
      setValidation(null)
    }
  }, [address, coordinates])

  const validateAddress = async (addr: string, coords?: { lat: number; lng: number }) => {
    setLoading(true)
    
    try {
      // Validation côté client
      const clientValidation = validateAddressClient(addr, coords)
      setValidation(clientValidation)
    } catch (error) {
      console.error('Erreur validation:', error)
      setValidation({
        quality: 'error',
        score: 0,
        message: 'Erreur lors de la validation de l\'adresse'
      })
    } finally {
      setLoading(false)
    }
  }

  const validateAddressClient = (addr: string, coords?: { lat: number; lng: number }): AddressValidation => {
    const addressLower = addr.toLowerCase()
    
    // Vérifications de base
    const hasStreetNumber = /\d+/.test(addr)
    const hasStreetName = /(rue|avenue|boulevard|chemin|place|route|allée|impasse|square|quai|promenade)/i.test(addr)
    const hasPostalCode = /\b\d{4}\b/.test(addr)
    const hasCity = /(genève|lausanne|zurich|berne|bâle|fribourg|neuchâtel|lucerne|lugano|sion)/i.test(addr)
    
    // Vérifier si c'est en Suisse
    const isInSwitzerland = coords && 
      coords.lat >= 45.8 && coords.lat <= 47.8 && 
      coords.lng >= 5.9 && coords.lng <= 10.5
    
    // Calculer le score
    let score = 0
    if (hasStreetNumber) score += 25
    if (hasStreetName) score += 25
    if (hasPostalCode) score += 25
    if (hasCity) score += 15
    if (isInSwitzerland) score += 10
    
    // Déterminer la qualité
    let quality: AddressValidation['quality'] = 'error'
    let message = ''
    const suggestions: string[] = []
    
    if (score >= 90) {
      quality = 'excellent'
      message = 'Adresse excellente et complète'
    } else if (score >= 75) {
      quality = 'good'
      message = 'Adresse correcte'
    } else if (score >= 50) {
      quality = 'warning'
      message = 'Adresse partiellement complète'
    } else {
      quality = 'error'
      message = 'Adresse incomplète ou invalide'
    }
    
    // Ajouter des suggestions
    if (!hasStreetNumber) suggestions.push('Ajoutez le numéro de rue')
    if (!hasStreetName) suggestions.push('Précisez le nom de la rue')
    if (!hasPostalCode) suggestions.push('Incluez le code postal')
    if (!hasCity) suggestions.push('Indiquez la ville')
    if (!isInSwitzerland && coords) suggestions.push('Vérifiez que l\'adresse est en Suisse')
    
    return {
      quality,
      score,
      message,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      details: {
        hasStreetNumber,
        hasStreetName,
        hasPostalCode,
        hasCity,
        isInSwitzerland: !!isInSwitzerland,
        coordinatesAccuracy: coords ? 100 : 0
      }
    }
  }

  if (loading) {
    return (
      <div className={`p-3 rounded-lg border border-gray-600/50 bg-gray-800/30 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Validation en cours...</span>
        </div>
      </div>
    )
  }

  if (!validation) return null

  const getIcon = () => {
    switch (validation.quality) {
      case 'excellent':
        return <CheckCircle className="text-green-400" size={16} />
      case 'good':
        return <CheckCircle className="text-blue-400" size={16} />
      case 'warning':
        return <AlertTriangle className="text-orange-400" size={16} />
      case 'error':
        return <XCircle className="text-red-400" size={16} />
    }
  }

  const getColors = () => {
    switch (validation.quality) {
      case 'excellent':
        return 'bg-green-500/10 border-green-500 text-green-400'
      case 'good':
        return 'bg-blue-500/10 border-blue-500 text-blue-400'
      case 'warning':
        return 'bg-orange-500/10 border-orange-500 text-orange-400'
      case 'error':
        return 'bg-red-500/10 border-red-500 text-red-400'
    }
  }

  return (
    <div className={`p-3 rounded-lg border-l-4 ${getColors()} ${className}`}>
      <div className="flex items-start gap-2">
        {getIcon()}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{validation.message}</span>
            <span className="text-xs opacity-75">({validation.score}%)</span>
          </div>
          
          {validation.suggestions && validation.suggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs opacity-75 mb-1">Suggestions d'amélioration :</p>
              <ul className="list-disc list-inside space-y-1">
                {validation.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-xs opacity-75">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          {validation.details && (
            <div className="mt-2 pt-2 border-t border-current/20">
              <div className="grid grid-cols-2 gap-1 text-xs opacity-75">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${validation.details.hasStreetNumber ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span>Numéro</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${validation.details.hasStreetName ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span>Rue</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${validation.details.hasPostalCode ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span>Code postal</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${validation.details.hasCity ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span>Ville</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}