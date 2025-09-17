export interface MessagingService {
  sendText(conversationId: string, text: string): Promise<void>
  sendMedia(conversationId: string, fileUrl: string): Promise<void>
  ensureConversation(escortUserId: string, clientUserId: string): Promise<{ id: string }>
}

// Stub/mocks pour le squelette
export const messagingService: MessagingService = {
  async sendText() {},
  async sendMedia() {},
  async ensureConversation() { return { id: `conv_${Date.now()}` } },
}

