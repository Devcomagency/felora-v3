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
        overnightRate: true,
        currency: true,
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

    // Construire la galerie media
    const media = []
    if (escort.profilePhoto) {
      media.push({
        id: 'profile-photo',
        type: 'IMAGE' as const,
        url: escort.profilePhoto
      })
    }

    // Construire les tarifs
    const rates = {
      rate1H: escort.rate1H || undefined,
      rate2H: escort.rate2H || undefined,
      overnight: escort.overnightRate || undefined,
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
      updatedAt: escort.updatedAt
    }

    return NextResponse.json(profile)

  } catch (error) {
    console.error('api/public/profile/[id] error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
