/**
 * Simple Rate Limiter for Profile Test APIs
 * IP-based with memory store (suitable for dev/small prod)
 */

interface RateLimitEntry {
  count: number
  resetTime: number
  lastRequest: number
}

class SimpleRateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private readonly maxRequests: number
  private readonly windowMs: number
  private readonly cleanupInterval: NodeJS.Timeout

  constructor(maxRequests = 100, windowMs = 60 * 1000) { // 100 req/min by default
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Get the max requests limit
   */
  get limit(): number {
    return this.maxRequests
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): {
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  } {
    const now = Date.now()
    const key = this.normalizeKey(identifier)
    
    let entry = this.store.get(key)
    
    // Create new entry or reset if window expired
    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.windowMs,
        lastRequest: now
      }
      this.store.set(key, entry)
    }

    entry.lastRequest = now

    // Check if limit exceeded
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      }
    }

    // Increment and allow
    entry.count++
    this.store.set(key, entry)

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }

  /**
   * Normalize identifier (remove port, hash sensitive data)
   */
  private normalizeKey(identifier: string): string {
    // Remove port from IP if present
    return identifier.split(':')[0] || identifier
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Get current stats (for monitoring)
   */
  getStats(): {
    totalEntries: number
    activeEntries: number
    memoryUsage: string
  } {
    const now = Date.now()
    let activeCount = 0
    
    for (const entry of this.store.values()) {
      if (now < entry.resetTime) {
        activeCount++
      }
    }

    return {
      totalEntries: this.store.size,
      activeEntries: activeCount,
      memoryUsage: `${Math.round(this.store.size * 64 / 1024)}KB` // Rough estimate
    }
  }

  /**
   * Clear all entries (for testing)
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Destroy limiter and cleanup
   */
  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

// Global rate limiters for different endpoints
const profileLimiter = new SimpleRateLimiter(50, 60 * 1000) // 50 req/min for profiles
const mediaLimiter = new SimpleRateLimiter(200, 60 * 1000)  // 200 req/min for media

/**
 * Rate limit middleware function
 */
export function rateLimit(
  identifier: string, 
  type: 'profile' | 'media' = 'profile'
): {
  allowed: boolean
  headers: Record<string, string>
  error?: { status: number; message: string }
} {
  const limiter = type === 'media' ? mediaLimiter : profileLimiter
  const result = limiter.isAllowed(identifier)

  const headers = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    'X-RateLimit-Limit': limiter.limit.toString()
  }

  if (!result.allowed) {
    return {
      allowed: false,
      headers: {
        ...headers,
        'Retry-After': result.retryAfter?.toString() || '60'
      },
      error: {
        status: 429,
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`
      }
    }
  }

  return {
    allowed: true,
    headers
  }
}

/**
 * Extract client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (if behind proxy)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-remote-addr')
  
  // Use first IP from forwarded chain
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  if (remoteAddr) {
    return remoteAddr
  }

  // Fallback to user-agent hash for localhost/development
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `fallback-${Buffer.from(userAgent).toString('base64').slice(0, 10)}`
}

/**
 * Get rate limiter stats for monitoring
 */
export function getRateLimitStats(): {
  profile: ReturnType<SimpleRateLimiter['getStats']>
  media: ReturnType<SimpleRateLimiter['getStats']>
} {
  return {
    profile: profileLimiter.getStats(),
    media: mediaLimiter.getStats()
  }
}

// Export limiter instances for testing
export { profileLimiter, mediaLimiter }