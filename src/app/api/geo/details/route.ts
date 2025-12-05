import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    // Récupérer les vraies données depuis la base
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { id },
      include: {
        user: true // Inclure les données utilisateur
      }
    })

    if (escortProfile) {
      // Récupérer les médias réels
      const media = await prisma.media.findMany({
        where: {
          ownerType: 'escort',
          ownerId: escortProfile.userId,
          isActive: true
        },
        select: {
          id: true,
          type: true,
          url: true,
          thumbUrl: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      // Calculer l'âge si dateOfBirth existe
      let age = null
      if (escortProfile.dateOfBirth) {
        const today = new Date()
        const birthDate = new Date(escortProfile.dateOfBirth)
        age = today.getFullYear() - birthDate.getFullYear()
      }

      // Formater les données pour l'interface
      const details = {
        id: escortProfile.id,
        displayName: escortProfile.stageName || escortProfile.firstName || 'Escort',
        handle: `@${escortProfile.stageName?.toLowerCase().replace(/\s+/g, '_') || escortProfile.firstName?.toLowerCase() || 'escort'}`,
        avatar: escortProfile.profilePhoto || media[0]?.thumbUrl || media[0]?.url || '/default-avatar.svg',
        city: escortProfile.city || '—',
        description: escortProfile.description || 'Profil d\'escort professionnel',
        verified: !!escortProfile.isVerifiedBadge,
        age,
        media: media.map(m => ({
          type: m.type,
          url: m.url,
          thumbUrl: m.thumbUrl
        })),
        services: (() => {
          try {
            return JSON.parse(escortProfile.services || '[]')
          } catch {
            return []
          }
        })(),
        languages: (() => {
          try {
            return JSON.parse(escortProfile.languages || '[]')
          } catch {
            return ['Français']
          }
        })(),
        practices: (() => {
          try {
            const services = JSON.parse(escortProfile.services || '[]')
            return ['Escort', ...services, 'Compagnie'].slice(0, 5)
          } catch {
            return ['Escort', 'Compagnie']
          }
        })(),
        rating: 0, // Pas encore implémenté
        reviews: 0, // Pas encore implémenté
        priceRange: escortProfile.rate1H || undefined
      }

      return NextResponse.json(details)
    }

    // Profil non trouvé
    return NextResponse.json({ 
      error: 'Profil non trouvé' 
    }, { status: 404 })
  } catch (error: any) {
    console.error('Geo details error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}