export function normalizeUrl(input?: string | null) {
  if (!input) return ''
  try {
    const u = new URL(input, 'http://_')
    const path = decodeURIComponent(u.pathname || '')
    const query = u.search || ''
    const normalized = '/' + path.split('/').filter(Boolean).join('/') + query
    return normalized
  } catch {
    const raw = decodeURIComponent(String(input))
    // Garde les query parameters dans le fallback aussi
    const normalized = '/' + raw.split('/').filter(Boolean).join('/')
    return normalized
  }
}

// Priorité: rawId > hash(profileId + normalizedUrl). PAS d'index.
export function stableMediaId({ rawId, profileId, url }:{ rawId?:string|null; profileId:string; url?:string|null }) {
  if (rawId && String(rawId).trim()) return String(rawId)
  const key = `${profileId}#${normalizeUrl(url)}`
  // Client-safe deterministic hash (no Node crypto)
  const h1 = djb2(key, 5381)
  const h2 = djb2(key, 52711)
  return toHex(h1) + toHex(h2)
}

function djb2(str: string, seed = 5381): number {
  let hash = seed >>> 0
  for (let i = 0; i < str.length; i++) {
    hash = (((hash << 5) + hash) ^ str.charCodeAt(i)) >>> 0
  }
  return hash >>> 0
}

function toHex(n: number): string {
  return (n >>> 0).toString(16).padStart(8, '0')
}