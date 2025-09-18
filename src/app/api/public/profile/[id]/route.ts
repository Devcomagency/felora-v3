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

    // Récupérer tous les médias du profil depuis la table Media
    const mediaItems = await prisma.media.findMany({
      where: {
        ownerId: profileId,
        ownerType: 'ESCORT',
        visibility: 'PUBLIC' // Seulement les médias publics
      },
      orderBy: {
        pos: 'asc' // Trier par position (médias obligatoires 1-6)
      },
      select: {
        id: true,
        type: true,
        url: true,
        thumbUrl: true,
        pos: true
      }
    })

    // Construire la galerie media
    const media = mediaItems.map(item => ({
      id: item.id,
      type: item.type === 'IMAGE' ? 'image' as const : 'video' as const,
      url: item.url,
      thumb: item.thumbUrl || undefined,
      pos: item.pos || 0
    }))

    // Si pas de médias dans la table Media, fallback sur profilePhoto
    if (media.length === 0 && escort.profilePhoto) {
      media.push({
        id: 'profile-photo',
        type: 'image' as const,
        url: escort.profilePhoto,
        thumb: undefined,
        pos: 1
      })
    }

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
      updatedAt: escort.updatedAt
    }

    return NextResponse.json(profile)

  } catch (error) {
    console.error('api/public/profile/[id] error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
