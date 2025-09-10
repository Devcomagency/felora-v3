import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { profileId, profileType } = await request.json()

    if (!profileId || !profileType) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (profileType === 'escort') {
      // Incrémenter les vues du profil escort
      await prisma.escortProfile.update({
        where: { id: profileId },
        data: {
          views: {
            increment: 1
          }
        }
      })
    } else if (profileType === 'club') {
      // Incrémenter les vues du profil club
      await prisma.clubProfile.update({
        where: { id: profileId },
        data: {
          views: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur tracking vue:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}