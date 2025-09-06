'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Image as ImageIcon,
  X,
  MessageCircle,
  ArrowLeft
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Conversation, Message, MessageType, TypingIndicator } from '../../types/chat'
import { useChat } from '../../hooks/useChat'
import EmojiPicker from './EmojiPicker'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import MediaPreview from './MediaPreview'

interface ChatWindowProps {
  conversation: Conversation | null
  onClose?: () => void
  showHeader?: boolean
  showActions?: boolean
  className?: string
  externalComposer?: boolean // When true, hide internal composer and expose window API
}

export default function ChatWindow({ 
  conversation, 
  onClose, 
  showHeader = true,
  showActions = true,
  className = '',
  externalComposer = false
}: ChatWindowProps) {
  const {
    messages,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    uploadMedia,
    typingUsers,
    setActiveConversation,
    blockUser,
    archiveConversation
  } = useChat()

  // Sync internal chat state with selected conversation from parent
  useEffect(() => {
    if (conversation) {
      setActiveConversation(conversation)
    }
  }, [conversation, setActiveConversation])

  // Empty state (especially useful for mobile views when no conversation selected)
  if (!conversation) {
    return (
      <div className={`flex h-full items-center justify-center bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl ${className}`}>
        <div className="text-center text-gray-400 lg:hidden">
          <MessageCircle size={48} className="mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-medium mb-1">Aucune conversation sélectionnée</h3>
          <p className="text-sm opacity-80">Choisissez une discussion dans la liste</p>
        </div>
        {/* On desktop, ce composant n'est normalement pas rendu sans conversation */}
      </div>
    )
  }

  const [messageInput, setMessageInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null)
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const [showMenu, setShowMenu] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Typing indicator logic
  const handleInputChange = (value: string) => {
    setMessageInput(value)

    // Start typing indicator
    startTyping(conversation.id)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversation.id)
    }, 2000)
  }

  const handleSendMessage = async () => {
    const content = messageInput.trim()
    if (!content && !selectedMedia) return

    try {
      if (selectedMedia) {
        // Upload media first
        const mediaUrl = await uploadMedia(selectedMedia, getMediaType(selectedMedia))
        
        await sendMessage({
          conversationId: conversation.id,
          type: getMediaType(selectedMedia),
          content: content || '',
          metadata: {
            mediaUrl,
            fileName: selectedMedia.name,
            fileSize: selectedMedia.size,
            fileType: selectedMedia.type
          }
        })
        
        setSelectedMedia(null)
        setMediaPreviews([])
      } else {
        await sendMessage({
          conversationId: conversation.id,
          type: 'text',
          content
        })
      }

      setMessageInput('')
      stopTyping(conversation.id)
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

    } catch (error) {
      console.error('Erreur envoi message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    setSelectedMedia(file)
    
    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setMediaPreviews([e.target.result as string])
        }
      }
      reader.readAsDataURL(file)
    } else {
      setMediaPreviews([])
    }
  }

  const getMediaType = (file: File): MessageType => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'voice'
    return 'file'
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  // Expose a small bridge for external page-level composer
  useEffect(() => {
    if (!externalComposer) return
    // @ts-ignore
    window.__feloraChatSend = async ({ text, file }: { text?: string; file?: File }) => {
      if (typeof text === 'string') {
        setMessageInput(text)
      }
      if (file) {
        setSelectedMedia(file)
        setMediaPreviews([])
      }
      // Defer to ensure state is set
      setTimeout(() => { handleSendMessage() }, 0)
    }
    return () => {
      // @ts-ignore
      if (window.__feloraChatSend) delete window.__feloraChatSend
    }
  }, [externalComposer, handleSendMessage])

  // Get the other participant (not the current user)
  // Show the non-escort participant by default (fallback to first)
  const otherParticipant = conversation.participants.find(p => (p as any).role !== 'escort') || conversation.participants[0]
  
  const rowsClass = externalComposer
    ? (showHeader ? 'grid-rows-[auto,1fr]' : 'grid-rows-[1fr]')
    : (showHeader ? 'grid-rows-[auto,1fr,auto]' : 'grid-rows-[1fr,auto]')

  return (
    <div className={`grid ${rowsClass} h-full min-h-0 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700/50 bg-gray-800/30 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                aria-label="Revenir en arrière"
                title="Revenir"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {otherParticipant?.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h3 className="text-white font-medium leading-tight">{otherParticipant?.name}</h3>
              <div className="text-xs text-white/50">Conversation chiffrée</div>
            </div>
          </div>

          {showActions && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(v => !v)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                aria-haspopup="menu"
                aria-expanded={showMenu}
                aria-label="Plus d'actions"
                title="Plus d'actions"
              >
                <MoreVertical size={18} />
              </button>
              {showMenu && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 bg-gray-900/95 backdrop-blur-sm shadow-lg overflow-hidden z-20"
                >
                  <button
                    role="menuitem"
                    className="w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                    onClick={() => { setShowMenu(false); /* TODO: open profile */ }}
                  >Voir le profil</button>
                  <button
                    role="menuitem"
                    className="w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                    onClick={() => { setShowMenu(false); archiveConversation(conversation.id).catch(()=>{}) }}
                  >Archiver la conversation</button>
                  <button
                    role="menuitem"
                    className="w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                    onClick={() => { setShowMenu(false); blockUser((otherParticipant as any)?.id || '') .catch(()=>{}) }}
                  >Bloquer l'utilisateur</button>
                  <button
                    role="menuitem"
                    className="w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                    onClick={() => { setShowMenu(false); /* TODO: signal */ }}
                  >Signaler</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TypingIndicator users={typingUsers} />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Media Preview */}
      {selectedMedia && (
        <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
          <MediaPreview
            file={selectedMedia}
            preview={mediaPreviews[0]}
            onRemove={() => {
              setSelectedMedia(null)
              setMediaPreviews([])
            }}
          />
        </div>
      )}

      {/* Input Area (hidden when external composer is used) */}
      {!externalComposer && (
        <div className="p-4 border-t border-gray-700/50 bg-gray-800/60 backdrop-blur supports-[backdrop-filter]:bg-gray-800/40">
          <div className="flex items-end space-x-3">
            {/* File Attachments */}
            <div className="flex space-x-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Joindre un fichier"
              >
                <Paperclip size={18} />
              </button>
              
              <button
                onClick={() => mediaInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Ajouter une image/vidéo"
              >
                <ImageIcon size={18} />
              </button>
            </div>

            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={messageInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                rows={1}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <Smile size={18} />
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() && !selectedMedia}
                className={`p-2 rounded-lg transition-all ${
                  messageInput.trim() || selectedMedia
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transform hover:scale-105'
                    : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Emoji Picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-16 right-4 z-50"
              >
                <EmojiPicker
                  onSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple={false}
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      )}
    </div>
  )
}
