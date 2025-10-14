import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { Client } from 'pg'

// Configuration PostgreSQL depuis Prisma
const DATABASE_URL = process.env.DATABASE_URL || ''

export async function GET(request: NextRequest) {
  try {
    // Authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response('Non authentifié', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return new Response('ID de conversation requis', { status: 400 })
    }

    // Créer un stream SSE
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Créer une connexion PostgreSQL dédiée pour LISTEN
        const pgClient = new Client({ connectionString: DATABASE_URL })

        try {
          await pgClient.connect()

          const channel = `e2ee_conv_${conversationId}`
          console.log('[SSE PG] Connexion et LISTEN sur le canal:', channel)

          // S'abonner au canal PostgreSQL
          await pgClient.query(`LISTEN ${channel}`)

          // Écouter les notifications PostgreSQL
          pgClient.on('notification', (msg) => {
            try {
              if (msg.channel === channel && msg.payload) {
                console.log('[SSE PG] 📨 Notification reçue:', msg.payload.substring(0, 100))
                const data = `data: ${msg.payload}\n\n`
                controller.enqueue(encoder.encode(data))
              }
            } catch (error) {
              console.error('[SSE PG] Erreur traitement notification:', error)
            }
          })

          // Envoyer un événement de connexion
          const connectedEvent = `data: ${JSON.stringify({ type: 'connected', conversationId })}\n\n`
          controller.enqueue(encoder.encode(connectedEvent))

          // Heartbeat toutes les 30 secondes
          const heartbeatInterval = setInterval(() => {
            try {
              const heartbeat = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`
              controller.enqueue(encoder.encode(heartbeat))
            } catch (error) {
              clearInterval(heartbeatInterval)
            }
          }, 30000)

          // Cleanup lors de la fermeture
          request.signal.addEventListener('abort', async () => {
            console.log('[SSE PG] Déconnexion client')
            clearInterval(heartbeatInterval)
            try {
              await pgClient.query(`UNLISTEN "${channel}"`)
              await pgClient.end()
            } catch (error) {
              console.error('[SSE PG] Erreur cleanup:', error)
            }
            controller.close()
          })

        } catch (error) {
          console.error('[SSE PG] Erreur connexion PostgreSQL:', error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Désactiver le buffering nginx
      },
    })

  } catch (error) {
    console.error('[SSE PG] Erreur globale:', error)
    return new Response('Erreur interne', { status: 500 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
