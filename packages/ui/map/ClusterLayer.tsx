'use client'

import { useMemo } from 'react'
import Supercluster from 'supercluster'
import dynamic from 'next/dynamic'
import type { EscortPinDTO, ClubPinDTO } from '../../../core/services/geo/types'
import { useMap } from 'react-leaflet'
import MarkerEscort from './MarkerEscort'
import MarkerClub from './MarkerClub'

// Import dynamique des composants Leaflet pour éviter les erreurs SSR
const Marker = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Marker })), { ssr: false })

// Fonction pour créer l'icône cluster (sera appelée côté client)
const createClusterIcon = (count: number) => {
  if (typeof window === 'undefined') return undefined
  const L = require('leaflet')
  return L.divIcon({
    className: 'cluster-badge',
    html: `<div class="rounded-full bg-gradient-to-br from-pink-500 to-teal-400 text-white text-xs font-semibold w-10 h-10 flex items-center justify-center shadow-lg" role="button" aria-label="Cluster de ${count} profils">${count}</div>`,
    iconSize: [40, 40],
  })
}

type Props = {
  escorts: EscortPinDTO[]
  clubs: ClubPinDTO[]
  zoom: number
  bounds?: [number, number, number, number] // west,south,east,north
  onClusterClick?: (escorts: EscortPinDTO[], clubs: ClubPinDTO[]) => void
}


export default function ClusterLayer({ escorts, clubs, zoom, bounds, onClusterClick }: Props) {
  // Protection SSR
  if (typeof window === 'undefined') {
    return null
  }
  const map = useMap()
  
  const points = useMemo(() => {
    const toPoint = (p: { id: string, lat: number, lng: number, type: string }) => ({
      type: 'Feature' as const,
      properties: { cluster: false, id: p.id, type: p.type },
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] }
    })
    return [
      ...escorts.map(e => toPoint({ id: e.id, lat: e.lat, lng: e.lng, type: 'ESCORT' })),
      ...clubs.map(c => toPoint({ id: c.id, lat: c.lat, lng: c.lng, type: 'CLUB' })),
    ]
  }, [escorts, clubs])

  const index = useMemo(() => new Supercluster({
    radius: 80, // rayon plus large pour regrouper davantage
    maxZoom: 18
  }).load(points), [points])

  const visible = useMemo(() => {
    if (!bounds) return []
    const [west, south, east, north] = bounds
    return index.getClusters([west, south, east, north], Math.floor(zoom))
  }, [index, bounds, zoom])

  return (
    <>
      {visible.map((feat: any, i: number) => {
        const [lng, lat] = feat.geometry.coordinates
        const { cluster, point_count: count } = feat.properties
        if (cluster) {
          const icon = createClusterIcon(count)
          if (!icon) return null // SSR safety

          // Si le cluster ne contient qu'un seul point, afficher directement le marker profil
          if (count === 1) {
            try {
              const leaves: any[] = index.getLeaves(feat.id, 1, 0)
              const leaf = leaves[0]
              if (leaf) {
                const id = String(leaf.properties.id)
                const type = leaf.properties.type
                if (type === 'ESCORT') {
                  const e = escorts.find(x => x.id === id)
                  if (e) return <MarkerEscort key={`single-escort-${id}`} escort={e} />
                } else if (type === 'CLUB') {
                  const c = clubs.find(x => x.id === id)
                  if (c) return <MarkerClub key={`single-club-${id}`} club={c} />
                }
              }
            } catch {}
          }

          return (
            <Marker
              key={`cluster-${feat.id}-${i}`}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (!onClusterClick) {
                    // Comportement par défaut: zoomer sur le cluster
                    try {
                      const expansionZoom = Math.min(index.getClusterExpansionZoom(feat.id), 18)
                      map.setView([lat, lng], expansionZoom, { animate: true })
                    } catch {}
                    return
                  }

                  // Récupérer les points dans ce cluster et déléguer au parent
                  const clusterFeatures = index.getLeaves(feat.id, Infinity, 0)

                  const clusterEscorts: EscortPinDTO[] = []
                  const clusterClubs: ClubPinDTO[] = []

                  clusterFeatures.forEach((feature: any) => {
                    const pointId = feature.properties.id
                    const pointType = feature.properties.type

                    if (pointType === 'ESCORT') {
                      const escort = escorts.find(e => e.id === pointId)
                      if (escort) clusterEscorts.push(escort)
                    } else if (pointType === 'CLUB') {
                      const club = clubs.find(c => c.id === pointId)
                      if (club) clusterClubs.push(club)
                    }
                  })

                  onClusterClick(clusterEscorts, clusterClubs)
                }
              }}
            />
          )
        }
        // Point non cluster → afficher directement le marker profil
        const id = String(feat.properties.id)
        const type = feat.properties.type
        if (type === 'ESCORT') {
          const e = escorts.find(x => x.id === id)
          if (e) return <MarkerEscort key={`single-escort-${id}`} escort={e} />
        }
        if (type === 'CLUB') {
          const c = clubs.find(x => x.id === id)
          if (c) return <MarkerClub key={`single-club-${id}`} club={c} />
        }
        return null
      })}
    </>
  )
}
