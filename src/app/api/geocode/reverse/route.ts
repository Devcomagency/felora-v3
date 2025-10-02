import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude et longitude requis' }, { status: 400 })
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json({ error: 'Coordonnées invalides' }, { status: 400 })
  }

  try {
    // Utiliser Nominatim pour le reverse geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=fr`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FELORA/1.0 (contact@felora.com)'
      }
    })

    if (!response.ok) {
      throw new Error('Erreur API Nominatim')
    }

    const data = await response.json()
    
    if (!data || !data.display_name) {
      return NextResponse.json({ address: null, error: 'Adresse non trouvée' })
    }

    // Formater l'adresse de manière lisible
    const address = formatAddress(data)
    
    return NextResponse.json({
      address,
      display_name: data.display_name,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
      address_details: data.address
    })

  } catch (error) {
    console.error('Erreur reverse geocoding:', error)
    return NextResponse.json({ error: 'Erreur lors du géocodage inversé' }, { status: 500 })
  }
}

function formatAddress(data: any): string {
  const addr = data.address || {}
  
  // Construire l'adresse de manière intelligente
  const parts = []
  
  // Numéro et rue
  if (addr.house_number && addr.road) {
    parts.push(`${addr.road} ${addr.house_number}`)
  } else if (addr.road) {
    parts.push(addr.road)
  }
  
  // Code postal et ville
  if (addr.postcode && addr.city) {
    parts.push(`${addr.postcode} ${addr.city}`)
  } else if (addr.postcode && addr.town) {
    parts.push(`${addr.postcode} ${addr.town}`)
  } else if (addr.city) {
    parts.push(addr.city)
  } else if (addr.town) {
    parts.push(addr.town)
  }
  
  // Canton si disponible
  if (addr.state) {
    parts.push(addr.state)
  }
  
  // Si on n'a pas assez d'infos, utiliser display_name
  if (parts.length < 2) {
    return data.display_name
  }
  
  return parts.join(', ')
}

// POST - Géocoder une adresse (forward geocoding)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { address } = body

    if (!address) {
      return NextResponse.json({ error: 'Adresse requise' }, { status: 400 })
    }

    console.log('🔍 [API GEOCODE] Géocodage de l\'adresse:', address)

    // Utiliser Nominatim pour le forward geocoding
    const encodedAddress = encodeURIComponent(address)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&addressdetails=1&accept-language=fr&limit=1&countrycodes=ch`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FELORA/1.0 (contact@felora.com)'
      }
    })

    if (!response.ok) {
      throw new Error('Erreur API Nominatim')
    }

    const data = await response.json()
    
    if (!data || data.length === 0) {
      console.log('❌ [API GEOCODE] Aucun résultat pour:', address)
      return NextResponse.json({ 
        address: null, 
        coordinates: null,
        error: 'Adresse non trouvée' 
      })
    }

    const result = data[0]
    console.log('✅ [API GEOCODE] Résultat trouvé:', result.display_name)

    // Extraire ville et canton
    const city = result.address?.city || result.address?.town || ''
    const canton = result.address?.state || ''

    return NextResponse.json({
      address: result.display_name,
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      },
      city: city,
      canton: canton,
      display_name: result.display_name,
      address_details: result.address
    })

  } catch (error) {
    console.error('❌ [API GEOCODE] Erreur géocodage:', error)
    return NextResponse.json({ 
      error: 'Erreur lors du géocodage',
      coordinates: null 
    }, { status: 500 })
  }
}