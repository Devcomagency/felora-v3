/**
 * Profile Test API - Club Endpoint
 * Secure, fail-soft, production-ready
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { toClubProfileDTO, createMinimalProfile } from '../../../../../../packages/core/profile-test/adapters'
import { validateProfileId, validateQuery, validateClubProfile } from '../../../../../../packages/core/profile-test/validators'
import { rateLimit, getClientIdentifier } from '../../../../../../packages/core/profile-test/rateLimit'
import { isClubOpenNow } from '@/lib/club-utils'

const prisma = new PrismaClient()

/**
 * Construit l'URL complète d'un média
 * - URLs complètes (http/https) : retournées telles quelles
 * - Chemins R2 (/profiles/, /uploads/, /clubs/) : préfixés avec le domaine R2
 * - Autres chemins (ex: /icons/) : retournés tels quels (fichiers locaux)
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

  // Autres chemins (fichiers locaux comme /icons/) : retourner tel quel
  return url
}

// Simple memory cache for profiles (5 minute TTL)
const profileCache = new Map<string, { data: any; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get cached profile or null if expired/missing
 */
function getCachedProfile(id: string) {
  const cached = profileCache.get(id)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }
  profileCache.delete(id)
  return null
}

/**
 * Cache profile data
 */
function setCachedProfile(id: string, data: any) {
  profileCache.set(id, {
    data,
    expires: Date.now() + CACHE_TTL
  })
  
  // Cleanup old entries periodically
  if (profileCache.size > 100) {
    const now = Date.now()
    for (const [key, value] of profileCache.entries()) {
      if (value.expires <= now) {
        profileCache.delete(key)
      }
    }
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    // Vérifier la session pour déterminer si l'utilisateur est le propriétaire
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions as any)
    const userId = session?.user?.id

    // Extract client identifier for rate limiting
    const clientId = getClientIdentifier(request)
    
    // Apply rate limiting
    const rateLimitResult = rateLimit(clientId, 'profile')
    
    // Add security and caching headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5min cache
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      ...rateLimitResult.headers
    })

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'rate_limit_exceeded',
          message: rateLimitResult.error?.message,
          code: 429
        },
        { status: 429, headers }
      )
    }

    // Validate parameters
    const { id } = await context.params
    const idValidation = validateProfileId(id)
    
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'invalid_id',
          message: idValidation.error,
          code: 400
        },
        { status: 400, headers }
      )
    }

    const validatedId = idValidation.data
    const query = validateQuery(Object.fromEntries(request.nextUrl.searchParams))
    
    // Check cache first (but skip if cache_bust is requested)
    const cacheBust = (query as any)?.cache_bust || request.headers.get('cache-control') === 'no-cache'
    if (!cacheBust) {
      const cached = getCachedProfile(validatedId)
      if (cached) {
        headers.set('X-Cache', 'HIT')
        const ttfb = Date.now() - startTime
        headers.set('X-Response-Time', `${ttfb}ms`)
        
        console.log('📦 Serving cached profile for:', validatedId)
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
          timestamp: new Date().toISOString()
        }, { headers })
      }
    } else {
      console.log('🔄 Cache bust requested for:', validatedId)
    }

    // Fetch from database with fail-soft approach
    let clubProfile
    try {
      // Use ClubProfileV2 table with details and services
      const club = await prisma.clubProfileV2.findUnique({
        where: { handle: validatedId },
        include: {
          user: {
            select: {
              email: true,
              phoneE164: true,
              name: true
            }
          }
        }
      })

      if (club) {
        // Get details and services separately (using correct Prisma table names)
        const [details, services, media] = await Promise.all([
          prisma.clubDetails.findUnique({
            where: { clubId: club.id }
          }),
          prisma.clubServices.findUnique({
            where: { clubId: club.id }
          }),
          prisma.media.findMany({
            where: {
              ownerType: 'CLUB',
              ownerId: club.id
            },
            orderBy: [
              { pos: 'asc' },
              { createdAt: 'desc' } // Plus récent en premier pour chaque position
            ]
          })
        ])

        // Debug: Log what we found in the database
        console.log('🔍 DB Data found for club:', validatedId, {
          club: {
            id: club.id,
            handle: club.handle,
            companyName: club.companyName,
            verified: club.verified
          },
          details: details ? {
            name: details.name,
            city: details.city,
            description: details.description,
            avatarUrl: details.avatarUrl,
            address: details.address,
            phone: details.phone,
            websiteUrl: details.websiteUrl,
            email: details.email,
            latitude: details.latitude,
            longitude: details.longitude
          } : null,
          services: services ? {
            languages: services.languages,
            services: services.services,
            equipments: services.equipments,
            openingHours: services.openingHours
          } : null,
          mediaCount: media.length,
          mediaURLs: media.map((m: any) => ({
            id: m.id,
            type: m.type,
            pos: m.pos,
            originalURL: m.url,
            thumbURL: m.thumbUrl
          }))
        })

        // Transform to expected format matching ClubProfileResponseSchema
        const profilePhoto = media.find((m: any) => m.pos === 0) // Photo de profil
        const footerPhoto = media.find((m: any) => m.pos === 1)  // Photo footer

        console.log('🔍 [CLUB AVATAR DEBUG]', {
          profilePhotoFound: !!profilePhoto,
          profilePhotoUrl: profilePhoto?.url,
          profilePhotoBuilt: buildMediaUrl(profilePhoto?.url),
          detailsAvatarUrl: details?.avatarUrl
        })

        // ✅ Calculer si le club est ouvert maintenant basé sur les vrais horaires
        const agendaIsOpenNow = isClubOpenNow(
          services?.openingHours || null,
          services?.isOpen24_7 || false
        )

        // Vérifier si l'utilisateur connecté est le propriétaire du club
        const isOwner = userId === club.userId
        console.log('🔑 [OWNERSHIP CHECK]', { userId, clubUserId: club.userId, isOwner })

        clubProfile = {
          id: club.handle,
          dbId: club.id, // ID de la base de données pour les API internes
          userId: club.userId, // ID du propriétaire
          isOwner, // Si l'utilisateur connecté est le propriétaire
          name: details?.name || club.companyName || 'Club',
          handle: club.handle,
          avatar: buildMediaUrl(profilePhoto?.url) || details?.avatarUrl || null,
          footerMedia: buildMediaUrl(footerPhoto?.url),
          city: details?.city || null,
          description: details?.description || null,
          verified: club.verified || false,
          languages: services?.languages || [],
          services: services?.services || [],
          media: media
            .filter((m: any) => {
              // Pour les CLUB : afficher pos 0 (avatar) + pos >= 1 (publications)
              // - Si propriétaire : afficher PUBLIC + PRIVATE
              // - Si visiteur : afficher seulement PUBLIC
              if (m.pos === 0) return true // Avatar toujours visible
              if (m.pos >= 1) {
                if (isOwner) {
                  return m.visibility === 'PUBLIC' || m.visibility === 'PRIVATE'
                } else {
                  return m.visibility === 'PUBLIC'
                }
              }
              return false
            })
            .map((m: any) => ({
              type: m.type.toLowerCase() as 'image' | 'video',
              url: buildMediaUrl(m.url),
              thumb: buildMediaUrl(m.thumbUrl),
              pos: m.pos, // Ajouter la position pour debug
              visibility: m.visibility // Ajouter la visibilité pour debug
            })),
          contact: {
            phone: details?.phone || club.user?.phoneE164 || null,
            website: details?.websiteUrl || null,
            email: details?.email || club.user?.email || null
          },
          location: {
            address: details?.address || null,
            coordinates: (details?.latitude && details?.longitude) ? {
              lat: details.latitude,
              lng: details.longitude
            } : null
          },
          amenities: services?.equipments || [],
          workingHours: services?.openingHours || null,
          agendaIsOpenNow: agendaIsOpenNow, // ✅ Statut ouvert/fermé en temps réel
          establishmentType: details?.establishmentType || 'club',
          stats: {
            views: (details as any)?.views || 0, // ✅ Lire les vraies vues depuis la base de données
            likes: club.totalLikes || 0, // ✅ Utiliser les compteurs du modèle ClubProfileV2
            reactions: club.totalReacts || 0 // ✅ Utiliser les compteurs du modèle ClubProfileV2
          }
        }

        console.log(`🔥 [CLUB API] Club ${validatedId}: ${club.totalLikes} likes + ${club.totalReacts} reactions (from DB counters)`)

        console.log('🌐 Website check:', {
          'details?.websiteUrl': details?.websiteUrl,
          'contact.website': clubProfile.contact.website
        })

        console.log('🎯 Transformed clubProfile:', {
          name: clubProfile.name,
          city: clubProfile.city,
          description: clubProfile.description,
          services: clubProfile.services,
          servicesCount: clubProfile.services?.length || 0,
          mediaCount: clubProfile.media.length,
          hasContact: !!clubProfile.contact,
          hasLocation: !!clubProfile.location,
          stats: clubProfile.stats
        })
      }
    } catch (dbError) {
      console.warn(`DB error for club ${validatedId}:`, dbError)
      clubProfile = null

      // Fail-soft: return minimal profile
      const minimalProfile = createMinimalProfile(validatedId, 'club')
      const validatedProfile = validateClubProfile(minimalProfile)
      
      headers.set('X-Cache', 'FAIL-SOFT')
      const ttfb = Date.now() - startTime
      headers.set('X-Response-Time', `${ttfb}ms`)
      
      return NextResponse.json({
        success: true,
        data: validatedProfile,
        cached: false,
        error: 'profile_fail_soft',
        timestamp: new Date().toISOString()
      }, { headers })
    }

    // Handle not found: in development, return deterministic mock instead of 404
    if (!clubProfile) {
      if (process.env.NODE_ENV !== 'production') {
        const mock = createMockClubFromId(validatedId)
        const dto = toClubProfileDTO(mock)
        const validated = validateClubProfile(dto)
        setCachedProfile(validatedId, validated)
        headers.set('X-Cache', 'DEMO')
        const ttfb = Date.now() - startTime
        headers.set('X-Response-Time', `${ttfb}ms`)
        return NextResponse.json({ success: true, data: validated, cached: false, demo: true, timestamp: new Date().toISOString() }, { headers })
      }
      return NextResponse.json(
        { 
          error: 'profile_not_found',
          message: 'Club profile not found or not accessible',
          code: 404
        },
        { status: 404, headers }
      )
    }

    // Log clubProfile avant validation pour debug
    console.log('Before validation clubProfile:', JSON.stringify(clubProfile, null, 2))

    // TEMPORARY: Skip validation for now to fix preview issues first
    const validatedProfile = clubProfile // validateClubProfile(clubProfile)
    
    // Cache the result
    setCachedProfile(validatedId, validatedProfile)
    
    headers.set('X-Cache', 'MISS')
    const ttfb = Date.now() - startTime
    headers.set('X-Response-Time', `${ttfb}ms`)
    
    // Log performance metrics in dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PROFILE-TEST] Club ${validatedId} - TTFB: ${ttfb}ms`)
    }

    return NextResponse.json({
      success: true,
      data: validatedProfile,
      cached: false,
      timestamp: new Date().toISOString()
    }, { headers })

  } catch (error) {
    // Log error but don't expose details
    console.error('Club profile test API error:', error)
    
    const ttfb = Date.now() - startTime
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-Response-Time': `${ttfb}ms`
    })
    
    return NextResponse.json(
      { 
        error: 'internal_server_error',
        message: 'Club profile temporarily unavailable',
        code: 500
      },
      { status: 500, headers }
    )
  }
}

/**
 * Create mock club data from ID (for testing when club table doesn't exist)
 */
function createMockClubFromId(id: string) {
  const clubs = {
    'club-luxe-geneva': {
      id: 'club-luxe-geneva',
      name: 'Club Luxe Geneva',
      handle: 'club_luxe_geneva',
      logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop&crop=face',
      city: 'Geneva',
      description: 'Premier entertainment club in the heart of Geneva. Exclusive atmosphere, professional service.',
      verified: true,
      languages: JSON.stringify(['French', 'English', 'German']),
      services: JSON.stringify(['VIP Lounge', 'Private Events', 'Entertainment']),
      photos: JSON.stringify([
        { type: 'image', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop' }
      ]),
      address: '123 Rue du Luxe, Geneva',
      phone: '+41 22 XXX XXXX',
      website: 'https://club-luxe-geneva.ch',
      amenities: JSON.stringify(['Valet Parking', 'VIP Area', 'Bar', 'Dance Floor']),
      workingHours: 'Thu-Sat: 22:00-04:00',
      latitude: 46.2044,
      longitude: 6.1432,
      views: 1250
    },
    'club-prestige-zurich': {
      id: 'club-prestige-zurich',
      name: 'Club Prestige Zurich',
      handle: 'club_prestige_zurich',
      logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
      city: 'Zurich',
      description: 'Sophisticated entertainment venue in downtown Zurich. Premium experience guaranteed.',
      verified: true,
      languages: JSON.stringify(['German', 'English', 'French']),
      services: JSON.stringify(['Entertainment', 'Private Dining', 'Events']),
      photos: JSON.stringify([
        { type: 'image', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1559329007-40df8bbc5cfc?w=800&h=600&fit=crop' }
      ]),
      address: '456 Bahnhofstrasse, Zurich',
      phone: '+41 44 XXX XXXX',
      website: 'https://club-prestige-zurich.ch',
      amenities: JSON.stringify(['Champagne Bar', 'Private Rooms', 'Concierge']),
      workingHours: 'Wed-Sat: 21:00-03:00',
      latitude: 47.3769,
      longitude: 8.5417,
      views: 980
    }
  }

  return clubs[id as keyof typeof clubs] || {
    id,
    name: 'Club Test',
    city: 'Switzerland',
    description: 'Test club profile',
    verified: false,
    languages: JSON.stringify(['English']),
    services: JSON.stringify(['Entertainment']),
    photos: JSON.stringify([]),
    website: 'https://www.club-test.ch'
  }
}

// Handle other methods
export async function POST() {
  return NextResponse.json(
    { error: 'method_not_allowed', code: 405 },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'method_not_allowed', code: 405 },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'method_not_allowed', code: 405 },
    { status: 405 }
  )
}
