'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import ConversationList from '../../components/chat/ConversationList'
import E2EEThread from '../../components/chat/E2EEThread'
import { MessageCircle, ArrowLeft, Paperclip, Image as ImageIcon, Smile, Send, MoreVertical, Link as LinkIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Conversation, Message } from '../../types/chat'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import EmojiPicker from '../../components/chat/EmojiPicker'
import BodyPortal from '../../components/BodyPortal'
import { useNotification } from '@/components/providers/NotificationProvider'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

// Old messages page (V3 original)
function OldMessagesPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Messages (Version Originale)</h1>
        <p className="text-gray-400">Cette page utilise l'ancienne interface V3</p>
      </div>
    </div>
  )
}

// New messages page (V2 design)
function NewMessagesPage() {
  const { data: session, status } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showHeaderMenu, setShowHeaderMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('Spam')
  const [reportDetails, setReportDetails] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useNotification()
  const headerTitle = useMemo(() => {
    if (activeConversation && activeConversation.participants?.length) {
      const other = (activeConversation.participants as any[]).find(p => p?.role !== 'escort') || (activeConversation.participants as any[])[0]
      return other?.name || 'Conversation'
    }
    return 'Messages'
  }, [activeConversation])
  const headerSubtitle = useMemo(() => {
    if (activeConversation) return 'Conversation chiffrée'
    return 'Vos conversations'
  }, [activeConversation])
  const otherParticipant = useMemo(() => {
    if (activeConversation && Array.isArray((activeConversation as any).participants)) {
      const parts = (activeConversation as any).participants
      const other = parts.find((p: any) => p?.role !== 'escort') || parts[0]
      return other
    }
    return null
  }, [activeConversation])
  const [headerSearch, setHeaderSearch] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)
  const [pendingConvToOpen, setPendingConvToOpen] = useState<string | null>(null)

  // Read deep link (?conv=...) to auto-open a conversation when list is loaded
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const params = new URLSearchParams(window.location.search)
      const conv = params.get('conv')
      if (conv) setPendingConvToOpen(conv)
    } catch {}
  }, [])

  useEffect(() => {
    if (!pendingConvToOpen || conversations.length === 0) return
    const found = conversations.find(c => c.id === pendingConvToOpen)
    if (found) {
      setActiveConversation(found)
      setPendingConvToOpen(null)
    }
  }, [pendingConvToOpen, conversations])

  // Load E2EE conversations for current user (handle unauthenticated)
  useEffect(() => {
    if (status === 'loading') { setIsLoading(true); return }
    if (status === 'unauthenticated') { setIsLoading(false); return }
    ;(async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/e2ee/conversations/list')
        const data = await res.json()
        if (Array.isArray(data?.conversations)) setConversations(data.conversations)
      } finally { setIsLoading(false) }
    })()
  }, [status])

  // Load messages for active conversation
  const handleSelectConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation)
  }

  // Update local last-seen timestamp when opening a conversation
  useEffect(() => {
    if (activeConversation?.id) {
      try { localStorage.setItem(`felora-e2ee-last-seen-${activeConversation.id}`, String(Date.now())) } catch {}
      ;(async () => {
        try {
          await fetch('/api/e2ee/conversations/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId: activeConversation.id })
          })
        } catch {}
      })()
    }
  }, [activeConversation?.id])

  // Fetch block status on participant change
  useEffect(() => {
    (async () => {
      if (!otherParticipant?.id) { setIsBlocked(false); return }
      try {
        const res = await fetch(`/api/chat/block/status?targetUserId=${encodeURIComponent(otherParticipant.id)}`)
        if (!res.ok) { setIsBlocked(false); return }
        const d = await res.json()
        setIsBlocked(!!d?.blocked)
      } catch { setIsBlocked(false) }
    })()
  }, [otherParticipant?.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Chargement du chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header avec style V2 */}
      <div 
        className="sticky top-0 z-30 p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeConversation) {
                  setActiveConversation(null)
                } else {
                  router.back()
                }
              }}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              aria-label="Revenir à la page précédente"
              title="Retour"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 
                className="text-2xl font-bold text-white flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {headerTitle}
                {isBlocked && (
                  <span className="px-2 py-0.5 text-xs rounded bg-red-500/20 border border-red-500/30 text-red-300">Bloqué</span>
                )}
              </h1>
              <p className="text-gray-400 text-sm">{headerSubtitle}</p>
            </div>
          </div>
          
          {activeConversation ? (
            <div className="relative">
              <button
                onClick={async () => {
                  if (!activeConversation) return
                  try {
                    const url = `${window.location.origin}/messages?conv=${encodeURIComponent(activeConversation.id)}`
                    await navigator.clipboard.writeText(url)
                    toastSuccess('Lien d\'invitation copié')
                  } catch {
                    toastError('Impossible de copier le lien')
                  }
                }}
                className="mr-2 px-2 sm:px-3 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 inline-flex items-center gap-1 sm:gap-2"
                title="Copier le lien d\'invitation"
                aria-label="Copier le lien d\'invitation"
              >
                <LinkIcon size={16} />
                <span className="hidden sm:inline">Inviter</span>
              </button>
              <button
                onClick={() => setShowHeaderMenu(v => !v)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                aria-haspopup="menu"
                aria-expanded={showHeaderMenu}
                aria-label="Options de conversation"
                title="Options"
              >
                <MoreVertical size={18} />
              </button>
              {showHeaderMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 bg-gray-900/95 backdrop-blur-sm shadow-lg overflow-hidden z-50">
                  <button
                    role="menuitem"
                    className="w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                    onClick={() => { setShowHeaderMenu(false); setShowReportModal(true) }}
                  >Signaler</button>
                  <button
                    role="menuitem"
                    className="w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                    onClick={async () => {
                      setShowHeaderMenu(false)
                      try {
                        if (otherParticipant?.id) {
                          const res = await fetch('/api/chat/block/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId: otherParticipant.id }) })
                          if (!res.ok) throw new Error('toggle_failed')
                          const d = await res.json()
                          setIsBlocked(!!d?.blocked)
                          toastSuccess(d?.blocked ? 'Utilisateur bloqué' : 'Utilisateur débloqué')
                        }
                      } catch {
                        toastError('Action impossible')
                      }
                    }}
                  >{isBlocked ? 'Débloquer' : 'Bloquer'}</button>
                </div>
              )}
            </div>
          ) : null}
        </div>
        {/* Search under header when no conversation */}
        {!activeConversation && (
          <div className="max-w-7xl mx-auto mt-3">
            <div className="relative">
              <input
                aria-label="Rechercher une conversation"
                type="text"
                placeholder="Rechercher une conversation..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-gray-800/60 border border-gray-700/60 rounded-xl text-white placeholder-gray-400 focus:border-var(--felora-aurora) focus:outline-none transition-colors"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Interface Mobile-First avec style V2 */}
      <div className="flex-1 min-h-0 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div 
            className="h-full min-h-0 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <>
              {/* Desktop: Split View */}
              <div className="hidden lg:flex h-full min-h-0">
                <div className="w-1/3 border-r border-gray-700/50">
                  <ConversationList
                    conversations={conversations}
                    activeConversation={activeConversation}
                    onSelectConversation={handleSelectConversation}
                    searchQuery={headerSearch}
                    loading={isLoading}
                  />
                </div>
                <div className="flex-1 min-h-0">
                  {activeConversation ? (
                    <E2EEThread
                      conversationId={activeConversation.id}
                      userId={session?.user?.id || ''}
                      partnerId={(activeConversation.participants.find((p:any)=> p.id!== (session?.user?.id||''))|| activeConversation.participants[0])?.id}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageCircle size={48} className="mb-4 opacity-50" />
                      {status === 'unauthenticated' ? (
                        <div className="text-center">
                          <h3 
                            className="text-lg font-medium mb-2 text-white"
                            style={{
                              background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            Connectez‑vous pour messager
                          </h3>
                          <a 
                            href="/login" 
                            className="inline-block mt-2 px-6 py-3 rounded-lg text-white font-semibold transition-all hover:scale-105"
                            style={{
                              background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                              boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)'
                            }}
                          >
                            Se connecter
                          </a>
                        </div>
                      ) : (
                        <>
                          <h3 
                            className="text-lg font-medium mb-2"
                            style={{
                              background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            Sélectionnez une conversation
                          </h3>
                          <p className="text-sm text-center max-w-md" style={{ color: 'var(--felora-silver-60)' }}>
                            Choisissez une conversation pour commencer à échanger.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* Mobile: Single View */}
              <div className="lg:hidden h-full min-h-0">
                {activeConversation ? (
                  <div className="h-full min-h-0">
                    <E2EEThread
                      conversationId={activeConversation.id}
                      userId={session?.user?.id || ''}
                      partnerId={(activeConversation.participants.find((p:any)=> p.id!== (session?.user?.id||''))|| activeConversation.participants[0])?.id}
                    />
                  </div>
                ) : (
                  <div className="h-full">
                    {status === 'unauthenticated' ? (
                      <div className="h-full flex flex-col items-center justify-center p-4 text-white/70">
                        <p className="mb-3" style={{ color: 'var(--felora-silver-70)' }}>
                          Connectez‑vous pour voir vos conversations.
                        </p>
                        <a 
                          href="/login" 
                          className="px-6 py-3 rounded-lg text-white font-semibold transition-all hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                            boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)'
                          }}
                        >
                          Se connecter
                        </a>
                      </div>
                    ) : (
                      <ConversationList
                        conversations={conversations}
                        activeConversation={activeConversation}
                        onSelectConversation={handleSelectConversation}
                        searchQuery={headerSearch}
                        loading={isLoading}
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          </div>
        </div>
      </div>

      {/* Page-level composer fixed to footer via portal (only when a conversation is open) */}
      {activeConversation && (
        <BodyPortal>
          <div 
            className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-auto backdrop-blur border-t shadow-[0_-8px_16px_-8px_rgba(0,0,0,0.5)] pb-[calc(env(safe-area-inset-bottom)+8px)]"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-2">
              {isBlocked && (
                <div className="mb-2 text-center text-xs" style={{ color: 'var(--felora-silver-70)' }}>
                  Vous avez bloqué cet utilisateur. Débloquez pour envoyer des messages.
                </div>
              )}
              <PageComposer active={!isBlocked} />
            </div>
          </div>
        </BodyPortal>
      )}
        {/* Report modal avec style V2 */}
        <BodyPortal>
          {(showReportModal && otherParticipant) ? (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowReportModal(false)} />
              <div 
                className="relative w-[min(92vw,32rem)] rounded-xl border p-4 text-white"
                style={{
                  background: 'rgba(15, 15, 25, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{
                    background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Signaler {otherParticipant.name}
                </h3>
              <label className="block text-sm text-white/80 mb-1">Raison</label>
              <select value={reportReason} onChange={e => setReportReason(e.target.value)} className="w-full mb-3 bg-gray-800/60 border border-gray-700/60 rounded-lg px-3 py-2">
                <option>Spam</option>
                <option>Harcèlement</option>
                <option>Arnaque</option>
                <option>Contenu inapproprié</option>
                <option>Autre</option>
              </select>
              <label className="block text-sm text-white/80 mb-1">Détails (optionnel)</label>
              <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)} rows={4} className="w-full bg-gray-800/60 border border-gray-700/60 rounded-lg px-3 py-2 mb-4 resize-none" placeholder="Expliquez brièvement le problème..." />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setShowReportModal(false)} 
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--felora-silver)'
                  }}
                >
                  Annuler
                </button>
                <button 
                  disabled={reportSubmitting} 
                  onClick={async () => {
                    if (!otherParticipant?.id) return
                    try {
                      const res = await fetch('/api/chat/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId: otherParticipant.id, conversationId: activeConversation?.id, reason: reportReason, details: reportDetails }) })
                      if (!res.ok) throw new Error('report_failed')
                      setShowReportModal(false)
                      setReportDetails('')
                      toastSuccess('Signalement envoyé')
                    } finally {
                      setReportSubmitting(false)
                    }
                  }} 
                  className="px-4 py-2 rounded-lg text-white font-semibold transition-all hover:scale-105 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                    boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)'
                  }}
                >
                  {reportSubmitting ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </BodyPortal>
    </div>
  )
}

// Lightweight page-level composer that proxies to ChatWindow via window.__feloraChatSend
function PageComposer({ active }: { active: boolean }) {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const onSend = () => {
    if (!active) return
    // @ts-ignore
    if (typeof window !== 'undefined' && window.__feloraChatSend) {
      // @ts-ignore
      window.__feloraChatSend({ text })
      setText('')
      setShowEmoji(false)
    }
  }
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Pill input */}
        <div className={`flex items-end gap-2 flex-1 rounded-full bg-gray-800/60 px-3 py-2 ${!active ? 'opacity-50' : ''}`}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={active ? 'Écrire un message…' : 'Sélectionnez une conversation'}
            disabled={!active}
            rows={1}
            className="flex-1 bg-transparent border-0 outline-none text-white placeholder-gray-400 resize-none"
            style={{ minHeight: 36, maxHeight: 120 }}
            onInput={(e) => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 120) + 'px'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSend()
              }
            }}
          />
          <div className="flex items-center gap-1 pr-1">
        <button
          onClick={() => setShowEmoji(v => !v)}
          className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Emoji"
          disabled={!active}
        >
          <Smile size={18} />
        </button>
        <button
          onClick={() => mediaInputRef.current?.click()}
          className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Image/Vidéo"
          disabled={!active}
        >
          <ImageIcon size={18} />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Pièce jointe"
          disabled={!active}
        >
          <Paperclip size={18} />
        </button>
          </div>
        </div>

        {/* Send outside the pill */}
        <button
          onClick={onSend}
          disabled={!active || !text.trim()}
          className={`p-2 rounded-full transition-all ${
            (!active || !text.trim()) 
              ? 'bg-white/10 text-white/40 cursor-not-allowed' 
              : 'text-white hover:shadow-lg hover:scale-105'
          }`}
          style={(!active || !text.trim()) ? {} : {
            background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
            boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)'
          }}
          aria-label="Envoyer"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={e => {
        const file = e.target.files?.[0]
        if (!file || !active) return
        // @ts-ignore
        if (typeof window !== 'undefined' && window.__feloraChatSend) {
          // @ts-ignore
          window.__feloraChatSend({ text, file })
          setText('')
          e.currentTarget.value = ''
        }
      }} />
      <input ref={mediaInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => {
        const file = e.target.files?.[0]
        if (!file || !active) return
        // @ts-ignore
        if (typeof window !== 'undefined' && window.__feloraChatSend) {
          // @ts-ignore
          window.__feloraChatSend({ text, file })
          setText('')
          e.currentTarget.value = ''
        }
      }} />

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-14 right-3 z-50"
          >
            <EmojiPicker
              onSelect={(emoji: string) => setText(prev => prev + emoji)}
              onClose={() => setShowEmoji(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MessagesPage() {
  const isNewMessagesEnabled = useFeatureFlag('NEXT_PUBLIC_FEATURE_UI_MESSAGES')
  
  if (isNewMessagesEnabled) {
    return <NewMessagesPage />
  }
  
  return <OldMessagesPage />
}