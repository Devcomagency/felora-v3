/**
 * Profile Test API - Escort Endpoint
 * Secure, fail-soft, production-ready
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { toEscortProfileDTO, createMinimalProfile } from '../../../../../../packages/core/profile-test/adapters'
import { validateProfileId, validateQuery, validateEscortProfile } from '../../../../../../packages/core/profile-test/validators'
import { rateLimit, getClientIdentifier } from '../../../../../../packages/core/profile-test/rateLimit'

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
  const R2_PATHS = ['/profiles/', '/uploads/', '/clubs/', '/media/']
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
        { status: 400 }
      )
    }

    const validatedId = idValidation.data

    console.log(`🔍 [ESCORT API] Fetching escort profile for ID: ${validatedId}`)

    // Récupérer le profil escort depuis la base de données
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { id: validatedId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    if (!escortProfile) {
      console.warn(`❌ [ESCORT API] Profile not found for ID: ${validatedId}`)
      return NextResponse.json(
        {
          error: 'not_found',
          message: 'Profile not found',
          code: 404
        },
        { status: 404 }
      )
    }

    console.log(`✅ [ESCORT API] Profile found: ${escortProfile.stageName || escortProfile.user.name}`)

    // Récupérer les médias du profil
    const media = await prisma.media.findMany({
      where: {
        ownerId: validatedId
      },
      orderBy: {
        pos: 'asc'
      },
      select: {
        id: true,
        url: true,
        type: true,
        thumbUrl: true,
        pos: true
      }
    })

    console.log(`📸 [ESCORT API] Found ${media.length} media items`)

    // Récupérer les stats réelles
    let realStats = {
      likes: 0,
      followers: 0,
      views: 0
    }

    try {
      // Compter les réactions sur tous les médias de ce profil
      const mediaReactionsFromDB = await prisma.reaction.aggregate({
        where: {
          media: {
            ownerId: validatedId
          }
        },
        _count: {
          id: true
        }
      })

      realStats.likes = mediaReactionsFromDB._count.id || 0
      console.log(`📊 Profile ${validatedId}: ${realStats.likes} reactions found`)

      // Récupérer les stats de vues
      const { getViewStats } = await import('@/lib/analytics/viewTracker')
      const viewStats = await getViewStats(validatedId)
      realStats.views = viewStats.profileViews || 0
      console.log(`👀 Profile ${validatedId}: ${realStats.views} profile views found`)
    } catch (error) {
      console.warn('Failed to fetch real stats, using fallback:', error)
    }

    // Parser les champs JSON stockés en string
    const parseJsonField = (field: string | null | undefined): any[] => {
      if (!field) return []
      try {
        return typeof field === 'string' ? JSON.parse(field) : field
      } catch {
        return []
      }
    }

    // Construire le profil à retourner avec les vraies données
    const profileData = {
      id: escortProfile.id,
      name: escortProfile.stageName || escortProfile.user.name || 'Escort',
      handle: `@${escortProfile.stageName?.toLowerCase().replace(/\s+/g, '') || escortProfile.user.name?.toLowerCase().replace(/\s+/g, '') || 'escort'}`,
      stageName: escortProfile.stageName || escortProfile.user.name || 'Escort',
      avatar: buildMediaUrl(escortProfile.profilePhoto || escortProfile.user.image),
      city: escortProfile.city || 'Zurich',
      age: null, // Calculer depuis dateOfBirth si nécessaire
      languages: parseJsonField(escortProfile.languages),
      services: parseJsonField(escortProfile.services),
      media: media.map(m => ({
        id: m.id,
        type: m.type.toLowerCase() as 'image' | 'video', // Convertir en minuscules pour la validation
        url: buildMediaUrl(m.url),
        thumb: buildMediaUrl(m.thumbUrl)
      })),
      verified: escortProfile.isVerifiedBadge || false,
      premium: false, // Ajouter la logique premium si nécessaire
      online: false, // Ajouter la logique online si nécessaire
      description: escortProfile.description || '',
      stats: realStats,
      rates: {
        hour: escortProfile.rate1H || null,
        twoHours: escortProfile.rate2H || null,
        halfDay: escortProfile.rateHalfDay || null,
        fullDay: escortProfile.rateFullDay || null,
        overnight: escortProfile.rateOvernight || null
      },
      availability: {
        incall: escortProfile.incall ?? true,
        outcall: escortProfile.outcall ?? true,
        available: escortProfile.availableNow || false,
        availableUntil: undefined,
        nextAvailable: undefined,
        schedule: null
      },
      physical: {
        height: escortProfile.height || null,
        bodyType: escortProfile.bodyType || null,
        hairColor: escortProfile.hairColor || null,
        eyeColor: escortProfile.eyeColor || null
      },
      practices: parseJsonField(escortProfile.practices),
      workingArea: escortProfile.workingArea || null,
      category: escortProfile.category || null,
      serviceType: null,
      experience: null,
      style: null,
      profile: null,
      specialties: [],
      additionalLanguages: []
    }

    console.log(`✅ [ESCORT API] Returning profile data for: ${profileData.name}`)

    // Validate and sanitize output
    const validatedProfile = validateEscortProfile(profileData)
    
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-Response-Time': `${Date.now() - startTime}ms`
    })

    return NextResponse.json({
      success: true,
      data: validatedProfile,
      cached: false,
      demo: false,
      timestamp: new Date().toISOString()
    }, { headers })

  } catch (error) {
    console.error('Profile test API error:', error)
    
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-Response-Time': `${Date.now() - startTime}ms`
    })
    
    return NextResponse.json(
      { 
        error: 'internal_server_error',
        message: 'Profile temporarily unavailable',
        code: 500
      },
      { status: 500, headers }
    )
  }
}

/**
 * Check if column exists in database (simple caching approach)
 */
const columnCache = new Map<string, boolean>()

async function hasColumn(columnName: string): Promise<boolean> {
  if (columnCache.has(columnName)) {
    return columnCache.get(columnName)!
  }
  
  try {
    // Try a simple query to check if column exists
    await prisma.$queryRaw`SELECT ${columnName} FROM escort_profiles LIMIT 1`
    columnCache.set(columnName, true)
    return true
  } catch {
    columnCache.set(columnName, false)
    return false
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