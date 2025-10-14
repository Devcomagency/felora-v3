import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { jwtVerify } from 'jose'
import { sseBroadcaster } from '@/lib/sse-broadcast'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return new Response('ID de conversation requis', { status: 400 })
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
          // JWT decode failed
        }
      }
    }

    if (!user?.id) {
      return new Response('Non authentifié', { status: 401 })
    }

    // Vérifier que la conversation existe et que l'utilisateur y participe
    const conversation = await prisma.e2EEConversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation) {
      return new Response('Conversation introuvable', { status: 404 })
    }

    const participants = conversation.participants as string[]
    if (!participants.includes(user.id)) {
      return new Response('Accès non autorisé', { status: 403 })
    }

    // Créer un stream SSE
    const stream = new ReadableStream({
      async start(controller) {
        // Enregistrer le client dans le broadcaster
        const clientId = sseBroadcaster.addClient(conversationId, user.id, controller)
        console.log('[SSE STREAM] 📡 Client SSE enregistré:', { clientId, conversationId, userId: user.id, totalClients: sseBroadcaster.getClientCount(conversationId) })

        // Envoyer un message de connexion
        const connectMessage = `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`
        controller.enqueue(new TextEncoder().encode(connectMessage))

        // 🆕 CATCH-UP: Envoyer les messages récents non encore reçus (derniers 5 messages)
        try {
          const recentMessages = await prisma.e2EEMessageEnvelope.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: 5
          })

          console.log('[SSE STREAM] 📤 Envoi des messages de catch-up:', recentMessages.length)

          for (const msg of recentMessages.reverse()) {
            const messageEvent = {
              type: 'message' as const,
              id: msg.id,
              messageId: msg.messageId,
              conversationId: msg.conversationId,
              senderUserId: msg.senderUserId,
              cipherText: msg.cipherText,
              attachmentUrl: msg.attachmentUrl,
              attachmentMeta: msg.attachmentMeta,
              createdAt: msg.createdAt.toISOString(),
              status: 'sent',
              viewMode: (msg as any).viewMode,
              downloadable: (msg as any).downloadable,
              expiresAt: (msg as any).expiresAt?.toISOString(),
              viewedBy: (msg as any).viewedBy || []
            }
            
            const eventData = `data: ${JSON.stringify(messageEvent)}\n\n`
            controller.enqueue(new TextEncoder().encode(eventData))
          }
        } catch (catchUpError) {
          console.error('[SSE STREAM] Erreur catch-up:', catchUpError)
        }

        // Heartbeat pour maintenir la connexion
        const heartbeatInterval = setInterval(() => {
          try {
            const heartbeat = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`
            controller.enqueue(new TextEncoder().encode(heartbeat))
          } catch (error) {
            clearInterval(heartbeatInterval)
          }
        }, 30000) // Heartbeat toutes les 30 secondes

        // Nettoyer quand la connexion se ferme
        request.signal.addEventListener('abort', () => {
          console.log('[SSE STREAM] 🔌 Client SSE déconnecté:', { clientId, conversationId, userId: user.id })
          clearInterval(heartbeatInterval)
          sseBroadcaster.removeClient(conversationId, user.id)

          try {
            controller.close()
          } catch (error) {
            // Le controller est peut-être déjà fermé
          }
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })

  } catch (error) {
    return new Response('Erreur interne du serveur', { status: 500 })
  }
}