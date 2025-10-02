import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Rediriger vers l'API avec l'ID de l'utilisateur
    const url = new URL(`/api/profile/unified/${session.user.id}`, req.url)
    return NextResponse.redirect(url)
  } catch (error) {
    console.error('❌ [API UNIFIED ME] Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Rediriger vers l'API avec l'ID de l'utilisateur
    const url = new URL(`/api/profile/unified/${session.user.id}`, req.url)
    return NextResponse.redirect(url)
  } catch (error) {
    console.error('❌ [API UNIFIED ME] Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}