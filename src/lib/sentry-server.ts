let inited = false

export function initSentryServerOnce() {
  if (inited) return
  const dsn = process.env.SENTRY_DSN
  if (!dsn) return
  try {
    // dynamic require to avoid hard dependency during local dev
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/node')
    Sentry.init({
      dsn,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
      environment: process.env.NODE_ENV,
    })
    inited = true
  } catch (e) {
    // ignore if module missing
    console.warn('Sentry server init failed (module missing or error):', (e as any)?.message)
  }
}

export function captureServerException(err: unknown) {
  try {
    const dsn = process.env.SENTRY_DSN
    if (!dsn) return
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/node')
    if (Sentry) Sentry.captureException(err)
  } catch {}
}

