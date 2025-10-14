/**
 * PostgreSQL LISTEN/NOTIFY broadcaster for real-time events
 * Fonctionne en dev ET prod sans configuration supplémentaire
 * Scale automatiquement avec PostgreSQL
 */

import { Client } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL || ''

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

class PostgreSQLBroadcaster {
  /**
   * Diffuse un événement via PostgreSQL NOTIFY
   * Tous les workers/instances recevront l'événement
   */
  async broadcast(conversationId: string, event: SSEEvent) {
    const client = new Client({ connectionString: DATABASE_URL })

    try {
      await client.connect()

      const channel = `e2ee_conv_${conversationId}`
      const payload = JSON.stringify(event)

      console.log('[PG BROADCAST] Envoi notification:', { channel, eventType: event.type, payloadLength: payload.length })

      // Utiliser PostgreSQL NOTIFY pour diffuser l'événement
      await client.query('SELECT pg_notify($1, $2)', [channel, payload])

      console.log('[PG BROADCAST] ✅ Notification envoyée via pg_notify')
    } catch (error) {
      console.error('[PG BROADCAST] ❌ Erreur lors de la diffusion:', error)
      // Ne pas throw - laisser l'envoi réussir même si le broadcast échoue
    } finally {
      await client.end().catch(() => {})
    }
  }
}

// Instance singleton
export const pgBroadcaster = new PostgreSQLBroadcaster()
