import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Route de debug pour voir tous les médias (NON AUTHENTIFIÉE - DEBUG SEULEMENT)
export async function GET(request: NextRequest) {
  try {
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
    console.error('❌ [DEBUG MEDIA LIST] Erreur:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
