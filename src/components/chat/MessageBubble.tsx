'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Check, CheckCheck, Clock, AlertCircle, Edit, Trash2, Reply } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Message } from '../../types/chat'

interface MessageBubbleProps {
  message: Message
  showAvatar?: boolean
  showTimestamp?: boolean
  onEdit?: (messageId: string, content: string) => void
  onDelete?: (messageId: string) => void
  onReply?: (message: Message) => void
}

export default function MessageBubble({ 
  message, 
  showAvatar = true,
  showTimestamp = true,
  onEdit,
  onDelete,
  onReply
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  
  // TODO: Get current user ID from context/session
  const currentUserId = 'current-user-id'
  const isOwnMessage = message.senderId === currentUserId
  
  const handleSaveEdit = () => {
    if (editContent.trim() !== message.content && onEdit) {
      onEdit(message.id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    setIsEditing(false)
  }

  const formatTimestamp = (date: Date) => {
    return format(new Date(date), 'HH:mm', { locale: fr })
  }

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock size={12} className="text-gray-400 animate-pulse" />
      case 'sent':
        return <Check size={12} className="text-gray-400" />
      case 'delivered':
        return <CheckCheck size={12} className="text-gray-400" />
      case 'read':
        return <CheckCheck size={12} className="text-purple-400" />
      case 'failed':
        return <AlertCircle size={12} className="text-red-400" />
      default:
        return null
    }
  }

  const renderMessageContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm resize-none"
            rows={2}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSaveEdit()
              }
              if (e.key === 'Escape') {
                handleCancelEdit()
              }
            }}
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEdit}
              className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
            >
              Sauver
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        </div>
      )
    }

    switch (message.type) {
      case 'text':
        return (
          <div className="space-y-1">
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            {message.editedAt && (
              <p className="text-xs opacity-60 italic">(modifié)</p>
            )}
          </div>
        )
      
      case 'image':
        return (
          <div className="space-y-2">
            {message.metadata?.mediaUrl && (
              <img
                src={message.metadata.mediaUrl}
                alt="Image partagée"
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {/* TODO: Open lightbox */}}
              />
            )}
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        )
      
      case 'video':
        return (
          <div className="space-y-2">
            {message.metadata?.mediaUrl && (
              <video
                src={message.metadata.mediaUrl}
                poster={message.metadata?.thumbnailUrl}
                controls
                className="max-w-xs rounded-lg"
              />
            )}
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        )
      
      case 'file':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded border">
              <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                <span className="text-xs text-white font-bold">
                  {message.metadata?.fileType?.split('/')[1]?.slice(0, 3).toUpperCase() || 'FILE'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{message.metadata?.fileName}</p>
                <p className="text-xs text-gray-400">
                  {message.metadata?.fileSize && (
                    `${(message.metadata.fileSize / 1024 / 1024).toFixed(1)} MB`
                  )}
                </p>
              </div>
            </div>
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        )
      
      case 'payment_request':
        return (
          <div className="space-y-2">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-500">💎</span>
                <span className="text-sm font-medium text-yellow-400">
                  Demande de paiement: {message.metadata?.paymentAmount}♦
                </span>
              </div>
            </div>
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        )
      
      case 'media_request':
        return (
          <div className="space-y-2">
            <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-pink-500">📸</span>
                <span className="text-sm font-medium text-pink-400">
                  Demande de média personnalisé: {message.metadata?.mediaPrice}♦
                </span>
              </div>
            </div>
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        )
      
      case 'system':
        return (
          <div className="text-center text-xs text-gray-400 italic">
            {message.content}
          </div>
        )
      
      default:
        return <p className="text-sm">{message.content}</p>
    }
  }

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <div className="px-3 py-1 bg-gray-800/50 rounded-full">
          {renderMessageContent()}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
    >
      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        {showAvatar && !isOwnMessage && (
          <div className="w-6 h-6 bg-gray-600 rounded-full flex-shrink-0" />
        )}

        {/* Message Content */}
        <div className="relative">
          {/* Reply indicator */}
          {message.replyTo && (
            <div className="mb-1 text-xs text-gray-400 border-l-2 border-gray-600 pl-2">
              Répondre à...
            </div>
          )}

          {/* Message bubble */}
          <div className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-gray-700 text-white'
          } ${message.status === 'failed' ? 'opacity-50' : ''}`}>
            {renderMessageContent()}
          </div>

          {/* Timestamp and status */}
          <div className={`flex items-center space-x-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            {showTimestamp && (
              <span className="text-xs text-gray-400">
                {formatTimestamp(message.createdAt)}
              </span>
            )}
            {isOwnMessage && getStatusIcon()}
          </div>

          {/* Actions */}
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute top-0 flex space-x-1 ${
                isOwnMessage ? '-left-20' : '-right-20'
              }`}
            >
              <button
                onClick={() => onReply?.(message)}
                className="p-1 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
                title="Répondre"
              >
                <Reply size={12} />
              </button>
              
              {isOwnMessage && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
                    title="Modifier"
                  >
                    <Edit size={12} />
                  </button>
                  
                  <button
                    onClick={() => onDelete?.(message.id)}
                    className="p-1 bg-gray-800 hover:bg-red-600 rounded-full text-gray-400 hover:text-white transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}