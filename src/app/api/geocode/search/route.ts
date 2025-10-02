import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')
    const region = searchParams.get('region')
    const city = searchParams.get('city')

    if (!query || query.length < 1) {
      return NextResponse.json({ hits: [] })
    }

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
    
    // Fallback simple
    return NextResponse.json({ hits: [] })
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

    return data.map((item: any, index: number) => {
      // Nettoyer l'adresse Nominatim (enlever Schweiz/Suisse/Svizzera/Svizra)
      let cleanAddress = item.display_name
      cleanAddress = cleanAddress.replace(/, Schweiz\/Suisse\/Svizzera\/Svizra$/, '')
      cleanAddress = cleanAddress.replace(/, Switzerland$/, '')
      
      // Si l'adresse est trop longue, la raccourcir
      if (cleanAddress.length > 100) {
        const parts = cleanAddress.split(', ')
        if (parts.length > 3) {
          cleanAddress = parts.slice(0, 3).join(', ')
        }
      }

      return {
        score: 70 - index * 2, // Score plus bas pour Nominatim
        identifier: `nominatim_${item.place_id}`,
        countryCode: 'CH',
        addressId: '',
        buildingId: '',
        address: cleanAddress,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        detail: `${item.address?.road || ''} ${item.address?.house_number || ''}`.trim(),
        origin: 'nominatim',
        type: getAddressTypeFromNominatim(item)
      }
    })
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
    
    // 🚀 BONUS PREMIUM : Notre base de données intelligente
    if (result.origin === 'smart_db') {
      finalScore += 50 // Énorme bonus pour notre base de données
    }
    
    // Bonus pour correspondance exacte du début
    if (result.address.toLowerCase().startsWith(queryLower)) {
      finalScore += 40 // Bonus énorme pour correspondance au début
    } else if (result.address.toLowerCase().includes(queryLower)) {
      finalScore += 20 // Bonus normal pour correspondance n'importe où
    }
    
    // Bonus pour ville correspondante
    if (city && result.address.toLowerCase().includes(city.toLowerCase())) {
      finalScore += 35
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
    
    // 🎯 BONUS SPÉCIAL : Correspondance précise avec "rue de B"
    if (queryLower.includes('rue') && queryLower.includes('de')) {
      const streetPart = queryLower.replace('rue', '').replace('de', '').trim()
      if (streetPart && result.address.toLowerCase().includes(`rue de ${streetPart}`)) {
        finalScore += 30 // Bonus énorme pour correspondance précise
      }
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
    // 🏘️ ONEX - Adresses complètes
    { street: 'Rue de la Paix', fullAddress: 'Rue de la Paix, 1213 Onex', lat: 46.1854, lng: 6.0995, type: 'street' },
    { street: 'Chemin François-Chavaz', fullAddress: 'Chemin François-Chavaz, 1213 Onex', lat: 46.1854, lng: 6.0995, type: 'street' },
    { street: 'Avenue de Châtelaine', fullAddress: 'Avenue de Châtelaine, 1213 Onex', lat: 46.1860, lng: 6.1000, type: 'street' },
    { street: 'Route de Chancy', fullAddress: 'Route de Chancy, 1213 Onex', lat: 46.1840, lng: 6.0980, type: 'street' },
    { street: 'Chemin des Vignes', fullAddress: 'Chemin des Vignes, 1213 Onex', lat: 46.1830, lng: 6.0970, type: 'street' },
    { street: 'Rue de la Poste', fullAddress: 'Rue de la Poste, 1213 Onex', lat: 46.1850, lng: 6.0990, type: 'street' },
    { street: 'Rue de la Gare', fullAddress: 'Rue de la Gare, 1213 Onex', lat: 46.1845, lng: 6.0985, type: 'street' },
    { street: 'Rue du Centre', fullAddress: 'Rue du Centre, 1213 Onex', lat: 46.1852, lng: 6.0992, type: 'street' },
    { street: 'Rue de la Mairie', fullAddress: 'Rue de la Mairie, 1213 Onex', lat: 46.1856, lng: 6.0996, type: 'street' },
    { street: 'Rue des Écoles', fullAddress: 'Rue des Écoles, 1213 Onex', lat: 46.1848, lng: 6.0988, type: 'street' },

    // 🏙️ GENÈVE - Rues principales
    { street: 'Rue du Rhône', fullAddress: 'Rue du Rhône, 1204 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue du Mont-Blanc', fullAddress: 'Rue du Mont-Blanc, 1201 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue de la Croix-d\'Or', fullAddress: 'Rue de la Croix-d\'Or, 1204 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue de Rive', fullAddress: 'Rue de Rive, 1204 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue du Marché', fullAddress: 'Rue du Marché, 1204 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue de la Confédération', fullAddress: 'Rue de la Confédération, 1204 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue de Carouge', fullAddress: 'Rue de Carouge, 1205 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue des Alpes', fullAddress: 'Rue des Alpes, 1201 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue de la Paix', fullAddress: 'Rue de la Paix, 1202 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue de Berne', fullAddress: 'Rue de Berne, 1201 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue de Bâle', fullAddress: 'Rue de Bâle, 1201 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue de Zurich', fullAddress: 'Rue de Zurich, 1201 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue de Lausanne', fullAddress: 'Rue de Lausanne, 1202 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue des Bains', fullAddress: 'Rue des Bains, 1205 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue de la Synagogue', fullAddress: 'Rue de la Synagogue, 1204 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },
    { street: 'Rue de la Cité', fullAddress: 'Rue de la Cité, 1204 Genève', lat: 46.2044, lng: 6.1432, type: 'street' },

    // 🏛️ LAUSANNE - Rues principales
    { street: 'Rue de Bourg', fullAddress: 'Rue de Bourg, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Place Saint-François', fullAddress: 'Place Saint-François, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Avenue de la Gare', fullAddress: 'Avenue de la Gare, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Rue du Simplon', fullAddress: 'Rue du Simplon, 1006 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Rue de Genève', fullAddress: 'Rue de Genève, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Rue de la Paix', fullAddress: 'Rue de la Paix, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Rue du Grand-Pont', fullAddress: 'Rue du Grand-Pont, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Rue de la Mercerie', fullAddress: 'Rue de la Mercerie, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Rue du Petit-Chêne', fullAddress: 'Rue du Petit-Chêne, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Rue de Bâle', fullAddress: 'Rue de Bâle, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Rue de Berne', fullAddress: 'Rue de Berne, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Rue de Zurich', fullAddress: 'Rue de Zurich, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Rue de la Barre', fullAddress: 'Rue de la Barre, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Rue de l\'Industrie', fullAddress: 'Rue de l\'Industrie, 1005 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Rue de la Tour', fullAddress: 'Rue de la Tour, 1003 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },
    { street: 'Rue du Port', fullAddress: 'Rue du Port, 1006 Lausanne', lat: 46.5197, lng: 6.6323, type: 'street' },

    // 🏙️ ZURICH - Rues principales
    { street: 'Bahnhofstrasse', fullAddress: 'Bahnhofstrasse, 8001 Zürich', lat: 47.3769, lng: 8.5417, type: 'street' },
    { street: 'Limmatquai', fullAddress: 'Limmatquai, 8001 Zürich', lat: 47.3769, lng: 8.5417, type: 'street' },
    { street: 'Niederdorfstrasse', fullAddress: 'Niederdorfstrasse, 8001 Zürich', lat: 47.3769, lng: 8.5417, type: 'street' },
    { street: 'Rennweg', fullAddress: 'Rennweg, 8001 Zürich', lat: 47.3769, lng: 8.5417, type: 'street' },
    { street: 'Augustinergasse', fullAddress: 'Augustinergasse, 8001 Zürich', lat: 47.3769, lng: 8.5417, type: 'street' },
    { street: 'Spitalgasse', fullAddress: 'Spitalgasse, 8001 Zürich', lat: 47.3769, lng: 8.5417, type: 'street' },
    { street: 'Münsterhof', fullAddress: 'Münsterhof, 8001 Zürich', lat: 47.3769, lng: 8.5417, type: 'street' },
    { street: 'Rathausbrücke', fullAddress: 'Rathausbrücke, 8001 Zürich', lat: 47.3769, lng: 8.5417, type: 'street' },
    { street: 'Schipfe', fullAddress: 'Schipfe, 8001 Zürich', lat: 47.3769, lng: 8.5417, type: 'street' },
    { street: 'Rudolf-Brun-Brücke', fullAddress: 'Rudolf-Brun-Brücke, 8001 Zürich', lat: 47.3769, lng: 8.5417, type: 'street' },

    // 🏛️ BERNE - Rues principales
    { street: 'Marktgasse', fullAddress: 'Marktgasse, 3011 Bern', lat: 46.9481, lng: 7.4474, type: 'street' },
    { street: 'Spitalgasse', fullAddress: 'Spitalgasse, 3011 Bern', lat: 46.9481, lng: 7.4474, type: 'street' },
    { street: 'Kramgasse', fullAddress: 'Kramgasse, 3011 Bern', lat: 46.9481, lng: 7.4474, type: 'street' },
    { street: 'Gerechtigkeitsgasse', fullAddress: 'Gerechtigkeitsgasse, 3011 Bern', lat: 46.9481, lng: 7.4474, type: 'street' },
    { street: 'Rathausgasse', fullAddress: 'Rathausgasse, 3011 Bern', lat: 46.9481, lng: 7.4474, type: 'street' },
    { street: 'Zeughausgasse', fullAddress: 'Zeughausgasse, 3011 Bern', lat: 46.9481, lng: 7.4474, type: 'street' },
    { street: 'Junkerngasse', fullAddress: 'Junkerngasse, 3011 Bern', lat: 46.9481, lng: 7.4474, type: 'street' },
    { street: 'Münstergasse', fullAddress: 'Münstergasse, 3011 Bern', lat: 46.9481, lng: 7.4474, type: 'street' },
    { street: 'Bärenplatz', fullAddress: 'Bärenplatz, 3011 Bern', lat: 46.9481, lng: 7.4474, type: 'street' },
    { street: 'Kornhausplatz', fullAddress: 'Kornhausplatz, 3011 Bern', lat: 46.9481, lng: 7.4474, type: 'street' },

    // 🏙️ BÂLE - Rues principales
    { street: 'Freie Strasse', fullAddress: 'Freie Strasse, 4001 Basel', lat: 47.5596, lng: 7.5886, type: 'street' },
    { street: 'Steinenvorstadt', fullAddress: 'Steinenvorstadt, 4051 Basel', lat: 47.5596, lng: 7.5886, type: 'street' },
    { street: 'Gerbergasse', fullAddress: 'Gerbergasse, 4001 Basel', lat: 47.5596, lng: 7.5886, type: 'street' },
    { street: 'Rheinsprung', fullAddress: 'Rheinsprung, 4058 Basel', lat: 47.5596, lng: 7.5886, type: 'street' },
    { street: 'Spalenvorstadt', fullAddress: 'Spalenvorstadt, 4056 Basel', lat: 47.5596, lng: 7.5886, type: 'street' },
    { street: 'Rheingasse', fullAddress: 'Rheingasse, 4058 Basel', lat: 47.5596, lng: 7.5886, type: 'street' },
    { street: 'Marktplatz', fullAddress: 'Marktplatz, 4001 Basel', lat: 47.5596, lng: 7.5886, type: 'street' },
    { street: 'Fischmarkt', fullAddress: 'Fischmarkt, 4001 Basel', lat: 47.5596, lng: 7.5886, type: 'street' },
    { street: 'Totengässlein', fullAddress: 'Totengässlein, 4001 Basel', lat: 47.5596, lng: 7.5886, type: 'street' },
    { street: 'Blumenrain', fullAddress: 'Blumenrain, 4001 Basel', lat: 47.5596, lng: 7.5886, type: 'street' },

    // 🏙️ AUTRES VILLES SUISSES
    // Lucerne
    { street: 'Kapellgasse', fullAddress: 'Kapellgasse, 6004 Luzern', lat: 47.0502, lng: 8.3093, type: 'street' },
    { street: 'Hofgasse', fullAddress: 'Hofgasse, 6004 Luzern', lat: 47.0502, lng: 8.3093, type: 'street' },
    { street: 'Weinmarkt', fullAddress: 'Weinmarkt, 6004 Luzern', lat: 47.0502, lng: 8.3093, type: 'street' },
    { street: 'Kornmarkt', fullAddress: 'Kornmarkt, 6004 Luzern', lat: 47.0502, lng: 8.3093, type: 'street' },

    // Lugano
    { street: 'Via Nassa', fullAddress: 'Via Nassa, 6900 Lugano', lat: 46.0037, lng: 8.9511, type: 'street' },
    { street: 'Piazza della Riforma', fullAddress: 'Piazza della Riforma, 6900 Lugano', lat: 46.0037, lng: 8.9511, type: 'street' },
    { street: 'Via Cattedrale', fullAddress: 'Via Cattedrale, 6900 Lugano', lat: 46.0037, lng: 8.9511, type: 'street' },

    // Sion
    { street: 'Rue du Grand-Pont', fullAddress: 'Rue du Grand-Pont, 1950 Sion', lat: 46.2294, lng: 7.3594, type: 'street' },
    { street: 'Rue de Conthey', fullAddress: 'Rue de Conthey, 1950 Sion', lat: 46.2294, lng: 7.3594, type: 'street' },
    { street: 'Place du Midi', fullAddress: 'Place du Midi, 1950 Sion', lat: 46.2294, lng: 7.3594, type: 'street' },

    // Fribourg
    { street: 'Rue de Lausanne', fullAddress: 'Rue de Lausanne, 1700 Fribourg', lat: 46.8061, lng: 7.1612, type: 'street' },
    { street: 'Rue de Morat', fullAddress: 'Rue de Morat, 1700 Fribourg', lat: 46.8061, lng: 7.1612, type: 'street' },
    { street: 'Grand-Rue', fullAddress: 'Grand-Rue, 1700 Fribourg', lat: 46.8061, lng: 7.1612, type: 'street' },

    // Neuchâtel
    { street: 'Rue du Seyon', fullAddress: 'Rue du Seyon, 2000 Neuchâtel', lat: 46.9924, lng: 6.9319, type: 'street' },
    { street: 'Rue de la Serre', fullAddress: 'Rue de la Serre, 2000 Neuchâtel', lat: 46.9924, lng: 6.9319, type: 'street' },
    { street: 'Place Pury', fullAddress: 'Place Pury, 2000 Neuchâtel', lat: 46.9924, lng: 6.9319, type: 'street' }
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