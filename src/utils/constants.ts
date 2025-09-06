export const APP_CONFIG = {
  name: 'FELORA',
  description: 'Premium Swiss escort platform',
  url: 'https://felora.ch',
  version: '1.0.0',
} as const

export const ROUTES = {
  HOME: '/',
  FEED: '/feed',
  SEARCH: '/search',
  MAP: '/map',
  MESSAGES: '/message',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
} as const

export const USER_ROLES = {
  CLIENT: 'CLIENT',
  ESCORT: 'ESCORT',
  ADMIN: 'ADMIN',
} as const

export const ESCORT_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
} as const

export const CONVERSATION_TYPES = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  VIP: 'VIP',
} as const

export const MESSAGE_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  GIFT: 'GIFT',
  SYSTEM: 'SYSTEM',
} as const

export const FELORA_COLORS = {
  void: '#000000',
  obsidian: '#0D0D0D',
  charcoal: '#1A1A1A',
  steel: '#2A2A2A',
  silver: '#F8F9FA',
  pearl: '#FFFFFF',
  aurora: '#FF6B9D',
  neon: '#00F5FF',
  plasma: '#B794F6',
  quantum: '#4FD1C7',
  neural: '#7C3AED',
} as const