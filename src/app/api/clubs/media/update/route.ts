import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/clubs/media/update
 * Met à jour la visibilité d'un média de club
 *
 * Body: { url: string, visibility: 'PUBLIC' | 'PRIVATE' }
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { url, visibility } = body

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL manquante' },
        { status: 400 }
      )
    }

    if (!visibility || !['PUBLIC', 'PRIVATE'].includes(visibility)) {
      return NextResponse.json(
        { success: false, error: 'Visibilité invalide (PUBLIC ou PRIVATE uniquement)' },
        { status: 400 }
      )
    }

    console.log('🔄 [CLUB MEDIA UPDATE] Request:', {
      userId,
      url: url.substring(0, 50),
      visibility
    })

    // Trouver le média par URL
    const media = await prisma.media.findFirst({
      where: {
        url,
        ownerType: 'CLUB'
      }
    })

    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Média non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer le club pour vérifier le ownership
    const club = await prisma.clubProfileV2.findUnique({
      where: { id: media.ownerId },
      select: { userId: true }
    })

    if (!club) {
      return NextResponse.json(
        { success: false, error: 'Club non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est le propriétaire du club
    if (club.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé : vous n\'êtes pas le propriétaire de ce club' },
        { status: 403 }
      )
    }

    // Mettre à jour la visibilité
    const updatedMedia = await prisma.media.update({
      where: { id: media.id },
      data: { visibility }
    })

    // Mettre à jour updatedAt du club pour forcer le cache-buster
    await prisma.clubProfileV2.update({
      where: { id: media.ownerId },
      data: { updatedAt: new Date() }
    })

    console.log('✅ [CLUB MEDIA UPDATE] Media updated:', {
      id: updatedMedia.id,
      url: updatedMedia.url.substring(0, 50),
      oldVisibility: media.visibility,
      newVisibility: updatedMedia.visibility
    })

    return NextResponse.json({
      success: true,
      media: {
        id: updatedMedia.id,
        url: updatedMedia.url,
        visibility: updatedMedia.visibility
      }
    })

  } catch (error: any) {
    console.error('❌ [CLUB MEDIA UPDATE] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur serveur'
      },
      { status: 500 }
    )
  }
}
