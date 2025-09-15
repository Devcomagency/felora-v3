import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type SortKey = 'recent' | 'relevance'

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Escorts endpoint called')
    
    // Version ultra-simple pour tester
    return NextResponse.json({ 
      items: [], 
      nextCursor: undefined, 
      total: 0,
      message: 'API working - Prisma test needed'
    })
    
    /* COMMENTED OUT FOR DEBUGGING
    const { searchParams } = new URL(request.url)
    const limit = Math.max(1, Math.min(30, parseInt(searchParams.get('limit') || '20')))
    const cursorRaw = searchParams.get('cursor') // on utilise un offset numérique pour la v1
    const offset = Math.max(0, parseInt(cursorRaw || '0'))

    const q = (searchParams.get('q') || searchParams.get('search') || '').trim()
    const city = (searchParams.get('city') || '').trim()
    const canton = (searchParams.get('canton') || '').trim()
    const servicesCSV = (searchParams.get('services') || '').trim()
    const languagesCSV = (searchParams.get('languages') || '').trim()
    const status = (searchParams.get('status') || '').trim().toUpperCase()
    const sort: SortKey = ((searchParams.get('sort') || 'recent') as SortKey)
    
    console.log('[API] Basic params:', { limit, offset, q, city, canton })
    */
    
    // Nouveaux filtres V2
    const categoriesCSV = (searchParams.get('categories') || '').trim()
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
    const serviceTypesCSV = (searchParams.get('serviceTypes') || '').trim()
    const specialtiesCSV = (searchParams.get('specialties') || '').trim()
    const experienceTypesCSV = (searchParams.get('experienceTypes') || '').trim()
    const roleTypesCSV = (searchParams.get('roleTypes') || '').trim()
    const budgetMin = parseInt(searchParams.get('budgetMin') || '0')
    const budgetMax = parseInt(searchParams.get('budgetMax') || '2000')
    const minDuration = (searchParams.get('minDuration') || '').trim()
    const acceptsCards = searchParams.get('acceptsCards') === 'true'
    const availabilityCSV = (searchParams.get('availability') || '').trim()
    const timeSlotsCSV = (searchParams.get('timeSlots') || '').trim()
    const weekendAvailable = searchParams.get('weekendAvailable') === 'true'
    const verified = searchParams.get('verified') === 'true'
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const minReviews = parseInt(searchParams.get('minReviews') || '0')
    const premiumContent = searchParams.get('premiumContent') === 'true'
    const liveCam = searchParams.get('liveCam') === 'true'
    const premiumMessaging = searchParams.get('premiumMessaging') === 'true'
    const privatePhotos = searchParams.get('privatePhotos') === 'true'
    const exclusiveVideos = searchParams.get('exclusiveVideos') === 'true'
    const availableNow = searchParams.get('availableNow') === 'true'
    const outcall = searchParams.get('outcall') === 'true'
    const incall = searchParams.get('incall') === 'true'
    const radius = parseInt(searchParams.get('radius') || '10')

    console.log('[API] Testing Prisma connection...')
    
    // Test simple de connexion Prisma
    const testConnection = await prisma.escortProfile.count()
    console.log('[API] Prisma connection OK, total profiles:', testConnection)
    
    const where: any = {}
    // Status filter
    if (status === 'ACTIVE' || status === 'PAUSED') {
      where.status = status
    } else {
      // Par défaut: profils activés ou en attente avec photo
      where.OR = [
        { status: 'ACTIVE' },
        { AND: [{ status: 'PENDING' }, { hasProfilePhoto: true }] },
      ]
    }
    if (city) where.city = { equals: city, mode: 'insensitive' as const }
    if (canton) where.canton = { equals: canton, mode: 'insensitive' as const }
    
    // Debug logging
    console.log('[API] All filter params:', {
      q, city, canton, status, servicesCSV, languagesCSV,
      categoriesCSV, ageMin, ageMax, heightMin, heightMax,
      bodyType, hairColor, eyeColor, ethnicity, breastSize, hasTattoos,
      serviceTypesCSV, specialtiesCSV, experienceTypesCSV, roleTypesCSV,
      budgetMin, budgetMax, minDuration, acceptsCards, availabilityCSV,
      timeSlotsCSV, weekendAvailable, verified, minRating, minReviews,
      premiumContent, liveCam, premiumMessaging, privatePhotos,
      exclusiveVideos, availableNow, outcall, incall
    })
    console.log('[API] Where clause:', JSON.stringify(where, null, 2))
    
    // q: stageName + description
    if (q) {
      const textFilter = {
        OR: [
          { stageName: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
        ],
      }
      if (where.OR) where.OR = [...where.OR, textFilter]
      else Object.assign(where, textFilter)
    }

    // services/langues stockés en String (JSON). On fait un contains simple.
    if (servicesCSV) {
      const terms = servicesCSV.split(',').map(s => s.trim()).filter(Boolean)
      if (terms.length) where.services = { contains: terms[0], mode: 'insensitive' as const }
    }
    if (languagesCSV) {
      const terms = languagesCSV.split(',').map(s => s.trim()).filter(Boolean)
      if (terms.length) where.languages = { contains: terms[0], mode: 'insensitive' as const }
    }

    // Nouveaux filtres V2
    // Âge (calculé depuis dateOfBirth)
    if (ageMin > 18 || ageMax < 65) {
      const currentYear = new Date().getFullYear()
      const minBirthYear = currentYear - ageMax
      const maxBirthYear = currentYear - ageMin
      where.dateOfBirth = {
        gte: new Date(`${minBirthYear}-01-01`),
        lte: new Date(`${maxBirthYear}-12-31`)
      }
    }

    // Taille
    if (heightMin > 150 || heightMax < 180) {
      where.height = {
        gte: heightMin,
        lte: heightMax
      }
    }

    // Caractéristiques physiques
    if (bodyType) {
      console.log('[API] Adding bodyType filter:', bodyType)
      where.bodyType = { contains: bodyType, mode: 'insensitive' as const }
    }
    if (hairColor) {
      console.log('[API] Adding hairColor filter:', hairColor)
      where.hairColor = { contains: hairColor, mode: 'insensitive' as const }
    }
    if (eyeColor) {
      console.log('[API] Adding eyeColor filter:', eyeColor)
      where.eyeColor = { contains: eyeColor, mode: 'insensitive' as const }
    }
    if (ethnicity) {
      console.log('[API] Adding ethnicity filter:', ethnicity)
      where.ethnicity = { contains: ethnicity, mode: 'insensitive' as const }
    }
    if (breastSize) {
      console.log('[API] Adding breastSize filter:', breastSize)
      where.bustSize = { contains: breastSize, mode: 'insensitive' as const }
    }
    if (hasTattoos) {
      console.log('[API] Adding hasTattoos filter:', hasTattoos)
      where.tattoos = { contains: hasTattoos, mode: 'insensitive' as const }
    }

    // Tarifs
    if (budgetMin > 0 || budgetMax < 2000) {
      where.rate1H = {
        gte: budgetMin,
        lte: budgetMax
      }
    }

    // Disponibilité
    if (availableNow) {
      console.log('[API] Adding availableNow filter')
      where.availableNow = true
    }
    if (outcall) {
      console.log('[API] Adding outcall filter')
      where.outcall = true
    }
    if (incall) {
      console.log('[API] Adding incall filter')
      where.incall = true
    }
    if (weekendAvailable) {
      console.log('[API] Adding weekendAvailable filter')
      where.weekendAvailable = true
    }

    // Qualité
    if (verified) where.isVerifiedBadge = true
    if (minRating > 0) where.rating = { gte: minRating }
    if (minReviews > 0) where.reviewCount = { gte: minReviews }

    // Premium
    if (premiumContent) where.hasPrivatePhotos = true
    if (liveCam) where.hasWebcamLive = true
    if (premiumMessaging) where.messagingPreference = { not: 'APP_ONLY' }
    if (privatePhotos) where.hasPrivatePhotos = true
    if (exclusiveVideos) where.hasPrivateVideos = true

    // Durée minimale
    if (minDuration) where.minimumDuration = { contains: minDuration, mode: 'insensitive' as const }

    // Accepte les cartes (champ non disponible dans le schéma actuel)
    // if (acceptsCards) where.acceptsCards = true

    const orderBy = sort === 'recent' 
      ? { updatedAt: 'desc' as const }
      : { updatedAt: 'desc' as const } // relevance non implémenté pour v1

    const rows = await prisma.escortProfile.findMany({
      where,
      select: {
        id: true,
        stageName: true,
        description: true,
        city: true,
        canton: true,
        isVerifiedBadge: true,
        hasProfilePhoto: true,
        profilePhoto: true,
        languages: true,
        services: true,
        rate1H: true,
        rate2H: true,
        rateOvernight: true,
        latitude: true,
        longitude: true,
        updatedAt: true,
        dateOfBirth: true,
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
        // acceptsCards: true, // Champ non disponible dans le schéma actuel
        rating: true,
        reviewCount: true,
        views: true,
        likes: true,
        status: true,
      },
      orderBy,
      take: limit,
      skip: offset,
    })

    const items = rows.map((e) => {
      const gallery = (() => { try { return JSON.parse(e.services || '[]') } catch { return [] } })() // not used here but kept pattern
      const langs = (() => { try { const L = JSON.parse(String(e.languages||'[]')); return Array.isArray(L)?L:[] } catch { return [] } })()
      const servs = (() => { try { const S = JSON.parse(String(e.services||'[]')); return Array.isArray(S)?S:[] } catch { return [] } })()
      const hero: any = e.profilePhoto ? { type: 'IMAGE', url: e.profilePhoto } : undefined
      const year = new Date().getFullYear()
      const age = (() => { try { return e.dateOfBirth ? (year - new Date(e.dateOfBirth).getFullYear()) : undefined } catch { return undefined } })()
      return {
        id: e.id,
        stageName: e.stageName || '',
        age,
        city: e.city || undefined,
        canton: e.canton || undefined,
        isVerifiedBadge: !!e.isVerifiedBadge,
        isActive: e.status === 'ACTIVE',
        profilePhoto: e.profilePhoto || undefined,
        heroMedia: hero,
        languages: langs,
        services: servs,
        rate1H: e.rate1H || undefined,
        rate2H: e.rate2H || undefined,
        rateOvernight: e.rateOvernight || undefined,
        latitude: e.latitude || undefined,
        longitude: e.longitude || undefined,
        updatedAt: e.updatedAt as any,
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
        acceptsCards: false, // Champ non disponible dans le schéma actuel
        rating: e.rating || 0,
        reviewCount: e.reviewCount || 0,
        views: e.views || 0,
        likes: e.likes || 0,
        status: e.status || 'PENDING',
      }
    })

    const nextCursor = items.length === limit ? String(offset + limit) : undefined

    // Debug logging
    console.log('[API] Results:', {
      totalItems: items.length,
      items: items.map(item => ({ id: item.id, stageName: item.stageName, city: item.city, canton: item.canton }))
    })

    return NextResponse.json({ items, nextCursor, total: undefined })
  } catch (error) {
    console.error('api/escorts error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
