import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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