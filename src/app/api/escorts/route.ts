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

    // Version ultra-minimale: filtrage uniquement sur status
    console.log('[API ESCORTS] Using ultra-minimal WHERE clause')
    // Ignorer TOUS les paramètres de filtrage pour isoler le problème

    const orderBy = sort === 'recent'
      ? { updatedAt: 'desc' as const }
      : { updatedAt: 'desc' as const }

    console.log('[API ESCORTS] About to query database with limit:', limit, 'offset:', offset)

    let rows
    try {
      console.log('[API ESCORTS] Attempting ultra-minimal query...')

      // Étape 1: Query avec champs de base absolument sûrs
      console.log('[API ESCORTS] Step 1: Basic fields only')
      rows = await prisma.escortProfile.findMany({
        where: { status: 'ACTIVE' }, // Filtrage minimal
        select: {
          id: true,
          stageName: true,
          city: true,
          canton: true,
          updatedAt: true,
          status: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 3, // Limiter à 3 pour tester
        skip: 0
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

        // Réponse ultra-simplifiée avec seulement les champs récupérés
        return {
          id: e.id,
          stageName: e.stageName || '',
          city: e.city || undefined,
          canton: e.canton || undefined,
          isVerifiedBadge: false, // Pas récupéré dans cette version
          isActive: e.status === 'ACTIVE',
          languages: [], // Pas récupéré dans cette version
          services: [], // Pas récupéré dans cette version
          updatedAt: e.updatedAt,
          // Valeurs par défaut pour compatibilité frontend
          age: undefined,
          profilePhoto: undefined,
          heroMedia: undefined,
          rate1H: undefined,
          rate2H: undefined,
          rateOvernight: undefined,
          latitude: undefined,
          longitude: undefined,
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