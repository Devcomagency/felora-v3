import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * API UNIFIÉE PROFIL - Dashboard ET Modal
 *
 * Cette API gère TOUT : lecture, sauvegarde, et médias
 * Remplace les APIs legacy pour une expérience cohérente
 *
 * Usage:
 * - Dashboard: GET/POST /api/profile/unified/me
 * - Modal: GET /api/profile/unified/[publicId]
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    console.log('🔄 [API UNIFIED PROFILE] Called with ID:', id)
    console.log('🔄 [API UNIFIED PROFILE] Session found:', !!session)
    console.log('🔄 [API UNIFIED PROFILE] User ID:', session?.user?.id || 'undefined')

    // Mode dashboard (profil privé de l'utilisateur connecté)
    if (id === 'me') {
      if (!session?.user?.id) {
        console.log('❌ [API UNIFIED PROFILE] No session or user ID for dashboard mode')
        return NextResponse.json({
          error: 'unauthorized',
          debug: {
            hasSession: !!session,
            userId: session?.user?.id || null
          }
        }, { status: 401 })
      }

      // Récupérer le profil escort de l'utilisateur connecté
      const profile = await prisma.escortProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          // Identité de base
          id: true,
          userId: true,
          stageName: true,
          description: true,
          dateOfBirth: true,

          // Localisation
          city: true,
          canton: true,
          latitude: true,
          longitude: true,
          workingArea: true, // Adresse legacy

          // Contact et visibilité
          phoneVisibility: true,

          // Langues et services
          languages: true,
          services: true,
          practices: true,

          // Tarifs
          rate15Min: true,
          rate30Min: true,
          rate1H: true,
          rate2H: true,
          rateHalfDay: true,
          rateFullDay: true,
          rateOvernight: true,
          currency: true,

          // Physique
          height: true,
          bodyType: true,
          hairColor: true,
          eyeColor: true,
          ethnicity: true,
          bustSize: true,
          tattoos: true,
          piercings: true,

          // Services et clientèle
          outcall: true,
          incall: true,
          acceptsCouples: true,
          acceptsWomen: true,
          acceptsHandicapped: true,
          acceptsSeniors: true,

          // Méthodes de paiement et options de lieu
          paymentMethods: true,
          venueOptions: true,
          acceptedCurrencies: true,

          // Médias
          galleryPhotos: true,
          videos: true,
          profilePhoto: true,

          // Agenda et disponibilité
          timeSlots: true,
          availableNow: true,
          weekendAvailable: true,
          minimumDuration: true,

          // Champs manquants importants
          firstName: true,
          nationality: true,
          rates: true, // Tarifs legacy
          availability: true, // Disponibilité legacy

          // Nouveaux champs ajoutés
          category: true,
          phoneDisplayType: true,
          originDetails: true,
          breastType: true,
          pubicHair: true,
          smoker: true,

          // Services détaillés supprimés (pour éviter doublons)

          // Tarifs détaillés
          baseRate: true,
          rateStructure: true,

          // Validation
          ageVerified: true,

          // Verification et badges
          isVerifiedBadge: true,
          profileCompleted: true,

          // Messaging
          telegramConnected: true,
          telegramEnabled: true,
          messagingPreference: true,

          // Méta
          status: true,
          createdAt: true,
          updatedAt: true,

          // User data
          user: {
            select: {
              email: true,
              phone: true,
              name: true
            }
          }
        }
      })

      if (!profile) {
        return NextResponse.json({ error: 'profile_not_found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        mode: 'dashboard',
        profile: transformProfileData(profile, 'dashboard')
      })
    }

    // Mode modal (profil public)
    else {
      const profile = await prisma.escortProfile.findUnique({
        where: { id },
        select: {
          // Identité publique
          id: true,
          stageName: true,
          description: true,
          dateOfBirth: true,

          // Localisation publique
          city: true,
          canton: true,

          // Langues et services publics
          languages: true,
          services: true,
          practices: true,

          // Tarifs publics
          rate15Min: true,
          rate30Min: true,
          rate1H: true,
          rate2H: true,
          rateHalfDay: true,
          rateFullDay: true,
          rateOvernight: true,
          currency: true,

          // Physique public
          height: true,
          bodyType: true,
          hairColor: true,
          eyeColor: true,
          ethnicity: true,
          bustSize: true,
          tattoos: true,
          piercings: true,

          // Services publics
          outcall: true,
          incall: true,
          acceptsCouples: true,
          acceptsWomen: true,
          acceptsHandicapped: true,
          acceptsSeniors: true,

          // Méthodes de paiement et options (publiques)
          paymentMethods: true,
          venueOptions: true,
          acceptedCurrencies: true,

          // Disponibilité publique
          availableNow: true,
          weekendAvailable: true,

          // Nouveaux champs publics
          category: true,
          breastType: true,
          pubicHair: true,

          // Services publics (services détaillés supprimés)

          // Tarifs publics
          baseRate: true,

          // Statut
          status: true,
          updatedAt: true,
        }
      })

      if (!profile || profile.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'profile_not_found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        mode: 'public',
        profile: transformProfileData(profile, 'public')
      })
    }

  } catch (error) {
    console.error('❌ [API UNIFIED PROFILE] Error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

/**
 * Fonction de tri automatique des services pour séparer catégories et services
 */
function categorizeServicesForRead(services: string[]): {
  category: string | null,
  cleanedServices: string[]
} {
  const result = { category: null as string | null, cleanedServices: [] as string[] }

  // Définition des catégories principales avec variantes tirets/underscores
  const categoryMap = new Map([
    // Escort
    ['escort', 'escort'],
    // Masseuse érotique
    ['masseuse', 'masseuse_erotique'],
    ['masseuse_erotique', 'masseuse_erotique'],
    ['masseuse-erotique', 'masseuse_erotique'],
    ['massage', 'masseuse_erotique'],
    ['massage_erotique', 'masseuse_erotique'],
    ['massage-erotique', 'masseuse_erotique'],
    // Dominatrice BDSM
    ['dominatrice', 'dominatrice_bdsm'],
    ['dominatrice_bdsm', 'dominatrice_bdsm'],
    ['dominatrice-bdsm', 'dominatrice_bdsm'],
    ['bdsm', 'dominatrice_bdsm'],
    ['mistress', 'dominatrice_bdsm'],
    // Transsexuel
    ['transsexuel', 'transsexuel'],
    ['trans', 'transsexuel'],
    ['transgender', 'transsexuel']
  ])

  services.forEach(service => {
    // Nettoyer le service (enlever préfixes srv:, opt:)
    let cleanService = service.replace(/^(srv:|opt:)/, '').trim().toLowerCase()

    // Vérifier si c'est une catégorie
    if (categoryMap.has(cleanService)) {
      result.category = categoryMap.get(cleanService)!
    } else {
      // Sinon, c'est un vrai service
      result.cleanedServices.push(service.replace(/^(srv:|opt:)/, '').trim())
    }
  })

  return result
}

/**
 * POST /api/profile/unified/[id] - Sauvegarde unifiée
 * Remplace /api/escort/profile/update avec une logique simplifiée
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    console.log('🔄 [API UNIFIED POST] Called with ID:', id)
    console.log('🔄 [API UNIFIED POST] Session found:', !!session)

    // Seul le mode dashboard permet la sauvegarde
    if (id !== 'me') {
      return NextResponse.json({
        error: 'forbidden',
        message: 'Seul le mode dashboard permet la sauvegarde'
      }, { status: 403 })
    }

    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'unauthorized',
        message: 'Session requise pour la sauvegarde'
      }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    console.log('🔄 [API UNIFIED POST] Body keys:', Object.keys(body))

    // Validation et transformation des données
    const transformedData = transformUpdateData(body)
    console.log('🔄 [API UNIFIED POST] Transformed data keys:', Object.keys(transformedData))

    // Vérifier que le profil existe
    let existingProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!existingProfile) {
      // Créer un profil minimal si absent
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true }
      })
      
      const baseName = (user?.name?.split(' ')?.[0] || 'Escort').toString()
      const today = new Date()
      const dob = new Date(today.getFullYear() - 30, 0, 1) // âge par défaut ~30
      
      existingProfile = await prisma.escortProfile.create({
        data: {
          userId: session.user.id,
          firstName: baseName,
          stageName: baseName,
          dateOfBirth: dob,
          nationality: 'CH',
          languages: '',
          city: '',
          workingArea: '',
          description: '',
          services: '',
          rates: '',
          availability: '',
          galleryPhotos: '[]',
          videos: '[]',
        }
      })
    }

    // Mettre à jour le profil
    await prisma.escortProfile.update({
      where: { userId: session.user.id },
      data: transformedData
    })

    // Mettre à jour le téléphone dans la table User si fourni
    if (body.phone) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { phone: body.phone }
      })
    }

    console.log('✅ [API UNIFIED POST] Profile updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ [API UNIFIED POST] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'server_error',
      message: error.message || 'Erreur lors de la sauvegarde'
    }, { status: 500 })
  }
}

/**
 * Transforme les données du frontend vers le format de la base de données
 */
function transformUpdateData(body: any): Record<string, any> {
  const data: Record<string, any> = {}

  // Champs de base
  if (body.stageName !== undefined) data.stageName = body.stageName
  if (body.description !== undefined) data.description = body.description
  if (body.city !== undefined) data.city = body.city
  if (body.canton !== undefined) data.canton = body.canton

  // Âge → dateOfBirth
  if (body.age !== undefined && typeof body.age === 'number') {
    const age = Math.round(body.age)
    if (age >= 18 && age <= 80) {
      const today = new Date()
      const dobYear = today.getFullYear() - age
      data.dateOfBirth = new Date(dobYear, 0, 1) // 1er janvier
    }
  }

  // Coordonnées
  if (body.coordinates?.lat && body.coordinates?.lng) {
    data.latitude = body.coordinates.lat
    data.longitude = body.coordinates.lng
  }

  // Adresse
  if (body.address !== undefined) data.workingArea = body.address

  // Arrays → CSV
  if (body.languages !== undefined) {
    data.languages = Array.isArray(body.languages) 
      ? body.languages.join(', ') 
      : body.languages
  }

  if (body.services !== undefined) {
    // Gestion des services avec catégorisation automatique
    const servicesArray = Array.isArray(body.services) ? body.services : []
    const { category, cleanedServices } = categorizeServicesForUpdate(servicesArray)
    
    if (category) data.category = category
    data.services = cleanedServices.join(', ')
  }

  // Nouvelles options
  if (body.paymentMethods !== undefined) {
    data.paymentMethods = Array.isArray(body.paymentMethods) 
      ? body.paymentMethods.join(', ') 
      : body.paymentMethods
  }

  if (body.amenities !== undefined) {
    data.venueOptions = Array.isArray(body.amenities) 
      ? body.amenities.join(', ') 
      : body.amenities
  }

  // Spécialités → practices
  if (body.specialties !== undefined) {
    data.practices = Array.isArray(body.specialties)
      ? body.specialties.join(', ')
      : body.specialties
  }

  // Catégorie directe (pour assurer la persistance)
  if (body.category !== undefined) {
    data.category = body.category
  }

  if (body.acceptedCurrencies !== undefined) {
    data.acceptedCurrencies = Array.isArray(body.acceptedCurrencies) 
      ? body.acceptedCurrencies.join(', ') 
      : body.acceptedCurrencies
  }

  // Tarifs
  if (body.rates?.fifteenMin !== undefined) data.rate15Min = body.rates.fifteenMin
  if (body.rates?.thirtyMin !== undefined) data.rate30Min = body.rates.thirtyMin
  if (body.rates?.oneHour !== undefined) data.rate1H = body.rates.oneHour
  if (body.rates?.twoHours !== undefined) data.rate2H = body.rates.twoHours
  if (body.rates?.halfDay !== undefined) data.rateHalfDay = body.rates.halfDay
  if (body.rates?.fullDay !== undefined) data.rateFullDay = body.rates.fullDay
  if (body.rates?.overnight !== undefined) data.rateOvernight = body.rates.overnight
  if (body.rates?.currency !== undefined) data.currency = body.rates.currency
  if (body.rates?.baseRate !== undefined) data.baseRate = body.rates.baseRate

  // Physique
  if (body.physical?.height !== undefined) data.height = body.physical.height
  if (body.physical?.bodyType !== undefined) data.bodyType = body.physical.bodyType
  if (body.physical?.hairColor !== undefined) data.hairColor = body.physical.hairColor
  if (body.physical?.eyeColor !== undefined) data.eyeColor = body.physical.eyeColor
  if (body.physical?.ethnicity !== undefined) data.ethnicity = body.physical.ethnicity
  if (body.physical?.bustSize !== undefined) data.bustSize = body.physical.bustSize
  if (body.physical?.breastType !== undefined) data.breastType = body.physical.breastType
  if (body.physical?.tattoos !== undefined) data.tattoos = body.physical.tattoos
  if (body.physical?.piercings !== undefined) data.piercings = body.physical.piercings
  if (body.physical?.pubicHair !== undefined) data.pubicHair = body.physical.pubicHair
  if (body.physical?.smoker !== undefined) data.smoker = body.physical.smoker

  // Disponibilité
  if (body.availability?.outcall !== undefined) data.outcall = body.availability.outcall
  if (body.availability?.incall !== undefined) data.incall = body.availability.incall
  if (body.availability?.availableNow !== undefined) data.availableNow = body.availability.availableNow
  if (body.availability?.weekendAvailable !== undefined) data.weekendAvailable = body.availability.weekendAvailable

  // Clientèle
  if (body.clientele?.acceptsCouples !== undefined) data.acceptsCouples = body.clientele.acceptsCouples
  if (body.clientele?.acceptsWomen !== undefined) data.acceptsWomen = body.clientele.acceptsWomen
  if (body.clientele?.acceptsHandicapped !== undefined) data.acceptsHandicapped = body.clientele.acceptsHandicapped
  if (body.clientele?.acceptsSeniors !== undefined) data.acceptsSeniors = body.clientele.acceptsSeniors

  // Contact et visibilité
  if (body.phoneVisibility !== undefined) data.phoneVisibility = body.phoneVisibility
  if (body.phoneDisplayType !== undefined) data.phoneDisplayType = body.phoneDisplayType

  // Agenda
  if (body.timeSlots !== undefined) {
    data.timeSlots = typeof body.timeSlots === 'string' 
      ? body.timeSlots 
      : JSON.stringify(body.timeSlots)
  }

  // Médias
  if (body.galleryPhotos !== undefined) {
    data.galleryPhotos = typeof body.galleryPhotos === 'string' 
      ? body.galleryPhotos 
      : JSON.stringify(body.galleryPhotos)
  }

  if (body.videos !== undefined) {
    data.videos = typeof body.videos === 'string' 
      ? body.videos 
      : JSON.stringify(body.videos)
  }

  if (body.profilePhoto !== undefined) {
    data.profilePhoto = body.profilePhoto || null
  }

  // Champs supplémentaires
  if (body.originDetails !== undefined) data.originDetails = body.originDetails
  if (body.rateStructure !== undefined) data.rateStructure = body.rateStructure
  if (body.ageVerified !== undefined) data.ageVerified = body.ageVerified
  if (body.minimumDuration !== undefined) data.minimumDuration = body.minimumDuration

  return data
}

/**
 * Catégorise les services pour la sauvegarde (logique simplifiée)
 */
function categorizeServicesForUpdate(services: string[]): {
  category: string | null,
  cleanedServices: string[]
} {
  const result = { category: null as string | null, cleanedServices: [] as string[] }

  const mainCategories = [
    'escort', 'masseuse_erotique', 'dominatrice_bdsm', 'transsexuel',
    'masseuse', 'dominatrice', 'BDSM', 'massage'
  ]

  services.forEach(service => {
    const cleanService = service.replace(/^(srv:|opt:)/, '').trim()

    if (mainCategories.includes(cleanService)) {
      // C'est une catégorie principale
      if (cleanService === 'masseuse' || cleanService === 'massage') {
        result.category = 'masseuse_erotique'
      } else if (cleanService === 'dominatrice' || cleanService === 'BDSM') {
        result.category = 'dominatrice_bdsm'
      } else {
        result.category = cleanService
      }
    } else {
      // C'est un service
      result.cleanedServices.push(cleanService)
    }
  })

  return result
}

/**
 * Transforme les données brutes de la BDD en format unifié
 * Centralise toute la logique de transformation (âge, parsing, etc.)
 */
function transformProfileData(rawProfile: any, mode: 'dashboard' | 'public') {
  // Calcul précis de l'âge (logique centralisée)
  const age = (() => {
    try {
      if (!rawProfile.dateOfBirth) return undefined
      const today = new Date()
      const birthDate = new Date(rawProfile.dateOfBirth)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    } catch {
      return undefined
    }
  })()

  // Parse des langues (logique centralisée)
  const languages = (() => {
    try {
      const raw = String(rawProfile.languages || '')
      if (!raw) return []
      if (raw.trim().startsWith('[')) {
        const L = JSON.parse(raw)
        return Array.isArray(L) ? L : []
      }
      return raw.split(',').map((x: string) => x.trim()).filter(Boolean)
    } catch {
      return []
    }
  })()

  // Parse des services avec tri automatique (logique centralisée)
  const { services, extractedCategory } = (() => {
    try {
      const raw = String(rawProfile.services || '')
      if (!raw) return { services: [], extractedCategory: null }

      let servicesArray: string[] = []
      if (raw.trim().startsWith('[')) {
        const S = JSON.parse(raw)
        servicesArray = Array.isArray(S) ? S : []
      } else {
        servicesArray = raw.split(',').map((x: string) => x.trim()).filter(Boolean)
      }

      // Appliquer le tri automatique pour séparer catégorie et services
      const categorized = categorizeServicesForRead(servicesArray)

      return {
        services: categorized.cleanedServices,
        extractedCategory: categorized.category
      }
    } catch {
      return { services: [], extractedCategory: null }
    }
  })()

  // Practices supprimé - remplacé par amenities uniquement

  // Parse des spécialités depuis practices
  const specialties = parseStringArray(rawProfile.practices)

  // Parse des nouvelles options (avec fallback si champs manquants)
  const paymentMethods = parseStringArray((rawProfile as any).paymentMethods)
  console.log('🔄 [API UNIFIED] venueOptions brut:', (rawProfile as any).venueOptions, typeof (rawProfile as any).venueOptions)
  const amenities = parseStringArray((rawProfile as any).venueOptions) // Note: venueOptions en BDD → amenities en interface
  console.log('🔄 [API UNIFIED] amenities parsées:', amenities)
  const acceptedCurrencies = parseStringArray((rawProfile as any).acceptedCurrencies)

  // Services détaillés supprimés (pour éviter doublons)

  // Données communes
  const commonData = {
    id: rawProfile.id,
    stageName: rawProfile.stageName || '',
    description: rawProfile.description || '',
    age,

    // Catégorie : utiliser celle extraite des services ou celle de la BDD
    category: extractedCategory || rawProfile.category || '',

    // Localisation
    city: rawProfile.city || '',
    canton: rawProfile.canton || '',

    // Langues et services
    languages,
    services,
    specialties, // Ajout des spécialités mappées depuis practices

    // Services détaillés supprimés (pour éviter doublons)

    // Médias
    galleryPhotos: parseStringArray(rawProfile.galleryPhotos),
    videos: parseStringArray(rawProfile.videos),
    profilePhoto: rawProfile.profilePhoto || null,

    // Tarifs
    rates: {
      fifteenMin: rawProfile.rate15Min || undefined,
      thirtyMin: rawProfile.rate30Min || undefined,
      oneHour: rawProfile.rate1H || undefined,
      twoHours: rawProfile.rate2H || undefined,
      halfDay: rawProfile.rateHalfDay || undefined,
      fullDay: rawProfile.rateFullDay || undefined,
      overnight: rawProfile.rateOvernight || undefined,
      currency: rawProfile.currency || 'CHF',
      baseRate: rawProfile.baseRate || undefined
    },

    // Physique
    physical: {
      height: rawProfile.height || undefined,
      bodyType: rawProfile.bodyType || undefined,
      hairColor: rawProfile.hairColor || undefined,
      eyeColor: rawProfile.eyeColor || undefined,
      ethnicity: rawProfile.ethnicity || undefined,
      bustSize: rawProfile.bustSize || undefined,
      breastType: rawProfile.breastType || undefined,
      tattoos: rawProfile.tattoos === 'true' ? true : (rawProfile.tattoos === 'false' ? false : undefined),
      piercings: rawProfile.piercings === 'true' ? true : (rawProfile.piercings === 'false' ? false : undefined),
      pubicHair: rawProfile.pubicHair || undefined,
      smoker: rawProfile.smoker || undefined
    },

    // Services
    availability: {
      outcall: !!rawProfile.outcall,
      incall: !!rawProfile.incall,
      availableNow: !!rawProfile.availableNow,
      weekendAvailable: !!rawProfile.weekendAvailable
    },

    // Clientèle
    clientele: {
      acceptsCouples: !!rawProfile.acceptsCouples,
      acceptsWomen: !!rawProfile.acceptsWomen,
      acceptsHandicapped: !!rawProfile.acceptsHandicapped,
      acceptsSeniors: !!rawProfile.acceptsSeniors
    },

    // Options nouvelles
    options: {
      paymentMethods,
      amenities,
      acceptedCurrencies
    },

    updatedAt: rawProfile.updatedAt
  }

  // Données spécifiques au mode dashboard
  if (mode === 'dashboard') {
    return {
      ...commonData,
      userId: rawProfile.userId,
      firstName: rawProfile.firstName || '',
      nationality: rawProfile.nationality || '',

      // Origine et détails
      originDetails: rawProfile.originDetails || '',

      // Contact étendu
      phoneDisplayType: rawProfile.phoneDisplayType || 'hidden',

      // Adresse et localisation
      address: rawProfile.workingArea || '', // Legacy
      coordinates: rawProfile.latitude && rawProfile.longitude ? {
        lat: rawProfile.latitude,
        lng: rawProfile.longitude
      } : undefined,

      // Contact et visibilité
      phoneVisibility: rawProfile.phoneVisibility || 'hidden',

      // Agenda et disponibilité détaillée
      timeSlots: rawProfile.timeSlots || '', // Agenda JSON
      minimumDuration: rawProfile.minimumDuration || '',
      legacyRates: rawProfile.rates || '', // Tarifs format legacy
      legacyAvailability: rawProfile.availability || '', // Disponibilité format legacy

      // Tarifs dashboard détaillés
      rateStructure: rawProfile.rateStructure || '',

      // Validation
      ageVerified: !!rawProfile.ageVerified,

      // Verification et complétion
      isVerifiedBadge: !!rawProfile.isVerifiedBadge,
      profileCompleted: !!rawProfile.profileCompleted,

      // Messaging
      telegram: {
        connected: !!rawProfile.telegramConnected,
        enabled: !!rawProfile.telegramEnabled,
        preference: rawProfile.messagingPreference || 'APP_ONLY'
      },

      // Méta dashboard
      status: rawProfile.status,
      user: rawProfile.user,
      createdAt: rawProfile.createdAt
    }
  }

  // Données publiques pour le modal
  return commonData
}

/**
 * Helper pour parser les arrays JSON ou CSV
 */
function parseStringArray(value: any): any[] {
  try {
    if (!value) return []
    const str = String(value)
    if (str.trim().startsWith('[')) {
      const parsed = JSON.parse(str)
      return Array.isArray(parsed) ? parsed : []
    }
    return str.split(',').map((x: string) => x.trim()).filter(Boolean)
  } catch {
    return []
  }
}