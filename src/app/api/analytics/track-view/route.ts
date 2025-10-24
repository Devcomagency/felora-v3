import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[ANALYTICS DEBUG] Received:', body)

    const { profileId, profileType } = body

    if (!profileId || !profileType) {
      console.log('[ANALYTICS DEBUG] Missing params:', { profileId, profileType })
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    console.log('[ANALYTICS DEBUG] Processing profile view:', { profileId, profileType })

    // Traitement selon le type de profil
    if (profileType === 'escort') {
      // Vues de profil escort
      await prisma.escortProfile.update({
        where: { id: profileId },
        data: {
          views: {
            increment: 1
          }
        }
      })
      console.log('[ANALYTICS DEBUG] ✅ Escort profile view tracked')
    } else if (profileType === 'club') {
      // Vues de profil club
      await prisma.clubProfile.update({
        where: { id: profileId },
        data: {
          views: {
            increment: 1
          }
        }
      })
      console.log('[ANALYTICS DEBUG] ✅ Club profile view tracked')
    } else {
      console.log('[ANALYTICS DEBUG] ⚠️ Unknown profile type:', profileType)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur tracking vue:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}