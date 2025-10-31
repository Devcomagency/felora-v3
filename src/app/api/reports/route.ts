import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    const body = await request.json()
    const { type, targetId, reason, details } = body

    if (!type || !targetId || !reason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('[REPORT] New report:', { type, targetId, reason })

    // Si c'est un signalement de média, on incrémente reportCount
    if (type === 'media') {
      // Si targetId est une URL, on cherche le média par URL
      let mediaId = targetId

      // Si c'est une URL complète, chercher le média
      if (targetId.startsWith('http')) {
        const media = await prisma.media.findFirst({
          where: { url: targetId },
          select: { id: true }
        })

        if (!media) {
          return NextResponse.json(
            { success: false, error: 'Media not found' },
            { status: 404 }
          )
        }

        mediaId = media.id
      }

      await prisma.media.update({
        where: { id: mediaId },
        data: {
          reportCount: { increment: 1 },
          reportedAt: new Date(),
          reportReason: reason // Dernière raison
        }
      })

      console.log('[REPORT] Media report count incremented for:', mediaId)
    }

    // Optionnel : Créer un enregistrement de signalement dans une table dédiée
    // Pour l'instant on met juste à jour le média

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully'
    })
  } catch (error) {
    console.error('[REPORT] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit report' },
      { status: 500 }
    )
  }
}
