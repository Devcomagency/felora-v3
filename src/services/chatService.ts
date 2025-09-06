// Service de messagerie FELORA avec WebSocket et API REST

import type { 
  Conversation,
  Message,
  User,
  SendMessageRequest,
  SendMessageResponse,
  ConversationListResponse,
  MessageListResponse,
  ChatEvent,
  OnlineStatus,
  TypingIndicator
} from '../types/chat'

class ChatService {
  private baseUrl: string
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private eventListeners: Map<string, Function[]> = new Map()
  private currentUserId: string | null = null
  
  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-api.felora.com' 
      : 'http://localhost:3002'
  }

  // Configuration
  setUserId(userId: string) {
    this.currentUserId = userId
  }

  // WebSocket Connection
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.baseUrl.replace('http', 'ws')}/api/chat/ws${token ? `?token=${token}` : ''}`
        this.ws = new WebSocket(wsUrl)
        
        this.ws.onopen = () => {
          console.log('✅ Chat WebSocket connecté')
          this.reconnectAttempts = 0
          this.emit('connected', {})
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const chatEvent: ChatEvent = JSON.parse(event.data)
            this.handleWebSocketEvent(chatEvent)
          } catch (error) {
            console.error('Erreur parsing message WebSocket:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('❌ Chat WebSocket fermé:', event.code, event.reason)
          this.emit('disconnected', { code: event.code, reason: event.reason })
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => this.attemptReconnect(token), this.reconnectDelay * Math.pow(2, this.reconnectAttempts))
          }
        }

        this.ws.onerror = (error) => {
          console.error('❌ Erreur WebSocket:', error)
          this.emit('error', { error })
          reject(error)
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Déconnexion volontaire')
      this.ws = null
    }
  }

  private attemptReconnect(token?: string) {
    this.reconnectAttempts++
    console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
    this.connect(token).catch(() => {
      // Retry logic is handled in onclose
    })
  }

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

  private handleWebSocketEvent(event: ChatEvent) {
    switch (event.type) {
      case 'message_sent':
        this.emit('message', event.data)
        break
      case 'message_delivered':
        this.emit('message_delivered', event.data)
        break
      case 'message_read':
        this.emit('message_read', event.data)
        break
      case 'typing_start':
        this.emit('typing_start', event.data)
        break
      case 'typing_stop':
        this.emit('typing_stop', event.data)
        break
      case 'user_online':
        this.emit('user_status', { userId: event.data.userId, status: event.data.status })
        break
      case 'user_offline':
        this.emit('user_status', { userId: event.data.userId, status: 'offline', lastSeen: event.data.lastSeen })
        break
      case 'conversation_updated':
        this.emit('conversation_updated', event.data)
        break
      default:
        console.log('Event non géré:', event.type)
    }
  }

  // API REST Methods
  async getConversations(cursor?: string, limit = 20): Promise<ConversationListResponse> {
    const params = new URLSearchParams()
    if (cursor) params.append('cursor', cursor)
    params.append('limit', limit.toString())

    const response = await fetch(`${this.baseUrl}/api/chat/conversations?${params}`, {
      method: 'GET',
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des conversations: ${response.statusText}`)
    }

    return response.json()
  }

  async getMessages(conversationId: string, cursor?: string, limit = 50): Promise<MessageListResponse> {
    const params = new URLSearchParams()
    if (cursor) params.append('cursor', cursor)
    params.append('limit', limit.toString())

    const response = await fetch(`${this.baseUrl}/api/chat/conversations/${conversationId}/messages?${params}`, {
      method: 'GET',
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des messages: ${response.statusText}`)
    }

    return response.json()
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat/messages`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de l\'envoi du message')
    }

    return response.json()
  }

  async editMessage(messageId: string, content: string): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/api/chat/messages/${messageId}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify({ content })
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la modification du message')
    }

    return response.json()
  }

  async deleteMessage(messageId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/chat/messages/${messageId}`, {
      method: 'DELETE',
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du message')
    }
  }

  async markAsRead(conversationId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/chat/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      throw new Error('Erreur lors du marquage comme lu')
    }
  }

  async blockUser(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/chat/users/${userId}/block`, {
      method: 'POST',
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      throw new Error('Erreur lors du blocage')
    }
  }

  async archiveConversation(conversationId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/chat/conversations/${conversationId}/archive`, {
      method: 'POST',
      headers: await this.getHeaders()
    })

    if (!response.ok) {
      throw new Error('Erreur lors de l\'archivage')
    }
  }

  // Typing indicators
  sendTypingStart(conversationId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing_start',
        data: { conversationId, userId: this.currentUserId }
      }))
    }
  }

  sendTypingStop(conversationId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing_stop',
        data: { conversationId, userId: this.currentUserId }
      }))
    }
  }

  // Media upload
  async uploadMedia(file: File, conversationId?: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    if (conversationId) {
      formData.append('conversationId', conversationId)
    }

    const response = await fetch(`${this.baseUrl}/api/chat/media/upload`, {
      method: 'POST',
      headers: await this.getUploadHeaders(),
      body: formData
    })

    if (!response.ok) {
      throw new Error('Erreur lors de l\'upload du média')
    }

    const result = await response.json()
    return result.url
  }

  // Utilities
  private async getHeaders(): Promise<HeadersInit> {
    // TODO: Récupérer le token d'auth depuis le contexte/session
    const token = await this.getAuthToken()
    
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  }

  private async getUploadHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken()
    
    return {
      'Authorization': token ? `Bearer ${token}` : ''
      // Pas de Content-Type pour FormData
    }
  }

  private async getAuthToken(): Promise<string | null> {
    // TODO: Intégrer avec NextAuth ou votre système d'auth
    if (typeof window !== 'undefined') {
      // Côté client - récupérer depuis le localStorage ou session
      return localStorage.getItem('auth_token')
    } else {
      // Côté serveur - récupérer depuis la session
      return null
    }
  }

  // Status methods
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'connected'
      case WebSocket.CLOSING: return 'closing'
      case WebSocket.CLOSED: return 'disconnected'
      default: return 'unknown'
    }
  }
}

// Export singleton
export const chatService = new ChatService()
export default ChatService