import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateAvailability } from '@/lib/availability-calculator'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profileId = params.id

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

    // Calculer l'âge
    const age = (() => {
      try {
        return escort.dateOfBirth 
          ? new Date().getFullYear() - new Date(escort.dateOfBirth).getFullYear()
          : undefined
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

    // Construire la galerie media depuis les slots
    const media = gallerySlots
      .filter(slot => slot?.url) // Seulement les slots avec URL
      .map((slot, index) => ({
        id: slot.id || `slot-${index}`,
        type: slot.type === 'video' ? 'video' as const : 'image' as const,
        url: slot.url,
        thumb: slot.thumb || undefined,
        pos: slot.slot || index
      }))
      .sort((a, b) => a.pos - b.pos) // Trier par position

    // DEBUG: Log des médias parsés
    console.log(`[DEBUG] Profile ${profileId} - Found ${media.length} media from galleryPhotos:`, media)

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
      media,
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
        tattoos: escort.tattoos || undefined,
        piercings: escort.piercings || undefined,
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
        console.log(`[PROFILE ${profileId}] TimeSlots raw:`, escort.timeSlots)
        console.log(`[PROFILE ${profileId}] AvailableNow:`, escort.availableNow)

        const availability = calculateAvailability(
          escort.timeSlots,
          escort.availableNow || false
        )

        console.log(`[PROFILE ${profileId}] Calculated availability:`, availability)
        return availability
      })(),
      // Données agenda brutes pour la modal horaires
      scheduleData: (() => {
        try {
          const timeSlots = escort.timeSlots
          if (!timeSlots) return null
          return typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots
        } catch {
          return null
        }
      })(),
      age,
      updatedAt: escort.updatedAt
    }

    return NextResponse.json(profile)

  } catch (error) {
    console.error('api/public/profile/[id] error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
