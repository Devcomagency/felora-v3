'use client'

import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Clock, ShieldOff, Download } from 'lucide-react'
import { encryptFileWithEnvelopes, decryptFileWithEnvelopes, decryptFile } from '@packages/e2ee-signal/crypto'
import { fetchBundle, uploadKeyBundle } from '@packages/e2ee-signal/client'
import { ensureLibsignalBootstrap } from '@packages/e2ee-signal/bootstrap'
import { createSession, encrypt, getSession, setLocalUser, decrypt } from '@packages/e2ee-signal/session'
import { useNotification } from '@/components/providers/NotificationProvider'
import TypingIndicator from './TypingIndicator'
import FullscreenMediaViewer from './FullscreenMediaViewer'
import LinkPreview from './LinkPreview'

type Envelope = { id: string; messageId: string; senderUserId: string; cipherText: string; attachmentUrl?: string | null; attachmentMeta?: any; createdAt: string; status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'; deliveredAt?: Date | string | null; readAt?: Date | string | null }

// Fonction pour détecter les URLs dans le texte
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.match(urlRegex) || []
}

export default function E2EEThread({ conversationId, userId, partnerId, partnerName }: { conversationId: string; userId: string; partnerId: string; partnerName?: string }) {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [mediaCache, setMediaCache] = useState<Record<string, { url: string; mime: string }>>({})
  const [messageOffset, setMessageOffset] = useState(0)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const MESSAGE_BATCH_SIZE = 200 // Augmenté pour éviter les problèmes de pagination
  const esRef = useRef<EventSource | null>(null)
  const isInitializedRef = useRef(false)
  const { success: toastSuccess, error: toastError, info: toastInfo } = useNotification()
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [textCache, setTextCache] = useState<Record<string, string>>({})
  const textCacheRef = useRef<Record<string, string>>({}) // ✅ Ref pour vérification sans re-render
  const [messageStatuses, setMessageStatuses] = useState<Record<string, 'sending' | 'sent' | 'delivered' | 'read' | 'failed'>>({})
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const [fullscreenMedia, setFullscreenMedia] = useState<{ url: string; type: string; messageId: string; isOnceView?: boolean; downloadable?: boolean } | null>(null)
  const [localViewedMessages, setLocalViewedMessages] = useState<string[]>(() => {
    // Charger depuis localStorage au démarrage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`viewed-messages-${conversationId}`)
        return stored ? JSON.parse(stored) : []
      } catch {
        return []
      }
    }
    return []
  })

  const scrollToBottomTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const scrollToBottom = () => {
    if (scrollToBottomTimeoutRef.current) {
      clearTimeout(scrollToBottomTimeoutRef.current)
    }
    scrollToBottomTimeoutRef.current = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const addEnvelopeUnique = (env: Envelope) => {
    setEnvelopes(prev => {
      // Vérifier si le message existe déjà (par messageId ou id)
      const existsByMessageId = env.messageId && prev.some(e => e.messageId === env.messageId)
      const existsById = prev.some(e => e.id === env.id)

      if (existsByMessageId || existsById) {
        // Remplacer le message existant (pour mettre à jour un message optimiste)
        return prev.map(e => {
          // Remplacer par messageId (prioritaire)
          if (env.messageId && e.messageId === env.messageId) {
            return env
          }
          // Remplacer par id (fallback)
          if (e.id === env.id) {
            return env
          }
          return e
        })
      }

      // Ajouter le nouveau message
      return [...prev, env]
    })
  }

  const updateMessageStatus = (messageId: string, status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed') => {
    // Mettre à jour à la fois messageStatuses ET les envelopes
    setMessageStatuses(prev => {
      // Éviter re-render si le statut n'a pas changé
      if (prev[messageId] === status) return prev
      return { ...prev, [messageId]: status }
    })

    // Mettre à jour le status dans les envelopes directement
    setEnvelopes(prev => {
      let hasChanged = false
      const updated = prev.map(env => {
        if (env.messageId === messageId && env.status !== status) {
          hasChanged = true
          return { ...env, status }
        }
        return env
      })
      // Ne retourner un nouveau tableau que si quelque chose a changé
      return hasChanged ? updated : prev
    })
  }

  const startTyping = () => {
    setIsTyping(true)
    setTypingUser(userId)

    // Envoyer l'événement de frappe au serveur
    fetch('/api/e2ee/typing/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ conversationId, userId })
    }).catch(error => {
      console.error('Erreur lors de l\'envoi de l\'indicateur de frappe:', error)
    })

    // Arrêter l'indicateur après 3 secondes d'inactivité
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }

  const stopTyping = () => {
    setIsTyping(false)
    setTypingUser(null)

    // Envoyer l'événement d'arrêt de frappe au serveur
    fetch('/api/e2ee/typing/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ conversationId, userId })
    }).catch(error => {
      console.error('Erreur lors de l\'arrêt de l\'indicateur de frappe:', error)
    })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }

  // Init device + upload dummy bundle
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLocalUser(userId)
        const deviceKey = `felora-e2ee-device-${userId}`
        let deviceId = localStorage.getItem(deviceKey) || ''
        if (!deviceId) { 
          deviceId = `${userId}-${Math.random().toString(36).slice(2)}`
          localStorage.setItem(deviceKey, deviceId) 
        }
        const bundle = await ensureLibsignalBootstrap(userId, deviceId)
        await uploadKeyBundle(bundle)
        try { 
          const { bundle } = await fetchBundle(partnerId)
          await createSession(partnerId, bundle) 
        } catch (error) {
          console.warn('Impossible de créer la session avec le partenaire:', error)
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation E2EE:', error)
        toastError('Erreur de configuration du chiffrement')
      }
    })()
    return () => { mounted = false }
  }, [userId, partnerId])

  // Load history (UNE SEULE FOIS au chargement)
  useEffect(() => {
    const loadHistory = async () => {
      console.log('[LOAD HISTORY] Chargement de l\'historique...', { conversationId })
      try {
        if (!loadingHistory) setLoadingHistory(true)
        const res = await fetch(`/api/e2ee/messages/history?conversationId=${encodeURIComponent(conversationId)}`, {
          credentials: 'include'
        })
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`)
        }
        const data = await res.json()
        if (Array.isArray(data?.messages)) {
          const historyMessages = data.messages as Envelope[]
          console.log('[LOAD HISTORY] Messages chargés:', historyMessages.length)
          
          // MERGER avec les messages existants au lieu d'écraser
          setEnvelopes(prev => {
            console.log('[LOAD HISTORY] Messages actuels avant merge:', prev.length)
            // Garder les messages optimistes (temp-*)
            const optimistic = prev.filter(e => e.id.startsWith('temp-'))
            console.log('[LOAD HISTORY] Messages optimistes à garder:', optimistic.length)
            
            // Merger l'historique avec les optimistes
            const merged = [...historyMessages]
            optimistic.forEach(opt => {
              if (!merged.some(m => m.messageId === opt.messageId)) {
                merged.push(opt)
              }
            })
            
            // Trier par date
            const sorted = merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            console.log('[LOAD HISTORY] Messages après merge:', sorted.length)
            return sorted
          })

          // Charger les statuts dans messageStatuses
          const statuses: Record<string, 'sending' | 'sent' | 'delivered' | 'read' | 'failed'> = {}
          historyMessages.forEach((m: any) => {
            if (m.messageId) {
              statuses[m.messageId] = m.readAt ? 'read' : m.deliveredAt ? 'delivered' : m.status?.toLowerCase() || 'sent'
            }
          })
          setMessageStatuses(prev => ({ ...prev, ...statuses }))
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error)
        toastError('Impossible de charger l\'historique des messages')
      } finally {
        setLoadingHistory(false)
      }
    }

    loadHistory()
  }, [conversationId])

  // SSE (with catch-up after last known timestamp) - SE CONNECTE UNE SEULE FOIS
  useEffect(() => {
    console.log('[SSE INIT] Tentative de connexion SSE...', { loadingHistory, conversationId })
    if (loadingHistory) {
      console.log('[SSE INIT] BLOQUÉ par loadingHistory')
      return
    }

    console.log('[SSE] Connexion SSE en cours...')
    esRef.current?.close()
    const es = new EventSource(`/api/e2ee/messages/sse?conversationId=${encodeURIComponent(conversationId)}`, {
      withCredentials: true
    })

    es.onopen = () => {
      console.log('[SSE] ✅ Connexion SSE établie !')
    }

    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data)
        // Logs uniquement pour les messages importants (pas les status updates)
        if (data.type !== 'message_status_update') {
          console.log('[SSE] 📨 Message reçu:', data.type)
        }

        // Gérer les messages
        if (data.type === 'message') {
          const env: Envelope = data
          console.log('[SSE] Message envelope reçu:', env.id, env.messageId)

          // Ajouter le message (remplacera l'optimiste si existe)
          addEnvelopeUnique(env)

          // Si c'est mon message qui vient d'être envoyé
          if (env.senderUserId === userId && env.messageId) {
            // Marquer comme 'sent' (le message a bien été envoyé)
            updateMessageStatus(env.messageId, 'sent')
          }

          // Si ce n'est pas mon message, marquer comme delivered
          if (env.senderUserId !== userId && env.messageId) {
            updateMessageStatus(env.messageId, 'delivered')

            // Persister le statut DELIVERED en base de données
            fetch('/api/e2ee/messages/ack', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                conversationId,
                messageId: env.messageId,
                status: 'DELIVERED'
              })
            }).catch(err => console.error('[E2EE] Erreur ACK DELIVERED:', err))
          }
        }

        // Gérer les indicateurs de frappe
        if (data.type === 'typing_start' && data.userId !== userId) {
          setIsTyping(true)
          setTypingUser(data.userId)
        }

        if (data.type === 'typing_stop' && data.userId !== userId) {
          setIsTyping(false)
          setTypingUser(null)
        }

        // Gérer les messages vus (vue unique)
        if (data.type === 'message_viewed') {
          setEnvelopes(prev => prev.map(e => 
            e.id === data.messageId ? { ...e, viewedBy: data.viewedBy } as any : e
          ))
        }

        // Gérer les messages lus (statut read)
        if (data.type === 'messages_read' && data.userId !== userId) {
          setMessageStatuses(prev => {
            const updated = { ...prev }
            envelopes.forEach(e => {
              if (e.senderUserId === userId && updated[e.messageId] !== 'read') {
                updated[e.messageId] = 'read'
              }
            })
            return updated
          })
        }

        // Gérer les mises à jour de statut en temps réel (DELIVERED, READ)
        if (data.type === 'message_status_update' && data.messageId) {
          // Vérifier si le statut a vraiment changé avant d'appeler updateMessageStatus
          const currentStatus = messageStatuses[data.messageId]
          if (currentStatus !== data.status) {
            updateMessageStatus(data.messageId, data.status)
          }
        }
      } catch (error) {
        // Silent fail pour parsing errors
      }
    }

    es.onerror = () => {
      // Silent fail, le polling prendra le relai
    }

    esRef.current = es

    return () => {
      es.close()
    }
  }, [conversationId, loadingHistory])

  // Polling rapide toutes les 3 secondes pour nouveaux messages (car SSE ne fonctionne pas avec Next.js dev)
  useEffect(() => {
    if (!conversationId || !userId) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/e2ee/messages/history?conversationId=${encodeURIComponent(conversationId)}`, {
          credentials: 'include'
        })
        if (!res.ok) return
        const data = await res.json()
        if (data.messages && data.messages.length > 0) {
          // Mettre à jour les messages ET les statuts
          const historyMessages = data.messages as Envelope[]

          setEnvelopes(prev => {
            // ✅ Garder les messages récents (moins de 10s) qui ne sont peut-être pas encore dans l'historique
            const now = Date.now()
            const recentMessages = prev.filter(e => {
              const createdAt = new Date(e.createdAt).getTime()
              return (now - createdAt) < 10000 // Messages de moins de 10 secondes
            })
            
            // Garder aussi les messages optimistes (temp-*)
            const optimistic = prev.filter(e => e.id.startsWith('temp-'))

            // Merger l'historique avec les récents et optimistes
            const merged = [...historyMessages]
            
            // Ajouter les optimistes qui ne sont pas encore dans l'historique
            optimistic.forEach(opt => {
              if (!merged.some(m => m.messageId === opt.messageId || m.id === opt.id)) {
                merged.push(opt)
              }
            })
            
            // Ajouter les messages récents qui ne sont pas encore dans l'historique
            recentMessages.forEach(recent => {
              if (!merged.some(m => m.messageId === recent.messageId || m.id === recent.id)) {
                merged.push(recent)
              }
            })

            // Trier par date
            const sorted = merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

            // ✅ Ne PAS écraser si on perdrait des messages !
            if (sorted.length < prev.length) {
              console.log('[POLLING] ⚠️ Historique incomplet, on garde les messages locaux')
              return prev
            }

            return sorted
          })

          // Mettre à jour les statuts
          data.messages.forEach((m: any) => {
            if (m.messageId) {
              const status = m.readAt ? 'read' : m.deliveredAt ? 'delivered' : m.status?.toLowerCase() || 'sent'
              updateMessageStatus(m.messageId, status)
            }
          })
        }
      } catch (error) {
        // Silent fail
      }
    }, 3000) // Polling rapide toutes les 3 secondes
    return () => clearInterval(interval)
  }, [conversationId, userId])

  // Helpers for UTF-8 safe base64
  const b64EncodeUtf8 = (str: string) => {
    try {
      const enc = new TextEncoder().encode(str)
      let bin = ''
      enc.forEach(b => { bin += String.fromCharCode(b) })
      return btoa(bin)
    } catch { return btoa(unescape(encodeURIComponent(str))) }
  }
  const b64DecodeUtf8 = (b64: string) => {
    try {
      const bin = atob(b64)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      return new TextDecoder().decode(bytes)
    } catch {
      try { return decodeURIComponent(escape(atob(b64))) } catch { return '' }
    }
  }

  // Decrypt incoming text messages into cache (when possible)
  useEffect(() => {
    (async () => {
      const sess = getSession(partnerId)
      const updates: Record<string, string> = {}
      console.log('[DECRYPT] Démarrage déchiffrement...', { 
        totalEnvelopes: envelopes.length, 
        textMessages: envelopes.filter(e => !e.attachmentUrl).length,
        cacheSize: Object.keys(textCacheRef.current).length
      })
      
      for (const env of envelopes) {
        if (env.attachmentUrl) continue // only text here

        // Utiliser messageId comme clé de cache (ou fallback sur id)
        const cacheKey = env.messageId || env.id
        
        // ✅ Vérifier TOUTES les clés possibles (messageId, id, temp-id)
        const isAlreadyCached = 
          textCacheRef.current[env.messageId] || 
          textCacheRef.current[env.id] || 
          textCacheRef.current[`temp-${env.messageId}`]
        
        if (isAlreadyCached) {
          console.log('[DECRYPT] Déjà en cache:', cacheKey.slice(0, 20))
          continue
        }

        // Pour les messages sortants, essayer de décoder directement en base64
        if (env.senderUserId === userId) {
          try {
            const decoded = b64DecodeUtf8(env.cipherText)
            if (decoded && !decoded.startsWith('[attachment:')) {
              // ✅ Stocker avec TOUTES les clés possibles pour être sûr
              updates[env.id] = decoded
              updates[env.messageId] = decoded
              if (env.id.startsWith('temp-')) {
                updates[env.messageId] = decoded // Aussi sans temp-
              }
              console.log('[DECRYPT] Message sortant décodé:', cacheKey.slice(0, 20), '→', decoded.slice(0, 30))
            }
          } catch (e) {
            console.error('[DECRYPT] Erreur décodage sortant:', e)
          }
          continue
        }

        // Pour les messages entrants, décrypter avec la session Signal
        if (sess) {
        try {
          const plain = await decrypt(sess, env.cipherText)
            // ✅ Stocker avec toutes les clés
            updates[env.id] = plain
            updates[env.messageId] = plain
            console.log('[DECRYPT] Message entrant déchiffré:', cacheKey.slice(0, 20), '→', plain.slice(0, 30))
          } catch {
            // Fallback: essayer de décoder en base64 simple
            try {
              const decoded = b64DecodeUtf8(env.cipherText)
              if (decoded && !decoded.startsWith('[attachment:')) {
                updates[env.id] = decoded
                updates[env.messageId] = decoded
              }
            } catch {}
          }
        } else {
          // Pas de session Signal, essayer de décoder en base64
          try {
            const decoded = b64DecodeUtf8(env.cipherText)
            if (decoded && !decoded.startsWith('[attachment:')) {
              updates[env.id] = decoded
              updates[env.messageId] = decoded
            }
        } catch {}
        }
      }
      
      const updateCount = Object.keys(updates).length
      if (updateCount > 0) {
        console.log('[DECRYPT] ✅ Mise à jour cache:', updateCount / 2, 'messages déchiffrés (', updateCount, 'clés)')
        setTextCache(prev => {
          const newCache = { ...prev, ...updates }
          textCacheRef.current = newCache // ✅ Garder ref à jour
          console.log('[DECRYPT] Cache total après update:', Object.keys(newCache).length, 'clés')
          return newCache
        })
      } else {
        console.log('[DECRYPT] Aucun nouveau message à déchiffrer (cache:', Object.keys(textCacheRef.current).length, 'clés)')
      }
    })()
  }, [envelopes, partnerId, userId])

  // Exposer les fonctions de frappe globalement
  useEffect(() => {
    // @ts-ignore
    window.__feloraChatStartTyping = startTyping
    // @ts-ignore
    window.__feloraChatStopTyping = stopTyping
  }, [conversationId, userId])

  // 🆕 IntersectionObserver pour marquer les messages comme lus (READ) automatiquement
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Observer tous les messages du partenaire visibles à l'écran
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const messageId = entry.target.getAttribute('data-message-id')
            const senderId = entry.target.getAttribute('data-sender-id')

            // Seulement pour les messages du partenaire (pas les miens)
            if (messageId && senderId && senderId !== userId && !readMessages.has(messageId)) {
              // Marquer comme lu en local
              setReadMessages(prev => new Set(prev).add(messageId))
              updateMessageStatus(messageId, 'read')

              // Persister en base de données
              fetch('/api/e2ee/messages/ack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  conversationId,
                  messageId,
                  status: 'READ'
                })
              }).catch(err => console.error('[E2EE] Erreur ACK READ:', err))
            }
          }
        })
      },
      { threshold: 0.5 } // Visible à 50% minimum
    )

    // Observer tous les messages affichés
    const messageElements = document.querySelectorAll('[data-message-id]')
    messageElements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [envelopes, conversationId, userId, readMessages])

  // Auto-scroll vers le bas quand les messages changent (mais pas pendant l'upload)
  useEffect(() => {
    if (!loadingHistory && envelopes.length > 0 && uploadProgress === null) {
      setTimeout(scrollToBottom, 100)
    }
  }, [envelopes.length, loadingHistory, uploadProgress])

  // Bridge external composer
  useEffect(() => {
    // @ts-ignore
    window.__feloraChatSend = async ({ text, file, mediaOptions }: { text?: string; file?: File; mediaOptions?: { viewMode?: 'once' | 'unlimited', downloadable?: boolean } }) => {
      console.log('[__feloraChatSend] APPELÉ !', { hasText: !!text, hasFile: !!file, conversationId, userId })
      const deviceId = localStorage.getItem(`felora-e2ee-device-${userId}`) || `${userId}-dev`
      if (file) {
        const messageId = uuidv4()
        try {
          // OPTIMISTIC UI pour les médias - afficher une barre de progression
          setUploadProgress(0)

          let sess = getSession(partnerId)
          if (!sess) {
            try { const { bundle } = await fetchBundle(partnerId); sess = await createSession(partnerId, bundle) } catch {}
          }
          const recipients = [userId, partnerId]
          const wrap = async (keyB64: string, _recipient: string) => {
            if (_recipient === partnerId && sess) return await encrypt(sess, keyB64)
            return keyB64
          }
          const { cipherBlob, meta } = await encryptFileWithEnvelopes(file, wrap, recipients)
          const fd = new FormData()
          fd.append('file', cipherBlob, 'blob.bin')
          fd.append('meta', JSON.stringify(meta))
          const { url } = await uploadWithProgress(fd, (p) => setUploadProgress(p))

          const payload = { 
            conversationId, 
            senderUserId: userId, 
            senderDeviceId: deviceId, 
            messageId, 
            cipherText: btoa(`[attachment:${url}]`), 
            attachment: { url, meta },
            viewMode: mediaOptions?.viewMode || 'unlimited',
            downloadable: mediaOptions?.downloadable !== false
          }
          const res = await fetch('/api/e2ee/messages/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })

          setUploadProgress(null)

          if (!res.ok) {
            throw new Error('send_failed')
          }

          const data = await res.json()
          
          if (data?.message) {
            const newEnvelope = data.message
            if (!newEnvelope.senderUserId) {
              newEnvelope.senderUserId = userId
            }
            // Ajouter le vrai message (il n'y a pas de message optimiste pour les médias, juste une progress bar)
            addEnvelopeUnique(newEnvelope)
            updateMessageStatus(messageId, 'sent')
          }

          toastSuccess('Média envoyé')
          scrollToBottom()
        } catch (error) {
          toastError('Échec de l\'envoi du média')
          setUploadProgress(null)
          updateMessageStatus(messageId, 'failed')
        }
        return
      }
      try {
        let sess = getSession(partnerId)
        if (!sess) {
          try { const { bundle } = await fetchBundle(partnerId); sess = await createSession(partnerId, bundle) } catch {}
        }
        const ct = text ? (sess ? await encrypt(sess, text) : b64EncodeUtf8(text)) : ''
        if (!ct) return
        const messageId = uuidv4()

        // OPTIMISTIC UI: Afficher le message immédiatement avant l'envoi
        const optimisticEnvelope: Envelope = {
          id: `temp-${messageId}`,
          messageId,
          senderUserId: userId,
          cipherText: ct,
          createdAt: new Date().toISOString(),
          status: 'sending'
        }
        console.log('[OPTIMISTIC] Ajout du message optimiste:', optimisticEnvelope.id)
        addEnvelopeUnique(optimisticEnvelope)
        updateMessageStatus(messageId, 'sending')

        // Stocker le texte pour l'affichage immédiat (utiliser messageId ET temp-id)
        if (text) {
          setTextCache(prev => {
            const newCache = { 
              ...prev, 
              [messageId]: text,              // ✅ Clé par messageId pour renderText()
              [`temp-${messageId}`]: text     // ✅ Aussi en temp- pour compatibilité
            }
            textCacheRef.current = newCache // ✅ Garder ref à jour
            return newCache
          })
        }

        // Envoyer en arrière-plan
        const payload = { conversationId, senderUserId: userId, senderDeviceId: deviceId, messageId, cipherText: ct }
        console.log('[SEND] Envoi...', { conversationId, messageId })
        
        const res = await fetch('/api/e2ee/messages/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
        
        console.log('[SEND] Réponse:', res.status, res.ok)

        if (!res.ok) {
          const errorText = await res.text()
          console.error('[SEND] Erreur:', errorText)
          updateMessageStatus(messageId, 'failed')
          throw new Error('send_failed')
        }

        const data = await res.json()
        console.log('[SEND] Données reçues:', data)

        if (data?.message) {
          const newEnvelope = data.message
          console.log('[SEND] Nouveau envelope reçu:', { id: newEnvelope.id, messageId: newEnvelope.messageId, tempId: `temp-${messageId}` })
          
          // CRITICAL: S'assurer que senderUserId est défini
          if (!newEnvelope.senderUserId) {
            newEnvelope.senderUserId = userId
          }
          
          // Remplacer le message optimiste par le vrai message de la DB
          setEnvelopes(prev => {
            console.log('[SEND] Remplacement optimiste - avant:', prev.length, 'IDs:', prev.map(e => e.id).slice(-3))
            const updated = prev.map(e => 
              e.id === `temp-${messageId}` ? newEnvelope : e
            )
            console.log('[SEND] Remplacement optimiste - après:', updated.length, 'IDs:', updated.map(e => e.id).slice(-3))
            return updated
          })
          
          updateMessageStatus(messageId, 'sent')
          
          // Migrer le texte du cache vers le vrai ID et messageId
          if (text && newEnvelope.id && newEnvelope.messageId) {
            setTextCache(prev => {
              const updated = { ...prev }
              // Ajouter avec le vrai ID ET messageId (pour renderText)
              updated[newEnvelope.id] = text
              updated[newEnvelope.messageId] = text
              // Nettoyer seulement la clé temp
              delete updated[`temp-${messageId}`]
              textCacheRef.current = updated // ✅ Garder ref à jour
              return updated
            })
          }
        }
      } catch (error) {
        console.error('[SEND] Exception:', error)
        toastError('Échec de l\'envoi du message. Veuillez réessayer.')
      }
    }
    return () => { /* cleanup left empty to preserve composer binding between renders */ }
  }, [conversationId, userId, partnerId])

  // Decrypt attachments, cache URLs (parallèle avec limite de 3)
  useEffect(() => {
    (async () => {
      const pending = envelopes.filter(e => e.attachmentUrl && e.attachmentMeta && !mediaCache[e.id])
      if (!pending.length) return
      
      const updates: Record<string, { url: string; mime: string }> = {}
      
      // Déchiffrer 3 médias en parallèle max pour éviter de bloquer
      const PARALLEL_LIMIT = 3
      for (let i = 0; i < pending.length; i += PARALLEL_LIMIT) {
        const batch = pending.slice(i, i + PARALLEL_LIMIT)
        await Promise.all(batch.map(async (env) => {
        try {

          const urlObj = new URL(String(env.attachmentUrl), window.location.origin)
          const safePath = urlObj.pathname.split('/').pop() || ''
          const resp = await fetch(`/api/e2ee/attachments/get?path=${encodeURIComponent(safePath)}&conversationId=${encodeURIComponent(conversationId)}`)

          if (!resp.ok) {
            throw new Error(`Erreur fetch: ${resp.status} ${resp.statusText}`)
          }

          const cipherBlob = await resp.blob()

          // Unwrap via envelope if present
          const sess = getSession(env.senderUserId === userId ? partnerId : env.senderUserId)

          const unwrap = async (envelope: string) => {
            if (sess && env.senderUserId !== userId) {
              // Receiver side — if we had libsignal: decrypt(envelope)
              try {
                // @ts-ignore
                const dec = await decrypt(sess as any, envelope)
                return dec
              } catch (e) {
                console.warn('[E2EE] Erreur déchiffrement envelope Signal, fallback vers plaintext:', e)
                return envelope
              }
            }
            return envelope
          }

          const plainBlob = env.attachmentMeta?.envelopes
            ? await decryptFileWithEnvelopes(cipherBlob, env.attachmentMeta, unwrap, userId)
            : await decryptFile(cipherBlob, env.attachmentMeta)

          const mime = env.attachmentMeta?.mime || plainBlob.type || 'application/octet-stream'

          // Pour les vidéos/audios, créer un Blob avec le bon type MIME pour éviter les erreurs de range
          const typedBlob = new Blob([plainBlob], { type: mime })
          updates[env.id] = { url: URL.createObjectURL(typedBlob), mime }
        } catch (error) {
          // Déchiffrement échoué - marquer le média comme indisponible
          updates[env.id] = { url: '', mime: '' }
        }
        }))
        
        // Mettre à jour le cache après chaque batch
        if (Object.keys(updates).length) setMediaCache(prev => ({ ...prev, ...updates }))
      }
    })()
    // Ne pas révoquer les blob URLs immédiatement pour permettre le fullscreen
    // return () => { Object.values(mediaCache).forEach(({ url }) => { if (url) URL.revokeObjectURL(url) }) }
  }, [envelopes])

  const renderText = (env: Envelope) => {
    // ✅ Chercher avec TOUTES les clés possibles
    const cached = 
      textCache[env.messageId] || 
      textCache[env.id] || 
      textCache[`temp-${env.messageId}`]
    
    if (cached) return cached.startsWith('[attachment:') ? '' : cached

    // Si c'est une pièce jointe, ne pas afficher de texte
    if (env.attachmentUrl) return ''

    // Essayer de décoder en base64 comme fallback
    try {
      const dec = b64DecodeUtf8(env.cipherText)
      if (dec && !dec.startsWith('[attachment:')) {
      return dec
    }
    } catch {}

    // Si tout échoue, afficher un message de chargement
    return '[unable to decrypt]'
  }

  return (
    <div className="grid grid-rows-[1fr] h-full min-h-0">
      <div
        className="relative overflow-y-auto p-3 sm:p-4 space-y-2 pb-20 lg:pb-4"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain'
        }}
      >
        {uploadProgress !== null && (
          <div className="sticky bottom-2 left-0 right-0 z-10">
            <div className="mx-auto w-full max-w-xs bg-white/10 border border-white/20 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-500 to-purple-600" style={{ width: `${Math.max(5, uploadProgress)}%` }} />
            </div>
            <div className="text-center text-xs text-white/70 mt-1">Envoi… {Math.round(uploadProgress)}%</div>
          </div>
        )}
        {loadingHistory && envelopes.length === 0 && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`max-w-[85%] sm:max-w-[70%] ${i % 2 ? 'ml-auto' : ''}`}>
                <div className="h-16 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
              </div>
            ))}
          </div>
        )}
        {envelopes
          .filter(env => {
            // Filtrer les messages expirés
            const expiresAt = (env as any).expiresAt
            if (expiresAt && new Date(expiresAt) < new Date()) {
              return false
            }
            
            // Ne PAS filtrer les messages "vue unique" - on les affiche différemment
            return true
          })
          .map(env => {
          const mine = env.senderUserId === userId
          const bubbleClass = mine ? 'ml-auto bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-white/20' : 'bg-white/5 border border-white/10'
          const media = mediaCache[env.id]
          const text = renderText(env)
          const status = messageStatuses[env.messageId] || env.status || 'sent'
          
          // Vérifier si c'est un message "vue unique" déjà vu
          const viewMode = (env as any).viewMode
          const viewedBy = (env as any).viewedBy || []
          const isViewedLocally = localViewedMessages.includes(env.id)
          const isViewedOnce = viewMode === 'once' && (viewedBy.length > 0 || isViewedLocally)
          const isReceiverAndViewed = viewMode === 'once' && !mine && (viewedBy.includes(userId) || isViewedLocally)
          
          const getStatusIcon = (status: string) => {
            switch (status) {
              case 'sending': return '○' // Cercle vide
              case 'sent': return '✓' // Simple check
              case 'delivered': return '✓✓' // Double check gris
              case 'read': return '✓✓' // Double check vert
              case 'failed': return '✗'
              default: return '✓'
            }
          }

          const getStatusColor = (status: string) => {
            switch (status) {
              case 'sending': return 'text-gray-500'
              case 'sent': return 'text-gray-400'
              case 'delivered': return 'text-gray-400'
              case 'read': return 'text-green-400'
              case 'failed': return 'text-red-400'
              default: return 'text-gray-400'
            }
          }

          return (
            <motion.div
              key={env.id}
              data-message-id={env.messageId}
              data-sender-id={env.senderUserId}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{
                opacity: status === 'sending' ? 0.7 : 1,
                y: 0,
                scale: 1
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`relative max-w-[85%] sm:max-w-[70%] rounded-xl px-3 py-2 ${media && media.url && media.mime.startsWith('audio/') ? 'pb-8' : 'pr-10'} text-sm ${bubbleClass} ${status === 'sending' ? 'animate-pulse' : ''}`}>
              
              {/* Si c'est un message vu par le récepteur, cacher le média */}
        {isReceiverAndViewed ? (
          <div className="text-xs text-gray-500 italic py-1">
            Contenu disparu
          </div>
        ) : (
          <>
            {text && (
              <>
                <div className="whitespace-pre-wrap break-words mb-1">{text}</div>
                {/* Preview des liens */}
                {extractUrls(text).slice(0, 2).map((url, idx) => (
                  <LinkPreview key={idx} url={url} />
                ))}
              </>
            )}
            
            {/* Statut vue unique pour l'expéditeur (en plus du contenu) */}
            {viewMode === 'once' && mine && (
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                {isViewedOnce ? (
                  <span className="text-green-400/80">✓ Vu</span>
                ) : (
                  <span className="text-blue-400/80 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                    Non vu
                  </span>
                )}
              </div>
            )}
          </>
        )}
              
              {/* Badges vue unique et protection */}
              {((env as any).viewMode || (env as any).downloadable === false) && (
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {(env as any).viewMode === 'once' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[11px] font-medium text-purple-300/90">
                      <Eye size={11} className="flex-shrink-0" />
                      <span>Vue unique</span>
                    </span>
                  )}
                  {(env as any).downloadable === false && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[11px] font-medium text-red-300/90">
                      <ShieldOff size={11} className="flex-shrink-0" />
                      <span>Protégé</span>
                    </span>
                  )}
                </div>
              )}
              {media && (!media.mime || !media.url) && (
                <div className="mt-1 mb-5 text-xs text-red-400/70 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>Média indisponible</span>
                </div>
              )}
              {/* Affichage des images */}
              {media && media.url && media.mime && media.mime.startsWith('image/') && !isReceiverAndViewed && (
                <div className="relative mt-1 mb-5">
                  {viewMode === 'once' && !mine && !isViewedLocally ? (
                    // Image floutée avec bouton "Voir" (récepteur avant visionnage)
                    <div className="relative">
                      <img src={media.url} alt="Pièce jointe" className="rounded-lg max-w-full h-auto max-h-[55vh] border border-white/10 blur-xl" />
                      <button
                        onClick={() => setFullscreenMedia({ url: media.url!, type: 'image', messageId: env.id, isOnceView: true, downloadable: (env as any).downloadable !== false })}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"
                      >
                        <div className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-full text-white font-medium flex items-center gap-2 transition-all hover:scale-105">
                          <span>👁️</span>
                          <span>Voir</span>
                        </div>
                      </button>
                    </div>
                  ) : (
                    // Image normale (messages normaux) - cliquable pour plein écran
                    <div className="relative group">
                      <img 
                        src={media.url} 
                        alt="Pièce jointe" 
                        className="rounded-lg max-w-full h-auto max-h-[55vh] border border-white/10 cursor-pointer transition-all hover:brightness-90" 
                        loading="lazy"
                        onClick={() => setFullscreenMedia({ url: media.url!, type: 'image', messageId: env.id, isOnceView: false, downloadable: (env as any).downloadable !== false })}
                      />
                      {/* Bouton de téléchargement si autorisé */}
                      {(env as any).downloadable !== false && (
                        <a
                          href={media.url}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all"
                          title="Télécharger"
                        >
                          <Download size={16} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Affichage des vidéos */}
              {media && media.url && media.mime && media.mime.startsWith('video/') && !isReceiverAndViewed && (
                <div className="relative mt-1 mb-5">
                  {viewMode === 'once' && !mine && !isViewedLocally ? (
                    // Vidéo floutée avec bouton "Voir" (récepteur avant visionnage)
                    <div className="relative">
                      <video src={media.url} className="rounded-lg max-w-full h-auto max-h-[55vh] border border-white/10 blur-xl" />
                      <button
                        onClick={() => setFullscreenMedia({ url: media.url!, type: 'video', messageId: env.id, isOnceView: true, downloadable: (env as any).downloadable !== false })}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"
                      >
                        <div className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-full text-white font-medium flex items-center gap-2 transition-all hover:scale-105">
                          <span>👁️</span>
                          <span>Voir</span>
                        </div>
                      </button>
                    </div>
                  ) : (
                    // Vidéo normale (messages normaux) - cliquable pour plein écran
                    <div className="relative group">
                      <video 
                        src={media.url} 
                        controls 
                        className="rounded-lg max-w-full h-auto max-h-[55vh] border border-white/10 cursor-pointer"
                        onClick={(e) => {
                          // Si on clique sur la vidéo (pas sur les contrôles), ouvrir en plein écran
                          const target = e.target as HTMLVideoElement
                          if (target.paused) {
                            setFullscreenMedia({ url: media.url!, type: 'video', messageId: env.id, isOnceView: false, downloadable: (env as any).downloadable !== false })
                          }
                        }}
                      />
                      {/* Bouton de téléchargement si autorisé */}
                      {(env as any).downloadable !== false && (
                        <a
                          href={media.url}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all z-10"
                          title="Télécharger"
                        >
                          <Download size={16} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
              {media && media.url && media.mime && media.mime.startsWith('audio/') && (
                <div className="mt-1 mb-5">
                  <audio src={media.url} controls className="w-full max-w-sm" style={{ minHeight: '40px' }} />
                </div>
              )}
              {!media && env.attachmentUrl && (
                <div className="mt-1 mb-5">
                  {/* Skeleton pour le chargement du média */}
                  <div className="relative w-full max-w-sm h-48 bg-gradient-to-br from-white/5 to-white/10 rounded-lg border border-white/10">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-white/10 rounded-full" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-500 border-r-purple-500 rounded-full animate-spin" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-white/80 font-medium mb-1">Déchiffrement sécurisé</div>
                        <div className="text-xs text-white/50">Cela peut prendre quelques secondes...</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute bottom-1 right-2 flex flex-col items-end gap-0.5">
                {/* Badge temps éphémère au-dessus */}
                {(env as any).expiresAt && (
                  <div className="flex items-center gap-0.5 text-[9px] text-orange-300/70">
                    <Clock size={9} className="flex-shrink-0" />
                    <span>{(() => {
                      const expiresAt = new Date((env as any).expiresAt)
                      const now = new Date()
                      const diff = expiresAt.getTime() - now.getTime()
                      const hours = Math.floor(diff / (1000 * 60 * 60))
                      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                      if (hours > 0) return `${hours}h`
                      if (minutes > 0) return `${minutes}min`
                      return 'Bientôt'
                    })()}</span>
                  </div>
                )}
                {/* Heure d'envoi */}
                <div className="flex items-center gap-1 text-[10px] leading-none text-white/50">
                  <span>
                    {(() => {
                      try {
                        const date = new Date(env.createdAt)
                        if (isNaN(date.getTime())) return 'Maintenant'
                        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      } catch {
                        return 'Maintenant'
                      }
                    })()}
                  </span>
                  {mine && (
                    <span className={`${getStatusColor(status)}`} title={status}>
                      {getStatusIcon(status)}
                    </span>
                  )}
                </div>
            </div>
            </motion.div>
          )
        })}
        
        {/* Indicateur de frappe */}
        <TypingIndicator
          isTyping={isTyping && typingUser !== userId}
          userName={typingUser !== userId && typingUser ? (partnerName || 'Quelqu\'un') : undefined}
          className="max-w-[85%] sm:max-w-[70%]"
        />

        {/* Élément invisible pour l'auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Viewer fullscreen pour médias */}
      {fullscreenMedia && (
        <FullscreenMediaViewer
          mediaUrl={fullscreenMedia.url}
          mediaType={fullscreenMedia.type}
          isOnceView={fullscreenMedia.isOnceView}
          downloadable={fullscreenMedia.downloadable}
          onClose={async () => {
            // Vérifier si c'est un message "vue unique"
            const message = envelopes.find(e => e.id === fullscreenMedia.messageId)
            const isOnceView = (message as any)?.viewMode === 'once'
            
            // Marquer comme vu SEULEMENT si c'est un message "vue unique"
            if (isOnceView) {
              // Marquer le message comme vu localement immédiatement
              const newViewedMessages = [...localViewedMessages, fullscreenMedia.messageId]
              setLocalViewedMessages(newViewedMessages)
              
              // Sauvegarder dans localStorage
              try {
                localStorage.setItem(`viewed-messages-${conversationId}`, JSON.stringify(newViewedMessages))
              } catch (e) {
                console.error('Erreur localStorage:', e)
              }
              
              // Appeler l'API en arrière-plan
              try {
              const res = await fetch('/api/e2ee/messages/mark-viewed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  messageId: fullscreenMedia.messageId,
                  userId
                })
              })
              
              if (res.ok) {
                toastInfo('Le message a disparu')
              } else {
                console.error('[MARK VIEWED] Erreur API:', res.status)
              }
              } catch (error) {
                console.error('[MARK VIEWED] Erreur lors du marquage comme vu:', error)
              }
            }
            
            setFullscreenMedia(null)
          }}
        />
      )}
    </div>
  )
}

// Upload helper with progress (XHR because fetch upload progress is not widely supported)
async function uploadWithProgress(fd: FormData, onProgress: (percent: number) => void): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/e2ee/attachments/upload')
    xhr.withCredentials = true
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        const percent = (ev.loaded / ev.total) * 100
        onProgress(percent)
      }
    }
    xhr.onerror = () => reject(new Error('upload_failed'))
    xhr.onload = () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          const json = JSON.parse(xhr.responseText)
          resolve({ url: json.url })
        } else {
          reject(new Error('upload_failed'))
        }
      } catch {
        reject(new Error('upload_failed'))
      }
    }
    xhr.send(fd)
  })
}
