// Types pour le système de messagerie FELORA

export type MessageType = 'text' | 'image' | 'video' | 'file' | 'voice' | 'payment_request' | 'media_request' | 'system'

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export type ConversationType = 'direct' | 'group' | 'support'

export type UserRole = 'escort' | 'client' | 'admin' | 'moderator'

export type OnlineStatus = 'online' | 'away' | 'busy' | 'offline'

export interface User {
  id: string
  name: string
  handle?: string
  avatar?: string
  role: UserRole
  isPremium: boolean
  isVerified: boolean
  onlineStatus: OnlineStatus
  lastSeen?: Date
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  receiverId?: string
  type: MessageType
  content: string
  metadata?: {
    fileName?: string
    fileSize?: number
    fileType?: string
    mediaUrl?: string
    thumbnailUrl?: string
    duration?: number // pour les vidéos/audio
    paymentAmount?: number
    mediaPrice?: number
    systemAction?: string
  }
  status: MessageStatus
  createdAt: Date
  updatedAt: Date
  editedAt?: Date
  replyTo?: string // ID du message auquel on répond
  reactions?: MessageReaction[]
}

export interface MessageReaction {
  id: string
  messageId: string
  userId: string
  emoji: string
  createdAt: Date
}

export interface Conversation {
  id: string
  type: ConversationType
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  isArchived: boolean
  isBlocked: boolean
  createdAt: Date
  updatedAt: Date
  metadata?: {
    title?: string // pour les groupes
    description?: string
    groupAdmin?: string[]
    totalMessages?: number
    totalMedias?: number
    totalPayments?: number
  }
}

export interface ChatSettings {
  autoDeleteMessages?: boolean
  autoDeleteDays?: number
  allowMediaRequests: boolean
  allowPaymentRequests: boolean
  minimumPaymentAmount: number
  mediaRequestPrice: number
  notificationsEnabled: boolean
  soundEnabled: boolean
  readReceiptsEnabled: boolean
  typingIndicatorEnabled: boolean
  onlineStatusVisible: boolean
}

export interface TypingIndicator {
  conversationId: string
  userId: string
  userName: string
  timestamp: Date
}

export interface MediaUploadProgress {
  messageId: string
  progress: number // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'failed'
}

// Events WebSocket
export type ChatEvent = 
  | { type: 'message_sent'; data: Message }
  | { type: 'message_delivered'; data: { messageId: string; conversationId: string } }
  | { type: 'message_read'; data: { messageId: string; conversationId: string; readBy: string } }
  | { type: 'message_edited'; data: Message }
  | { type: 'message_deleted'; data: { messageId: string; conversationId: string } }
  | { type: 'typing_start'; data: TypingIndicator }
  | { type: 'typing_stop'; data: { conversationId: string; userId: string } }
  | { type: 'user_online'; data: { userId: string; status: OnlineStatus } }
  | { type: 'user_offline'; data: { userId: string; lastSeen: Date } }
  | { type: 'conversation_updated'; data: Conversation }
  | { type: 'media_upload_progress'; data: MediaUploadProgress }

// API Response types
export interface ConversationListResponse {
  conversations: Conversation[]
  hasMore: boolean
  nextCursor?: string
}

export interface MessageListResponse {
  messages: Message[]
  hasMore: boolean
  nextCursor?: string
}

export interface SendMessageRequest {
  conversationId?: string
  receiverId?: string // si nouvelle conversation
  type: MessageType
  content: string
  metadata?: Message['metadata']
  replyTo?: string
}

export interface SendMessageResponse {
  message: Message
  conversation: Conversation
}

// Hooks types
export interface UseChatOptions {
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectDelay?: number
}

export interface UseChatReturn {
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Message[]
  isConnected: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  setActiveConversation: (conversation: Conversation | null) => void
  sendMessage: (request: SendMessageRequest) => Promise<void>
  editMessage: (messageId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  markAsRead: (conversationId: string) => Promise<void>
  blockUser: (userId: string) => Promise<void>
  archiveConversation: (conversationId: string) => Promise<void>
  
  // Real-time
  startTyping: (conversationId: string) => void
  stopTyping: (conversationId: string) => void
  
  // Media
  uploadMedia: (file: File, type: MessageType) => Promise<string>
}