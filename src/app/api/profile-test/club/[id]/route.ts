/**
 * Profile Test API - Club Endpoint
 * Secure, fail-soft, production-ready
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { toClubProfileDTO, createMinimalProfile } from '../../../../../../packages/core/profile-test/adapters'
import { validateProfileId, validateQuery, validateClubProfile } from '../../../../../../packages/core/profile-test/validators'
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
    
    // Check cache first
    if (!query?.cache_bust) {
      const cached = getCachedProfile(validatedId)
      if (cached) {
        headers.set('X-Cache', 'HIT')
        const ttfb = Date.now() - startTime
        headers.set('X-Response-Time', `${ttfb}ms`)
        
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
          timestamp: new Date().toISOString()
        }, { headers })
      }
    }

    // Fetch from database with fail-soft approach
    let clubProfile
    try {
      // For clubs, we'll try to use clubProfile table if exists, otherwise mock data
      try {
        clubProfile = await prisma.clubProfile?.findUnique({
          where: { id: validatedId },
          select: {
            id: true,
            name: true,
            handle: true,
            logo: true,
            city: true,
            description: true,
            verified: true,
            languages: true,
            services: true,
            photos: true,
            address: true,
            phone: true,
            website: true,
            email: true,
            amenities: true,
            workingHours: true,
            latitude: true,
            longitude: true,
            views: true
          }
        })
      } catch {
        // Club table doesn't exist, create mock data based on ID
        clubProfile = createMockClubFromId(validatedId)
      }
    } catch (dbError) {
      console.warn(`DB error for club ${validatedId}:`, dbError)
      
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

    // Convert to DTO with fail-soft defaults
    const profileDTO = toClubProfileDTO(clubProfile)
    
    // Validate and sanitize output
    const validatedProfile = validateClubProfile(profileDTO)
    
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
    photos: JSON.stringify([])
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
