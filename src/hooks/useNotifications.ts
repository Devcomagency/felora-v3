'use client'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef } from 'react'

/**
 * Type pour une notification
 */
export interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  link?: string | null
  createdAt: string
}

/**
 * Réponse de l'API notifications
 */
interface NotificationsResponse {
  success: boolean
  notifications: Notification[]
  unreadCount: number
}

/**
 * Configuration du fetcher SWR
 */
const fetcher = async (url: string): Promise<NotificationsResponse> => {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    throw new Error(`Erreur ${res.status}`)
  }
  return res.json()
}

/**
 * Hook unifié pour gérer les notifications
 * Utilise SWR pour le cache et la revalidation automatique
 * Évite le polling multiple et centralise la logique
 *
 * @param options.refreshInterval - Intervalle de rafraîchissement (défaut: 30s)
 * @param options.enabled - Active/désactive le hook (défaut: true si authentifié)
 * @param options.channel - Filtre par channel: "system" (défaut) | "messages" | undefined (all)
 */
export function useNotifications(options?: {
  refreshInterval?: number
  enabled?: boolean
  channel?: 'system' | 'messages'
}) {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  // Par défaut, activer uniquement si authentifié
  const enabled = options?.enabled ?? isAuthenticated
  const refreshInterval = options?.refreshInterval ?? 30000 // 30 secondes
  const channel = options?.channel ?? 'system' // Par défaut, exclure MESSAGE_RECEIVED

  // Construire l'URL avec le filtre channel
  const apiUrl = enabled
    ? `/api/notifications${channel ? `?channel=${channel}` : ''}`
    : null

  // Utiliser SWR pour le cache et la revalidation
  const { data, error, mutate, isValidating } = useSWR<NotificationsResponse>(
    apiUrl,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Éviter les requêtes dupliquées dans les 5s
      // Ne pas faire de retry automatique pour éviter la surcharge
      shouldRetryOnError: false
    }
  )

  /**
   * Marquer une notification comme lue (avec optimistic update)
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!data) return

    try {
      // Optimistic update : mettre à jour immédiatement l'UI
      await mutate(
        {
          ...data,
          notifications: data.notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, data.unreadCount - 1)
        },
        false // Ne pas revalider immédiatement
      )

      // Faire la requête serveur
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId })
      })

      if (!res.ok) {
        throw new Error('Erreur serveur')
      }

      // Revalider depuis le serveur pour être sûr
      await mutate()
    } catch (error) {
      console.error('[useNotifications] Erreur markAsRead:', error)
      // En cas d'erreur, revalider pour restaurer l'état correct
      await mutate()
      throw error
    }
  }, [data, mutate])

  /**
   * Marquer toutes les notifications comme lues (avec optimistic update)
   */
  const markAllAsRead = useCallback(async () => {
    if (!data) return

    try {
      // Optimistic update
      await mutate(
        {
          ...data,
          notifications: data.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0
        },
        false
      )

      // Requête serveur
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ markAllAsRead: true })
      })

      if (!res.ok) {
        throw new Error('Erreur serveur')
      }

      // Revalider
      await mutate()
    } catch (error) {
      console.error('[useNotifications] Erreur markAllAsRead:', error)
      await mutate()
      throw error
    }
  }, [data, mutate])

  /**
   * Rafraîchir manuellement les notifications
   */
  const refresh = useCallback(() => {
    return mutate()
  }, [mutate])

  return {
    // Données
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,

    // États
    isLoading: !error && !data && enabled,
    isError: !!error,
    isValidating,

    // Actions
    markAsRead,
    markAllAsRead,
    refresh,

    // Raw data pour debug
    error
  }
}

/**
 * Hook pour écouter les événements SSE de notifications temps réel
 * Revalide automatiquement SWR quand une nouvelle notification arrive
 *
 * @param options.enabled - Active/désactive SSE (défaut: true)
 */
export function useNotificationSSE(options?: { enabled?: boolean }) {
  const { refresh } = useNotifications({ enabled: false })
  const { status } = useSession()
  const eventSourceRef = useRef<EventSource | null>(null)
  const enabled = options?.enabled ?? true
  const isAuthenticated = status === 'authenticated'

  useEffect(() => {
    // Désactiver si non authentifié ou pas enabled
    if (!enabled || !isAuthenticated) {
      eventSourceRef.current?.close()
      eventSourceRef.current = null
      return
    }

    console.log('[SSE] 🔌 Connexion au stream notifications...')

    // Créer la connexion EventSource
    const eventSource = new EventSource('/api/notifications/sse', {
      withCredentials: true
    })

    // Événement: connexion établie
    eventSource.addEventListener('open', () => {
      console.log('[SSE] ✅ Connexion établie')
    })

    // Événement: message de connexion
    eventSource.addEventListener('message', (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'connected') {
          console.log('[SSE] 📡 Stream actif depuis:', data.timestamp)
        }
      } catch (error) {
        console.error('[SSE] Erreur parse message:', error)
      }
    })

    // Événement: nouvelle notification reçue
    eventSource.addEventListener('notification', (e) => {
      try {
        const notification = JSON.parse(e.data)
        console.log('[SSE] 🔔 Nouvelle notification reçue:', notification.title)

        // Revalider SWR pour mettre à jour l'UI immédiatement
        refresh()

        // 🔥 Déclencher un événement global pour que d'autres composants puissent réagir
        window.dispatchEvent(new CustomEvent('felora:notification:received', {
          detail: notification
        }))

        // Optionnel : Afficher une notification navigateur
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo-principal.png',
            tag: notification.id
          })
        }
      } catch (error) {
        console.error('[SSE] Erreur traitement notification:', error)
      }
    })

    // Événement: erreur de connexion
    eventSource.addEventListener('error', (e) => {
      console.error('[SSE] ❌ Erreur connexion:', e)

      // Fermer et cleanup (EventSource reconnecte automatiquement)
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('[SSE] 🔌 Connexion fermée, reconnexion automatique...')
      }
    })

    eventSourceRef.current = eventSource

    // Cleanup à la fin
    return () => {
      console.log('[SSE] 🔌 Fermeture connexion')
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [enabled, isAuthenticated, refresh])

  return {
    isConnected: typeof window !== 'undefined' && eventSourceRef.current?.readyState === EventSource.OPEN
  }
}

/**
 * Hook combiné : SWR + SSE
 * Utilise le polling SWR comme fallback et SSE pour les updates temps réel
 *
 * Usage:
 * ```typescript
 * const { notifications, unreadCount, markAsRead, isSSEConnected } = useNotificationsWithSSE()
 * // Reçoit les notifications instantanément via SSE
 * // Fallback sur polling si SSE échoue
 * ```
 */
export function useNotificationsWithSSE(options?: {
  refreshInterval?: number
  channel?: 'system' | 'messages'
}) {
  // Hook SWR normal (avec polling comme fallback)
  const notificationsData = useNotifications({
    refreshInterval: options?.refreshInterval ?? 60000, // Réduire à 60s car SSE gère le temps réel
    channel: options?.channel
  })

  // Activer SSE
  const { isConnected } = useNotificationSSE({ enabled: true })

  return {
    ...notificationsData,
    isSSEConnected: isConnected
  }
}
