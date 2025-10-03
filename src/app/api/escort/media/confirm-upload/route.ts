import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type MediaItem = {
  id: string
  url: string
  type: 'image' | 'video'
  isPrivate: boolean
  uploadedAt: string
  slot?: 0|1|2|3|4|5
}

const SLOT_DEFAULT_TYPES: Record<number, 'image'|'video'> = {
  0: 'image',
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

/**
 * Étape 2: Confirmer l'upload et mettre à jour les slots escort
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
      select: { userId: true, profilePhoto: true, galleryPhotos: true }
    })
    if (!escortProfile) {
      return NextResponse.json({ success: false, error: 'Profil escorte non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    const { publicUrl, slot, isPrivate, fileType } = body

    if (!publicUrl) {
      return NextResponse.json({ success: false, error: 'publicUrl requis' }, { status: 400 })
    }

    const slotNum = Number(slot)
    if (!Number.isFinite(slotNum) || slotNum < 0 || slotNum > 5) {
      return NextResponse.json({ success: false, error: 'Paramètre slot invalide (0..5 requis)' }, { status: 400 })
    }

    console.log('💾 [ESCORT] Confirmation upload:', {
      userId: session.user.id,
      publicUrl,
      slot: slotNum,
      isPrivate
    })

    // Normaliser les 6 slots existants
    const slots = normalizeSixSlots(escortProfile.galleryPhotos)

    // Déterminer le type
    const actualType: 'image'|'video' = fileType?.startsWith('video/') ? 'video' : 'image'

    // Remplacer le slot choisi
    slots[slotNum] = {
      id: `media-${Date.now()}-${slotNum}`,
      url: publicUrl,
      type: actualType,
      isPrivate: Boolean(isPrivate),
      uploadedAt: new Date().toISOString(),
      slot: slotNum as 0|1|2|3|4|5,
    }

    // Recompute counters
    const photosCount = slots.filter(s => s.url && s.type === 'image').length
    const videosCount = slots.filter(s => s.url && s.type === 'video').length
    const hasProfilePhoto = !!slots[0]?.url

    // Si slot 0 → aussi mettre à jour profilePhoto
    const dataUpdate: any = {
      galleryPhotos: JSON.stringify(slots),
      photosCount,
      videosCount,
      hasProfilePhoto,
      updatedAt: new Date(),
    }
    if (slotNum === 0) {
      dataUpdate.profilePhoto = publicUrl
    }

    await prisma.escortProfile.update({
      where: { userId: session.user.id },
      data: dataUpdate,
    })

    console.log('✅ [ESCORT] Slot mis à jour:', { slot: slotNum, url: publicUrl })

    return NextResponse.json({
      success: true,
      message: `Slot ${slotNum} mis à jour`,
      slot: slotNum,
      url: publicUrl,
      type: actualType,
      slots, // renvoyer l'état normalisé pour MAJ immédiate UI
    })

  } catch (error: any) {
    console.error('❌ [ESCORT] Erreur confirmation upload:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la sauvegarde',
      details: error.message
    }, { status: 500 })
  }
}
