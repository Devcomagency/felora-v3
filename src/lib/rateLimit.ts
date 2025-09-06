type Entry = { count: number; expiresAt: number }
const store = new Map<string, Entry>()

export function rateLimit(key: string, windowMs: number, max: number) {
  const now = Date.now()
  const e = store.get(key)
  if (!e || e.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + windowMs })
    return { ok: true, remaining: max - 1 }
  }
  if (e.count >= max) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((e.expiresAt - now) / 1000) }
  }
  e.count += 1
  return { ok: true, remaining: Math.max(0, max - e.count) }
}

export function getClientIp(req: Request | import('next/server').NextRequest) {
  // Try common headers set by proxies
  const h = (req as any).headers
  const xf = h.get?.('x-forwarded-for') || h.get?.('x-real-ip') || ''
  const ip = String(xf).split(',')[0].trim() || 'anon'
  return ip
}

