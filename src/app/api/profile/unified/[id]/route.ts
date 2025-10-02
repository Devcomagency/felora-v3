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

          // Agenda/Disponibilité
          agendaEnabled: false,

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

          // Contact et visibilité publique
          phoneVisibility: true,
          phoneDisplayType: true,

          // Services publics (services détaillés supprimés)

          // Tarifs publics
          baseRate: true,

          // Statut
          status: true,
          updatedAt: true,

          // User data pour le téléphone si nécessaire
          user: {
            select: {
              phone: true
            }
          }
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
    console.log('🔄 [API UNIFIED POST] Session user ID:', session?.user?.id)
    console.log('🔄 [API UNIFIED POST] ID === "me":', id === 'me')
    console.log('🔄 [API UNIFIED POST] ID === session.user.id:', id === session?.user?.id)

    // Seul le mode dashboard permet la sauvegarde
    // Autoriser si id === 'me' OU si l'utilisateur connecté modifie son propre profil
    if (id !== 'me' && id !== session?.user?.id) {
      console.log('🔄 [API UNIFIED POST] Access denied: ID is neither "me" nor user ID')
      return NextResponse.json({
        error: 'forbidden',
        message: 'Seul le mode dashboard permet la sauvegarde'
      }, { status: 403 })
    }
    
    console.log('🔄 [API UNIFIED POST] Access granted, continuing...')

    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'unauthorized',
        message: 'Session requise pour la sauvegarde'
      }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    console.log('🔄 [API UNIFIED POST] Body keys:', Object.keys(body))

    // Ignorer les requêtes vides (protection contre les race conditions)
    if (Object.keys(body).length === 0) {
      console.log('⚠️ [API UNIFIED POST] Body vide - requête ignorée')
      return NextResponse.json({
        success: true,
        message: 'Aucune donnée à sauvegarder',
        ignored: true
      })
    }

    // Validation et transformation des données
    const transformedData = transformUpdateData(body)
    console.log('🔄 [API UNIFIED POST] Transformed data keys:', Object.keys(transformedData))

    // Sécurité : empêcher les updates vides
    if (Object.keys(transformedData).length === 0) {
      console.log('⚠️ [API UNIFIED POST] Données transformées vides - requête ignorée')
      return NextResponse.json({
        success: true,
        message: 'Aucune donnée valide à sauvegarder',
        ignored: true
      })
    }

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

  // Languages with star ratings → CSV format
  if (body.languages !== undefined) {
    console.log('🔄 [API UNIFIED] Languages received:', body.languages)
    if (typeof body.languages === 'object' && !Array.isArray(body.languages)) {
      // Nouveau format: { "Français": 5, "Anglais": 3, ... }
      const languageEntries = Object.entries(body.languages as Record<string, number>)
        .filter(([_, rating]) => rating > 0) // Seulement les langues avec des étoiles
        .map(([lang, rating]) => `${lang}:${rating}⭐`)
      data.languages = languageEntries.join(', ')
      console.log('🔄 [API UNIFIED] Languages processed:', data.languages)
    } else {
      // Ancien format: array ou string
      data.languages = Array.isArray(body.languages) 
        ? body.languages.join(', ') 
        : body.languages
      console.log('🔄 [API UNIFIED] Languages (old format):', data.languages)
    }
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
    console.log('🔄 [API UNIFIED POST] paymentMethods brut:', body.paymentMethods, typeof body.paymentMethods)
    const parsedPaymentMethods = parseStringArray(body.paymentMethods)
    console.log('🔄 [API UNIFIED POST] paymentMethods parsé:', parsedPaymentMethods)
    data.paymentMethods = parsedPaymentMethods.length > 0 ? parsedPaymentMethods.join(', ') : ''
  }

  if (body.amenities !== undefined) {
    console.log('🔄 [API UNIFIED POST] amenities brut:', body.amenities, typeof body.amenities)
    const parsedAmenities = parseStringArray(body.amenities)
    console.log('🔄 [API UNIFIED POST] amenities parsé:', parsedAmenities)

    // SAUVEGARDER TOUTES LES AMENITIES (services et options) - pas de filtrage
    // Le frontend envoie un mélange de srv: et opt:, on garde tout pour compatibilité
    const filteredAmenities = parsedAmenities.filter(item => item && item.trim() !== '')

    console.log('🔄 [API UNIFIED POST] amenities filtrées:', filteredAmenities)
    data.venueOptions = filteredAmenities.length > 0 ? filteredAmenities.join(', ') : ''
  }

  // Spécialités → practices (filtrées pour ne garder que les services, pas les équipements)
  if (body.specialties !== undefined) {
    const uniqueSpecialties = Array.isArray(body.specialties)
      ? [...new Set(body.specialties)]
          .filter(item => typeof item === 'string' && item && item.trim() !== '' && !item.startsWith('opt:'))
      : body.specialties
    data.practices = Array.isArray(uniqueSpecialties)
      ? uniqueSpecialties.join(', ')
      : uniqueSpecialties
  }

  // Catégorie directe (pour assurer la persistance)
  if (body.category !== undefined) {
    data.category = body.category
  }

  if (body.acceptedCurrencies !== undefined) {
    console.log('🔄 [API UNIFIED POST] acceptedCurrencies brut:', body.acceptedCurrencies, typeof body.acceptedCurrencies)
    const parsedCurrencies = parseStringArray(body.acceptedCurrencies)
    console.log('🔄 [API UNIFIED POST] acceptedCurrencies parsé:', parsedCurrencies)
    data.acceptedCurrencies = parsedCurrencies.length > 0 ? parsedCurrencies.join(', ') : ''
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
  if (body.physical?.tattoos !== undefined) data.tattoos = String(body.physical.tattoos)
  if (body.physical?.piercings !== undefined) data.piercings = String(body.physical.piercings)
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
  if (body.agendaEnabled !== undefined) {
    console.log('🔄 [API UNIFIED] agendaEnabled reçu:', body.agendaEnabled, 'type:', typeof body.agendaEnabled)
    data.agendaEnabled = body.agendaEnabled
    console.log('🔄 [API UNIFIED] agendaEnabled ajouté à data:', data.agendaEnabled)
  }
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

  // Parse des langues avec étoiles (logique centralisée) - RETOURNE UN OBJET { langue: rating }
  const languages = (() => {
    try {
      const raw = String(rawProfile.languages || '')
      console.log('🔄 [API UNIFIED] Raw languages from DB:', raw)
      if (!raw) return {}
      
      // Nouveau format avec étoiles: "Français:5⭐, Anglais:3⭐"
      if (raw.includes('⭐')) {
        const languageEntries = raw.split(',').map((x: string) => x.trim()).filter(Boolean)
        const result: Record<string, number> = {}
        
        languageEntries.forEach(entry => {
          const match = entry.match(/^(.+):(\d+)⭐$/)
          if (match) {
            const [, lang, rating] = match
            result[lang] = parseInt(rating, 10)
          }
        })
        console.log('🔄 [API UNIFIED] Languages parsed (stars format):', result)
        return result
      }
      
      // Ancien format: array ou CSV simple
      if (raw.trim().startsWith('[')) {
        const L = JSON.parse(raw)
        const result: Record<string, number> = {}
        if (Array.isArray(L)) {
          L.forEach(lang => {
            result[lang] = 5 // Par défaut 5 étoiles pour les langues existantes
          })
        }
        console.log('🔄 [API UNIFIED] Languages parsed (array format):', result)
        return result
      }
      
      // Format corrompu détecté - nettoyage spécial
      if (raw.includes('{') && raw.includes('}')) {
        console.log('🔄 [API UNIFIED] Corrupted format detected, attempting cleanup...')
        try {
          // Essayer de parser comme JSON d'abord
          const parsed = JSON.parse(raw)
          if (typeof parsed === 'object' && !Array.isArray(parsed)) {
            const result: Record<string, number> = {}
            Object.entries(parsed).forEach(([key, value]) => {
              // Nettoyer les clés qui contiennent des guillemets et caractères spéciaux
              let cleanKey = key.replace(/^["']|["']$/g, '').replace(/\\"/g, '"')
              
              // Supprimer les clés qui sont des objets JSON stringifiés
              if (cleanKey.includes('{') || cleanKey.includes('}') || cleanKey.includes('\\')) {
                console.log('🔄 [API UNIFIED] Skipping corrupted key:', cleanKey)
                return
              }
              
              // Nettoyer les clés qui contiennent des guillemets supplémentaires
              cleanKey = cleanKey.replace(/^["']|["']$/g, '')
              
              if (typeof value === 'number' && cleanKey.length > 0) {
                result[cleanKey] = value
              }
            })
            console.log('🔄 [API UNIFIED] Languages parsed (corrupted JSON cleanup):', result)
            return result
          }
        } catch (e) {
          console.log('🔄 [API UNIFIED] JSON parse failed, trying CSV cleanup...')
        }
      }
      
      // CSV simple avec nettoyage
      const csvArray = raw.split(',').map((x: string) => x.trim()).filter(Boolean)
      const result: Record<string, number> = {}
      csvArray.forEach(entry => {
        // Essayer de parser "langue:rating" ou juste "langue"
        const colonMatch = entry.match(/^(.+):(\d+)$/)
        if (colonMatch) {
          const [, lang, rating] = colonMatch
          result[lang] = parseInt(rating, 10)
        } else {
          // Nettoyer les guillemets et caractères spéciaux
          const cleanLang = entry.replace(/^["']|["']$/g, '').replace(/\\"/g, '"')
          result[cleanLang] = 5 // Par défaut 5 étoiles
        }
      })
      console.log('🔄 [API UNIFIED] Languages parsed (CSV cleanup):', result)
      return result
    } catch (e) {
      console.log('🔄 [API UNIFIED] Languages parse error:', e, 'returning empty object')
      return {}
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

  // Parse des spécialités depuis practices (en excluant les équipements opt:)
  const rawSpecialties = parseStringArray(rawProfile.practices)
  const specialties = [...new Set(rawSpecialties)].filter(item => item && item.trim() !== '' && !item.startsWith('opt:'))

  // Parse des nouvelles options (avec fallback si champs manquants)
  const paymentMethods = parseStringArray((rawProfile as any).paymentMethods)

  console.log('🔄 [API UNIFIED] venueOptions brut:', (rawProfile as any).venueOptions, typeof (rawProfile as any).venueOptions)

  // Parsing spécial pour venueOptions qui contient un mélange srv: et opt:
  const rawVenueOptions = parseStringArray((rawProfile as any).venueOptions)
  console.log('🔄 [API UNIFIED] venueOptions parsées:', rawVenueOptions)

  // Séparer les vraies amenities (opt:) des services (srv:)
  const amenities = rawVenueOptions
    .filter(item => item && item.trim() !== '' && item.startsWith('opt:'))
    .map(item => item.replace(/^opt:/, '').trim())
    .filter(item => item !== '')

  // Déduplication des amenities
  const uniqueAmenities = [...new Set(amenities)]
  console.log('🔄 [API UNIFIED] amenities filtrées:', uniqueAmenities.length, 'éléments')

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

    // Nouvelles options (déplacées au niveau du profil pour cohérence)
    paymentMethods,
    amenities: uniqueAmenities,
    acceptedCurrencies,

    // Médias
    galleryPhotos: parseStringArray(rawProfile.galleryPhotos),
    videos: parseStringArray(rawProfile.videos),
    profilePhoto: rawProfile.profilePhoto || null,

    // Médias au format moderne pour le gestionnaire
    medias: (() => {
      const gallery = parseStringArray(rawProfile.galleryPhotos)
      const videos = parseStringArray(rawProfile.videos)
      
      const medias: any[] = []
      
      // Transformer les photos de galerie
      gallery.forEach((item, index) => {
        if (typeof item === 'object' && item.url) {
          medias.push({
            id: item.id || `media-${Date.now()}-${index}`,
            url: item.url,
            type: 'IMAGE',
            visibility: item.isPrivate ? 'PREMIUM' : 'PUBLIC',
            price: item.isPrivate ? 10 : undefined,
            createdAt: item.uploadedAt || new Date().toISOString(),
            views: 0,
            earnings: 0
          })
        }
      })
      
      // Transformer les vidéos
      videos.forEach((item, index) => {
        if (typeof item === 'object' && item.url) {
          medias.push({
            id: item.id || `video-${Date.now()}-${index}`,
            url: item.url,
            type: 'VIDEO',
            visibility: item.isPrivate ? 'PREMIUM' : 'PUBLIC',
            price: item.isPrivate ? 10 : undefined,
            createdAt: item.uploadedAt || new Date().toISOString(),
            views: 0,
            earnings: 0
          })
        }
      })
      
      return medias as any[]
    })(),

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
      weekendAvailable: !!rawProfile.weekendAvailable,
      agendaEnabled: rawProfile.agendaEnabled !== undefined ? !!rawProfile.agendaEnabled : false // Par défaut false
    },
    
    // Agenda activé (pour compatibilité avec l'API publique)
    agendaEnabled: rawProfile.agendaEnabled !== undefined ? !!rawProfile.agendaEnabled : false,

    // Clientèle
    clientele: {
      acceptsCouples: !!rawProfile.acceptsCouples,
      acceptsWomen: !!rawProfile.acceptsWomen,
      acceptsHandicapped: !!rawProfile.acceptsHandicapped,
      acceptsSeniors: !!rawProfile.acceptsSeniors
    },


    // Contact et visibilité (commun pour dashboard et public)
    contact: {
      phoneVisibility: rawProfile.phoneVisibility || 'hidden',
      phoneDisplayType: rawProfile.phoneDisplayType || 'hidden',
      phone: rawProfile.user?.phone || undefined
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

      // Agenda
      agendaEnabled: !!rawProfile.agendaEnabled,

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
    
    // Si c'est déjà un array, le retourner directement
    if (Array.isArray(value)) {
      return value
    }
    
    const str = String(value)
    
    // Protection contre les chaînes trop longues (éviter les boucles infinies)
    if (str.length > 10000) {
      console.warn('⚠️ [API UNIFIED] String trop longue détectée, tronquée:', str.substring(0, 100) + '...')
      return []
    }
    
    if (str.trim().startsWith('[')) {
      const parsed = JSON.parse(str)
      return Array.isArray(parsed) ? parsed : []
    }
    
    const result = str.split(',').map((x: string) => x.trim()).filter(Boolean)
    
    // Protection contre les arrays trop grands
    if (result.length > 1000) {
      console.warn('⚠️ [API UNIFIED] Array trop grand détecté, tronqué:', result.length, 'éléments')
      return result.slice(0, 1000)
    }
    
    return result
  } catch (error) {
    console.error('❌ [API UNIFIED] Erreur parseStringArray:', error)
    return []
  }
}