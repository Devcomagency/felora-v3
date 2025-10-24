import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')

    if (!mediaId) {
      return NextResponse.json({ error: 'MediaId manquant' }, { status: 400 })
    }

    console.log('[MEDIA VIEWS] Fetching views for mediaId:', mediaId)

    // Compter les vues pour ce média
    const viewCount = await prisma.mediaView.count({
      where: {
        mediaId: mediaId
      }
    })

    console.log('[MEDIA VIEWS] Found', viewCount, 'views for mediaId:', mediaId)

    return NextResponse.json({ 
      success: true, 
      viewCount,
      mediaId 
    })

  } catch (error) {
    console.error('[MEDIA VIEWS] Erreur récupération vues média:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
