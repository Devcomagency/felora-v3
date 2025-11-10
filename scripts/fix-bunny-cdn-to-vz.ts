/**
 * Script pour corriger les URLs Bunny CDN
 * Remplace felora.b-cdn.net par vz-cf0fe97d-915.b-cdn.net
 *
 * Usage: npx tsx scripts/fix-bunny-cdn-to-vz.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Correction des URLs Bunny CDN vers vz-cf0fe97d-915...\n')

  // Récupérer toutes les vidéos avec felora.b-cdn.net
  const videosToFix = await prisma.media.findMany({
    where: {
      type: 'VIDEO',
      OR: [
        { url: { contains: 'felora.b-cdn.net' } },
        { thumbUrl: { contains: 'felora.b-cdn.net' } }
      ]
    },
    select: {
      id: true,
      url: true,
      thumbUrl: true,
      externalId: true
    }
  })

  console.log(`📊 Vidéos à corriger: ${videosToFix.length}\n`)

  if (videosToFix.length === 0) {
    console.log('✅ Aucune vidéo à corriger')
    return
  }

  let fixedCount = 0

  for (const video of videosToFix) {
    const oldUrl = video.url
    const oldThumbUrl = video.thumbUrl || 'N/A'

    // Remplacer felora.b-cdn.net par vz-cf0fe97d-915.b-cdn.net
    const newUrl = video.url.replace('felora.b-cdn.net', 'vz-cf0fe97d-915.b-cdn.net')
    const newThumbUrl = video.thumbUrl?.replace('felora.b-cdn.net', 'vz-cf0fe97d-915.b-cdn.net') || null

    console.log(`📹 ${video.id}`)
    console.log(`   URL: ${oldUrl}`)
    console.log(`    → ${newUrl}`)
    if (video.thumbUrl) {
      console.log(`   Thumb: ${oldThumbUrl}`)
      console.log(`    → ${newThumbUrl}`)
    }

    // Mettre à jour en base
    await prisma.media.update({
      where: { id: video.id },
      data: {
        url: newUrl,
        thumbUrl: newThumbUrl
      }
    })

    console.log(`   ✅ Corrigé\n`)
    fixedCount++
  }

  console.log('='.repeat(60))
  console.log(`✅ Correction terminée!`)
  console.log(`   - Vidéos corrigées: ${fixedCount}`)
  console.log(`   - Total: ${videosToFix.length}`)
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
