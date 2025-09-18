import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params
    const body = await request.json()
    const { reason } = body

    if (!commentId || !reason) {
      return NextResponse.json({ error: 'commentId and reason required' }, { status: 400 })
    }

    // Pour l'instant, simuler le signalement
    // TODO: Implémenter le système de signalements en base de données
    return NextResponse.json({
      success: true,
      message: 'Commentaire signalé avec succès'
    })

  } catch (error) {
    console.error('[API Comments Report] Error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}