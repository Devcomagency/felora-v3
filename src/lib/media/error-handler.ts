/**
 * Media Error Handler - Gestion d'erreurs robuste pour les médias
 * Système de retry automatique et logging détaillé
 */

export interface MediaError {
  code: string
  message: string
  details?: any
  timestamp: Date
  retryable: boolean
  retryCount?: number
}

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

export class MediaErrorHandler {
  private static instance: MediaErrorHandler
  private retryConfig: RetryConfig
  private errorLog: MediaError[] = []

  private constructor() {
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 seconde
      maxDelay: 10000, // 10 secondes
      backoffMultiplier: 2
    }
  }

  static getInstance(): MediaErrorHandler {
    if (!MediaErrorHandler.instance) {
      MediaErrorHandler.instance = new MediaErrorHandler()
    }
    return MediaErrorHandler.instance
  }

  /**
   * Gère une erreur de média avec retry automatique
   */
  async handleError<T>(
    operation: () => Promise<T>,
    errorContext: string,
    retryable: boolean = true
  ): Promise<T> {
    let lastError: Error | null = null
    let retryCount = 0

    while (retryCount <= this.retryConfig.maxRetries) {
      try {
        const result = await operation()
        
        // Succès - log si c'était un retry
        if (retryCount > 0) {
          this.logSuccess(errorContext, retryCount)
        }
        
        return result
      } catch (error) {
        lastError = error as Error
        retryCount++

        const mediaError: MediaError = {
          code: this.getErrorCode(error as Error),
          message: (error as Error).message,
          details: { context: errorContext, retryCount },
          timestamp: new Date(),
          retryable: retryable && retryCount <= this.retryConfig.maxRetries,
          retryCount
        }

        this.logError(mediaError)

        // Si pas retryable ou max retries atteint
        if (!retryable || retryCount > this.retryConfig.maxRetries) {
          break
        }

        // Attendre avant le prochain retry
        const delay = this.calculateDelay(retryCount)
        await this.sleep(delay)
      }
    }

    // Tous les retries ont échoué
    throw new Error(`Operation failed after ${retryCount} attempts: ${lastError?.message}`)
  }

  /**
   * Calcule le délai d'attente pour le retry
   */
  private calculateDelay(retryCount: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount - 1)
    return Math.min(delay, this.retryConfig.maxDelay)
  }

  /**
   * Pause l'exécution
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Détermine le code d'erreur
   */
  private getErrorCode(error: Error): string {
    if (error.message.includes('undefined')) return 'UNDEFINED_URL'
    if (error.message.includes('404')) return 'NOT_FOUND'
    if (error.message.includes('403')) return 'FORBIDDEN'
    if (error.message.includes('500')) return 'SERVER_ERROR'
    if (error.message.includes('network')) return 'NETWORK_ERROR'
    if (error.message.includes('timeout')) return 'TIMEOUT'
    return 'UNKNOWN_ERROR'
  }

  /**
   * Log une erreur
   */
  private logError(error: MediaError): void {
    this.errorLog.push(error)
    
    // Log en console avec détails
    console.error(`🚨 [Media Error] ${error.code}:`, {
      message: error.message,
      context: error.details?.context,
      retryCount: error.retryCount,
      retryable: error.retryable,
      timestamp: error.timestamp.toISOString()
    })

    // En production, envoyer à un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error)
    }
  }

  /**
   * Log un succès après retry
   */
  private logSuccess(context: string, retryCount: number): void {
    console.log(`✅ [Media Success] ${context} succeeded after ${retryCount} retries`)
  }

  /**
   * Envoie l'erreur à un service de monitoring (à implémenter)
   */
  private sendToMonitoring(error: MediaError): void {
    // TODO: Implémenter l'envoi vers Sentry, LogRocket, etc.
    console.log('📊 [Monitoring] Error sent to monitoring service:', error.code)
  }

  /**
   * Obtient les erreurs récentes
   */
  getRecentErrors(limit: number = 10): MediaError[] {
    return this.errorLog
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  /**
   * Obtient les statistiques d'erreurs
   */
  getErrorStats(): { total: number; byCode: Record<string, number>; retryable: number } {
    const byCode: Record<string, number> = {}
    let retryable = 0

    this.errorLog.forEach(error => {
      byCode[error.code] = (byCode[error.code] || 0) + 1
      if (error.retryable) retryable++
    })

    return {
      total: this.errorLog.length,
      byCode,
      retryable
    }
  }

  /**
   * Nettoie les anciens logs
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void { // 24h par défaut
    const cutoff = new Date(Date.now() - maxAge)
    this.errorLog = this.errorLog.filter(error => error.timestamp > cutoff)
  }

  /**
   * Met à jour la configuration de retry
   */
  updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config }
  }
}

// Instance singleton
export const mediaErrorHandler = MediaErrorHandler.getInstance()

// Fonctions utilitaires
export const withRetry = <T>(
  operation: () => Promise<T>,
  context: string,
  retryable: boolean = true
): Promise<T> => {
  return mediaErrorHandler.handleError(operation, context, retryable)
}

export const logMediaError = (error: Error, context: string): void => {
  const mediaError: MediaError = {
    code: 'MANUAL_ERROR',
    message: error.message,
    details: { context },
    timestamp: new Date(),
    retryable: false
  }
  mediaErrorHandler['logError'](mediaError)
}
