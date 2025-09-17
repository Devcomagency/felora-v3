'use client'

import { Marker } from 'react-leaflet'
import type { EscortPinDTO } from '../../../core/services/geo/types'

interface MarkerEscortProps {
  escort: EscortPinDTO
  onClick?: (escort: EscortPinDTO) => void
  isSelected?: boolean
}

// Icône personnalisée pour les markers escort avec design glassmorphism
const createEscortIcon = (escort: EscortPinDTO, isSelected: boolean) => {
  // SSR safety check
  if (typeof window === 'undefined') return undefined
  
  const L = require('leaflet')
  const size = 32
  const pulseSize = 40
  
  return L.divIcon({
    html: `
      <div class="relative cursor-pointer group" role="button" aria-label="${(escort.name || 'Profil').toString()}" style="width: ${size}px; height: ${size}px;">
        <!-- Pulse animation pour les profils actifs -->
        ${escort.isActive ? `
          <div style="
            position: absolute;
            inset: 0;
            width: ${pulseSize}px;
            height: ${pulseSize}px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background: rgba(255, 107, 157, 0.3);
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
        
        <!-- Marker principal avec glassmorphism EXACT -->
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${escort.isActive 
            ? 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)'
            : 'rgba(107, 114, 128, 0.6)'
          };
          border: ${isSelected ? '2px solid white' : '2px solid rgba(255, 255, 255, 0.3)'};
          box-shadow: ${escort.isActive 
            ? '0 4px 12px rgba(255, 107, 157, 0.4)'
            : '0 4px 12px rgba(0, 0, 0, 0.3)'
          };
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          ${isSelected ? 'transform: scale(1.1);' : ''}
        ">
          ${escort.avatar ? `
            <img 
              src="${encodeURI(escort.avatar)}" 
              alt="${escort.name}"
              style="
                width: 24px;
                height: 24px;
                border-radius: 50%;
                object-fit: cover;
                border: 1px solid rgba(255, 255, 255, 0.3);
              "
            />
          ` : `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${escort.isActive ? 'white' : 'rgba(255, 255, 255, 0.6)'}" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          `}
          
          <!-- Badge de vérification -->
          ${escort.verified ? `
            <div style="
              position: absolute;
              top: -2px;
              right: -2px;
              width: 12px;
              height: 12px;
              background: #3B82F6;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px solid white;
            ">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                <path d="M20 6 9 17l-5-5"></path>
              </svg>
            </div>
          ` : ''}
        </div>
        
        <!-- Shadow -->
        <div style="
          position: absolute;
          top: ${size + 2}px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 50%;
          filter: blur(2px);
        "></div>
      </div>
      
      <style>
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          70% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      </style>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size]
  })
}

export default function MarkerEscort({ escort, onClick, isSelected }: MarkerEscortProps) {
  // SSR safety check
  if (typeof window === 'undefined') return null
  // Coordonnées invalides → ne rien rendre
  if (!escort || !Number.isFinite((escort as any).lat) || !Number.isFinite((escort as any).lng)) return null

  const handleMarkerClick = async () => {
    // Au lieu de gérer les popups localement, on signale juste le clic au parent
    // et on laisse le parent gérer l'affichage de la popup externe
    onClick?.(escort)
  }


  return (
    <>
      <Marker
        position={[escort.lat, escort.lng]}
        icon={createEscortIcon(escort, isSelected || false)}
        eventHandlers={{
          click: handleMarkerClick,
        }}
        zIndexOffset={1000}
      />
    </>
  )
}

// Styles CSS pour la popup (à ajouter dans globals.css)
export const popupStyles = `
.felora-map-popup .maplibregl-popup-content {
  background: transparent !important;
  padding: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.felora-map-popup .maplibregl-popup-tip {
  border-top-color: rgba(17, 24, 39, 0.95) !important;
  filter: drop-shadow(0 -1px 1px rgba(0, 0, 0, 0.1));
}
`
