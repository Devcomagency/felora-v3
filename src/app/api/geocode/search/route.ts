import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '10')
  const region = searchParams.get('region')
  const city = searchParams.get('city')

  if (!query || query.length < 2) {
    return NextResponse.json({ hits: [] })
  }

  try {
    // Utiliser l'API officielle suisse pour la recherche
    const searchUrl = new URL('https://api3.geo.admin.ch/rest/services/api/SearchServer')
    searchUrl.searchParams.set('searchText', query)
    searchUrl.searchParams.set('type', 'locations')
    searchUrl.searchParams.set('sr', '2056') // Système de coordonnées suisse
    searchUrl.searchParams.set('limit', limit.toString())

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'User-Agent': 'FELORA/1.0 (contact@felora.com)'
      }
    })

    if (!response.ok) {
      throw new Error('Erreur API suisse')
    }

    const data = await response.json()
    
    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json({ hits: [] })
    }

    // Transformer les résultats
    const hits = data.results.map((result: any) => {
      const attrs = result.attrs || {}
      
      // Nettoyer le label HTML
      const cleanLabel = attrs.label?.replace(/<[^>]*>/g, '') || ''
      
      // Extraire les coordonnées (conversion de LV95 vers WGS84)
      const x = attrs.x || attrs.lon || 0
      const y = attrs.y || attrs.lat || 0
      
      // Conversion approximative LV95 vers WGS84
      const lat = attrs.lat || (y - 200000) / 111320 + 46.5
      const lng = attrs.lon || (x - 2600000) / 111320 + 7.5

      return {
        score: result.weight || 0,
        identifier: result.id?.toString() || '',
        countryCode: 'CH',
        addressId: attrs.featureId || '',
        buildingId: '',
        address: cleanLabel,
        latitude: lat,
        longitude: lng,
        detail: attrs.detail || '',
        origin: attrs.origin || ''
      }
    })

    // Filtrage supplémentaire si région ou ville spécifiée
    let filteredHits = hits
    
    if (region) {
      const regionLower = region.toLowerCase()
      filteredHits = filteredHits.filter((hit: any) => 
        hit.address.toLowerCase().includes(regionLower) ||
        hit.detail.toLowerCase().includes(regionLower)
      )
    }
    
    if (city) {
      const cityLower = city.toLowerCase()
      filteredHits = filteredHits.filter((hit: any) => 
        hit.address.toLowerCase().includes(cityLower) ||
        hit.detail.toLowerCase().includes(cityLower)
      )
    }

    // Prioriser les résultats par type (communes > lieux > autres)
    filteredHits.sort((a: any, b: any) => {
      const aScore = getPriorityScore(a)
      const bScore = getPriorityScore(b)
      if (aScore !== bScore) return bScore - aScore
      return (b.score || 0) - (a.score || 0)
    })

    return NextResponse.json({ hits: filteredHits.slice(0, limit) })

  } catch (error) {
    console.error('Erreur recherche géocodage:', error)
    
    // Fallback avec résultats mockés pour les villes suisses communes
    const mockResults = getMockResults(query, region, city)
    return NextResponse.json({ hits: mockResults })
  }
}

function getPriorityScore(hit: any): number {
  const origin = hit.origin?.toLowerCase() || ''
  const detail = hit.detail?.toLowerCase() || ''
  
  // Priorité élevée pour les communes et villes
  if (origin === 'gg25' || detail.includes('ge') || detail.includes('vd') || detail.includes('zh')) {
    return 100
  }
  
  // Priorité moyenne pour les lieux nommés
  if (origin === 'gazetteer') {
    return 50
  }
  
  // Priorité faible pour les arrêts de bus, etc.
  return 10
}

function getMockResults(query: string, region?: string | null, city?: string | null) {
  const queryLower = query.toLowerCase()
  
  // Base de données de villes suisses communes
  const swissCities = [
    { name: 'Onex', canton: 'GE', lat: 46.1854, lng: 6.0995 },
    { name: 'Genève', canton: 'GE', lat: 46.2044, lng: 6.1432 },
    { name: 'Lausanne', canton: 'VD', lat: 46.5197, lng: 6.6323 },
    { name: 'Zurich', canton: 'ZH', lat: 47.3769, lng: 8.5417 },
    { name: 'Berne', canton: 'BE', lat: 46.9481, lng: 7.4474 },
    { name: 'Bâle', canton: 'BS', lat: 47.5596, lng: 7.5886 },
    { name: 'Lucerne', canton: 'LU', lat: 47.0502, lng: 8.3093 },
    { name: 'Lugano', canton: 'TI', lat: 46.0037, lng: 8.9511 },
    { name: 'Sion', canton: 'VS', lat: 46.2294, lng: 7.3594 },
    { name: 'Fribourg', canton: 'FR', lat: 46.8061, lng: 7.1612 },
    { name: 'Neuchâtel', canton: 'NE', lat: 46.9924, lng: 6.9319 },
    { name: 'Saint-Gall', canton: 'SG', lat: 47.4237, lng: 9.3748 }
  ]
  
  // Recherche dans les villes suisses
  const matches = swissCities.filter(city => 
    city.name.toLowerCase().includes(queryLower)
  )
  
  // Filtrage par région si spécifié
  let filteredMatches = matches
  if (region) {
    const regionLower = region.toLowerCase()
    filteredMatches = matches.filter(city => 
      city.canton.toLowerCase().includes(regionLower) ||
      city.name.toLowerCase().includes(regionLower)
    )
  }
  
  // Conversion en format de réponse
  return filteredMatches.map((city, index) => ({
    score: 100 - index * 5, // Score décroissant
    identifier: `mock_${city.name.toLowerCase()}`,
    countryCode: 'CH',
    addressId: '',
    buildingId: '',
    address: `${city.name} (${city.canton})`,
    latitude: city.lat,
    longitude: city.lng,
    detail: `${city.name.toLowerCase()} ${city.canton.toLowerCase()}`,
    origin: 'mock'
  }))
}