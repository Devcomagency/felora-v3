'use client'

import { useMemo, useState } from 'react'
import { Search, Pin, Archive, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import type { Conversation } from '../../types/chat'

interface ConversationListProps {
  conversations: Conversation[]
  activeConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
  onSearch?: (query: string) => void
  searchQuery?: string
  onArchive?: (conversationId: string) => void
  onPin?: (conversationId: string) => void
  className?: string
  loading?: boolean
}

export default function ConversationList({
  conversations,
  activeConversation,
  onSelectConversation,
  onSearch,
  searchQuery = '',
  onArchive,
  onPin,
  className = '',
  loading = false
}: ConversationListProps) {
  const [showActions, setShowActions] = useState<string | null>(null)

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter(conv => {
      if ((searchQuery || '').trim() === '') return true
      
      const query = searchQuery.toLowerCase()
      const participants = conv.participants.map(p => p.name.toLowerCase()).join(' ')
      const lastMessage = conv.lastMessage?.content?.toLowerCase() || ''
      
      return participants.includes(query) || lastMessage.includes(query)
    })

    // Sort: pinned first, then by last message time
    return filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1
      }
      
      const aTime = a.lastMessage?.createdAt || a.updatedAt
      const bTime = b.lastMessage?.createdAt || b.updatedAt
      
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
  }, [conversations, searchQuery])

  // Search handled by parent via searchQuery prop (no local input here)

  const formatLastMessageTime = (date: Date) => {
    const now = new Date()
    const messageDate = date instanceof Date ? date : new Date(date)
    
    // Vérifier que la date est valide
    if (isNaN(messageDate.getTime())) {
      return 'Maintenant'
    }
    
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return format(messageDate, 'HH:mm', { locale: fr })
    } else if (diffInHours < 48) {
      return 'Hier'
    } else if (diffInHours < 168) {
      return format(messageDate, 'EEEE', { locale: fr })
    } else {
      return format(messageDate, 'dd/MM', { locale: fr })
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    // TODO: Get current user ID and filter properly
    return conversation.participants[0] // Simplified for now
  }

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  return (
    <div className={`flex flex-col h-full bg-gray-800/30 border-r border-gray-700/50 ${className}`}>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {/* Skeletons */}
        {loading && filteredConversations.length === 0 && (
          <div className="p-3 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/2 bg-white/10 rounded" />
                  <div className="h-3 w-3/4 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}
        <AnimatePresence>
          {filteredConversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation)
            const isActive = activeConversation?.id === conversation.id
            const isUnread = (conversation as any).unreadCount > 0
            
            return (
              <motion.div
                key={conversation.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`relative flex items-center p-4 cursor-pointer transition-colors hover:bg-gray-700/30 ${
                  isActive ? 'bg-purple-500/10 border-r-2 border-purple-500' : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
                onMouseEnter={() => setShowActions(conversation.id)}
                onMouseLeave={() => setShowActions(null)}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {otherParticipant.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Online status removed by request */}
                  
                  {/* Pinned indicator */}
                  {conversation.isPinned && (
                    <div className="absolute -top-1 -left-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Pin size={8} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 ml-3 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className={`truncate ${isUnread ? 'text-white font-semibold' : 'text-white font-medium'}`}>{otherParticipant.name}</h3>
                      {otherParticipant.isVerified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        {conversation.lastMessage && formatLastMessageTime(conversation.lastMessage.createdAt)}
                      </span>
                      {isUnread && (
                        <div className="w-2.5 h-2.5 bg-pink-500 rounded-full" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-sm truncate flex-1 ${isUnread ? 'text-white' : 'text-gray-400'}`}>
                      {conversation.lastMessage ? (
                        <>
                          {conversation.lastMessage.type === 'text' && conversation.lastMessage.content}
                          {conversation.lastMessage.type === 'image' && '📷 Image'}
                          {conversation.lastMessage.type === 'video' && '🎥 Vidéo'}
                          {conversation.lastMessage.type === 'file' && '📎 Fichier'}
                          {conversation.lastMessage.type === 'voice' && '🎵 Message vocal'}
                          {conversation.lastMessage.type === 'payment_request' && '💎 Demande de paiement'}
                          {conversation.lastMessage.type === 'media_request' && '📸 Demande de média'}
                        </>
                      ) : (
                        'Nouvelle conversation'
                      )}
                    </p>
                    
                    {conversation.isMuted && (
                      <div className="ml-2 text-gray-500">
                        🔇
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <AnimatePresence>
                  {showActions === conversation.id && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="absolute right-2 top-2"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Show dropdown menu
                        }}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Empty state */}
        {!loading && filteredConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Search size={48} className="mb-4 opacity-50" />
            <p className="text-center">
              {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
            </p>
            {searchQuery && (
              <button
                onClick={() => onSearch?.('')}
                className="mt-2 text-purple-400 hover:text-purple-300 text-sm"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="p-4 border-t border-gray-700/50 bg-gray-800/20">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{conversations.length} conversation{conversations.length > 1 ? 's' : ''}</span>
          <span>
            {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} non lu{
              conversations.reduce((sum, conv) => sum + conv.unreadCount, 0) > 1 ? 's' : ''
            }
          </span>
        </div>
      </div>
    </div>
  )
}
