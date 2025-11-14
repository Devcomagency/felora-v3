'use client'

import { Marker } from 'react-map-gl'
import { Verified } from 'lucide-react'
import { ClusterFeature, EscortPoint, ClubPoint, CLUSTER_CONFIG, UI_CONFIG } from '../map.constants'

interface MapMarkersProps {
  clusters: ClusterFeature[]
  escorts: EscortPoint[]
  clubs: ClubPoint[]
  onClusterClick: (clusterId: number, latitude: number, longitude: number) => void
  onMarkerClick: (id: string, type: 'ESCORT' | 'CLUB') => void
}

export function MapMarkers({
  clusters,
  escorts,
  clubs,
  onClusterClick,
  onMarkerClick
}: MapMarkersProps) {
  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates
        const { cluster: isCluster, point_count, id, type } = cluster.properties

        // Render cluster
        if (isCluster && point_count) {
          return (
            <Marker
              key={`cluster-${cluster.properties.cluster_id}`}
              longitude={longitude}
              latitude={latitude}
              anchor="center"
            >
              <ClusterMarker
                count={point_count}
                onClick={() => onClusterClick(
                  cluster.properties.cluster_id!,
                  latitude,
                  longitude
                )}
              />
            </Marker>
          )
        }

        // Render single marker
        const profile = type === 'ESCORT'
          ? escorts.find(e => e.id === id)
          : clubs.find(c => c.id === id)

        if (!profile) return null

        return (
          <Marker
            key={`${type}-${id}`}
            longitude={longitude}
            latitude={latitude}
            anchor="bottom"
          >
            <SingleMarker
              profile={profile}
              type={type!}
              onClick={() => onMarkerClick(id!, type!)}
            />
          </Marker>
        )
      })}
    </>
  )
}

// ===== SUB-COMPONENTS =====

interface ClusterMarkerProps {
  count: number
  onClick: () => void
}

function ClusterMarker({ count, onClick }: ClusterMarkerProps) {
  // Size based on count
  const size = count < CLUSTER_CONFIG.SMALL_CLUSTER_SIZE
    ? UI_CONFIG.MARKER_SIZES.CLUSTER_SMALL
    : count < CLUSTER_CONFIG.MEDIUM_CLUSTER_SIZE
    ? UI_CONFIG.MARKER_SIZES.CLUSTER_MEDIUM
    : UI_CONFIG.MARKER_SIZES.CLUSTER_LARGE

  return (
    <div
      onClick={onClick}
      className="cursor-pointer transform hover:scale-110 transition-transform"
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`
      }}
    >
      <div className="relative w-full h-full">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full blur-md opacity-50" />

        {/* Main circle */}
        <div className="relative w-full h-full bg-gradient-to-br from-pink-500 to-purple-500 rounded-full border-2 border-white/30 flex items-center justify-center shadow-xl">
          <span className="text-white font-black text-sm md:text-base drop-shadow-lg">
            {count}
          </span>
        </div>
      </div>
    </div>
  )
}

interface SingleMarkerProps {
  profile: EscortPoint | ClubPoint
  type: 'ESCORT' | 'CLUB'
  onClick: () => void
}

function SingleMarker({ profile, type, onClick }: SingleMarkerProps) {
  const isEscort = type === 'ESCORT'
  const avatar = isEscort
    ? (profile as EscortPoint).profilePhoto
    : (profile as ClubPoint).logo

  const name = isEscort
    ? (profile as EscortPoint).stageName
    : (profile as ClubPoint).name

  // Fix URLs that start with "undefined/"
  let cleanAvatar = avatar
  if (avatar && avatar.includes('undefined/')) {
    cleanAvatar = avatar.replace(/^undefined\//, 'https://media.felora.ch/')
  }

  return (
    <div
      onClick={onClick}
      className="cursor-pointer transform hover:scale-110 transition-transform"
      style={{
        width: `${UI_CONFIG.MARKER_SIZES.SINGLE.width}px`,
        height: `${UI_CONFIG.MARKER_SIZES.SINGLE.height}px`
      }}
    >
      <div className="relative w-full h-full">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full blur-md opacity-40" />

        {/* Pin shape container */}
        <div className="relative w-full h-full">
          {/* Avatar circle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 border-white/50 bg-gradient-to-br from-pink-500/20 to-purple-500/20 overflow-hidden shadow-lg">
            {cleanAvatar ? (
              <img
                src={cleanAvatar}
                alt={name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">
                {isEscort ? '👤' : '🏢'}
              </div>
            )}

            {/* Verified badge */}
            {profile.verified && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                <Verified className="w-2.5 h-2.5 text-white" fill="currentColor" />
              </div>
            )}
          </div>

          {/* Pin point */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-pink-500/80" />
        </div>
      </div>
    </div>
  )
}
