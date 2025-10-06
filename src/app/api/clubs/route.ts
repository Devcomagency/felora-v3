import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('[API CLUBS] Request started:', request.url)

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = Math.max(0, parseInt(searchParams.get('cursor') || '0'))
    const q = (searchParams.get('q') || '').trim()
    const city = (searchParams.get('city') || '').trim()
    const establishmentType = (searchParams.get('establishmentType') || '').trim()

    console.log('[API CLUBS] Params:', { limit, offset, q, city, establishmentType })

    // Construire les conditions de recherche
    const whereConditions: any = {
      // Seulement les clubs actifs
      details: {
        isActive: true
      }
    }

    // Recherche textuelle
    if (q) {
      whereConditions.OR = [
        { companyName: { contains: q, mode: 'insensitive' as const } },
        { 
          details: {
            name: { contains: q, mode: 'insensitive' as const }
          }
        },
        { 
          details: {
            description: { contains: q, mode: 'insensitive' as const }
          }
        }
      ]
    }

    // Filtre par ville
    if (city) {
      whereConditions.details = {
        ...whereConditions.details,
        city: { contains: city, mode: 'insensitive' as const }
      }
    }

    // Filtre par type d'établissement
    if (establishmentType) {
      whereConditions.details = {
        ...whereConditions.details,
        establishmentType: { equals: establishmentType }
      }
    }

    console.log('[API CLUBS] Where conditions:', whereConditions)

    // Récupérer les clubs avec leurs détails et médias
    const clubs = await prisma.clubProfileV2.findMany({
      where: whereConditions,
      include: {
        details: true,
        services: true,
        user: {
          select: {
            email: true,
            phoneE164: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Récupérer les médias pour chaque club
    const clubsWithMedia = await Promise.all(
      clubs.map(async (club) => {
        const media = await prisma.media.findMany({
          where: {
            ownerType: 'CLUB',
            ownerId: club.id
          },
          orderBy: { pos: 'asc' }
        })
        
        return {
          ...club,
          media
        }
      })
    )

    console.log('[API CLUBS] Found clubs:', clubsWithMedia.length)

    // Formater les données pour le frontend
    const formattedClubs = clubsWithMedia.map(club => {
      // Trouver la photo de profil (pos=0) et la photo de couverture (pos=1)
      const profilePhoto = club.media.find(m => m.pos === 0)
      const coverPhoto = club.media.find(m => m.pos === 1)
      
      return {
        id: club.id,
        name: club.details?.name || club.companyName,
        handle: club.handle,
        avatar: profilePhoto?.url || club.details?.avatarUrl || `https://picsum.photos/seed/club-${club.id}/300/300`,
        cover: coverPhoto?.url || club.details?.coverUrl || `https://picsum.photos/seed/cover-${club.id}/600/400`,
        city: club.details?.city || '',
        description: club.details?.description || '',
        establishmentType: club.details?.establishmentType || 'club',
        address: club.details?.address || '',
        openingHours: club.details?.openingHours || '',
        website: club.details?.websiteUrl || '',
        email: club.details?.email || club.user?.email || '',
        phone: club.details?.phone || club.user?.phoneE164 || '',
        verified: club.verified || false,
        isActive: club.details?.isActive || false,
        capacity: club.details?.capacity || null,
        latitude: club.details?.latitude || null,
        longitude: club.details?.longitude || null,
        services: {
          languages: club.services?.languages || [],
          services: club.services?.services || [],
          equipments: club.services?.equipments || [],
          isOpen24_7: club.services?.isOpen24_7 || false
        },
        stats: {
          views: Math.floor(Math.random() * 1000) + 100, // Mock data pour l'instant
          likes: Math.floor(Math.random() * 500) + 50,
          reviews: Math.floor(Math.random() * 100) + 10
        },
        createdAt: club.createdAt,
        updatedAt: club.updatedAt
      }
    })

    // Compter le total pour la pagination
    const total = await prisma.clubProfileV2.count({
      where: whereConditions
    })

    console.log('[API CLUBS] Success:', { count: formattedClubs.length, total })

    return NextResponse.json({
      success: true,
      data: formattedClubs,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('[API CLUBS] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des clubs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
