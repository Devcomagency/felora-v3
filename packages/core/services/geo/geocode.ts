/**
 * Service de géocodage pour convertir les noms de villes en coordonnées
 */

import type { GeocodeResult } from './types'
import { validateCoordinates } from './geoUtils'

export class GeocodeService {
  
  /**
   * Géocode une ville en utilisant Nominatim (OpenStreetMap)
   */
  static async geocodeCity(city: string): Promise<GeocodeResult | null> {
    try {
      if (!city || city.trim().length < 2) {
        return null
      }
      
      const cleanCity = encodeURIComponent(city.trim())
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${cleanCity}&countrycodes=ch,fr,it,de&limit=1&addressdetails=1`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FELORA/1.0 (contact@felora.com)' // Requis par Nominatim
        }
      })
      
      if (!response.ok) {
        console.error('Erreur geocoding:', response.status)
        return null
      }
      
      const results = await response.json()
      
      if (!results || results.length === 0) {
        return null
      }
      
      const result = results[0]
      const lat = parseFloat(result.lat)
      const lng = parseFloat(result.lon)
      
      if (!validateCoordinates(lat, lng)) {
        return null
      }
      
      return {
        lat,
        lng,
        display_name: result.display_name,
        city: result.address?.city || result.address?.town || result.address?.village || city,
        country: result.address?.country
      }
      
    } catch (error) {
      console.error('Erreur geocoding:', error)
      return null
    }
  }
  
  /**
   * Géocode inversé : coordonnées vers nom de lieu
   */
  static async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
    try {
      if (!validateCoordinates(lat, lng)) {
        return null
      }
      
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FELORA/1.0 (contact@felora.com)'
        }
      })
      
      if (!response.ok) {
        return null
      }
      
      const result = await response.json()
      
      if (!result) {
        return null
      }
      
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name,
        city: result.address?.city || result.address?.town || result.address?.village,
        country: result.address?.country
      }
      
    } catch (error) {
      console.error('Erreur reverse geocoding:', error)
      return null
    }
  }
  
  /**
   * Fallback avec villes suisses prédéfinies
   */
  static getSwissCities(): Array<{ name: string; lat: number; lng: number }> {
    return [
      { name: 'Genève', lat: 46.2044, lng: 6.1432 },
      { name: 'Lausanne', lat: 46.5197, lng: 6.6323 },
      { name: 'Zurich', lat: 47.3769, lng: 8.5417 },
      { name: 'Berne', lat: 46.9481, lng: 7.4474 },
      { name: 'Bâle', lat: 47.5596, lng: 7.5886 },
      { name: 'Lucerne', lat: 47.0502, lng: 8.3093 },
      { name: 'Montreux', lat: 46.4312, lng: 6.9123 },
      { name: 'Neuchâtel', lat: 47.0000, lng: 6.9500 },
      { name: 'Fribourg', lat: 46.8059, lng: 7.1619 },
      { name: 'Sion', lat: 46.2276, lng: 7.3608 }
    ]
  }
  
  /**
   * Recherche rapide dans les villes prédéfinies
   */
  static findSwissCity(query: string): { name: string; lat: number; lng: number } | null {
    const cities = this.getSwissCities()
    const normalizedQuery = query.toLowerCase().trim()
    
    return cities.find(city => 
      city.name.toLowerCase().includes(normalizedQuery) ||
      normalizedQuery.includes(city.name.toLowerCase())
    ) || null
  }
}