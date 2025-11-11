/**
 * Script pour ajouter les thumbnails aux vidéos dans les mediaSlots des Escorts
 *
 * Usage: npx tsx scripts/fix-escort-video-thumbnails.ts
 */

import { PrismaClient } from '../node_modules/@prisma/client/index.js'

const prisma = new PrismaClient()

function generateThumbnailUrl(videoUrl: string): string | null {
  // Bunny.net
  if (videoUrl.includes('b-cdn.net') && videoUrl.includes('/playlist.m3u8')) {
    return videoUrl.replace('/playlist.m3u8', '/thumbnail.jpg')
  }

  // Mux
  if (videoUrl.includes('stream.mux.com') && videoUrl.endsWith('.m3u8')) {
    // Mux format: https://stream.mux.com/{PLAYBACK_ID}.m3u8
    // Thumbnail: https://image.mux.com/{PLAYBACK_ID}/thumbnail.jpg
    const playbackId = videoUrl.split('/').pop()?.replace('.m3u8', '')
    if (playbackId) {
      return `https://image.mux.com/${playbackId}/thumbnail.jpg`
    }
  }

  return null
}

function isVideoUrl(url: string): boolean {
  return url.includes('.m3u8') || url.includes('/playlist')
}

async function main() {
  console.log('🔍 Recherche des escorts avec vidéos dans mediaSlots...')

  const escorts = await prisma.escort.findMany({
    where: {
      deletedAt: null,
      OR: [
        { mediaSlot1: { not: null } },
        { mediaSlot2: { not: null } },
        { mediaSlot3: { not: null } },
        { mediaSlot4: { not: null } },
        { mediaSlot5: { not: null } },
      ]
    },
    select: {
      id: true,
      stageName: true,
      mediaSlot1: true,
      mediaSlot2: true,
      mediaSlot3: true,
      mediaSlot4: true,
      mediaSlot5: true,
    }
  })

  console.log(`📊 Trouvé ${escorts.length} escorts avec médias`)

  let totalFixed = 0
  let totalVideos = 0

  for (const escort of escorts) {
    const slots = [
      escort.mediaSlot1,
      escort.mediaSlot2,
      escort.mediaSlot3,
      escort.mediaSlot4,
      escort.mediaSlot5,
    ]

    let updated = false
    const newSlots = slots.map((slotJson, index) => {
      if (!slotJson) return slotJson

      try {
        const slot = JSON.parse(slotJson as string)

        // Vérifier si c'est une vidéo sans thumbnail
        if (slot.url && isVideoUrl(slot.url) && !slot.thumb) {
          totalVideos++
          const thumbUrl = generateThumbnailUrl(slot.url)

          if (thumbUrl) {
            console.log(`✅ ${escort.stageName || escort.id} - Slot ${index + 1}: ${thumbUrl}`)
            slot.thumb = thumbUrl
            updated = true
            totalFixed++
          } else {
            console.log(`⚠️  ${escort.stageName || escort.id} - Slot ${index + 1}: Impossible de générer thumbnail pour ${slot.url}`)
          }
        }

        return JSON.stringify(slot)
      } catch (error) {
        console.error(`❌ Erreur parsing slot ${index + 1} pour ${escort.id}`)
        return slotJson
      }
    })

    // Mettre à jour si des changements
    if (updated) {
      await prisma.escort.update({
        where: { id: escort.id },
        data: {
          mediaSlot1: newSlots[0],
          mediaSlot2: newSlots[1],
          mediaSlot3: newSlots[2],
          mediaSlot4: newSlots[3],
          mediaSlot5: newSlots[4],
        }
      })
    }
  }

  console.log(`\n📊 Résultat:`)
  console.log(`   🎥 Vidéos trouvées: ${totalVideos}`)
  console.log(`   ✅ Thumbnails ajoutés: ${totalFixed}`)
  console.log(`   ⚠️  Non corrigées: ${totalVideos - totalFixed}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
