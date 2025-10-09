import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { jwtVerify } from 'jose'
import { sseBroadcaster } from '@/lib/sse-broadcast'

export async function POST(request: NextRequest) {
  try {
    const { conversationId, userId } = await request.json()

    if (!conversationId || !userId) {
      return NextResponse.json({
        error: 'Paramètres requis manquants'
      }, { status: 400 })
    }

    // Authentification
    let session = await getServerSession(authOptions)
    let user = null

    if (session?.user?.id) {
      user = session.user
    } else {
      // Fallback : décoder le JWT directement
      const cookieHeader = request.headers.get('cookie')
      const sessionToken = cookieHeader?.match(/next-auth\.session-token=([^;]+)/)?.[1]

      if (sessionToken) {
        try {
          const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
          const { payload } = await jwtVerify(sessionToken, secret)

          if (payload.sub) {
            user = {
              id: payload.sub,
              email: payload.email as string,
              name: payload.name as string,
              role: (payload as any).role as string,
            }
          }
        } catch (jwtError) {
          console.error('[TYPING API] Error decoding JWT:', jwtError)
        }
      }
    }

    if (!user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur correspond
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Action non autorisée' }, { status: 403 })
    }

    // Diffuser l'événement d'arrêt de frappe
    console.log(`[TYPING API] User ${userId} stopped typing in conversation ${conversationId}`)

    sseBroadcaster.broadcast(conversationId, {
      type: 'typing_stop',
      conversationId,
      userId,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Indicateur de frappe arrêté'
    })

  } catch (error) {
    console.error('Erreur lors de l\'arrêt de l\'indicateur de frappe:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
