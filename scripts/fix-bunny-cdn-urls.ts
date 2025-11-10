/**
 * Script pour corriger les URLs Bunny CDN
 * Remplace vz-538306.b-cdn.net par felora.b-cdn.net
 *
 * Usage: npx tsx scripts/fix-bunny-cdn-urls.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Correction des URLs Bunny CDN...\n')

  // Récupérer toutes les vidéos avec mauvaise URL CDN
  const videosToFix = await prisma.media.findMany({
    where: {
      type: 'VIDEO',
      OR: [
        { url: { contains: 'vz-538306.b-cdn.net' } },
        { thumbUrl: { contains: 'vz-538306.b-cdn.net' } }
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

    // Remplacer vz-538306.b-cdn.net par felora.b-cdn.net
    const newUrl = video.url.replace('vz-538306.b-cdn.net', 'felora.b-cdn.net')
    const newThumbUrl = video.thumbUrl?.replace('vz-538306.b-cdn.net', 'felora.b-cdn.net') || null

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
