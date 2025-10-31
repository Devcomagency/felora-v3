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

  const isCorrect = validation.score >= 75

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
      isCorrect 
        ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
        : 'bg-red-500/10 text-red-400 border border-red-500/30'
    } ${className}`}>
      {isCorrect ? (
        <CheckCircle size={16} />
      ) : (
        <XCircle size={16} />
      )}
      <span className="text-sm font-medium">
        {isCorrect ? 'Adresse correcte' : 'Adresse incorrecte'}
      </span>
    </div>
  )
}