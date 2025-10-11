/**
 * In-memory SSE broadcast system for real-time events
 * Gère les connexions SSE et diffuse les événements (messages, typing, etc.)
 */

type SSEClient = {
  conversationId: string
  userId: string
  controller: ReadableStreamDefaultController
}

type SSEEvent = {
  type: 'message' | 'typing_start' | 'typing_stop' | 'heartbeat' | 'connected' | 'message_viewed' | 'messages_read' | 'message_status_update'
  conversationId?: string
  userId?: string
  messageId?: string
  viewedBy?: string[]
  status?: string
  deliveredAt?: string
  readAt?: string
  timestamp?: string
  [key: string]: any
}

class SSEBroadcaster {
  private clients: Map<string, SSEClient[]> = new Map()

  /**
   * Enregistre un nouveau client SSE
   */
  addClient(conversationId: string, userId: string, controller: ReadableStreamDefaultController) {
    const clientId = `${conversationId}-${userId}-${Date.now()}`

    if (!this.clients.has(conversationId)) {
      this.clients.set(conversationId, [])
    }

    const clients = this.clients.get(conversationId)!
    clients.push({ conversationId, userId, controller })

    return clientId
  }

  /**
   * Supprime un client SSE
   */
  removeClient(conversationId: string, userId: string) {
    const clients = this.clients.get(conversationId)
    if (!clients) return

    const filtered = clients.filter(c => c.userId !== userId)

    if (filtered.length === 0) {
      this.clients.delete(conversationId)
    } else {
      this.clients.set(conversationId, filtered)
    }
  }

  /**
   * Diffuse un événement à tous les clients d'une conversation
   */
  broadcast(conversationId: string, event: SSEEvent) {
    const clients = this.clients.get(conversationId)
    if (!clients || clients.length === 0) return

    const eventData = `data: ${JSON.stringify(event)}\n\n`
    const encoder = new TextEncoder()

    // Diffuser à tous les clients connectés
    for (const client of clients) {
      try {
        client.controller.enqueue(encoder.encode(eventData))
      } catch (error) {
        // Client déconnecté, ignoré
      }
    }
  }

  /**
   * Obtient le nombre de clients connectés pour une conversation
   */
  getClientCount(conversationId: string): number {
    return this.clients.get(conversationId)?.length || 0
  }

  /**
   * Vérifie si un utilisateur est connecté à une conversation
   */
  isUserConnected(conversationId: string, userId: string): boolean {
    const clients = this.clients.get(conversationId)
    return clients?.some(c => c.userId === userId) || false
  }
}

// Instance singleton
export const sseBroadcaster = new SSEBroadcaster()
