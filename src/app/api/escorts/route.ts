import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type SortKey = 'recent' | 'relevance'

export async function GET(request: NextRequest) {
  try {
    console.log('[API ESCORTS] Request started:', request.url)

    // Version minimale pour diagnostiquer l'erreur
    const { searchParams } = new URL(request.url)
    const limit = 5 // Limiter à 5 pour tester

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
    const budgetMin = parseInt(searchParams.get('budgetMin') || '0')
    const budgetMax = parseInt(searchParams.get('budgetMax') || '2000')
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

    const orderBy = sort === 'recent'
      ? { updatedAt: 'desc' as const }
      : { updatedAt: 'desc' as const }

    console.log('[API ESCORTS] About to query database with limit:', limit, 'offset:', offset)

    let rows
    try {
      console.log('[API ESCORTS] Attempting ultra-minimal query...')

      // API complète avec tous les champs et filtres
      console.log('[API ESCORTS] Full API with all fields and filters')
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
          rate1H: true,
          rate2H: true,
          rateHalfDay: true,
          rateFullDay: true,
          rateOvernight: true,
          currency: true,
          latitude: true,
          longitude: true,
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
        orderBy: { updatedAt: 'desc' },
        take: limit, // Retour à la limite normale
        skip: offset
      })
      console.log('[API ESCORTS] Step 1 successful, found:', rows.length, 'profiles')

    } catch (dbError) {
      console.error('[API ESCORTS] Ultra-minimal query failed:', dbError)
      console.error('[API ESCORTS] Error details:', {
        message: dbError.message,
        stack: dbError.stack,
        code: dbError.code,
        name: dbError.name,
        meta: dbError.meta || 'No meta'
      })
      return NextResponse.json({
        error: 'Database query failed at basic level',
        details: dbError.message,
        stage: 'ultra_minimal_query',
        dbCode: dbError.code || 'NO_CODE'
      }, { status: 500 })
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

              // Nettoyer les services : enlever le préfixe "srv:" et garder la catégorie principale
              return S.map(service => {
                if (typeof service === 'string') {
                  // Si c'est un service détaillé avec préfixe "srv:", enlever le préfixe
                  if (service.startsWith('srv:')) {
                    return service.substring(4) // Enlever "srv:"
                  }
                  // Si c'est une catégorie principale, la garder telle quelle
                  return service
                }
                return service
              }).filter(Boolean)
            } catch (err) {
              console.warn(`[API ESCORTS] Failed to parse services for ${e.id}:`, err)
              return []
            }
          })(),
          rate1H: e.rate1H || undefined,
          rate2H: e.rate2H || undefined,
          rateHalfDay: e.rateHalfDay || undefined,
          rateFullDay: e.rateFullDay || undefined,
          rateOvernight: e.rateOvernight || undefined,
          currency: e.currency || 'CHF',
          latitude: e.latitude || undefined,
          longitude: e.longitude || undefined,
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

    const nextCursor = items.length === limit ? String(offset + limit) : undefined

    console.log('[API ESCORTS] Response prepared:', { itemsCount: items.length, nextCursor })

    return NextResponse.json({ success: true, items, nextCursor, total: undefined })
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