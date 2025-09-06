/**
 * Database Adapters - Fail-soft & Compatible with any schema
 * Converts raw DB rows to stable DTOs with defaults
 */

export interface MediaItem {
  type: 'image' | 'video'
  url: string
  thumb?: string
  poster?: string
}

export interface EscortProfileDTO {
  id: string
  name: string
  handle?: string
  stageName?: string
  avatar?: string
  city?: string
  age?: number
  languages: string[]
  services: string[]
  media: MediaItem[]
  verified?: boolean
  premium?: boolean
  online?: boolean
  description?: string
  stats?: {
    likes?: number
    followers?: number
    views?: number
  }
  rates?: {
    hour?: number
    twoHours?: number
    halfDay?: number
    fullDay?: number
    overnight?: number
  }
  availability?: {
    incall?: boolean
    outcall?: boolean
    available?: boolean
    schedule?: string
  }
  physical?: {
    height?: number
    bodyType?: string
    hairColor?: string
    eyeColor?: string
  }
  practices?: string[]
  workingArea?: string
}

export interface ClubProfileDTO {
  id: string
  name: string
  handle?: string
  avatar?: string
  city?: string
  languages: string[]
  services: string[]
  media: MediaItem[]
  verified?: boolean
  premium?: boolean
  description?: string
  stats?: {
    likes?: number
    followers?: number
    views?: number
  }
  location?: {
    address?: string
    coordinates?: { lat: number; lng: number }
  }
  contact?: {
    phone?: string
    website?: string
    email?: string
  }
  amenities?: string[]
  workingHours?: string
}

/**
 * Safely parse JSON that might be a string or array
 */
export function parseMaybeJSONList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(v => typeof v === 'string')
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.filter(v => typeof v === 'string') : []
    } catch {
      return value ? [value] : []
    }
  }
  return []
}

/**
 * Parse media JSON safely with fallbacks
 */
export function parseMaybeMediaList(value: unknown): MediaItem[] {
  if (Array.isArray(value)) {
    return value.map(item => ({
      type: (item.type === 'video' || item.type === 'image') ? item.type : 'image',
      url: item.url || '',
      thumb: item.thumb,
      poster: item.poster
    })).filter(item => item.url)
  }
  
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parseMaybeMediaList(parsed)
    } catch {
      return []
    }
  }
  
  return []
}

/**
 * Convert raw DB row to EscortProfileDTO with fail-soft defaults
 */
export function toEscortProfileDTO(row: any): EscortProfileDTO {
  if (!row) {
    return {
      id: 'unknown',
      name: 'Profile Unavailable',
      languages: [],
      services: [],
      media: []
    }
  }

  // Handle gallery photos with fallback
  let media: MediaItem[] = []
  if (row.galleryPhotos) {
    media = parseMaybeMediaList(row.galleryPhotos)
  }
  
  // Add profile photo as first media if exists
  if (row.profilePhoto) {
    media.unshift({
      type: 'image',
      url: row.profilePhoto
    })
  }

  // Fallback media if none
  if (media.length === 0) {
    media = [{
      type: 'image',
      url: '/icons/verified.svg' // Safe fallback
    }]
  }

  return {
    id: row.id || 'unknown',
    name: row.stageName || row.firstName || row.name || 'Unknown',
    handle: row.stageName ? `@${row.stageName.toLowerCase().replace(/\s+/g, '_')}` : undefined,
    stageName: row.stageName,
    avatar: row.profilePhoto || '/icons/verified.svg',
    city: row.city || row.location,
    age: row.dateOfBirth ? 
      new Date().getFullYear() - new Date(row.dateOfBirth).getFullYear() : 
      row.age,
    languages: parseMaybeJSONList(row.languages),
    services: parseMaybeJSONList(row.services),
    media,
    verified: row.isVerifiedBadge || row.verified || false,
    premium: row.premium || false,
    online: row.status === 'ACTIVE' || row.online || false,
    description: row.description || row.bio,
    stats: {
      likes: row.likes || 0,
      followers: row.followers || 0,
      views: row.views || 0
    },
    rates: {
      hour: row.rate1H || row.hourlyRate,
      twoHours: row.rate2H,
      halfDay: row.rateHalfDay,
      fullDay: row.rateFullDay,
      overnight: row.rateOvernight
    },
    availability: {
      incall: row.incall || false,
      outcall: row.outcall || false,
      available: row.availableNow || row.status === 'ACTIVE',
      schedule: row.schedule || row.availability
    },
    physical: {
      height: row.height,
      bodyType: row.bodyType,
      hairColor: row.hairColor,
      eyeColor: row.eyeColor
    },
    practices: parseMaybeJSONList(row.practices),
    workingArea: row.workingArea || row.city
  }
}

/**
 * Convert raw DB row to ClubProfileDTO with fail-soft defaults
 */
export function toClubProfileDTO(row: any): ClubProfileDTO {
  if (!row) {
    return {
      id: 'unknown',
      name: 'Club Unavailable',
      languages: [],
      services: [],
      media: []
    }
  }

  // Handle media
  let media: MediaItem[] = []
  if (row.photos) {
    media = parseMaybeMediaList(row.photos)
  }
  
  if (row.logo) {
    media.unshift({
      type: 'image',
      url: row.logo
    })
  }

  if (media.length === 0) {
    media = [{
      type: 'image',
      url: '/icons/verified.svg'
    }]
  }

  return {
    id: row.id || 'unknown',
    name: row.name || 'Unknown Club',
    handle: row.handle ? `@${row.handle}` : undefined,
    avatar: row.logo || '/icons/verified.svg',
    city: row.city || row.location,
    languages: parseMaybeJSONList(row.languages),
    services: parseMaybeJSONList(row.services),
    media,
    verified: row.verified || false,
    premium: row.premium || false,
    description: row.description,
    stats: {
      likes: row.likes || 0,
      followers: row.followers || 0,
      views: row.views || 0
    },
    location: {
      address: row.address,
      coordinates: (row.latitude && row.longitude) ? 
        { lat: row.latitude, lng: row.longitude } : undefined
    },
    contact: {
      phone: row.phone,
      website: row.website,
      email: row.email
    },
    amenities: parseMaybeJSONList(row.amenities),
    workingHours: row.workingHours || row.schedule
  }
}

/**
 * Sanitize string for XSS protection
 */
export function sanitizeString(str: unknown): string {
  if (typeof str !== 'string') return ''
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Create minimal fail-soft profile
 */
export function createMinimalProfile(id: string, type: 'escort' | 'club'): EscortProfileDTO | ClubProfileDTO {
  const base = {
    id,
    name: 'Profile Temporarily Unavailable',
    languages: ['English'],
    services: [],
    media: [{
      type: 'image' as const,
      url: '/icons/verified.svg'
    }],
    stats: { likes: 0, followers: 0, views: 0 }
  }

  if (type === 'escort') {
    return {
      ...base,
      availability: { available: false }
    } as EscortProfileDTO
  }

  return base as ClubProfileDTO
}