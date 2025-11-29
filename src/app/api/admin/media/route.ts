import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'
import { validateMediaUrl } from '@/lib/media/enhanced-cdn'

export async function GET(request: NextRequest) {
  // ✅ Vérification d'authentification admin
  const authError = await requireAdminAuth()
  if (authError) return authError

  try {
    const searchParams = request.nextUrl.searchParams
    const ownerType = searchParams.get('ownerType')
    const visibility = searchParams.get('visibility')
    const reported = searchParams.get('reported') === 'true'
    const search = searchParams.get('search') || ''

    console.log('[ADMIN MEDIA] Request params:', { ownerType, visibility, reported, search })

    // Build where clause
    const where: any = {
      deletedAt: null // Ne pas afficher les médias supprimés
    }

    if (ownerType && ownerType !== 'ALL') {
      where.ownerType = ownerType
    }

    if (visibility && visibility !== 'ALL') {
      where.visibility = visibility
    }

    if (reported) {
      where.reportCount = { gt: 0 }
    }

    console.log('[ADMIN MEDIA] Where clause:', where)

    // ✅ FIX: Si on recherche par nom de propriétaire, on doit d'abord chercher les owners
    let ownerIds: string[] = []
    if (search) {
      // Rechercher les escorts qui matchent
      const matchingEscorts = await prisma.escortProfile.findMany({
        where: {
          OR: [
            { stageName: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } }
          ]
        },
        select: { id: true }
      })

      // Rechercher les clubs qui matchent
      const matchingClubs = await prisma.clubProfile.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { handle: { contains: search, mode: 'insensitive' } }
          ]
        },
        select: { id: true }
      })

      ownerIds = [...matchingEscorts.map(e => e.id), ...matchingClubs.map(c => c.id)]
      console.log(`[ADMIN MEDIA] Found ${matchingEscorts.length} escorts and ${matchingClubs.length} clubs matching "${search}"`)

      // Ajouter la condition de recherche
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        ...(ownerIds.length > 0 ? [{ ownerId: { in: ownerIds } }] : [])
      ]
    }

    // ✅ OPTIMISATION : Récupérer tous les médias + owners en UNE SEULE requête
    const mediaItems = await prisma.media.findMany({
      where,
      orderBy: [
        { reportCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 200, // ✅ Augmenté à 200 pour voir plus de médias
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
        likeCount: true,
        reactCount: true,
        reportCount: true,
        reportedAt: true,
        createdAt: true
      }
    })

    console.log(`[ADMIN MEDIA] Found ${mediaItems.length} media items`)

    // ✅ Extraire les IDs uniques des escorts et clubs
    const escortIds = [...new Set(
      mediaItems
        .filter(m => m.ownerType === 'ESCORT' && m.ownerId && m.ownerId !== 'unknown')
        .map(m => m.ownerId)
    )]

    const clubIds = [...new Set(
      mediaItems
        .filter(m => m.ownerType === 'CLUB' && m.ownerId && m.ownerId !== 'unknown')
        .map(m => m.ownerId)
    )]

    console.log(`[ADMIN MEDIA] Fetching ${escortIds.length} escorts and ${clubIds.length} clubs`)

    // ✅ Récupérer TOUS les escorts et clubs en 2 requêtes seulement
    const escorts = escortIds.length > 0 ? await prisma.escortProfile.findMany({
      where: { id: { in: escortIds } },
      select: {
        id: true,
        stageName: true,
        firstName: true,
        userId: true
      }
    }) : []

    const clubs = clubIds.length > 0 ? await prisma.clubProfile.findMany({
      where: { id: { in: clubIds } },
      select: {
        id: true,
        name: true,
        handle: true,
        userId: true
      }
    }) : []

    // ✅ Créer des Maps pour accès O(1)
    const escortMap = new Map(escorts.map(e => [e.id, e]))
    const clubMap = new Map(clubs.map(c => [c.id, c]))

    // ✅ FILTRER : Ne garder que les médias avec des propriétaires ACTIFS
    const mediaWithValidOwners = mediaItems.filter(m => {
      // ❌ Filtrer les médias avec ownerId "unknown" (données corrompues)
      if (m.ownerId === 'unknown') return false

      if (m.ownerType === 'ESCORT') {
        return escortMap.has(m.ownerId) // Escort existe
      }

      if (m.ownerType === 'CLUB') {
        return clubMap.has(m.ownerId) // Club existe
      }

      return false
    })

    console.log(`[ADMIN MEDIA] Filtered to ${mediaWithValidOwners.length} media with valid owners (removed ${mediaItems.length - mediaWithValidOwners.length} orphaned media)`)

    // Helper function to validate and clean URLs
    const cleanUrl = (url: string | null): string | null => {
      if (!url) return null

      // Filter out invalid URLs
      if (url.startsWith('media:') ||
          url.startsWith('blob:') ||
          (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/'))) {
        console.warn(`[ADMIN MEDIA] Invalid URL filtered: ${url.substring(0, 50)}`)
        return null
      }

      return url
    }

    // ✅ Enrichir les médias avec propriétaires VALIDES seulement
    const enrichedMedia = mediaWithValidOwners.map((m) => {
      let owner = null

      if (m.ownerType === 'ESCORT' && m.ownerId) {
        const escort = escortMap.get(m.ownerId)
        if (escort) {
          owner = {
            name: escort.firstName || 'Unknown',
            stageName: escort.stageName || 'Unknown',
            userId: escort.userId
          }
        } else {
          console.warn(`[ADMIN MEDIA] Escort not found for media ${m.id}, ownerId: ${m.ownerId}`)
        }
      } else if (m.ownerType === 'CLUB' && m.ownerId) {
        const club = clubMap.get(m.ownerId)
        if (club) {
          owner = {
            name: club.name || 'Unknown',
            stageName: club.name || 'Unknown', // Pour cohérence avec l'affichage
            slug: club.handle,
            userId: club.userId
          }
        } else {
          console.warn(`[ADMIN MEDIA] Club not found for media ${m.id}, ownerId: ${m.ownerId}`)
        }
      }

      // Default to better fallback if no owner found
      if (!owner) {
        if (m.ownerId === 'unknown') {
          owner = { name: 'Propriétaire non défini', stageName: 'Non défini' }
        } else {
          // Orphaned record - club/escort was deleted
          owner = {
            name: `${m.ownerType === 'CLUB' ? 'Club' : 'Escort'} supprimé`,
            stageName: 'Compte supprimé',
            deleted: true
          }
        }
      }

      // Clean URLs
      const cleanedUrl = cleanUrl(m.url)
      const cleanedThumbUrl = cleanUrl(m.thumbUrl)

      // Choose appropriate placeholder
      const isVideo = m.type.includes('video')
      const mediaType = isVideo ? 'video' : 'image'
      const fallbackUrl = isVideo ? '/placeholder-video.svg' : '/placeholder-image.svg'

      // ✅ Valider et corriger les URLs avec le CDN
      const validatedUrl = cleanedUrl ? validateMediaUrl(cleanedUrl, mediaType) : fallbackUrl
      const validatedThumbUrl = cleanedThumbUrl ? validateMediaUrl(cleanedThumbUrl, 'image') : (isVideo ? '/placeholder-video.svg' : null)

      // ✅ Log des médias avec URLs invalides
      if (!cleanedUrl && m.url) {
        console.error(`[ADMIN MEDIA] Media ${m.id} has invalid URL: ${m.url}`)
      }

      return {
        ...m,
        url: validatedUrl,
        thumbUrl: validatedThumbUrl,
        owner
      }
    })

    console.log(`[ADMIN MEDIA] Returning ${enrichedMedia.length} enriched media items`)

    return NextResponse.json({
      success: true,
      media: enrichedMedia
    })
  } catch (error) {
    console.error('[ADMIN MEDIA] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}
