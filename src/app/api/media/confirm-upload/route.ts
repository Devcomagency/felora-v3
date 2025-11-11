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

    // Utiliser la position fournie ou 2 par défaut
    // pos 0 = avatar dashboard (SEUL protégé), pos >= 1 = feed
    // IMPORTANT: ne jamais défaut à 0 (sinon écrase l'avatar)
    const finalPos = (pos !== undefined && pos !== null && `${pos}`.trim() !== '')
      ? parseInt(pos)
      : 2

    console.log('📍 Position utilisée:', {
      providedPos: pos,
      finalPos,
      ownerType,
      ownerId
    })

    // Si on insère en position >= 1 (feed), décaler tous les médias existants >= à cette position
    // SAUF pos 0 qui est l'avatar dashboard et ne doit JAMAIS être décalé
    if (finalPos >= 1) {
      console.log('🔄 Décalage des médias existants à partir de la position', finalPos)

      await prisma.media.updateMany({
        where: {
          ownerType: ownerType as any,
          ownerId: ownerId,
          pos: { gte: finalPos },
          deletedAt: null,
          // Ne JAMAIS décaler pos 0 (avatar)
          NOT: { pos: 0 }
        },
        data: {
          pos: { increment: 1 }
        }
      })

      console.log('✅ Médias décalés (pos 0 préservé)')
    }

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
        pos: finalPos,
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
