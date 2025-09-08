import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type MediaItem = {
  id: string
  url: string
  type: 'image' | 'video'
  isPrivate: boolean
  uploadedAt: string
  slot: 0|1|2|3|4|5
}

const SLOT_DEFAULT_TYPES: Record<number, 'image'|'video'> = {
  0: 'image', // photo de profil
  1: 'video',
  2: 'image',
  3: 'video',
  4: 'image',
  5: 'image',
}

function normalizeSixSlots(galleryPhotos: any): MediaItem[] {
  let parsed: any[] = []
  try {
    parsed = Array.isArray(galleryPhotos) ? galleryPhotos : JSON.parse(galleryPhotos || '[]')
  } catch { parsed = [] }

  // Indexer par slot si déjà présent
  const bySlot = new Map<number, MediaItem>()
  for (const it of parsed) {
    const s = Number((it?.slot ?? -1))
    if (s >= 0 && s <= 5 && it?.url) {
      bySlot.set(s, {
        id: String(it.id ?? `media-${Date.now()}-${s}`),
        url: String(it.url),
        type: (it.type === 'video' ? 'video' : 'image'),
        isPrivate: Boolean(it.isPrivate),
        uploadedAt: String(it.uploadedAt ?? new Date().toISOString()),
        slot: s as 0|1|2|3|4|5,
      })
    }
  }

  // Construire 6 slots avec type par défaut
  const out: MediaItem[] = Array.from({ length: 6 }, (_, i) => {
    const existing = bySlot.get(i)
    if (existing) return existing
    return {
      id: `media-empty-${i}`,
      url: '',
      type: SLOT_DEFAULT_TYPES[i]!,
      isPrivate: false,
      uploadedAt: new Date().toISOString(),
      slot: i as 0|1|2|3|4|5,
    }
  })
  return out
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
      select: { 
        userId: true, 
        profilePhoto: true, 
        galleryPhotos: true,
        photosCount: true,
        videosCount: true,
        hasProfilePhoto: true
      }
    })

    if (!escortProfile) {
      return NextResponse.json({ success: false, error: 'Profil escorte non trouvé' }, { status: 404 })
    }

    // Normaliser les 6 slots
    const slots = normalizeSixSlots(escortProfile.galleryPhotos)

    // Statistiques
    const photosCount = slots.filter(s => s.url && s.type === 'image').length
    const videosCount = slots.filter(s => s.url && s.type === 'video').length
    const hasProfilePhoto = !!slots[0]?.url

    return NextResponse.json({
      success: true,
      slots,
      stats: {
        photosCount,
        videosCount,
        hasProfilePhoto,
        totalMedia: photosCount + videosCount
      }
    })
  } catch (error) {
    console.error('Erreur récupération médias:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}