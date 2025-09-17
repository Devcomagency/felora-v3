'use client'

import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'

// Fix pour les icônes Leaflet par défaut - charge Leaflet côté client seulement
if (typeof window !== 'undefined') {
  // Charger Leaflet côté client pour éviter "window is not defined" en SSR
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const L = require('leaflet')
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

export interface FeloraViewState {
  center: [number, number]
  zoom: number
  bounds?: [number, number, number, number] // [west, south, east, north]
}

interface MapShellProps {
  initialViewState: FeloraViewState
  onViewStateChange?: (v: FeloraViewState) => void
  className?: string
  children?: React.ReactNode
}

function EmitInitialBounds({ onViewStateChange }: { onViewStateChange?: (v: FeloraViewState) => void }) {
  const map = useMap()
  useEffect(() => {
    if (!onViewStateChange || !map) return
    // Attendre que la carte soit prête
    const timeout = setTimeout(() => {
      try {
        const c = map.getCenter()
        const z = map.getZoom()
        const b = map.getBounds()
        onViewStateChange({
          center: [c.lat, c.lng],
          zoom: z,
          bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
        })
      } catch (e) {
        console.warn('EmitInitialBounds failed:', e)
      }
    }, 100)
    return () => clearTimeout(timeout)
    // une seule fois au mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

function MapEvents({ onViewStateChange }: { onViewStateChange?: (v: FeloraViewState) => void }) {
  const map = useMapEvents({
    moveend() {
      if (!onViewStateChange) return
      const c = map.getCenter()
      const z = map.getZoom()
      const b = map.getBounds()
      onViewStateChange({
        center: [c.lat, c.lng],
        zoom: z,
        bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
      })
    },
    zoomend() {
      if (!onViewStateChange) return
      const c = map.getCenter()
      const z = map.getZoom()
      const b = map.getBounds()
      onViewStateChange({
        center: [c.lat, c.lng],
        zoom: z,
        bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
      })
    }
  })
  return null
}

function SyncView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    // Ne recentrer que si nécessaire pour éviter les boucles moveend
    const current = map.getCenter()
    const currentZoom = map.getZoom()
    const nearlyEqual = (a: number, b: number) => Math.abs(a - b) < 1e-6
    const sameCenter = nearlyEqual(current.lat, center[0]) && nearlyEqual(current.lng, center[1])
    const sameZoom = currentZoom === zoom
    if (!sameCenter || !sameZoom) {
      map.setView(center, zoom, { animate: true })
    }
  }, [center, zoom, map])
  return null
}

export default function MapShell({ initialViewState, onViewStateChange, className, children }: MapShellProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Protection SSR complète
  if (!isMounted || typeof window === 'undefined') {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-900`}>
        <div className="text-white">Chargement de la carte...</div>
      </div>
    )
  }
  
  const { center, zoom } = initialViewState
  
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      scrollWheelZoom
      preferCanvas
      key="map-container" // Force re-render si nécessaire
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution=""
      />
      <SyncView center={center} zoom={zoom} />
      <EmitInitialBounds onViewStateChange={onViewStateChange} />
      <MapEvents onViewStateChange={onViewStateChange} />
      {children}
    </MapContainer>
  )
}
