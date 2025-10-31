import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

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

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    console.log('[ADMIN MEDIA] Where clause:', where)

    // Fetch media
    const media = await prisma.media.findMany({
      where,
      orderBy: [
        { reportCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 100
    })

    console.log(`[ADMIN MEDIA] Found ${media.length} media items`)

    // Helper function to validate and clean URLs
    const cleanUrl = (url: string | null): string | null => {
      if (!url) return null

      // Filter out invalid URLs that start with 'media:' or other non-HTTP protocols
      if (url.startsWith('media:') ||
          url.startsWith('blob:') ||
          (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/'))) {
        console.warn(`[ADMIN MEDIA] Filtering invalid URL: ${url}`)
        return null
      }

      return url
    }

    // Enrich with owner data and clean URLs
    const enrichedMedia = await Promise.all(
      media.map(async (m) => {
        let owner = null

        try {
          if (m.ownerType === 'ESCORT' && m.ownerId !== 'unknown') {
            const escort = await prisma.escortProfile.findUnique({
              where: { id: m.ownerId },
              select: { stageName: true, firstName: true }
            })
            if (escort) {
              owner = { name: escort.firstName, stageName: escort.stageName }
            }
          } else if (m.ownerType === 'CLUB' && m.ownerId !== 'unknown') {
            const club = await prisma.clubProfile.findUnique({
              where: { id: m.ownerId },
              select: { name: true, handle: true }
            })
            if (club) {
              owner = { name: club.name, slug: club.handle } // Use handle as slug for URL
            }
          }
        } catch (e) {
          // Ignore errors, keep owner as null
        }

        // Default to Unknown if no owner found
        if (!owner) {
          owner = { name: 'Unknown', stageName: 'Unknown' }
        }

        // Clean URLs to filter out invalid formats
        const cleanedUrl = cleanUrl(m.url)
        const cleanedThumbUrl = cleanUrl(m.thumbUrl)

        // Choose appropriate placeholder based on media type
        const isVideo = m.type.includes('video')
        const fallbackUrl = isVideo ? '/placeholder-video.svg' : '/placeholder-image.svg'

        return {
          ...m,
          url: cleanedUrl || fallbackUrl, // Fallback if URL is invalid
          thumbUrl: cleanedThumbUrl || (isVideo ? '/placeholder-video.svg' : null), // Use video placeholder for videos without thumbs
          owner
        }
      })
    )

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
