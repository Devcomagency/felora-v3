import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { optimizeMediaUrl, generateThumbnailUrl } from '@/lib/media-optimizer'
import { dbOperationWithRetry, createErrorHandler } from '@/lib/retry-utils'
import { feedRateLimit } from '@/lib/rate-limiter'
import { generateSignedUrl } from '@/lib/media/signedUrls'

// Cache en mémoire pour les requêtes fréquentes
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute

export async function GET(req: NextRequest) {
  try {
    // Vérifier le rate limiting
    const rateLimitResult = feedRateLimit(req)
    if (!rateLimitResult.allowed) {
      console.log('🚫 [FEED PUBLIC] Rate limit dépassé')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Trop de requêtes, veuillez patienter',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      )
    }

    const url = new URL(req.url)
    const cursor = url.searchParams.get('cursor')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    // Clé de cache basée sur les paramètres
    const cacheKey = `feed:public:${cursor || 'initial'}:${limit}`
    
    // Vérifier le cache
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('📱 [FEED PUBLIC] Cache hit pour:', cacheKey)
      return NextResponse.json(cached.data, {
        headers: rateLimitResult.headers
      })
    }
    
    console.log('🚀 [FEED PUBLIC] Récupération des médias publics (escorts + clubs), cursor:', cursor, 'limit:', limit)

    // Récupérer tous les médias publics (escorts ET clubs)
    const medias = await dbOperationWithRetry(async () => {
      return await prisma.media.findMany({
        where: {
          visibility: 'PUBLIC',
          ownerType: { in: ['ESCORT', 'CLUB'] }, // Inclure escorts ET clubs
          // TEMPORAIRE: Exclure les médias avec ownerId=unknown pour éviter les erreurs
          ownerId: { not: 'unknown' },
          ...(cursor && {
            id: {
              lt: cursor
            }
          })
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit + 1
      })
    }, {
      maxRetries: 2,
      baseDelay: 500
    })

    // Séparer les IDs par type de profil
    const escortIds = medias.filter(m => m.ownerType === 'ESCORT').map(m => m.ownerId)
    const clubIds = medias.filter(m => m.ownerType === 'CLUB').map(m => m.ownerId)

    // Récupérer les profils escorts
    const escortProfiles = escortIds.length > 0 ? await dbOperationWithRetry(async () => {
      return await prisma.escortProfile.findMany({
        where: {
          id: { in: escortIds },
          status: 'ACTIVE'
        },
        select: {
          id: true,
          stageName: true,
          profilePhoto: true,
          user: {
            select: {
              name: true
            }
          }
        }
      })
    }, {
      maxRetries: 2,
      baseDelay: 500
    }) : []

    // Récupérer les profils clubs
    const clubProfiles = clubIds.length > 0 ? await dbOperationWithRetry(async () => {
      return await prisma.clubProfileV2.findMany({
        where: {
          id: { in: clubIds }
        },
        select: {
          id: true,
          handle: true,
          companyName: true,
          details: {
            select: {
              avatarUrl: true,
              name: true
            }
          }
        }
      })
    }, {
      maxRetries: 2,
      baseDelay: 500
    }) : []

    // Récupérer les avatars des clubs depuis la table Media (pos=0)
    const clubAvatars = clubIds.length > 0 ? await dbOperationWithRetry(async () => {
      return await prisma.media.findMany({
        where: {
          ownerType: 'CLUB',
          ownerId: { in: clubIds },
          pos: 0 // Avatar = position 0
        },
        select: {
          ownerId: true,
          url: true
        }
      })
    }, {
      maxRetries: 2,
      baseDelay: 500
    }) : []

    // Créer un map des avatars clubs
    const clubAvatarMap = new Map(clubAvatars.map(avatar => [avatar.ownerId, avatar.url]))

    // Créer un map unifié pour escorts et clubs
    const profileMap = new Map([
      ...escortProfiles.map(p => [p.id, { ...p, type: 'ESCORT' }]),
      ...clubProfiles.map(p => [p.id, { ...p, type: 'CLUB' }])
    ])

    // Vérifier s'il y a une page suivante
    const hasNextPage = medias.length > limit
    const items = hasNextPage ? medias.slice(0, limit) : medias
    const nextCursor = hasNextPage ? items[items.length - 1]?.id : null

    // Calculer le score pour chaque média (algorithme de tri intelligent)
    const mediasWithScore = items
      .filter(media => profileMap.has(media.ownerId)) // Seulement les médias avec profil actif
      .map(media => {
        const profile = profileMap.get(media.ownerId)!
        const now = new Date()
        const createdAt = new Date(media.createdAt)
        const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        
        // Score de nouveauté (décroît sur 30 jours)
        const noveltyScore = Math.max(0, 1 - (daysSinceCreation / 30))
        
        // Score de popularité (likes + réactions)
        const popularityScore = (media.likeCount * 0.4) + (media.reactCount * 0.3)
        
        // Score final
        const finalScore = popularityScore + (noveltyScore * 0.3)
        
        return {
          ...media,
          score: finalScore,
          profile
        }
      })
      .sort((a, b) => b.score - a.score) // Trier par score décroissant

    // Formater les items pour le frontend avec optimisation des médias
    const formattedItems = mediasWithScore.map(media => {
      const profile = media.profile
      const mediaType = media.type.toUpperCase() as 'IMAGE' | 'VIDEO'

      // Déterminer le type de profil (ESCORT ou CLUB)
      const isClub = profile.type === 'CLUB'

      // Générer les infos auteur selon le type
      const authorHandle = isClub
        ? `@${profile.handle || 'club'}`
        : (profile.stageName ? `@${profile.stageName.toLowerCase().replace(/\s+/g, '_')}` : '@escort')

      const authorName = isClub
        ? (profile.details?.name || profile.companyName || 'Club')
        : (profile.stageName || profile.user?.name || 'Escort')

      // Pour les clubs, utiliser d'abord l'avatar de la table Media, puis fallback sur details.avatarUrl
      const authorAvatar = isClub
        ? (clubAvatarMap.get(profile.id) || profile.details?.avatarUrl || 'https://picsum.photos/100/100?random=club')
        : (profile.profilePhoto || 'https://picsum.photos/100/100?random=default')

      // Optimiser les URLs des médias
      const optimizedUrl = optimizeMediaUrl(media.url, mediaType)
      const optimizedThumb = media.thumbUrl
        ? generateThumbnailUrl(media.thumbUrl)
        : generateThumbnailUrl(media.url)

      // Générer des signed URLs pour sécuriser les médias (expiration 1 heure)
      const signedUrl = generateSignedUrl(optimizedUrl, { expirySeconds: 3600 })
      const signedThumb = generateSignedUrl(optimizedThumb, { expirySeconds: 3600 })

      return {
        id: media.id,
        type: mediaType,
        url: signedUrl,
        thumb: signedThumb,
        visibility: media.visibility,
        ownerType: isClub ? 'CLUB' : 'ESCORT', // Type de propriétaire
        clubHandle: isClub ? profile.handle : null, // Handle du club si applicable
        author: {
          id: profile.id,
          handle: authorHandle,
          name: authorName,
          avatar: authorAvatar
        },
        likeCount: media.likeCount,
        reactCount: media.reactCount,
        createdAt: media.createdAt.toISOString(),
        score: media.score // Pour debug
      }
    })

    console.log(`📱 [FEED PUBLIC] ${formattedItems.length} médias récupérés, nextCursor:`, nextCursor)

    const response = {
      success: true,
      items: formattedItems,
      nextCursor,
      hasNextPage: !!nextCursor,
      total: formattedItems.length
    }

    // Mettre en cache la réponse
    cache.set(cacheKey, { data: response, timestamp: Date.now() })
    
    // Nettoyer le cache ancien (garder seulement les 100 dernières entrées)
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value
      cache.delete(oldestKey)
    }

    return NextResponse.json(response, {
      headers: rateLimitResult.headers
    })

  } catch (error) {
    const errorHandler = createErrorHandler('FEED_PUBLIC')
    const errorResponse = errorHandler(error)
    
    console.error('❌ [FEED PUBLIC] Erreur:', error)
    
    // Retourner une réponse d'erreur standardisée
    return NextResponse.json(
      { 
        ...errorResponse,
        items: [],
        nextCursor: null,
        hasNextPage: false
      }, 
      { status: error.status >= 400 && error.status < 500 ? error.status : 500 }
    )
  }
}
