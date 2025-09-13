import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mediaStorage } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 })
    }

    // Test de connexion à la base de données
    const dbTest = await prisma.media.count()

    // Test de stockage (simulation d'upload)
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const storageTest = await mediaStorage.upload(testFile, 'health-test')

    // Récupérer les statistiques des médias
    const mediaStats = await prisma.media.groupBy({
      by: ['type', 'visibility'],
      _count: { _all: true }
    })

    // Récupérer les médias récents
    const recentMedia = await prisma.media.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        url: true,
        visibility: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      debug: {
        database: {
          connected: true,
          mediaCount: dbTest,
          stats: mediaStats
        },
        storage: {
          provider: process.env.STORAGE_PROVIDER || 'base64',
          testResult: {
            success: storageTest.success,
            url: storageTest.url?.substring(0, 50) + '...',
            error: storageTest.error
          }
        },
        recentMedia: recentMedia.map(m => ({
          id: m.id,
          type: m.type,
          url: m.url?.substring(0, 50) + '...',
          visibility: m.visibility,
          createdAt: m.createdAt
        })),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          storageProvider: process.env.STORAGE_PROVIDER,
          hasR2Config: !!(
            process.env.CLOUDFLARE_R2_ENDPOINT &&
            process.env.CLOUDFLARE_R2_ACCESS_KEY &&
            process.env.CLOUDFLARE_R2_SECRET_KEY &&
            process.env.CLOUDFLARE_R2_BUCKET
          )
        }
      }
    })

  } catch (error) {
    console.error('Erreur health check médias:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      debug: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 })
  }
}