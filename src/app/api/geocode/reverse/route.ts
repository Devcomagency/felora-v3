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