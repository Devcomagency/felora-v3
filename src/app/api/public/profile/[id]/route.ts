import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
        rateOvernight: true,
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
        tattoos: true,
        piercings: true,
        // Données service et disponibilité (champs existants uniquement)
        workingArea: true,
        availableNow: true,
        outcall: true,
        incall: true,
        weekendAvailable: true,
        minimumDuration: true,
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
        return Array.isArray(S) ? S : []
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

    // Construire les tarifs
    const rates = {
      rate1H: escort.rate1H || undefined,
      rate2H: escort.rate2H || undefined,
      overnight: escort.rateOvernight || undefined,
      currency: 'CHF'
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
      // Données physiques pour la modal
      physical: {
        height: escort.height || undefined,
        bodyType: escort.bodyType || undefined,
        hairColor: escort.hairColor || undefined,
        eyeColor: escort.eyeColor || undefined,
        ethnicity: escort.ethnicity || undefined,
        bustSize: escort.bustSize || undefined,
        tattoos: escort.tattoos || undefined,
        piercings: escort.piercings || undefined
      },
      // Données service et disponibilité
      availability: {
        availableNow: escort.availableNow || false,
        outcall: escort.outcall || false,
        incall: escort.incall || false,
        weekendAvailable: escort.weekendAvailable || false,
        minimumDuration: escort.minimumDuration || undefined,
        workingArea: escort.workingArea || undefined
      },
      age,
      updatedAt: escort.updatedAt
    }

    return NextResponse.json(profile)

  } catch (error) {
    console.error('api/public/profile/[id] error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
