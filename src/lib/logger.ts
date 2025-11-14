/**
 * Logger utility that automatically disables console logs in production
 * Usage: Replace console.log with logger.log, console.error with logger.error, etc.
 */

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args)
  },
  error: (...args: any[]) => {
    if (isDev) console.error(...args)
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args)
  },
  info: (...args: any[]) => {
    if (isDev) console.info(...args)
  },
  debug: (...args: any[]) => {
    if (isDev) console.debug(...args)
  }
}
