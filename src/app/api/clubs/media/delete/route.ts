import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/clubs/media/delete
 * Supprime un média de club par URL
 *
 * Body: { url: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL manquante' },
        { status: 400 }
      )
    }

    console.log('🗑️ [CLUB MEDIA DELETE] Request:', {
      userId: session.user.id,
      url: url.substring(0, 50)
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
      select: { id: true, userId: true }
    })

    if (!club) {
      return NextResponse.json(
        { success: false, error: 'Club non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est le propriétaire du club
    if (club.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé : vous n\'êtes pas le propriétaire de ce club' },
        { status: 403 }
      )
    }

    // Supprimer le média
    await prisma.media.delete({
      where: { id: media.id }
    })

    // Mettre à jour updatedAt du club pour forcer le cache-buster
    await prisma.clubProfileV2.update({
      where: { id: club.id },
      data: { updatedAt: new Date() }
    })

    console.log('✅ [CLUB MEDIA DELETE] Media deleted:', {
      id: media.id,
      url: media.url.substring(0, 50),
      pos: media.pos
    })

    return NextResponse.json({
      success: true,
      message: 'Média supprimé avec succès'
    })

  } catch (error: any) {
    console.error('❌ [CLUB MEDIA DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer le profil club
    const club = await prisma.clubProfileV2.findUnique({
      where: { userId: session.user.id }
    })

    if (!club) {
      return NextResponse.json(
        { success: false, error: 'Profil club non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les paramètres de suppression
    const { searchParams } = new URL(request.url)
    const posParam = searchParams.get('pos')

    if (!posParam) {
      return NextResponse.json(
        { success: false, error: 'Position manquante (paramètre pos requis)' },
        { status: 400 }
      )
    }

    const pos = parseInt(posParam, 10)
    if (isNaN(pos) || pos < 0 || pos > 3) {
      return NextResponse.json(
        { success: false, error: 'Position invalide (0-3 requis)' },
        { status: 400 }
      )
    }

    // Supprimer le média du club à cette position
    const deletedMedia = await prisma.media.deleteMany({
      where: {
        ownerType: 'CLUB',
        ownerId: club.id,
        pos: pos
      }
    })

    if (deletedMedia.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun média trouvé à cette position' },
        { status: 404 }
      )
    }

    // Mettre à jour aussi les champs avatarUrl/coverUrl dans ClubDetails
    if (pos === 0) {
      // Photo de profil supprimée
      await prisma.clubDetails.updateMany({
        where: { clubId: club.id },
        data: { avatarUrl: null }
      })
    } else if (pos === 1) {
      // Photo de couverture supprimée
      await prisma.clubDetails.updateMany({
        where: { clubId: club.id },
        data: { coverUrl: null }
      })
    }

    // ✅ IMPORTANT : Mettre à jour updatedAt du club pour forcer le cache-buster
    await prisma.clubProfileV2.update({
      where: { id: club.id },
      data: { updatedAt: new Date() }
    })

    console.log(`Média supprimé pour club ${club.id} à la position ${pos}`)

    return NextResponse.json({
      success: true,
      message: 'Média supprimé avec succès',
      pos: pos,
      deletedCount: deletedMedia.count
    })

  } catch (error) {
    console.error('Erreur suppression média club:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}