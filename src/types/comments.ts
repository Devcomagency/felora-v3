/**
 * Types pour le système de commentaires
 * Inspiré de Remark42 mais adapté pour Felora
 */

export interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  verified: boolean
  admin: boolean
  blocked: boolean
  blockedTill?: string
  createdAt: string
}

export interface CommentVote {
  userId: string
  userIP: string
  timestamp: string
}

export interface CommentEdit {
  timestamp: string
  summary: string
}

export interface Comment {
  id: string
  parentId?: string
  profileId: string
  profileType: 'escort' | 'club'
  text: string
  originalText: string
  user: User
  rating?: number // Pour les avis avec note
  score: number // Score des votes
  votes: {
    up: CommentVote[]
    down: CommentVote[]
  }
  userVote?: 'up' | 'down' | null
  timestamp: string
  updatedAt?: string
  edit?: CommentEdit
  pinned: boolean
  deleted: boolean
  reported: boolean
  reportCount: number
  approved: boolean // Modération
  imported: boolean
}

export interface CommentThread {
  comment: Comment
  replies: CommentThread[]
  repliesCount: number
  collapsed: boolean
}

export interface CommentFilter {
  sortBy: 'timestamp' | 'score' | 'rating'
  sortOrder: 'asc' | 'desc'
  showDeleted: boolean
  onlyApproved: boolean
  userId?: string
  profileId?: string
}

export interface CommentStats {
  total: number
  approved: number
  pending: number
  reported: number
  averageRating?: number
}

export interface BlockDuration {
  value: number
  unit: 'minutes' | 'hours' | 'days' | 'permanent'
  label: string
}

export const BLOCK_DURATIONS: BlockDuration[] = [
  { value: 60, unit: 'minutes', label: '1 heure' },
  { value: 1440, unit: 'minutes', label: '1 jour' },
  { value: 10080, unit: 'minutes', label: '1 semaine' },
  { value: 43200, unit: 'minutes', label: '1 mois' },
  { value: 0, unit: 'permanent', label: 'Permanent' }
]

export interface AdminAction {
  type: 'delete' | 'approve' | 'reject' | 'pin' | 'unpin' | 'block_user' | 'unblock_user' | 'verify_user'
  commentId?: string
  userId?: string
  reason?: string
  duration?: BlockDuration
  timestamp: string
  adminUser: User
}

export interface ModerationQueue {
  pending: Comment[]
  reported: Comment[]
  stats: CommentStats
}