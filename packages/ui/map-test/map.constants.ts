/**
 * Configuration constants for the Map component
 */

// ===== MAP CONFIGURATION =====

export const MAP_CONFIG = {
  // MapLibre style URL
  STYLE_URL: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',

  // Default view settings
  DEFAULT_VIEW: {
    latitude: 46.8182, // Centre de la Suisse
    longitude: 8.2275,
    zoom: 7.5
  },

  // User location view settings
  USER_LOCATION_VIEW: {
    zoom: 12
  },

  // Map control settings
  CONTROLS: {
    showFullscreenControl: true,
    showNavigationControl: true,
    showScaleControl: false,
    showGeolocateControl: true
  },

  // Map limits
  MIN_ZOOM: 6,
  MAX_ZOOM: 18,

  // Interaction settings
  DRAG_PAN: true,
  SCROLL_ZOOM: true,
  DOUBLE_CLICK_ZOOM: true,
  TOUCH_ZOOM_ROTATE: true
} as const

// ===== CLUSTER CONFIGURATION =====

export const CLUSTER_CONFIG = {
  // Supercluster options
  radius: 60, // Cluster radius in pixels
  maxZoom: 15, // Max zoom level for clustering
  minZoom: 0, // Min zoom level for clustering
  minPoints: 2, // Minimum points to form a cluster

  // Display settings
  SMALL_CLUSTER_SIZE: 10,
  MEDIUM_CLUSTER_SIZE: 50
} as const

// ===== PERFORMANCE CONFIGURATION =====

export const PERFORMANCE_CONFIG = {
  // Maximum visible escorts (for sidebar)
  MAX_VISIBLE_ESCORTS: 30,

  // Throttle delay for map interactions (ms)
  THROTTLE_DELAY: 100,

  // Debounce delay for filters (ms)
  FILTER_DEBOUNCE: 150
} as const

// ===== UI CONFIGURATION =====

export const UI_CONFIG = {
  // Marker sizes (width x height in pixels)
  MARKER_SIZES: {
    SINGLE: { width: 40, height: 50 },
    CLUSTER_SMALL: { width: 50, height: 50 },
    CLUSTER_MEDIUM: { width: 65, height: 65 },
    CLUSTER_LARGE: { width: 80, height: 80 }
  },

  // Sidebar width
  SIDEBAR_WIDTH: '400px',

  // Filter button colors
  FILTER_COLORS: {
    ALL: 'from-purple-500 to-pink-500',
    ESCORT: 'from-pink-500 to-rose-500',
    CLUB: 'from-blue-500 to-cyan-500'
  },

  // Category colors (for badges)
  CATEGORY_COLORS: {
    FEMALE: 'bg-pink-500',
    MALE: 'bg-blue-500',
    TRANS: 'bg-purple-500',
    COUPLE: 'bg-yellow-500',
    OTHER: 'bg-gray-500'
  }
} as const

// ===== GEOLOCATION CONFIGURATION =====

export const GEOLOCATION_CONFIG = {
  // Geolocation options
  enableHighAccuracy: true,
  timeout: 10000, // 10 seconds
  maximumAge: 0,

  // Error messages
  ERROR_MESSAGES: {
    PERMISSION_DENIED: 'Vous devez autoriser la géolocalisation pour utiliser cette fonctionnalité',
    POSITION_UNAVAILABLE: 'Position non disponible',
    TIMEOUT: 'Délai de géolocalisation dépassé',
    NOT_SUPPORTED: 'La géolocalisation n\'est pas supportée par votre navigateur',
    GENERIC: 'Erreur de géolocalisation'
  }
} as const

// ===== API CONFIGURATION =====

export const API_CONFIG = {
  // SWR configuration
  SWR: {
    refreshInterval: 0, // No auto-refresh
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute
    shouldRetryOnError: true,
    errorRetryCount: 3,
    errorRetryInterval: 5000 // 5 seconds
  },

  // API endpoints
  ENDPOINTS: {
    ESCORTS: '/api/escorts/map',
    CLUBS: '/api/clubs/map'
  }
} as const

// ===== ANIMATION CONFIGURATION =====

export const ANIMATION_CONFIG = {
  // Framer Motion variants
  SIDEBAR_VARIANTS: {
    hidden: { x: '100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200
      }
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  },

  FILTER_VARIANTS: {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.15
      }
    }
  }
} as const

// ===== TYPE DEFINITIONS =====

export type FilterType = 'ALL' | 'ESCORT' | 'CLUB'
export type CategoryType = 'FEMALE' | 'MALE' | 'TRANS' | 'COUPLE'

export interface EscortPoint {
  id: string
  latitude: number
  longitude: number
  stageName: string
  category?: CategoryType
  city: string
  profilePhoto: string | null
  handle: string
  verified: boolean
  age?: number
  location?: string
}

export interface ClubPoint {
  id: string
  latitude: number
  longitude: number
  name: string
  handle: string
  logo: string | null
  city: string
  verified: boolean
}

export interface ClusterFeature {
  type: 'Feature'
  properties: {
    cluster: boolean
    cluster_id?: number
    point_count?: number
    point_count_abbreviated?: string
    id?: string
    type?: 'ESCORT' | 'CLUB'
  }
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}
