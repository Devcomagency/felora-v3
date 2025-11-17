import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateThumbnailUrl(videoUrl: string): string | null {
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

function isVideoUrl(url: string): boolean {
  return url.includes('.m3u8') || url.includes('/playlist')
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Recherche des escorts avec vidéos dans mediaSlots...')

    const escorts = await prisma.escortProfileV2.findMany({
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
    const details: string[] = []

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

          if (slot.url && isVideoUrl(slot.url) && !slot.thumb) {
            totalVideos++
            const thumbUrl = generateThumbnailUrl(slot.url)

            if (thumbUrl) {
              const msg = `✅ ${escort.stageName || escort.id} - Slot ${index + 1}: ${thumbUrl}`
              console.log(msg)
              details.push(msg)
              slot.thumb = thumbUrl
              updated = true
              totalFixed++
            } else {
              const msg = `⚠️  ${escort.stageName || escort.id} - Slot ${index + 1}: Impossible de générer thumbnail`
              console.log(msg)
              details.push(msg)
            }
          }

          return JSON.stringify(slot)
        } catch (error) {
          console.error(`❌ Erreur parsing slot ${index + 1} pour ${escort.id}`)
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

    return NextResponse.json({
      success: true,
      videosFound: totalVideos,
      thumbnailsAdded: totalFixed,
      notFixed: totalVideos - totalFixed,
      details
    })

  } catch (error: any) {
    console.error('❌ Erreur:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
