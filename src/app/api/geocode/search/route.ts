import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '10')
  const region = searchParams.get('region')
  const city = searchParams.get('city')

  if (!query || query.length < 1) {
    return NextResponse.json({ hits: [] })
  }

  try {
    // 🚀 SOLUTION PREMIUM : Recherche intelligente multi-sources
    
    // 1. Recherche avec contexte (ville + canton)
    let searchQuery = query
    if (city) {
      searchQuery = `${query} ${city}`
    }
    
    // 2. Appel API suisse officielle
    const swissResults = await searchSwissAPI(searchQuery, limit * 2)
    
    // 3. Recherche Nominatim (OpenStreetMap) pour plus de résultats
    const nominatimResults = await searchNominatim(query, city, limit)
    
    // 4. Base de données intelligente d'adresses suisses
    const smartResults = searchSmartDatabase(query, city, region)
    
    // 5. Fusionner et scorer intelligemment
    const allResults = [...swissResults, ...nominatimResults, ...smartResults]
    const uniqueResults = deduplicateResults(allResults)
    
    // 6. Scoring intelligent et tri
    const scoredResults = scoreAndRankResults(uniqueResults, query, city, region)
    
    // 7. Limiter et retourner
    const finalResults = scoredResults.slice(0, limit)
    
    return NextResponse.json({ hits: finalResults })

  } catch (error) {
    console.error('Erreur recherche géocodage premium:', error)
    
    // Fallback intelligent
    const fallbackResults = getIntelligentFallback(query, city, region)
    return NextResponse.json({ hits: fallbackResults.slice(0, limit) })
  }
}

// 🚀 FONCTIONS PREMIUM

async function searchSwissAPI(query: string, limit: number) {
  try {
    const searchUrl = new URL('https://api3.geo.admin.ch/rest/services/api/SearchServer')
    searchUrl.searchParams.set('searchText', query)
    searchUrl.searchParams.set('type', 'locations')
    searchUrl.searchParams.set('sr', '2056')
    searchUrl.searchParams.set('limit', limit.toString())

    const response = await fetch(searchUrl.toString(), {
      headers: { 'User-Agent': 'FELORA/1.0 (contact@felora.com)' }
    })

    if (!response.ok) return []

    const data = await response.json()
    if (!data.results || !Array.isArray(data.results)) return []

    return data.results.map((result: any) => {
      const attrs = result.attrs || {}
      const cleanLabel = attrs.label?.replace(/<[^>]*>/g, '') || ''
      
      return {
        score: result.weight || 0,
        identifier: result.id?.toString() || '',
        countryCode: 'CH',
        addressId: attrs.featureId || '',
        buildingId: '',
        address: cleanLabel,
        latitude: attrs.lat || 0,
        longitude: attrs.lon || 0,
        detail: attrs.detail || '',
        origin: 'swiss_api',
        type: getAddressType(cleanLabel, attrs.detail)
      }
    })
  } catch (error) {
    console.error('Erreur API suisse:', error)
    return []
  }
}

async function searchNominatim(query: string, city?: string | null, limit: number = 10) {
  try {
    let searchQuery = query
    if (city) {
      searchQuery = `${query}, ${city}, Suisse`
    } else {
      searchQuery = `${query}, Suisse`
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=${limit}&countrycodes=ch&addressdetails=1`
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'FELORA/1.0 (contact@felora.com)' }
    })

    if (!response.ok) return []

    const data = await response.json()
    if (!Array.isArray(data)) return []

    return data.map((item: any, index: number) => ({
      score: 90 - index * 2,
      identifier: `nominatim_${item.place_id}`,
      countryCode: 'CH',
      addressId: '',
      buildingId: '',
      address: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      detail: `${item.address?.road || ''} ${item.address?.house_number || ''}`.trim(),
      origin: 'nominatim',
      type: getAddressTypeFromNominatim(item)
    }))
  } catch (error) {
    console.error('Erreur Nominatim:', error)
    return []
  }
}

function searchSmartDatabase(query: string, city?: string | null, region?: string | null) {
  const queryLower = query.toLowerCase()
  const results: any[] = []
  
  // Base de données étendue d'adresses suisses
  const swissAddresses = getSwissAddressDatabase()
  
  // Recherche intelligente
  swissAddresses.forEach((addr, index) => {
    const score = calculateFuzzyScore(addr, queryLower, city, region)
    if (score > 0) {
      results.push({
        score: score,
        identifier: `smart_${index}`,
        countryCode: 'CH',
        addressId: '',
        buildingId: '',
        address: addr.fullAddress,
        latitude: addr.lat,
        longitude: addr.lng,
        detail: addr.street,
        origin: 'smart_db',
        type: addr.type
      })
    }
  })
  
  return results.sort((a, b) => b.score - a.score).slice(0, 10)
}

function deduplicateResults(results: any[]) {
  const seen = new Set<string>()
  return results.filter(result => {
    const key = `${result.address}_${result.latitude.toFixed(4)}_${result.longitude.toFixed(4)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function scoreAndRankResults(results: any[], query: string, city?: string | null, region?: string | null) {
  const queryLower = query.toLowerCase()
  
  return results.map(result => {
    let finalScore = result.score || 0
    
    // Bonus pour correspondance exacte
    if (result.address.toLowerCase().includes(queryLower)) {
      finalScore += 20
    }
    
    // Bonus pour ville correspondante
    if (city && result.address.toLowerCase().includes(city.toLowerCase())) {
      finalScore += 30
    }
    
    // Bonus pour région correspondante
    if (region && result.address.toLowerCase().includes(region.toLowerCase())) {
      finalScore += 25
    }
    
    // Bonus pour adresses complètes avec numéro
    if (/\d+/.test(result.address)) {
      finalScore += 15
    }
    
    // Bonus par type d'adresse
    switch (result.type) {
      case 'street': finalScore += 40; break
      case 'building': finalScore += 35; break
      case 'city': finalScore += 30; break
      case 'district': finalScore += 20; break
      default: finalScore += 10; break
    }
    
    return { ...result, score: Math.min(finalScore, 100) }
  }).sort((a, b) => b.score - a.score)
}

function getIntelligentFallback(query: string, city?: string | null, region?: string | null) {
  const queryLower = query.toLowerCase()
  
  // Générer des suggestions intelligentes
  const suggestions: any[] = []
  
  // Si on a une ville, suggérer des rues communes
  if (city) {
    const commonStreets = ['Rue de la Paix', 'Rue du Centre', 'Avenue de la Gare', 'Place du Marché', 'Chemin des Vignes']
    commonStreets.forEach((street, index) => {
      if (street.toLowerCase().includes(queryLower)) {
        suggestions.push({
          score: 80 - index * 5,
          identifier: `fallback_${index}`,
          countryCode: 'CH',
          addressId: '',
          buildingId: '',
          address: `${street}, ${city}`,
          latitude: getCityCoordinates(city).lat,
          longitude: getCityCoordinates(city).lng,
          detail: street,
          origin: 'fallback',
          type: 'street'
        })
      }
    })
  }
  
  // Suggestions de villes si pas de correspondance
  const cities = ['Onex', 'Genève', 'Lausanne', 'Zurich', 'Berne', 'Bâle']
  cities.forEach((cityName, index) => {
    if (cityName.toLowerCase().includes(queryLower)) {
      suggestions.push({
        score: 70 - index * 3,
        identifier: `city_${index}`,
        countryCode: 'CH',
        addressId: '',
        buildingId: '',
        address: cityName,
        latitude: getCityCoordinates(cityName).lat,
        longitude: getCityCoordinates(cityName).lng,
        detail: cityName,
        origin: 'fallback',
        type: 'city'
      })
    }
  })
  
  return suggestions
}

// 🛠️ FONCTIONS UTILITAIRES

function getAddressType(address: string, detail: string): string {
  const addr = address.toLowerCase()
  const det = detail.toLowerCase()
  
  if (/\d+/.test(address) && (addr.includes('rue') || addr.includes('avenue') || addr.includes('chemin'))) {
    return 'building'
  }
  if (addr.includes('rue') || addr.includes('avenue') || addr.includes('chemin')) {
    return 'street'
  }
  if (det.includes('gg25')) return 'city'
  if (det.includes('gazetteer')) return 'district'
  return 'other'
}

function getAddressTypeFromNominatim(item: any): string {
  if (item.address?.house_number) return 'building'
  if (item.address?.road) return 'street'
  if (item.type === 'city') return 'city'
  return 'other'
}

function calculateFuzzyScore(addr: any, query: string, city?: string | null, region?: string | null): number {
  let score = 0
  const street = addr.street.toLowerCase()
  const full = addr.fullAddress.toLowerCase()
  
  // Correspondance exacte
  if (full.includes(query)) score += 50
  else if (street.includes(query)) score += 30
  
  // Correspondance ville
  if (city && full.includes(city.toLowerCase())) score += 20
  
  // Correspondance région
  if (region && full.includes(region.toLowerCase())) score += 15
  
  return score
}

function getSwissAddressDatabase() {
  return [
    // Onex - Adresses communes
    { street: 'Rue de la Paix', fullAddress: 'Rue de la Paix, 1213 Onex', lat: 46.1854, lng: 6.0995, type: 'street' },
    { street: 'Chemin François-Chavaz', fullAddress: 'Chemin François-Chavaz, 1213 Onex', lat: 46.1854, lng: 6.0995, type: 'street' },
    { street: 'Avenue de Châtelaine', fullAddress: 'Avenue de Châtelaine, 1213 Onex', lat: 46.1860, lng: 6.1000, type: 'street' },
    { street: 'Route de Chancy', fullAddress: 'Route de Chancy, 1213 Onex', lat: 46.1840, lng: 6.0980, type: 'street' },
    { street: 'Chemin des Vignes', fullAddress: 'Chemin des Vignes, 1213 Onex', lat: 46.1830, lng: 6.0970, type: 'street' },
    
    // Genève - Rues principales
    { street: 'Rue du Rhône', fullAddress: 'Rue du Rhône, 1204 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue du Mont-Blanc', fullAddress: 'Rue du Mont-Blanc, 1201 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue de la Croix-d\'Or', fullAddress: 'Rue de la Croix-d\'Or, 1204 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    
    // Lausanne - Rues principales
    { street: 'Rue de Bourg', fullAddress: 'Rue de Bourg, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Place Saint-François', fullAddress: 'Place Saint-François, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Avenue de la Gare', fullAddress: 'Avenue de la Gare, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    
    // Zurich - Rues principales
    { street: 'Bahnhofstrasse', fullAddress: 'Bahnhofstrasse, 8001 Zürich', lat: 47.3769, lng: 8.5417, type: 'street' },
    { street: 'Limmatquai', fullAddress: 'Limmatquai, 8001 Zürich', lat: 47.3769, lng: 8.5417, type: 'street' },
    
    // Berne - Rues principales
    { street: 'Marktgasse', fullAddress: 'Marktgasse, 3011 Bern', lat: 46.9481, lng: 7.4474, type: 'street' },
    { street: 'Spitalgasse', fullAddress: 'Spitalgasse, 3011 Bern', lat: 46.9481, lng: 7.4474, type: 'street' }
  ]
}

function getCityCoordinates(cityName: string): { lat: number; lng: number } {
  const coords: Record<string, { lat: number; lng: number }> = {
    'onex': { lat: 46.1854, lng: 6.0995 },
    'genève': { lat: 46.2044, lng: 6.1432 },
    'geneva': { lat: 46.2044, lng: 6.1432 },
    'lausanne': { lat: 46.5197, lng: 6.6323 },
    'zurich': { lat: 47.3769, lng: 8.5417 },
    'zürich': { lat: 47.3769, lng: 8.5417 },
    'berne': { lat: 46.9481, lng: 7.4474 },
    'bern': { lat: 46.9481, lng: 7.4474 },
    'bâle': { lat: 47.5596, lng: 7.5886 },
    'basel': { lat: 47.5596, lng: 7.5886 }
  }
  
  return coords[cityName.toLowerCase()] || { lat: 46.2044, lng: 6.1432 } // Genève par défaut
}