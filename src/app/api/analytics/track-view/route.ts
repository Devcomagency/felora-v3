import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[ANALYTICS DEBUG] Received:', body)

    // Support des deux formats : ancien (profileId/profileType) et nouveau (targetId/viewType)
    const { 
      profileId, 
      profileType, 
      targetId, 
      viewType 
    } = body

    // Déterminer les paramètres finaux
    const finalTargetId = targetId || profileId
    const finalViewType = viewType || profileType

    if (!finalTargetId || !finalViewType) {
      console.log('[ANALYTICS DEBUG] Missing params:', { finalTargetId, finalViewType })
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    console.log('[ANALYTICS DEBUG] Processing view:', { finalTargetId, finalViewType })

    // Traitement selon le type de vue
    if (finalViewType === 'escort' || finalViewType === 'profile') {
      // Vues de profil escort
      await prisma.escortProfile.update({
        where: { id: finalTargetId },
        data: {
          views: {
            increment: 1
          }
        }
      })
      console.log('[ANALYTICS DEBUG] ✅ Escort profile view tracked')
    } else if (finalViewType === 'club') {
      // Vues de profil club
      await prisma.clubProfile.update({
        where: { id: finalTargetId },
        data: {
          views: {
            increment: 1
          }
        }
      })
      console.log('[ANALYTICS DEBUG] ✅ Club profile view tracked')
    } else if (finalViewType === 'media') {
      // Vues de média - créer une entrée dans la table media_views
      try {
        await prisma.mediaView.create({
          data: {
            mediaId: finalTargetId,
            timestamp: new Date()
          }
        })
        console.log('[ANALYTICS DEBUG] ✅ Media view tracked')
      } catch (mediaError) {
        // Si la table n'existe pas encore, on log mais on continue
        console.log('[ANALYTICS DEBUG] ⚠️ Media view table not ready, skipping:', mediaError)
      }
    } else {
      console.log('[ANALYTICS DEBUG] ⚠️ Unknown view type:', finalViewType)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur tracking vue:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}