'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import ConversationList from '../../components/chat/ConversationList'
import E2EEThread from '../../components/chat/E2EEThread'
import { MessageCircle, ArrowLeft, Paperclip, Image as ImageIcon, Smile, Send, MoreVertical, Mic, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Conversation } from '../../types/chat'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import EmojiPicker from '../../components/chat/EmojiPicker'
import AttachmentPreview from '../../components/chat/AttachmentPreview'
import VoiceRecorder from '../../components/chat/VoiceRecorder'
import BodyPortal from '../../components/BodyPortal'
import { useNotification } from '@/components/providers/NotificationProvider'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { MESSAGING_CONSTANTS, MEDIA_CONSTANTS } from '@/constants/messaging'
import { compressImageIfNeeded } from '@/utils/imageCompression'
import { useNetworkError } from '@/hooks/useNetworkError'
import NetworkErrorBanner from '@/components/NetworkErrorBanner'
import ReportModal from '@/components/ReportModal'
import { useTranslations } from 'next-intl'

// Old messages page (V3 original)
function OldMessagesPage() {
  const t = useTranslations('messages')

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{t('oldVersion')}</h1>
        <p className="text-gray-400">{t('oldVersionDescription')}</p>
      </div>
    </div>
  )
}

// New messages page (V2 design)
function NewMessagesPage() {
  const t = useTranslations('messages')
  const { data: session, status } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showHeaderMenu, setShowHeaderMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showEphemeralMenu, setShowEphemeralMenu] = useState(false)
  const [ephemeralMode, setEphemeralMode] = useState(false)
  const [ephemeralDuration, setEphemeralDuration] = useState(86400) // 24h par défaut
  const [isMobile, setIsMobile] = useState(() => {
    // Initialiser correctement dès le départ
    if (typeof window === 'undefined') return false
    return window.innerWidth < 1024
  })
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useNotification()
  
  const { error: networkError, isRetrying, retryCount, handleError, clearError, retry } = useNetworkError()
  const headerTitle = useMemo(() => {
    if (activeConversation && activeConversation.participants?.length) {
      const parts = activeConversation.participants as any[]
      const currentUserId = session?.user?.id || ''
      // Trouver l'autre participant (pas l'utilisateur courant)
      const other = parts.find(p => p?.id !== currentUserId) || parts[0]
      return other?.name || t('conversation')
    }
    return t('title')
  }, [activeConversation, session?.user?.id, t])
  const headerSubtitle = useMemo(() => {
    if (activeConversation) return t('encryptedConversation')
    return t('yourConversations')
  }, [activeConversation, t])
  const otherParticipant = useMemo(() => {
    if (activeConversation && Array.isArray((activeConversation as any).participants)) {
      const parts = (activeConversation as any).participants
      const currentUserId = session?.user?.id || ''
      // Trouver l'autre participant (pas l'utilisateur courant)
      const other = parts.find((p: any) => p?.id !== currentUserId) || parts[0]
      return other
    }
    return null
  }, [activeConversation, session?.user?.id])
  const [headerSearch, setHeaderSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)
  const [pendingConvToOpen, setPendingConvToOpen] = useState<string | null>(null)
  const [pendingUserToMessage, setPendingUserToMessage] = useState<string | null>(null)
  const conversationsRef = useRef<Conversation[]>([])

  // Update ref when conversations change
  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  // Détecter si mobile (pour ne monter qu'UNE SEULE instance d'E2EEThread)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Read deep link (?conv=... ou ?to=...) to auto-open a conversation when list is loaded
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const params = new URLSearchParams(window.location.search)
      const conv = params.get('conv')
      const to = params.get('to')
      if (conv) {
        setPendingConvToOpen(conv)
      } else if (to) {
        setPendingUserToMessage(to)
      }
    } catch (error) {
      console.error('Error reading URL params:', error)
    }
  }, [])

  useEffect(() => {
    if (!pendingConvToOpen || conversations.length === 0) return
    const found = conversations.find(c => c.id === pendingConvToOpen)
    if (found) {
      setActiveConversation(found)
      setPendingConvToOpen(null)
    }
  }, [pendingConvToOpen, conversations])

  // Handle creating conversation with intro message when ?to= is provided
  const createConversationWithIntro = useCallback(async () => {
    console.log('[CREATE CONV] Checking conditions:', {
      pendingUserToMessage,
      userId: session?.user?.id,
      conversationsLoaded: conversations.length
    })

    if (!pendingUserToMessage || !session?.user?.id) {
      console.log('[CREATE CONV] Aborting - missing requirements')
      return
    }

    console.log('[CREATE CONV] Starting conversation creation...')

    try {
      // Vérifier si une conversation existe déjà avec cet utilisateur
      const existingConv = conversationsRef.current.find(conv =>
        conv.participants.some(p => p.id === pendingUserToMessage)
      )

      if (existingConv) {
        setActiveConversation(existingConv)
        setPendingUserToMessage(null)
        return
      }

      // Récupérer les infos du profil pour le message d'introduction
      const profileRes = await fetch(`/api/escort/profile/${encodeURIComponent(pendingUserToMessage)}`, {
        credentials: 'include'
      })
      let profileName = t('thisProfile')
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        profileName = profileData?.stageName || profileData?.name || t('thisProfile')
      }

      try {
        // Appeler l'API avec les cookies de session
        const createResponse = await fetch('/api/e2ee/conversations/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            participantId: pendingUserToMessage,
            introMessage: t('introMessage', { name: profileName })
          })
        })

        if (!createResponse.ok) {
          const errorData = await createResponse.text()
          console.error('Erreur lors de la création de la conversation:', { 
            status: createResponse.status, 
            statusText: createResponse.statusText, 
            errorData 
          })
          throw new Error(`Erreur ${createResponse.status}: ${createResponse.statusText}`)
        }

        const { conversation } = await createResponse.json()

        setActiveConversation(conversation)

        // Ajouter la conversation à la liste SEULEMENT si elle n'existe pas déjà
        setConversations(prev => {
          const exists = prev.some(c => c.id === conversation.id)
          if (exists) {
            return prev
          }
          return [conversation, ...prev]
        })

        toastSuccess(t('conversationCreated'))
      } catch (error) {
        console.error('Erreur lors de la création de la conversation:', error)

        // Fallback : Créer une conversation simulée si l'API échoue
        const simulatedConversation: Conversation = {
          id: `temp-${Date.now()}`,
          type: 'direct',
          participants: [
            {
              id: session.user.id,
              name: session.user.name || t('you'),
              role: 'client',
              isPremium: false,
              isVerified: false,
              onlineStatus: 'online'
            },
            {
              id: pendingUserToMessage,
              name: profileName,
              role: 'escort',
              isPremium: false,
              isVerified: false,
              onlineStatus: 'offline'
            }
          ],
          lastMessage: {
            id: `intro-${Date.now()}`,
            conversationId: `temp-${Date.now()}`,
            senderId: session.user.id,
            type: 'text',
            content: t('introMessage', { name: profileName }),
            status: 'sent',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          unreadCount: 1,
          isPinned: false,
          isMuted: false,
          isArchived: false,
          isBlocked: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        setActiveConversation(simulatedConversation)

        // Ajouter la conversation à la liste SEULEMENT si elle n'existe pas déjà
        setConversations(prev => {
          const exists = prev.some(c => c.id === simulatedConversation.id)
          if (exists) {
            return prev
          }
          return [simulatedConversation, ...prev]
        })

        toastSuccess(t('conversationCreated'))
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error)
      toastError(t('conversationCreationError'))
    } finally {
      setPendingUserToMessage(null)
    }
  }, [pendingUserToMessage, session?.user?.id, toastSuccess, toastError, t])

  useEffect(() => {
    if (pendingUserToMessage && session?.user?.id) {
      createConversationWithIntro()
    }
  }, [createConversationWithIntro, pendingUserToMessage, session?.user?.id])

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(headerSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [headerSearch])

  // Navigation au clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Échap : Fermer les modaux
      if (e.key === 'Escape') {
        if (showHeaderMenu) setShowHeaderMenu(false)
        if (showReportModal) setShowReportModal(false)
        if (showEphemeralMenu) setShowEphemeralMenu(false)
        if (activeConversation) setActiveConversation(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showHeaderMenu, showReportModal, showEphemeralMenu, activeConversation])

  // 🚀 OPTIMISÉ : Load conversations avec AbortController
  const loadConversations = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/e2ee/conversations/list', {
        credentials: 'include',
        signal // Passer le signal pour pouvoir annuler
      })
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`)
      }
      const data = await res.json()
      if (Array.isArray(data?.conversations)) {
        // Dédupliquer les conversations par ID pour éviter les erreurs React de clés dupliquées
        const uniqueConversations = Array.from(
          new Map((data.conversations || []).map((conv: any) => [conv.id, conv])).values()
        ) as Conversation[]
        setConversations(uniqueConversations)
        clearError() // Clear any previous errors on success
      } else {
        console.warn('Format de données inattendu pour les conversations:', data)
        setConversations([])
      }
    } catch (error: any) {
      // Ignorer les erreurs d'annulation
      if (error.name === 'AbortError') {
        console.log('[MESSAGES] Chargement conversations annulé')
        return
      }
      console.error('Erreur lors du chargement des conversations:', error)
      handleError(error as Error, loadConversations)
      toastError(t('loadConversationsError'))
      setConversations([])
    } finally {
      setIsLoading(false)
    }
  }, [toastError, handleError, clearError, t])

  // 🚀 Charger les conversations avec support d'annulation
  useEffect(() => {
    if (status === 'loading') { setIsLoading(true); return }
    if (status === 'unauthenticated') { setIsLoading(false); return }

    const controller = new AbortController()
    loadConversations(controller.signal)

    return () => {
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Load messages for active conversation
  const handleSelectConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation)
    
    // Charger les paramètres éphémères de la conversation
    const ephemeralModeValue = (conversation as any).ephemeralMode || false
    const ephemeralDurationValue = (conversation as any).ephemeralDuration || 86400
    setEphemeralMode(ephemeralModeValue)
    setEphemeralDuration(ephemeralDurationValue)
  }

  // 🚀 OPTIMISÉ : Update local last-seen + marquer conversation ouverte (1 seule requête)
  useEffect(() => {
    if (!activeConversation?.id || !session?.user?.id) return

    // Mettre à jour le timestamp local
    try {
      localStorage.setItem(
        `felora-e2ee-last-seen-${activeConversation.id}`,
        String(Date.now())
      )
    } catch {}

    // 🚀 Utiliser l'endpoint transactionnel unifié qui fait tout en une fois :
    // - Marque les messages comme lus
    // - Met à jour E2EEConversationRead.lastReadAt
    // - Marque les notifications MESSAGE_RECEIVED comme lues
    const controller = new AbortController()

    ;(async () => {
      try {
        const res = await fetch('/api/e2ee/conversations/mark-opened', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ conversationId: activeConversation.id }),
          signal: controller.signal
        })

        if (!res.ok) {
          console.warn('[MESSAGES] Erreur marquage conversation ouverte:', res.status)
          return
        }

        const data = await res.json()
        console.log('[MESSAGES] ✅ Conversation marquée ouverte:', data)
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('[MESSAGES] Requête annulée (changement rapide de conversation)')
        } else {
          console.error('[MESSAGES] Erreur marquage conversation ouverte:', error)
        }
      }
    })()

    // Cleanup : annuler la requête si on change de conversation rapidement
    return () => {
      controller.abort()
    }
  }, [activeConversation?.id, session?.user?.id])

  // Fetch block status on participant change
  useEffect(() => {
    (async () => {
      if (!otherParticipant?.id) { setIsBlocked(false); return }
      try {
        const res = await fetch(`/api/chat/block/status?targetUserId=${encodeURIComponent(otherParticipant.id)}`)
        if (!res.ok) { 
          console.warn('Erreur lors de la vérification du statut de blocage:', res.status)
          setIsBlocked(false)
          return 
        }
        const d = await res.json()
        setIsBlocked(!!d?.blocked)
      } catch (error) {
        console.error('Erreur lors de la vérification du statut de blocage:', error)
        setIsBlocked(false) 
      }
    })()
  }, [otherParticipant?.id])

  // Vérifier que l'utilisateur est un client ou une escort (les deux peuvent utiliser la messagerie)
  const userRole = (session?.user as any)?.role?.toLowerCase()
  if (session?.user && userRole !== 'client' && userRole !== 'escort') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{t('limitedAccess')}</h1>
          <p className="text-gray-400 mb-6">
            {t('limitedAccessDescription')}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            {t('backToHome')}
          </button>
        </div>
      </div>
    )
  }

  // Si l'utilisateur n'est pas connecté, afficher un message de connexion
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{t('loginRequired')}</h1>
          <p className="text-gray-400 mb-6">
            {t('loginRequiredDescription')}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            {t('login')}
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">{t('loadingChat')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Network Error Banner */}
      {networkError && (
        <NetworkErrorBanner
          error={networkError}
          isRetrying={isRetrying}
          retryCount={retryCount}
          onRetry={retry}
          onDismiss={clearError}
        />
      )}

      {/* Header simplifié */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-sm border-b border-white/10 p-4">
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
              className="p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
              aria-label={t('backToPreviousPage')}
              title={t('back')}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                {headerTitle}
                {isBlocked && (
                  <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-300 border border-red-500/30">{t('blocked')}</span>
                )}
                {ephemeralMode && activeConversation && (
                  <span className="px-2 py-1 text-xs rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20 flex items-center gap-1">
                    <Clock size={11} />
                    <span>{ephemeralDuration / 3600}h</span>
                  </span>
                )}
              </h1>
              <p className="text-gray-400 text-sm">{headerSubtitle}</p>
            </div>
          </div>
          
          {activeConversation ? (
            <div className="relative">
              <button
                onClick={() => setShowHeaderMenu(v => !v)}
                className="p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
                aria-haspopup="menu"
                aria-expanded={showHeaderMenu}
                aria-label={t('conversationOptions')}
                title={t('options')}
              >
                <MoreVertical size={20} />
              </button>
              {showHeaderMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-white/10 bg-gray-900/95 backdrop-blur-sm shadow-lg overflow-hidden z-50">
                  <button
                    role="menuitem"
                    className="w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/10 flex items-center gap-2 border-b border-white/5"
                    onClick={() => { setShowHeaderMenu(false); setShowEphemeralMenu(true) }}
                  >
                    <span>🔥</span>
                    <div className="flex-1">
                      <div>{t('ephemeralMessages')}</div>
                      <div className="text-xs text-gray-400">
                        {ephemeralMode ? t('ephemeralEnabled', { hours: ephemeralDuration / 3600 }) : t('ephemeralDisabled')}
                      </div>
                    </div>
                  </button>
                  <button
                    role="menuitem"
                    className="w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/10"
                    onClick={() => { setShowHeaderMenu(false); setShowReportModal(true) }}
                  >{t('report')}</button>
                  <button
                    role="menuitem"
                    className="w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/10"
                    onClick={async () => {
                      setShowHeaderMenu(false)
                      try {
                        if (otherParticipant?.id) {
                          const res = await fetch('/api/chat/block/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId: otherParticipant.id }) })
                          if (!res.ok) throw new Error('toggle_failed')
                          const d = await res.json()
                          setIsBlocked(!!d?.blocked)
                          toastSuccess(d?.blocked ? t('userBlocked') : t('userUnblocked'))
                        }
                      } catch {
                        toastError(t('actionImpossible'))
                      }
                    }}
                  >{isBlocked ? t('unblock') : t('block')}</button>
                  <button
                    role="menuitem"
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 border-t border-white/5"
                    onClick={async () => {
                      setShowHeaderMenu(false)
                      if (!activeConversation?.id) return

                      if (!confirm(t('deleteConversationConfirm'))) {
                        return
                      }

                      try {
                        const res = await fetch('/api/e2ee/conversations/remove', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include',
                          body: JSON.stringify({ conversationId: activeConversation.id })
                        })

                        if (!res.ok) throw new Error('delete_failed')

                        toastSuccess(t('conversationDeleted'))
                        setActiveConversation(null)
                        // Recharger la liste des conversations
                        loadConversations()
                      } catch {
                        toastError(t('deleteConversationError'))
                      }
                    }}
                  >{t('deleteConversation')}</button>
                </div>
              )}
            </div>
          ) : null}
        </div>
        {/* Search simplifié */}
        {!activeConversation && (
          <div className="max-w-7xl mx-auto mt-4">
            <div className="relative">
              <input
                aria-label={t('searchConversation')}
                type="text"
                placeholder={t('searchConversationPlaceholder')}
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Interface Mobile-First avec style V2 */}
      <div className="flex-1 min-h-0 px-2 sm:px-4 py-2 sm:py-4">
        <div className="max-w-7xl mx-auto h-full">
          <div className="h-full min-h-0 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
            <>
              {/* Desktop: Split View */}
              {!isMobile && <div className="flex h-full min-h-0">
                  <div className="w-1/3 border-r border-gray-700/50">
                    <ConversationList
                      conversations={conversations}
                      activeConversation={activeConversation}
                      onSelectConversation={handleSelectConversation}
                      searchQuery={debouncedSearch}
                      loading={isLoading}
                      currentUserId={session?.user?.id}
                    />
                  </div>
                  <div className="flex-1 min-h-0 flex flex-col">
                    {activeConversation ? (
                      <>
                      <div className="flex-1 min-h-0 overflow-hidden">
                        <E2EEThread
                          key={`desktop-thread-${activeConversation.id}`}
                          conversationId={activeConversation.id}
                          userId={session?.user?.id || ''}
                          partnerId={(activeConversation.participants.find((p:any)=> p.id!== (session?.user?.id||''))|| activeConversation.participants[0])?.id}
                          partnerName={(activeConversation.participants.find((p:any)=> p.id!== (session?.user?.id||''))|| activeConversation.participants[0])?.name}
                        />
                      </div>
                      {/* Composeur intégré pour desktop */}
                      <div className="border-t border-gray-700/50 p-3">
                        {isBlocked ? (
                          <div className="text-center text-xs text-gray-400 py-2">
                            {t('blockedUserMessage')}
                          </div>
                        ) : (
                          <PageComposer active={!isBlocked} />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageCircle size={48} className="mb-4 opacity-50" />
                      {!session?.user ? (
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
                            {t('loginToMessage')}
                          </h3>
                          <a
                            href="/login"
                            className="inline-block mt-2 px-6 py-3 rounded-lg text-white font-semibold transition-all hover:scale-105"
                            style={{
                              background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                              boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)'
                            }}
                          >
                            {t('login')}
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
                            {t('selectConversation')}
                          </h3>
                          <p className="text-sm text-center max-w-md" style={{ color: 'var(--felora-silver-60)' }}>
                            {t('selectConversationDescription')}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>}
              {/* Mobile: Single View */}
              {isMobile && <div className="h-full min-h-0">
                  {activeConversation ? (
                    <div className="h-full min-h-0">
                      <E2EEThread
                        key={`mobile-thread-${activeConversation.id}`}
                        conversationId={activeConversation.id}
                        userId={session?.user?.id || ''}
                        partnerId={(activeConversation.participants.find((p:any)=> p.id!== (session?.user?.id||''))|| activeConversation.participants[0])?.id}
                        partnerName={(activeConversation.participants.find((p:any)=> p.id!== (session?.user?.id||''))|| activeConversation.participants[0])?.name}
                      />
                    </div>
                ) : (
                  <div className="h-full flex flex-col">
                    {!session?.user ? (
                      <div className="h-full flex flex-col items-center justify-center p-4 text-white/70">
                        <p className="mb-3" style={{ color: 'var(--felora-silver-70)' }}>
                          {t('loginToViewConversations')}
                        </p>
                        <a
                          href="/login"
                          className="px-6 py-3 rounded-lg text-white font-semibold transition-all hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                            boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)'
                          }}
                        >
                          {t('login')}
                        </a>
                      </div>
                    ) : (
                      <ConversationList
                        conversations={conversations}
                        activeConversation={activeConversation}
                        onSelectConversation={handleSelectConversation}
                        searchQuery={debouncedSearch}
                        loading={isLoading}
                        currentUserId={session?.user?.id}
                      />
                    )}
                  </div>
                )}
              </div>}
            </>
          </div>
        </div>
      </div>

      {/* Mobile composer fixé en bas */}
      {activeConversation && (
        <BodyPortal>
          <div
            className="lg:hidden fixed bottom-0 left-0 right-0 z-[9999] backdrop-blur border-t shadow-[0_-8px_16px_-8px_rgba(0,0,0,0.5)] pb-[calc(env(safe-area-inset-bottom)+8px)]"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              pointerEvents: 'auto'
            }}
          >
            <div className="max-w-7xl mx-auto px-2 sm:px-4 pt-2">
              {isBlocked && (
                <div className="mb-2 text-center text-xs" style={{ color: 'var(--felora-silver-70)' }}>
                  {t('blockedUserMessage')}
                </div>
              )}
              <PageComposer active={!isBlocked} />
            </div>
          </div>
        </BodyPortal>
      )}
      </div>

      {/* Report modal avec ReportModal unifié */}
      {otherParticipant && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportType="MESSAGE"
          targetType="conversation"
          targetId={activeConversation?.id || ''}
          targetName={otherParticipant.name}
        />
      )}

      {/* Modale Mode Éphémère */}
      <BodyPortal>
        {showEphemeralMenu && activeConversation && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowEphemeralMenu(false)} />
            <div
              className="relative w-[min(92vw,28rem)] rounded-xl border p-6 text-white"
              style={{
                background: 'rgba(15, 15, 25, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
              }}
            >
              <h3
                className="text-xl font-semibold mb-4 flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                <span>🔥</span> {t('ephemeralMessages')}
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                {t('ephemeralMessagesDescription')}
              </p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => { setEphemeralMode(false); setEphemeralDuration(0) }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${!ephemeralMode ? 'bg-white/10 border-2 border-pink-500' : 'bg-white/5 border border-white/10'}`}
                >
                  <div className="font-medium">{t('ephemeralDisabledOption')}</div>
                  <div className="text-xs text-gray-400">{t('ephemeralDisabledDescription')}</div>
                </button>

                <button
                  onClick={() => { setEphemeralMode(true); setEphemeralDuration(43200) }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${ephemeralMode && ephemeralDuration === 43200 ? 'bg-white/10 border-2 border-pink-500' : 'bg-white/5 border border-white/10'}`}
                >
                  <div className="font-medium">{t('ephemeral12Hours')}</div>
                  <div className="text-xs text-gray-400">{t('ephemeral12HoursDescription')}</div>
                </button>

                <button
                  onClick={() => { setEphemeralMode(true); setEphemeralDuration(86400) }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${ephemeralMode && ephemeralDuration === 86400 ? 'bg-white/10 border-2 border-pink-500' : 'bg-white/5 border border-white/10'}`}
                >
                  <div className="font-medium">{t('ephemeral24Hours')}</div>
                  <div className="text-xs text-gray-400">{t('ephemeral24HoursDescription')}</div>
                </button>

                <button
                  onClick={() => { setEphemeralMode(true); setEphemeralDuration(172800) }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${ephemeralMode && ephemeralDuration === 172800 ? 'bg-white/10 border-2 border-pink-500' : 'bg-white/5 border border-white/10'}`}
                >
                  <div className="font-medium">{t('ephemeral48Hours')}</div>
                  <div className="text-xs text-gray-400">{t('ephemeral48HoursDescription')}</div>
                </button>

                <button
                  onClick={() => { setEphemeralMode(true); setEphemeralDuration(604800) }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${ephemeralMode && ephemeralDuration === 604800 ? 'bg-white/10 border-2 border-pink-500' : 'bg-white/5 border border-white/10'}`}
                >
                  <div className="font-medium">{t('ephemeral7Days')}</div>
                  <div className="text-xs text-gray-400">{t('ephemeral7DaysDescription')}</div>
                </button>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEphemeralMenu(false)}
                  className="px-6 py-2 rounded-lg transition-colors bg-white/10 text-white/90 hover:bg-white/20"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/e2ee/conversations/update-ephemeral', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          conversationId: activeConversation.id,
                          ephemeralMode,
                          ephemeralDuration
                        })
                      })

                      if (!res.ok) throw new Error('update_failed')

                      // Animation de succès avant de fermer
                      const btn = document.activeElement as HTMLButtonElement
                      if (btn) {
                        btn.textContent = t('saved')
                        btn.style.background = 'linear-gradient(to right, #10b981, #059669)'
                        setTimeout(() => {
                          setShowEphemeralMenu(false)
                          toastSuccess(ephemeralMode ? t('ephemeralModeActivated', { hours: ephemeralDuration / 3600 }) : t('ephemeralModeDeactivated'))
                        }, 500)
                      } else {
                        setShowEphemeralMenu(false)
                        toastSuccess(ephemeralMode ? t('ephemeralModeActivated', { hours: ephemeralDuration / 3600 }) : t('ephemeralModeDeactivated'))
                      }
                    } catch {
                      toastError(t('settingsUpdateError'))
                    }
                  }}
                  className="px-6 py-2 rounded-lg transition-all bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-105"
                >
                  {t('apply')}
                </button>
              </div>
            </div>
          </div>
        )}
      </BodyPortal>
    </>
  )
}

// Lightweight page-level composer that proxies to ChatWindow via window.__feloraChatSend
function PageComposer({ active }: { active: boolean }) {
  const t = useTranslations('messages')
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  
  const onSend = (file?: File | Blob, options?: { viewMode?: 'once' | 'unlimited', downloadable?: boolean }) => {
    if (!active) return
    // @ts-ignore
    if (typeof window !== 'undefined' && window.__feloraChatSend) {
      // @ts-ignore
      window.__feloraChatSend({ text, file, mediaOptions: options })
      setText('')
      setShowEmoji(false)
      setPreviewFile(null)
      setShowVoiceRecorder(false)
      
      // Arrêter l'indicateur de frappe
      // @ts-ignore
      if (typeof window !== 'undefined' && window.__feloraChatStopTyping) {
        // @ts-ignore
        window.__feloraChatStopTyping()
      }
    }
  }

  const handleFileSelect = async (file: File) => {
    // Vérifier la taille du fichier
    if (file.size > MESSAGING_CONSTANTS.MAX_FILE_SIZE) {
      alert(t('fileTooLarge', { maxSize: MESSAGING_CONSTANTS.MAX_FILE_SIZE / (1024 * 1024) }))
      return
    }

    // Vérifier le type de fichier
    const isSupported =
      MEDIA_CONSTANTS.SUPPORTED_IMAGE_TYPES.includes(file.type as any) ||
      MEDIA_CONSTANTS.SUPPORTED_VIDEO_TYPES.includes(file.type as any) ||
      MEDIA_CONSTANTS.SUPPORTED_AUDIO_TYPES.includes(file.type as any)

    if (!isSupported) {
      alert(t('unsupportedFileType'))
      return
    }

    try {
      // Compresser l'image si c'est une image
      if (MEDIA_CONSTANTS.SUPPORTED_IMAGE_TYPES.includes(file.type as any)) {
        const compressionResult = await compressImageIfNeeded(file)
        setPreviewFile(compressionResult.file)
      } else {
        setPreviewFile(file)
      }
    } catch (error) {
      console.error('Erreur lors de la compression:', error)
      setPreviewFile(file) // Utiliser le fichier original en cas d'erreur
    }
  }
  return (
    <div className="relative w-full">
      <div className="flex items-start gap-2 w-full">
        {/* Input optimisé pour footer mobile */}
        <div className={`flex items-end gap-1 sm:gap-2 flex-1 min-w-0 rounded-lg sm:rounded-xl bg-white/10 px-2 sm:px-3 py-2 ${!active ? 'opacity-50' : ''}`}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={active ? t('writeMessage') : t('selectConversation')}
            disabled={!active}
            rows={1}
            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-white placeholder-gray-400 resize-none text-sm sm:text-base"
            style={{
              minHeight: '32px',
              maxHeight: '96px'
            }}
            onInput={(e) => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 96) + 'px'

              // Déclencher l'indicateur de frappe
              // @ts-ignore
              if (typeof window !== 'undefined' && window.__feloraChatStartTyping) {
                // @ts-ignore
                window.__feloraChatStartTyping()
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSend()
              }
            }}
          />

          {/* Boutons d'action optimisés pour footer - Moins d'espace */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <button
              onClick={() => setShowEmoji(v => !v)}
              className="p-1.5 sm:p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              aria-label={t('emoji')}
              disabled={!active}
            >
              <Smile size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button
              onClick={() => setShowVoiceRecorder(true)}
              className="p-1.5 sm:p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              aria-label={t('voiceMessage')}
              disabled={!active}
            >
              <Mic size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button
              onClick={() => mediaInputRef.current?.click()}
              className="p-1.5 sm:p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              aria-label={t('imageVideo')}
              disabled={!active}
            >
              <ImageIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              aria-label={t('attachment')}
              disabled={!active}
            >
              <Paperclip size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </div>

        {/* Bouton d'envoi optimisé - Plus compact sur mobile */}
        <button
          onClick={() => onSend()}
          disabled={!active || !text.trim()}
          className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 flex-shrink-0 ${
            (!active || !text.trim())
              ? 'bg-white/10 text-white/40 cursor-not-allowed'
              : 'bg-pink-500 text-white hover:bg-pink-600 hover:scale-105'
          }`}
          aria-label={t('send')}
        >
          <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={e => {
        const file = e.target.files?.[0]
        if (!file || !active) return
        handleFileSelect(file)
        e.currentTarget.value = ''
      }} />
      <input ref={mediaInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => {
        const file = e.target.files?.[0]
        if (!file || !active) return
        handleFileSelect(file)
        e.currentTarget.value = ''
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

      {/* Attachment Preview */}
      <AnimatePresence>
        {previewFile && (
          <AttachmentPreview
            file={previewFile}
            onRemove={() => setPreviewFile(null)}
            onSend={onSend}
            onCancel={() => setPreviewFile(null)}
          />
        )}
      </AnimatePresence>

      {/* Voice Recorder */}
      <AnimatePresence>
        {showVoiceRecorder && (
          <VoiceRecorder
            onSend={onSend}
            onCancel={() => setShowVoiceRecorder(false)}
          />
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