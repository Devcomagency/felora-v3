import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isClubOpenNow } from '@/lib/club-utils'

/**
 * Construit l'URL complète d'un média
 * - URLs complètes (http/https) : retournées telles quelles
 * - Chemins locaux (/uploads/) : retournés tels quels (servis depuis public/)
 * - Chemins R2 (/profiles/, /clubs/, /media/) : préfixés avec le domaine R2
 */
function buildMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null

  // Si c'est déjà une URL complète (http ou https), on la retourne telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // Chemins R2 : on ajoute le domaine R2
  // Note: /uploads/ est exclu car les fichiers sont stockés localement dans public/
  const R2_PATHS = ['/profiles/', '/clubs/', '/media/']
  const isR2Path = R2_PATHS.some(prefix => url.startsWith(prefix))

  if (isR2Path) {
    const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL ||
                          process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL ||
                          'https://media.felora.ch'
    return `${R2_PUBLIC_URL}${url}`
  }

  // Autres chemins (fichiers locaux comme /uploads/) : retourner tel quel
  return url
}

export const dynamic = 'force-dynamic' // Désactiver le cache pour rafraîchir les images
export const revalidate = 0 // Pas de revalidation, toujours frais

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
          orderBy: [
            { pos: 'asc' },
            { createdAt: 'desc' } // Plus récent en premier pour chaque position
          ],
          select: {
            id: true,
            ownerType: true,
            ownerId: true,
            type: true,
            url: true,
            thumbUrl: true,
            description: true,
            visibility: true,
            price: true,
            pos: true,
            likeCount: true,
            reactCount: true,
            createdAt: true,
            updatedAt: true // ✅ IMPORTANT pour le cache-buster
          }
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

      // Construire les URLs - privilégier TOUJOURS les médias de la table Media
      // Ajouter un cache-buster basé sur l'ID + updatedAt du média pour forcer le refresh
      let avatarUrl = profilePhoto?.url
        ? buildMediaUrl(profilePhoto.url)
        : (club.details?.avatarUrl ? buildMediaUrl(club.details.avatarUrl) : `https://picsum.photos/seed/club-${club.id}/300/300`)
      
      // ✅ IMPORTANT : Utiliser updatedAt pour que le cache se rafraîchisse quand on modifie un média
      if (avatarUrl && profilePhoto) {
        const timestamp = profilePhoto.updatedAt ? new Date(profilePhoto.updatedAt).getTime() : Date.now()
        const separator = avatarUrl.includes('?') ? '&' : '?'
        avatarUrl = `${avatarUrl}${separator}cb=${profilePhoto.id}_${timestamp}`
      }

      let coverUrl = coverPhoto?.url
        ? buildMediaUrl(coverPhoto.url)
        : (club.details?.coverUrl ? buildMediaUrl(club.details.coverUrl) : `https://picsum.photos/seed/cover-${club.id}/600/400`)

      // ✅ IMPORTANT : Utiliser updatedAt pour que le cache se rafraîchisse quand on modifie un média
      if (coverUrl && coverPhoto) {
        const timestamp = coverPhoto.updatedAt ? new Date(coverPhoto.updatedAt).getTime() : Date.now()
        const separator = coverUrl.includes('?') ? '&' : '?'
        coverUrl = `${coverUrl}${separator}cb=${coverPhoto.id}_${timestamp}`
      }

      // ✅ Calculer si le club est ouvert maintenant basé sur les vrais horaires
      const isOpenNow = isClubOpenNow(
        club.services?.openingHours || null,
        club.services?.isOpen24_7 || false
      )

      return {
        id: club.id,
        name: club.details?.name || club.companyName,
        handle: club.handle,
        avatar: avatarUrl,
        cover: coverUrl,
        city: club.details?.city || '',
        description: club.details?.description || '',
        establishmentType: club.details?.establishmentType || 'club',
        address: club.details?.address || '',
        openingHours: club.details?.openingHours || '',
        website: club.details?.websiteUrl || '',
        email: club.details?.email || club.user?.email || '',
        phone: club.details?.phone || club.user?.phoneE164 || '',
        verified: club.verified || false,
        isActive: isOpenNow, // ✅ Utiliser le vrai statut d'ouverture
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
