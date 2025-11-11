import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  // Vérifier quelques vidéos
  const videos = await prisma.media.findMany({
    where: {
      type: 'VIDEO',
      deletedAt: null,
      url: {
        contains: 'b-cdn.net'
      }
    },
    select: {
      id: true,
      url: true,
      thumbUrl: true,
      ownerId: true,
      ownerType: true
    },
    take: 5
  })

  // Vérifier les slots escort
  const escorts = await prisma.escortProfileV2.findMany({
    where: {
      deletedAt: null,
      OR: [
        { mediaSlot1: { not: null } },
        { mediaSlot2: { not: null } },
      ]
    },
    select: {
      id: true,
      stageName: true,
      mediaSlot1: true,
      mediaSlot2: true,
    },
    take: 3
  })

  const parsedSlots = escorts.map(e => {
    const slot1 = e.mediaSlot1 ? JSON.parse(e.mediaSlot1 as string) : null
    const slot2 = e.mediaSlot2 ? JSON.parse(e.mediaSlot2 as string) : null
    return {
      id: e.id,
      stageName: e.stageName,
      slot1: slot1 ? { url: slot1.url, thumb: slot1.thumb, type: slot1.url?.includes('.m3u8') ? 'video' : 'image' } : null,
      slot2: slot2 ? { url: slot2.url, thumb: slot2.thumb, type: slot2.url?.includes('.m3u8') ? 'video' : 'image' } : null,
    }
  })

  return NextResponse.json({
    mediaTableVideos: videos,
    escortSlots: parsedSlots
  })
}
