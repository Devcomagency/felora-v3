/**
 * Script pour ajouter les thumbnails manquants aux vidéos Bunny.net
 *
 * Usage: npx tsx scripts/fix-video-thumbnails.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Recherche des vidéos sans thumbnail...')

  // Trouver toutes les vidéos Bunny.net sans thumbUrl
  const videosWithoutThumb = await prisma.media.findMany({
    where: {
      type: 'VIDEO',
      url: {
        contains: 'b-cdn.net'
      },
      thumbUrl: null,
      deletedAt: null
    },
    select: {
      id: true,
      url: true,
      externalId: true
    }
  })

  console.log(`📊 Trouvé ${videosWithoutThumb.length} vidéos Bunny sans thumbnail`)

  if (videosWithoutThumb.length === 0) {
    console.log('✅ Toutes les vidéos ont déjà un thumbnail')
    return
  }

  let fixed = 0
  let errors = 0

  for (const video of videosWithoutThumb) {
    try {
      // Extraire le videoId de l'URL Bunny
      // Format: https://vz-cf0fe97d-915.b-cdn.net/{videoId}/playlist.m3u8
      const match = video.url.match(/b-cdn\.net\/([a-f0-9-]+)\/playlist\.m3u8/)

      if (!match) {
        console.log(`⚠️  Impossible d'extraire videoId de: ${video.url}`)
        errors++
        continue
      }

      const videoId = match[1]

      // Générer l'URL du thumbnail Bunny.net
      // Format: https://vz-cf0fe97d-915.b-cdn.net/{videoId}/thumbnail.jpg
      const thumbnailUrl = video.url.replace('/playlist.m3u8', '/thumbnail.jpg')

      // Mettre à jour en base
      await prisma.media.update({
        where: { id: video.id },
        data: { thumbUrl: thumbnailUrl }
      })

      console.log(`✅ ${video.id}: ${thumbnailUrl}`)
      fixed++

    } catch (error) {
      console.error(`❌ Erreur pour ${video.id}:`, error)
      errors++
    }
  }

  console.log(`\n📊 Résultat:`)
  console.log(`   ✅ Corrigées: ${fixed}`)
  console.log(`   ❌ Erreurs: ${errors}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
