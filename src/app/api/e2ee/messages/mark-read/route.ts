import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { jwtVerify } from 'jose'
import { sseBroadcaster } from '@/lib/sse-broadcast'

export async function POST(request: NextRequest) {
  try {
    const { conversationId, userId } = await request.json()
    
    if (!conversationId || !userId) {
      return NextResponse.json({ error: 'Paramètres requis manquants' }, { status: 400 })
    }

    // Authentification
    let session = await getServerSession(authOptions)
    let user = null
    
    if (session?.user?.id) {
      user = session.user
    } else {
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
          console.error('[MARK READ] Error decoding JWT:', jwtError)
        }
      }
    }
    
    if (!user?.id || user.id !== userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Marquer tous les messages non lus comme lus
    const now = new Date()
    const updatedMessages = await prisma.e2EEMessageEnvelope.updateMany({
      where: {
        conversationId,
        senderUserId: { not: userId }, // Pas mes propres messages
        readAt: null // Seulement les non lus
      },
      data: {
        readAt: now,
        status: 'READ'
      }
    })

    console.log(`[MARK READ] ${updatedMessages.count} messages marqués comme lus dans ${conversationId}`)

    // Notifier via SSE
    if (updatedMessages.count > 0) {
      sseBroadcaster.broadcast(conversationId, {
        type: 'messages_read' as any,
        userId,
        timestamp: now.toISOString()
      })
    }

    return NextResponse.json({ success: true, count: updatedMessages.count })

  } catch (error) {
    console.error('[MARK READ] Error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

