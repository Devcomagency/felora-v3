/**
 * View Tracker System - Inspired by page-view-counter
 * Tracks profile views, media views, and story views
 * Anti-bot protection + 12h session limitation
 */

import { createHash } from 'crypto'

// Types pour le tracking
export type ViewType = 'profile' | 'media' | 'story'

export interface ViewEvent {
  id: string
  targetId: string // profile ID, media ID, story ID
  viewType: ViewType
  sessionHash: string // Hash anonyme de la session
  userAgent?: string
  timestamp: Date
  ipHash?: string // IP hashée pour anonymat
  referrer?: string
  isBot: boolean
}

export interface ViewStats {
  profileViews: number
  mediaViews: number
  storyViews: number
  totalViews: number
  uniqueViewers: number
  lastViewAt: Date
}

// Configuration
const SESSION_DURATION = 12 * 60 * 60 * 1000 // 12 heures en ms
const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /scrapy/i, /curl/i, /wget/i,
  /python/i, /java/i, /php/i, /node/i, /go-http/i
]

/**
 * Détecte si c'est un bot basé sur User-Agent
 */
export function isBot(userAgent?: string): boolean {
  if (!userAgent) return true
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent))
}

/**
 * Génère un hash anonyme pour une session
 * Utilise des données stables pour identifier la même session
 */
export function generateSessionHash(ip?: string, userAgent?: string): string {
  const data = `${ip || 'unknown'}-${userAgent || 'unknown'}-session-salt`
  return createHash('sha256').update(data).digest('hex').substring(0, 16)
}

/**
 * Génère un hash anonyme pour une IP
 */
export function hashIP(ip?: string): string {
  if (!ip) return 'unknown'
  return createHash('sha256').update(ip + 'salt-felora-2025').digest('hex').substring(0, 12)
}

/**
 * Extrait l'IP réelle du client (avec proxies)
 */
export function getClientIP(request: Request): string | undefined {
  const headers = request.headers
  
  // Vérifier les headers de proxy communs
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }
  
  const clientIP = headers.get('x-client-ip')
  if (clientIP) {
    return clientIP.trim()
  }
  
  return undefined
}

/**
 * Vérifie si une session a déjà vu ce contenu dans les 12h
 */
export function isRecentView(lastViewTime: Date): boolean {
  const now = new Date()
  const timeDiff = now.getTime() - lastViewTime.getTime()
  return timeDiff < SESSION_DURATION
}

/**
 * Simule un stockage en mémoire (à remplacer par une vraie DB)
 * Structure : Map<targetId-sessionHash-viewType, ViewEvent>
 */
const viewsMemoryStore = new Map<string, ViewEvent>()
const statsMemoryStore = new Map<string, ViewStats>()

/**
 * Enregistre une vue (avec vérifications anti-bot et session)
 */
export async function trackView(
  targetId: string,
  viewType: ViewType,
  request: Request
): Promise<{ success: boolean; isNewView: boolean; stats: ViewStats }> {
  const userAgent = request.headers.get('user-agent') || undefined
  const clientIP = getClientIP(request)
  const referrer = request.headers.get('referer') || undefined
  
  // Détection de bot
  const botDetected = isBot(userAgent)
  
  // Génération des hash anonymes
  const sessionHash = generateSessionHash(clientIP, userAgent)
  const ipHash = hashIP(clientIP)
  
  // Clé unique pour cette vue
  const viewKey = `${targetId}-${sessionHash}-${viewType}`
  
  // Vérifier si cette session a déjà vu ce contenu récemment
  const existingView = viewsMemoryStore.get(viewKey)
  const isNewView = !existingView || !isRecentView(existingView.timestamp)
  
  // Créer l'événement de vue
  const viewEvent: ViewEvent = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
    targetId,
    viewType,
    sessionHash,
    userAgent,
    timestamp: new Date(),
    ipHash,
    referrer,
    isBot: botDetected
  }
  
  // Enregistrer la vue si elle est nouvelle et pas un bot
  if (isNewView && !botDetected) {
    viewsMemoryStore.set(viewKey, viewEvent)
    
    // Mettre à jour les statistiques
    await updateViewStats(targetId, viewType)
  }
  
  // Récupérer les stats actuelles
  const stats = await getViewStats(targetId)
  
  return {
    success: true,
    isNewView: isNewView && !botDetected,
    stats
  }
}

/**
 * Met à jour les statistiques de vues
 */
async function updateViewStats(targetId: string, viewType: ViewType): Promise<void> {
  const current = statsMemoryStore.get(targetId) || {
    profileViews: 0,
    mediaViews: 0,
    storyViews: 0,
    totalViews: 0,
    uniqueViewers: 0,
    lastViewAt: new Date()
  }
  
  // Incrémenter le bon compteur
  switch (viewType) {
    case 'profile':
      current.profileViews++
      break
    case 'media':
      current.mediaViews++
      break
    case 'story':
      current.storyViews++
      break
  }
  
  current.totalViews++
  current.lastViewAt = new Date()
  
  // Calculer les viewers uniques (sessions uniques dans les dernières 24h)
  const uniqueSessions = new Set()
  const now = new Date()
  
  for (const [key, view] of viewsMemoryStore.entries()) {
    if (key.startsWith(targetId + '-') && 
        (now.getTime() - view.timestamp.getTime()) < 24 * 60 * 60 * 1000) {
      uniqueSessions.add(view.sessionHash)
    }
  }
  
  current.uniqueViewers = uniqueSessions.size
  
  statsMemoryStore.set(targetId, current)
}

/**
 * Récupère les statistiques de vues
 */
export async function getViewStats(targetId: string): Promise<ViewStats> {
  return statsMemoryStore.get(targetId) || {
    profileViews: 0,
    mediaViews: 0,
    storyViews: 0,
    totalViews: 0,
    uniqueViewers: 0,
    lastViewAt: new Date()
  }
}

/**
 * Nettoie les anciennes vues (à appeler périodiquement)
 */
export function cleanupOldViews(): void {
  const now = new Date()
  const cutoff = now.getTime() - (7 * 24 * 60 * 60 * 1000) // 7 jours
  
  for (const [key, view] of viewsMemoryStore.entries()) {
    if (view.timestamp.getTime() < cutoff) {
      viewsMemoryStore.delete(key)
    }
  }
}

/**
 * Nettoie toutes les vues (pour debug/tests)
 */
export function clearAllViews(): void {
  viewsMemoryStore.clear()
  statsMemoryStore.clear()
  console.log('🧹 All view tracking data cleared')
}