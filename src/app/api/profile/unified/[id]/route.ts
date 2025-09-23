import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * API UNIFIÉE PROFIL - Dashboard ET Modal
 *
 * IMPORTANT: Cette API NE GÈRE PAS les médias (galleryPhotos, videos, profilePhoto)
 * Les médias restent sur leurs APIs dédiées pour éviter la complexité.
 *
 * Usage:
 * - Dashboard: GET /api/profile/unified/me
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
          rate1H: true,
          rate2H: true,
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
          rate1H: true,
          rate2H: true,
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

  // Définition des catégories principales
  const mainCategories = [
    'escort', 'masseuse_erotique', 'dominatrice_bdsm', 'transsexuel',
    'masseuse', 'dominatrice', 'BDSM', 'massage'
  ]

  services.forEach(service => {
    // Nettoyer le service (enlever préfixes srv:, opt:)
    let cleanService = service.replace(/^(srv:|opt:)/, '').trim()

    // D'abord vérifier si c'est une catégorie principale
    if (mainCategories.includes(cleanService)) {
      // Si c'est une catégorie principale, l'assigner
      if (cleanService === 'masseuse' || cleanService === 'massage') {
        result.category = 'masseuse_erotique'
      } else if (cleanService === 'dominatrice' || cleanService === 'BDSM') {
        result.category = 'dominatrice_bdsm'
      } else {
        result.category = cleanService
      }
    } else {
      // Sinon, c'est un vrai service
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

  // Parse des pratiques
  const practices = (() => {
    try {
      const raw = String(rawProfile.practices || '')
      if (!raw) return []
      if (raw.trim().startsWith('[')) {
        const P = JSON.parse(raw)
        return Array.isArray(P) ? P : []
      }
      return raw.split(',').map((x: string) => x.trim()).filter(Boolean)
    } catch {
      return []
    }
  })()

  // Parse des nouvelles options (avec fallback si champs manquants)
  const paymentMethods = parseStringArray((rawProfile as any).paymentMethods)
  const venueOptions = parseStringArray((rawProfile as any).venueOptions)
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
    practices,

    // Services détaillés supprimés (pour éviter doublons)

    // Tarifs
    rates: {
      oneHour: rawProfile.rate1H || undefined,
      twoHours: rawProfile.rate2H || undefined,
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
      venueOptions,
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
function parseStringArray(value: any): string[] {
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