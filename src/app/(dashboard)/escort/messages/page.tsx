'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'
import ConversationList from '../../../../components/chat/ConversationList'
import ChatWindow from '../../../../components/chat/ChatWindow'
import { MessageCircle } from 'lucide-react'
import { chatServiceMock } from '../../../../services/chatServiceMock'
import type { Conversation, Message } from '../../../../types/chat'

export default function EscortMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize chat service
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true)
        
        // Connect to chat service (mock)
        await chatServiceMock.connect()
        setIsConnected(true)
        
        // Load conversations
        const response = await chatServiceMock.getConversations()
        setConversations(response.conversations)
        
      } catch (error) {
        console.error('Erreur initialisation chat:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeChat()

    // Event listeners
    const handleMessage = (message: Message) => {
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id)
        if (exists) return prev
        return [...prev, message].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      })

      // Update conversation
      setConversations(prev => prev.map(conv => 
        conv.id === message.conversationId
          ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
          : conv
      ))
    }

    const handleConnected = () => setIsConnected(true)
    const handleDisconnected = () => setIsConnected(false)

    chatServiceMock.on('message', handleMessage)
    chatServiceMock.on('connected', handleConnected)
    chatServiceMock.on('disconnected', handleDisconnected)

    return () => {
      chatServiceMock.off('message', handleMessage)
      chatServiceMock.off('connected', handleConnected)
      chatServiceMock.off('disconnected', handleDisconnected)
      chatServiceMock.disconnect()
    }
  }, [])

  // Load messages for active conversation
  const handleSelectConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation)
    
    try {
      const response = await chatServiceMock.getMessages(conversation.id)
      setMessages(response.messages)
      
      // Mark as read
      if (conversation.unreadCount > 0) {
        await chatServiceMock.markAsRead(conversation.id)
        setConversations(prev => prev.map(conv => 
          conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
        ))
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error)
    }
  }


  if (isLoading) {
    return (
      <DashboardLayout title="Messagerie" subtitle="Communiquez avec vos clients en temps réel">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white">Chargement du chat...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title="Messagerie" 
      subtitle="Communiquez avec vos clients en temps réel"
    >
      {/* Header simple — statut en ligne retiré */}
      <div className="mb-4" />

      {/* Interface Mobile-First */}
      <div className="h-[calc(100vh-180px)] lg:h-[600px] bg-gray-900/50 border border-gray-700/50 rounded-2xl overflow-hidden">
        
        {/* Desktop: Split View */}
        <div className="hidden lg:flex h-full">
          <div className="w-1/3 border-r border-gray-700/50">
            <ConversationList
              conversations={conversations}
              activeConversation={activeConversation}
              onSelectConversation={handleSelectConversation}
            />
          </div>
          <div className="flex-1">
            {activeConversation ? (
              <ChatWindow
                conversation={activeConversation}
                showHeader={true}
                showActions={true}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle size={48} className="mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Sélectionnez une conversation</h3>
                <p className="text-sm text-center max-w-md">
                  Choisissez une conversation pour commencer à échanger.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Single View */}
        <div className="lg:hidden h-full">
          {activeConversation ? (
            <div className="h-full">
              <ChatWindow
                conversation={activeConversation}
                showHeader={true}
                showActions={true}
              />
            </div>
          ) : (
            <div className="h-full">
              <ConversationList
                conversations={conversations}
                activeConversation={activeConversation}
                onSelectConversation={handleSelectConversation}
              />
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}
