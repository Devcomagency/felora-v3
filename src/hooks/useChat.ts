'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
// import { useSession } from 'next-auth/react' // Désactivé temporairement
import { chatService } from '../services/chatService'
import { chatServiceMock } from '../services/chatServiceMock'
import type { 
  Conversation,
  Message,
  SendMessageRequest,
  UseChatOptions,
  UseChatReturn,
  TypingIndicator,
  MessageType
} from '../types/chat'

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const forceMock = process.env.NEXT_PUBLIC_CHAT_FORCE_MOCK === 'true'
  // const { data: session } = useSession() // Désactivé temporairement
  const session = { user: { id: 'mock_user_id' } } // Mock session
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator[]>>(new Map())
  
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 1000
  } = options

  // Refs pour éviter les re-renders
  const conversationsRef = useRef(conversations)
  const messagesRef = useRef(messages)
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Sync refs
  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // Setup WebSocket connection
  useEffect(() => {
    if (!session?.user?.id || !autoConnect) return

    chatService.setUserId(session.user.id)
    // Aligner aussi le mock sur l'utilisateur courant (fallback éventuel)
    chatServiceMock.setUserId(session.user.id)
    
    const connect = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        if (forceMock) {
          await chatServiceMock.connect()
        } else {
          await chatService.connect()
        }
        setIsConnected(true)
        
        // Charger les conversations initiales
        await loadConversations()
        
      } catch (error) {
        console.error('Erreur connexion chat:', error)
        setError('Impossible de se connecter au chat')
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    connect()

    // Event listeners
    const handleMessage = (message: Message) => {
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id)
        if (exists) return prev
        return [...prev, message].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      })

      // Mettre à jour la dernière message dans les conversations
      setConversations(prev => prev.map(conv => 
        conv.id === message.conversationId
          ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
          : conv
      ))
    }

    const handleTypingStart = (typing: TypingIndicator) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev)
        const existing = newMap.get(typing.conversationId) || []
        const filtered = existing.filter(t => t.userId !== typing.userId)
        newMap.set(typing.conversationId, [...filtered, typing])
        return newMap
      })

      // Auto-stop après 5 secondes
      const timeoutKey = `${typing.conversationId}-${typing.userId}`
      const existingTimeout = typingTimeouts.current.get(timeoutKey)
      if (existingTimeout) clearTimeout(existingTimeout)
      
      const newTimeout = setTimeout(() => {
        handleTypingStop({ conversationId: typing.conversationId, userId: typing.userId })
      }, 5000)
      
      typingTimeouts.current.set(timeoutKey, newTimeout)
    }

    const handleTypingStop = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev)
        const existing = newMap.get(conversationId) || []
        const filtered = existing.filter(t => t.userId !== userId)
        
        if (filtered.length === 0) {
          newMap.delete(conversationId)
        } else {
          newMap.set(conversationId, filtered)
        }
        
        return newMap
      })

      // Clear timeout
      const timeoutKey = `${conversationId}-${userId}`
      const existingTimeout = typingTimeouts.current.get(timeoutKey)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
        typingTimeouts.current.delete(timeoutKey)
      }
    }

    const handleConnected = () => {
      setIsConnected(true)
      setError(null)
    }

    const handleDisconnected = () => {
      setIsConnected(false)
    }

    const handleError = ({ error }: { error: any }) => {
      setError('Erreur de connexion')
      setIsConnected(false)
    }

    const handleMessageDelivered = ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'delivered' } : msg
      ))
    }

    const handleMessageRead = ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ))
    }

    // Register event listeners
    const bus = forceMock ? chatServiceMock : chatService
    bus.on('message', handleMessage)
    bus.on('typing_start', handleTypingStart)
    bus.on('typing_stop', handleTypingStop)
    bus.on('connected', handleConnected)
    bus.on('disconnected', handleDisconnected)
    bus.on('error', handleError)
    bus.on('message_delivered', handleMessageDelivered)
    bus.on('message_read', handleMessageRead)

    // Cleanup
    return () => {
      bus.off('message', handleMessage)
      bus.off('typing_start', handleTypingStart)
      bus.off('typing_stop', handleTypingStop)
      bus.off('connected', handleConnected)
      bus.off('disconnected', handleDisconnected)
      bus.off('error', handleError)
      bus.off('message_delivered', handleMessageDelivered)
      bus.off('message_read', handleMessageRead)
      
      if (forceMock) chatServiceMock.disconnect(); else chatService.disconnect()
      
      // Clear all timeouts
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout))
      typingTimeouts.current.clear()
    }
  }, [session?.user?.id, autoConnect])

  // Load conversations
  const loadConversations = useCallback(async (cursor?: string) => {
    try {
      setIsLoading(true)
      const response = forceMock ? await chatServiceMock.getConversations(cursor) : await chatService.getConversations(cursor)
      if (cursor) {
        setConversations(prev => [...prev, ...response.conversations])
      } else {
        setConversations(response.conversations)
      }
      setError(null)
    } catch (error) {
      console.error('Erreur chargement conversations (temps réel):', error)
      // Fallback mock
      try {
        const mockResp = await chatServiceMock.getConversations(cursor)
        if (cursor) {
          setConversations(prev => [...prev, ...mockResp.conversations])
        } else {
          setConversations(mockResp.conversations)
        }
        setError(null)
      } catch (mockErr) {
        console.error('Erreur chargement conversations (mock):', mockErr)
        setError('Impossible de charger les conversations')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load messages for active conversation
  const loadMessages = useCallback(async (conversationId: string, cursor?: string) => {
    try {
      setIsLoading(true)
      const response = forceMock ? await chatServiceMock.getMessages(conversationId, cursor) : await chatService.getMessages(conversationId, cursor)
      if (cursor) {
        setMessages(prev => [...response.messages, ...prev])
      } else {
        setMessages(response.messages)
      }
      setError(null)
    } catch (error) {
      console.error('Erreur chargement messages (temps réel):', error)
      // Fallback mock
      try {
        const mockResp = await chatServiceMock.getMessages(conversationId, cursor)
        if (cursor) {
          setMessages(prev => [...mockResp.messages, ...prev])
        } else {
          setMessages(mockResp.messages)
        }
        setError(null)
      } catch (mockErr) {
        console.error('Erreur chargement messages (mock):', mockErr)
        setError('Impossible de charger les messages')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Set active conversation
  const handleSetActiveConversation = useCallback(async (conversation: Conversation | null) => {
    setActiveConversation(conversation)
    
    if (conversation) {
      await loadMessages(conversation.id)
      
      // Marquer comme lu
      if (conversation.unreadCount > 0) {
        await markAsRead(conversation.id)
      }
    } else {
      setMessages([])
    }
  }, [loadMessages])

  // Send message
  const sendMessage = useCallback(async (request: SendMessageRequest) => {
    try {
      // Créer un message temporaire avec statut "sending"
      const tempMessage: Message = {
        id: `temp_${Date.now()}`,
        conversationId: request.conversationId || activeConversation?.id || '',
        senderId: session?.user?.id || '',
        receiverId: request.receiverId,
        type: request.type,
        content: request.content,
        metadata: request.metadata,
        status: 'sending',
        createdAt: new Date(),
        updatedAt: new Date(),
        replyTo: request.replyTo,
      }

      // Ajouter le message temporaire à la UI
      setMessages(prev => [...prev, tempMessage])

      // Envoyer via le service temps réel
      const response = forceMock ? await chatServiceMock.sendMessage(request) : await chatService.sendMessage(request)
      
      // Remplacer le message temporaire par le message réel
      setMessages(prev => prev.map(msg => msg.id === tempMessage.id ? response.message : msg))

      // Mettre à jour la conversation
      if (response.conversation) {
        setConversations(prev => {
          const exists = prev.find(c => c.id === response.conversation.id)
          if (exists) return prev.map(c => c.id === response.conversation.id ? response.conversation : c)
          return [response.conversation, ...prev]
        })
      }

    } catch (error) {
      console.error('Erreur envoi message (temps réel), tentative mock:', error)
      try {
        const response = await chatServiceMock.sendMessage(request)
        // Remplacer le temp par le message mock
        setMessages(prev => prev.map(msg => msg.id === `temp_${tempMessage.createdAt.getTime()}` ? response.message : (msg.id === tempMessage.id ? response.message : msg)))
        setMessages(prev => prev.map(msg => msg.id === tempMessage.id ? response.message : msg))
        // Mettre à jour/consolider la conversation
        if (response.conversation) {
          setConversations(prev => {
            const exists = prev.find(c => c.id === response.conversation.id)
            if (exists) return prev.map(c => c.id === response.conversation.id ? response.conversation : c)
            return [response.conversation, ...prev]
          })
        }
        setError(null)
      } catch (fallbackErr) {
        console.error('Erreur envoi message (mock):', fallbackErr)
        setError('Impossible d\'envoyer le message')
        // Marquer le message comme failed si fallback échoue
        setMessages(prev => prev.map(msg => (msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg)))
      }
    }
  }, [session?.user?.id, activeConversation])

  // Edit message
  const editMessage = useCallback(async (messageId: string, content: string) => {
    try {
      const updatedMessage = forceMock ? await chatServiceMock.editMessage(messageId, content) : await chatService.editMessage(messageId, content)
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? updatedMessage : msg)
      )
    } catch (error) {
      console.error('Erreur modification message:', error)
      setError('Impossible de modifier le message')
    }
  }, [])

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      if (forceMock) await chatServiceMock.deleteMessage(messageId); else await chatService.deleteMessage(messageId)
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
    } catch (error) {
      console.error('Erreur suppression message:', error)
      setError('Impossible de supprimer le message')
    }
  }, [])

  // Mark as read
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      if (forceMock) await chatServiceMock.markAsRead(conversationId); else await chatService.markAsRead(conversationId)
      setConversations(prev => prev.map(conv => conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv))
    } catch (error) {
      console.error('Erreur marquage lu (temps réel):', error)
      try {
        await chatServiceMock.markAsRead(conversationId)
        setConversations(prev => prev.map(conv => conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv))
      } catch (mockErr) {
        console.error('Erreur marquage lu (mock):', mockErr)
      }
    }
  }, [])

  // Block user
  const blockUser = useCallback(async (userId: string) => {
    try {
      if (forceMock) await chatServiceMock.blockUser(userId); else await chatService.blockUser(userId)
      // Refresh conversations
      await loadConversations()
    } catch (error) {
      console.error('Erreur blocage utilisateur:', error)
      setError('Impossible de bloquer cet utilisateur')
    }
  }, [loadConversations])

  // Archive conversation
  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      if (forceMock) await chatServiceMock.archiveConversation(conversationId); else await chatService.archiveConversation(conversationId)
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    } catch (error) {
      console.error('Erreur archivage conversation:', error)
      setError('Impossible d\'archiver cette conversation')
    }
  }, [])

  // Typing indicators
  const startTyping = useCallback((conversationId: string) => {
    if (forceMock) chatServiceMock.sendTypingStart(conversationId); else chatService.sendTypingStart(conversationId)
  }, [])

  const stopTyping = useCallback((conversationId: string) => {
    if (forceMock) chatServiceMock.sendTypingStop(conversationId); else chatService.sendTypingStop(conversationId)
  }, [])

  // Upload media
  const uploadMedia = useCallback(async (file: File, type: MessageType): Promise<string> => {
    try {
      const url = forceMock ? await chatServiceMock.uploadMedia(file, activeConversation?.id) : await chatService.uploadMedia(file, activeConversation?.id)
      return url
    } catch (error) {
      console.error('Erreur upload média (temps réel), tentative mock:', error)
      // Fallback mock
      const url = await chatServiceMock.uploadMedia(file, activeConversation?.id)
      return url
    }
  }, [activeConversation])

  return {
    conversations,
    activeConversation,
    messages,
    isConnected,
    isLoading,
    error,
    
    // Actions
    setActiveConversation: handleSetActiveConversation,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    blockUser,
    archiveConversation,
    
    // Real-time
    startTyping,
    stopTyping,
    
    // Media
    uploadMedia,
    
    // Additional data
    typingUsers: typingUsers.get(activeConversation?.id || '') || [],
    
    // Utility methods
    loadConversations,
    loadMessages,
  } as UseChatReturn & {
    typingUsers: TypingIndicator[]
    loadConversations: (cursor?: string) => Promise<void>
    loadMessages: (conversationId: string, cursor?: string) => Promise<void>
  }
}
