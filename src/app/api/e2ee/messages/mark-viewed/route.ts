import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { jwtVerify } from 'jose'
import { sseBroadcaster } from '@/lib/sse-broadcast'

export async function POST(request: NextRequest) {
  try {
    const { messageId, userId } = await request.json()
    
    if (!messageId || !userId) {
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
          console.error('[MARK VIEWED] Error decoding JWT:', jwtError)
        }
      }
    }
    
    if (!user?.id || user.id !== userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer le message
    const message = await prisma.e2EEMessageEnvelope.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message introuvable' }, { status: 404 })
    }

    // Ajouter l'userId au tableau viewedBy
    const currentViewedBy = Array.isArray(message.viewedBy) ? message.viewedBy : []
    console.log(`[MARK VIEWED] Current viewedBy:`, currentViewedBy)
    
    if (!currentViewedBy.includes(userId)) {
      console.log(`[MARK VIEWED] User ${userId} not in viewedBy, updating...`)
      
      try {
        // Toujours remplacer le tableau complet (plus sûr que push)
        const newViewedBy = [...currentViewedBy, userId]
        console.log(`[MARK VIEWED] New viewedBy will be:`, newViewedBy)
        
        const updatedMessage = await prisma.e2EEMessageEnvelope.update({
          where: { id: messageId },
          data: {
            viewedBy: newViewedBy
          }
        })
        
        console.log(`[MARK VIEWED] ✅ Updated message viewedBy:`, updatedMessage.viewedBy)
        
        // Notifier via SSE que le message a été vu
        const broadcastData = {
          type: 'message_viewed',
          messageId: message.id,
          viewedBy: updatedMessage.viewedBy || newViewedBy
        }
        
        console.log(`[MARK VIEWED] Broadcasting to conversation ${message.conversationId}:`, broadcastData)
        
        sseBroadcaster.broadcast(message.conversationId, broadcastData)
      } catch (prismaError) {
        console.error(`[MARK VIEWED] ❌ Prisma error:`, prismaError)
        throw prismaError
      }
    } else {
      console.log(`[MARK VIEWED] User ${userId} already in viewedBy, skipping update`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[MARK VIEWED] ❌❌❌ FATAL ERROR:', error)
    console.error('[MARK VIEWED] Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

