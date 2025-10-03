/**
 * Utilitaires pour la gestion d'erreurs avec retry automatique
 */

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryCondition?: (error: any) => boolean
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error) => {
    // Retry sur les erreurs réseau et 5xx
    return error.code === 'NETWORK_ERROR' || 
           (error.status >= 500 && error.status < 600) ||
           error.name === 'TimeoutError'
  }
}

/**
 * Exécute une fonction avec retry automatique et backoff exponentiel
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: any

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Si c'est la dernière tentative ou que l'erreur ne doit pas être retryée
      if (attempt === opts.maxRetries || !opts.retryCondition(error)) {
        throw error
      }

      // Calculer le délai avec backoff exponentiel
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelay
      )

      console.log(`🔄 [RETRY] Tentative ${attempt + 1}/${opts.maxRetries + 1} échouée, retry dans ${delay}ms`, error.message)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Wrapper pour les appels API avec retry automatique
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return withRetry(async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        ;(error as any).status = response.status
        throw error
      }

      return response
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout')
        timeoutError.name = 'TimeoutError'
        throw timeoutError
      }
      
      throw error
    }
  }, retryOptions)
}

/**
 * Wrapper pour les opérations de base de données avec retry
 */
export async function dbOperationWithRetry<T>(
  operation: () => Promise<T>,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return withRetry(operation, {
    ...retryOptions,
    retryCondition: (error) => {
      // Retry sur les erreurs de connexion DB et deadlocks
      return error.code === 'P2002' || // Unique constraint
             error.code === 'P2025' || // Record not found
             error.code === 'P2034' || // Transaction conflict
             error.message?.includes('connection') ||
             error.message?.includes('timeout') ||
             error.message?.includes('deadlock')
    }
  })
}

/**
 * Gestionnaire d'erreurs centralisé pour les APIs
 */
export function createErrorHandler(operation: string) {
  return (error: any) => {
    console.error(`❌ [${operation}] Erreur:`, error)
    
    // Log des erreurs critiques
    if (error.status >= 500) {
      console.error(`🚨 [${operation}] Erreur serveur critique:`, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    }

    // Retourner une réponse d'erreur standardisée
    return {
      success: false,
      error: error.message || 'Erreur interne du serveur',
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    }
  }
}
