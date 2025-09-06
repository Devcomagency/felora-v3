"use client"

import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface FeloraViewState {
  center: [number, number]
  zoom: number
  bounds?: [number, number, number, number] // west,south,east,north
}

interface MapShellProps {
  initialViewState: FeloraViewState
  onViewStateChange?: (v: FeloraViewState) => void
  className?: string
  children?: React.ReactNode
}

// Fix default Leaflet icons (client)
if (typeof window !== 'undefined') {
  // @ts-ignore - private API in upstream type
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

function EmitBounds({ onViewStateChange }: { onViewStateChange?: (v: FeloraViewState) => void }) {
  const map = useMap()
  useEffect(() => {
    if (!onViewStateChange) return
    const t = setTimeout(() => {
      try {
        const c = map.getCenter()
        const z = map.getZoom()
        const b = map.getBounds()
        onViewStateChange({ center: [c.lat, c.lng], zoom: z, bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] })
      } catch {}
    }, 100)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

function MapEvents({ onViewStateChange }: { onViewStateChange?: (v: FeloraViewState) => void }) {
  const map = useMapEvents({
    moveend() {
      if (!onViewStateChange) return
      const c = map.getCenter(); const z = map.getZoom(); const b = map.getBounds()
      onViewStateChange({ center: [c.lat, c.lng], zoom: z, bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] })
    },
    zoomend() {
      if (!onViewStateChange) return
      const c = map.getCenter(); const z = map.getZoom(); const b = map.getBounds()
      onViewStateChange({ center: [c.lat, c.lng], zoom: z, bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] })
    },
  })
  return null
}

function SyncView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    const cur = map.getCenter(); const curZ = map.getZoom()
    const near = (a: number, b: number) => Math.abs(a - b) < 1e-6
    if (!near(cur.lat, center[0]) || !near(cur.lng, center[1]) || curZ !== zoom) {
      map.setView(center, zoom, { animate: true })
    }
  }, [center, zoom, map])
  return null
}

export default function MapShell({ initialViewState, onViewStateChange, className, children }: MapShellProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return (
      <div className={`${className} flex items-center justify-center bg-black`}>
        <div className="text-white">Chargement de la carte...</div>
      </div>
    )
  }

  const { center, zoom } = initialViewState
  return (
    <MapContainer center={center} zoom={zoom} className={className} scrollWheelZoom preferCanvas>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />
      <SyncView center={center} zoom={zoom} />
      <EmitBounds onViewStateChange={onViewStateChange} />
      <MapEvents onViewStateChange={onViewStateChange} />
      {children}
    </MapContainer>
  )
}

