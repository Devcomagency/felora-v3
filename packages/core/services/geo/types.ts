/**
 * Types pour les services de géolocalisation
 */

export interface EscortPinDTO {
  id: string
  lat: number // Coordonnées obfusquées
  lng: number // Coordonnées obfusquées
  name: string
  handle: string
  avatar?: string
  isActive: boolean
  services: string[]
  languages: string[]
  priceRange?: {
    min: number
    max: number
  }
  city?: string
  verified: boolean
}

export interface ClubPinDTO {
  id: string
  lat: number // Coordonnées obfusquées  
  lng: number // Coordonnées obfusquées
  name: string
  handle: string
  logo?: string
  isActive: boolean
  services: string[]
  city?: string
  verified: boolean
  establishmentType: 'CLUB' | 'SALON' | 'MASSAGE' | 'OTHER'
}

export interface GeoSearchParams {
  bbox?: string // "minLng,minLat,maxLng,maxLat"
  center?: string // "lng,lat"
  radiusKm?: number
  services?: string[]
  languages?: string[]
  priceMax?: number
  includeInactive?: boolean
  type?: 'escort' | 'club' | 'both'
}

export interface GeocodeResult {
  lat: number
  lng: number
  display_name: string
  city?: string
  country?: string
}