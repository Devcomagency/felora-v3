import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type SortKey = 'recent' | 'relevance'

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Escorts endpoint called')

    // Test connexion Prisma d'abord
    console.log('[API] Testing Prisma connection...')
    const totalProfiles = await prisma.escortProfile.count()
    console.log('[API] Prisma connection OK, total profiles:', totalProfiles)

    // Test simple : retourner les 5 premiers profils
    console.log('[API] Fetching first 5 profiles...')
    const profiles = await prisma.escortProfile.findMany({
      take: 5,
      select: {
        id: true,
        stageName: true,
        city: true,
        status: true,
        hasProfilePhoto: true,
        profilePhoto: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    console.log('[API] Profiles found:', profiles.map(p => ({
      id: p.id,
      stageName: p.stageName,
      city: p.city,
      status: p.status
    })))

    // Format simple pour retour
    const items = profiles.map(p => ({
      id: p.id,
      stageName: p.stageName || '',
      city: p.city || undefined,
      isVerifiedBadge: false,
      isActive: p.status === 'ACTIVE',
      profilePhoto: p.profilePhoto || undefined,
      heroMedia: p.profilePhoto ? { type: 'IMAGE' as const, url: p.profilePhoto } : undefined,
      languages: [],
      services: [],
      updatedAt: new Date().toISOString()
    }))

    return NextResponse.json({
      items,
      nextCursor: undefined,
      total: totalProfiles
    })

  } catch (error) {
    console.error('[API] ERREUR CRITIQUE:', error)
    console.error('[API] Error details:', {
      name: (error as any)?.name,
      message: (error as any)?.message,
      stack: (error as any)?.stack
    })
    return NextResponse.json({ error: 'server_error', details: (error as any)?.message }, { status: 500 })
  }
}