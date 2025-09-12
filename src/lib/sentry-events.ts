// Sentry event tracking for business operations

interface UploadEventData {
  fileSize: number
  fileType: string
  provider: string
  success: boolean
  step?: 'presign' | 'upload' | 'confirm' | 'verify'
  userId?: string
  error?: string
}

interface WalletEventData {
  type: 'fund' | 'gift_send' | 'purchase'
  amount: number
  userId: string
  success: boolean
  error?: string
}

interface AuthEventData {
  type: 'login' | 'register' | 'logout' | 'password_reset'
  userId?: string
  success: boolean
  method?: string
  error?: string
}

export function trackUploadEvent(data: UploadEventData) {
  try {
    const Sentry = require('@sentry/node')
    
    Sentry.addBreadcrumb({
      message: `Upload ${data.step || 'event'}`,
      level: data.success ? 'info' : 'error',
      data: {
        ...data,
        userId: data.userId ? '[REDACTED]' : undefined, // PII scrubbing
        fileSizeMB: Math.round(data.fileSize / (1024 * 1024) * 100) / 100
      },
      category: 'upload'
    })

    // Custom event for monitoring
    if (!data.success) {
      Sentry.captureMessage(`Upload failed: ${data.error || 'Unknown error'}`, {
        level: 'warning',
        tags: {
          provider: data.provider,
          fileType: data.fileType,
          step: data.step || 'unknown'
        },
        extra: {
          fileSize: data.fileSize,
          provider: data.provider
        }
      })
    }
  } catch (error) {
    // Silent fail if Sentry not available
    console.warn('Sentry tracking failed:', error)
  }
}

export function trackWalletEvent(data: WalletEventData) {
  try {
    const Sentry = require('@sentry/node')
    
    Sentry.addBreadcrumb({
      message: `Wallet ${data.type}`,
      level: data.success ? 'info' : 'warning',
      data: {
        type: data.type,
        amount: data.amount,
        success: data.success,
        userId: '[REDACTED]', // Always redact user info
        error: data.error
      },
      category: 'wallet'
    })

    // Alert on high-value transactions
    if (data.amount > 1000) {
      Sentry.captureMessage(`High value wallet transaction: ${data.amount}`, {
        level: 'info',
        tags: {
          type: data.type,
          highValue: true
        },
        extra: {
          amount: data.amount,
          success: data.success
        }
      })
    }

    // Alert on failed transactions
    if (!data.success) {
      Sentry.captureMessage(`Wallet transaction failed: ${data.error}`, {
        level: 'warning',
        tags: {
          type: data.type,
          failed: true
        },
        extra: {
          amount: data.amount,
          error: data.error
        }
      })
    }
  } catch (error) {
    console.warn('Sentry wallet tracking failed:', error)
  }
}

export function trackAuthEvent(data: AuthEventData) {
  try {
    const Sentry = require('@sentry/node')
    
    Sentry.addBreadcrumb({
      message: `Auth ${data.type}`,
      level: data.success ? 'info' : 'warning',
      data: {
        type: data.type,
        success: data.success,
        method: data.method,
        userId: data.userId ? '[REDACTED]' : undefined,
        error: data.error
      },
      category: 'auth'
    })

    // Track auth failures for security monitoring
    if (!data.success) {
      Sentry.captureMessage(`Authentication failed: ${data.type}`, {
        level: 'warning',
        tags: {
          authType: data.type,
          method: data.method || 'unknown',
          failed: true
        },
        extra: {
          error: data.error
        }
      })
    }
  } catch (error) {
    console.warn('Sentry auth tracking failed:', error)
  }
}

export function trackFeatureFlagEvent(flag: string, enabled: boolean, userId?: string) {
  try {
    const Sentry = require('@sentry/node')
    
    Sentry.addBreadcrumb({
      message: `Feature flag: ${flag}`,
      level: 'info',
      data: {
        flag,
        enabled,
        userId: userId ? '[REDACTED]' : undefined
      },
      category: 'feature-flag'
    })
  } catch (error) {
    console.warn('Sentry feature flag tracking failed:', error)
  }
}

export function trackPerformanceEvent(event: string, duration: number, metadata?: Record<string, any>) {
  try {
    const Sentry = require('@sentry/node')
    
    Sentry.addBreadcrumb({
      message: `Performance: ${event}`,
      level: duration > 5000 ? 'warning' : 'info', // Warn if >5s
      data: {
        event,
        duration,
        durationSeconds: Math.round(duration / 1000 * 100) / 100,
        ...metadata
      },
      category: 'performance'
    })

    // Capture slow operations
    if (duration > 10000) { // >10s
      Sentry.captureMessage(`Slow operation detected: ${event}`, {
        level: 'warning',
        tags: {
          performance: true,
          slow: true
        },
        extra: {
          duration,
          event,
          metadata
        }
      })
    }
  } catch (error) {
    console.warn('Sentry performance tracking failed:', error)
  }
}