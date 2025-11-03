/**
 * Types pour le système de signalements
 */

export type ReportType = 'PROFILE' | 'MESSAGE' | 'MEDIA' | 'BEHAVIOR' | 'OTHER'

export type ReportReason =
  // Profils
  | 'FAKE_PROFILE'
  | 'FAKE_PHOTOS'
  | 'SCAM'
  | 'IMPERSONATION'
  | 'MISLEADING_INFO'
  | 'UNDERAGE'
  // Messages
  | 'HARASSMENT'
  | 'SPAM'
  | 'INAPPROPRIATE_CONTENT'
  | 'THREATS'
  | 'HATE_SPEECH'
  // Médias
  | 'INAPPROPRIATE_MEDIA'
  | 'COPYRIGHT'
  | 'EXPLICIT_CONTENT'
  // Comportements
  | 'NO_SHOW'
  | 'PAYMENT_ISSUE'
  | 'UNPROFESSIONAL'
  | 'SAFETY_CONCERN'
  // Autres
  | 'TOS_VIOLATION'
  | 'OTHER'

export type ReportStatus = 'PENDING' | 'REVIEWING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED' | 'ESCALATED'

export interface Report {
  id: string

  // Qui signale
  reporterId?: string
  reporterEmail?: string
  reporterIp?: string

  // Quoi est signalé
  reportType: ReportType
  targetType: string // 'escort', 'club', 'conversation', 'media', 'user'
  targetId: string

  // Détails
  reason: ReportReason
  description?: string
  evidence?: string // JSON avec URLs de preuves

  // Traitement
  status: ReportStatus
  reviewedBy?: string
  reviewedAt?: Date
  reviewNotes?: string
  actionTaken?: string

  // Métadonnées
  createdAt: Date
  updatedAt: Date
}

export interface CreateReportInput {
  reportType: ReportType
  targetType: string
  targetId: string
  reason: ReportReason
  description?: string
  evidence?: string[]
}

export interface ReportWithDetails extends Report {
  reporter?: {
    id: string
    name: string
    email: string
  }
  target?: {
    id: string
    name: string
    type: string
  }
  reviewer?: {
    id: string
    name: string
  }
}

// Labels français pour l'interface admin
export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  PROFILE: 'Profil',
  MESSAGE: 'Message',
  MEDIA: 'Média',
  BEHAVIOR: 'Comportement',
  OTHER: 'Autre'
}

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  // Profils
  FAKE_PROFILE: 'Faux profil',
  FAKE_PHOTOS: 'Fausses photos',
  SCAM: 'Arnaque',
  IMPERSONATION: "Usurpation d'identité",
  MISLEADING_INFO: 'Informations trompeuses',
  UNDERAGE: 'Mineur',
  // Messages
  HARASSMENT: 'Harcèlement',
  SPAM: 'Spam',
  INAPPROPRIATE_CONTENT: 'Contenu inapproprié',
  THREATS: 'Menaces',
  HATE_SPEECH: 'Discours haineux',
  // Médias
  INAPPROPRIATE_MEDIA: 'Média inapproprié',
  COPYRIGHT: "Violation de droits d'auteur",
  EXPLICIT_CONTENT: 'Contenu explicite non autorisé',
  // Comportements
  NO_SHOW: 'Rendez-vous manqué',
  PAYMENT_ISSUE: 'Problème de paiement',
  UNPROFESSIONAL: 'Comportement non professionnel',
  SAFETY_CONCERN: 'Problème de sécurité',
  // Autres
  TOS_VIOLATION: 'Violation des CGU',
  OTHER: 'Autre'
}

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'En attente',
  REVIEWING: 'En cours',
  REVIEWED: 'Examiné',
  RESOLVED: 'Résolu',
  DISMISSED: 'Rejeté',
  ESCALATED: 'Escaladé'
}

export const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
  PENDING: 'yellow',
  REVIEWING: 'blue',
  REVIEWED: 'purple',
  RESOLVED: 'green',
  DISMISSED: 'gray',
  ESCALATED: 'red'
}

// Raisons groupées par type pour les modals
export const REPORT_REASONS_BY_TYPE: Record<ReportType, ReportReason[]> = {
  PROFILE: [
    'FAKE_PROFILE',
    'FAKE_PHOTOS',
    'SCAM',
    'IMPERSONATION',
    'MISLEADING_INFO',
    'UNDERAGE',
    'OTHER'
  ],
  MESSAGE: [
    'HARASSMENT',
    'SPAM',
    'INAPPROPRIATE_CONTENT',
    'THREATS',
    'HATE_SPEECH',
    'OTHER'
  ],
  MEDIA: [
    'INAPPROPRIATE_MEDIA',
    'COPYRIGHT',
    'EXPLICIT_CONTENT',
    'OTHER'
  ],
  BEHAVIOR: [
    'NO_SHOW',
    'PAYMENT_ISSUE',
    'UNPROFESSIONAL',
    'SAFETY_CONCERN',
    'OTHER'
  ],
  OTHER: ['OTHER']
}
