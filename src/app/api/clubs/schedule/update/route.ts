import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { schedule, isOpen24_7 } = body

    console.log(`Horaires club ${club.id}:`, { schedule, isOpen24_7 })

    // TODO: Sauvegarder les horaires en base de données
    // Pour l'instant, retourner un succès simulé

    return NextResponse.json({
      ok: true,
      message: 'Horaires sauvegardés'
    })

  } catch (error) {
    console.error('Erreur sauvegarde horaires club:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}