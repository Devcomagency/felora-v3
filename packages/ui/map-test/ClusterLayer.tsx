"use client"

import { useMemo } from 'react'
import Supercluster from 'supercluster'
import { Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import MarkerEscort from './MarkerEscort'
import MarkerClub from './MarkerClub'

export type EscortPinDTO = { id: string; lat: number; lng: number; name: string; city: string; avatar?: string; verified?: boolean; isActive?: boolean }
export type ClubPinDTO = { id: string; lat: number; lng: number; name: string; verified?: boolean }

type Props = {
  escorts: EscortPinDTO[]
  clubs: ClubPinDTO[]
  zoom: number
  bounds?: [number, number, number, number]
  onClusterClick?: (escorts: EscortPinDTO[], clubs: ClubPinDTO[], lat: number, lng: number) => void
}

const createClusterIcon = (count: number) => {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 50px; height: 50px; border-radius: 50%;
        background: ${count > 0 ? '#10B981' : '#6B7280'};
        border: 3px solid white; color: white; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      ">${count}</div>
    `,
    iconSize: [50, 50],
  })
}

export default function ClusterLayer({ escorts, clubs, zoom, bounds, onClusterClick }: Props) {
  const map = useMap()

  const points = useMemo(() => {
    const toPoint = (p: { id: string, lat: number, lng: number, type: 'ESCORT' | 'CLUB' }) => ({
      type: 'Feature' as const,
      properties: { cluster: false, id: p.id, type: p.type },
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] }
    })
    return [
      ...escorts.map(e => toPoint({ id: e.id, lat: e.lat, lng: e.lng, type: 'ESCORT' })),
      ...clubs.map(c => toPoint({ id: c.id, lat: c.lat, lng: c.lng, type: 'CLUB' })),
    ]
  }, [escorts, clubs])

  const index = useMemo(() => new Supercluster({ radius: 60, maxZoom: 18 }).load(points), [points])

  const visible = useMemo(() => {
    let b = bounds
    try {
      if (!b) {
        const mb = map.getBounds()
        b = [mb.getWest(), mb.getSouth(), mb.getEast(), mb.getNorth()]
      }
    } catch {}
    if (!b) return []
    const [west, south, east, north] = b
    return index.getClusters([west, south, east, north], Math.floor(zoom))
  }, [index, bounds, zoom, map])

  return (
    <>
      {visible.map((feat: any) => {
        const [lng, lat] = feat.geometry.coordinates
        const { cluster, point_count: count } = feat.properties
        if (cluster) {
          const icon = createClusterIcon(count)
          return (
            <Marker
              key={`cluster-${feat.id}`}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (typeof onClusterClick === 'function') {
                    const leaves: any[] = index.getLeaves(feat.id, Infinity, 0)
                    const clusterEscorts: EscortPinDTO[] = []
                    const clusterClubs: ClubPinDTO[] = []
                    leaves.forEach((leaf: any) => {
                      const id = String(leaf.properties.id)
                      const type = leaf.properties.type
                      if (type === 'ESCORT') {
                        const e = escorts.find(x => x.id === id)
                        if (e) clusterEscorts.push(e)
                      } else if (type === 'CLUB') {
                        const c = clubs.find(x => x.id === id)
                        if (c) clusterClubs.push(c)
                      }
                    })
                    onClusterClick(clusterEscorts, clusterClubs, lat, lng)
                  } else {
                    const expansionZoom = Math.min(index.getClusterExpansionZoom(feat.id), 18)
                    map.setView([lat, lng], expansionZoom, { animate: true })
                  }
                }
              }}
            />
          )
        }
        // Non-cluster single point at low zoom → afficher directement l'icône profil
        const id = String(feat.properties.id)
        const type = feat.properties.type
        if (type === 'ESCORT') {
          const e = escorts.find(x => x.id === id)
          if (e) return <MarkerEscort key={`single-escort-${id}`} escort={e as any} />
        }
        if (type === 'CLUB') {
          const c = clubs.find(x => x.id === id)
          if (c) return <MarkerClub key={`single-club-${id}`} club={c as any} />
        }
        // Fallback si données manquantes
        const singleIcon = createClusterIcon(1)
        return <Marker key={`single-${id}`} position={[lat, lng]} icon={singleIcon} />
      })}
    </>
  )
}
