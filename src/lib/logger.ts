/**
 * 📝 SYSTÈME DE LOGGING STRUCTURÉ AMÉLIORÉ
 *
 * Logger centralisé qui respecte les niveaux de log et masque les données sensibles
 * Compatible avec Sentry, Datadog et autres services de monitoring
 *
 * Usage: Replace console.log with logger.info, console.error with logger.error, etc.
 */

import { sanitizeForLog } from './serverAuth'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = process.env.NODE_ENV === 'development'
const minLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || (isDev ? 'debug' : 'info')

function shouldLog(level: LogLevel): boolean {
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
  const minIndex = levels.indexOf(minLevel)
  const currentIndex = levels.indexOf(level)
  return currentIndex >= minIndex
}

function getEmoji(level: LogLevel): string {
  switch (level) {
    case 'debug': return '🐛'
    case 'info': return 'ℹ️'
    case 'warn': return '⚠️'
    case 'error': return '❌'
    default: return '📝'
  }
}

function formatLog(level: LogLevel, args: any[]): any[] {
  const timestamp = new Date().toISOString()
  const emoji = getEmoji(level)
  const prefix = `[${timestamp}] ${emoji} ${level.toUpperCase()}:`

  // Sanitize objects for security
  const sanitized = args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      return sanitizeForLog(arg)
    }
    return arg
  })

  return [prefix, ...sanitized]
}

export const logger = {
  log: (...args: any[]) => {
    if (isDev && shouldLog('info')) {
      console.log(...formatLog('info', args))
    }
  },

  debug: (...args: any[]) => {
    if (shouldLog('debug')) {
      console.debug(...formatLog('debug', args))
    }
  },

  info: (...args: any[]) => {
    if (shouldLog('info')) {
      console.info(...formatLog('info', args))
    }
  },

  warn: (...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(...formatLog('warn', args))
    }
  },

  error: (...args: any[]) => {
    if (shouldLog('error')) {
      console.error(...formatLog('error', args))
    }

    // TODO: En production, envoyer à Sentry/Datadog
    if (!isDev && process.env.SENTRY_DSN) {
      // Sentry.captureException(args[0])
    }
  },

  /**
   * Log spécifique pour les événements de sécurité (toujours loggé)
   */
  security: (message: string, context?: any) => {
    const timestamp = new Date().toISOString()
    console.warn(`[${timestamp}] 🔒 SECURITY: ${message}`)
    if (context) {
      console.warn('Context:', sanitizeForLog(context))
    }

    // TODO: Alerter en production (Slack/Email)
  },

  /**
   * Log pour les métriques et performances
   */
  metric: (name: string, value: number, unit: string = 'ms') => {
    if (shouldLog('info')) {
      const timestamp = new Date().toISOString()
      console.info(`[${timestamp}] 📊 METRIC: ${name} = ${value}${unit}`)
    }
  }
}
