/**
 * Script pour migrer les URLs Bunny de iframe vers HLS
 *
 * Usage: npx tsx scripts/migrate-bunny-urls.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Début de la migration des URLs Bunny...\n')

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
      externalId: true,
      createdAt: true
    }
  })

  console.log(`📊 Vidéos trouvées: ${videosToMigrate.length}\n`)

  if (videosToMigrate.length === 0) {
    console.log('✅ Aucune vidéo à migrer')
    return
  }

  // Afficher les vidéos à migrer
  for (const video of videosToMigrate) {
    console.log(`📹 ${video.id}`)
    console.log(`   URL: ${video.url}`)
    console.log(`   Date: ${video.createdAt}`)
    console.log(`   ExternalId: ${video.externalId || 'N/A'}\n`)
  }

  console.log('\n🔄 Migration en cours...\n')

  let migratedCount = 0
  let errorCount = 0

  // Migrer chaque vidéo
  for (const video of videosToMigrate) {
    try {
      // Extraire le videoId de l'URL iframe
      // Format: https://iframe.mediadelivery.net/play/538306/{videoId}
      const iframeMatch = video.url.match(/iframe\.mediadelivery\.net\/play\/(\d+)\/([a-f0-9-]+)/)

      if (!iframeMatch) {
        console.error(`❌ ${video.id}: Impossible d'extraire videoId de: ${video.url}`)
        errorCount++
        continue
      }

      const libraryId = iframeMatch[1]
      const videoId = iframeMatch[2]

      // Construire la nouvelle URL HLS
      const newHlsUrl = `https://vz-${libraryId}.b-cdn.net/${videoId}/playlist.m3u8`

      console.log(`✅ ${video.id}: ${video.url.substring(0, 60)}...`)
      console.log(`   → ${newHlsUrl}\n`)

      // Mettre à jour en base
      await prisma.media.update({
        where: { id: video.id },
        data: {
          url: newHlsUrl,
          // S'assurer que externalId est bien le videoId
          externalId: videoId
        }
      })

      migratedCount++
    } catch (error: any) {
      console.error(`❌ ${video.id}: Erreur migration:`, error.message)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`✅ Migration terminée!`)
  console.log(`   - Migrées: ${migratedCount}`)
  console.log(`   - Erreurs: ${errorCount}`)
  console.log(`   - Total: ${videosToMigrate.length}`)
  console.log('='.repeat(60))
}

main()
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
