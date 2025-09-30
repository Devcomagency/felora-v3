import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateAvailability, normalizeScheduleData } from '@/lib/availability-calculator'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileId } = await params

    console.log('🚨🚨🚨 [API PUBLIC PROFILE] CALLED WITH ID:', profileId)

    if (!profileId) {
      return NextResponse.json({ error: 'profile_id_required' }, { status: 400 })
    }

    // Récupérer le profil escort
    const escort = await prisma.escortProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        stageName: true,
        description: true,
        city: true,
        canton: true,
        isVerifiedBadge: true,
        hasProfilePhoto: true,
        profilePhoto: true,
        galleryPhotos: true, // AJOUT: récupérer les médias depuis galleryPhotos
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
        updatedAt: true,
        dateOfBirth: true,
        status: true,
        // Données physiques pour la modal "Voir plus"
        height: true,
        bodyType: true,
        hairColor: true,
        eyeColor: true,
        ethnicity: true,
        bustSize: true,
        breastType: true,
        tattoos: true,
        piercings: true,
        pubicHair: true,
        smoker: true,
        // Services et pratiques détaillés
        practices: true,
        orientation: true,
        acceptedClients: true,
        // Données service et disponibilité (champs existants uniquement)
        workingArea: true,
        availableNow: true,
        outcall: true,
        incall: true,
        weekendAvailable: true,
        minimumDuration: true,
        timeSlots: true,
        // Acceptations clients
        acceptsCouples: true,
        acceptsHandicapped: true,
        acceptsSeniors: true,
        acceptsWomen: true,
        // Stats (à implémenter plus tard)
        // likes: true,
        // views: true,
        // rating: true,
      }
    })

    if (!escort) {
      return NextResponse.json({ error: 'profile_not_found' }, { status: 404 })
    }

    // Parser les données JSON
    const languages = (() => {
      try {
        const L = JSON.parse(String(escort.languages || '[]'))
        return Array.isArray(L) ? L : []
      } catch {
        return []
      }
    })()

    const services = (() => {
      try {
        const S = JSON.parse(String(escort.services || '[]'))
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

        console.log(`[API PROFILE] Services for ${profileId}:`, {
          original: S,
          cleaned: cleanedServices
        })

        return cleanedServices
      } catch {
        return []
      }
    })()

    // Calculer l'âge avec précision (même logique que le dashboard)
    const age = (() => {
      try {
        if (!escort.dateOfBirth) return undefined
        const today = new Date()
        const birthDate = new Date(escort.dateOfBirth)
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

    // Parser les médias depuis galleryPhotos (système slots 0-5)
    let gallerySlots: any[] = []
    try {
      gallerySlots = Array.isArray(escort.galleryPhotos)
        ? escort.galleryPhotos
        : JSON.parse(String(escort.galleryPhotos || '[]'))
    } catch {
      gallerySlots = []
    }

    // DEBUG: Log pour voir ce qui est dans galleryPhotos
    console.log(`[DEBUG] Profile ${profileId} - galleryPhotos:`, gallerySlots)

    // Fonction pour détecter le type de média basé sur l'URL
    const detectMediaType = (url: string): 'video' | 'image' => {
      if (!url) return 'image'
      const lowerUrl = url.toLowerCase()
      const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v']
      return videoExtensions.some(ext => lowerUrl.includes(ext)) ? 'video' : 'image'
    }

    // Construire la galerie media depuis les slots
    const media = gallerySlots
      .filter(slot => slot?.url) // Seulement les slots avec URL
      .map((slot, index) => {
        const detectedType = detectMediaType(slot.url)
        return {
          id: slot.id || `slot-${index}`,
          type: detectedType, // Utiliser la détection automatique
          url: slot.url,
          thumb: slot.thumb || undefined,
          pos: slot.slot || index,
          isPrivate: Boolean(slot.isPrivate || (typeof slot.visibility === 'string' && slot.visibility.toUpperCase() === 'PRIVATE')),
          price: typeof slot.price === 'number'
            ? slot.price
            : typeof slot.price === 'string' && slot.price.trim() !== ''
              ? Number(slot.price)
              : undefined
        }
      })
      .sort((a, b) => a.pos - b.pos) // Trier par position

    // DEBUG: Log des médias parsés
    console.log(`[DEBUG] Profile ${profileId} - Found ${media.length} media from galleryPhotos:`, media)

    // Récupérer aussi les médias depuis la table Media (nouveau système)
    const mediaFromTable = await prisma.media.findMany({
      where: {
        ownerType: 'ESCORT',
        ownerId: profileId
      },
      orderBy: { createdAt: 'desc' }
    })

    // Ajouter les médias de la table Media à la liste existante
    const mediaFromTableFormatted = mediaFromTable.map(mediaItem => {
      const detectedType = detectMediaType(mediaItem.url)
      return {
        id: mediaItem.id,
        type: detectedType,
        url: mediaItem.url,
        thumb: mediaItem.thumbUrl || undefined,
        pos: mediaItem.pos,
        isPrivate: mediaItem.visibility === 'PRIVATE',
        price: undefined // Pas de prix pour les médias de la table Media pour l'instant
      }
    })

    // Combiner les médias (galleryPhotos + table Media)
    const allMedia = [...media, ...mediaFromTableFormatted]
      .sort((a, b) => a.pos - b.pos)

    console.log(`[DEBUG] Profile ${profileId} - Total media: ${allMedia.length} (${media.length} from galleryPhotos + ${mediaFromTableFormatted.length} from Media table)`)

    const normalizedSchedule = normalizeScheduleData(escort.timeSlots)

    // Construire les tarifs (tous les tarifs disponibles)
    const rates = {
      rate1H: escort.rate1H || undefined,
      rate2H: escort.rate2H || undefined,
      rateHalfDay: escort.rateHalfDay || undefined,
      rateFullDay: escort.rateFullDay || undefined,
      overnight: escort.rateOvernight || undefined,
      currency: escort.currency || 'CHF'
    }

    // Construire les stats (placeholder pour l'instant)
    const stats = {
      likes: 0, // À implémenter plus tard
      views: 0, // À implémenter plus tard
      rating: 0 // À implémenter plus tard
    }

    const profile = {
      id: escort.id,
      stageName: escort.stageName || '',
      bio: escort.description || undefined,
      city: escort.city || undefined,
      canton: escort.canton || undefined,
      isVerifiedBadge: !!escort.isVerifiedBadge,
      media: allMedia,
      stats,
      services,
      languages,
      rates,
      // Données physiques pour la modal (complètes)
      physical: {
        height: escort.height || undefined,
        bodyType: escort.bodyType || undefined,
        hairColor: escort.hairColor || undefined,
        eyeColor: escort.eyeColor || undefined,
        ethnicity: escort.ethnicity || undefined,
        bustSize: escort.bustSize || undefined,
        breastType: escort.breastType || undefined,
        tattoos: escort.tattoos === 'true' ? true : (escort.tattoos === 'false' ? false : undefined),
        piercings: escort.piercings === 'true' ? true : (escort.piercings === 'false' ? false : undefined),
        pubicHair: escort.pubicHair || undefined,
        smoker: escort.smoker || undefined
      },
      // Pratiques et services détaillés
      practices: (() => {
        try {
          const P = JSON.parse(String(escort.practices || '[]'))
          return Array.isArray(P) ? P : []
        } catch {
          return []
        }
      })(),
      orientation: escort.orientation || undefined,
      // Clientèle acceptée
      clientele: {
        acceptedClients: escort.acceptedClients || undefined,
        acceptsCouples: escort.acceptsCouples || false,
        acceptsHandicapped: escort.acceptsHandicapped || false,
        acceptsSeniors: escort.acceptsSeniors || false,
        acceptsWomen: escort.acceptsWomen || false
      },
      // Données service et disponibilité (enrichies)
      availability: {
        availableNow: escort.availableNow || false,
        outcall: escort.outcall || false,
        incall: escort.incall || false,
        weekendAvailable: escort.weekendAvailable || false,
        minimumDuration: escort.minimumDuration || undefined,
        timeSlots: (() => {
          try {
            const T = JSON.parse(String(escort.timeSlots || '[]'))
            return Array.isArray(T) ? T : []
          } catch {
            return []
          }
        })(),
        workingArea: escort.workingArea || undefined
      },
      // Calcul de disponibilité en temps réel basé sur l'agenda
      realTimeAvailability: (() => {
        console.log(`🚨🚨🚨 [PROFILE ${profileId}] DONNÉES DISPONIBILITÉ DEPUIS BASE:`)
        console.log(`[PROFILE ${profileId}] availableNow (base):`, escort.availableNow)
        console.log(`[PROFILE ${profileId}] timeSlots (base):`, escort.timeSlots)
        console.log(`[PROFILE ${profileId}] weekendAvailable (base):`, escort.weekendAvailable)

        const availability = calculateAvailability(
          normalizedSchedule ?? escort.timeSlots,
          escort.availableNow || false
        )

        console.log(`🚨🚨🚨 [PROFILE ${profileId}] RÉSULTAT CALCUL DISPONIBILITÉ:`, availability)
        console.log(`🚨🚨🚨 [AVAILABILITY FINAL] isAvailable: ${availability.isAvailable}, status: ${availability.status}, message: "${availability.message}"`)
        return availability
      })(),
      // Données agenda brutes pour la modal horaires
      scheduleData: normalizedSchedule,
      age,
      updatedAt: escort.updatedAt
    }

    console.log('🚨🚨🚨 [API PUBLIC PROFILE] RETURNING realTimeAvailability:', profile.realTimeAvailability)
    console.log('🚨🚨🚨 [API PUBLIC PROFILE] RETURNING scheduleData:', profile.scheduleData)

    return NextResponse.json(profile)

  } catch (error) {
    console.error('api/public/profile/[id] error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
