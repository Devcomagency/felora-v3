import { NextRequest, NextResponse } from 'next/server'
import { GeocodeService } from '../../../../../packages/core/services/geo/geocode'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    
    // Géocodage standard (ville -> coordonnées)
    if (city) {
      if (city.trim().length < 2) {
        return NextResponse.json(
          { error: 'Le nom de ville doit contenir au moins 2 caractères' },
          { status: 400 }
        )
      }
      
      // Essayer d'abord dans les villes suisses prédéfinies (plus rapide)
      const swissCity = GeocodeService.findSwissCity(city)
      if (swissCity) {
        const response = NextResponse.json({
          lat: swissCity.lat,
          lng: swissCity.lng,
          display_name: `${swissCity.name}, Suisse`,
          city: swissCity.name,
          country: 'Suisse',
          source: 'predefined'
        })
        response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400') // 1h cache
        return response
      }
      
      // Fallback vers l'API Nominatim
      const result = await GeocodeService.geocodeCity(city)
      if (!result) {
        return NextResponse.json(
          { error: 'Ville non trouvée' },
          { status: 404 }
        )
      }
      
      const response = NextResponse.json({
        ...result,
        source: 'nominatim'
      })
      response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400') // 1h cache
      return response
    }
    
    // Géocodage inversé (coordonnées -> lieu)
    if (lat && lng) {
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lng)
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          { error: 'Coordonnées invalides' },
          { status: 400 }
        )
      }
      
      const result = await GeocodeService.reverseGeocode(latitude, longitude)
      if (!result) {
        return NextResponse.json(
          { error: 'Lieu non trouvé pour ces coordonnées' },
          { status: 404 }
        )
      }
      
      const response = NextResponse.json({
        ...result,
        source: 'nominatim'
      })
      response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
      return response
    }
    
    // Retourner les villes suisses prédéfinies si aucun paramètre
    const cities = GeocodeService.getSwissCities()
    const response = NextResponse.json({
      cities,
      message: 'Villes suisses disponibles'
    })
    response.headers.set('Cache-Control', 'public, s-maxage=86400') // 24h cache
    return response
    
  } catch (error) {
    console.error('Erreur API /api/geo/geocode:', error)
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}