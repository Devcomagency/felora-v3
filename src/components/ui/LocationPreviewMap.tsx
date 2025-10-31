'use client'

import { MapPin, ExternalLink, Lock } from 'lucide-react'
import Link from 'next/link'

interface LocationPreviewMapProps {
  coordinates: { lat: number; lng: number }
  address: string
  privacy?: 'precise' | 'approximate'
  className?: string
}

export default function LocationPreviewMap({ 
  coordinates, 
  address, 
  privacy = 'precise',
  className = ''
}: LocationPreviewMapProps) {
  // DEBUG: Log pour vérifier les props
  console.log('📍 LocationPreviewMap props:', { address, coordinates, privacy })

  // VALIDATION: S'assurer que coordinates est défini
  if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
    console.warn('⚠️ LocationPreviewMap: coordinates invalides', coordinates)
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center p-8 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <div className="text-center">
            <div className="text-4xl mb-2">📍</div>
            <div className="text-white font-medium mb-1">Localisation non disponible</div>
            <div className="text-sm text-gray-400">Coordonnées GPS manquantes</div>
          </div>
        </div>
      </div>
    )
  }

  // Appliquer un décalage déterministe de ±150m si privacy === 'approximate'
  const getDisplayCoordinates = (coords: { lat: number; lng: number }, isApproximate: boolean, addr: string) => {
    if (!isApproximate) return coords
    
    // Générer un offset déterministe basé sur l'adresse
    // 1 degré lat/lng ≈ 111km ≈ 111000m
    // 150m ≈ 150/111000 ≈ 0.00135 degrés
    const maxOffset = 0.00135 // Exactement 150m de décalage
    
    // Hash simple de l'adresse pour obtenir un offset déterministe
    let hash = 0
    for (let i = 0; i < addr.length; i++) {
      const char = addr.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    
    // Utiliser le hash pour générer un offset entre -150m et +150m
    // Normaliser le hash pour obtenir des valeurs entre -1 et 1
    const normalizedHash1 = ((hash & 0x7FFFFFFF) % 1000) / 1000 * 2 - 1 // Entre -1 et 1 (masque pour forcer positif)
    const normalizedHash2 = ((((hash >> 8) & 0x7FFFFFFF) % 1000) / 1000 * 2 - 1) // Entre -1 et 1
    
    const offsetLat = normalizedHash1 * maxOffset
    const offsetLng = normalizedHash2 * maxOffset
    
    console.log('🔍 Offset calculé:', { hash, normalizedHash1, normalizedHash2, offsetLat, offsetLng, maxOffset, distanceMeters: Math.sqrt(offsetLat * offsetLat + offsetLng * offsetLng) * 111000 })
    
    return {
      lat: coords.lat + offsetLat,
      lng: coords.lng + offsetLng
    }
  }

  const displayCoordinates = getDisplayCoordinates(coordinates, privacy === 'approximate', address)

  // Log détaillé pour debug
  const hasChanged = displayCoordinates.lat !== coordinates.lat || displayCoordinates.lng !== coordinates.lng
  
  console.log('📍 LocationPreviewMap FINAL:', {
    privacy,
    hasChanged,
    original: coordinates,
    display: displayCoordinates,
    offset: privacy === 'approximate' ? {
      lat: displayCoordinates.lat - coordinates.lat,
      lng: displayCoordinates.lng - coordinates.lng
    } : null
  })

  return (
    <div className={`relative ${className}`}>
      {/* Header de la mini-carte */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <MapPin className="text-purple-400" size={16} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Localisation</h4>
            <p className="text-xs text-gray-400 truncate max-w-[200px] sm:max-w-none">
              {address}
            </p>
          </div>
        </div>
        
        {/* Indicateur de confidentialité */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          privacy === 'precise' 
            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
            : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
        }`}>
          {privacy === 'precise' ? (
            <>
              <MapPin size={12} />
              <span>Précise</span>
            </>
          ) : (
            <>
              <Lock size={12} />
              <span>±150m</span>
            </>
          )}
        </div>
      </div>

      {/* Info de coordonnées avec décalage */}
      {privacy === 'approximate' && (() => {
        const offsetLat = displayCoordinates.lat - coordinates.lat
        const offsetLng = displayCoordinates.lng - coordinates.lng
        const distanceMeters = Math.sqrt(offsetLat * offsetLat + offsetLng * offsetLng) * 111000
        return (
          <div className="mb-3 px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="text-xs text-orange-300 font-medium mb-1">📍 Position décalée pour confidentialité</div>
            <div className="text-xs text-gray-400 font-mono mb-1">
              {displayCoordinates.lat.toFixed(6)}, {displayCoordinates.lng.toFixed(6)}
            </div>
            <div className="text-xs text-orange-400/80">
              Décalage estimé: ~{Math.round(distanceMeters)}m
            </div>
          </div>
        )
      })()}

      {/* Bouton "Voir sur la carte complète" - Mobile First & Premium */}
      <div className="flex justify-end">
        <Link 
          href={`/map?center=${displayCoordinates.lat},${displayCoordinates.lng}&zoom=15`}
          className="group inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-purple-600 hover:bg-purple-500 border border-purple-500/30 rounded-lg text-xs sm:text-sm text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden"
        >
          {/* Effet de brillance au hover */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
          <ExternalLink size={14} className="relative z-10 sm:w-4 sm:h-4" />
          <span className="relative z-10 hidden sm:inline">Voir ma position</span>
          <span className="relative z-10 sm:hidden">Voir</span>
        </Link>
      </div>

    </div>
  )
}