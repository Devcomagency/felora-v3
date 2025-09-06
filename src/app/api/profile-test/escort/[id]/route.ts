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
    
    // Récupérer les stats réelles depuis la base de données et le système de tracking
    let realStats = {
      likes: 0,
      followers: 289, // Garder cette valeur fictive pour l'instant  
      views: 0 // Récupérer depuis le système de tracking
    }

    try {
      // Compter les réactions sur tous les médias de ce profil
      // Méthode 1: Via le modèle Media (pour les médias en DB)
      const ownerIdLookup = validatedId === '1' ? 'escort-1' : `escort-${validatedId}`
      const mediaReactionsFromDB = await prisma.reaction.aggregate({
        where: {
          media: {
            ownerId: ownerIdLookup
          }
        },
        _count: {
          id: true
        }
      })

      // Méthode 2: Via stableMediaId pour les médias de test
      // Générer les IDs des médias de test pour ce profil
      const { stableMediaId } = await import('@/lib/reactions/stableMediaId')
      const testMediaUrls = [
        'https://picsum.photos/400/600?random=2',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
        'https://picsum.photos/400/600?random=4',
        'https://picsum.photos/400/600?random=5',
        'https://picsum.photos/400/600?random=6'
      ]
      
      const testMediaIds = testMediaUrls.map(url => 
        stableMediaId({ rawId: null, profileId: validatedId, url })
      )
      
      // Chercher les réactions pour ces médias spécifiques
      const testMediaReactions = await prisma.reaction.findMany({
        where: {
          mediaId: { in: testMediaIds }
        }
      })

      // Total des réactions = DB + Test
      const totalReactions = (mediaReactionsFromDB._count.id || 0) + testMediaReactions.length

      realStats.likes = totalReactions
      console.log(`📊 Profile ${validatedId}: ${realStats.likes} reactions found (DB: ${mediaReactionsFromDB._count.id}, Test: ${testMediaReactions.length})`)

      // Récupérer les stats de vues depuis le système de tracking
      const { getViewStats } = await import('@/lib/analytics/viewTracker')
      const viewStats = await getViewStats(validatedId)
      realStats.views = viewStats.profileViews || 0
      console.log(`👀 Profile ${validatedId}: ${realStats.views} profile views found`)
    } catch (error) {
      console.warn('Failed to fetch real stats, using fallback:', error)
    }
    
    // DEMO DATA - Retourner des données de test avec toutes les références de filtres
    const demoProfile = {
      id: validatedId,
      name: `Escort ${validatedId}`,
      handle: `@${validatedId}`,
      stageName: `${validatedId.charAt(0).toUpperCase()}${validatedId.slice(1)}`,
      avatar: 'https://picsum.photos/400/600?random=1',
      city: 'Zurich',
      age: 25,
      languages: ['Français', 'Anglais', 'Allemand'],
      services: ['Accompagnement', 'Massage', 'Rencontres'],
      media: [
        {
          type: 'image',
          url: 'https://picsum.photos/400/600?random=2'
        },
        {
          type: 'video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumb: 'https://picsum.photos/400/600?random=3'
        },
        {
          type: 'image', 
          url: 'https://picsum.photos/400/600?random=4'
        },
        {
          type: 'image', 
          url: 'https://picsum.photos/400/600?random=5'
        },
        {
          type: 'image', 
          url: 'https://picsum.photos/400/600?random=6'
        }
      ],
      verified: true,
      premium: true,
      online: true,
      description: `Profil de test pour ${validatedId}. Escort professionnelle basée à Zurich.`,
      stats: realStats,
      rates: {
        hour: 350,
        twoHours: 600,
        halfDay: 900,
        fullDay: 1500,
        overnight: 2000
      },
      availability: {
        incall: true,
        outcall: true,
        available: validatedId === '1' ? true : false,
        availableUntil: validatedId === '1' ? '2025-01-15T18:00:00Z' : undefined,
        nextAvailable: validatedId !== '1' ? '2025-01-16T09:00:00Z' : undefined,
        schedule: validatedId === '1' 
          ? 'Disponible jusqu\'à 18h'
          : 'De retour demain 9h'
      },
      physical: {
        height: 165,
        bodyType: 'Athlétique',
        hairColor: 'Châtain',
        eyeColor: 'Noisette'
      },
      practices: ['GFE', 'Massage', 'Accompagnement'],
      workingArea: 'Zurich et alentours',
      
      // NOUVELLES DONNÉES CORRESPONDANT AUX FILTRES
      category: 'Premium', // Catégorie
      serviceType: 'Escort Indépendante', // Type de service
      experience: 'Experte (5+ ans)', // Expérience 
      style: 'Élégante & Sophistiquée', // Style
      profile: 'Escorte de Luxe', // Profil
      specialties: ['GFE (Girlfriend Experience)', 'Massage Tantrique', 'Accompagnement VIP', 'Soirées Privées'], // Spécialités détaillées
      additionalLanguages: ['Italien', 'Espagnol'] // Langues supplémentaires
    }
    
    // Validate and sanitize output
    const validatedProfile = validateEscortProfile(demoProfile)
    
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-Response-Time': `${Date.now() - startTime}ms`
    })

    return NextResponse.json({
      success: true,
      data: validatedProfile,
      cached: false,
      demo: true,
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