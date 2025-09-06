import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Debug API /api/geo/debug')
    
    // Test direct de la requête Prisma
    const escortProfiles = await prisma.escortProfile.findMany({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      },
      select: {
        id: true,
        stageName: true,
        latitude: true,
        longitude: true,
        city: true,
        isVerifiedBadge: true
      },
      take: 10
    })
    
    console.log(`✅ Trouvé ${escortProfiles.length} profils`)
    
    return NextResponse.json({
      success: true,
      escorts: escortProfiles,
      count: escortProfiles.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erreur debug API:', error)
    
    return NextResponse.json(
      { 
        error: 'Erreur interne', 
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}