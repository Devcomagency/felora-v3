'use client'

import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { encryptFileWithEnvelopes, decryptFileWithEnvelopes, decryptFile } from '@packages/e2ee-signal/crypto'
import { fetchBundle, uploadKeyBundle } from '@packages/e2ee-signal/client'
import { ensureLibsignalBootstrap } from '@packages/e2ee-signal/bootstrap'
import { createSession, encrypt, getSession, setLocalUser, decrypt } from '@packages/e2ee-signal/session'
import { useNotification } from '@/components/providers/NotificationProvider'
import TypingIndicator from './TypingIndicator'

type Envelope = { id: string; messageId: string; senderUserId: string; cipherText: string; attachmentUrl?: string | null; attachmentMeta?: any; createdAt: string; status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' }

export default function E2EEThread({ conversationId, userId, partnerId }: { conversationId: string; userId: string; partnerId: string }) {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [mediaCache, setMediaCache] = useState<Record<string, { url: string; mime: string }>>({})
  const esRef = useRef<EventSource | null>(null)
  const { success: toastSuccess, error: toastError, info: toastInfo } = useNotification()
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [textCache, setTextCache] = useState<Record<string, string>>({})
  const [messageStatuses, setMessageStatuses] = useState<Record<string, 'sending' | 'sent' | 'delivered' | 'read' | 'failed'>>({})
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const addEnvelopeUnique = (env: Envelope) => {
    setEnvelopes(prev => prev.some(e => e.id === env.id || e.messageId === env.messageId) ? prev : [...prev, env])
  }

  const updateMessageStatus = (messageId: string, status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed') => {
    setMessageStatuses(prev => ({ ...prev, [messageId]: status }))
  }

  const startTyping = () => {
    setIsTyping(true)
    setTypingUser(userId)
    
    // Envoyer l'événement de frappe au serveur
    fetch('/api/e2ee/typing/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  // Load history
  useEffect(() => {
    ;(async () => {
      try {
        setLoadingHistory(true)
        const res = await fetch(`/api/e2ee/messages/history?conversationId=${encodeURIComponent(conversationId)}`)
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`)
        }
        const data = await res.json()
        if (Array.isArray(data?.messages)) {
          setEnvelopes(data.messages)
        } else {
          console.warn('Format de données inattendu:', data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error)
        toastError('Impossible de charger l\'historique des messages')
      } finally { 
        setLoadingHistory(false) 
      }
    })()
  }, [conversationId])

  // SSE (with catch-up after last known timestamp)
  useEffect(() => {
    if (loadingHistory) return
    esRef.current?.close()
    const last = envelopes.length ? envelopes[envelopes.length - 1] : null
    const after = last ? `&after=${encodeURIComponent(new Date(last.createdAt).getTime())}` : ''
    const es = new EventSource(`/api/e2ee/messages/sse?conversationId=${encodeURIComponent(conversationId)}${after}`)
    es.onmessage = (evt) => { 
      try { 
        const data = JSON.parse(evt.data)
        
        // Gérer les messages
        if (data.type === 'message') {
          const env: Envelope = data
          addEnvelopeUnique(env)
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
      } catch (error) {
        console.error('Erreur lors du parsing du message SSE:', error)
      } 
    }
    es.onerror = (error) => {
      console.error('Erreur de connexion SSE:', error)
      toastError('Connexion en temps réel interrompue')
    }
    esRef.current = es
    return () => { es.close() }
  }, [conversationId, loadingHistory])

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
      if (!sess) return
      const updates: Record<string, string> = {}
      for (const env of envelopes) {
        if (env.attachmentUrl) continue // only text here
        if (env.senderUserId === userId) continue // outgoing; skip decrypt (not addressed to self)
        if (textCache[env.id]) continue
        try {
          const plain = await decrypt(sess, env.cipherText)
          updates[env.id] = plain
        } catch {}
      }
      if (Object.keys(updates).length) setTextCache(prev => ({ ...prev, ...updates }))
    })()
  }, [envelopes, partnerId, userId])

  // Exposer les fonctions de frappe globalement
  useEffect(() => {
    // @ts-ignore
    window.__feloraChatStartTyping = startTyping
    // @ts-ignore
    window.__feloraChatStopTyping = stopTyping
  }, [conversationId, userId])

  // Bridge external composer
  useEffect(() => {
    // @ts-ignore
    window.__feloraChatSend = async ({ text, file }: { text?: string; file?: File }) => {
      const deviceId = localStorage.getItem(`felora-e2ee-device-${userId}`) || `${userId}-dev`
      if (file) {
        try {
          toastInfo('Upload en cours…')
          let sess = getSession(partnerId)
          if (!sess) {
            try { const { bundle } = await fetchBundle(partnerId); sess = await createSession(partnerId, bundle) } catch {}
          }
          const recipients = [userId, partnerId]
          const wrap = async (keyB64: string, _recipient: string) => {
            // For now, fallback: if session exists (partner), use encrypt(keyB64) → placeholder; else plaintext for self
            if (_recipient === partnerId && sess) return await encrypt(sess, keyB64)
            return keyB64
          }
          const { cipherBlob, meta } = await encryptFileWithEnvelopes(file, wrap, recipients)
          const fd = new FormData()
          fd.append('file', cipherBlob, 'blob.bin')
          fd.append('meta', JSON.stringify(meta))
          const { url } = await uploadWithProgress(fd, (p) => setUploadProgress(p))
          const messageId = uuidv4()
          updateMessageStatus(messageId, 'sending')
          const payload = { conversationId, senderUserId: userId, senderDeviceId: deviceId, messageId, cipherText: btoa(`[attachment:${url}]`), attachment: { url, meta } }
          const res = await fetch('/api/e2ee/messages/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
          if (!res.ok) {
            updateMessageStatus(messageId, 'failed')
            throw new Error('send_failed')
          }
          const data = await res.json()
          if (data?.message) {
            addEnvelopeUnique(data.message)
            updateMessageStatus(messageId, 'sent')
          }
          toastSuccess('Média envoyé')
          setUploadProgress(null)
        } catch (error) {
          console.error('Erreur lors de l\'envoi du média:', error)
          toastError('Échec de l\'envoi du média. Veuillez réessayer.')
          setUploadProgress(null)
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
        updateMessageStatus(messageId, 'sending')
        const payload = { conversationId, senderUserId: userId, senderDeviceId: deviceId, messageId, cipherText: ct }
        const res = await fetch('/api/e2ee/messages/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) {
          updateMessageStatus(messageId, 'failed')
          throw new Error('send_failed')
        }
        const data = await res.json()
        if (data?.message) {
          addEnvelopeUnique(data.message)
          updateMessageStatus(messageId, 'sent')
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error)
        toastError('Échec de l\'envoi du message. Veuillez réessayer.')
      }
    }
    return () => { /* cleanup left empty to preserve composer binding between renders */ }
  }, [conversationId, userId, partnerId])

  // Decrypt attachments, cache URLs
  useEffect(() => {
    (async () => {
      const pending = envelopes.filter(e => e.attachmentUrl && e.attachmentMeta && !mediaCache[e.id])
      if (!pending.length) return
      const updates: Record<string, { url: string; mime: string }> = {}
      for (const env of pending) {
        try {
          const urlObj = new URL(String(env.attachmentUrl), window.location.origin)
          const safePath = urlObj.pathname.split('/').pop() || ''
          const resp = await fetch(`/api/e2ee/attachments/get?path=${encodeURIComponent(safePath)}&conversationId=${encodeURIComponent(conversationId)}`)
          const cipherBlob = await resp.blob()
          // Unwrap via envelope if present
          const sess = getSession(env.senderUserId === userId ? partnerId : env.senderUserId)
          const unwrap = async (envelope: string) => {
            if (sess && env.senderUserId !== userId) {
              // Receiver side — if we had libsignal: decrypt(envelope)
              // Fallback: base64 decode via decrypt placeholder not needed; envelope contains keyB64 or encrypt(base64)
              try {
                // @ts-ignore
                const dec = await decrypt(sess as any, envelope)
                return dec
              } catch {
                return envelope
              }
            }
            return envelope
          }
          const plainBlob = env.attachmentMeta?.envelopes
            ? await decryptFileWithEnvelopes(cipherBlob, env.attachmentMeta, unwrap, userId)
            : await decryptFile(cipherBlob, env.attachmentMeta)
          updates[env.id] = { url: URL.createObjectURL(plainBlob), mime: env.attachmentMeta?.mime || plainBlob.type || 'application/octet-stream' }
        } catch (error) {
          console.error('Erreur lors du déchiffrement du média:', error)
          toastError('Impossible de déchiffrer le média')
        }
      }
      if (Object.keys(updates).length) setMediaCache(prev => ({ ...prev, ...updates }))
    })()
    return () => { Object.values(mediaCache).forEach(({ url }) => URL.revokeObjectURL(url)) }
  }, [envelopes])

  const renderText = (env: Envelope) => {
    // Prefer decrypted cache for incoming. For outgoing or fallback, attempt base64.
    const cached = textCache[env.id]
    if (cached) return cached.startsWith('[attachment:') ? '' : cached
    try {
      const dec = b64DecodeUtf8(env.cipherText)
      if (dec.startsWith('[attachment:')) return ''
      return dec
    } catch {
      return env.attachmentUrl ? '' : '•••'
    }
  }

  return (
    <div className="grid grid-rows-[1fr] h-full min-h-0">
      <div className="relative overflow-y-auto p-3 sm:p-4 space-y-2">
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
        {envelopes.map(env => {
          const mine = env.senderUserId === userId
          const bubbleClass = mine ? 'ml-auto bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-white/20' : 'bg-white/5 border border-white/10'
          const media = mediaCache[env.id]
          const text = renderText(env)
          const status = messageStatuses[env.messageId] || env.status || 'sent'
          
          const getStatusIcon = (status: string) => {
            switch (status) {
              case 'sending': return '⏳'
              case 'sent': return '✓'
              case 'delivered': return '✓✓'
              case 'read': return '✓✓'
              case 'failed': return '❌'
              default: return '✓'
            }
          }

          const getStatusColor = (status: string) => {
            switch (status) {
              case 'sending': return 'text-yellow-400'
              case 'sent': return 'text-gray-400'
              case 'delivered': return 'text-blue-400'
              case 'read': return 'text-green-400'
              case 'failed': return 'text-red-400'
              default: return 'text-gray-400'
            }
          }

          return (
            <div key={env.id} className={`relative max-w-[85%] sm:max-w-[70%] rounded-xl px-3 py-2 pr-10 text-sm ${bubbleClass}`}>
              {text && <div className="whitespace-pre-wrap break-words mb-1">{text}</div>}
              {media && media.mime.startsWith('image/') && (
                <img src={media.url} alt="Pièce jointe" className="mt-1 rounded-lg max-w-full h-auto max-h-[55vh] border border-white/10" loading="lazy" />
              )}
              {media && media.mime.startsWith('video/') && (
                <video src={media.url} controls className="mt-1 rounded-lg max-w-full h-auto max-h-[55vh] border border-white/10" />
              )}
              {!media && env.attachmentUrl && (
                <div className="mt-1 text-xs text-white/60">Pièce jointe… déchiffrement en cours</div>
              )}
              <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[10px] leading-none text-white/50">
                <span>{new Date(env.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {mine && (
                  <span className={`${getStatusColor(status)}`} title={status}>
                    {getStatusIcon(status)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
        
        {/* Indicateur de frappe */}
        <TypingIndicator 
          isTyping={isTyping && typingUser !== userId} 
          userName={typingUser !== userId ? typingUser : undefined}
          className="max-w-[85%] sm:max-w-[70%]"
        />
      </div>
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
