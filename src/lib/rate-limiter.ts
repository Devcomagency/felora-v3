/**
 * Système de rate limiting simple en mémoire
 * Pour la production, utiliser Redis ou un service dédié
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Nettoyer les entrées expirées toutes les minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  /**
   * Vérifie si une requête est autorisée selon les limites
   */
  isAllowed(
    key: string, 
    limit: number = 100, 
    windowMs: number = 60000 // 1 minute par défaut
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry || now > entry.resetTime) {
      // Nouvelle fenêtre ou première requête
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowMs
      }
    }

    if (entry.count >= limit) {
      // Limite atteinte
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Incrémenter le compteur
    entry.count++
    this.limits.set(key, entry)

    return {
      allowed: true,
      remaining: limit - entry.count,
      resetTime: entry.resetTime
    }
  }

  /**
   * Nettoie les entrées expirées
   */
  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
      }
    }
  }

  /**
   * Obtient les statistiques pour une clé
   */
  getStats(key: string): RateLimitEntry | null {
    return this.limits.get(key) || null
  }

  /**
   * Réinitialise les limites pour une clé
   */
  reset(key: string) {
    this.limits.delete(key)
  }

  /**
   * Nettoie toutes les entrées
   */
  clear() {
    this.limits.clear()
  }

  /**
   * Arrête le nettoyage automatique
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// Instance globale du rate limiter
export const rateLimiter = new RateLimiter()

/**
 * Middleware de rate limiting pour les APIs
 */
export function createRateLimitMiddleware(options: {
  limit?: number
  windowMs?: number
  keyGenerator?: (req: Request) => string
} = {}) {
  const {
    limit = 100,
    windowMs = 60000,
    keyGenerator = (req) => {
      // Utiliser l'IP par défaut
      const forwarded = req.headers.get('x-forwarded-for')
      const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
      return `ip:${ip}`
    }
  } = options

  return (req: Request) => {
    const key = keyGenerator(req)
    const result = rateLimiter.isAllowed(key, limit, windowMs)

    return {
      allowed: result.allowed,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
        'Retry-After': result.allowed ? '0' : Math.ceil((result.resetTime - Date.now()) / 1000).toString()
      }
    }
  }
}

/**
 * Rate limiting spécifique pour le feed public
 */
export const feedRateLimit = createRateLimitMiddleware({
  limit: 200, // 200 requêtes par minute
  windowMs: 60000, // 1 minute
  keyGenerator: (req) => {
    // Combiner IP et User-Agent pour plus de précision
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    return `feed:${ip}:${userAgent.slice(0, 20)}`
  }
})

/**
 * Rate limiting pour les requêtes lourdes
 */
export const heavyOperationRateLimit = createRateLimitMiddleware({
  limit: 10, // 10 requêtes par minute
  windowMs: 60000,
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    return `heavy:${ip}`
  }
})

/**
 * Rate limiting pour les likes et réactions
 */
export const reactionRateLimit = createRateLimitMiddleware({
  limit: 30, // 30 likes/réactions par minute (1 toutes les 2 secondes)
  windowMs: 60000, // 1 minute
  keyGenerator: (req) => {
    // Combiner IP et userId si disponible
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `reaction:${ip}:${userId}`
  }
})
