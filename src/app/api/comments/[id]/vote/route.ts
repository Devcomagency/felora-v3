import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params
    const body = await request.json()
    const { type } = body // 'upvote' or 'downvote'

    if (!commentId || !type) {
      return NextResponse.json({ error: 'commentId and type required' }, { status: 400 })
    }

    // Pour l'instant, simuler le vote
    // TODO: Implémenter le système de votes en base de données
    return NextResponse.json({
      success: true,
      message: `Vote ${type} enregistré`,
      votes: {
        upvotes: 5,
        downvotes: 1
      }
    })

  } catch (error) {
    console.error('[API Comments Vote] Error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}