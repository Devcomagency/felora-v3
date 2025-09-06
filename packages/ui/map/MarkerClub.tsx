'use client'

import { Marker } from 'react-leaflet'
import type { ClubPinDTO } from '../../../core/services/geo/types'

export default function MarkerClub({ club, onClick, isSelected }: {
  club: ClubPinDTO
  onClick?: (c: ClubPinDTO) => void
  isSelected?: boolean
}) {
  // SSR safety check
  if (typeof window === 'undefined') return null
  // Coordonnées invalides → ne rien rendre
  if (typeof club?.lat !== 'number' || typeof club?.lng !== 'number') return null
  
  const L = require('leaflet')
  const icon = L.divIcon({
    className: 'marker-club',
    html: `<div class="w-4 h-4 rounded-full shadow-lg ${club.isActive ? 'bg-pink-500' : 'bg-gray-400 opacity-70'}"></div>`,
    iconSize: [16, 16],
  })

  return (
    <Marker
      position={[club.lat, club.lng]}
      icon={icon}
      zIndexOffset={900}
      eventHandlers={{ click: () => onClick?.(club) }}
    />
  )
}
