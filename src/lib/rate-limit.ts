// Very simple in-memory rate limiter per IP + key
// Not for multi-instance production, but fine for local/dev

type Entry = { count: number; ts: number }
const BUCKET: Record<string, Entry> = (globalThis as any).__felora_rate__ || {}
;(globalThis as any).__felora_rate__ = BUCKET

export function rateLimit({ key, limit, windowMs }: { key: string; limit: number; windowMs: number }) {
  const now = Date.now()
  const e = BUCKET[key]
  if (!e || now - e.ts > windowMs) {
    BUCKET[key] = { count: 1, ts: now }
    return { ok: true, remaining: limit - 1 }
  }
  if (e.count >= limit) {
    return { ok: false, retryAfterMs: windowMs - (now - e.ts) }
  }
  e.count += 1
  return { ok: true, remaining: limit - e.count }
}

export function rateKey(req: Request, scope: string) {
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local').split(',')[0].trim()
  return `${scope}:${ip}`
}

