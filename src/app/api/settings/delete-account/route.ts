import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { email } = await request.json()

    // Vérifier que l'email correspond
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true }
    })

    if (!user || user.email !== email) {
      return NextResponse.json(
        { error: 'Email incorrect' },
        { status: 400 }
      )
    }

    // Supprimer l'utilisateur et toutes ses données associées
    // Prisma va gérer les suppressions en cascade grâce aux relations
    await prisma.$transaction(async (tx) => {
      // Supprimer les médias
      await tx.media.deleteMany({
        where: {
          OR: [
            { ownerType: 'ESCORT', ownerId: session.user.id },
            { ownerType: 'CLUB', ownerId: session.user.id }
          ]
        }
      })

      // Supprimer le profil escort si existe
      await tx.escortProfile.deleteMany({
        where: { userId: session.user.id }
      })

      // Supprimer le profil club si existe
      await tx.clubProfileV2.deleteMany({
        where: { userId: session.user.id }
      })

      // Supprimer l'utilisateur
      await tx.user.delete({
        where: { id: session.user.id }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Compte supprimé avec succès'
    })
  } catch (error) {
    console.error('Erreur suppression compte:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du compte' },
      { status: 500 }
    )
  }
}
