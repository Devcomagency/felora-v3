import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  // Prendre un profil au hasard avec des vidéos
  const profile = await prisma.escortProfile.findFirst({
    select: {
      id: true,
      stageName: true,
      mediaSlot1: true,
      mediaSlot2: true,
    }
  })

  if (!profile) {
    return NextResponse.json({ error: 'No profile found' })
  }

  const slot1 = profile.mediaSlot1 ? JSON.parse(profile.mediaSlot1 as string) : null
  const slot2 = profile.mediaSlot2 ? JSON.parse(profile.mediaSlot2 as string) : null

  return NextResponse.json({
    profile: {
      id: profile.id,
      name: profile.stageName,
    },
    slot1: slot1 ? {
      url: slot1.url,
      thumb: slot1.thumb,
      isVideo: slot1.url?.includes('.m3u8')
    } : null,
    slot2: slot2 ? {
      url: slot2.url,
      thumb: slot2.thumb,
      isVideo: slot2.url?.includes('.m3u8')
    } : null
  })
}
