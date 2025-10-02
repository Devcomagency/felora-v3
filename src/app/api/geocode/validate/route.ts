import { NextRequest, NextResponse } from 'next/server'

interface ValidationRequest {
  address: string
  coordinates?: { lat: number; lng: number }
}

export async function POST(req: NextRequest) {
  try {
    const { address, coordinates }: ValidationRequest = await req.json()

    if (!address || address.length < 3) {
      return NextResponse.json({ error: 'Adresse trop courte' }, { status: 400 })
    }

    // Validation côté serveur avec l'API de géocodage
    const validation = await validateAddressWithGeocoding(address, coordinates)
    
    return NextResponse.json(validation)

  } catch (error) {
    console.error('Erreur validation adresse:', error)
    return NextResponse.json({ error: 'Erreur lors de la validation' }, { status: 500 })
  }
}

async function validateAddressWithGeocoding(address: string, coordinates?: { lat: number; lng: number }) {
  const addressLower = address.toLowerCase()
  
  // Vérifications de base
  const hasStreetNumber = /\d+/.test(address)
  const hasStreetName = /(rue|avenue|boulevard|chemin|place|route|allée|impasse|square|quai|promenade|strasse|gasse|weg)/i.test(address)
  const hasPostalCode = /\b\d{4}\b/.test(address)
  const hasCity = /(genève|lausanne|zurich|berne|bâle|fribourg|neuchâtel|lucerne|lugano|sion|basel|bern|zürich)/i.test(address)
  
  // Vérifier si les coordonnées sont en Suisse
  const isInSwitzerland = coordinates && 
    coordinates.lat >= 45.8 && coordinates.lat <= 47.8 && 
    coordinates.lng >= 5.9 && coordinates.lng <= 10.5

  // Essayer de valider avec l'API de géocodage
  let geocodingValidation = null
  try {
    const response = await fetch(`/api/geocode/search?q=${encodeURIComponent(address)}&limit=1`)
    if (response.ok) {
      const data = await response.json()
      if (data.hits && data.hits.length > 0) {
        const hit = data.hits[0]
        geocodingValidation = {
          found: true,
          score: hit.score || 0,
          confidence: hit.score > 80 ? 'high' : hit.score > 60 ? 'medium' : 'low'
        }
      }
    }
  } catch (error) {
    console.warn('Erreur validation géocodage:', error)
  }

  // Calculer le score global
  let score = 0
  if (hasStreetNumber) score += 20
  if (hasStreetName) score += 20
  if (hasPostalCode) score += 20
  if (hasCity) score += 15
  if (isInSwitzerland) score += 15
  if (geocodingValidation?.found) score += 10

  // Ajuster le score selon la confiance du géocodage
  if (geocodingValidation?.confidence === 'high') score = Math.min(100, score + 10)
  else if (geocodingValidation?.confidence === 'medium') score = Math.min(100, score + 5)

  // Déterminer la qualité
  let quality: 'excellent' | 'good' | 'warning' | 'error' = 'error'
  let message = ''
  const suggestions: string[] = []

  if (score >= 90) {
    quality = 'excellent'
    message = 'Adresse excellente et validée'
  } else if (score >= 75) {
    quality = 'good'
    message = 'Adresse correcte et utilisable'
  } else if (score >= 50) {
    quality = 'warning'
    message = 'Adresse partiellement complète'
  } else {
    quality = 'error'
    message = 'Adresse incomplète ou invalide'
  }

  // Ajouter des suggestions
  if (!hasStreetNumber) suggestions.push('Ajoutez le numéro de rue (ex: "15")')
  if (!hasStreetName) suggestions.push('Précisez le nom de la rue (ex: "Rue de la Paix")')
  if (!hasPostalCode) suggestions.push('Incluez le code postal (ex: "1204")')
  if (!hasCity) suggestions.push('Indiquez la ville (ex: "Genève")')
  if (!isInSwitzerland && coordinates) {
    suggestions.push('Vérifiez que l\'adresse est bien en Suisse')
  }
  if (!geocodingValidation?.found) {
    suggestions.push('Essayez de reformuler l\'adresse ou utilisez l\'autocomplétion')
  }

  // Ajouter des suggestions spécifiques selon le score
  if (score < 75) {
    suggestions.push('Utilisez l\'autocomplétion pour une adresse plus précise')
  }

  return {
    quality,
    score: Math.round(score),
    message,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    details: {
      hasStreetNumber,
      hasStreetName,
      hasPostalCode,
      hasCity,
      isInSwitzerland: !!isInSwitzerland,
      coordinatesAccuracy: coordinates ? 100 : 0,
      geocodingFound: geocodingValidation?.found || false,
      geocodingConfidence: geocodingValidation?.confidence || 'none'
    }
  }
}
