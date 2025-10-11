// Constantes pour la messagerie
export const MESSAGING_CONSTANTS = {
  // Timeouts et délais
  TYPING_TIMEOUT: 3000, // 3 secondes
  DEBOUNCE_DELAY: 300, // 300ms
  RETRY_DELAY: 1000, // 1 seconde
  CONNECTION_TIMEOUT: 10000, // 10 secondes
  
  // Limites
  MAX_MESSAGE_LENGTH: 2000,
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_IMAGE_SIZE: 20 * 1024 * 1024, // 20MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_VOICE_MESSAGE_DURATION: 600, // 10 minutes (en secondes)
  MAX_MESSAGES_PER_PAGE: 50,
  MAX_CONVERSATIONS_PER_PAGE: 20,
  
  // Tailles d'interface
  TEXTAREA_MIN_HEIGHT: 36,
  TEXTAREA_MAX_HEIGHT: 120,
  HEADER_HEIGHT: 80,
  FOOTER_HEIGHT: 100,
  
  // États de message
  MESSAGE_STATUS: {
    SENDING: 'sending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    FAILED: 'failed'
  } as const,
  
  // Types de conversation
  CONVERSATION_TYPES: {
    DIRECT: 'direct',
    GROUP: 'group'
  } as const,
  
  // Rôles utilisateur
  USER_ROLES: {
    CLIENT: 'client',
    ESCORT: 'escort',
    CLUB: 'club'
  } as const
} as const

// Constantes pour la recherche
export const SEARCH_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  MIN_QUERY_LENGTH: 2,
  MAX_RESULTS_PER_PAGE: 20,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const

// Constantes pour les médias
export const MEDIA_CONSTANTS = {
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  SUPPORTED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  MAX_PREVIEW_SIZE: 2 * 1024 * 1024, // 2MB pour les previews
  THUMBNAIL_SIZE: 200,
  COMPRESSION_QUALITY: 0.8
} as const
