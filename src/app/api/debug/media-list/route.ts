import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdmin } from '@/lib/serverAuth'
import { logger } from '@/lib/logger'

// Route de debug pour voir tous les médias (PROTÉGÉE PAR AUTH ADMIN)
export const GET = withAdmin(async (request: NextRequest) => {
  try {
    logger.security('Admin accessing media list')
    const medias = await prisma.media.findMany({
      select: {
        id: true,
        type: true,
        url: true,
        visibility: true,
        ownerType: true,
        ownerId: true,
        pos: true,
        createdAt: true,
        likeCount: true,
        reactCount: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const escortProfiles = await prisma.escortProfile.findMany({
      select: {
        id: true,
        stageName: true,
        status: true
      }
    })

    const profileMap = new Map(escortProfiles.map(p => [p.id, p]))

    const mediasWithProfile = medias.map(media => ({
      ...media,
      profile: media.ownerType === 'ESCORT' ? profileMap.get(media.ownerId) : null
    }))

    return NextResponse.json({
      success: true,
      total: medias.length,
      medias: mediasWithProfile,
      summary: {
        public: medias.filter(m => m.visibility === 'PUBLIC').length,
        premium: medias.filter(m => m.visibility === 'PREMIUM').length,
        private: medias.filter(m => m.visibility === 'PRIVATE').length,
        escort: medias.filter(m => m.ownerType === 'ESCORT').length,
        club: medias.filter(m => m.ownerType === 'CLUB').length
      }
    })

  } catch (error) {
    logger.error('[DEBUG MEDIA LIST] Erreur', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})
