'use client'

import { MapPin, ExternalLink } from 'lucide-react'
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
  return (
    <div className={`relative ${className}`}>
      {/* Header de la mini-carte */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <MapPin className="text-purple-400" size={14} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-white">Prévisualisation</h4>
            <p className="text-xs text-gray-400">Votre position sur la carte</p>
          </div>
        </div>
        
        {/* Indicateur de confidentialité */}
        <div className={`px-2 py-1 rounded-full text-xs ${
          privacy === 'precise' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-orange-500/20 text-orange-400'
        }`}>
          {privacy === 'precise' ? '📍 Précise' : '🔒 Approximative'}
        </div>
      </div>

      {/* Version simplifiée - juste les informations */}
      <div className="h-32 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700/50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20"></div>
        </div>
        
        {/* Contenu */}
        <div className="relative h-full flex flex-col justify-center items-center text-center p-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
            <MapPin className="text-purple-400" size={24} />
          </div>
          <p className="text-xs text-white font-medium mb-1 truncate max-w-full">
            {address}
          </p>
          <p className="text-xs text-gray-400">
            {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </p>
        </div>
        
        {/* Bouton "Voir sur carte" */}
        <div className="absolute bottom-2 right-2">
          <Link 
            href={`/map?center=${coordinates.lat},${coordinates.lng}&zoom=15`}
            className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/20 rounded text-xs text-white hover:bg-white/10 transition-colors"
          >
            <ExternalLink size={12} />
            Voir sur carte
          </Link>
        </div>
      </div>

      {/* Coordonnées en bas */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        📍 {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
      </div>
    </div>
  )
}