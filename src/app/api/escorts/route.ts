import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type SortKey = 'recent' | 'relevance'

// Fonction pour décaler les coordonnées selon le mode de confidentialité
function applyPrivacyOffset(lat: number | null, lng: number | null, addressPrivacy: string | null | undefined): { lat: number | null, lng: number | null } {
  if (!lat || !lng || addressPrivacy !== 'approximate') {
    return { lat, lng }
  }

  // Générer un offset déterministe de ~150m
  const maxOffset = 0.00135 // ≈150m
  
  // Hash simple basé sur lat+lng pour obtenir un offset déterministe
  const coordsStr = `${lat},${lng}`
  let hash = 0
  for (let i = 0; i < coordsStr.length; i++) {
    const char = coordsStr.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  const normalizedHash1 = ((hash & 0x7FFFFFFF) % 1000) / 1000 * 2 - 1
  const normalizedHash2 = ((((hash >> 8) & 0x7FFFFFFF) % 1000) / 1000 * 2 - 1)
  
  const offsetLat = normalizedHash1 * maxOffset
  const offsetLng = normalizedHash2 * maxOffset
  
  return {
    lat: lat + offsetLat,
    lng: lng + offsetLng
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[API ESCORTS] Request started:', request.url)

    // Version minimale pour diagnostiquer l'erreur
    const { searchParams } = new URL(request.url)
    const limit = Math.min(20, parseInt(searchParams.get('limit') || '20'))

    console.log('[API ESCORTS] Testing minimal query...')

    // Test 1: Query la plus simple possible
    try {
      const testRows = await prisma.escortProfile.findMany({
        select: {
          id: true,
          stageName: true,
          status: true
        },
        take: 2
      })
      console.log('[API ESCORTS] Test query successful, found:', testRows.length, 'profiles')
    } catch (testError) {
      console.error('[API ESCORTS] Test query failed:', testError)
      return NextResponse.json({
        error: 'Database connection failed',
        details: testError.message
      }, { status: 500 })
    }

    // Si on arrive ici, la DB fonctionne
    console.log('[API ESCORTS] Database connection OK, continuing...')

    const offset = Math.max(0, parseInt(searchParams.get('cursor') || '0'))

    const q = (searchParams.get('q') || searchParams.get('search') || '').trim()
    const city = (searchParams.get('city') || '').trim()
    const canton = (searchParams.get('canton') || '').trim()
    const servicesCSV = (searchParams.get('services') || '').trim()
    const languagesCSV = (searchParams.get('languages') || '').trim()
    const sort: SortKey = ((searchParams.get('sort') || 'recent') as SortKey)

    console.log('[API ESCORTS] Basic params parsed:', { limit, offset, q, city, canton, servicesCSV, languagesCSV, sort })

    // Nouveaux filtres V2 - Support legacy 'category' et 'categories'
    const categoriesCSV = (searchParams.get('categories') || searchParams.get('category') || '').trim()
    const ageMin = parseInt(searchParams.get('ageMin') || '18')
    const ageMax = parseInt(searchParams.get('ageMax') || '65')
    const heightMin = parseInt(searchParams.get('heightMin') || '150')
    const heightMax = parseInt(searchParams.get('heightMax') || '180')
    const bodyType = (searchParams.get('bodyType') || '').trim()
    const hairColor = (searchParams.get('hairColor') || '').trim()
    const eyeColor = (searchParams.get('eyeColor') || '').trim()
    const ethnicity = (searchParams.get('ethnicity') || '').trim()
    const breastSize = (searchParams.get('breastSize') || '').trim()
    const hasTattoos = (searchParams.get('hasTattoos') || '').trim()
    const budgetMin = parseInt(searchParams.get('budgetMin') || '0')
    const budgetMax = parseInt(searchParams.get('budgetMax') || '2000')
    const minDuration = (searchParams.get('minDuration') || '').trim()
    const availabilityCSV = (searchParams.get('availability') || '').trim()
    const timeSlotsCSV = (searchParams.get('timeSlots') || '').trim()
    const availableNow = searchParams.get('availableNow') === 'true'
    const outcall = searchParams.get('outcall') === 'true'
    const incall = searchParams.get('incall') === 'true'
    const weekendAvailable = searchParams.get('weekendAvailable') === 'true'
    const verified = searchParams.get('verified') === 'true'
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const minReviews = parseInt(searchParams.get('minReviews') || '0')
    const premiumContent = searchParams.get('premiumContent') === 'true'
    const liveCam = searchParams.get('liveCam') === 'true'
    const premiumMessaging = searchParams.get('premiumMessaging') === 'true'
    const privatePhotos = searchParams.get('privatePhotos') === 'true'
    const exclusiveVideos = searchParams.get('exclusiveVideos') === 'true'

    // Nouveaux filtres unifiés avec dashboard
    const serviceTypesCSV = (searchParams.get('serviceTypes') || '').trim()
    const specialtiesCSV = (searchParams.get('specialties') || '').trim()
    const experienceTypesCSV = (searchParams.get('experienceTypes') || '').trim()
    const roleTypesCSV = (searchParams.get('roleTypes') || '').trim()

    // Reconstruction des filtres maintenant que l'API est stable
    const where: any = {}

    // Status filter - Par défaut seulement ACTIVE
    const statusesParam = searchParams.get('statuses') || searchParams.get('status')
    if (statusesParam) {
      const statusList = statusesParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
      if (statusList.length === 1) {
        where.status = statusList[0]
      } else if (statusList.length > 1) {
        where.status = { in: statusList }
      }
    } else {
      where.status = 'ACTIVE'
    }

    // Filtres de localisation
    if (city) where.city = { equals: city, mode: 'insensitive' as const }
    if (canton) where.canton = { equals: canton, mode: 'insensitive' as const }

    // Filtres physiques
    if (bodyType) where.bodyType = { equals: bodyType, mode: 'insensitive' as const }
    if (hairColor) where.hairColor = { equals: hairColor, mode: 'insensitive' as const }
    if (eyeColor) where.eyeColor = { equals: eyeColor, mode: 'insensitive' as const }
    if (ethnicity) where.ethnicity = { equals: ethnicity, mode: 'insensitive' as const }
    if (breastSize) where.bustSize = { equals: breastSize, mode: 'insensitive' as const }
    if (hasTattoos) where.tattoos = { equals: hasTattoos, mode: 'insensitive' as const }

    // Filtres d'âge et taille
    if (ageMin > 18 || ageMax < 65) {
      where.AND = where.AND || []
      if (ageMin > 18) {
        where.AND.push({
          dateOfBirth: {
            lte: new Date(new Date().getFullYear() - ageMin, 0, 1)
          }
        })
      }
      if (ageMax < 65) {
        where.AND.push({
          dateOfBirth: {
            gte: new Date(new Date().getFullYear() - ageMax, 11, 31)
          }
        })
      }
    }

    if (heightMin > 150 || heightMax < 180) {
      where.AND = where.AND || []
      if (heightMin > 150) {
        where.AND.push({ height: { gte: heightMin } })
      }
      if (heightMax < 180) {
        where.AND.push({ height: { lte: heightMax } })
      }
    }

    // Filtres de disponibilité
    if (availableNow) where.availableNow = true
    if (outcall) where.outcall = true
    if (incall) where.incall = true
    if (weekendAvailable) where.weekendAvailable = true

    // Filtres de qualité
    if (verified) where.isVerifiedBadge = true
    if (minRating > 0) where.rating = { gte: minRating }
    if (minReviews > 0) where.reviewCount = { gte: minReviews }

    // Filtres de tarifs
    if (budgetMin > 0 || budgetMax < 2000) {
      where.AND = where.AND || []
      if (budgetMin > 0) {
        where.AND.push({
          OR: [
            { rate1H: { gte: budgetMin } },
            { rate2H: { gte: budgetMin } },
            { rateOvernight: { gte: budgetMin } }
          ]
        })
      }
      if (budgetMax < 2000) {
        where.AND.push({
          OR: [
            { rate1H: { lte: budgetMax } },
            { rate2H: { lte: budgetMax } },
            { rateOvernight: { lte: budgetMax } }
          ]
        })
      }
    }

    // Filtres de services
    if (servicesCSV) {
      const services = servicesCSV.split(',').filter(Boolean)
      if (services.length > 0) {
        where.services = { hasSome: services }
      }
    }

    // Filtres de langues
    if (languagesCSV) {
      const languages = languagesCSV.split(',').filter(Boolean)
      if (languages.length > 0) {
        where.languages = { hasSome: languages }
      }
    }

    // Filtres de catégories
    if (categoriesCSV) {
      const categories = categoriesCSV.split(',').filter(Boolean)
      if (categories.length > 0) {
        where.AND = where.AND || []
        where.AND.push({
          OR: categories.map(cat => ({
            category: { equals: cat, mode: 'insensitive' as const }
          }))
        })
      }
    }

    // Recherche textuelle
    if (q) {
      const textFilter = {
        OR: [
          { stageName: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
        ],
      }
      where.AND = where.AND ? [...where.AND, textFilter] : [textFilter]
    }

    console.log('[API ESCORTS] WHERE clause built:', JSON.stringify(where, null, 2))

    // Tri selon la logique de priorité :
    // 1. Comptes actifs (availableNow = true) en premier
    // 2. Comptes actifs mais hors heures (status = ACTIVE) ensuite
    // 3. Comptes désactivés (status != ACTIVE) à la fin
    // Puis par date de mise à jour pour chaque groupe
    const orderBy: any = [
      { availableNow: 'desc' as const },  // Les "disponibles maintenant" en premier
      { status: 'desc' as const },         // Puis par statut (ACTIVE > autres)
      { updatedAt: 'desc' as const }       // Enfin par date de mise à jour
    ]

    console.log('[API ESCORTS] About to query database with limit:', limit, 'offset:', offset)

    let rows
    try {
      console.log('[API ESCORTS] Attempting ultra-minimal query...')

      // Test avec requête ultra-simplifiée d'abord
      console.log('[API ESCORTS] Testing ultra-simple query first...')
      rows = await prisma.escortProfile.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          stageName: true,
          status: true
        },
        take: 3
      })
      console.log('[API ESCORTS] Ultra-simple test successful, found:', rows.length, 'profiles')

      // Si le test passe, faire la vraie requête
      console.log('[API ESCORTS] Now attempting full query...')
      rows = await prisma.escortProfile.findMany({
        where,
        select: {
          id: true,
          stageName: true,
          description: true,
          city: true,
          canton: true,
          isVerifiedBadge: true,
          profilePhoto: true,
          languages: true,
          services: true,
          category: true,
          rate1H: true,
          rate2H: true,
          rateOvernight: true,
          currency: true,
          latitude: true,
          longitude: true,
          addressPrivacy: true,
          height: true,
          bodyType: true,
          hairColor: true,
          eyeColor: true,
          ethnicity: true,
          bustSize: true,
          tattoos: true,
          piercings: true,
          availableNow: true,
          outcall: true,
          incall: true,
          weekendAvailable: true,
          hasPrivatePhotos: true,
          hasPrivateVideos: true,
          hasWebcamLive: true,
          messagingPreference: true,
          minimumDuration: true,
          rating: true,
          reviewCount: true,
          views: true,
          likes: true,
          updatedAt: true,
          dateOfBirth: true,
          status: true,
        },
        orderBy,
        take: limit, // Retour à la limite normale
        skip: offset
      })
      console.log('[API ESCORTS] Step 1 successful, found:', rows.length, 'profiles')

    } catch (dbError) {
      console.error('[API ESCORTS] Database query failed:', dbError)
      console.error('[API ESCORTS] Error details:', {
        message: dbError?.message || 'Unknown error',
        stack: dbError?.stack || 'No stack',
        code: dbError?.code || 'NO_CODE',
        name: dbError?.name || 'Unknown',
        meta: dbError?.meta || 'No meta',
        clientVersion: dbError?.clientVersion || 'No version'
      })

      // Essayer une requête encore plus simple
      try {
        console.log('[API ESCORTS] Attempting emergency fallback query...')
        const emergencyRows = await prisma.escortProfile.findMany({
          select: { id: true, stageName: true },
          take: 1
        })
        console.log('[API ESCORTS] Emergency query worked, found:', emergencyRows.length, 'profiles')

        // Retourner une réponse d'urgence
        return NextResponse.json({
          success: true,
          items: emergencyRows.map(e => ({
            id: e.id,
            stageName: e.stageName || 'Profile',
            city: undefined,
            canton: undefined,
            isVerifiedBadge: false,
            isActive: true,
            languages: [],
            services: [],
            updatedAt: new Date().toISOString(),
            status: 'ACTIVE'
          })),
          nextCursor: undefined,
          total: undefined,
          emergency: true,
          originalError: dbError?.message || 'Database connection issue'
        })
      } catch (emergencyError) {
        console.error('[API ESCORTS] Even emergency query failed:', emergencyError)
        return NextResponse.json({
          error: 'Complete database failure',
          details: dbError?.message || 'Database connection issue',
          emergencyError: emergencyError?.message || 'Emergency query also failed',
          stage: 'complete_failure'
        }, { status: 500 })
      }
    }

    console.log('[API ESCORTS] Database query completed, rows found:', rows.length)

    const items = rows.map((e, index) => {
      try {
        console.log(`[API ESCORTS] Processing row ${index}:`, { id: e.id, stageName: e.stageName })

        // Calcul de l'âge
        const year = new Date().getFullYear()
        const age = (() => {
          try {
            return e.dateOfBirth ? (year - new Date(e.dateOfBirth).getFullYear()) : undefined
          } catch (err) {
            console.warn(`[API ESCORTS] Failed to calculate age for ${e.id}:`, err)
            return undefined
          }
        })()

        // Hero media à partir de profilePhoto
        const heroMedia = e.profilePhoto ? { type: 'IMAGE', url: e.profilePhoto } : undefined

        return {
          id: e.id,
          stageName: e.stageName || '',
          age,
          city: e.city || undefined,
          canton: e.canton || undefined,
          isVerifiedBadge: !!e.isVerifiedBadge,
          isActive: e.status === 'ACTIVE',
          profilePhoto: e.profilePhoto || undefined,
          heroMedia,
          category: e.category || undefined,
          languages: (() => {
            try {
              const L = JSON.parse(String(e.languages || '[]'))
              return Array.isArray(L) ? L : []
            } catch (err) {
              console.warn(`[API ESCORTS] Failed to parse languages for ${e.id}:`, err)
              return []
            }
          })(),
          services: (() => {
            try {
              const S = JSON.parse(String(e.services || '[]'))
              if (!Array.isArray(S)) return []

              // Nettoyer les services : enlever les préfixes "srv:" et "opt:"
              const cleanedServices = S.map(service => {
                if (typeof service === 'string') {
                  // Enlever les préfixes srv: et opt:
                  if (service.startsWith('srv:')) {
                    return service.substring(4) // Enlever "srv:"
                  }
                  if (service.startsWith('opt:')) {
                    return service.substring(4) // Enlever "opt:"
                  }
                  // Si c'est une catégorie principale, la garder telle quelle
                  return service
                }
                return service
              }).filter(Boolean)

              console.log(`[API ESCORTS] Services for ${e.id}:`, {
                original: S,
                cleaned: cleanedServices
              })

              return cleanedServices
            } catch (err) {
              console.warn(`[API ESCORTS] Failed to parse services for ${e.id}:`, err)
              return []
            }
          })(),
          rate1H: e.rate1H || undefined,
          rate2H: e.rate2H || undefined,
          rateOvernight: e.rateOvernight || undefined,
          currency: e.currency || 'CHF',
          latitude: applyPrivacyOffset(e.latitude || null, e.longitude || null, e.addressPrivacy).lat,
          longitude: applyPrivacyOffset(e.latitude || null, e.longitude || null, e.addressPrivacy).lng,
          updatedAt: e.updatedAt,
          // Nouveaux champs V2
          height: e.height || undefined,
          bodyType: e.bodyType || undefined,
          hairColor: e.hairColor || undefined,
          eyeColor: e.eyeColor || undefined,
          ethnicity: e.ethnicity || undefined,
          bustSize: e.bustSize || undefined,
          tattoos: e.tattoos || undefined,
          piercings: e.piercings || undefined,
          availableNow: e.availableNow || false,
          outcall: e.outcall || false,
          incall: e.incall || false,
          weekendAvailable: e.weekendAvailable || false,
          hasPrivatePhotos: e.hasPrivatePhotos || false,
          hasPrivateVideos: e.hasPrivateVideos || false,
          hasWebcamLive: e.hasWebcamLive || false,
          messagingPreference: e.messagingPreference || 'APP_ONLY',
          minimumDuration: e.minimumDuration || undefined,
          rating: e.rating || 0,
          reviewCount: e.reviewCount || 0,
          views: e.views || 0,
          likes: e.likes || 0,
          status: e.status || 'PENDING',
        }
      } catch (err) {
        console.error(`[API ESCORTS] Error processing row ${index} (${e.id}):`, err)
        // Return a minimal safe object if row processing fails
        return {
          id: e.id || `error-${index}`,
          stageName: e.stageName || 'Erreur',
          city: undefined,
          canton: undefined,
          isVerifiedBadge: false,
          isActive: false,
          languages: [],
          services: [],
          updatedAt: new Date().toISOString(),
          status: 'PENDING'
        }
      }
    })

    // Utiliser les vraies escortes de la base de données

    const nextCursor = items.length === limit ? String(offset + limit) : undefined
    const total = offset + items.length + (items.length === limit ? 100 : 0) // Simuler un total plus grand

    console.log('[API ESCORTS] Response prepared:', { itemsCount: items.length, nextCursor, total })

    return NextResponse.json({ success: true, items, nextCursor, total })
  } catch (error) {
    console.error('[API ESCORTS] ERROR occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    })
    console.error('[API ESCORTS] Full error object:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}