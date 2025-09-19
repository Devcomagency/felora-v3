import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mediaStorage } from '@/lib/storage'

type MediaItem = {
  id: string
  url: string
  type: 'image' | 'video'
  isPrivate: boolean
  uploadedAt: string
  slot?: 0|1|2|3|4|5
}

const SLOT_DEFAULT_TYPES: Record<number, 'image'|'video'> = {
  0: 'image', // photo de profil (stockée séparément ET en slot 0 pour la grille)
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

async function uploadFileToStorage(file: File, folder: string = 'profiles'): Promise<string> {
  const result = await mediaStorage.upload(file, folder)
  if (!result?.success || !result?.url) {
    throw new Error(result?.error || 'Upload failed')
  }
  return result.url
}

export async function POST(request: NextRequest) {
  console.log('🚀 [UPLOAD API] Starting upload request')
  try {
    const session = await getServerSession(authOptions)
    console.log('🚀 [UPLOAD API] Session check:', session?.user?.id ? 'OK' : 'MISSING')
    if (!session?.user?.id) {
      console.log('❌ [UPLOAD API] No session, returning 401')
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id },
      select: { userId: true, profilePhoto: true, galleryPhotos: true }
    })
    if (!escortProfile) {
      return NextResponse.json({ success: false, error: 'Profil escorte non trouvé' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    // nouveaux paramètres: "slot" OBLIGATOIRE (0..5)
    const slotRaw = formData.get('slot')
    const isPrivateRaw = formData.get('isPrivate')
    const isPrivate = String(isPrivateRaw ?? '') === 'true'

    const slot = Number(slotRaw)
    if (!Number.isFinite(slot) || slot < 0 || slot > 5) {
      return NextResponse.json({ success: false, error: 'Paramètre slot invalide (0..5 requis)' }, { status: 400 })
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni' }, { status: 400 })
    }
    if (!file.type?.startsWith('image/') && !file.type?.startsWith('video/')) {
      return NextResponse.json({ success: false, error: 'Type de fichier non supporté (image/* ou video/*)' }, { status: 400 })
    }
    // Limite Vercel : 4.5MB pour les uploads
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Fichier trop volumineux (>4MB). Veuillez compresser votre vidéo.' }, { status: 400 })
    }

    console.log('🚀 [UPLOAD API] About to call uploadFileToStorage with file:', file.name, file.size)
    const url = await uploadFileToStorage(file, 'profiles')
    console.log('🚀 [UPLOAD API] uploadFileToStorage returned URL:', url ? 'SUCCESS' : 'FAILED')

    // Normaliser les 6 slots existants
    const slots = normalizeSixSlots(escortProfile.galleryPhotos)

    // Déterminer le type attendu par slot, mais accepter l'autre type quand même
    const expectedType = SLOT_DEFAULT_TYPES[slot]
    const actualType: 'image'|'video' = file.type.startsWith('video/') ? 'video' : 'image'

    // Remplacer le slot choisi
    slots[slot] = {
      id: `media-${Date.now()}-${slot}`,
      url,
      type: actualType,
      isPrivate,
      uploadedAt: new Date().toISOString(),
      slot: slot as 0|1|2|3|4|5,
    }

    // Recompute counters for completion
    const photosCount = slots.filter(s => s.url && s.type === 'image').length
    const videosCount = slots.filter(s => s.url && s.type === 'video').length
    const hasProfilePhoto = !!slots[0]?.url

    // Si slot 0 → aussi mettre à jour profilePhoto (string dédiée)
    const dataUpdate: any = {
      galleryPhotos: JSON.stringify(slots),
      photosCount,
      videosCount,
      hasProfilePhoto,
      updatedAt: new Date(),
    }
    if (slot === 0) {
      dataUpdate.profilePhoto = url
    }

    await prisma.escortProfile.update({
      where: { userId: session.user.id },
      data: dataUpdate,
    })

    return NextResponse.json({
      success: true,
      message: `Slot ${slot} mis à jour`,
      slot,
      url,
      type: actualType,
      slots, // renvoyer l'état normalisé pour MAJ immédiate UI
    })
  } catch (error) {
    console.error('Erreur upload média:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur lors de l\'upload' }, { status: 500 })
  }
}
