import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateAvailability, normalizeScheduleData } from '@/lib/availability-calculator'
import { stableMediaId } from '@/lib/reactions/stableMediaId'

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
        userId: true,
        stageName: true,
        description: true,
        city: true,
        canton: true,
        category: true,
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
        // Stats
        likes: true,
        views: true,
        rating: true,
        totalLikes: true,
        totalReacts: true,
      }
    })

    if (!escort) {
      return NextResponse.json({ error: 'profile_not_found' }, { status: 404 })
    }

    // Parser les données JSON - Format unifié avec étoiles
    const languages = (() => {
      try {
        const raw = String(escort.languages || '')
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
          return result
        }
        
        // CSV simple
        const csvArray = raw.split(',').map((x: string) => x.trim()).filter(Boolean)
        const result: Record<string, number> = {}
        csvArray.forEach(lang => {
          result[lang] = 5 // Par défaut 5 étoiles pour les langues existantes
        })
        return result
      } catch {
        return {}
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
        // Déterminer la visibilité
        const visibility = typeof slot.visibility === 'string'
          ? slot.visibility.toUpperCase()
          : slot.isPrivate
            ? 'PRIVATE'
            : 'PUBLIC'

        return {
          id: slot.id || `slot-${index}`,
          type: detectedType, // Utiliser la détection automatique
          url: slot.url,
          thumb: slot.thumb || undefined,
          pos: slot.slot || index,
          visibility: visibility,
          isPrivate: visibility === 'PRIVATE',
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
        ownerId: profileId,
        deletedAt: null // Exclure les médias supprimés
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
        visibility: mediaItem.visibility || 'PUBLIC',
        isPrivate: mediaItem.visibility === 'PRIVATE',
        price: mediaItem.price || undefined,
        createdAt: mediaItem.createdAt
      }
    })

    // Combiner les médias (galleryPhotos + table Media)
    // IMPORTANT: Trier par position ASC (pos 0 = avatar, pos 1 = profil, pos >= 2 = feed)
    const allMedia = [...mediaFromTableFormatted, ...media]
      .sort((a, b) => {
        // Priorité 1: Trier par position (ASC)
        // pos 0 doit être en premier (avatar dashboard)
        if (a.pos !== b.pos) {
          return a.pos - b.pos
        }
        // Priorité 2: Si même position, trier par date DESC
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return 0
      })

    console.log(`[DEBUG] Profile ${profileId} - Total media: ${allMedia.length} (${media.length} from galleryPhotos + ${mediaFromTableFormatted.length} from Media table)`)
    console.log(`[DEBUG] Profile ${profileId} - First 3 media:`, allMedia.slice(0, 3).map(m => ({ pos: m.pos, type: m.type, url: m.url?.substring(0, 60) })))

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

    // Récupérer tous les médias de cet escort avec leurs URLs (table media)
    const escortMedia = await prisma.media.findMany({
      where: {
        ownerType: 'ESCORT',
        ownerId: profileId,
        deletedAt: null // Exclure les médias supprimés
      },
      select: { id: true, url: true }
    })

    // Récupérer aussi les médias depuis galleryPhotos (ancien système)
    let galleryPhotosUrls: string[] = []
    try {
      const gallerySlots = Array.isArray(escort.galleryPhotos)
        ? escort.galleryPhotos
        : JSON.parse(String(escort.galleryPhotos || '[]'))

      galleryPhotosUrls = gallerySlots
        .filter((slot: any) => slot?.url)
        .map((slot: any) => slot.url)
    } catch {
      galleryPhotosUrls = []
    }

    // Utiliser UNIQUEMENT les médias du feed qui seront réellement retournés
    // (exclure photo de profil et utiliser la même logique que le retour)
    const feedMedia = allMedia.slice(1) // Exclure le premier média (photo de profil)
    const allMediaIds: string[] = []

    // Ajouter les médias du feed qui sont réellement visibles
    for (const mediaItem of feedMedia) {
      // Ajouter l'ID brut si disponible (pour les médias de la table Media)
      if (mediaItem.id && mediaItem.id !== `slot-${feedMedia.indexOf(mediaItem)}`) {
        allMediaIds.push(mediaItem.id)
      }
      
      // Ajouter le hash basé sur URL (pour tous les médias)
      const hashId = stableMediaId({ rawId: null, profileId, url: mediaItem.url })
      allMediaIds.push(hashId)
    }

    console.log(`🔥 [PROFILE API] Feed media count: ${feedMedia.length}`)
    console.log(`🔥 [PROFILE API] Feed media IDs:`, feedMedia.map(m => m.id))

    // Dédupliquer
    const uniqueMediaIds = [...new Set(allMediaIds)]

    console.log(`🔥 [PROFILE API] Found ${allMedia.length} total media (${media.length} from galleryPhotos + ${mediaFromTableFormatted.length} from Media table)`)
    console.log(`🔥 [PROFILE API] Using ${feedMedia.length} feed media (excluding profile photo)`)
    console.log(`🔥 [PROFILE API] Generated ${uniqueMediaIds.length} unique mediaIds for feed (IDs + hashes)`)
    console.log(`🔥 [PROFILE API] Sample mediaIds:`, uniqueMediaIds.slice(0, 3))

    // DEBUG: Trouver TOUS les mediaIds qui ont des réactions avec leurs URLs
    const allReactionsWithMedia = await prisma.reaction.findMany({
      select: {
        mediaId: true,
        type: true,
        media: {
          select: {
            url: true,
            ownerId: true,
            ownerType: true
          }
        }
      }
    })

    console.log(`🔥 [DEBUG] Total ${allReactionsWithMedia.length} réactions dans la base`)

    // Trouver les réactions qui correspondent potentiellement à ce profil par ownerId
    const profileReactionsByOwnerId = allReactionsWithMedia.filter(r =>
      r.media?.ownerType === 'ESCORT' && r.media?.ownerId === profileId
    )

    console.log(`🔥 [DEBUG] ${profileReactionsByOwnerId.length} réactions avec media.ownerId = ${profileId}`)

    // Extraire les mediaIds uniques qui ont des réactions
    const allReactionMediaIds = [...new Set(allReactionsWithMedia.map(r => r.mediaId))]
    console.log(`🔥 [DEBUG] ${allReactionMediaIds.length} mediaIds uniques avec réactions`)

    // Voir combien de ces mediaIds correspondent aux nôtres
    const matchingIds = allReactionMediaIds.filter(id => allMediaIds.includes(id))
    console.log(`🔥 [DEBUG] ${matchingIds.length} mediaIds correspondent à nos médias générés`)
    console.log(`🔥 [DEBUG] MediaIds qui matchent:`, matchingIds)

    // Afficher les mediaIds qui ne matchent PAS mais qui ont des réactions
    const nonMatchingIds = allReactionMediaIds.filter(id => !allMediaIds.includes(id))
    console.log(`🔥 [DEBUG] ${nonMatchingIds.length} mediaIds avec réactions mais qui ne matchent PAS`)
    console.log(`🔥 [DEBUG] MediaIds qui ne matchent pas:`, nonMatchingIds.slice(0, 5))

    // Comparer les URLs
    const mediaUrlsMap = new Map(escortMedia.map(m => [m.id, m.url]))
    console.log(`🔥 [DEBUG] URLs de nos médias (table media):`)
    escortMedia.forEach(m => {
      console.log(`  - ${m.id}: ${m.url}`)
    })

    console.log(`🔥 [DEBUG] URLs dans galleryPhotos:`)
    galleryPhotosUrls.forEach((url, i) => {
      console.log(`  - slot ${i}: ${url}`)
    })

    // Compter TOUTES les réactions peu importe le mediaId, juste pour voir
    const [totalLikes, totalReacts] = await Promise.all([
      prisma.reaction.count({ where: { type: 'LIKE' } }),
      prisma.reaction.count({ where: { NOT: { type: 'LIKE' } } })
    ])

    console.log(`🔥 [DEBUG] Total global: ${totalLikes} likes, ${totalReacts} reactions`)

    // Compter TOUTES les réactions du profil (sans doublons)
    
    // 1. Réactions via media.ownerId
    const reactionsViaOwner = await prisma.reaction.findMany({
      where: {
        media: {
          ownerId: profileId,
          ownerType: 'ESCORT'
        }
      },
      select: { 
        id: true,
        type: true 
      }
    })
    
    // 2. Réactions via mediaIds directs (nouveau système)
    const reactionsViaMediaIds = await prisma.reaction.findMany({
      where: {
        mediaId: { in: uniqueMediaIds }
      },
      select: { 
        id: true,
        type: true 
      }
    })
    
    // 3. Combiner et dédupliquer par ID
    const allReactionsMap = new Map()
    
    // Ajouter les réactions via ownerId
    reactionsViaOwner.forEach(r => {
      allReactionsMap.set(r.id, r)
    })
    
    // Ajouter les réactions via mediaIds (sans écraser)
    reactionsViaMediaIds.forEach(r => {
      if (!allReactionsMap.has(r.id)) {
        allReactionsMap.set(r.id, r)
      }
    })
    
    // 4. Convertir en array et compter
    const allReactions = Array.from(allReactionsMap.values())
    const likeCount = allReactions.filter(r => r.type === 'LIKE').length
    const reactCount = allReactions.filter(r => r.type !== 'LIKE').length
    
    console.log(`🔥 [PROFILE API] Réactions via ownerId: ${reactionsViaOwner.length}`)
    console.log(`🔥 [PROFILE API] Réactions via mediaIds: ${reactionsViaMediaIds.length}`)
    console.log(`🔥 [PROFILE API] Total réactions: ${allReactions.length} (${likeCount} likes + ${reactCount} autres)`)

    const stats = {
      likes: likeCount || 0,
      views: escort.views || 0,
      rating: escort.rating || 0,
      reactions: reactCount || 0
    }

    console.log(`🔥 [PROFILE API] Stats calculés pour ${profileId}:`, stats)

    const profile = {
      id: escort.id,
      userId: escort.userId,
      stageName: escort.stageName || '',
      bio: escort.description || undefined,
      city: escort.city || undefined,
      canton: escort.canton || undefined,
      category: escort.category || undefined,
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
      agendaEnabled: true,
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
