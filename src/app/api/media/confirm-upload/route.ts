import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * API pour confirmer l'upload et sauvegarder les métadonnées après upload direct vers R2
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { publicUrl, type, visibility, price, pos, description } = body

    if (!publicUrl) {
      return NextResponse.json({ success: false, error: 'publicUrl requis' }, { status: 400 })
    }

    console.log('💾 Confirmation upload:', {
      userId: session.user.id,
      publicUrl,
      type,
      visibility
    })

    // Déterminer le type de profil (escort ou club)
    let ownerType = 'ESCORT'
    let ownerId = session.user.id
    let profileId = session.user.id

    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id }
    })

    const clubProfile = await prisma.clubProfileV2.findUnique({
      where: { userId: session.user.id }
    })

    if (clubProfile) {
      ownerType = 'CLUB'
      ownerId = clubProfile.id
      profileId = clubProfile.id
    } else if (escortProfile) {
      ownerType = 'ESCORT'
      ownerId = escortProfile.id
      profileId = escortProfile.id
    }

    // Mapper la visibilité vers l'enum Prisma (accepter minuscules et majuscules)
    let visibilityEnum: 'PUBLIC' | 'PREMIUM' | 'PRIVATE' = 'PUBLIC'
    const visibilityLower = (visibility || 'public').toLowerCase()

    if (visibilityLower === 'premium') visibilityEnum = 'PREMIUM'
    else if (visibilityLower === 'private') visibilityEnum = 'PRIVATE'
    else visibilityEnum = 'PUBLIC' // Par défaut PUBLIC

    console.log('🔍 Visibilité mappée:', { input: visibility, output: visibilityEnum })

    // Sauvegarder en base de données
    const media = await prisma.media.create({
      data: {
        ownerType: ownerType as any,
        ownerId: ownerId,
        type: (type || 'VIDEO') as any,
        url: publicUrl,
        description: description || null,
        visibility: visibilityEnum,
        price: visibility === 'premium' && price ? parseInt(price) : null,
        pos: pos ? parseInt(pos) : 0,
        createdAt: new Date()
      }
    })

    console.log('✅ Média sauvegardé:', {
      id: media.id,
      ownerType,
      ownerId,
      url: publicUrl
    })

    // Déterminer l'URL de redirection
    let redirectUrl = `/profile/${session.user.id}`

    if (clubProfile) {
      redirectUrl = `/profile-test/club/${clubProfile.handle}`
    } else if (escortProfile) {
      redirectUrl = `/profile/${escortProfile.id}`
    }

    return NextResponse.json({
      success: true,
      message: 'Média ajouté au profil',
      mediaId: media.id, // Pour compatibilité avec MediaManager
      media: {
        id: media.id,
        url: publicUrl,
        type: media.type,
        pos: media.pos
      },
      redirectUrl,
      userType: ownerType,
      profileId
    })

  } catch (error: any) {
    console.error('❌ Erreur confirmation upload:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la sauvegarde',
      details: error.message
    }, { status: 500 })
  }
}
