import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const profileId = searchParams.get('profileId')
    const profileType = searchParams.get('profileType')

    if (!profileId) {
      return NextResponse.json({ error: 'profileId required' }, { status: 400 })
    }

    // Pour l'instant, retourner un tableau vide car le système de commentaires n'est pas encore implémenté
    // TODO: Implémenter le système de commentaires complet avec base de données
    return NextResponse.json({
      success: true,
      comments: [],
      total: 0
    })

  } catch (error) {
    console.error('[API Comments] Error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, profileType, content, rating } = body

    if (!profileId || !content) {
      return NextResponse.json({ error: 'profileId and content required' }, { status: 400 })
    }

    // Pour l'instant, simuler la création du commentaire
    // TODO: Implémenter la création de commentaires en base de données
    return NextResponse.json({
      success: true,
      comment: {
        id: `temp-${Date.now()}`,
        content,
        rating: rating || 5,
        createdAt: new Date().toISOString(),
        user: {
          name: 'Utilisateur anonyme',
          avatar: null
        }
      }
    })

  } catch (error) {
    console.error('[API Comments] POST Error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}