import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateThumbnailUrl(videoUrl) {
  // Bunny.net
  if (videoUrl.includes('b-cdn.net') && videoUrl.includes('/playlist.m3u8')) {
    return videoUrl.replace('/playlist.m3u8', '/thumbnail.jpg')
  }

  // Mux
  if (videoUrl.includes('stream.mux.com') && videoUrl.endsWith('.m3u8')) {
    const playbackId = videoUrl.split('/').pop()?.replace('.m3u8', '')
    if (playbackId) {
      return `https://image.mux.com/${playbackId}/thumbnail.jpg`
    }
  }

  return null
}

function isVideoUrl(url) {
  return url.includes('.m3u8') || url.includes('/playlist')
}

async function fixMediaTable() {
  console.log('🔍 Fixing Media table...')

  const videos = await prisma.media.findMany({
    where: {
      type: 'VIDEO',
      deletedAt: null,
      thumbUrl: null,
      url: {
        contains: '.m3u8'
      }
    }
  })

  console.log(`📊 Found ${videos.length} videos without thumbUrl`)

  let fixed = 0
  for (const video of videos) {
    const thumbUrl = generateThumbnailUrl(video.url)
    if (thumbUrl) {
      await prisma.media.update({
        where: { id: video.id },
        data: { thumbUrl }
      })
      console.log(`✅ ${video.id}: ${thumbUrl}`)
      fixed++
    }
  }

  return fixed
}

async function fixEscortSlots() {
  console.log('\n🔍 Fixing EscortProfileV2 slots...')

  const escorts = await prisma.escortProfileV2.findMany({
    where: {
      OR: [
        { mediaSlot1: { not: null } },
        { mediaSlot2: { not: null } },
        { mediaSlot3: { not: null } },
        { mediaSlot4: { not: null } },
        { mediaSlot5: { not: null } },
      ]
    }
  })

  console.log(`📊 Found ${escorts.length} escorts with media slots`)

  let fixed = 0
  for (const escort of escorts) {
    const slots = [
      escort.mediaSlot1,
      escort.mediaSlot2,
      escort.mediaSlot3,
      escort.mediaSlot4,
      escort.mediaSlot5,
    ]

    let updated = false
    const newSlots = slots.map((slotJson) => {
      if (!slotJson) return slotJson

      try {
        const slot = JSON.parse(slotJson)

        if (slot.url && isVideoUrl(slot.url) && !slot.thumb) {
          const thumbUrl = generateThumbnailUrl(slot.url)
          if (thumbUrl) {
            console.log(`✅ ${escort.stageName || escort.id}: ${thumbUrl}`)
            slot.thumb = thumbUrl
            updated = true
            fixed++
          }
        }

        return JSON.stringify(slot)
      } catch (error) {
        return slotJson
      }
    })

    if (updated) {
      await prisma.escortProfileV2.update({
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

  return fixed
}

async function main() {
  try {
    const mediaFixed = await fixMediaTable()
    const slotsFixed = await fixEscortSlots()

    console.log(`\n📊 RÉSULTAT:`)
    console.log(`   ✅ Media table: ${mediaFixed} thumbnails ajoutés`)
    console.log(`   ✅ Escort slots: ${slotsFixed} thumbnails ajoutés`)
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
