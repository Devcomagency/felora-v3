import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * API pour confirmer l'upload d'un média (après upload vers R2 avec presigned URL)
 * Sauvegarde les métadonnées en base de données
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { publicUrl, key, type, visibility, pos, description, price } = body

    if (!publicUrl || !key) {
      return NextResponse.json({
        error: 'publicUrl et key requis'
      }, { status: 400 })
    }

    console.log('✅ Confirmation upload média:', {
      userId: session.user.id,
      type,
      visibility,
      key
    })

    // Déterminer le type de profil (escort ou club)
    let ownerType = 'ESCORT'
    let ownerId = session.user.id

    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id }
    })

    const clubProfile = await prisma.clubProfileV2.findUnique({
      where: { userId: session.user.id }
    })

    if (clubProfile) {
      ownerType = 'CLUB'
      ownerId = clubProfile.id
    } else if (escortProfile) {
      ownerType = 'ESCORT'
      ownerId = escortProfile.id
    }

    // Mapper la visibilité
    let visibilityEnum: 'PUBLIC' | 'PREMIUM' | 'PRIVATE' = 'PUBLIC'
    if (visibility === 'premium') visibilityEnum = 'PREMIUM'
    else if (visibility === 'private') visibilityEnum = 'PRIVATE'

    // Trouver la position maximale actuelle pour cet owner
    // IMPORTANT: Seuls les médias avec pos >= 2 sont dans le feed
    // pos 0 = avatar dashboard, pos 1 = première photo profil
    const maxPosMedia = await prisma.media.findFirst({
      where: {
        ownerType: ownerType as any,
        ownerId: ownerId,
        deletedAt: null,
        pos: { gte: 2 } // Seulement les médias du feed
      },
      orderBy: { pos: 'desc' },
      select: { pos: true }
    })

    // Si pos fourni et >= 2, l'utiliser. Sinon, calculer automatiquement
    let newPos: number
    if (pos !== undefined && parseInt(pos) >= 2) {
      newPos = parseInt(pos)
    } else {
      // Nouvelle position = max + 1, minimum 2 (début du feed)
      newPos = Math.max(2, (maxPosMedia?.pos ?? 1) + 1)
    }

    console.log('📍 Position calculée:', {
      maxPos: maxPosMedia?.pos ?? 1,
      newPos,
      providedPos: pos,
      ownerType,
      ownerId
    })

    // Sauvegarder en base
    const media = await prisma.media.create({
      data: {
        ownerType: ownerType as any,
        ownerId: ownerId,
        type: type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        url: publicUrl,
        thumbUrl: null, // Pas de thumbnail pour les images uploadées via R2
        description: description || null,
        visibility: visibilityEnum,
        price: visibility === 'premium' && price ? parseInt(price) : null,
        pos: newPos,
        createdAt: new Date(),
      }
    })

    console.log('💾 Média confirmé et sauvegardé:', {
      mediaId: media.id,
      ownerType,
      ownerId
    })

    return NextResponse.json({
      success: true,
      media: {
        id: media.id,
        url: media.url,
        thumbUrl: media.thumbUrl,
        type: media.type,
      }
    })

  } catch (error: any) {
    console.error('❌ Erreur confirmation upload:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur confirmation'
    }, { status: 500 })
  }
}
