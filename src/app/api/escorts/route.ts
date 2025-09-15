import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type SortKey = 'recent' | 'relevance'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.max(1, Math.min(30, parseInt(searchParams.get('limit') || '20')))
    const cursorRaw = searchParams.get('cursor')
    const offset = Math.max(0, parseInt(cursorRaw || '0'))

    const q = (searchParams.get('q') || searchParams.get('search') || '').trim()
    const city = (searchParams.get('city') || '').trim()
    const canton = (searchParams.get('canton') || '').trim()
    const servicesCSV = (searchParams.get('services') || '').trim()
    const languagesCSV = (searchParams.get('languages') || '').trim()
    const sort: SortKey = ((searchParams.get('sort') || 'recent') as SortKey)

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

    const where: any = {}

    // Status filter - Par défaut seulement ACTIVE (compatible frontend legacy)
    const statusesParam = searchParams.get('statuses') || searchParams.get('status')
    if (statusesParam) {
      // Si statuses explicite fourni, utiliser celui-ci
      const statusList = statusesParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
      if (statusList.length === 1) {
        where.status = statusList[0]
      } else if (statusList.length > 1) {
        where.status = { in: statusList }
      }
    } else {
      // Par défaut: SEULEMENT les profils ACTIVE (comportement attendu frontend)
      where.status = 'ACTIVE'
    }

    // Filtres de localisation avec exact match
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

    // Filtre Catégories (nouveau) - Correction pour format JSON
    if (categoriesCSV) {
      const categories = categoriesCSV.split(',').map(s => s.trim()).filter(Boolean)
      if (categories.length > 0) {
        const categoryFilter = {
          OR: categories.map(cat => {
            // Mapping des catégories vers les champs DB appropriés
            switch (cat.toLowerCase()) {
              case 'escorte':
              case 'escort':
                return { services: { contains: 'escort', mode: 'insensitive' as const } }
              case 'salon':
                return { services: { contains: 'salon', mode: 'insensitive' as const } }
              case 'massage':
                return {
                  OR: [
                    { services: { contains: 'massage', mode: 'insensitive' as const } },
                    { services: { contains: 'masseuse', mode: 'insensitive' as const } },
                    { services: { contains: 'therapeutique', mode: 'insensitive' as const } }
                  ]
                }
              case 'vip':
                return { isVerifiedBadge: true }
              case 'bdsm':
                return { services: { contains: 'bdsm', mode: 'insensitive' as const } }
              case 'médias privés':
              case 'medias prives':
                return {
                  OR: [
                    { hasPrivatePhotos: true },
                    { hasPrivateVideos: true }
                  ]
                }
              default:
                return { services: { contains: cat, mode: 'insensitive' as const } }
            }
          })
        }
        where.AND = where.AND ? [...where.AND, categoryFilter] : [categoryFilter]
      }
    }

    // Services et langues
    if (servicesCSV) {
      const terms = servicesCSV.split(',').map(s => s.trim()).filter(Boolean)
      if (terms.length) where.services = { contains: terms[0], mode: 'insensitive' as const }
    }
    if (languagesCSV) {
      const terms = languagesCSV.split(',').map(s => s.trim()).filter(Boolean)
      if (terms.length) where.languages = { contains: terms[0], mode: 'insensitive' as const }
    }

    // Filtres physiques V2
    if (ageMin > 18 || ageMax < 65) {
      const currentYear = new Date().getFullYear()
      const minBirthYear = currentYear - ageMax
      const maxBirthYear = currentYear - ageMin
      where.dateOfBirth = {
        gte: new Date(`${minBirthYear}-01-01`),
        lte: new Date(`${maxBirthYear}-12-31`)
      }
    }

    if (heightMin > 150 || heightMax < 180) {
      where.height = { gte: heightMin, lte: heightMax }
    }

    if (bodyType) where.bodyType = { contains: bodyType, mode: 'insensitive' as const }
    if (hairColor) where.hairColor = { contains: hairColor, mode: 'insensitive' as const }
    if (eyeColor) where.eyeColor = { contains: eyeColor, mode: 'insensitive' as const }
    if (ethnicity) where.ethnicity = { contains: ethnicity, mode: 'insensitive' as const }
    if (breastSize) where.bustSize = { contains: breastSize, mode: 'insensitive' as const }

    // Tarifs
    if (budgetMin > 0 || budgetMax < 2000) {
      where.rate1H = { gte: budgetMin, lte: budgetMax }
    }

    // Disponibilité
    if (availableNow) where.availableNow = true
    if (outcall) where.outcall = true
    if (incall) where.incall = true
    if (weekendAvailable) where.weekendAvailable = true

    // Qualité et premium
    if (verified) where.isVerifiedBadge = true
    if (minRating > 0) where.rating = { gte: minRating }
    if (minReviews > 0) where.reviewCount = { gte: minReviews }
    if (premiumContent) where.hasPrivatePhotos = true
    if (liveCam) where.hasWebcamLive = true
    if (premiumMessaging) where.messagingPreference = { not: 'APP_ONLY' }
    if (privatePhotos) where.hasPrivatePhotos = true
    if (exclusiveVideos) where.hasPrivateVideos = true

    const orderBy = sort === 'recent'
      ? { updatedAt: 'desc' as const }
      : { updatedAt: 'desc' as const }

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
      const langs = (() => {
        try {
          const L = JSON.parse(String(e.languages||'[]'))
          return Array.isArray(L) ? L : []
        } catch { return [] }
      })()

      const servs = (() => {
        try {
          const S = JSON.parse(String(e.services||'[]'))
          return Array.isArray(S) ? S : []
        } catch { return [] }
      })()

      const hero: any = e.profilePhoto ? { type: 'IMAGE', url: e.profilePhoto } : undefined
      const year = new Date().getFullYear()
      const age = (() => {
        try {
          return e.dateOfBirth ? (year - new Date(e.dateOfBirth).getFullYear()) : undefined
        } catch { return undefined }
      })()

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
        acceptsCards: false,
        rating: e.rating || 0,
        reviewCount: e.reviewCount || 0,
        views: e.views || 0,
        likes: e.likes || 0,
        status: e.status || 'PENDING',
      }
    })

    const nextCursor = items.length === limit ? String(offset + limit) : undefined

    return NextResponse.json({ success: true, items, nextCursor, total: undefined })
  } catch (error) {
    console.error('api/escorts error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}