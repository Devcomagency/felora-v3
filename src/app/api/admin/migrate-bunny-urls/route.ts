import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * API Admin pour migrer les URLs Bunny de iframe vers HLS playlist
 *
 * Avant: https://iframe.mediadelivery.net/play/538306/{videoId}
 * Après: https://vz-538306.b-cdn.net/{videoId}/playlist.m3u8
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // TODO: Ajouter vérification admin ici
    console.log('🔧 Migration des URLs Bunny pour user:', session.user.id)

    // Récupérer toutes les vidéos avec URL iframe Bunny
    const videosToMigrate = await prisma.media.findMany({
      where: {
        type: 'VIDEO',
        url: {
          contains: 'iframe.mediadelivery.net/play'
        }
      },
      select: {
        id: true,
        url: true,
        externalId: true
      }
    })

    console.log(`📊 Vidéos à migrer: ${videosToMigrate.length}`)

    if (videosToMigrate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucune vidéo à migrer',
        migrated: 0
      })
    }

    // Migrer chaque vidéo
    const migrations = []
    for (const video of videosToMigrate) {
      // Extraire le videoId de l'URL iframe
      // Format: https://iframe.mediadelivery.net/play/538306/{videoId}
      const iframeMatch = video.url.match(/iframe\.mediadelivery\.net\/play\/(\d+)\/([a-f0-9-]+)/)

      if (!iframeMatch) {
        console.warn(`⚠️ Impossible d'extraire videoId de: ${video.url}`)
        continue
      }

      const libraryId = iframeMatch[1]
      const videoId = iframeMatch[2]

      // Construire la nouvelle URL HLS
      const newHlsUrl = `https://vz-${libraryId}.b-cdn.net/${videoId}/playlist.m3u8`

      console.log(`🔄 Migration ${video.id}:`, {
        oldUrl: video.url,
        newUrl: newHlsUrl
      })

      // Mettre à jour en base
      await prisma.media.update({
        where: { id: video.id },
        data: {
          url: newHlsUrl,
          // S'assurer que externalId est bien le videoId
          externalId: videoId
        }
      })

      migrations.push({
        mediaId: video.id,
        oldUrl: video.url,
        newUrl: newHlsUrl
      })
    }

    console.log(`✅ Migration terminée: ${migrations.length} vidéos migrées`)

    return NextResponse.json({
      success: true,
      message: `${migrations.length} vidéos migrées avec succès`,
      migrated: migrations.length,
      details: migrations
    })

  } catch (error: any) {
    console.error('❌ Erreur migration Bunny URLs:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur migration'
    }, { status: 500 })
  }
}
