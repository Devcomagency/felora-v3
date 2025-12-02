/**
 * Cache utilities for profile data
 * Shared cache storage - This is the SINGLE source of truth for the cache
 */

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Shared club profile cache - used by both API route and reactions sync
 */
export const clubProfileCache = new Map<string, { data: any; expires: number }>()

/**
 * Get cached profile or null if expired/missing
 */
export function getCachedClubProfile(id: string) {
  const cached = clubProfileCache.get(id)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }
  clubProfileCache.delete(id)
  return null
}

/**
 * Cache club profile data
 */
export function setCachedClubProfile(id: string, data: any) {
  clubProfileCache.set(id, {
    data,
    expires: Date.now() + CACHE_TTL
  })

  // Cleanup old entries periodically
  if (clubProfileCache.size > 100) {
    const now = Date.now()
    for (const [key, value] of clubProfileCache.entries()) {
      if (value.expires <= now) {
        clubProfileCache.delete(key)
      }
    }
  }
}

/**
 * Invalidate club profile cache by handle
 */
export function invalidateClubProfileCache(handle: string) {
  console.log(`🗑️ [CACHE] Invalidating club profile cache: ${handle}`)
  const deleted = clubProfileCache.delete(handle)

  if (deleted) {
    console.log(`✅ [CACHE] Successfully invalidated cache for: ${handle}`)
  } else {
    console.log(`ℹ️ [CACHE] No cached entry found for: ${handle}`)
  }

  return deleted
}

/**
 * Clear all club profile cache
 */
export function clearAllClubProfileCache() {
  const count = clubProfileCache.size
  clubProfileCache.clear()
  console.log(`🗑️ [CACHE] Cleared ${count} cached club profiles`)
  return count
}
