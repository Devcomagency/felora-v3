// Service mock pour tester le système de messagerie

import type { 
  Conversation,
  Message,
  User,
  SendMessageRequest,
  SendMessageResponse,
  ConversationListResponse,
  MessageListResponse
} from '../types/chat'

// Mock users
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Marc Geneva',
    handle: '@marc_geneva',
    avatar: 'https://i.pravatar.cc/100?img=1',
    role: 'client',
    isPremium: true,
    isVerified: true,
    onlineStatus: 'online',
  },
  {
    id: 'user-2',
    name: 'Alex Lausanne',
    handle: '@alex_lausanne',
    avatar: 'https://i.pravatar.cc/100?img=2',
    role: 'client',
    isPremium: false,
    isVerified: false,
    onlineStatus: 'offline',
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
  },
  {
    id: 'user-3',
    name: 'Thomas Zurich',
    handle: '@thomas_zurich',
    avatar: 'https://i.pravatar.cc/100?img=3',
    role: 'client',
    isPremium: true,
    isVerified: true,
    onlineStatus: 'online',
  },
  {
    id: 'user-4',
    name: 'Pierre Genève',
    handle: '@pierre_geneve',
    avatar: 'https://i.pravatar.cc/100?img=4',
    role: 'client',
    isPremium: false,
    isVerified: false,
    onlineStatus: 'away',
  },
  {
    id: 'escort-1',
    name: 'Sofia Elite',
    handle: '@sofia_elite',
    avatar: 'https://i.pravatar.cc/100?img=10',
    role: 'escort',
    isPremium: true,
    isVerified: true,
    onlineStatus: 'online',
  }
]

// Mock messages
const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      type: 'text',
      content: 'Salut ! Comment ça va ?',
      status: 'read',
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'escort-1',
      type: 'text',
      content: 'Salut ! Ça va très bien merci 😊 Et toi ?',
      status: 'read',
      createdAt: new Date(Date.now() - 58 * 60 * 1000),
      updatedAt: new Date(Date.now() - 58 * 60 * 1000),
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'user-1',
      type: 'text',
      content: 'Parfait ! J\'aimerais te commander une photo personnalisée',
      status: 'read',
      createdAt: new Date(Date.now() - 55 * 60 * 1000),
      updatedAt: new Date(Date.now() - 55 * 60 * 1000),
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      senderId: 'escort-1',
      type: 'media_request',
      content: 'Bien sûr ! Je peux te faire une photo personnalisée. Voici ma proposition :',
      metadata: {
        mediaPrice: 50
      },
      status: 'read',
      createdAt: new Date(Date.now() - 53 * 60 * 1000),
      updatedAt: new Date(Date.now() - 53 * 60 * 1000),
    },
    {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'user-1',
      type: 'text',
      content: 'Merci pour la photo personnalisée ! Elle est parfaite 😍',
      status: 'read',
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000),
    },
  ],
  'conv-2': [
    {
      id: 'msg-6',
      conversationId: 'conv-2',
      senderId: 'user-2',
      type: 'text',
      content: 'Salut ! Comment ça va ? J\'aimerais te poser une question...',
      status: 'delivered',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  ],
  'conv-3': [
    {
      id: 'msg-7',
      conversationId: 'conv-3',
      senderId: 'escort-1',
      type: 'text',
      content: 'Salut Thomas ! Merci pour ton message 😊',
      status: 'read',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: 'msg-8',
      conversationId: 'conv-3',
      senderId: 'user-3',
      type: 'text',
      content: 'D\'accord pour demain soir. À quelle heure ?',
      status: 'read',
      createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    },
  ],
  'conv-4': [
    {
      id: 'msg-9',
      conversationId: 'conv-4',
      senderId: 'user-4',
      type: 'text',
      content: 'Super ! Merci beaucoup 🙏',
      status: 'sent',
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
    },
  ]
}

// Mock conversations
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    type: 'direct',
    participants: [mockUsers[0], mockUsers[4]], // Marc + Sofia
    lastMessage: mockMessages['conv-1'][mockMessages['conv-1'].length - 1],
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isBlocked: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: 'conv-2',
    type: 'direct',
    participants: [mockUsers[1], mockUsers[4]], // Alex + Sofia
    lastMessage: mockMessages['conv-2'][0],
    unreadCount: 2,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isBlocked: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'conv-3',
    type: 'direct',
    participants: [mockUsers[2], mockUsers[4]], // Thomas + Sofia
    lastMessage: mockMessages['conv-3'][mockMessages['conv-3'].length - 1],
    unreadCount: 0,
    isPinned: true,
    isMuted: false,
    isArchived: false,
    isBlocked: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
  },
  {
    id: 'conv-4',
    type: 'direct',
    participants: [mockUsers[3], mockUsers[4]], // Pierre + Sofia
    lastMessage: mockMessages['conv-4'][0],
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    isBlocked: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
  },
]

class ChatServiceMock {
  private eventListeners: Map<string, Function[]> = new Map()
  private isConnected = false
  private currentUserId = 'escort-1' // Sofia par défaut

  // Event handling
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.eventListeners.delete(event)
    } else {
      const listeners = this.eventListeners.get(event)
      if (listeners) {
        const index = listeners.indexOf(callback)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  setUserId(userId: string) {
    this.currentUserId = userId
  }

  async connect(): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    this.isConnected = true
    this.emit('connected', {})
    
    console.log('🟢 Chat service mock connected')
  }

  disconnect() {
    this.isConnected = false
    this.emit('disconnected', {})
    
    console.log('🔴 Chat service mock disconnected')
  }

  getIsConnected(): boolean {
    return this.isConnected
  }

  async getConversations(cursor?: string, limit = 20): Promise<ConversationListResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      conversations: mockConversations,
      hasMore: false
    }
  }

  async getMessages(conversationId: string, cursor?: string, limit = 50): Promise<MessageListResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200))

    const messages = mockMessages[conversationId] || []

    return {
      messages,
      hasMore: false
    }
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400))

    const conversationId = request.conversationId || `conv-new-${Date.now()}`
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: this.currentUserId,
      receiverId: request.receiverId,
      type: request.type,
      content: request.content,
      metadata: request.metadata,
      status: 'sent',
      createdAt: new Date(),
      updatedAt: new Date(),
      replyTo: request.replyTo,
    }

    // Add to mock storage
    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = []
    }
    mockMessages[conversationId].push(newMessage)

    // Update conversation
    let conversation = mockConversations.find(c => c.id === conversationId)
    if (!conversation && request.receiverId) {
      // Create new conversation
      const receiver = mockUsers.find(u => u.id === request.receiverId)
      const sender = mockUsers.find(u => u.id === this.currentUserId)
      
      if (receiver && sender) {
        conversation = {
          id: conversationId,
          type: 'direct',
          participants: [sender, receiver],
          lastMessage: newMessage,
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          isArchived: false,
          isBlocked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockConversations.unshift(conversation)
      }
    } else if (conversation) {
      conversation.lastMessage = newMessage
      conversation.updatedAt = new Date()
    }

    // Emit event
    this.emit('message', newMessage)

    // Simulate delivery and read status updates
    setTimeout(() => {
      newMessage.status = 'delivered'
      this.emit('message_delivered', { messageId: newMessage.id, conversationId })
    }, 1000)

    setTimeout(() => {
      newMessage.status = 'read'
      this.emit('message_read', { messageId: newMessage.id, conversationId })
    }, 2000)

    return {
      message: newMessage,
      conversation: conversation!
    }
  }

  async editMessage(messageId: string, content: string): Promise<Message> {
    await new Promise(resolve => setTimeout(resolve, 200))

    // Find and update message
    for (const conversationId in mockMessages) {
      const message = mockMessages[conversationId].find(m => m.id === messageId)
      if (message) {
        message.content = content
        message.updatedAt = new Date()
        message.editedAt = new Date()
        return message
      }
    }

    throw new Error('Message not found')
  }

  async deleteMessage(messageId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))

    for (const conversationId in mockMessages) {
      const index = mockMessages[conversationId].findIndex(m => m.id === messageId)
      if (index > -1) {
        mockMessages[conversationId].splice(index, 1)
        return
      }
    }
  }

  async markAsRead(conversationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100))

    const conversation = mockConversations.find(c => c.id === conversationId)
    if (conversation) {
      conversation.unreadCount = 0
    }
  }

  async blockUser(userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    console.log('User blocked:', userId)
  }

  async archiveConversation(conversationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const conversation = mockConversations.find(c => c.id === conversationId)
    if (conversation) {
      conversation.isArchived = true
    }
  }

  sendTypingStart(conversationId: string) {
    if (this.isConnected) {
      const user = mockUsers.find(u => u.id === this.currentUserId)
      if (user) {
        this.emit('typing_start', {
          conversationId,
          userId: this.currentUserId,
          userName: user.name,
          timestamp: new Date()
        })
      }
    }
  }

  sendTypingStop(conversationId: string) {
    if (this.isConnected) {
      this.emit('typing_stop', { conversationId, userId: this.currentUserId })
    }
  }

  async uploadMedia(file: File, conversationId?: string): Promise<string> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Return mock URL
    return `https://mock-cdn.felora.com/uploads/${file.name}`
  }

  getConnectionState(): string {
    return this.isConnected ? 'connected' : 'disconnected'
  }
}

// Export singleton
export const chatServiceMock = new ChatServiceMock()
export default ChatServiceMock
