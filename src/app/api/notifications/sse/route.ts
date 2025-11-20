import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/notifications/sse
 *
 * Server-Sent Events endpoint pour notifications temps réel
 * Permet au client de recevoir des notifications instantanément sans polling
 *
 * Usage côté client :
 * ```typescript
 * const eventSource = new EventSource('/api/notifications/sse')
 * eventSource.addEventListener('notification', (e) => {
 *   const data = JSON.parse(e.data)
 *   console.log('Nouvelle notification:', data)
 * })
 * ```
 */

// Map pour stocker les connexions SSE actives par userId
const connections = new Map<string, ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const userId = session.user.id

    // Créer un ReadableStream pour SSE
    const stream = new ReadableStream({
      start(controller) {
        console.log(`[SSE] 📡 Connexion établie pour user: ${userId}`)

        // Stocker la connexion
        connections.set(userId, controller)

        // Envoyer un message de connexion
        const encoder = new TextEncoder()
        const data = encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`)
        controller.enqueue(data)

        // Heartbeat toutes les 30 secondes pour maintenir la connexion
        const heartbeatInterval = setInterval(() => {
          try {
            const heartbeat = encoder.encode(`: heartbeat ${Date.now()}\n\n`)
            controller.enqueue(heartbeat)
          } catch (error) {
            console.error(`[SSE] ❌ Erreur heartbeat user ${userId}:`, error)
            clearInterval(heartbeatInterval)
            connections.delete(userId)
          }
        }, 30000)

        // Cleanup lors de la fermeture de la connexion
        request.signal.addEventListener('abort', () => {
          console.log(`[SSE] 🔌 Connexion fermée pour user: ${userId}`)
          clearInterval(heartbeatInterval)
          connections.delete(userId)
          try {
            controller.close()
          } catch {}
        })
      },

      cancel() {
        console.log(`[SSE] ⚠️ Stream annulé pour user: ${userId}`)
        connections.delete(userId)
      }
    })

    // Retourner la réponse SSE
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        // CORS headers si nécessaire
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  } catch (error) {
    console.error('[SSE] ❌ Erreur lors de la création du stream:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

/**
 * Fonction utilitaire pour broadcaster une notification à un utilisateur
 * À appeler depuis /api/notifications/send après création de la notification
 *
 * @param userId - ID de l'utilisateur destinataire
 * @param notification - Objet notification à envoyer
 */
export function broadcastNotification(userId: string, notification: any) {
  const controller = connections.get(userId)

  if (!controller) {
    console.log(`[SSE] ℹ️ Pas de connexion active pour user: ${userId}`)
    return false
  }

  try {
    const encoder = new TextEncoder()
    const event = `event: notification\ndata: ${JSON.stringify(notification)}\n\n`
    const data = encoder.encode(event)

    controller.enqueue(data)
    console.log(`[SSE] ✅ Notification envoyée en temps réel à user: ${userId}`)
    return true
  } catch (error) {
    console.error(`[SSE] ❌ Erreur broadcast pour user ${userId}:`, error)
    connections.delete(userId)
    return false
  }
}

/**
 * Broadcast à plusieurs utilisateurs
 */
export function broadcastNotificationToMultiple(userIds: string[], notification: any) {
  let successCount = 0

  for (const userId of userIds) {
    if (broadcastNotification(userId, notification)) {
      successCount++
    }
  }

  console.log(`[SSE] 📊 Broadcast: ${successCount}/${userIds.length} envoyés`)
  return successCount
}

/**
 * Obtenir le nombre de connexions actives
 */
export function getActiveConnectionsCount(): number {
  return connections.size
}

/**
 * Vérifier si un utilisateur a une connexion active
 */
export function isUserConnected(userId: string): boolean {
  return connections.has(userId)
}
